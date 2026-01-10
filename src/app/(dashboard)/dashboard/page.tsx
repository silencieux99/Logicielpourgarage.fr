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
    AlertTriangle,
    ChevronRight,
    ArrowUpRight,
    Loader2,
    X,
    Package,
    Receipt,
    Crown,
    Zap
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"
import {
    getStats,
    getRendezVous,
    getDocuments,
    getReparationsEnCours
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
    const [recentItems, setRecentItems] = useState<RecentItem[]>([])
    const [lowStockCount, setLowStockCount] = useState(0)
    const [fabOpen, setFabOpen] = useState(false)

    // Rediriger si pas connecté
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

    // Fermer le FAB quand on scroll
    useEffect(() => {
        const handleScroll = () => {
            if (fabOpen) setFabOpen(false)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [fabOpen])

    // Bloquer le scroll quand FAB ouvert
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
            // Fetch stats from Firebase
            const [statsData, rdvToday, documents, reparationsEnCours] = await Promise.all([
                getStats(garage.id),
                getRendezVous(garage.id, new Date()), // Today's appointments
                getDocuments(garage.id, 'facture'),   // All invoices
                getReparationsEnCours(garage.id)      // In-progress repairs
            ])

            // Calculate today's revenue (CA Jour)
            const today = new Date()
            today.setHours(0, 0, 0, 0)
            const facturesAujourdhui = documents.filter(d => {
                if (d.statut !== 'paye' || !d.datePaiement) return false
                // Handle Firestore Timestamp or Date
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
                caJourChange: 0 // TODO: Calculer le changement vs hier si besoin
            })

            // Build recent items from latest repairs
            const recentRepairs: RecentItem[] = reparationsEnCours.slice(0, 5).map(r => ({
                id: r.id || '',
                type: 'repair' as const,
                titre: r.description?.substring(0, 50) || 'Réparation',
                sousTitre: `#${r.numero}`,
                date: r.dateEntree?.toDate ? r.dateEntree.toDate().toLocaleDateString('fr-FR') : '-'
            }))

            setRecentItems(recentRepairs)
            setLowStockCount(0) // TODO: Implémenter getLowStockArticles dans database.ts

        } catch (error) {
            console.error("Erreur chargement dashboard:", error)
        } finally {
            setLoading(false)
        }
    }

    const quickActions = [
        { icon: Users, label: "Client", href: "/clients/new", color: "bg-blue-100 text-blue-600" },
        { icon: Car, label: "Véhicule", href: "/vehicles/new", color: "bg-emerald-100 text-emerald-600" },
        { icon: Wrench, label: "Réparation", href: "/repairs/new", color: "bg-amber-100 text-amber-600" },
        { icon: FileText, label: "Devis", href: "/invoices/new?type=devis", color: "bg-violet-100 text-violet-600" },
        { icon: Calendar, label: "RDV", href: "/schedule/new", color: "bg-cyan-100 text-cyan-600" },
    ]

    // Actions pour le FAB mobile (grille 4x2)
    const fabActions = [
        { icon: Users, shortLabel: "Client", href: "/clients/new", color: "bg-blue-500" },
        { icon: Car, shortLabel: "Véhicule", href: "/vehicles/new", color: "bg-emerald-500" },
        { icon: Wrench, shortLabel: "Réparation", href: "/repairs/new", color: "bg-amber-500" },
        { icon: FileText, shortLabel: "Devis", href: "/invoices/new?type=devis", color: "bg-violet-500" },
        { icon: Receipt, shortLabel: "Facture", href: "/invoices/new?type=facture", color: "bg-rose-500" },
        { icon: Calendar, shortLabel: "RDV", href: "/schedule/new", color: "bg-cyan-500" },
        { icon: Package, shortLabel: "Stock", href: "/inventory/new", color: "bg-orange-500" },
    ]

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-zinc-900">
                        Bonjour ! 👋
                    </h1>
                    <p className="text-sm text-zinc-500 mt-1">
                        Voici un aperçu de votre activité
                    </p>
                </div>
                <Link
                    href="/repairs/new"
                    className="hidden sm:flex h-10 sm:h-11 px-4 sm:px-5 bg-zinc-900 hover:bg-zinc-800 text-white text-sm font-medium rounded-xl items-center gap-2 transition-colors"
                >
                    <Plus className="h-4 w-4" />
                    <span>Nouvelle réparation</span>
                </Link>
            </div>

            {/* Subscription Banner - Demo Plan */}
            {garage?.plan !== 'pro' && (
                <div className="bg-zinc-900 rounded-xl sm:rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center flex-shrink-0">
                            <Zap className="h-5 w-5 text-zinc-400" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-white">
                                Plan Démo • 5 clients, 5 véhicules
                            </p>
                            <p className="text-xs text-zinc-400 mt-0.5">
                                Passez au Pro pour un accès illimité
                            </p>
                        </div>
                    </div>
                    <Link
                        href="/upgrade"
                        className="flex-shrink-0 h-9 px-4 bg-white hover:bg-zinc-100 text-zinc-900 text-sm font-medium rounded-lg flex items-center gap-2 transition-colors"
                    >
                        <span>Passer au Pro</span>
                        <ChevronRight className="h-4 w-4" />
                    </Link>
                </div>
            )}

            {/* Pro Plan Success Banner */}
            {garage?.plan === 'pro' && garage?.subscriptionStatus === 'active' && (
                <div className="bg-zinc-900 rounded-xl sm:rounded-2xl p-4 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center">
                        <Crown className="h-4 w-4 text-white" />
                    </div>
                    <p className="text-sm font-medium text-white">
                        Plan Pro actif — Accès illimité
                    </p>
                </div>
            )}

            {/* Quick Actions - Mobile */}
            <div className="sm:hidden">
                <div className="flex gap-3 overflow-x-auto pb-2 scroll-hide -mx-4 px-4">
                    {quickActions.map((action) => (
                        <Link
                            key={action.label}
                            href={action.href}
                            className="flex flex-col items-center gap-2 min-w-[72px]"
                        >
                            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center", action.color)}>
                                <action.icon className="h-6 w-6" />
                            </div>
                            <span className="text-xs font-medium text-zinc-600">{action.label}</span>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-white rounded-xl sm:rounded-2xl border border-zinc-200 p-4 sm:p-5">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                            <Users className="h-5 w-5 text-blue-600" />
                        </div>
                    </div>
                    <p className="text-2xl sm:text-3xl font-bold text-zinc-900">{stats?.clientsTotal || 0}</p>
                    <p className="text-sm text-zinc-500">Clients</p>
                </div>

                <div className="bg-white rounded-xl sm:rounded-2xl border border-zinc-200 p-4 sm:p-5">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                            <Car className="h-5 w-5 text-emerald-600" />
                        </div>
                    </div>
                    <p className="text-2xl sm:text-3xl font-bold text-zinc-900">{stats?.vehiculesTotal || 0}</p>
                    <p className="text-sm text-zinc-500">Véhicules</p>
                </div>

                <div className="bg-white rounded-xl sm:rounded-2xl border border-zinc-200 p-4 sm:p-5">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                            <Wrench className="h-5 w-5 text-amber-600" />
                        </div>
                    </div>
                    <p className="text-2xl sm:text-3xl font-bold text-zinc-900">{stats?.reparationsEnCours || 0}</p>
                    <p className="text-sm text-zinc-500">En cours</p>
                </div>

                <div className="bg-white rounded-xl sm:rounded-2xl border border-zinc-200 p-4 sm:p-5">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
                            <Calendar className="h-5 w-5 text-violet-600" />
                        </div>
                    </div>
                    <p className="text-2xl sm:text-3xl font-bold text-zinc-900">{stats?.rdvAujourdhui || 0}</p>
                    <p className="text-sm text-zinc-500">RDV aujourd'hui</p>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
                {/* Left Column - 2/3 width */}
                <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                    {/* Recent Activity */}
                    <div className="bg-white rounded-xl sm:rounded-2xl border border-zinc-200">
                        <div className="p-4 sm:p-5 border-b border-zinc-100 flex items-center justify-between">
                            <h2 className="text-[15px] sm:text-base font-semibold text-zinc-900">
                                Activité récente
                            </h2>
                            <Link href="/repairs" className="text-sm text-zinc-500 hover:text-zinc-900 flex items-center gap-1">
                                Tout voir
                                <ChevronRight className="h-4 w-4" />
                            </Link>
                        </div>

                        {recentItems.length === 0 ? (
                            <div className="p-8 text-center">
                                <Clock className="h-8 w-8 text-zinc-300 mx-auto mb-2" />
                                <p className="text-sm text-zinc-500">Aucune activité récente</p>
                                <p className="text-xs text-zinc-400 mt-1">
                                    Commencez par créer un client ou une réparation
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y divide-zinc-100">
                                {recentItems.map((item) => (
                                    <div key={item.id} className="p-4 sm:p-5 hover:bg-zinc-50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                                                item.type === "repair" ? "bg-amber-100" :
                                                    item.type === "invoice" ? "bg-emerald-100" : "bg-blue-100"
                                            )}>
                                                {item.type === "repair" ? (
                                                    <Wrench className="h-5 w-5 text-amber-600" />
                                                ) : item.type === "invoice" ? (
                                                    <FileText className="h-5 w-5 text-emerald-600" />
                                                ) : (
                                                    <Calendar className="h-5 w-5 text-blue-600" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-zinc-900 truncate">{item.titre}</p>
                                                {item.sousTitre && (
                                                    <p className="text-xs text-zinc-500 truncate">{item.sousTitre}</p>
                                                )}
                                            </div>
                                            <span className="text-xs text-zinc-400 flex-shrink-0">{item.date}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Quick Actions - Desktop */}
                    <div className="hidden sm:block">
                        <h2 className="text-[15px] font-semibold text-zinc-900 mb-3">Actions rapides</h2>
                        <div className="grid grid-cols-5 gap-3">
                            {quickActions.map((action) => (
                                <Link
                                    key={action.label}
                                    href={action.href}
                                    className="bg-white rounded-xl border border-zinc-200 p-4 hover:border-zinc-300 transition-colors text-center"
                                >
                                    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-2", action.color)}>
                                        <action.icon className="h-6 w-6" />
                                    </div>
                                    <span className="text-sm font-medium text-zinc-700">{action.label}</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column - 1/3 width */}
                <div className="space-y-4 sm:space-y-6">
                    {/* CA Today */}
                    <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-xl sm:rounded-2xl p-5 text-white">
                        <div className="flex items-center gap-2 mb-3">
                            <TrendingUp className="h-5 w-5 text-zinc-400" />
                            <span className="text-sm text-zinc-400">Aujourd'hui</span>
                        </div>
                        <p className="text-3xl font-bold mb-1">{(stats?.caJour || 0).toLocaleString()} €</p>
                        {stats?.caJourChange !== undefined && (
                            <p className={cn(
                                "text-sm flex items-center gap-1",
                                stats.caJourChange >= 0 ? "text-emerald-400" : "text-red-400"
                            )}>
                                <ArrowUpRight className="h-4 w-4" />
                                {stats.caJourChange >= 0 ? "+" : ""}{stats.caJourChange}% vs hier
                            </p>
                        )}
                    </div>

                    {/* Alerts */}
                    {lowStockCount > 0 && (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-amber-900">Stock bas</p>
                                    <p className="text-xs text-amber-700">{lowStockCount} article(s)</p>
                                </div>
                                <Link href="/inventory?lowStock=true" className="text-amber-700 hover:text-amber-900">
                                    <ChevronRight className="h-5 w-5" />
                                </Link>
                            </div>
                        </div>
                    )}

                    {/* RDV Today */}
                    <div className="bg-white rounded-xl sm:rounded-2xl border border-zinc-200 p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-[15px] font-semibold text-zinc-900">RDV du jour</h2>
                            <Link href="/schedule" className="text-sm text-zinc-500 hover:text-zinc-900">
                                Voir agenda
                            </Link>
                        </div>

                        <div className="text-center py-4">
                            <Calendar className="h-8 w-8 text-zinc-300 mx-auto mb-2" />
                            <p className="text-sm text-zinc-500">Aucun rendez-vous</p>
                            <Link
                                href="/schedule/new"
                                className="text-sm text-zinc-900 font-medium hover:underline mt-1 inline-block"
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
                    {/* Overlay */}
                    <div
                        className="sm:hidden fixed inset-0 bg-black/40 z-40"
                        onClick={() => setFabOpen(false)}
                    />

                    {/* Bottom Sheet */}
                    <div className="sm:hidden fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl shadow-2xl animate-in slide-in-from-bottom duration-300">
                        {/* Handle */}
                        <div className="flex justify-center pt-3 pb-2">
                            <div className="w-10 h-1 bg-zinc-200 rounded-full" />
                        </div>

                        {/* Header */}
                        <div className="px-5 pb-4 border-b border-zinc-100">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-zinc-900">Créer</h3>
                                <button
                                    onClick={() => setFabOpen(false)}
                                    className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center"
                                >
                                    <X className="h-4 w-4 text-zinc-500" />
                                </button>
                            </div>
                        </div>

                        {/* Grid d'actions */}
                        <div className="grid grid-cols-4 gap-1 p-4 pb-8">
                            {fabActions.map((action) => (
                                <Link
                                    key={action.shortLabel}
                                    href={action.href}
                                    onClick={() => setFabOpen(false)}
                                    className="flex flex-col items-center gap-2 py-3 rounded-xl active:bg-zinc-50"
                                >
                                    <div className={cn(
                                        "w-14 h-14 rounded-2xl flex items-center justify-center",
                                        action.color
                                    )}>
                                        <action.icon className="h-6 w-6 text-white" />
                                    </div>
                                    <span className="text-xs font-medium text-zinc-700 text-center leading-tight">
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
                className="sm:hidden fixed right-4 bottom-20 w-14 h-14 bg-zinc-900 text-white rounded-full shadow-lg flex items-center justify-center z-30 active:scale-95 transition-transform"
            >
                <Plus className="h-6 w-6" />
            </button>
        </div>
    )
}
