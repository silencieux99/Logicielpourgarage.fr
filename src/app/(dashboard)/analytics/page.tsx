"use client"

import { useState, useEffect } from "react"
import {
    TrendingUp,
    Euro,
    Users,
    Wrench,
    FileText,
    ArrowUpRight,
    ArrowDownRight,
    Loader2
} from "lucide-react"
import { cn } from "@/lib/utils"

const periodes = [
    { id: "7d", label: "7 jours" },
    { id: "30d", label: "30 jours" },
    { id: "90d", label: "3 mois" },
    { id: "1y", label: "1 an" },
]

interface Stats {
    chiffreAffaires: number
    chiffreAffairesChange: number
    reparations: number
    reparationsChange: number
    nouveauxClients: number
    nouveauxClientsChange: number
    devisAcceptes: number
    devisAcceptesChange: number
}

interface ChartData {
    label: string
    value: number
}

export default function AnalyticsPage() {
    const [periode, setPeriode] = useState("30d")
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState<Stats | null>(null)
    const [chartData, setChartData] = useState<ChartData[]>([])
    const [topClients, setTopClients] = useState<{ nom: string; ca: number }[]>([])
    const [topMarques, setTopMarques] = useState<{ marque: string; count: number }[]>([])

    useEffect(() => {
        loadAnalytics()
    }, [periode])

    const loadAnalytics = async () => {
        setLoading(true)
        try {
            // TODO: Load from Firebase
            // Calculate real stats from orders, clients, repairs
            setStats(null)
            setChartData([])
            setTopClients([])
            setTopMarques([])
        } catch (error) {
            console.error("Erreur chargement analytics:", error)
        } finally {
            setLoading(false)
        }
    }

    const statCards = stats ? [
        {
            label: "Chiffre d'affaires",
            value: `${stats.chiffreAffaires.toLocaleString()} €`,
            change: stats.chiffreAffairesChange,
            icon: Euro,
            color: "text-emerald-600",
            bgColor: "bg-emerald-50"
        },
        {
            label: "Réparations",
            value: stats.reparations.toString(),
            change: stats.reparationsChange,
            icon: Wrench,
            color: "text-blue-600",
            bgColor: "bg-blue-50"
        },
        {
            label: "Nouveaux clients",
            value: stats.nouveauxClients.toString(),
            change: stats.nouveauxClientsChange,
            icon: Users,
            color: "text-violet-600",
            bgColor: "bg-violet-50"
        },
        {
            label: "Devis acceptés",
            value: `${stats.devisAcceptes}%`,
            change: stats.devisAcceptesChange,
            icon: FileText,
            color: "text-amber-600",
            bgColor: "bg-amber-50"
        },
    ] : []

    const maxChartValue = Math.max(...chartData.map(d => d.value), 1)

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-zinc-900">Analytiques</h1>
                    <p className="text-sm text-zinc-500 mt-1">Vue d'ensemble de votre activité</p>
                </div>

                <div className="flex gap-1 p-1 bg-zinc-100 rounded-xl w-fit">
                    {periodes.map(p => (
                        <button
                            key={p.id}
                            onClick={() => setPeriode(p.id)}
                            className={cn(
                                "px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                                periode === p.id ? "bg-white shadow-sm text-zinc-900" : "text-zinc-600 hover:text-zinc-900"
                            )}
                        >
                            {p.label}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
                </div>
            ) : !stats ? (
                // Empty state
                <div className="space-y-6">
                    {/* Empty Stats Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { label: "Chiffre d'affaires", icon: Euro, bgColor: "bg-emerald-50", color: "text-emerald-600" },
                            { label: "Réparations", icon: Wrench, bgColor: "bg-blue-50", color: "text-blue-600" },
                            { label: "Nouveaux clients", icon: Users, bgColor: "bg-violet-50", color: "text-violet-600" },
                            { label: "Devis acceptés", icon: FileText, bgColor: "bg-amber-50", color: "text-amber-600" },
                        ].map((stat) => (
                            <div key={stat.label} className="bg-white rounded-xl sm:rounded-2xl border border-zinc-200 p-4 sm:p-5">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", stat.bgColor)}>
                                        <stat.icon className={cn("h-5 w-5", stat.color)} />
                                    </div>
                                </div>
                                <p className="text-2xl sm:text-3xl font-bold text-zinc-300">--</p>
                                <p className="text-sm text-zinc-500 mt-1">{stat.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* Empty Charts */}
                    <div className="grid lg:grid-cols-2 gap-6">
                        <div className="bg-white rounded-2xl border border-zinc-200 p-6">
                            <h2 className="text-lg font-semibold text-zinc-900 mb-6">Chiffre d'affaires</h2>
                            <div className="h-64 flex items-center justify-center text-zinc-400">
                                <div className="text-center">
                                    <TrendingUp className="h-12 w-12 mx-auto mb-2 text-zinc-300" />
                                    <p className="text-sm">Pas encore de données</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl border border-zinc-200 p-6">
                            <h2 className="text-lg font-semibold text-zinc-900 mb-6">Répartition du CA</h2>
                            <div className="h-64 flex items-center justify-center text-zinc-400">
                                <div className="text-center">
                                    <Euro className="h-12 w-12 mx-auto mb-2 text-zinc-300" />
                                    <p className="text-sm">Pas encore de données</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Empty Bottom Row */}
                    <div className="grid lg:grid-cols-2 gap-6">
                        <div className="bg-white rounded-2xl border border-zinc-200 p-6">
                            <h2 className="text-lg font-semibold text-zinc-900 mb-4 flex items-center gap-2">
                                <Users className="h-5 w-5 text-zinc-400" />
                                Top clients
                            </h2>
                            <div className="text-center py-8 text-zinc-400">
                                <p className="text-sm">Aucun client pour le moment</p>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl border border-zinc-200 p-6">
                            <h2 className="text-lg font-semibold text-zinc-900 mb-4 flex items-center gap-2">
                                <Wrench className="h-5 w-5 text-zinc-400" />
                                Marques populaires
                            </h2>
                            <div className="text-center py-8 text-zinc-400">
                                <p className="text-sm">Aucune donnée pour le moment</p>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                // With data
                <div className="space-y-6">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {statCards.map((stat) => (
                            <div key={stat.label} className="bg-white rounded-xl sm:rounded-2xl border border-zinc-200 p-4 sm:p-5">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", stat.bgColor)}>
                                        <stat.icon className={cn("h-5 w-5", stat.color)} />
                                    </div>
                                </div>
                                <p className="text-2xl sm:text-3xl font-bold text-zinc-900">{stat.value}</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-sm text-zinc-500">{stat.label}</span>
                                    <span className={cn(
                                        "flex items-center text-xs font-medium",
                                        stat.change >= 0 ? "text-emerald-600" : "text-red-600"
                                    )}>
                                        {stat.change >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                                        {Math.abs(stat.change)}%
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Charts Row */}
                    <div className="grid lg:grid-cols-2 gap-6">
                        <div className="bg-white rounded-2xl border border-zinc-200 p-6">
                            <h2 className="text-lg font-semibold text-zinc-900 mb-6">Chiffre d'affaires</h2>
                            <div className="h-64 flex items-end gap-2">
                                {chartData.map((day, i) => (
                                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                                        <div
                                            className="w-full bg-zinc-900 rounded-t-lg transition-all hover:bg-zinc-700"
                                            style={{
                                                height: `${(day.value / maxChartValue) * 100}%`,
                                                minHeight: day.value > 0 ? '8px' : '0'
                                            }}
                                        />
                                        <span className="text-xs text-zinc-500">{day.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl border border-zinc-200 p-6">
                            <h2 className="text-lg font-semibold text-zinc-900 mb-6">Top clients</h2>
                            {topClients.length === 0 ? (
                                <div className="text-center py-8 text-zinc-400">
                                    <p className="text-sm">Aucun client pour le moment</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {topClients.map((client, i) => (
                                        <div key={i} className="flex items-center gap-3 p-3 bg-zinc-50 rounded-xl">
                                            <span className={cn(
                                                "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                                                i === 0 ? "bg-amber-100 text-amber-700" :
                                                    i === 1 ? "bg-zinc-200 text-zinc-700" :
                                                        i === 2 ? "bg-orange-100 text-orange-700" :
                                                            "bg-zinc-100 text-zinc-500"
                                            )}>
                                                {i + 1}
                                            </span>
                                            <span className="flex-1 text-sm font-medium text-zinc-900">{client.nom}</span>
                                            <span className="text-sm font-bold text-zinc-900">{client.ca.toLocaleString()} €</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
