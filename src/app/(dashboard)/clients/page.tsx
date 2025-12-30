"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
    Plus,
    Search,
    Users,
    Phone,
    Mail,
    MoreVertical,
    Star,
    Building2,
    ChevronRight,
    Loader2,
    Download,
    Trash2,
    Edit,
    Car,
    Wrench,
    FileText,
    Calendar,
    TrendingUp,
    AlertCircle
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"
import { getClients, deleteClient, Client, getVehiculesByClient } from "@/lib/database"

interface ClientWithStats extends Client {
    vehiculesCount?: number
}

export default function ClientsPage() {
    const { garage } = useAuth()
    const [clients, setClients] = useState<ClientWithStats[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [filterType, setFilterType] = useState<"all" | "vip" | "recent">("all")
    const [selectedClients, setSelectedClients] = useState<string[]>([])
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
    const [deleting, setDeleting] = useState(false)
    const [sortBy, setSortBy] = useState<"name" | "date" | "vehicles">("name")

    useEffect(() => {
        if (garage?.id) {
            loadClients()
        } else {
            setLoading(false)
        }
    }, [garage?.id])

    const loadClients = async () => {
        if (!garage?.id) return

        setLoading(true)
        try {
            const clientsData = await getClients(garage.id)

            // Charger le nombre de véhicules pour chaque client
            const clientsWithStats = await Promise.all(
                clientsData.map(async (client) => {
                    if (client.id) {
                        const vehicles = await getVehiculesByClient(client.id)
                        return { ...client, vehiculesCount: vehicles.length }
                    }
                    return { ...client, vehiculesCount: 0 }
                })
            )

            setClients(clientsWithStats)
        } catch (error) {
            console.error("Erreur chargement clients:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (clientId: string) => {
        setDeleting(true)
        try {
            await deleteClient(clientId)
            setClients(prev => prev.filter(c => c.id !== clientId))
            setDeleteConfirm(null)
        } catch (error) {
            console.error("Erreur suppression client:", error)
        } finally {
            setDeleting(false)
        }
    }

    const toggleSelectClient = (clientId: string) => {
        setSelectedClients(prev =>
            prev.includes(clientId)
                ? prev.filter(id => id !== clientId)
                : [...prev, clientId]
        )
    }

    const filteredClients = clients
        .filter(client => {
            // Recherche
            const query = searchQuery.toLowerCase()
            const matchesSearch =
                client.nom?.toLowerCase().includes(query) ||
                client.prenom?.toLowerCase().includes(query) ||
                client.telephone?.includes(query) ||
                client.email?.toLowerCase().includes(query) ||
                client.ville?.toLowerCase().includes(query)

            // Filtres
            if (filterType === "vip" && !client.isVIP) return false
            if (filterType === "recent") {
                const oneWeekAgo = new Date()
                oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
                if (client.createdAt.toDate() < oneWeekAgo) return false
            }

            return matchesSearch
        })
        .sort((a, b) => {
            if (sortBy === "name") {
                return a.nom.localeCompare(b.nom)
            } else if (sortBy === "date") {
                return b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime()
            } else if (sortBy === "vehicles") {
                return (b.vehiculesCount || 0) - (a.vehiculesCount || 0)
            }
            return 0
        })

    const getClientInitials = (client: ClientWithStats) => {
        return `${client.prenom?.[0] || ''}${client.nom?.[0] || ''}`.toUpperCase()
    }

    const getClientName = (client: ClientWithStats) => {
        return `${client.civilite || ''} ${client.prenom || ''} ${client.nom}`.trim()
    }

    // Stats
    const totalClients = clients.length
    const vipClients = clients.filter(c => c.isVIP).length
    const newThisMonth = clients.filter(c => {
        const now = new Date()
        const createdAt = c.createdAt.toDate()
        return createdAt.getMonth() === now.getMonth() && createdAt.getFullYear() === now.getFullYear()
    }).length

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-zinc-900">Clients</h1>
                        <p className="text-sm text-zinc-500 mt-1">
                            {totalClients} client{totalClients !== 1 ? 's' : ''}
                            {vipClients > 0 && <span className="ml-2">• {vipClients} VIP</span>}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {selectedClients.length > 0 && (
                            <span className="text-sm text-zinc-500 mr-2">
                                {selectedClients.length} sélectionné(s)
                            </span>
                        )}
                        <Link
                            href="/clients/new"
                            className="hidden sm:flex h-10 sm:h-11 px-4 sm:px-5 bg-zinc-900 hover:bg-zinc-800 text-white text-sm font-medium rounded-xl items-center gap-2 transition-colors"
                        >
                            <Plus className="h-4 w-4" />
                            <span>Nouveau client</span>
                        </Link>
                    </div>
                </div>

                {/* Stats Cards - Desktop */}
                <div className="hidden sm:grid grid-cols-3 gap-4">
                    <div className="bg-white rounded-xl border border-zinc-200 p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                                <Users className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-zinc-900">{totalClients}</p>
                                <p className="text-xs text-zinc-500">Total clients</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl border border-zinc-200 p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                                <Star className="h-5 w-5 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-zinc-900">{vipClients}</p>
                                <p className="text-xs text-zinc-500">Clients VIP</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl border border-zinc-200 p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                                <TrendingUp className="h-5 w-5 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-zinc-900">+{newThisMonth}</p>
                                <p className="text-xs text-zinc-500">Ce mois-ci</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search & Filters */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                        <input
                            type="text"
                            placeholder="Rechercher par nom, téléphone, email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-10 sm:h-11 pl-10 pr-4 bg-white border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
                        />
                    </div>
                    <div className="flex gap-2">
                        <div className="flex gap-1 p-1 bg-zinc-100 rounded-xl">
                            {[
                                { id: "all", label: "Tous" },
                                { id: "vip", label: "VIP" },
                                { id: "recent", label: "Récents" },
                            ].map(filter => (
                                <button
                                    key={filter.id}
                                    onClick={() => setFilterType(filter.id as any)}
                                    className={cn(
                                        "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap",
                                        filterType === filter.id ? "bg-white shadow-sm text-zinc-900" : "text-zinc-600 hover:text-zinc-900"
                                    )}
                                >
                                    {filter.label}
                                </button>
                            ))}
                        </div>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as any)}
                            className="h-10 px-3 bg-white border border-zinc-200 rounded-xl text-sm focus:outline-none"
                        >
                            <option value="name">Nom A-Z</option>
                            <option value="date">Plus récents</option>
                            <option value="vehicles">Véhicules</option>
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
            ) : filteredClients.length === 0 ? (
                <div className="bg-white rounded-xl sm:rounded-2xl border border-zinc-200 p-8 sm:p-16 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-zinc-100 flex items-center justify-center mx-auto mb-4">
                        <Users className="h-8 w-8 text-zinc-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-zinc-900 mb-2">
                        {searchQuery ? "Aucun résultat" : "Aucun client"}
                    </h3>
                    <p className="text-sm text-zinc-500 mb-6 max-w-md mx-auto">
                        {searchQuery
                            ? "Aucun client ne correspond à votre recherche"
                            : "Commencez par ajouter votre premier client"}
                    </p>
                    {!searchQuery && (
                        <Link
                            href="/clients/new"
                            className="inline-flex h-11 px-6 bg-zinc-900 hover:bg-zinc-800 text-white text-sm font-medium rounded-xl items-center gap-2 transition-colors"
                        >
                            <Plus className="h-4 w-4" />
                            Ajouter un client
                        </Link>
                    )}
                </div>
            ) : (
                <div className="space-y-3">
                    {/* Mobile: Card Layout */}
                    <div className="md:hidden space-y-3">
                        {filteredClients.map((client) => (
                            <Link
                                key={client.id}
                                href={`/clients/${client.id}`}
                                className="block bg-white rounded-xl border border-zinc-200 p-4 hover:border-zinc-300 transition-colors active:bg-zinc-50"
                            >
                                <div className="flex items-start gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-zinc-100 to-zinc-200 flex items-center justify-center flex-shrink-0">
                                        <span className="text-sm font-bold text-zinc-600">
                                            {getClientInitials(client)}
                                        </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="text-[15px] font-semibold text-zinc-900 truncate">
                                                {getClientName(client)}
                                            </p>
                                            {client.isVIP && <Star className="h-4 w-4 text-amber-500 fill-amber-500 flex-shrink-0" />}
                                        </div>
                                        {client.telephone && (
                                            <p className="text-sm text-zinc-500 truncate flex items-center gap-1.5 mt-0.5">
                                                <Phone className="h-3.5 w-3.5" />
                                                {client.telephone}
                                            </p>
                                        )}
                                        <div className="flex items-center gap-3 mt-2">
                                            {client.vehiculesCount !== undefined && client.vehiculesCount > 0 && (
                                                <span className="text-xs text-zinc-400 flex items-center gap-1">
                                                    <Car className="h-3.5 w-3.5" />
                                                    {client.vehiculesCount}
                                                </span>
                                            )}
                                            {client.ville && (
                                                <span className="text-xs text-zinc-400">
                                                    {client.ville}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <ChevronRight className="h-5 w-5 text-zinc-400 flex-shrink-0" />
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* Desktop: Table Layout */}
                    <div className="hidden md:block bg-white rounded-2xl border border-zinc-200 overflow-hidden">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-zinc-100 bg-zinc-50/50">
                                    <th className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wider px-6 py-4">Client</th>
                                    <th className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wider px-6 py-4">Contact</th>
                                    <th className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wider px-6 py-4">Ville</th>
                                    <th className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wider px-6 py-4">Véhicules</th>
                                    <th className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wider px-6 py-4">Ajouté le</th>
                                    <th className="w-20"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100">
                                {filteredClients.map((client) => (
                                    <tr key={client.id} className="hover:bg-zinc-50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <Link href={`/clients/${client.id}`} className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-zinc-100 to-zinc-200 flex items-center justify-center">
                                                    <span className="text-sm font-bold text-zinc-600">
                                                        {getClientInitials(client)}
                                                    </span>
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-sm font-semibold text-zinc-900">{getClientName(client)}</p>
                                                        {client.isVIP && <Star className="h-4 w-4 text-amber-500 fill-amber-500" />}
                                                    </div>
                                                    {client.email && (
                                                        <p className="text-xs text-zinc-500">{client.email}</p>
                                                    )}
                                                </div>
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4">
                                            {client.telephone && (
                                                <a href={`tel:${client.telephone}`} className="flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900">
                                                    <Phone className="h-3.5 w-3.5" />
                                                    {client.telephone}
                                                </a>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-zinc-600">{client.ville || "-"}</td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center gap-1.5 text-sm text-zinc-600">
                                                <Car className="h-4 w-4 text-zinc-400" />
                                                {client.vehiculesCount || 0}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-zinc-500">
                                            {client.createdAt.toDate().toLocaleDateString('fr-FR')}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Link
                                                    href={`/clients/${client.id}`}
                                                    className="p-2 hover:bg-zinc-100 rounded-lg transition-colors"
                                                    title="Modifier"
                                                >
                                                    <Edit className="h-4 w-4 text-zinc-500" />
                                                </Link>
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault()
                                                        setDeleteConfirm(client.id!)
                                                    }}
                                                    className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Supprimer"
                                                >
                                                    <Trash2 className="h-4 w-4 text-red-500" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <>
                    <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setDeleteConfirm(null)} />
                    <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-md bg-white rounded-2xl shadow-xl z-50 p-6">
                        <h3 className="text-lg font-semibold text-zinc-900 mb-2">Supprimer ce client ?</h3>
                        <p className="text-sm text-zinc-500 mb-6">
                            Cette action est irréversible. Toutes les données associées à ce client seront supprimées.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setDeleteConfirm(null)}
                                className="h-10 px-4 text-zinc-700 text-sm font-medium rounded-lg hover:bg-zinc-100 transition-colors"
                                disabled={deleting}
                            >
                                Annuler
                            </button>
                            <button
                                onClick={() => handleDelete(deleteConfirm)}
                                disabled={deleting}
                                className="h-10 px-4 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg flex items-center gap-2 transition-colors"
                            >
                                {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                Supprimer
                            </button>
                        </div>
                    </div>
                </>
            )}

            {/* Mobile FAB */}
            <Link
                href="/clients/new"
                className="md:hidden fixed right-4 bottom-20 w-14 h-14 bg-zinc-900 hover:bg-zinc-800 text-white rounded-full shadow-lg flex items-center justify-center z-30 active:scale-95 transition-transform"
            >
                <Plus className="h-6 w-6" />
            </Link>
        </div>
    )
}
