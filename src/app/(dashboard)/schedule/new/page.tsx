"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
    ArrowLeft,
    Save,
    Loader2,
    Calendar,
    Clock,
    User,
    Car,
    FileText,
    Bell
} from "lucide-react"
import { cn } from "@/lib/utils"

const typesRDV = [
    { id: "revision", label: "Révision", duration: 60, color: "bg-blue-500" },
    { id: "reparation", label: "Réparation", duration: 120, color: "bg-amber-500" },
    { id: "diagnostic", label: "Diagnostic", duration: 45, color: "bg-violet-500" },
    { id: "controle", label: "Contrôle technique", duration: 30, color: "bg-emerald-500" },
    { id: "pneus", label: "Pneumatiques", duration: 45, color: "bg-cyan-500" },
    { id: "autre", label: "Autre", duration: 60, color: "bg-zinc-500" },
]

const creneaux = [
    "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
    "11:00", "11:30", "14:00", "14:30", "15:00", "15:30",
    "16:00", "16:30", "17:00", "17:30"
]

export default function NewSchedulePage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)

    const [formData, setFormData] = useState({
        clientId: "",
        vehiculeId: "",
        type: "revision",
        date: "",
        heure: "",
        dureeMinutes: 60,
        description: "",
        rappelSMS: true,
        rappelEmail: true,
    })

    const updateField = (field: string, value: string | number | boolean) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const selectType = (typeId: string) => {
        const type = typesRDV.find(t => t.id === typeId)
        if (type) {
            setFormData(prev => ({
                ...prev,
                type: typeId,
                dureeMinutes: type.duration
            }))
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            await new Promise(resolve => setTimeout(resolve, 1000))
            router.push("/schedule")
        } catch (error) {
            console.error("Erreur:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const canSubmit = formData.date && formData.heure

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/schedule" className="p-2 hover:bg-zinc-100 rounded-lg transition-colors">
                    <ArrowLeft className="h-5 w-5 text-zinc-600" />
                </Link>
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-zinc-900">
                        Nouveau rendez-vous
                    </h1>
                    <p className="text-sm text-zinc-500">
                        Planifiez un rendez-vous avec un client
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="max-w-2xl">
                {/* Type de RDV */}
                <div className="bg-white rounded-2xl border border-zinc-200 p-6 mb-6">
                    <h2 className="text-[15px] font-semibold text-zinc-900 mb-4 flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-zinc-400" />
                        Type de rendez-vous
                    </h2>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {typesRDV.map(type => (
                            <button
                                key={type.id}
                                type="button"
                                onClick={() => selectType(type.id)}
                                className={cn(
                                    "p-4 rounded-xl border-2 text-left transition-all",
                                    formData.type === type.id
                                        ? "border-zinc-900 bg-zinc-50"
                                        : "border-zinc-200 hover:border-zinc-300"
                                )}
                            >
                                <div className="flex items-center gap-2 mb-1">
                                    <div className={cn("w-3 h-3 rounded-full", type.color)} />
                                    <span className="text-sm font-semibold text-zinc-900">{type.label}</span>
                                </div>
                                <p className="text-xs text-zinc-500">~{type.duration} min</p>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Date & Heure */}
                <div className="bg-white rounded-2xl border border-zinc-200 p-6 mb-6">
                    <h2 className="text-[15px] font-semibold text-zinc-900 mb-4 flex items-center gap-2">
                        <Clock className="h-4 w-4 text-zinc-400" />
                        Date et heure
                    </h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-zinc-700 mb-2">
                                Date <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                value={formData.date}
                                onChange={(e) => updateField("date", e.target.value)}
                                min={new Date().toISOString().split('T')[0]}
                                className="w-full sm:w-auto h-11 px-4 bg-white border border-zinc-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-zinc-700 mb-2">
                                Créneau horaire <span className="text-red-500">*</span>
                            </label>
                            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                                {creneaux.map(creneau => (
                                    <button
                                        key={creneau}
                                        type="button"
                                        onClick={() => updateField("heure", creneau)}
                                        className={cn(
                                            "h-10 px-3 rounded-lg text-sm font-medium transition-colors",
                                            formData.heure === creneau
                                                ? "bg-zinc-900 text-white"
                                                : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                                        )}
                                    >
                                        {creneau}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-zinc-700 mb-2">
                                Durée estimée
                            </label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    value={formData.dureeMinutes}
                                    onChange={(e) => updateField("dureeMinutes", parseInt(e.target.value))}
                                    min={15}
                                    step={15}
                                    className="w-24 h-11 px-4 bg-white border border-zinc-300 rounded-xl text-sm text-center"
                                />
                                <span className="text-sm text-zinc-500">minutes</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Client & Véhicule */}
                <div className="bg-white rounded-2xl border border-zinc-200 p-6 mb-6">
                    <h2 className="text-[15px] font-semibold text-zinc-900 mb-4">
                        Client et véhicule
                    </h2>

                    <div className="grid sm:grid-cols-2 gap-4">
                        <button
                            type="button"
                            className="h-20 border-2 border-dashed border-zinc-300 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-zinc-400 hover:bg-zinc-50 transition-colors"
                        >
                            <User className="h-5 w-5 text-zinc-400" />
                            <span className="text-sm font-medium text-zinc-600">Sélectionner un client</span>
                        </button>
                        <button
                            type="button"
                            className="h-20 border-2 border-dashed border-zinc-300 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-zinc-400 hover:bg-zinc-50 transition-colors"
                        >
                            <Car className="h-5 w-5 text-zinc-400" />
                            <span className="text-sm font-medium text-zinc-600">Véhicule (optionnel)</span>
                        </button>
                    </div>
                </div>

                {/* Description */}
                <div className="bg-white rounded-2xl border border-zinc-200 p-6 mb-6">
                    <h2 className="text-[15px] font-semibold text-zinc-900 mb-4 flex items-center gap-2">
                        <FileText className="h-4 w-4 text-zinc-400" />
                        Description
                    </h2>

                    <textarea
                        value={formData.description}
                        onChange={(e) => updateField("description", e.target.value)}
                        placeholder="Détails sur le rendez-vous..."
                        rows={3}
                        className="w-full px-4 py-3 bg-white border border-zinc-300 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-zinc-900"
                    />
                </div>

                {/* Rappels */}
                <div className="bg-white rounded-2xl border border-zinc-200 p-6 mb-6">
                    <h2 className="text-[15px] font-semibold text-zinc-900 mb-4 flex items-center gap-2">
                        <Bell className="h-4 w-4 text-zinc-400" />
                        Rappels automatiques
                    </h2>

                    <div className="space-y-3">
                        <label className="flex items-center gap-3 p-3 bg-zinc-50 rounded-xl cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.rappelSMS}
                                onChange={(e) => updateField("rappelSMS", e.target.checked)}
                                className="w-5 h-5 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
                            />
                            <div>
                                <p className="text-sm font-medium text-zinc-900">Rappel SMS</p>
                                <p className="text-xs text-zinc-500">Envoyer un SMS de rappel 24h avant le RDV</p>
                            </div>
                        </label>

                        <label className="flex items-center gap-3 p-3 bg-zinc-50 rounded-xl cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.rappelEmail}
                                onChange={(e) => updateField("rappelEmail", e.target.checked)}
                                className="w-5 h-5 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
                            />
                            <div>
                                <p className="text-sm font-medium text-zinc-900">Rappel Email</p>
                                <p className="text-xs text-zinc-500">Envoyer un email de confirmation et rappel</p>
                            </div>
                        </label>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3">
                    <Link
                        href="/schedule"
                        className="h-11 px-6 text-zinc-700 text-sm font-medium rounded-xl hover:bg-zinc-100 transition-colors flex items-center"
                    >
                        Annuler
                    </Link>
                    <button
                        type="submit"
                        disabled={!canSubmit || isLoading}
                        className="h-11 px-6 bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-300 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl flex items-center gap-2 transition-colors"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Création...
                            </>
                        ) : (
                            <>
                                <Save className="h-4 w-4" />
                                Créer le rendez-vous
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    )
}
