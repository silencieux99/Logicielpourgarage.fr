"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
    ArrowLeft,
    Save,
    Loader2,
    Package,
    Barcode,
    MapPin,
    AlertTriangle,
    Euro
} from "lucide-react"
import { cn } from "@/lib/utils"

const categories = [
    "Filtration",
    "Freinage",
    "Éclairage",
    "Pneumatiques",
    "Huiles et lubrifiants",
    "Courroies",
    "Batteries",
    "Électricité",
    "Échappement",
    "Autre"
]

export default function NewInventoryPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)

    const [formData, setFormData] = useState({
        reference: "",
        designation: "",
        categorie: "",
        marque: "",
        prixAchatHT: 0,
        prixVenteHT: 0,
        tauxTVA: 20,
        quantiteStock: 0,
        seuilAlerte: 5,
        emplacement: "",
    })

    const updateField = (field: string, value: string | number) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    // Auto-calculate selling price with margin
    const calculerPrixVente = () => {
        if (formData.prixAchatHT > 0) {
            const marge = 0.30 // 30% margin
            const prixVente = formData.prixAchatHT * (1 + marge)
            updateField("prixVenteHT", Math.round(prixVente * 100) / 100)
        }
    }

    const marge = formData.prixAchatHT > 0
        ? ((formData.prixVenteHT - formData.prixAchatHT) / formData.prixAchatHT * 100).toFixed(1)
        : "0"

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            await new Promise(resolve => setTimeout(resolve, 1000))
            router.push("/inventory")
        } catch (error) {
            console.error("Erreur:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const canSubmit = formData.reference && formData.designation

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/inventory" className="p-2 hover:bg-zinc-100 rounded-lg transition-colors">
                    <ArrowLeft className="h-5 w-5 text-zinc-600" />
                </Link>
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-zinc-900">
                        Nouvel article
                    </h1>
                    <p className="text-sm text-zinc-500">
                        Ajoutez un article à votre inventaire
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="max-w-2xl">
                {/* Identification */}
                <div className="bg-white rounded-2xl border border-zinc-200 p-6 mb-6">
                    <h2 className="text-[15px] font-semibold text-zinc-900 mb-4 flex items-center gap-2">
                        <Barcode className="h-4 w-4 text-zinc-400" />
                        Identification
                    </h2>

                    <div className="space-y-4">
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-2">
                                    Référence <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.reference}
                                    onChange={(e) => updateField("reference", e.target.value.toUpperCase())}
                                    placeholder="REF-001"
                                    className="w-full h-11 px-4 bg-white border border-zinc-300 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-zinc-900"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-2">
                                    Marque
                                </label>
                                <input
                                    type="text"
                                    value={formData.marque}
                                    onChange={(e) => updateField("marque", e.target.value)}
                                    placeholder="Bosch, Valeo..."
                                    className="w-full h-11 px-4 bg-white border border-zinc-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-zinc-700 mb-2">
                                Désignation <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.designation}
                                onChange={(e) => updateField("designation", e.target.value)}
                                placeholder="Filtre à huile..."
                                className="w-full h-11 px-4 bg-white border border-zinc-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-zinc-700 mb-2">
                                Catégorie
                            </label>
                            <select
                                value={formData.categorie}
                                onChange={(e) => updateField("categorie", e.target.value)}
                                className="w-full h-11 px-4 bg-white border border-zinc-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
                            >
                                <option value="">Sélectionner...</option>
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Prix */}
                <div className="bg-white rounded-2xl border border-zinc-200 p-6 mb-6">
                    <h2 className="text-[15px] font-semibold text-zinc-900 mb-4 flex items-center gap-2">
                        <Euro className="h-4 w-4 text-zinc-400" />
                        Tarification
                    </h2>

                    <div className="space-y-4">
                        <div className="grid sm:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-2">
                                    Prix d'achat HT
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={formData.prixAchatHT}
                                        onChange={(e) => updateField("prixAchatHT", parseFloat(e.target.value))}
                                        onBlur={calculerPrixVente}
                                        min={0}
                                        step={0.01}
                                        className="w-full h-11 px-4 pr-8 bg-white border border-zinc-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">€</span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-2">
                                    Prix de vente HT
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={formData.prixVenteHT}
                                        onChange={(e) => updateField("prixVenteHT", parseFloat(e.target.value))}
                                        min={0}
                                        step={0.01}
                                        className="w-full h-11 px-4 pr-8 bg-white border border-zinc-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">€</span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-2">
                                    Taux TVA
                                </label>
                                <select
                                    value={formData.tauxTVA}
                                    onChange={(e) => updateField("tauxTVA", parseFloat(e.target.value))}
                                    className="w-full h-11 px-4 bg-white border border-zinc-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
                                >
                                    <option value={20}>20%</option>
                                    <option value={10}>10%</option>
                                    <option value={5.5}>5.5%</option>
                                </select>
                            </div>
                        </div>

                        {/* Marge indicator */}
                        <div className={cn(
                            "p-3 rounded-xl flex items-center justify-between",
                            parseFloat(marge) >= 25 ? "bg-emerald-50" : parseFloat(marge) >= 15 ? "bg-amber-50" : "bg-red-50"
                        )}>
                            <span className="text-sm font-medium text-zinc-700">Marge</span>
                            <span className={cn(
                                "text-lg font-bold",
                                parseFloat(marge) >= 25 ? "text-emerald-600" : parseFloat(marge) >= 15 ? "text-amber-600" : "text-red-600"
                            )}>
                                {marge}%
                            </span>
                        </div>
                    </div>
                </div>

                {/* Stock */}
                <div className="bg-white rounded-2xl border border-zinc-200 p-6 mb-6">
                    <h2 className="text-[15px] font-semibold text-zinc-900 mb-4 flex items-center gap-2">
                        <Package className="h-4 w-4 text-zinc-400" />
                        Stock
                    </h2>

                    <div className="space-y-4">
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-2">
                                    Quantité en stock
                                </label>
                                <input
                                    type="number"
                                    value={formData.quantiteStock}
                                    onChange={(e) => updateField("quantiteStock", parseInt(e.target.value))}
                                    min={0}
                                    className="w-full h-11 px-4 bg-white border border-zinc-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-2 flex items-center gap-1">
                                    <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                                    Seuil d'alerte
                                </label>
                                <input
                                    type="number"
                                    value={formData.seuilAlerte}
                                    onChange={(e) => updateField("seuilAlerte", parseInt(e.target.value))}
                                    min={0}
                                    className="w-full h-11 px-4 bg-white border border-zinc-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
                                />
                                <p className="text-xs text-zinc-500 mt-1">Alerte quand stock ≤ ce seuil</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Emplacement */}
                <div className="bg-white rounded-2xl border border-zinc-200 p-6 mb-6">
                    <h2 className="text-[15px] font-semibold text-zinc-900 mb-4 flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-zinc-400" />
                        Emplacement
                    </h2>

                    <input
                        type="text"
                        value={formData.emplacement}
                        onChange={(e) => updateField("emplacement", e.target.value)}
                        placeholder="Ex: Étagère A3, Tiroir 2..."
                        className="w-full h-11 px-4 bg-white border border-zinc-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
                    />
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3">
                    <Link
                        href="/inventory"
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
                                Créer l'article
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    )
}
