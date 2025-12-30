"use client"

import { useState, Suspense } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import {
    ArrowLeft,
    Save,
    Loader2,
    FileText,
    User,
    Car,
    Plus,
    Trash2,
    Send,
    Download,
    Eye
} from "lucide-react"
import { cn } from "@/lib/utils"

interface LigneDocument {
    id: string
    designation: string
    quantite: number
    prixUnitaireHT: number
    tauxTVA: number
}

function NewInvoiceContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const type = searchParams.get("type") || "devis"

    const [isLoading, setIsLoading] = useState(false)

    const [formData, setFormData] = useState({
        clientId: "",
        vehiculeId: "",
        dateEcheance: "",
        notes: "",
        conditionsParticulieres: "",
    })

    const [lignes, setLignes] = useState<LigneDocument[]>([
        { id: "1", designation: "", quantite: 1, prixUnitaireHT: 0, tauxTVA: 20 }
    ])

    const updateField = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const addLigne = () => {
        setLignes([...lignes, {
            id: Date.now().toString(),
            designation: "",
            quantite: 1,
            prixUnitaireHT: 0,
            tauxTVA: 20
        }])
    }

    const updateLigne = (id: string, field: string, value: string | number) => {
        setLignes(lignes.map(l =>
            l.id === id ? { ...l, [field]: value } : l
        ))
    }

    const removeLigne = (id: string) => {
        if (lignes.length > 1) {
            setLignes(lignes.filter(l => l.id !== id))
        }
    }

    const totalHT = lignes.reduce((sum, l) => sum + (l.quantite * l.prixUnitaireHT), 0)
    const totalTVA = lignes.reduce((sum, l) => sum + (l.quantite * l.prixUnitaireHT * (l.tauxTVA / 100)), 0)
    const totalTTC = totalHT + totalTVA

    const handleSubmit = async (action: "save" | "send") => {
        setIsLoading(true)

        try {
            await new Promise(resolve => setTimeout(resolve, 1000))
            router.push("/invoices")
        } catch (error) {
            console.error("Erreur:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const hasContent = lignes.some(l => l.designation && l.prixUnitaireHT > 0)

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/invoices" className="p-2 hover:bg-zinc-100 rounded-lg transition-colors">
                        <ArrowLeft className="h-5 w-5 text-zinc-600" />
                    </Link>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-zinc-900">
                            {type === "facture" ? "Nouvelle facture" : "Nouveau devis"}
                        </h1>
                        <p className="text-sm text-zinc-500">
                            {type === "facture" ? "Créez une facture" : "Créez un devis pour votre client"}
                        </p>
                    </div>
                </div>

                {/* Preview Button - Desktop */}
                <button className="hidden sm:flex h-10 px-4 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-sm font-medium rounded-xl items-center gap-2 transition-colors">
                    <Eye className="h-4 w-4" />
                    Aperçu
                </button>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Type toggle */}
                    <div className="flex gap-2 p-1 bg-zinc-100 rounded-xl w-fit">
                        <Link
                            href="/invoices/new?type=devis"
                            className={cn(
                                "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                                type === "devis" ? "bg-white shadow-sm text-zinc-900" : "text-zinc-600 hover:text-zinc-900"
                            )}
                        >
                            Devis
                        </Link>
                        <Link
                            href="/invoices/new?type=facture"
                            className={cn(
                                "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                                type === "facture" ? "bg-white shadow-sm text-zinc-900" : "text-zinc-600 hover:text-zinc-900"
                            )}
                        >
                            Facture
                        </Link>
                    </div>

                    {/* Client & Véhicule */}
                    <div className="bg-white rounded-2xl border border-zinc-200 p-6">
                        <h2 className="text-[15px] font-semibold text-zinc-900 mb-4">
                            Destinataire
                        </h2>

                        <div className="grid sm:grid-cols-2 gap-4">
                            <button
                                type="button"
                                className="h-24 border-2 border-dashed border-zinc-300 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-zinc-400 hover:bg-zinc-50 transition-colors"
                            >
                                <User className="h-6 w-6 text-zinc-400" />
                                <span className="text-sm font-medium text-zinc-600">Sélectionner un client</span>
                            </button>
                            <button
                                type="button"
                                className="h-24 border-2 border-dashed border-zinc-300 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-zinc-400 hover:bg-zinc-50 transition-colors"
                            >
                                <Car className="h-6 w-6 text-zinc-400" />
                                <span className="text-sm font-medium text-zinc-600">Véhicule (optionnel)</span>
                            </button>
                        </div>
                    </div>

                    {/* Lignes */}
                    <div className="bg-white rounded-2xl border border-zinc-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-[15px] font-semibold text-zinc-900 flex items-center gap-2">
                                <FileText className="h-4 w-4 text-zinc-400" />
                                Lignes du {type}
                            </h2>
                        </div>

                        <div className="space-y-3">
                            {/* Header - Desktop */}
                            <div className="hidden sm:grid sm:grid-cols-12 gap-3 text-xs font-medium text-zinc-500 uppercase tracking-wide px-2">
                                <div className="col-span-6">Désignation</div>
                                <div className="col-span-2 text-center">Qté</div>
                                <div className="col-span-2 text-right">Prix HT</div>
                                <div className="col-span-1 text-right">TVA</div>
                                <div className="col-span-1"></div>
                            </div>

                            {lignes.map((ligne) => (
                                <div key={ligne.id} className="grid sm:grid-cols-12 gap-3 p-3 bg-zinc-50 rounded-xl">
                                    <div className="sm:col-span-6">
                                        <input
                                            type="text"
                                            value={ligne.designation}
                                            onChange={(e) => updateLigne(ligne.id, "designation", e.target.value)}
                                            placeholder="Description du produit ou service..."
                                            className="w-full h-10 px-3 bg-white border border-zinc-200 rounded-lg text-sm"
                                        />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="sm:hidden text-xs text-zinc-500 mb-1 block">Quantité</label>
                                        <input
                                            type="number"
                                            value={ligne.quantite}
                                            onChange={(e) => updateLigne(ligne.id, "quantite", parseFloat(e.target.value))}
                                            min={0.01}
                                            step={0.01}
                                            className="w-full h-10 px-3 bg-white border border-zinc-200 rounded-lg text-sm text-center"
                                        />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="sm:hidden text-xs text-zinc-500 mb-1 block">Prix unitaire HT</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                value={ligne.prixUnitaireHT}
                                                onChange={(e) => updateLigne(ligne.id, "prixUnitaireHT", parseFloat(e.target.value))}
                                                min={0}
                                                step={0.01}
                                                className="w-full h-10 px-3 pr-8 bg-white border border-zinc-200 rounded-lg text-sm text-right"
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400">€</span>
                                        </div>
                                    </div>
                                    <div className="sm:col-span-1">
                                        <label className="sm:hidden text-xs text-zinc-500 mb-1 block">TVA %</label>
                                        <select
                                            value={ligne.tauxTVA}
                                            onChange={(e) => updateLigne(ligne.id, "tauxTVA", parseFloat(e.target.value))}
                                            className="w-full h-10 px-2 bg-white border border-zinc-200 rounded-lg text-sm"
                                        >
                                            <option value={20}>20%</option>
                                            <option value={10}>10%</option>
                                            <option value={5.5}>5.5%</option>
                                            <option value={0}>0%</option>
                                        </select>
                                    </div>
                                    <div className="sm:col-span-1 flex items-center justify-end">
                                        <button
                                            type="button"
                                            onClick={() => removeLigne(ligne.id)}
                                            disabled={lignes.length === 1}
                                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}

                            <button
                                type="button"
                                onClick={addLigne}
                                className="w-full h-12 border-2 border-dashed border-zinc-300 rounded-xl flex items-center justify-center gap-2 text-sm font-medium text-zinc-600 hover:border-zinc-400 hover:bg-zinc-50 transition-colors"
                            >
                                <Plus className="h-4 w-4" />
                                Ajouter une ligne
                            </button>
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="bg-white rounded-2xl border border-zinc-200 p-6">
                        <h2 className="text-[15px] font-semibold text-zinc-900 mb-4">
                            Conditions et notes
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-2">
                                    {type === "devis" ? "Validité du devis" : "Échéance de paiement"}
                                </label>
                                <input
                                    type="date"
                                    value={formData.dateEcheance}
                                    onChange={(e) => updateField("dateEcheance", e.target.value)}
                                    className="w-full sm:w-auto h-11 px-4 bg-white border border-zinc-300 rounded-xl text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-2">
                                    Notes / Conditions particulières
                                </label>
                                <textarea
                                    value={formData.conditionsParticulieres}
                                    onChange={(e) => updateField("conditionsParticulieres", e.target.value)}
                                    placeholder="Conditions particulières pour ce document..."
                                    rows={3}
                                    className="w-full px-4 py-3 bg-white border border-zinc-300 rounded-xl text-sm resize-none"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar - Totals */}
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl border border-zinc-200 p-6 sticky top-6">
                        <h2 className="text-[15px] font-semibold text-zinc-900 mb-4">
                            Totaux
                        </h2>

                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-zinc-500">Total HT</span>
                                <span className="font-medium">{totalHT.toFixed(2)} €</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-zinc-500">TVA</span>
                                <span className="font-medium">{totalTVA.toFixed(2)} €</span>
                            </div>
                            <div className="flex justify-between pt-3 border-t border-zinc-200">
                                <span className="text-lg font-semibold text-zinc-900">Total TTC</span>
                                <span className="text-xl font-bold text-zinc-900">{totalTTC.toFixed(2)} €</span>
                            </div>
                        </div>

                        <div className="mt-6 pt-6 border-t border-zinc-200 space-y-3">
                            <button
                                onClick={() => handleSubmit("save")}
                                disabled={!hasContent || isLoading}
                                className="w-full h-12 bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-300 text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors"
                            >
                                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                Enregistrer
                            </button>

                            <button
                                onClick={() => handleSubmit("send")}
                                disabled={!hasContent || isLoading}
                                className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 disabled:bg-zinc-300 text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors"
                            >
                                <Send className="h-4 w-4" />
                                Envoyer au client
                            </button>

                            <div className="flex gap-2">
                                <button className="flex-1 h-10 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-sm font-medium rounded-xl flex items-center justify-center gap-2 transition-colors">
                                    <Eye className="h-4 w-4" />
                                    Aperçu
                                </button>
                                <button className="flex-1 h-10 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-sm font-medium rounded-xl flex items-center justify-center gap-2 transition-colors">
                                    <Download className="h-4 w-4" />
                                    PDF
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function LoadingFallback() {
    return (
        <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
        </div>
    )
}

export default function NewInvoicePage() {
    return (
        <Suspense fallback={<LoadingFallback />}>
            <NewInvoiceContent />
        </Suspense>
    )
}
