"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
    Plus,
    Search,
    Filter,
    Users,
    Phone,
    Mail,
    MoreVertical,
    Star,
    Building2,
    ChevronRight,
    Loader2
} from "lucide-react"
import { cn } from "@/lib/utils"

interface Client {
    id: string
    type: "particulier" | "societe"
    nom: string
    prenom?: string
    raisonSociale?: string
    email?: string
    telephone?: string
    ville?: string
    isVIP?: boolean
    vehiculesCount?: number
}

export default function ClientsPage() {
    const [clients, setClients] = useState<Client[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [filterType, setFilterType] = useState<"all" | "particulier" | "societe">("all")

    useEffect(() => {
        loadClients()
    }, [])

    const loadClients = async () => {
        setLoading(true)
        try {
            // TODO: Load from Firebase
            // const clientsData = await getClients(garageId)
            // setClients(clientsData)
            setClients([])
        } catch (error) {
            console.error("Erreur chargement clients:", error)
        } finally {
            setLoading(false)
        }
    }

    const filteredClients = clients.filter(client => {
        const matchesSearch =
            client.nom?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            client.prenom?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            client.raisonSociale?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            client.telephone?.includes(searchQuery) ||
            client.email?.toLowerCase().includes(searchQuery.toLowerCase())

        const matchesFilter = filterType === "all" || client.type === filterType

        return matchesSearch && matchesFilter
    })

    const getClientName = (client: Client) => {
        return client.type === "societe"
            ? client.raisonSociale
            : `${client.prenom} ${client.nom}`
    }

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-zinc-900">Clients</h1>
                        <p className="text-sm text-zinc-500 mt-1">{clients.length} client{clients.length !== 1 ? 's' : ''}</p>
                    </div>
                    <Link
                        href="/clients/new"
                        className="hidden sm:flex h-10 sm:h-11 px-4 sm:px-5 bg-zinc-900 hover:bg-zinc-800 text-white text-sm font-medium rounded-xl items-center gap-2 transition-colors"
                    >
                        <Plus className="h-4 w-4" />
                        <span>Nouveau client</span>
                    </Link>
                </div>

                {/* Search & Filters */}
                <div className="flex gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                        <input
                            type="text"
                            placeholder="Rechercher un client..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-10 sm:h-11 pl-10 pr-4 bg-white border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
                        />
                    </div>
                    <div className="flex gap-1 p-1 bg-zinc-100 rounded-xl">
                        {[
                            { id: "all", label: "Tous" },
                            { id: "particulier", label: "Particuliers" },
                            { id: "societe", label: "Sociétés" },
                        ].map(filter => (
                            <button
                                key={filter.id}
                                onClick={() => setFilterType(filter.id as any)}
                                className={cn(
                                    "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                                    filterType === filter.id ? "bg-white shadow-sm text-zinc-900" : "text-zinc-600 hover:text-zinc-900"
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
                                className="block bg-white rounded-xl border border-zinc-200 p-4 hover:border-zinc-300 transition-colors"
                            >
                                <div className="flex items-start gap-3">
                                    <div className={cn(
                                        "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                                        client.type === "societe" ? "bg-violet-100" : "bg-zinc-100"
                                    )}>
                                        {client.type === "societe" ? (
                                            <Building2 className="h-5 w-5 text-violet-600" />
                                        ) : (
                                            <span className="text-sm font-semibold text-zinc-600">
                                                {client.prenom?.[0]}{client.nom?.[0]}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="text-[15px] font-semibold text-zinc-900 truncate">
                                                {getClientName(client)}
                                            </p>
                                            {client.isVIP && <Star className="h-4 w-4 text-amber-500 flex-shrink-0" />}
                                        </div>
                                        {client.telephone && (
                                            <p className="text-sm text-zinc-500 truncate">{client.telephone}</p>
                                        )}
                                        {client.vehiculesCount !== undefined && client.vehiculesCount > 0 && (
                                            <p className="text-xs text-zinc-400 mt-1">{client.vehiculesCount} véhicule(s)</p>
                                        )}
                                    </div>
                                    <ChevronRight className="h-5 w-5 text-zinc-400" />
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* Desktop: Table Layout */}
                    <div className="hidden md:block bg-white rounded-2xl border border-zinc-200 overflow-hidden">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-zinc-100">
                                    <th className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wider px-6 py-4">Client</th>
                                    <th className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wider px-6 py-4">Contact</th>
                                    <th className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wider px-6 py-4">Ville</th>
                                    <th className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wider px-6 py-4">Véhicules</th>
                                    <th className="w-12"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100">
                                {filteredClients.map((client) => (
                                    <tr key={client.id} className="hover:bg-zinc-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={cn(
                                                    "w-10 h-10 rounded-xl flex items-center justify-center",
                                                    client.type === "societe" ? "bg-violet-100" : "bg-zinc-100"
                                                )}>
                                                    {client.type === "societe" ? (
                                                        <Building2 className="h-5 w-5 text-violet-600" />
                                                    ) : (
                                                        <span className="text-sm font-semibold text-zinc-600">
                                                            {client.prenom?.[0]}{client.nom?.[0]}
                                                        </span>
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-sm font-semibold text-zinc-900">{getClientName(client)}</p>
                                                        {client.isVIP && <Star className="h-4 w-4 text-amber-500" />}
                                                    </div>
                                                    <p className="text-xs text-zinc-500">{client.type === "societe" ? "Société" : "Particulier"}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                {client.telephone && (
                                                    <div className="flex items-center gap-2 text-sm text-zinc-600">
                                                        <Phone className="h-3.5 w-3.5" />
                                                        {client.telephone}
                                                    </div>
                                                )}
                                                {client.email && (
                                                    <div className="flex items-center gap-2 text-sm text-zinc-600">
                                                        <Mail className="h-3.5 w-3.5" />
                                                        {client.email}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-zinc-600">{client.ville || "-"}</td>
                                        <td className="px-6 py-4 text-sm text-zinc-600">{client.vehiculesCount || 0}</td>
                                        <td className="px-6 py-4">
                                            <Link href={`/clients/${client.id}`} className="p-2 hover:bg-zinc-100 rounded-lg transition-colors inline-block">
                                                <MoreVertical className="h-4 w-4 text-zinc-400" />
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Mobile FAB */}
            <Link
                href="/clients/new"
                className="md:hidden fixed right-4 bottom-20 w-14 h-14 bg-zinc-900 hover:bg-zinc-800 text-white rounded-full shadow-lg flex items-center justify-center z-30"
            >
                <Plus className="h-6 w-6" />
            </Link>
        </div>
    )
}
