"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
    Plus,
    Search,
    Car,
    Fuel,
    Calendar,
    Gauge,
    ChevronRight,
    Loader2
} from "lucide-react"
import { cn } from "@/lib/utils"

interface Vehicle {
    id: string
    plaque: string
    marque: string
    modele: string
    annee: number
    carburant?: string
    kilometrage?: number
    clientNom?: string
}

export default function VehiclesPage() {
    const [vehicles, setVehicles] = useState<Vehicle[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")

    useEffect(() => {
        loadVehicles()
    }, [])

    const loadVehicles = async () => {
        setLoading(true)
        try {
            // TODO: Load from Firebase
            // const vehiclesData = await getVehicles(garageId)
            // setVehicles(vehiclesData)
            setVehicles([])
        } catch (error) {
            console.error("Erreur chargement véhicules:", error)
        } finally {
            setLoading(false)
        }
    }

    const filteredVehicles = vehicles.filter(v =>
        v.plaque.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.marque.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.modele.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.clientNom?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-zinc-900">Véhicules</h1>
                        <p className="text-sm text-zinc-500 mt-1">{vehicles.length} véhicule{vehicles.length !== 1 ? 's' : ''}</p>
                    </div>
                    <Link
                        href="/vehicles/new"
                        className="hidden sm:flex h-10 sm:h-11 px-4 sm:px-5 bg-zinc-900 hover:bg-zinc-800 text-white text-sm font-medium rounded-xl items-center gap-2 transition-colors"
                    >
                        <Plus className="h-4 w-4" />
                        <span>Nouveau véhicule</span>
                    </Link>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    <input
                        type="text"
                        placeholder="Rechercher par plaque, marque, modèle..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-10 sm:h-11 pl-10 pr-4 bg-white border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
                    />
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
                </div>
            ) : filteredVehicles.length === 0 ? (
                <div className="bg-white rounded-xl sm:rounded-2xl border border-zinc-200 p-8 sm:p-16 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-zinc-100 flex items-center justify-center mx-auto mb-4">
                        <Car className="h-8 w-8 text-zinc-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-zinc-900 mb-2">
                        {searchQuery ? "Aucun résultat" : "Aucun véhicule"}
                    </h3>
                    <p className="text-sm text-zinc-500 mb-6 max-w-md mx-auto">
                        {searchQuery
                            ? "Aucun véhicule ne correspond à votre recherche"
                            : "Commencez par ajouter votre premier véhicule"}
                    </p>
                    {!searchQuery && (
                        <Link
                            href="/vehicles/new"
                            className="inline-flex h-11 px-6 bg-zinc-900 hover:bg-zinc-800 text-white text-sm font-medium rounded-xl items-center gap-2 transition-colors"
                        >
                            <Plus className="h-4 w-4" />
                            Ajouter un véhicule
                        </Link>
                    )}
                </div>
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredVehicles.map((vehicle) => (
                        <Link
                            key={vehicle.id}
                            href={`/vehicles/${vehicle.id}`}
                            className="bg-white rounded-xl border border-zinc-200 p-5 hover:border-zinc-300 transition-colors"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="w-12 h-12 rounded-xl bg-zinc-100 flex items-center justify-center">
                                    <Car className="h-6 w-6 text-zinc-600" />
                                </div>
                                <span className="px-2.5 py-1 bg-zinc-100 text-zinc-700 text-xs font-mono font-semibold rounded-lg">
                                    {vehicle.plaque}
                                </span>
                            </div>

                            <h3 className="text-[15px] font-semibold text-zinc-900 mb-1">
                                {vehicle.marque} {vehicle.modele}
                            </h3>

                            {vehicle.clientNom && (
                                <p className="text-sm text-zinc-500 mb-3">{vehicle.clientNom}</p>
                            )}

                            <div className="flex flex-wrap gap-3 text-xs text-zinc-500">
                                <span className="flex items-center gap-1">
                                    <Calendar className="h-3.5 w-3.5" />
                                    {vehicle.annee}
                                </span>
                                {vehicle.carburant && (
                                    <span className="flex items-center gap-1">
                                        <Fuel className="h-3.5 w-3.5" />
                                        {vehicle.carburant}
                                    </span>
                                )}
                                {vehicle.kilometrage !== undefined && (
                                    <span className="flex items-center gap-1">
                                        <Gauge className="h-3.5 w-3.5" />
                                        {vehicle.kilometrage.toLocaleString()} km
                                    </span>
                                )}
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            {/* Mobile FAB */}
            <Link
                href="/vehicles/new"
                className="md:hidden fixed right-4 bottom-20 w-14 h-14 bg-zinc-900 hover:bg-zinc-800 text-white rounded-full shadow-lg flex items-center justify-center z-30"
            >
                <Plus className="h-6 w-6" />
            </Link>
        </div>
    )
}
