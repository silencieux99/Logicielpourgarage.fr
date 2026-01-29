"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
    Plus,
    Calendar,
    Clock,
    ChevronLeft,
    ChevronRight,
    Loader2,
    User,
    Car,
    Wrench,
    Users,
    Filter
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"
import {
    getReparations,
    getActivePersonnel,
    getClients,
    getVehicules,
    Reparation,
    Personnel,
    Client,
    Vehicule
} from "@/lib/database"
import { BrandLogo } from "@/components/ui/brand-logo"

interface ReparationWithDetails extends Reparation {
    client?: Client
    vehicule?: Vehicule
    mecanicien?: Personnel
}

const prioriteConfig = {
    normal: { color: "bg-zinc-100 border-zinc-300" },
    prioritaire: { color: "bg-amber-50 border-amber-400" },
    urgent: { color: "bg-red-50 border-red-400" },
}

const statutConfig = {
    en_attente: { label: "Attente", color: "bg-amber-100 text-amber-700" },
    en_cours: { label: "En cours", color: "bg-blue-100 text-blue-700" },
    termine: { label: "Terminé", color: "bg-emerald-100 text-emerald-700" },
    facture: { label: "Facturé", color: "bg-violet-100 text-violet-700" },
}

export default function SchedulePage() {
    const { garage } = useAuth()
    const [personnel, setPersonnel] = useState<Personnel[]>([])
    const [reparations, setReparations] = useState<ReparationWithDetails[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedDate, setSelectedDate] = useState(new Date())
    const [viewMode, setViewMode] = useState<"team" | "list">("team")
    const [selectedMecanicien, setSelectedMecanicien] = useState<string>("all")

    useEffect(() => {
        if (garage?.id) {
            loadData()
        }
    }, [garage?.id])

    const loadData = async () => {
        if (!garage?.id) return
        setLoading(true)
        try {
            const [personnelData, reparationsData, clientsData, vehiculesData] = await Promise.all([
                getActivePersonnel(garage.id),
                getReparations(garage.id),
                getClients(garage.id),
                getVehicules(garage.id)
            ])

            // Enrichir les réparations
            const enrichedReparations = reparationsData
                .filter(r => r.statut === 'en_attente' || r.statut === 'en_cours')
                .map(rep => ({
                    ...rep,
                    client: clientsData.find(c => c.id === rep.clientId),
                    vehicule: vehiculesData.find(v => v.id === rep.vehiculeId),
                    mecanicien: personnelData.find(p => p.id === rep.mecanicienId)
                }))

            setPersonnel(personnelData)
            setReparations(enrichedReparations)
        } catch (error) {
            console.error("Erreur chargement:", error)
        } finally {
            setLoading(false)
        }
    }

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('fr-FR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long'
        })
    }

    const goToDay = (offset: number) => {
        const newDate = new Date(selectedDate)
        newDate.setDate(newDate.getDate() + offset)
        setSelectedDate(newDate)
    }

    const isToday = selectedDate.toDateString() === new Date().toDateString()

    // Réparations par mécanicien
    const getReparationsByMecanicien = (mecanicienId: string | undefined) => {
        if (!mecanicienId) return reparations.filter(r => !r.mecanicienId)
        return reparations.filter(r => r.mecanicienId === mecanicienId)
    }

    // Stats
    const enCours = reparations.filter(r => r.statut === 'en_cours').length
    const enAttente = reparations.filter(r => r.statut === 'en_attente').length
    const nonAssignees = reparations.filter(r => !r.mecanicienId).length

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-6 w-6 animate-spin text-[var(--text-muted)]" />
            </div>
        )
    }

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-semibold text-[var(--text-primary)] tracking-tight">
                        Planning équipe
                    </h1>
                    <p className="text-[13px] text-[var(--text-tertiary)] mt-0.5">
                        {enCours} en cours • {enAttente} en attente
                        {nonAssignees > 0 && <span className="text-amber-600"> • {nonAssignees} non assignées</span>}
                    </p>
                </div>
                <div className="flex gap-2">
                    <div className="flex bg-zinc-100 rounded-lg p-1 gap-0.5">
                        <button
                            onClick={() => setViewMode("team")}
                            className={cn(
                                "px-3 py-1.5 rounded-md text-[12px] font-medium transition-all flex items-center gap-1.5",
                                viewMode === "team" ? "bg-white shadow-sm text-zinc-900" : "text-zinc-500"
                            )}
                        >
                            <Users className="h-3.5 w-3.5" />
                            Équipe
                        </button>
                        <button
                            onClick={() => setViewMode("list")}
                            className={cn(
                                "px-3 py-1.5 rounded-md text-[12px] font-medium transition-all flex items-center gap-1.5",
                                viewMode === "list" ? "bg-white shadow-sm text-zinc-900" : "text-zinc-500"
                            )}
                        >
                            <Wrench className="h-3.5 w-3.5" />
                            Liste
                        </button>
                    </div>
                    <Link
                        href="/repairs/new"
                        className="hidden sm:inline-flex h-9 px-4 bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-white text-[13px] font-medium rounded-lg items-center gap-2 transition-colors"
                    >
                        <Plus className="h-4 w-4" />
                        <span>Nouvelle réparation</span>
                    </Link>
                </div>
            </div>

            {/* Vue Équipe - Colonnes par mécanicien */}
            {viewMode === "team" && (
                <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
                    <div className="flex gap-4 min-w-max pb-4">
                        {/* Colonne Non assignées */}
                        <div className="w-72 flex-shrink-0">
                            <div className="bg-zinc-100 rounded-xl p-3 mb-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-zinc-300 rounded-lg flex items-center justify-center">
                                        <User className="h-4 w-4 text-zinc-600" />
                                    </div>
                                    <div>
                                        <p className="text-[13px] font-semibold text-zinc-700">Non assignées</p>
                                        <p className="text-[11px] text-zinc-500">{getReparationsByMecanicien(undefined).length} réparations</p>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                {getReparationsByMecanicien(undefined).map(rep => (
                                    <ReparationCard key={rep.id} reparation={rep} />
                                ))}
                                {getReparationsByMecanicien(undefined).length === 0 && (
                                    <div className="text-center py-8 text-[12px] text-zinc-400">
                                        Aucune réparation
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Colonnes par mécanicien */}
                        {personnel.map(meca => {
                            const repsCount = getReparationsByMecanicien(meca.id).length
                            const enCoursCount = getReparationsByMecanicien(meca.id).filter(r => r.statut === 'en_cours').length

                            return (
                                <div key={meca.id} className="w-72 flex-shrink-0">
                                    <div
                                        className="rounded-xl p-3 mb-3"
                                        style={{ backgroundColor: `${meca.couleur}15` }}
                                    >
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-semibold text-[11px]"
                                                style={{ backgroundColor: meca.couleur }}
                                            >
                                                {meca.prenom[0]}{meca.nom[0]}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[13px] font-semibold text-zinc-700 truncate">
                                                    {meca.prenom} {meca.nom}
                                                </p>
                                                <p className="text-[11px] text-zinc-500">
                                                    {repsCount} tâche{repsCount > 1 ? 's' : ''}
                                                    {enCoursCount > 0 && <span className="text-blue-600"> • {enCoursCount} en cours</span>}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        {getReparationsByMecanicien(meca.id!).map(rep => (
                                            <ReparationCard key={rep.id} reparation={rep} />
                                        ))}
                                        {repsCount === 0 && (
                                            <div className="text-center py-8 text-[12px] text-zinc-400 bg-zinc-50 rounded-xl">
                                                Disponible
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* Vue Liste */}
            {viewMode === "list" && (
                <div className="space-y-4">
                    {/* Filtre mécanicien */}
                    <div className="flex gap-2 overflow-x-auto pb-2">
                        <button
                            onClick={() => setSelectedMecanicien("all")}
                            className={cn(
                                "px-3 py-1.5 rounded-lg text-[12px] font-medium whitespace-nowrap transition-all",
                                selectedMecanicien === "all"
                                    ? "bg-zinc-900 text-white"
                                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                            )}
                        >
                            Toutes ({reparations.length})
                        </button>
                        <button
                            onClick={() => setSelectedMecanicien("none")}
                            className={cn(
                                "px-3 py-1.5 rounded-lg text-[12px] font-medium whitespace-nowrap transition-all",
                                selectedMecanicien === "none"
                                    ? "bg-amber-500 text-white"
                                    : "bg-amber-100 text-amber-700 hover:bg-amber-200"
                            )}
                        >
                            Non assignées ({nonAssignees})
                        </button>
                        {personnel.map(meca => (
                            <button
                                key={meca.id}
                                onClick={() => setSelectedMecanicien(meca.id!)}
                                className={cn(
                                    "px-3 py-1.5 rounded-lg text-[12px] font-medium whitespace-nowrap transition-all flex items-center gap-1.5",
                                    selectedMecanicien === meca.id
                                        ? "text-white"
                                        : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                                )}
                                style={selectedMecanicien === meca.id ? { backgroundColor: meca.couleur } : {}}
                            >
                                <span
                                    className="w-2 h-2 rounded-full"
                                    style={{ backgroundColor: meca.couleur }}
                                />
                                {meca.prenom} ({getReparationsByMecanicien(meca.id).length})
                            </button>
                        ))}
                    </div>

                    {/* Liste */}
                    <div className="space-y-2">
                        {reparations
                            .filter(r => {
                                if (selectedMecanicien === "all") return true
                                if (selectedMecanicien === "none") return !r.mecanicienId
                                return r.mecanicienId === selectedMecanicien
                            })
                            .map(rep => (
                                <ReparationCard key={rep.id} reparation={rep} showMecanicien />
                            ))}
                    </div>
                </div>
            )}

            {/* Empty State */}
            {!loading && reparations.length === 0 && (
                <div className="bg-[var(--bg-tertiary)] rounded-xl p-8 text-center">
                    <Wrench className="h-8 w-8 text-[var(--text-muted)] mx-auto mb-3" />
                    <p className="text-[14px] font-medium text-[var(--text-primary)] mb-1">
                        Aucune réparation en cours
                    </p>
                    <p className="text-[13px] text-[var(--text-tertiary)] mb-4">
                        Créez une réparation pour commencer à planifier
                    </p>
                    <Link
                        href="/repairs/new"
                        className="inline-flex items-center gap-2 h-9 px-4 bg-[var(--accent-primary)] text-white text-[13px] font-medium rounded-lg"
                    >
                        <Plus className="h-4 w-4" />
                        Nouvelle réparation
                    </Link>
                </div>
            )}

            {/* Mobile FAB */}
            <Link
                href="/repairs/new"
                className="md:hidden fixed right-4 fab-bottom w-12 h-12 bg-[var(--accent-primary)] text-white rounded-full flex items-center justify-center z-30"
                style={{ boxShadow: 'var(--shadow-lg)' }}
            >
                <Plus className="h-5 w-5" />
            </Link>
        </div>
    )
}

// Composant ReparationCard
function ReparationCard({ reparation, showMecanicien = false }: { reparation: ReparationWithDetails, showMecanicien?: boolean }) {
    const priorite = prioriteConfig[reparation.priorite]
    const statut = statutConfig[reparation.statut]

    return (
        <Link
            href={`/repairs/${reparation.id}`}
            className={cn(
                "block p-3 rounded-xl border-l-4 transition-all hover:shadow-md",
                priorite.color
            )}
        >
            {/* Header */}
            <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-zinc-900 truncate">
                        {reparation.description || "Réparation"}
                    </p>
                    <p className="text-[11px] text-zinc-500 font-mono">{reparation.numero}</p>
                </div>
                <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-medium", statut.color)}>
                    {statut.label}
                </span>
            </div>

            {/* Véhicule */}
            {reparation.vehicule && (
                <div className="flex items-center gap-2 mb-2">
                    <BrandLogo brand={reparation.vehicule.marque} size={20} />
                    <span className="text-[12px] text-zinc-600">
                        {reparation.vehicule.marque} {reparation.vehicule.modele}
                    </span>
                    <span className="text-[11px] font-mono bg-zinc-200 px-1.5 py-0.5 rounded">
                        {reparation.vehicule.plaque}
                    </span>
                </div>
            )}

            {/* Client */}
            {reparation.client && (
                <div className="flex items-center gap-1.5 text-[11px] text-zinc-500">
                    <User className="h-3 w-3" />
                    {reparation.client.prenom} {reparation.client.nom}
                </div>
            )}

            {/* Mécanicien */}
            {showMecanicien && reparation.mecanicien && (
                <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-zinc-200">
                    <div
                        className="w-5 h-5 rounded flex items-center justify-center text-white text-[9px] font-semibold"
                        style={{ backgroundColor: reparation.mecanicien.couleur }}
                    >
                        {reparation.mecanicien.prenom[0]}{reparation.mecanicien.nom[0]}
                    </div>
                    <span className="text-[11px] text-zinc-600">
                        {reparation.mecanicien.prenom} {reparation.mecanicien.nom}
                    </span>
                </div>
            )}
        </Link>
    )
}
