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
    Car
} from "lucide-react"
import { cn } from "@/lib/utils"
import { BrandLogo } from "@/components/ui/brand-logo"

interface Repair {
    id: string
    description: string
    status: "en_attente" | "en_cours" | "termine"
    priorite: "normal" | "prioritaire" | "urgent"
    vehiculePlaque?: string
    vehiculeMarque?: string
    vehiculeModele?: string
    clientNom?: string
    dateSortiePrevue?: string
    createdAt: string
}

const statusConfig = {
    en_attente: { label: "En attente", color: "bg-amber-100 text-amber-700", icon: Clock },
    en_cours: { label: "En cours", color: "bg-blue-100 text-blue-700", icon: Wrench },
    termine: { label: "Terminé", color: "bg-emerald-100 text-emerald-700", icon: CheckCircle },
}

export default function RepairsPage() {
    const [repairs, setRepairs] = useState<Repair[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [filterStatus, setFilterStatus] = useState<"all" | "en_attente" | "en_cours" | "termine">("all")

    useEffect(() => {
        loadRepairs()
    }, [])

    const loadRepairs = async () => {
        setLoading(true)
        try {
            // TODO: Load from Firebase
            setRepairs([])
        } catch (error) {
            console.error("Erreur chargement réparations:", error)
        } finally {
            setLoading(false)
        }
    }

    const filteredRepairs = repairs.filter(r => {
        const matchesSearch =
            r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.vehiculePlaque?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.clientNom?.toLowerCase().includes(searchQuery.toLowerCase())

        const matchesFilter = filterStatus === "all" || r.status === filterStatus

        return matchesSearch && matchesFilter
    })

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-zinc-900">Réparations</h1>
                        <p className="text-sm text-zinc-500 mt-1">{repairs.length} réparation{repairs.length !== 1 ? 's' : ''}</p>
                    </div>
                    <Link
                        href="/repairs/new"
                        className="hidden sm:flex h-10 sm:h-11 px-4 sm:px-5 bg-zinc-900 hover:bg-zinc-800 text-white text-sm font-medium rounded-xl items-center gap-2 transition-colors"
                    >
                        <Plus className="h-4 w-4" />
                        <span>Nouvelle réparation</span>
                    </Link>
                </div>

                {/* Search & Filters */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                        <input
                            type="text"
                            placeholder="Rechercher..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-10 sm:h-11 pl-10 pr-4 bg-white border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
                        />
                    </div>
                    <div className="flex gap-1 p-1 bg-zinc-100 rounded-xl overflow-x-auto">
                        {[
                            { id: "all", label: "Toutes" },
                            { id: "en_attente", label: "En attente" },
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
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
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
                        const status = statusConfig[repair.status]
                        const StatusIcon = status.icon

                        return (
                            <Link
                                key={repair.id}
                                href={`/repairs/${repair.id}`}
                                className="block bg-white rounded-xl border border-zinc-200 p-4 sm:p-5 hover:border-zinc-300 transition-colors"
                            >
                                <div className="flex items-start gap-4">
                                    <div className={cn(
                                        "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                                        repair.priorite === "urgent" ? "bg-red-100" : "bg-zinc-100"
                                    )}>
                                        {repair.priorite === "urgent" ? (
                                            <AlertTriangle className="h-5 w-5 text-red-600" />
                                        ) : (
                                            <Wrench className="h-5 w-5 text-zinc-600" />
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2 mb-1">
                                            <h3 className="text-[15px] font-semibold text-zinc-900 line-clamp-1">
                                                {repair.description}
                                            </h3>
                                            <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0", status.color)}>
                                                {status.label}
                                            </span>
                                        </div>

                                        {(repair.vehiculePlaque || repair.clientNom) && (
                                            <div className="flex items-center gap-2 text-sm text-zinc-500 mb-2">
                                                {repair.vehiculeMarque && (
                                                    <BrandLogo brand={repair.vehiculeMarque} size={18} />
                                                )}
                                                {repair.vehiculePlaque && (
                                                    <span className="font-mono text-[11px] bg-zinc-50 border border-zinc-100 px-1.5 py-0.5 rounded">
                                                        {repair.vehiculePlaque}
                                                    </span>
                                                )}
                                                {repair.clientNom && <span className="text-zinc-400">• {repair.clientNom}</span>}
                                            </div>
                                        )}

                                        {repair.dateSortiePrevue && (
                                            <p className="text-xs text-zinc-400">
                                                Sortie prévue: {new Date(repair.dateSortiePrevue).toLocaleDateString('fr-FR')}
                                            </p>
                                        )}
                                    </div>

                                    <ChevronRight className="h-5 w-5 text-zinc-400 flex-shrink-0" />
                                </div>
                            </Link>
                        )
                    })}
                </div>
            )}

            {/* Mobile FAB */}
            <Link
                href="/repairs/new"
                className="md:hidden fixed right-4 bottom-20 w-14 h-14 bg-zinc-900 hover:bg-zinc-800 text-white rounded-full shadow-lg flex items-center justify-center z-30"
            >
                <Plus className="h-6 w-6" />
            </Link>
        </div>
    )
}
