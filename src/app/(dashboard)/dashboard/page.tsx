"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
    Plus,
    Car,
    Users,
    Wrench,
    Calendar,
    FileText,
    Clock,
    TrendingUp,
    ChevronRight,
    ArrowUpRight,
    Loader2,
    X,
    Package,
    Receipt,
    Crown
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"
import {
    getStats,
    getRendezVous,
    getDocuments,
    getReparationsEnCours,
    checkClientLimit,
    checkVehiculeLimit
} from "@/lib/database"

interface DashboardStats {
    clientsTotal: number
    vehiculesTotal: number
    reparationsEnCours: number
    rdvAujourdhui: number
    caJour: number
    caJourChange: number
}

interface RecentItem {
    id: string
    type: "repair" | "invoice" | "appointment"
    titre: string
    sousTitre?: string
    date: string
}

export default function DashboardPage() {
    const router = useRouter()
    const { user, garage, loading: authLoading } = useAuth()
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState<DashboardStats | null>(null)
    const [clientLimit, setClientLimit] = useState<{ allowed: boolean; current: number; limit: number; isPro: boolean } | null>(null)
    const [vehiculeLimit, setVehiculeLimit] = useState<{ allowed: boolean; current: number; limit: number; isPro: boolean } | null>(null)
    const [recentItems, setRecentItems] = useState<RecentItem[]>([])
    const [fabOpen, setFabOpen] = useState(false)

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login')
        }
    }, [user, authLoading, router])

    useEffect(() => {
        if (garage?.id) {
            loadDashboard()
        }
    }, [garage?.id])

    useEffect(() => {
        const handleScroll = () => {
            if (fabOpen) setFabOpen(false)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [fabOpen])

    useEffect(() => {
        if (fabOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
        return () => {
            document.body.style.overflow = ''
        }
    }, [fabOpen])

    const loadDashboard = async () => {
        if (!garage?.id) return
        setLoading(true)
        try {
            const [statsData, rdvToday, documents, reparationsEnCours, clientLimitData, vehiculeLimitData] = await Promise.all([
                getStats(garage.id),
                getRendezVous(garage.id, new Date()),
                getDocuments(garage.id, 'facture'),
                getReparationsEnCours(garage.id),
                checkClientLimit(garage.id),
                checkVehiculeLimit(garage.id)
            ])

            const today = new Date()
            today.setHours(0, 0, 0, 0)
            const facturesAujourdhui = documents.filter(d => {
                if (d.statut !== 'paye' || !d.datePaiement) return false
                const paidDate = d.datePaiement.toDate ? d.datePaiement.toDate() : new Date(d.datePaiement as unknown as string)
                paidDate.setHours(0, 0, 0, 0)
                return paidDate.getTime() === today.getTime()
            })
            const caJour = facturesAujourdhui.reduce((sum, f) => sum + f.montantTTC, 0)

            setStats({
                clientsTotal: statsData.totalClients,
                vehiculesTotal: statsData.totalVehicules,
                reparationsEnCours: reparationsEnCours.length,
                rdvAujourdhui: rdvToday.length,
                caJour: caJour,
                caJourChange: 0
            })

            const recentRepairs: RecentItem[] = reparationsEnCours.slice(0, 5).map(r => ({
                id: r.id || '',
                type: 'repair' as const,
                titre: r.description?.substring(0, 50) || 'Réparation',
                sousTitre: `#${r.numero}`,
                date: r.dateEntree?.toDate ? r.dateEntree.toDate().toLocaleDateString('fr-FR') : '-'
            }))

            setRecentItems(recentRepairs)
            setClientLimit(clientLimitData)
            setVehiculeLimit(vehiculeLimitData)

        } catch (error) {
            console.error("Erreur chargement dashboard:", error)
        } finally {
            setLoading(false)
        }
    }

    const quickActions = [
        { icon: Users, label: "Client", href: "/clients/new" },
        { icon: Car, label: "Véhicule", href: "/vehicles/new" },
        { icon: Wrench, label: "Réparation", href: "/repairs/new" },
        { icon: FileText, label: "Devis", href: "/invoices/new?type=devis" },
        { icon: Calendar, label: "RDV", href: "/schedule/new" },
    ]

    const fabActions = [
        { icon: Users, shortLabel: "Client", href: "/clients/new" },
        { icon: Car, shortLabel: "Véhicule", href: "/vehicles/new" },
        { icon: Wrench, shortLabel: "Réparation", href: "/repairs/new" },
        { icon: FileText, shortLabel: "Devis", href: "/invoices/new?type=devis" },
        { icon: Receipt, shortLabel: "Facture", href: "/invoices/new?type=facture" },
        { icon: Calendar, shortLabel: "RDV", href: "/schedule/new" },
        { icon: Package, shortLabel: "Stock", href: "/inventory/new" },
    ]

    const isPro = garage?.plan === 'pro' && garage?.subscriptionStatus === 'active'
    const clientRemaining = clientLimit ? Math.max(0, clientLimit.limit - clientLimit.current) : 0
    const vehiculeRemaining = vehiculeLimit ? Math.max(0, vehiculeLimit.limit - vehiculeLimit.current) : 0
    const clientPercent = clientLimit ? Math.min(100, Math.round((clientLimit.current / clientLimit.limit) * 100)) : 0
    const vehiculePercent = vehiculeLimit ? Math.min(100, Math.round((vehiculeLimit.current / vehiculeLimit.limit) * 100)) : 0

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-6 w-6 animate-spin text-[var(--text-muted)]" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-semibold text-[var(--text-primary)] tracking-tight">
                        Tableau de bord
                    </h1>
                    <p className="text-sm text-[var(--text-tertiary)] mt-0.5">
                        {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </p>
                </div>
                <Link
                    href="/repairs/new"
                    className="hidden sm:inline-flex h-9 px-4 bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-white text-[13px] font-medium rounded-lg items-center gap-2 transition-colors"
                >
                    <Plus className="h-4 w-4" strokeWidth={2} />
                    <span>Nouvelle réparation</span>
                </Link>
            </div>

            {/* Subscription Banner */}
            {!isPro && (
                <div className="bg-white rounded-2xl border border-[var(--border-light)] p-4 sm:p-5" style={{ boxShadow: 'var(--shadow-sm)' }}>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[var(--accent-soft)] flex items-center justify-center flex-shrink-0">
                                <TrendingUp className="h-5 w-5 text-[var(--accent-primary)]" />
                            </div>
                            <div>
                                <p className="text-[14px] font-semibold text-[var(--text-primary)]">Plan Démo</p>
                                <p className="text-[12px] text-[var(--text-tertiary)]">
                                    5 clients et 5 véhicules • Passez au Pro pour un accès illimité
                                </p>
                            </div>
                        </div>
                        <Link
                            href="/upgrade"
                            className="h-9 px-4 bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-white text-[13px] font-medium rounded-lg flex items-center gap-1.5 transition-colors"
                        >
                            <span>Passer au Pro</span>
                            <ChevronRight className="h-3.5 w-3.5" />
                        </Link>
                    </div>

                    {clientLimit && vehiculeLimit && (
                        <div className="mt-4 grid sm:grid-cols-2 gap-3">
                            <div className="rounded-xl border border-[var(--border-light)] bg-[var(--bg-secondary)] p-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-[12px] text-[var(--text-tertiary)]">Clients restants</span>
                                    <span className="text-[12px] font-medium text-[var(--text-primary)]">{clientRemaining}/{clientLimit.limit}</span>
                                </div>
                                <div className="mt-2 h-2 rounded-full bg-white border border-[var(--border-light)] overflow-hidden">
                                    <div
                                        className="h-full bg-[var(--accent-primary)]"
                                        style={{ width: `${clientPercent}%` }}
                                    />
                                </div>
                                <p className="mt-1 text-[11px] text-[var(--text-tertiary)]">
                                    Utilisés: {clientLimit.current}/{clientLimit.limit}
                                </p>
                            </div>

                            <div className="rounded-xl border border-[var(--border-light)] bg-[var(--bg-secondary)] p-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-[12px] text-[var(--text-tertiary)]">Véhicules restants</span>
                                    <span className="text-[12px] font-medium text-[var(--text-primary)]">{vehiculeRemaining}/{vehiculeLimit.limit}</span>
                                </div>
                                <div className="mt-2 h-2 rounded-full bg-white border border-[var(--border-light)] overflow-hidden">
                                    <div
                                        className="h-full bg-[var(--accent-primary)]"
                                        style={{ width: `${vehiculePercent}%` }}
                                    />
                                </div>
                                <p className="mt-1 text-[11px] text-[var(--text-tertiary)]">
                                    Utilisés: {vehiculeLimit.current}/{vehiculeLimit.limit}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {isPro && (
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100/50 rounded-xl p-4 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                        <Crown className="h-4 w-4 text-white" />
                    </div>
                    <p className="text-[13px] font-medium text-amber-900">
                        Plan Pro actif — Accès illimité
                    </p>
                </div>
            )}


            {/* Quick Actions - Mobile */}
            <div className="sm:hidden">
                <div className="flex gap-2 overflow-x-auto pb-1 scroll-hide -mx-3 px-3">
                    {quickActions.map((action) => (
                        <Link
                            key={action.label}
                            href={action.href}
                            className="flex flex-col items-center gap-1.5 min-w-[64px]"
                        >
                            <div className="w-12 h-12 rounded-xl bg-white border border-[var(--border-default)] flex items-center justify-center hover:border-[var(--border-strong)] transition-colors" style={{ boxShadow: 'var(--shadow-sm)' }}>
                                <action.icon className="h-5 w-5 text-[var(--text-secondary)]" strokeWidth={1.5} />
                            </div>
                            <span className="text-[11px] font-medium text-[var(--text-tertiary)]">{action.label}</span>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                    { label: "Clients", value: stats?.clientsTotal || 0, icon: Users },
                    { label: "Véhicules", value: stats?.vehiculesTotal || 0, icon: Car },
                    { label: "En cours", value: stats?.reparationsEnCours || 0, icon: Wrench },
                    { label: "RDV aujourd'hui", value: stats?.rdvAujourdhui || 0, icon: Calendar },
                ].map((stat) => (
                    <div
                        key={stat.label}
                        className="bg-white rounded-xl border border-[var(--border-light)] p-4 hover:border-[var(--border-default)] transition-all group"
                        style={{ boxShadow: 'var(--shadow-sm)' }}
                    >
                        <div className="flex items-center justify-between mb-3">
                            <stat.icon className="h-4 w-4 text-[var(--text-muted)] group-hover:text-[var(--text-tertiary)] transition-colors" strokeWidth={1.5} />
                        </div>
                        <p className="text-2xl font-semibold text-[var(--text-primary)] tracking-tight">{stat.value}</p>
                        <p className="text-[12px] text-[var(--text-muted)] mt-0.5">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid lg:grid-cols-3 gap-4">
                {/* Left Column - 2/3 width */}
                <div className="lg:col-span-2 space-y-4">
                    {/* Recent Activity */}
                    <div className="bg-white rounded-xl border border-[var(--border-light)]" style={{ boxShadow: 'var(--shadow-sm)' }}>
                        <div className="px-4 py-3 border-b border-[var(--border-light)] flex items-center justify-between">
                            <h2 className="text-[14px] font-semibold text-[var(--text-primary)]">
                                Activité récente
                            </h2>
                            <Link href="/repairs" className="text-[12px] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] flex items-center gap-0.5 transition-colors">
                                Tout voir
                                <ChevronRight className="h-3.5 w-3.5" />
                            </Link>
                        </div>

                        {recentItems.length === 0 ? (
                            <div className="p-8 text-center">
                                <div className="w-10 h-10 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center mx-auto mb-3">
                                    <Clock className="h-5 w-5 text-[var(--text-muted)]" strokeWidth={1.5} />
                                </div>
                                <p className="text-[13px] text-[var(--text-secondary)]">Aucune activité récente</p>
                                <p className="text-[12px] text-[var(--text-muted)] mt-1">
                                    Créez un client ou une réparation pour commencer
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y divide-[var(--border-light)]">
                                {recentItems.map((item) => (
                                    <div key={item.id} className="px-4 py-3 hover:bg-[var(--bg-secondary)] transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-[var(--bg-tertiary)] flex items-center justify-center flex-shrink-0">
                                                {item.type === "repair" ? (
                                                    <Wrench className="h-4 w-4 text-[var(--text-muted)]" strokeWidth={1.5} />
                                                ) : item.type === "invoice" ? (
                                                    <FileText className="h-4 w-4 text-[var(--text-muted)]" strokeWidth={1.5} />
                                                ) : (
                                                    <Calendar className="h-4 w-4 text-[var(--text-muted)]" strokeWidth={1.5} />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[13px] font-medium text-[var(--text-primary)] truncate">{item.titre}</p>
                                                {item.sousTitre && (
                                                    <p className="text-[12px] text-[var(--text-muted)] truncate">{item.sousTitre}</p>
                                                )}
                                            </div>
                                            <span className="text-[11px] text-[var(--text-muted)] flex-shrink-0">{item.date}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Quick Actions - Desktop */}
                    <div className="hidden sm:block">
                        <h2 className="text-[13px] font-medium text-[var(--text-secondary)] mb-2.5">Actions rapides</h2>
                        <div className="grid grid-cols-5 gap-2">
                            {quickActions.map((action) => (
                                <Link
                                    key={action.label}
                                    href={action.href}
                                    className="bg-white rounded-xl border border-[var(--border-light)] p-3 hover:border-[var(--border-default)] hover:bg-[var(--bg-secondary)] transition-all text-center group"
                                    style={{ boxShadow: 'var(--shadow-xs)' }}
                                >
                                    <div className="w-10 h-10 rounded-lg bg-[var(--bg-tertiary)] group-hover:bg-[var(--border-default)] flex items-center justify-center mx-auto mb-2 transition-colors">
                                        <action.icon className="h-5 w-5 text-[var(--text-secondary)]" strokeWidth={1.5} />
                                    </div>
                                    <span className="text-[12px] font-medium text-[var(--text-secondary)]">{action.label}</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column - 1/3 width */}
                <div className="space-y-4">
                    {/* CA Today */}
                    <div className="bg-[var(--accent-primary)] rounded-xl p-4 text-white">
                        <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="h-4 w-4 text-white/50" strokeWidth={1.5} />
                            <span className="text-[12px] text-white/50 font-medium">Aujourd'hui</span>
                        </div>
                        <p className="text-2xl font-semibold tracking-tight">{(stats?.caJour || 0).toLocaleString('fr-FR')} €</p>
                        {stats?.caJourChange !== undefined && stats.caJourChange !== 0 && (
                            <p className={cn(
                                "text-[12px] flex items-center gap-0.5 mt-1",
                                stats.caJourChange >= 0 ? "text-emerald-300" : "text-red-300"
                            )}>
                                <ArrowUpRight className="h-3 w-3" />
                                {stats.caJourChange >= 0 ? "+" : ""}{stats.caJourChange}% vs hier
                            </p>
                        )}
                    </div>

                    {/* RDV Today */}
                    <div className="bg-white rounded-xl border border-[var(--border-light)] p-4" style={{ boxShadow: 'var(--shadow-sm)' }}>
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-[13px] font-semibold text-[var(--text-primary)]">RDV du jour</h2>
                            <Link href="/schedule" className="text-[12px] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors">
                                Voir agenda
                            </Link>
                        </div>

                        <div className="text-center py-4">
                            <div className="w-10 h-10 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center mx-auto mb-2">
                                <Calendar className="h-5 w-5 text-[var(--text-muted)]" strokeWidth={1.5} />
                            </div>
                            <p className="text-[13px] text-[var(--text-secondary)]">Aucun rendez-vous</p>
                            <Link
                                href="/schedule/new"
                                className="text-[12px] text-[var(--accent-primary)] font-medium hover:underline mt-1 inline-block"
                            >
                                Planifier un RDV
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile FAB - Bottom Sheet */}
            {fabOpen && (
                <>
                    <div
                        className="sm:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
                        onClick={() => setFabOpen(false)}
                    />
                    <div className="sm:hidden fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-2xl animate-slide-in-bottom safe-area-bottom" style={{ boxShadow: 'var(--shadow-xl)' }}>
                        <div className="flex justify-center pt-3 pb-1">
                            <div className="w-9 h-1 bg-[var(--border-default)] rounded-full" />
                        </div>
                        <div className="px-4 py-3 border-b border-[var(--border-light)] flex items-center justify-between">
                            <h3 className="text-[15px] font-semibold text-[var(--text-primary)]">Créer</h3>
                            <button
                                onClick={() => setFabOpen(false)}
                                className="w-8 h-8 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center"
                            >
                                <X className="h-4 w-4 text-[var(--text-secondary)]" />
                            </button>
                        </div>
                        <div className="grid grid-cols-4 gap-1 p-4 pb-6">
                            {fabActions.map((action) => (
                                <Link
                                    key={action.shortLabel}
                                    href={action.href}
                                    onClick={() => setFabOpen(false)}
                                    className="flex flex-col items-center gap-2 py-3 rounded-xl active:bg-[var(--bg-tertiary)]"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-[var(--accent-primary)] flex items-center justify-center">
                                        <action.icon className="h-5 w-5 text-white" strokeWidth={1.5} />
                                    </div>
                                    <span className="text-[11px] font-medium text-[var(--text-secondary)] text-center">
                                        {action.shortLabel}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </>
            )}

            {/* Mobile FAB Button */}
            <button
                onClick={() => setFabOpen(true)}
                className="sm:hidden fixed right-4 fab-bottom w-12 h-12 bg-[var(--accent-primary)] text-white rounded-full flex items-center justify-center z-30 active:scale-95 transition-transform"
                style={{ boxShadow: 'var(--shadow-lg)' }}
            >
                <Plus className="h-5 w-5" strokeWidth={2} />
            </button>
        </div>
    )
}
