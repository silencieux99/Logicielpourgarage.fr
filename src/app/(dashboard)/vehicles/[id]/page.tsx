"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
    ArrowLeft,
    Edit,
    Trash2,
    Calendar,
    Wrench,
    FileText,
    Loader2,
    Car,
    Plus
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"
import { getVehiculeById, getReparationsByVehicule, deleteVehicule, Vehicule, Reparation } from "@/lib/database"

const statusConfig = {
    brouillon: { label: "Brouillon", color: "bg-zinc-100 text-zinc-700", icon: FileText },
    en_attente: { label: "En attente", color: "bg-amber-100 text-amber-700", icon: Calendar },
    en_cours: { label: "En cours", color: "bg-blue-100 text-blue-700", icon: Wrench },
    termine: { label: "Terminé", color: "bg-emerald-100 text-emerald-700", icon: FileText },
    facture: { label: "Facturé", color: "bg-purple-100 text-purple-700", icon: FileText },
}

export default function VehicleDetailPage() {
    const params = useParams()
    const router = useRouter()
    const { user } = useAuth()
    const vehicleId = params.id as string

    const [vehicle, setVehicle] = useState<Vehicule | null>(null)
    const [repairs, setRepairs] = useState<Reparation[]>([])
    const [loading, setLoading] = useState(true)
    const [deleting, setDeleting] = useState(false)

    useEffect(() => {
        if (user && vehicleId) {
            loadVehicleData()
        }
    }, [user, vehicleId])

    const loadVehicleData = async () => {
        setLoading(true)
        try {
            const [vehicleData, repairsData] = await Promise.all([
                getVehiculeById(vehicleId),
                getReparationsByVehicule(vehicleId)
            ])
            setVehicle(vehicleData)
            setRepairs(repairsData)
        } catch (error) {
            console.error("Erreur chargement véhicule:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async () => {
        if (!vehicle?.id) return

        if (!confirm(`Êtes-vous sûr de vouloir supprimer le véhicule ${vehicle.plaque} ?`)) {
            return
        }

        setDeleting(true)
        try {
            await deleteVehicule(vehicle.id)
            router.push("/vehicles")
        } catch (error) {
            console.error("Erreur suppression:", error)
            alert("Erreur lors de la suppression du véhicule")
        } finally {
            setDeleting(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-6 w-6 animate-spin text-[var(--text-muted)]" />
            </div>
        )
    }

    if (!vehicle) {
        return (
            <div className="text-center py-20">
                <Car className="h-12 w-12 text-zinc-300 mx-auto mb-4" />
                <h2 className="text-lg font-semibold text-zinc-900 mb-2">Véhicule introuvable</h2>
                <p className="text-sm text-zinc-500 mb-4">Ce véhicule n'existe pas ou a été supprimé.</p>
                <Link href="/vehicles" className="text-sm text-zinc-900 font-medium hover:underline">
                    Retour à la liste
                </Link>
            </div>
        )
    }

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                    <Link href="/vehicles" className="p-2 hover:bg-zinc-100 rounded-lg transition-colors">
                        <ArrowLeft className="h-4 w-4 text-zinc-600" />
                    </Link>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 font-mono tracking-tight">
                            {vehicle.plaque}
                        </h1>
                        <p className="text-sm text-zinc-500 mt-0.5">
                            {vehicle.marque} {vehicle.modele}
                        </p>
                    </div>
                </div>

                <div className="flex gap-2">
                    <Link
                        href={`/vehicles/${vehicle.id}/edit`}
                        className="h-9 px-4 bg-[var(--bg-tertiary)] hover:bg-[var(--border-default)] text-[var(--text-secondary)] text-[13px] font-medium rounded-lg flex items-center gap-2 transition-colors"
                    >
                        <Edit className="h-4 w-4" />
                        Modifier
                    </Link>
                    <button
                        onClick={handleDelete}
                        disabled={deleting}
                        className="h-9 px-4 bg-red-50 hover:bg-red-100 text-red-600 text-[13px] font-medium rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
                    >
                        {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                        Supprimer
                    </button>
                </div>
            </div>

            {/* Vehicle Info */}
            <div className="bg-white rounded-2xl border border-zinc-200 p-6">
                <h2 className="text-[15px] font-semibold text-zinc-900 mb-4">Informations du véhicule</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                        <p className="text-xs text-zinc-500 mb-1">Plaque d'immatriculation</p>
                        <p className="text-sm font-mono font-bold text-zinc-900">{vehicle.plaque}</p>
                    </div>
                    <div>
                        <p className="text-xs text-zinc-500 mb-1">Marque</p>
                        <p className="text-sm font-medium text-zinc-900">{vehicle.marque}</p>
                    </div>
                    <div>
                        <p className="text-xs text-zinc-500 mb-1">Modèle</p>
                        <p className="text-sm font-medium text-zinc-900">{vehicle.modele}</p>
                    </div>
                    {vehicle.annee && (
                        <div>
                            <p className="text-xs text-zinc-500 mb-1">Année</p>
                            <p className="text-sm font-medium text-zinc-900">{vehicle.annee}</p>
                        </div>
                    )}
                    {vehicle.vin && (
                        <div className="sm:col-span-2">
                            <p className="text-xs text-zinc-500 mb-1">Numéro VIN</p>
                            <p className="text-sm font-mono text-zinc-900">{vehicle.vin}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Repairs */}
            <div className="bg-white rounded-2xl border border-zinc-200 p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-[15px] font-semibold text-zinc-900">
                        Réparations ({repairs.length})
                    </h2>
                    <Link
                        href={`/repairs/new?vehicleId=${vehicle.id}`}
                        className="h-8 px-3 bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-white text-[12px] font-medium rounded-lg flex items-center gap-1.5 transition-colors"
                    >
                        <Plus className="h-3.5 w-3.5" />
                        Nouvelle réparation
                    </Link>
                </div>

                {repairs.length === 0 ? (
                    <div className="text-center py-8">
                        <Wrench className="h-10 w-10 text-zinc-300 mx-auto mb-3" />
                        <p className="text-sm text-zinc-500">Aucune réparation pour ce véhicule</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {repairs.map((repair) => {
                            const status = statusConfig[repair.statut]
                            const StatusIcon = status.icon

                            return (
                                <Link
                                    key={repair.id}
                                    href={`/repairs/${repair.id}`}
                                    className="block p-4 bg-zinc-50 hover:bg-zinc-100 rounded-xl transition-colors"
                                >
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xs font-mono text-zinc-400">{repair.numero}</span>
                                                <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1", status.color)}>
                                                    <StatusIcon className="h-3 w-3" />
                                                    {status.label}
                                                </span>
                                            </div>
                                            <p className="text-sm font-medium text-zinc-900 truncate">{repair.description}</p>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <p className="text-sm font-bold text-zinc-900">{repair.montantTTC?.toFixed(2) || '0.00'} €</p>
                                            <p className="text-xs text-zinc-500">
                                                {repair.dateEntree?.toDate ? repair.dateEntree.toDate().toLocaleDateString('fr-FR') : '-'}
                                            </p>
                                        </div>
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}
