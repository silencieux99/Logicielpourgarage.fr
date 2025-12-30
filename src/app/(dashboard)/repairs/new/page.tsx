"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
    ArrowLeft,
    Save,
    Loader2,
    Wrench,
    Car,
    User,
    Clock,
    FileText,
    Plus,
    Trash2,
    AlertTriangle
} from "lucide-react"
import { cn } from "@/lib/utils"

const priorites = [
    { id: "normal", label: "Normal", color: "bg-zinc-100 text-zinc-700" },
    { id: "prioritaire", label: "Prioritaire", color: "bg-amber-100 text-amber-700" },
    { id: "urgent", label: "Urgent", color: "bg-red-100 text-red-700" },
]

interface LigneIntervention {
    id: string
    type: "main_oeuvre" | "piece" | "forfait"
    designation: string
    quantite: number
    prixUnitaireHT: number
}

export default function NewRepairPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)

    const [formData, setFormData] = useState({
        clientId: "",
        vehiculeId: "",
        description: "",
        priorite: "normal",
        dateSortiePrevue: "",
        notes: "",
    })

    const [lignes, setLignes] = useState<LigneIntervention[]>([])

    const updateField = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const addLigne = (type: "main_oeuvre" | "piece" | "forfait") => {
        const newLigne: LigneIntervention = {
            id: Date.now().toString(),
            type,
            designation: "",
            quantite: 1,
            prixUnitaireHT: type === "main_oeuvre" ? 55 : 0,
        }
        setLignes([...lignes, newLigne])
    }

    const updateLigne = (id: string, field: string, value: string | number) => {
        setLignes(lignes.map(l =>
            l.id === id ? { ...l, [field]: value } : l
        ))
    }

    const removeLigne = (id: string) => {
        setLignes(lignes.filter(l => l.id !== id))
    }

    const totalHT = lignes.reduce((sum, l) => sum + (l.quantite * l.prixUnitaireHT), 0)
    const tva = totalHT * 0.2
    const totalTTC = totalHT + tva

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            await new Promise(resolve => setTimeout(resolve, 1000))
            router.push("/repairs")
        } catch (error) {
            console.error("Erreur:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const canSubmit = formData.description

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/repairs" className="p-2 hover:bg-zinc-100 rounded-lg transition-colors">
                    <ArrowLeft className="h-5 w-5 text-zinc-600" />
                </Link>
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-zinc-900">
                        Nouvelle réparation
                    </h1>
                    <p className="text-sm text-zinc-500">
                        Créez un ordre de réparation
                    </p>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Main Form */}
                <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
                    {/* Véhicule & Client */}
                    <div className="bg-white rounded-2xl border border-zinc-200 p-6">
                        <h2 className="text-[15px] font-semibold text-zinc-900 mb-4">
                            Véhicule concerné
                        </h2>

                        <div className="grid sm:grid-cols-2 gap-4">
                            <button
                                type="button"
                                className="h-24 border-2 border-dashed border-zinc-300 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-zinc-400 hover:bg-zinc-50 transition-colors"
                            >
                                <Car className="h-6 w-6 text-zinc-400" />
                                <span className="text-sm font-medium text-zinc-600">Sélectionner un véhicule</span>
                            </button>
                            <button
                                type="button"
                                className="h-24 border-2 border-dashed border-zinc-300 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-zinc-400 hover:bg-zinc-50 transition-colors"
                            >
                                <User className="h-6 w-6 text-zinc-400" />
                                <span className="text-sm font-medium text-zinc-600">Sélectionner un client</span>
                            </button>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="bg-white rounded-2xl border border-zinc-200 p-6">
                        <h2 className="text-[15px] font-semibold text-zinc-900 mb-4 flex items-center gap-2">
                            <Wrench className="h-4 w-4 text-zinc-400" />
                            Intervention
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-2">
                                    Description de l'intervention <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => updateField("description", e.target.value)}
                                    placeholder="Ex: Révision complète + changement plaquettes de frein..."
                                    rows={3}
                                    className="w-full px-4 py-3 bg-white border border-zinc-300 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                                />
                            </div>

                            {/* Priorité */}
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-2">
                                    Priorité
                                </label>
                                <div className="flex gap-2 flex-wrap">
                                    {priorites.map(p => (
                                        <button
                                            key={p.id}
                                            type="button"
                                            onClick={() => updateField("priorite", p.id)}
                                            className={cn(
                                                "px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
                                                formData.priorite === p.id
                                                    ? p.color + " ring-2 ring-offset-2 ring-zinc-900"
                                                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                                            )}
                                        >
                                            {p.id === "urgent" && <AlertTriangle className="h-4 w-4" />}
                                            {p.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Date */}
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-2 flex items-center gap-1">
                                    <Clock className="h-3.5 w-3.5" />
                                    Date de sortie prévue
                                </label>
                                <input
                                    type="date"
                                    value={formData.dateSortiePrevue}
                                    onChange={(e) => updateField("dateSortiePrevue", e.target.value)}
                                    className="w-full sm:w-auto h-11 px-4 bg-white border border-zinc-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Lignes d'intervention */}
                    <div className="bg-white rounded-2xl border border-zinc-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-[15px] font-semibold text-zinc-900">
                                Détail de l'intervention
                            </h2>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => addLigne("main_oeuvre")}
                                    className="h-9 px-3 bg-blue-100 text-blue-700 text-xs font-medium rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-1"
                                >
                                    <Plus className="h-3.5 w-3.5" />
                                    Main d'œuvre
                                </button>
                                <button
                                    type="button"
                                    onClick={() => addLigne("piece")}
                                    className="h-9 px-3 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-lg hover:bg-emerald-200 transition-colors flex items-center gap-1"
                                >
                                    <Plus className="h-3.5 w-3.5" />
                                    Pièce
                                </button>
                            </div>
                        </div>

                        {lignes.length === 0 ? (
                            <div className="text-center py-8 bg-zinc-50 rounded-xl">
                                <p className="text-sm text-zinc-500">
                                    Aucune ligne ajoutée. Cliquez sur les boutons ci-dessus pour ajouter des lignes.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {lignes.map((ligne) => (
                                    <div key={ligne.id} className="flex items-start gap-3 p-3 bg-zinc-50 rounded-xl">
                                        <div className={cn(
                                            "w-2 h-full min-h-[60px] rounded-full flex-shrink-0",
                                            ligne.type === "main_oeuvre" ? "bg-blue-500" : "bg-emerald-500"
                                        )} />
                                        <div className="flex-1 grid sm:grid-cols-4 gap-3">
                                            <div className="sm:col-span-2">
                                                <input
                                                    type="text"
                                                    value={ligne.designation}
                                                    onChange={(e) => updateLigne(ligne.id, "designation", e.target.value)}
                                                    placeholder={ligne.type === "main_oeuvre" ? "Ex: Vidange moteur" : "Ex: Filtre à huile"}
                                                    className="w-full h-10 px-3 bg-white border border-zinc-200 rounded-lg text-sm"
                                                />
                                            </div>
                                            <div>
                                                <input
                                                    type="number"
                                                    value={ligne.quantite}
                                                    onChange={(e) => updateLigne(ligne.id, "quantite", parseInt(e.target.value))}
                                                    min={1}
                                                    step={ligne.type === "main_oeuvre" ? 0.5 : 1}
                                                    className="w-full h-10 px-3 bg-white border border-zinc-200 rounded-lg text-sm text-center"
                                                />
                                                <p className="text-[10px] text-zinc-500 text-center mt-1">
                                                    {ligne.type === "main_oeuvre" ? "heures" : "unités"}
                                                </p>
                                            </div>
                                            <div className="flex items-start gap-2">
                                                <div className="flex-1">
                                                    <input
                                                        type="number"
                                                        value={ligne.prixUnitaireHT}
                                                        onChange={(e) => updateLigne(ligne.id, "prixUnitaireHT", parseFloat(e.target.value))}
                                                        step={0.01}
                                                        className="w-full h-10 px-3 bg-white border border-zinc-200 rounded-lg text-sm text-right"
                                                    />
                                                    <p className="text-[10px] text-zinc-500 text-right mt-1">€ HT</p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeLigne(ligne.id)}
                                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Notes */}
                    <div className="bg-white rounded-2xl border border-zinc-200 p-6">
                        <h2 className="text-[15px] font-semibold text-zinc-900 mb-4 flex items-center gap-2">
                            <FileText className="h-4 w-4 text-zinc-400" />
                            Notes internes
                        </h2>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => updateField("notes", e.target.value)}
                            placeholder="Notes privées..."
                            rows={2}
                            className="w-full px-4 py-3 bg-white border border-zinc-300 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                        />
                    </div>

                    {/* Actions - Mobile */}
                    <div className="lg:hidden flex items-center justify-end gap-3">
                        <Link href="/repairs" className="h-11 px-6 text-zinc-700 text-sm font-medium rounded-xl hover:bg-zinc-100 transition-colors flex items-center">
                            Annuler
                        </Link>
                        <button
                            type="submit"
                            disabled={!canSubmit || isLoading}
                            className="h-11 px-6 bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-300 text-white text-sm font-semibold rounded-xl flex items-center gap-2 transition-colors"
                        >
                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            Créer
                        </button>
                    </div>
                </form>

                {/* Sidebar - Summary */}
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl border border-zinc-200 p-6 sticky top-6">
                        <h2 className="text-[15px] font-semibold text-zinc-900 mb-4">
                            Récapitulatif
                        </h2>

                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-zinc-500">Sous-total HT</span>
                                <span className="font-medium">{totalHT.toFixed(2)} €</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-zinc-500">TVA (20%)</span>
                                <span className="font-medium">{tva.toFixed(2)} €</span>
                            </div>
                            <div className="flex justify-between pt-3 border-t border-zinc-200">
                                <span className="font-semibold text-zinc-900">Total TTC</span>
                                <span className="text-lg font-bold text-zinc-900">{totalTTC.toFixed(2)} €</span>
                            </div>
                        </div>

                        <div className="mt-6 pt-6 border-t border-zinc-200 hidden lg:block">
                            <button
                                type="submit"
                                form="repair-form"
                                disabled={!canSubmit || isLoading}
                                onClick={handleSubmit}
                                className="w-full h-12 bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-300 text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors"
                            >
                                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                Créer la réparation
                            </button>
                            <Link
                                href="/repairs"
                                className="w-full h-11 mt-2 text-zinc-600 text-sm font-medium rounded-xl hover:bg-zinc-100 transition-colors flex items-center justify-center"
                            >
                                Annuler
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
