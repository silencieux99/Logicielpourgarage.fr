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
    getReparations,
    checkClientLimit,
    checkVehiculeLimit,
    type RendezVous
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
    const [todayAppointments, setTodayAppointments] = useState<RendezVous[]>([])
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
            // On récupère TOUTES les données récentes pour avoir une vraie vue d'ensemble
            const [statsData, rdvToday, documents, allReparations, clientLimitData, vehiculeLimitData] = await Promise.all([
                getStats(garage.id),
                getRendezVous(garage.id, new Date()),
                getDocuments(garage.id), // Tous les documents (devis + factures)
                getReparations(garage.id), // Toutes les réparations
                checkClientLimit(garage.id),
                checkVehiculeLimit(garage.id)
            ])

            // Calculer les réparations en cours manuellement
            const reparationsEnCours = allReparations.filter(r => ['en_attente', 'en_cours'].includes(r.statut))

            const today = new Date()
            today.setHours(0, 0, 0, 0)
            const facturesAujourdhui = documents.filter(d => {
                if (d.type !== 'facture' || d.statut !== 'paye' || !d.datePaiement) return false
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

            // Créer une liste unifiée d'activités récentes
            const allActivities = [
                ...allReparations.map(r => ({
                    sortDate: r.createdAt?.toDate ? r.createdAt.toDate() : new Date(0),
                    item: {
                        id: r.id || '',
                        type: 'repair' as const,
                        titre: r.description?.substring(0, 50) || 'Réparation',
                        sousTitre: `#${r.numero}`,
                        date: r.createdAt?.toDate ? r.createdAt.toDate().toLocaleDateString('fr-FR') : '-'
                    }
                })),
                ...documents.map(d => ({
                    sortDate: d.createdAt?.toDate ? d.createdAt.toDate() : new Date(0),
                    item: {
                        id: d.id || '',
                        type: 'invoice' as const,
                        titre: d.type === 'devis' ? `Devis #${d.numero}` : `Facture #${d.numero}`,
                        sousTitre: `${d.montantTTC.toFixed(2)}€ • ${d.statut}`,
                        date: d.createdAt?.toDate ? d.createdAt.toDate().toLocaleDateString('fr-FR') : '-'
                    }
                })),
                ...rdvToday.map(r => ({
                    sortDate: r.createdAt?.toDate ? r.createdAt.toDate() : new Date(0),
                    item: {
                        id: r.id || '',
                        type: 'appointment' as const,
                        titre: r.description || 'Rendez-vous',
                        sousTitre: r.dateHeure?.toDate ? r.dateHeure.toDate().toLocaleString('fr-FR') : '',
                        date: r.createdAt?.toDate ? r.createdAt.toDate().toLocaleDateString('fr-FR') : '-'
                    }
                }))
            ]

            // Trier par date décroissante et prendre les 5 premiers
            const recentActivity = allActivities
                .sort((a, b) => b.sortDate.getTime() - a.sortDate.getTime())
                .slice(0, 5)
                .map(a => a.item)

            setRecentItems(recentActivity)
            setTodayAppointments(rdvToday)
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

            {/* Subscription Banner — Demo */}
            {!isPro && (
                <div className="relative overflow-hidden rounded-2xl" style={{ background: 'linear-gradient(135deg, #18181b 0%, #27272a 50%, #18181b 100%)' }}>
                    {/* Subtle glow */}
                    <div className="absolute top-0 right-0 w-72 h-72 rounded-full opacity-[0.07]" style={{ background: 'radial-gradient(circle, var(--accent-primary), transparent 70%)' }} />

                    <div className="relative p-5 sm:p-6">
                        {/* Top row */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                            <div>
                                <div className="flex items-center gap-2.5 mb-1.5">
                                    <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                                    <span className="text-xs font-semibold uppercase tracking-widest text-zinc-500">Version d'essai</span>
                                </div>
                                <p className="text-base sm:text-lg font-semibold text-white">
                                    Passez au Pro pour un accès illimité
                                </p>
                            </div>
                            <Link
                                href="/upgrade"
                                className="h-10 sm:h-11 px-6 bg-white hover:bg-zinc-100 text-zinc-900 text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-all duration-200 hover:shadow-lg active:scale-[0.97] flex-shrink-0"
                            >
                                <Crown className="h-4 w-4" />
                                Passer au Pro
                            </Link>
                        </div>

                        {/* Usage meters — circular rings */}
                        {clientLimit && vehiculeLimit && (
                            <div className="grid grid-cols-2 gap-3 sm:gap-4">
                                {/* Clients */}
                                <div className="bg-white/[0.06] backdrop-blur-sm rounded-xl p-4 border border-white/[0.06]">
                                    <div className="flex items-center gap-4">
                                        <div className="relative w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0">
                                            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                                                <circle cx="18" cy="18" r="15.5" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
                                                <circle
                                                    cx="18" cy="18" r="15.5" fill="none"
                                                    stroke={clientPercent >= 80 ? '#f59e0b' : '#10b981'}
                                                    strokeWidth="3"
                                                    strokeLinecap="round"
                                                    strokeDasharray={`${clientPercent * 0.9738} 97.38`}
                                                    className="transition-all duration-700"
                                                />
                                            </svg>
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <Users className="h-4 w-4 sm:h-5 sm:w-5 text-zinc-400" strokeWidth={1.5} />
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[22px] sm:text-2xl font-bold text-white tracking-tight">
                                                {clientLimit.current}<span className="text-zinc-600 text-base font-medium">/{clientLimit.limit}</span>
                                            </p>
                                            <p className="text-xs sm:text-sm text-zinc-500">Clients utilisés</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Véhicules */}
                                <div className="bg-white/[0.06] backdrop-blur-sm rounded-xl p-4 border border-white/[0.06]">
                                    <div className="flex items-center gap-4">
                                        <div className="relative w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0">
                                            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                                                <circle cx="18" cy="18" r="15.5" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
                                                <circle
                                                    cx="18" cy="18" r="15.5" fill="none"
                                                    stroke={vehiculePercent >= 80 ? '#f59e0b' : '#10b981'}
                                                    strokeWidth="3"
                                                    strokeLinecap="round"
                                                    strokeDasharray={`${vehiculePercent * 0.9738} 97.38`}
                                                    className="transition-all duration-700"
                                                />
                                            </svg>
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <Car className="h-4 w-4 sm:h-5 sm:w-5 text-zinc-400" strokeWidth={1.5} />
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[22px] sm:text-2xl font-bold text-white tracking-tight">
                                                {vehiculeLimit.current}<span className="text-zinc-600 text-base font-medium">/{vehiculeLimit.limit}</span>
                                            </p>
                                            <p className="text-xs sm:text-sm text-zinc-500">Véhicules utilisés</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Subscription Banner — Pro */}
            {isPro && (
                <div className="relative overflow-hidden rounded-2xl" style={{ background: 'linear-gradient(135deg, #451a03 0%, #78350f 50%, #451a03 100%)' }}>
                    <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #f59e0b, transparent 70%)' }} />
                    <div className="relative px-5 py-4 sm:px-6 sm:py-5 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-amber-500/20">
                            <Crown className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <p className="text-sm sm:text-base font-semibold text-amber-100">Plan Pro actif</p>
                            <p className="text-xs sm:text-sm text-amber-200/60">Accès illimité à toutes les fonctionnalités</p>
                        </div>
                    </div>
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
                    <div className="bg-white rounded-xl" style={{ boxShadow: 'var(--shadow-sm)' }}>
                        <div className="px-4 py-3 flex items-center justify-between">
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
                            <div className="">
                                {recentItems.map((item) => (
                                    <div key={item.id} className="px-4 py-3 hover:bg-[var(--bg-secondary)] transition-colors rounded-lg">
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
                    <div className="bg-white rounded-xl p-4" style={{ boxShadow: 'var(--shadow-sm)' }}>
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-[13px] font-semibold text-[var(--text-primary)]">RDV du jour</h2>
                            <Link href="/schedule" className="text-[12px] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors">
                                Voir agenda
                            </Link>
                        </div>

                        {todayAppointments.length === 0 ? (
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
                        ) : (
                            <div className="space-y-2">
                                {todayAppointments.map((rdv) => (
                                    <div key={rdv.id} className="flex items-center gap-3 p-2 hover:bg-[var(--bg-secondary)] rounded-lg transition-colors">
                                        <div className="w-8 h-8 rounded-lg bg-[var(--bg-tertiary)] flex items-center justify-center flex-shrink-0">
                                            <span className="text-[11px] font-semibold text-[var(--text-secondary)]">
                                                {rdv.dateHeure?.toDate ? rdv.dateHeure.toDate().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                                            </span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[13px] font-medium text-[var(--text-primary)] truncate">{rdv.description || rdv.type || 'Rendez-vous'}</p>
                                            <p className="text-[11px] text-[var(--text-muted)] truncate">{rdv.type}</p>
                                        </div>
                                    </div>
                                ))}
                                <Link
                                    href="/schedule/new"
                                    className="block text-center text-[12px] text-[var(--accent-primary)] font-medium hover:underline mt-3 pt-2"
                                >
                                    Planifier un autre RDV
                                </Link>
                            </div>
                        )}
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
