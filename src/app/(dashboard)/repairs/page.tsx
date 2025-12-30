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
    Reparation,
    Client,
    Vehicule
} from "@/lib/database"
import { BrandLogo } from "@/components/ui/brand-logo"

interface ReparationWithDetails extends Reparation {
    client?: Client
    vehicule?: Vehicule
}

const statusConfig = {
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
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [filterStatus, setFilterStatus] = useState<"all" | "en_attente" | "en_cours" | "termine" | "facture">("all")
    const [sortBy, setSortBy] = useState<"date" | "priority" | "amount">("date")

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
            const [reparationsData, clientsData, vehiculesData] = await Promise.all([
                getReparations(garage.id),
                getClients(garage.id),
                getVehicules(garage.id)
            ])

            // Enrichir les réparations avec les données clients et véhicules
            const reparationsWithDetails = reparationsData.map(rep => {
                const client = clientsData.find(c => c.id === rep.clientId)
                const vehicule = vehiculesData.find(v => v.id === rep.vehiculeId)
                return { ...rep, client, vehicule }
            })

            setRepairs(reparationsWithDetails)
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

            return matchesSearch && matchesFilter
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
        <div className="space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-zinc-900">Réparations</h1>
                        <p className="text-sm text-zinc-500 mt-1">
                            {totalRepairs} réparation{totalRepairs !== 1 ? 's' : ''}
                            {urgentes > 0 && (
                                <span className="ml-2 text-red-600">• {urgentes} urgente{urgentes !== 1 ? 's' : ''}</span>
                            )}
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

                {/* Stats Cards - Desktop */}
                <div className="hidden sm:grid grid-cols-4 gap-4">
                    <div className="bg-white rounded-xl border border-zinc-200 p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                                <Clock className="h-5 w-5 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-zinc-900">{enAttente}</p>
                                <p className="text-xs text-zinc-500">En attente</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl border border-zinc-200 p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                                <Wrench className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-zinc-900">{enCours}</p>
                                <p className="text-xs text-zinc-500">En cours</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl border border-zinc-200 p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                                <CheckCircle className="h-5 w-5 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-zinc-900">{terminees}</p>
                                <p className="text-xs text-zinc-500">Terminées</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl border border-zinc-200 p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
                                <Euro className="h-5 w-5 text-violet-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-zinc-900">{caEnCours.toLocaleString()} €</p>
                                <p className="text-xs text-zinc-500">CA en cours</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mobile Stats */}
                <div className="sm:hidden flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
                    {[
                        { label: "Attente", value: enAttente, color: "bg-amber-100 text-amber-700" },
                        { label: "En cours", value: enCours, color: "bg-blue-100 text-blue-700" },
                        { label: "Terminées", value: terminees, color: "bg-emerald-100 text-emerald-700" },
                    ].map(stat => (
                        <div key={stat.label} className={cn("px-4 py-2 rounded-xl flex items-center gap-2 whitespace-nowrap", stat.color)}>
                            <span className="text-lg font-bold">{stat.value}</span>
                            <span className="text-sm">{stat.label}</span>
                        </div>
                    ))}
                </div>

                {/* Search & Filters */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                        <input
                            type="text"
                            placeholder="Rechercher par plaque, client, description..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-10 sm:h-11 pl-10 pr-4 bg-white border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
                        />
                    </div>
                    <div className="flex gap-2">
                        <div className="flex gap-1 p-1 bg-zinc-100 rounded-xl overflow-x-auto">
                            {[
                                { id: "all", label: "Toutes" },
                                { id: "en_attente", label: "Attente" },
                                { id: "en_cours", label: "En cours" },
                                { id: "termine", label: "Terminées" },
                            ].map(filter => (
                                <button
                                    key={filter.id}
                                    onClick={() => setFilterStatus(filter.id as any)}
                                    className={cn(
                                        "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap",
                                        filterStatus === filter.id ? "bg-white shadow-sm text-zinc-900" : "text-zinc-600 hover:text-zinc-900"
                                    )}
                                >
                                    {filter.label}
                                </button>
                            ))}
                        </div>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as any)}
                            className="h-10 px-3 bg-white border border-zinc-200 rounded-xl text-sm focus:outline-none hidden sm:block"
                        >
                            <option value="date">Plus récentes</option>
                            <option value="priority">Par priorité</option>
                            <option value="amount">Par montant</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
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
                <div className="bg-white rounded-xl sm:rounded-2xl border border-zinc-200 p-8 sm:p-16 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-zinc-100 flex items-center justify-center mx-auto mb-4">
                        <Wrench className="h-8 w-8 text-zinc-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-zinc-900 mb-2">
                        {searchQuery || filterStatus !== "all" ? "Aucun résultat" : "Aucune réparation"}
                    </h3>
                    <p className="text-sm text-zinc-500 mb-6 max-w-md mx-auto">
                        {searchQuery || filterStatus !== "all"
                            ? "Aucune réparation ne correspond à vos critères"
                            : "Commencez par créer votre première réparation"}
                    </p>
                    {!searchQuery && filterStatus === "all" && (
                        <Link
                            href="/repairs/new"
                            className="inline-flex h-11 px-6 bg-zinc-900 hover:bg-zinc-800 text-white text-sm font-medium rounded-xl items-center gap-2 transition-colors"
                        >
                            <Plus className="h-4 w-4" />
                            Nouvelle réparation
                        </Link>
                    )}
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredRepairs.map((repair) => {
                        const status = statusConfig[repair.statut]
                        const StatusIcon = status.icon
                        const priorite = prioriteConfig[repair.priorite]

                        return (
                            <Link
                                key={repair.id}
                                href={`/repairs/${repair.id}`}
                                className="block bg-white rounded-xl border border-zinc-200 p-4 sm:p-5 hover:border-zinc-300 transition-colors active:bg-zinc-50"
                            >
                                <div className="flex items-start gap-4">
                                    {/* Icon avec priorité */}
                                    <div className={cn(
                                        "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0",
                                        repair.priorite === "urgent" ? "bg-red-100" :
                                            repair.priorite === "prioritaire" ? "bg-amber-100" : "bg-zinc-100"
                                    )}>
                                        {repair.priorite === "urgent" ? (
                                            <AlertTriangle className="h-6 w-6 text-red-600" />
                                        ) : (
                                            <Wrench className={cn(
                                                "h-6 w-6",
                                                repair.priorite === "prioritaire" ? "text-amber-600" : "text-zinc-600"
                                            )} />
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        {/* Header */}
                                        <div className="flex items-start justify-between gap-2 mb-1">
                                            <div>
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <span className="text-xs font-mono text-zinc-400">{repair.numero}</span>
                                                    {repair.priorite === "urgent" && (
                                                        <span className="text-[10px] font-bold text-red-600 uppercase">URGENT</span>
                                                    )}
                                                </div>
                                                <h3 className="text-[15px] font-semibold text-zinc-900 line-clamp-1">
                                                    {repair.description}
                                                </h3>
                                            </div>
                                            <span className={cn("px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0 flex items-center gap-1", status.color)}>
                                                <StatusIcon className="h-3 w-3" />
                                                {status.label}
                                            </span>
                                        </div>

                                        {/* Véhicule & Client */}
                                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-zinc-500 mb-2">
                                            {repair.vehicule && (
                                                <div className="flex items-center gap-1.5">
                                                    <BrandLogo brand={repair.vehicule.marque} size={16} />
                                                    <span className="font-mono text-[11px] bg-zinc-100 px-1.5 py-0.5 rounded">
                                                        {repair.vehicule.plaque}
                                                    </span>
                                                    <span className="text-zinc-400 text-xs">
                                                        {repair.vehicule.marque} {repair.vehicule.modele}
                                                    </span>
                                                </div>
                                            )}
                                            {repair.client && (
                                                <span className="text-zinc-400 text-xs">
                                                    • {repair.client.prenom} {repair.client.nom}
                                                </span>
                                            )}
                                        </div>

                                        {/* Footer */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3 text-xs text-zinc-400">
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="h-3.5 w-3.5" />
                                                    {repair.dateEntree.toDate().toLocaleDateString('fr-FR')}
                                                </span>
                                                {repair.dateSortiePrevue && (
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="h-3.5 w-3.5" />
                                                        Sortie: {repair.dateSortiePrevue.toDate().toLocaleDateString('fr-FR')}
                                                    </span>
                                                )}
                                            </div>
                                            {repair.montantTTC > 0 && (
                                                <span className="text-sm font-semibold text-zinc-900">
                                                    {repair.montantTTC.toLocaleString()} €
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <ChevronRight className="h-5 w-5 text-zinc-400 flex-shrink-0 hidden sm:block" />
                                </div>
                            </Link>
                        )
                    })}
                </div>
            )}

            {/* Mobile FAB */}
            <Link
                href="/repairs/new"
                className="md:hidden fixed right-4 bottom-20 w-14 h-14 bg-zinc-900 hover:bg-zinc-800 text-white rounded-full shadow-lg flex items-center justify-center z-30 active:scale-95 transition-transform"
            >
                <Plus className="h-6 w-6" />
            </Link>
        </div>
    )
}
