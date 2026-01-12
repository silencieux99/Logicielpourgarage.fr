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
import { BrandLogo } from "@/components/ui/brand-logo"

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
                        <h1 className="text-xl sm:text-2xl font-semibold text-[var(--text-primary)] tracking-tight">Véhicules</h1>
                        <p className="text-[13px] text-[var(--text-tertiary)] mt-0.5">{vehicles.length} véhicule{vehicles.length !== 1 ? 's' : ''}</p>
                    </div>
                    <Link
                        href="/vehicles/new"
                        className="hidden sm:inline-flex h-9 px-4 bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-white text-[13px] font-medium rounded-lg items-center gap-2 transition-colors"
                    >
                        <Plus className="h-4 w-4" />
                        <span>Nouveau véhicule</span>
                    </Link>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
                    <input
                        type="text"
                        placeholder="Rechercher par plaque, marque, modèle..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-10 pl-10 pr-4 bg-white border border-[var(--border-default)] rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent transition-shadow"
                    />
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-6 w-6 animate-spin text-[var(--text-muted)]" />
                </div>
            ) : filteredVehicles.length === 0 ? (
                <div className="bg-white rounded-xl border border-[var(--border-light)] p-8 sm:p-16 text-center" style={{ boxShadow: 'var(--shadow-sm)' }}>
                    <div className="w-14 h-14 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center mx-auto mb-4">
                        <Car className="h-6 w-6 text-[var(--text-muted)]" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-[15px] font-semibold text-[var(--text-primary)] mb-1.5">
                        {searchQuery ? "Aucun résultat" : "Aucun véhicule"}
                    </h3>
                    <p className="text-[13px] text-[var(--text-tertiary)] mb-5 max-w-md mx-auto">
                        {searchQuery
                            ? "Aucun véhicule ne correspond à votre recherche"
                            : "Commencez par ajouter votre premier véhicule"}
                    </p>
                    {!searchQuery && (
                        <Link
                            href="/vehicles/new"
                            className="inline-flex h-9 px-4 bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-white text-[13px] font-medium rounded-lg items-center gap-2 transition-colors"
                        >
                            <Plus className="h-4 w-4" />
                            Ajouter un véhicule
                        </Link>
                    )}
                </div>
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {filteredVehicles.map((vehicle) => (
                        <Link
                            key={vehicle.id}
                            href={`/vehicles/${vehicle.id}`}
                            className="bg-white rounded-xl border border-[var(--border-light)] p-4 hover:border-[var(--border-default)] transition-all"
                            style={{ boxShadow: 'var(--shadow-sm)' }}
                        >
                            <div className="flex items-start justify-between mb-3">
                                <BrandLogo brand={vehicle.marque} size={40} className="bg-[var(--bg-tertiary)] rounded-lg p-1" />
                                <span className="px-2 py-1 bg-[var(--bg-tertiary)] text-[var(--text-secondary)] text-[10px] font-mono font-semibold rounded-md">
                                    {vehicle.plaque}
                                </span>
                            </div>

                            <h3 className="text-[14px] font-semibold text-[var(--text-primary)] mb-0.5">
                                {vehicle.marque} {vehicle.modele}
                            </h3>

                            {vehicle.clientNom && (
                                <p className="text-[12px] text-[var(--text-tertiary)] mb-2">{vehicle.clientNom}</p>
                            )}

                            <div className="flex flex-wrap gap-2 text-[11px] text-[var(--text-muted)]">
                                <span className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {vehicle.annee}
                                </span>
                                {vehicle.carburant && (
                                    <span className="flex items-center gap-1">
                                        <Fuel className="h-3 w-3" />
                                        {vehicle.carburant}
                                    </span>
                                )}
                                {vehicle.kilometrage !== undefined && (
                                    <span className="flex items-center gap-1">
                                        <Gauge className="h-3 w-3" />
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
                className="md:hidden fixed right-4 bottom-20 w-12 h-12 bg-[var(--accent-primary)] text-white rounded-full flex items-center justify-center z-30"
                style={{ boxShadow: 'var(--shadow-lg)' }}
            >
                <Plus className="h-5 w-5" />
            </Link>
        </div>
    )
}
