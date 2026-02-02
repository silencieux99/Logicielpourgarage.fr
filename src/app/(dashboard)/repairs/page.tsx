"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
    Plus,
    Search,
    Wrench,
    Clock,
    AlertTriangle,
    CheckCircle,
    ChevronRight,
    Loader2,
    Car,
    FileText,
    Filter,
    Calendar,
    TrendingUp,
    Euro,
    Play,
    Pause,
    AlertCircle
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"
import {
    getReparations,
    getClients,
    getVehicules,
    getActivePersonnel,
    Reparation,
    Client,
    Vehicule,
    Personnel
} from "@/lib/database"
import { BrandLogo } from "@/components/ui/brand-logo"
import { RepairCard } from "@/components/RepairCard"

interface ReparationWithDetails extends Reparation {
    client?: Client
    vehicule?: Vehicule
}

const statusConfig = {
    brouillon: { label: "Brouillon", color: "bg-zinc-100 text-zinc-600", icon: FileText },
    en_attente: { label: "En attente", color: "bg-amber-100 text-amber-700", icon: Clock },
    en_cours: { label: "En cours", color: "bg-blue-100 text-blue-700", icon: Wrench },
    termine: { label: "Terminé", color: "bg-emerald-100 text-emerald-700", icon: CheckCircle },
    facture: { label: "Facturé", color: "bg-violet-100 text-violet-700", icon: FileText },
}

const prioriteConfig = {
    normal: { label: "Normal", color: "text-zinc-500" },
    prioritaire: { label: "Prioritaire", color: "text-amber-600" },
    urgent: { label: "Urgent", color: "text-red-600" },
}

export default function RepairsPage() {
    const { garage } = useAuth()
    const [repairs, setRepairs] = useState<ReparationWithDetails[]>([])
    const [personnel, setPersonnel] = useState<Personnel[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [filterStatus, setFilterStatus] = useState<"all" | "brouillon" | "en_attente" | "en_cours" | "termine" | "facture">("all")
    const [filterMecanicien, setFilterMecanicien] = useState<string>("all")
    const [sortBy, setSortBy] = useState<"date" | "priority" | "amount">("date")
    const [viewMode, setViewMode] = useState<"list" | "board">("list")

    useEffect(() => {
        if (garage?.id) {
            loadRepairs()
        } else {
            setLoading(false)
        }
    }, [garage?.id])

    const loadRepairs = async () => {
        if (!garage?.id) return

        setLoading(true)
        try {
            const [reparationsData, clientsData, vehiculesData, personnelData] = await Promise.all([
                getReparations(garage.id),
                getClients(garage.id),
                getVehicules(garage.id),
                getActivePersonnel(garage.id)
            ])

            // Enrichir les réparations avec les données clients et véhicules
            const reparationsWithDetails = reparationsData.map(rep => {
                const client = clientsData.find(c => c.id === rep.clientId)
                const vehicule = vehiculesData.find(v => v.id === rep.vehiculeId)
                return { ...rep, client, vehicule }
            })

            setRepairs(reparationsWithDetails)
            setPersonnel(personnelData)
        } catch (error) {
            console.error("Erreur chargement réparations:", error)
        } finally {
            setLoading(false)
        }
    }

    const filteredRepairs = repairs
        .filter(r => {
            const query = searchQuery.toLowerCase()
            const matchesSearch =
                r.description?.toLowerCase().includes(query) ||
                r.numero?.toLowerCase().includes(query) ||
                r.vehicule?.plaque?.toLowerCase().includes(query) ||
                r.vehicule?.marque?.toLowerCase().includes(query) ||
                r.client?.nom?.toLowerCase().includes(query) ||
                r.client?.prenom?.toLowerCase().includes(query)

            const matchesFilter = filterStatus === "all" || r.statut === filterStatus
            const matchesMecanicien = filterMecanicien === "all" || r.mecanicienId === filterMecanicien

            return matchesSearch && matchesFilter && matchesMecanicien
        })
        .sort((a, b) => {
            if (sortBy === "date") {
                return b.dateEntree.toDate().getTime() - a.dateEntree.toDate().getTime()
            } else if (sortBy === "priority") {
                const priorityOrder = { urgent: 0, prioritaire: 1, normal: 2 }
                return priorityOrder[a.priorite] - priorityOrder[b.priorite]
            } else if (sortBy === "amount") {
                return b.montantTTC - a.montantTTC
            }
            return 0
        })

    // Statistiques
    const totalRepairs = repairs.length
    const enAttente = repairs.filter(r => r.statut === 'en_attente').length
    const enCours = repairs.filter(r => r.statut === 'en_cours').length
    const terminees = repairs.filter(r => r.statut === 'termine' || r.statut === 'facture').length
    const urgentes = repairs.filter(r => r.priorite === 'urgent' && r.statut !== 'termine' && r.statut !== 'facture').length
    const caEnCours = repairs
        .filter(r => r.statut === 'en_cours' || r.statut === 'termine')
        .reduce((sum, r) => sum + (r.montantTTC || 0), 0)

    return (
        <div className="space-y-3 sm:space-y-5">
            {/* Header */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-lg sm:text-xl font-semibold text-[var(--text-primary)] tracking-tight">Réparations</h1>
                        <p className="text-[12px] text-[var(--text-tertiary)] mt-0.5">
                            {totalRepairs} réparation{totalRepairs !== 1 ? 's' : ''}
                            {urgentes > 0 && (
                                <span className="ml-2 text-red-500">• {urgentes} urgente{urgentes !== 1 ? 's' : ''}</span>
                            )}
                        </p>
                    </div>
                    <Link
                        href="/repairs/new"
                        className="hidden sm:inline-flex h-9 px-4 bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-white text-[13px] font-medium rounded-lg items-center gap-2 transition-colors"
                    >
                        <Plus className="h-4 w-4" />
                        <span>Nouvelle réparation</span>
                    </Link>
                </div>

                {/* Stats Cards - Desktop */}
                <div className="hidden sm:grid grid-cols-4 gap-2.5">
                    {[
                        { label: "En attente", value: enAttente, icon: Clock },
                        { label: "En cours", value: enCours, icon: Wrench },
                        { label: "Terminées", value: terminees, icon: CheckCircle },
                        { label: "CA en cours", value: `${caEnCours.toLocaleString()} €`, icon: Euro }
                    ].map((stat) => (
                        <div
                            key={stat.label}
                            className="bg-white rounded-xl border border-[var(--border-light)] p-3"
                            style={{ boxShadow: 'var(--shadow-sm)' }}
                        >
                            <div className="flex items-center gap-3">
                                <stat.icon className="h-3.5 w-3.5 text-[var(--text-muted)]" strokeWidth={1.5} />
                                <div>
                                    <p className="text-lg font-semibold text-[var(--text-primary)]">{stat.value}</p>
                                    <p className="text-[10px] text-[var(--text-muted)]">{stat.label}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Mobile Stats */}
                {/* Mobile Stats - Modern Scrollable Cards */}
                <div className="sm:hidden -mx-4 px-4 overflow-x-auto pb-4 scrollbar-hide">
                    <div className="flex gap-3">
                        {[
                            { label: "En attente", value: enAttente, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
                            { label: "En cours", value: enCours, icon: Wrench, color: "text-blue-600", bg: "bg-blue-50" },
                            { label: "Terminées", value: terminees, icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50" },
                            { label: "CA Cours", value: `${(caEnCours / 1000).toFixed(1)}k€`, icon: Euro, color: "text-zinc-600", bg: "bg-zinc-50" },
                        ].map((stat) => (
                            <div key={stat.label} className="min-w-[120px] bg-white p-3 rounded-2xl border border-zinc-100 shadow-sm flex flex-col justify-between h-20">
                                <div className="flex items-start justify-between">
                                    <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider">{stat.label}</span>
                                    <div className={cn("p-1.5 rounded-full", stat.bg, stat.color)}>
                                        <stat.icon className="h-3 w-3" />
                                    </div>
                                </div>
                                <span className="text-xl font-bold text-zinc-900 leading-none mt-1">{stat.value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Search & Filters */}
                {/* Filters & Actions Bar */}
                <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                    {/* Search Bar - Modern & Wide */}
                    <div className="relative w-full lg:max-w-md group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-zinc-400 group-focus-within:text-[var(--accent-primary)] transition-colors" />
                        </div>
                        <input
                            type="text"
                            placeholder="Rechercher une réparation..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2.5 border border-zinc-200 rounded-xl leading-5 bg-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent transition-all shadow-sm hover:shadow-md"
                        />
                        <div className="absolute inset-y-0 right-0 flex py-1.5 pr-1.5">
                            <kbd className="inline-flex items-center border border-zinc-200 rounded px-2 text-xs font-sans font-medium text-zinc-400">
                                ⌘K
                            </kbd>
                        </div>
                    </div>

                    {/* Right Side Actions */}
                    <div className="flex items-center gap-3 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
                        {/* Status Filter - Segmented Control Style */}
                        <div className="p-1 bg-zinc-100/80 rounded-xl flex items-center gap-1">
                            {[
                                { id: "all", label: "Toutes" },
                                { id: "brouillon", label: "Brouillons" },
                                { id: "en_attente", label: "Attente" },
                                { id: "en_cours", label: "En cours" },
                                { id: "termine", label: "Terminées" },
                            ].map(filter => (
                                <button
                                    key={filter.id}
                                    onClick={() => setFilterStatus(filter.id as any)}
                                    className={cn(
                                        "px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap",
                                        filterStatus === filter.id
                                            ? "bg-white text-zinc-900 shadow-sm ring-1 ring-black/5"
                                            : "text-zinc-500 hover:text-zinc-700 hover:bg-zinc-200/50"
                                    )}
                                >
                                    {filter.label}
                                </button>
                            ))}
                        </div>

                        <div className="w-px h-8 bg-zinc-200 mx-1 hidden sm:block" />

                        {/* View Toggles & secondary filters */}
                        <div className="flex items-center gap-2">
                            {/* Mechanic Filter (Desktop) */}
                            {personnel.length > 0 && (
                                <div className="hidden sm:block relative">
                                    <select
                                        value={filterMecanicien}
                                        onChange={(e) => setFilterMecanicien(e.target.value)}
                                        className="appearance-none h-10 pl-3 pr-8 bg-white border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] hover:border-zinc-300 transition-colors"
                                    >
                                        <option value="all">Tous les mécaniciens</option>
                                        {personnel.map(p => (
                                            <option key={p.id} value={p.id}>{p.prenom} {p.nom}</option>
                                        ))}
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-zinc-500">
                                        <ChevronRight className="h-4 w-4 rotate-90" />
                                    </div>
                                </div>
                            )}

                            {/* View Mode Toggle */}
                            <div className="flex bg-zinc-100/80 p-1 rounded-xl">
                                <button
                                    onClick={() => setViewMode("list")}
                                    className={cn(
                                        "p-2 rounded-lg transition-all",
                                        viewMode === "list" ? "bg-white shadow-sm text-zinc-900 ring-1 ring-black/5" : "text-zinc-400 hover:text-zinc-600"
                                    )}
                                >
                                    <Filter className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => setViewMode("board")}
                                    className={cn(
                                        "p-2 rounded-lg transition-all",
                                        viewMode === "board" ? "bg-white shadow-sm text-zinc-900 ring-1 ring-black/5" : "text-zinc-400 hover:text-zinc-600"
                                    )}
                                >
                                    <TrendingUp className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Logic */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-6 w-6 animate-spin text-[var(--text-muted)]" />
                </div>
            ) : !garage?.id ? (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
                    <AlertCircle className="h-8 w-8 text-amber-500 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-amber-900 mb-2">Configuration requise</h3>
                    <p className="text-sm text-amber-700 mb-4">
                        Veuillez d'abord configurer votre garage dans les paramètres.
                    </p>
                    <Link href="/settings" className="inline-flex h-10 px-5 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-xl items-center gap-2 transition-colors">
                        Configurer mon garage
                    </Link>
                </div>
            ) : filteredRepairs.length === 0 ? (
                <div className="bg-white rounded-xl sm:rounded-2xl border border-zinc-200 p-6 sm:p-12 text-center">
                    <div className="w-12 h-12 rounded-xl bg-zinc-100 flex items-center justify-center mx-auto mb-3">
                        <Wrench className="h-6 w-6 text-zinc-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-zinc-900 mb-2">
                        {searchQuery || filterStatus !== "all" ? "Aucun résultat" : "Aucune réparation"}
                    </h3>
                    <p className="text-sm text-zinc-500 mb-4 max-w-md mx-auto">
                        {searchQuery || filterStatus !== "all"
                            ? "Aucune réparation ne correspond à vos critères"
                            : "Commencez par créer votre première réparation"}
                    </p>
                    {!searchQuery && filterStatus === "all" && (
                        <Link
                            href="/repairs/new"
                            className="inline-flex h-10 px-5 bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-white text-sm font-medium rounded-xl items-center gap-2 transition-colors"
                        >
                            <Plus className="h-4 w-4" />
                            Nouvelle réparation
                        </Link>
                    )}
                </div>
            ) : (
                <>
                    {/* List View */}
                    {viewMode === "list" && (
                        <div className="space-y-3">
                            {filteredRepairs.map((repair) => (
                                <RepairCard key={repair.id} repair={repair} />
                            ))}
                        </div>
                    )}

                    {/* Kanban View */}
                    {viewMode === "board" && !loading && garage?.id && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 overflow-x-auto pb-4">
                            {/* Colonne Brouillons */}
                            {filteredRepairs.some(r => r.statut === "brouillon") && (
                                <div className="min-w-[260px] flex flex-col gap-3">
                                    <div className="flex items-center justify-between sticky top-0 bg-zinc-50 z-10 py-1.5">
                                        <div className="flex items-center gap-2">
                                            <div className="p-1.5 bg-zinc-100 rounded-lg">
                                                <FileText className="h-4 w-4 text-zinc-600" />
                                            </div>
                                            <h3 className="font-semibold text-zinc-900">Brouillons</h3>
                                            <span className="bg-zinc-200 text-zinc-700 text-xs px-2 py-0.5 rounded-full">
                                                {filteredRepairs.filter(r => r.statut === "brouillon").length}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2 min-h-[160px]">
                                        {filteredRepairs.filter(r => r.statut === "brouillon").map(repair => (
                                            <RepairCard key={repair.id} repair={repair} />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Colonne En attente */}
                            <div className="min-w-[260px] flex flex-col gap-3">
                                <div className="flex items-center justify-between sticky top-0 bg-zinc-50 z-10 py-1.5">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 bg-amber-100 rounded-lg">
                                            <Clock className="h-4 w-4 text-amber-700" />
                                        </div>
                                        <h3 className="font-semibold text-zinc-900">En attente</h3>
                                        <span className="bg-zinc-200 text-zinc-700 text-xs px-2 py-0.5 rounded-full">
                                            {filteredRepairs.filter(r => r.statut === "en_attente").length}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2 min-h-[160px]">
                                    {filteredRepairs.filter(r => r.statut === "en_attente").map(repair => (
                                        <RepairCard key={repair.id} repair={repair} />
                                    ))}
                                </div>
                            </div>

                            {/* Colonne En cours */}
                            <div className="min-w-[260px] flex flex-col gap-3">
                                <div className="flex items-center justify-between sticky top-0 bg-zinc-50 z-10 py-1.5">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 bg-blue-100 rounded-lg">
                                            <Wrench className="h-4 w-4 text-blue-700" />
                                        </div>
                                        <h3 className="font-semibold text-zinc-900">En cours</h3>
                                        <span className="bg-zinc-200 text-zinc-700 text-xs px-2 py-0.5 rounded-full">
                                            {filteredRepairs.filter(r => r.statut === "en_cours").length}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2 min-h-[160px]">
                                    {filteredRepairs.filter(r => r.statut === "en_cours").map(repair => (
                                        <RepairCard key={repair.id} repair={repair} />
                                    ))}
                                </div>
                            </div>

                            {/* Colonne Terminé */}
                            <div className="min-w-[260px] flex flex-col gap-3">
                                <div className="flex items-center justify-between sticky top-0 bg-zinc-50 z-10 py-1.5">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 bg-emerald-100 rounded-lg">
                                            <CheckCircle className="h-4 w-4 text-emerald-700" />
                                        </div>
                                        <h3 className="font-semibold text-zinc-900">Terminé</h3>
                                        <span className="bg-zinc-200 text-zinc-700 text-xs px-2 py-0.5 rounded-full">
                                            {filteredRepairs.filter(r => ["termine", "facture"].includes(r.statut)).length}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2 min-h-[160px]">
                                    {filteredRepairs.filter(r => ["termine", "facture"].includes(r.statut)).map(repair => (
                                        <RepairCard key={repair.id} repair={repair} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Mobile FAB */}
                    <Link
                        href="/repairs/new"
                        className="md:hidden fixed right-4 fab-bottom w-12 h-12 bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-white rounded-full shadow-lg flex items-center justify-center z-30 active:scale-95 transition-transform"
                    >
                        <Plus className="h-5 w-5" />
                    </Link>
                </>
            )}
        </div>
    )
}
