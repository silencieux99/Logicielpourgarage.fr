"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import {
    ArrowLeft,
    Save,
    Loader2,
    Plus,
    Trash2,
    Search,
    X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"
import {
    updateReparation,
    getArticles,
    getActivePersonnel,
    Client,
    Vehicule,
    Reparation,
    Article,
    Personnel
} from "@/lib/database"
import {
    doc,
    getDoc,
    collection,
    query,
    where,
    getDocs,
    Timestamp,
    addDoc,
    deleteDoc,
    updateDoc
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import { BrandLogo } from "@/components/ui/brand-logo"

const priorites = [
    { id: "normal", label: "Normal" },
    { id: "prioritaire", label: "Prioritaire" },
    { id: "urgent", label: "Urgent" },
]

const statuts = [
    { id: "en_attente", label: "Attente", short: "Attente" },
    { id: "en_cours", label: "En cours", short: "Cours" },
    { id: "termine", label: "Terminé", short: "Fini" },
    { id: "facture", label: "Facturé", short: "Facturé" },
]

interface LigneForm {
    id: string
    type: "main_oeuvre" | "piece"
    designation: string
    quantite: number
    prixUnitaireHT: number
    isNew?: boolean
    isDeleted?: boolean
}

export default function RepairEditPage() {
    const { id } = useParams()
    const router = useRouter()
    const { garage } = useAuth()

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [repair, setRepair] = useState<Reparation | null>(null)
    const [client, setClient] = useState<Client | null>(null)
    const [vehicule, setVehicule] = useState<Vehicule | null>(null)
    const [lignes, setLignes] = useState<LigneForm[]>([])
    const [personnel, setPersonnel] = useState<Personnel[]>([])
    const [articles, setArticles] = useState<Article[]>([])
    const [showCatalogPicker, setShowCatalogPicker] = useState(false)
    const [catalogSearch, setCatalogSearch] = useState("")

    const [formData, setFormData] = useState({
        description: "",
        priorite: "normal" as Reparation['priorite'],
        statut: "en_attente" as Reparation['statut'],
        mecanicienId: "",
        dateSortiePrevue: "",
        tempsEstime: 0,
        notes: ""
    })

    useEffect(() => {
        if (id && typeof id === 'string' && garage?.id) {
            loadData(id)
        }
    }, [id, garage?.id])

    const loadData = async (repairId: string) => {
        setLoading(true)
        try {
            const repairDoc = await getDoc(doc(db, 'reparations', repairId))
            if (!repairDoc.exists()) {
                router.push('/repairs')
                return
            }

            const repairData = { id: repairDoc.id, ...repairDoc.data() } as Reparation
            setRepair(repairData)

            setFormData({
                description: repairData.description || "",
                priorite: repairData.priorite,
                statut: repairData.statut,
                mecanicienId: repairData.mecanicienId || "",
                dateSortiePrevue: repairData.dateSortiePrevue
                    ? new Date(repairData.dateSortiePrevue.toMillis()).toISOString().split('T')[0]
                    : "",
                tempsEstime: repairData.tempsEstime || 0,
                notes: repairData.notes || ""
            })

            if (repairData.clientId) {
                const clientDoc = await getDoc(doc(db, 'clients', repairData.clientId))
                if (clientDoc.exists()) {
                    setClient({ id: clientDoc.id, ...clientDoc.data() } as Client)
                }
            }

            if (repairData.vehiculeId) {
                const vehiculeDoc = await getDoc(doc(db, 'vehicules', repairData.vehiculeId))
                if (vehiculeDoc.exists()) {
                    setVehicule({ id: vehiculeDoc.id, ...vehiculeDoc.data() } as Vehicule)
                }
            }

            const lignesQuery = query(
                collection(db, 'lignesReparation'),
                where('reparationId', '==', repairId)
            )
            const lignesSnapshot = await getDocs(lignesQuery)
            const lignesData = lignesSnapshot.docs.map(d => ({
                id: d.id,
                ...d.data(),
                isNew: false,
                isDeleted: false
            })) as LigneForm[]
            setLignes(lignesData)

            if (garage?.id) {
                const personnelData = await getActivePersonnel(garage.id)
                setPersonnel(personnelData)
                const articlesData = await getArticles(garage.id)
                setArticles(articlesData)
            }

        } catch (error) {
            console.error("Erreur chargement:", error)
        } finally {
            setLoading(false)
        }
    }

    const addLigne = (type: "main_oeuvre" | "piece") => {
        setLignes([...lignes, {
            id: `new-${Date.now()}`,
            type,
            designation: "",
            quantite: 1,
            prixUnitaireHT: type === "main_oeuvre" ? 55 : 0,
            isNew: true
        }])
    }

    const addFromCatalog = (article: Article) => {
        setLignes([...lignes, {
            id: `new-${Date.now()}`,
            type: "piece",
            designation: article.designation,
            quantite: 1,
            prixUnitaireHT: article.prixVenteHT,
            isNew: true
        }])
        setShowCatalogPicker(false)
        setCatalogSearch("")
    }

    const updateLigne = (id: string, field: keyof LigneForm, value: unknown) => {
        setLignes(lignes.map(l => l.id === id ? { ...l, [field]: value } : l))
    }

    const removeLigne = (id: string) => {
        const ligne = lignes.find(l => l.id === id)
        if (ligne?.isNew) {
            setLignes(lignes.filter(l => l.id !== id))
        } else {
            setLignes(lignes.map(l => l.id === id ? { ...l, isDeleted: true } : l))
        }
    }

    const handleSave = async () => {
        if (!repair?.id) return
        setSaving(true)

        try {
            const activeLignes = lignes.filter(l => !l.isDeleted)
            const totalHT = activeLignes.reduce((sum, l) => sum + l.quantite * l.prixUnitaireHT, 0)
            const totalTTC = totalHT * 1.2

            await updateReparation(repair.id, {
                description: formData.description,
                priorite: formData.priorite,
                statut: formData.statut,
                mecanicienId: formData.mecanicienId || undefined,
                dateSortiePrevue: formData.dateSortiePrevue
                    ? Timestamp.fromDate(new Date(formData.dateSortiePrevue))
                    : undefined,
                tempsEstime: formData.tempsEstime,
                notes: formData.notes || undefined,
                montantHT: totalHT,
                montantTTC: totalTTC
            })

            for (const ligne of lignes) {
                if (ligne.isDeleted && !ligne.isNew) {
                    await deleteDoc(doc(db, 'lignesReparation', ligne.id))
                } else if (ligne.isNew && !ligne.isDeleted) {
                    await addDoc(collection(db, 'lignesReparation'), {
                        reparationId: repair.id,
                        type: ligne.type,
                        designation: ligne.designation,
                        quantite: ligne.quantite,
                        prixUnitaireHT: ligne.prixUnitaireHT,
                        tauxTVA: 20,
                        montantHT: ligne.quantite * ligne.prixUnitaireHT
                    })
                } else if (!ligne.isNew && !ligne.isDeleted) {
                    await updateDoc(doc(db, 'lignesReparation', ligne.id), {
                        designation: ligne.designation,
                        quantite: ligne.quantite,
                        prixUnitaireHT: ligne.prixUnitaireHT,
                        montantHT: ligne.quantite * ligne.prixUnitaireHT
                    })
                }
            }

            router.push(`/repairs/${repair.id}`)
        } catch (error) {
            console.error("Erreur sauvegarde:", error)
        } finally {
            setSaving(false)
        }
    }

    const filteredArticles = articles.filter(a =>
        a.designation.toLowerCase().includes(catalogSearch.toLowerCase()) ||
        a.reference.toLowerCase().includes(catalogSearch.toLowerCase())
    )

    const activeLignes = lignes.filter(l => !l.isDeleted)
    const totalHT = activeLignes.reduce((sum, l) => sum + l.quantite * l.prixUnitaireHT, 0)
    const totalTTC = totalHT * 1.2

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
            </div>
        )
    }

    if (!repair) {
        return (
            <div className="text-center py-20">
                <p className="text-zinc-500">Réparation introuvable</p>
            </div>
        )
    }

    return (
        <div className="pb-28">
            {/* Header compact */}
            <div className="flex items-center gap-3 mb-6">
                <Link
                    href={`/repairs/${repair.id}`}
                    className="w-9 h-9 rounded-full bg-zinc-100 flex items-center justify-center"
                >
                    <ArrowLeft className="h-4 w-4 text-zinc-600" />
                </Link>
                <div className="flex-1 min-w-0">
                    <h1 className="text-lg font-semibold text-zinc-900 truncate">
                        {repair.numero}
                    </h1>
                    <p className="text-xs text-zinc-500 truncate">
                        {vehicule?.marque} {vehicule?.modele} • {vehicule?.plaque}
                    </p>
                </div>
            </div>

            {/* Véhicule card - sans bordures */}
            {vehicule && (
                <div className="flex items-center gap-3 p-4 bg-zinc-50 rounded-2xl mb-6">
                    <BrandLogo brand={vehicule.marque} size={36} />
                    <div className="flex-1 min-w-0">
                        <p className="font-medium text-zinc-900 text-[15px]">
                            {vehicule.marque} {vehicule.modele}
                        </p>
                        <p className="text-xs text-zinc-500">
                            {client?.prenom} {client?.nom}
                        </p>
                    </div>
                </div>
            )}

            {/* Form - sans cadres */}
            <div className="space-y-6">
                {/* Description */}
                <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-2">Description</label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={2}
                        className="w-full px-4 py-3 bg-zinc-50 rounded-2xl text-sm resize-none focus:outline-none focus:bg-zinc-100 transition-colors"
                        placeholder="Description des travaux..."
                    />
                </div>

                {/* Mécanicien */}
                {personnel.length > 0 && (
                    <div>
                        <label className="block text-xs font-medium text-zinc-400 mb-2">Mécanicien</label>
                        <select
                            value={formData.mecanicienId}
                            onChange={(e) => setFormData({ ...formData, mecanicienId: e.target.value })}
                            className="w-full h-12 px-4 bg-zinc-50 rounded-2xl text-sm focus:outline-none focus:bg-zinc-100 transition-colors appearance-none"
                        >
                            <option value="">Non assigné</option>
                            {personnel.map(p => (
                                <option key={p.id} value={p.id}>
                                    {p.prenom} {p.nom}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Statut - pills horizontaux */}
                <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-2">Statut</label>
                    <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
                        {statuts.map(s => (
                            <button
                                key={s.id}
                                type="button"
                                onClick={() => setFormData({ ...formData, statut: s.id as Reparation['statut'] })}
                                className={cn(
                                    "h-10 px-4 text-[13px] font-medium rounded-full whitespace-nowrap transition-all",
                                    formData.statut === s.id
                                        ? "bg-[var(--accent-primary)] text-white"
                                        : "bg-zinc-100 text-zinc-600"
                                )}
                            >
                                {s.short}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Priorité - pills horizontaux */}
                <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-2">Priorité</label>
                    <div className="flex gap-2">
                        {priorites.map(p => (
                            <button
                                key={p.id}
                                type="button"
                                onClick={() => setFormData({ ...formData, priorite: p.id as Reparation['priorite'] })}
                                className={cn(
                                    "flex-1 h-10 text-[13px] font-medium rounded-full transition-all",
                                    formData.priorite === p.id
                                        ? p.id === "urgent" ? "bg-red-500 text-white"
                                            : p.id === "prioritaire" ? "bg-amber-500 text-white"
                                                : "bg-zinc-900 text-white"
                                        : "bg-zinc-100 text-zinc-600"
                                )}
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Date + Temps - empilés sur mobile */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-medium text-zinc-400 mb-2">Sortie prévue</label>
                        <input
                            type="date"
                            value={formData.dateSortiePrevue}
                            onChange={(e) => setFormData({ ...formData, dateSortiePrevue: e.target.value })}
                            className="w-full h-12 px-4 bg-zinc-50 rounded-2xl text-sm focus:outline-none focus:bg-zinc-100 transition-colors"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-zinc-400 mb-2">Temps estimé (h)</label>
                        <input
                            type="number"
                            value={Math.round(formData.tempsEstime / 60 * 10) / 10}
                            onChange={(e) => setFormData({ ...formData, tempsEstime: Math.round(parseFloat(e.target.value || "0") * 60) })}
                            min={0}
                            step={0.5}
                            className="w-full h-12 px-4 bg-zinc-50 rounded-2xl text-sm focus:outline-none focus:bg-zinc-100 transition-colors"
                        />
                    </div>
                </div>

                {/* Lignes d'intervention */}
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <label className="text-xs font-medium text-zinc-400">Lignes</label>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => addLigne("main_oeuvre")}
                                className="h-8 px-3 text-xs font-medium bg-blue-50 text-blue-600 rounded-full"
                            >
                                + MO
                            </button>
                            <button
                                type="button"
                                onClick={() => addLigne("piece")}
                                className="h-8 px-3 text-xs font-medium bg-emerald-50 text-emerald-600 rounded-full"
                            >
                                + Pièce
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowCatalogPicker(true)}
                                className="h-8 px-3 text-xs font-medium bg-zinc-900 text-white rounded-full flex items-center gap-1"
                            >
                                <Search className="h-3 w-3" />
                                Stock
                            </button>
                        </div>
                    </div>

                    {/* Catalog Picker - modal plein écran mobile */}
                    {showCatalogPicker && (
                        <>
                            <div className="fixed inset-0 bg-black/30 z-40" onClick={() => setShowCatalogPicker(false)} />
                            <div className="fixed inset-0 sm:inset-auto sm:absolute sm:top-0 sm:right-0 sm:w-96 sm:max-h-96 bg-white sm:rounded-2xl z-50 flex flex-col overflow-hidden">
                                <div className="p-4 bg-zinc-50">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="text-sm font-semibold text-zinc-900">Catalogue</h3>
                                        <button onClick={() => setShowCatalogPicker(false)} className="p-2 -mr-2">
                                            <X className="h-5 w-5 text-zinc-400" />
                                        </button>
                                    </div>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                                        <input
                                            type="text"
                                            value={catalogSearch}
                                            onChange={(e) => setCatalogSearch(e.target.value)}
                                            placeholder="Rechercher..."
                                            className="w-full h-11 pl-10 pr-4 bg-white rounded-xl text-sm focus:outline-none"
                                            autoFocus
                                        />
                                    </div>
                                </div>
                                <div className="flex-1 overflow-y-auto">
                                    {filteredArticles.map(article => (
                                        <button
                                            key={article.id}
                                            onClick={() => addFromCatalog(article)}
                                            className="w-full p-4 flex items-center justify-between active:bg-zinc-50 text-left"
                                        >
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-zinc-900 truncate">{article.designation}</p>
                                                <p className="text-xs text-zinc-400">{article.reference}</p>
                                            </div>
                                            <p className="text-sm font-semibold text-zinc-900 ml-3">{article.prixVenteHT.toFixed(0)} €</p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    {/* Lignes list - sans bordures */}
                    {activeLignes.length === 0 ? (
                        <div className="py-10 text-center bg-zinc-50 rounded-2xl">
                            <p className="text-sm text-zinc-400">Aucune ligne</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {activeLignes.map((ligne) => (
                                <div
                                    key={ligne.id}
                                    className="p-4 bg-zinc-50 rounded-2xl"
                                >
                                    {/* Type badge + delete */}
                                    <div className="flex items-center justify-between mb-3">
                                        <span className={cn(
                                            "text-[11px] font-semibold px-2 py-1 rounded-full",
                                            ligne.type === "main_oeuvre"
                                                ? "bg-blue-100 text-blue-600"
                                                : "bg-emerald-100 text-emerald-600"
                                        )}>
                                            {ligne.type === "main_oeuvre" ? "Main d'œuvre" : "Pièce"}
                                        </span>
                                        <button
                                            onClick={() => removeLigne(ligne.id)}
                                            className="p-2 -mr-2 text-zinc-400 active:text-red-500"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>

                                    {/* Designation */}
                                    <input
                                        type="text"
                                        value={ligne.designation}
                                        onChange={(e) => updateLigne(ligne.id, "designation", e.target.value)}
                                        className="w-full h-11 px-4 bg-white rounded-xl text-sm mb-3 focus:outline-none"
                                        placeholder="Désignation..."
                                    />

                                    {/* Qty + Price */}
                                    <div className="flex gap-3">
                                        <div className="w-24">
                                            <label className="block text-[10px] font-medium text-zinc-400 mb-1">Qté</label>
                                            <input
                                                type="number"
                                                value={ligne.quantite}
                                                onChange={(e) => updateLigne(ligne.id, "quantite", parseFloat(e.target.value) || 0)}
                                                className="w-full h-11 px-3 bg-white rounded-xl text-sm text-center focus:outline-none"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <label className="block text-[10px] font-medium text-zinc-400 mb-1">Prix HT</label>
                                            <input
                                                type="number"
                                                value={ligne.prixUnitaireHT}
                                                onChange={(e) => updateLigne(ligne.id, "prixUnitaireHT", parseFloat(e.target.value) || 0)}
                                                className="w-full h-11 px-3 bg-white rounded-xl text-sm text-right focus:outline-none"
                                            />
                                        </div>
                                        <div className="w-24 flex flex-col justify-end">
                                            <label className="block text-[10px] font-medium text-zinc-400 mb-1">Total</label>
                                            <div className="h-11 px-3 bg-zinc-100 rounded-xl flex items-center justify-end">
                                                <span className="text-sm font-semibold text-zinc-900">
                                                    {(ligne.quantite * ligne.prixUnitaireHT).toFixed(0)} €
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Notes */}
                <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-2">Notes</label>
                    <textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        rows={2}
                        className="w-full px-4 py-3 bg-zinc-50 rounded-2xl text-sm resize-none focus:outline-none focus:bg-zinc-100 transition-colors"
                        placeholder="Notes internes..."
                    />
                </div>
            </div>

            {/* Bottom bar fixe - sans bordure */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-xl z-40">
                <div className="max-w-4xl mx-auto flex items-center gap-4">
                    <div className="flex-1">
                        <p className="text-xs text-zinc-400">Total TTC</p>
                        <p className="text-xl font-bold text-zinc-900">{totalTTC.toFixed(0)} €</p>
                    </div>
                    <Link
                        href={`/repairs/${repair.id}`}
                        className="h-12 px-5 bg-zinc-100 text-zinc-700 text-sm font-medium rounded-full flex items-center"
                    >
                        Annuler
                    </Link>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="h-12 px-6 bg-[var(--accent-primary)] text-white text-sm font-semibold rounded-full flex items-center gap-2 disabled:opacity-50"
                    >
                        {saving ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <>
                                <Save className="h-4 w-4" />
                                Enregistrer
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}
