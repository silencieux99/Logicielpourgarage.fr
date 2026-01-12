"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import {
    ArrowLeft,
    Save,
    Loader2,
    Wrench,
    Car,
    User,
    Clock,
    Plus,
    Trash2,
    Search,
    X,
    Timer,
    UserCog
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
    LigneReparation,
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
    { id: "en_attente", label: "En attente" },
    { id: "en_cours", label: "En cours" },
    { id: "termine", label: "Terminé" },
    { id: "facture", label: "Facturé" },
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
            // Charger la réparation
            const repairDoc = await getDoc(doc(db, 'reparations', repairId))
            if (!repairDoc.exists()) {
                router.push('/repairs')
                return
            }

            const repairData = { id: repairDoc.id, ...repairDoc.data() } as Reparation
            setRepair(repairData)

            // Charger le formulaire
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

            // Charger le client
            if (repairData.clientId) {
                const clientDoc = await getDoc(doc(db, 'clients', repairData.clientId))
                if (clientDoc.exists()) {
                    setClient({ id: clientDoc.id, ...clientDoc.data() } as Client)
                }
            }

            // Charger le véhicule
            if (repairData.vehiculeId) {
                const vehiculeDoc = await getDoc(doc(db, 'vehicules', repairData.vehiculeId))
                if (vehiculeDoc.exists()) {
                    setVehicule({ id: vehiculeDoc.id, ...vehiculeDoc.data() } as Vehicule)
                }
            }

            // Charger les lignes
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

            // Charger le personnel actif
            if (garage?.id) {
                const personnelData = await getActivePersonnel(garage.id)
                setPersonnel(personnelData)

                // Charger les articles
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
            quantite: type === "main_oeuvre" ? 1 : 1,
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
            // Calculer les totaux
            const activeLignes = lignes.filter(l => !l.isDeleted)
            const totalHT = activeLignes.reduce((sum, l) => sum + l.quantite * l.prixUnitaireHT, 0)
            const tauxTVA = 20
            const totalTTC = totalHT * (1 + tauxTVA / 100)

            // Mettre à jour la réparation
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

            // Sauvegarder les lignes
            for (const ligne of lignes) {
                if (ligne.isDeleted && !ligne.isNew) {
                    // Supprimer la ligne
                    await deleteDoc(doc(db, 'lignesReparation', ligne.id))
                } else if (ligne.isNew && !ligne.isDeleted) {
                    // Créer nouvelle ligne
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
                    // Mettre à jour ligne existante
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
                <Loader2 className="h-6 w-6 animate-spin text-[var(--text-muted)]" />
            </div>
        )
    }

    if (!repair) {
        return (
            <div className="text-center py-20">
                <p className="text-[var(--text-secondary)]">Réparation introuvable</p>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-24">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link
                    href={`/repairs/${repair.id}`}
                    className="w-10 h-10 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center transition-colors"
                >
                    <ArrowLeft className="h-5 w-5 text-zinc-600" />
                </Link>
                <div className="flex-1">
                    <h1 className="text-xl font-semibold text-[var(--text-primary)] tracking-tight">
                        Modifier {repair.numero}
                    </h1>
                    <p className="text-[13px] text-[var(--text-tertiary)]">
                        {client?.prenom} {client?.nom} • {vehicule?.marque} {vehicule?.modele}
                    </p>
                </div>
            </div>

            {/* Véhicule Info */}
            {vehicule && (
                <div className="flex items-center gap-4 p-4 bg-white rounded-2xl" style={{ boxShadow: 'var(--shadow-sm)' }}>
                    <BrandLogo brand={vehicule.marque} size={32} />
                    <div className="flex-1">
                        <p className="font-medium text-[var(--text-primary)]">
                            {vehicule.marque} {vehicule.modele}
                        </p>
                        <p className="text-[13px] text-[var(--text-tertiary)]">
                            {vehicule.plaque} • {vehicule.kilometrage?.toLocaleString()} km
                        </p>
                    </div>
                </div>
            )}

            {/* Form */}
            <div className="space-y-5">
                {/* Description */}
                <div>
                    <label className="block text-[13px] font-medium text-zinc-500 mb-2">
                        Description
                    </label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-2xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                    />
                </div>

                {/* Mécanicien */}
                <div>
                    <label className="block text-[13px] font-medium text-zinc-500 mb-2">
                        <UserCog className="inline h-3.5 w-3.5 mr-1 opacity-50" />
                        Mécanicien assigné
                    </label>
                    <select
                        value={formData.mecanicienId}
                        onChange={(e) => setFormData({ ...formData, mecanicienId: e.target.value })}
                        className="w-full h-11 px-4 bg-white border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                    >
                        <option value="">Non assigné</option>
                        {personnel.map(p => (
                            <option key={p.id} value={p.id}>
                                {p.prenom} {p.nom} ({p.role})
                            </option>
                        ))}
                    </select>
                </div>

                {/* Statut + Priorité */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-[13px] font-medium text-zinc-500 mb-2">Statut</label>
                        <div className="grid grid-cols-2 gap-2">
                            {statuts.map(s => (
                                <button
                                    key={s.id}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, statut: s.id as Reparation['statut'] })}
                                    className={cn(
                                        "h-10 px-3 text-[12px] font-medium rounded-xl transition-all",
                                        formData.statut === s.id
                                            ? "bg-[var(--accent-primary)] text-white"
                                            : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                                    )}
                                >
                                    {s.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-[13px] font-medium text-zinc-500 mb-2">Priorité</label>
                        <div className="flex gap-2">
                            {priorites.map(p => (
                                <button
                                    key={p.id}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, priorite: p.id as Reparation['priorite'] })}
                                    className={cn(
                                        "flex-1 h-10 px-3 text-[12px] font-medium rounded-xl transition-all",
                                        formData.priorite === p.id
                                            ? "bg-[var(--accent-primary)] text-white"
                                            : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                                    )}
                                >
                                    {p.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-[13px] font-medium text-zinc-500 mb-2">
                            <Clock className="inline h-3.5 w-3.5 mr-1 opacity-50" />
                            Sortie prévue
                        </label>
                        <input
                            type="date"
                            value={formData.dateSortiePrevue}
                            onChange={(e) => setFormData({ ...formData, dateSortiePrevue: e.target.value })}
                            className="w-full h-11 px-4 bg-white border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                        />
                    </div>
                    <div>
                        <label className="block text-[13px] font-medium text-zinc-500 mb-2">
                            <Timer className="inline h-3.5 w-3.5 mr-1 opacity-50" />
                            Temps estimé (h)
                        </label>
                        <input
                            type="number"
                            value={Math.round(formData.tempsEstime / 60 * 10) / 10}
                            onChange={(e) => setFormData({ ...formData, tempsEstime: Math.round(parseFloat(e.target.value || "0") * 60) })}
                            min={0}
                            step={0.5}
                            className="w-full h-11 px-4 bg-white border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                        />
                    </div>
                </div>

                {/* Lignes */}
                <div className="relative">
                    <div className="flex items-center justify-between mb-4">
                        <label className="text-[13px] font-medium text-zinc-500">Lignes d'intervention</label>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => addLigne("main_oeuvre")}
                                className="h-8 px-3 text-xs font-medium text-zinc-600 hover:bg-zinc-100 rounded-lg flex items-center gap-1.5"
                            >
                                <Plus className="h-3.5 w-3.5" />
                                Main d'œuvre
                            </button>
                            <button
                                type="button"
                                onClick={() => addLigne("piece")}
                                className="h-8 px-3 text-xs font-medium text-zinc-600 hover:bg-zinc-100 rounded-lg flex items-center gap-1.5"
                            >
                                <Plus className="h-3.5 w-3.5" />
                                Pièce
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowCatalogPicker(true)}
                                className="h-8 px-3 text-xs font-medium bg-zinc-900 text-white rounded-lg flex items-center gap-1.5"
                            >
                                <Search className="h-3.5 w-3.5" />
                                Catalogue
                            </button>
                        </div>
                    </div>

                    {/* Catalog Picker */}
                    {showCatalogPicker && (
                        <>
                            <div className="fixed inset-0 bg-black/20 z-40" onClick={() => setShowCatalogPicker(false)} />
                            <div className="fixed inset-x-4 inset-y-20 sm:inset-auto sm:absolute sm:top-12 sm:right-0 sm:w-96 bg-white rounded-2xl border border-zinc-200 shadow-2xl z-50 flex flex-col max-h-[70vh] sm:max-h-96 overflow-hidden">
                                <div className="p-4 border-b border-zinc-100">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="text-sm font-semibold text-zinc-900">Catalogue pièces</h3>
                                        <button onClick={() => setShowCatalogPicker(false)} className="p-1.5 hover:bg-zinc-100 rounded-lg">
                                            <X className="h-4 w-4 text-zinc-400" />
                                        </button>
                                    </div>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                                        <input
                                            type="text"
                                            value={catalogSearch}
                                            onChange={(e) => setCatalogSearch(e.target.value)}
                                            placeholder="Rechercher..."
                                            className="w-full h-10 pl-10 pr-4 bg-zinc-50 border-0 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
                                            autoFocus
                                        />
                                    </div>
                                </div>
                                <div className="flex-1 overflow-y-auto">
                                    {filteredArticles.map(article => (
                                        <button
                                            key={article.id}
                                            onClick={() => addFromCatalog(article)}
                                            className="w-full p-4 flex items-center justify-between hover:bg-zinc-50 text-left border-b border-zinc-50 last:border-0"
                                        >
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-zinc-900 truncate">{article.designation}</p>
                                                <p className="text-xs text-zinc-400">{article.reference}</p>
                                            </div>
                                            <div className="text-right ml-4">
                                                <p className="text-sm font-medium text-zinc-900">{article.prixVenteHT.toFixed(2)} €</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    {/* Lignes list */}
                    {activeLignes.length === 0 ? (
                        <div className="py-12 text-center border border-dashed border-zinc-200 rounded-2xl">
                            <p className="text-sm text-zinc-400">Aucune ligne</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {activeLignes.map((ligne) => (
                                <div
                                    key={ligne.id}
                                    className="p-4 bg-zinc-50 rounded-2xl space-y-3 sm:space-y-0"
                                >
                                    {/* Mobile header */}
                                    <div className="flex items-center justify-between sm:hidden mb-2">
                                        <span className={cn(
                                            "text-[11px] font-medium px-2 py-0.5 rounded-full",
                                            ligne.type === "main_oeuvre"
                                                ? "bg-blue-100 text-blue-700"
                                                : "bg-emerald-100 text-emerald-700"
                                        )}>
                                            {ligne.type === "main_oeuvre" ? "Main d'œuvre" : "Pièce"}
                                        </span>
                                        <button
                                            onClick={() => removeLigne(ligne.id)}
                                            className="p-2 text-zinc-400 hover:text-red-500 rounded-lg"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>

                                    {/* Desktop row */}
                                    <div className="hidden sm:flex items-center gap-3">
                                        <div className={cn(
                                            "w-1 h-8 rounded-full flex-shrink-0",
                                            ligne.type === "main_oeuvre" ? "bg-blue-400" : "bg-emerald-400"
                                        )} />
                                        <input
                                            type="text"
                                            value={ligne.designation}
                                            onChange={(e) => updateLigne(ligne.id, "designation", e.target.value)}
                                            className="flex-1 h-9 px-3 bg-white border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-zinc-900"
                                        />
                                        <input
                                            type="number"
                                            value={ligne.quantite}
                                            onChange={(e) => updateLigne(ligne.id, "quantite", parseFloat(e.target.value) || 0)}
                                            className="w-16 h-9 px-2 bg-white border border-zinc-200 rounded-lg text-sm text-center"
                                        />
                                        <div className="relative">
                                            <input
                                                type="number"
                                                value={ligne.prixUnitaireHT}
                                                onChange={(e) => updateLigne(ligne.id, "prixUnitaireHT", parseFloat(e.target.value) || 0)}
                                                className="w-24 h-9 px-3 pr-6 bg-white border border-zinc-200 rounded-lg text-sm text-right"
                                            />
                                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-zinc-400">€</span>
                                        </div>
                                        <button
                                            onClick={() => removeLigne(ligne.id)}
                                            className="p-2 text-zinc-400 hover:text-zinc-600 rounded-lg"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>

                                    {/* Mobile stacked */}
                                    <div className="sm:hidden space-y-3">
                                        <input
                                            type="text"
                                            value={ligne.designation}
                                            onChange={(e) => updateLigne(ligne.id, "designation", e.target.value)}
                                            className="w-full h-11 px-4 bg-white border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
                                        />
                                        <div className="flex gap-3">
                                            <div className="flex-1">
                                                <label className="block text-[11px] font-medium text-zinc-400 mb-1">Qté</label>
                                                <input
                                                    type="number"
                                                    value={ligne.quantite}
                                                    onChange={(e) => updateLigne(ligne.id, "quantite", parseFloat(e.target.value) || 0)}
                                                    className="w-full h-11 px-4 bg-white border border-zinc-200 rounded-xl text-sm text-center"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <label className="block text-[11px] font-medium text-zinc-400 mb-1">Prix HT</label>
                                                <input
                                                    type="number"
                                                    value={ligne.prixUnitaireHT}
                                                    onChange={(e) => updateLigne(ligne.id, "prixUnitaireHT", parseFloat(e.target.value) || 0)}
                                                    className="w-full h-11 px-4 bg-white border border-zinc-200 rounded-xl text-sm text-right"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center pt-2 border-t border-zinc-200">
                                            <span className="text-xs text-zinc-400">Sous-total</span>
                                            <span className="text-sm font-semibold">{(ligne.quantite * ligne.prixUnitaireHT).toFixed(2)} €</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Notes */}
                <div>
                    <label className="block text-[13px] font-medium text-zinc-500 mb-2">Notes internes</label>
                    <textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        rows={2}
                        className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-2xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                        placeholder="Optionnel..."
                    />
                </div>
            </div>

            {/* Bottom bar */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-xl border-t border-zinc-100 z-40">
                <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
                    <div>
                        <p className="text-[13px] text-zinc-500">Total TTC</p>
                        <p className="text-xl font-semibold text-[var(--text-primary)]">{totalTTC.toFixed(2)} €</p>
                    </div>
                    <div className="flex gap-3">
                        <Link
                            href={`/repairs/${repair.id}`}
                            className="h-11 px-6 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-[13px] font-medium rounded-xl flex items-center transition-colors"
                        >
                            Annuler
                        </Link>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="h-11 px-6 bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-white text-[13px] font-medium rounded-xl flex items-center gap-2 transition-colors disabled:opacity-50"
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
        </div>
    )
}
