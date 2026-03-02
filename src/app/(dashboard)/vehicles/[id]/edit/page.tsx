"use client"

import { cn } from "@/lib/utils"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import {
    ArrowLeft,
    Save,
    Loader2,
    Car,
    Search,
    User,
    Camera,
    Upload,
    X,
    CheckCircle,
    AlertCircle,
    AlertTriangle,
    Info,
    Fuel,
    Gauge,
    Calendar,
    Palette,
    ChevronRight
} from "lucide-react"
import { useUpload } from "@/hooks/use-upload"
import { BrandLogo } from "@/components/ui/brand-logo"
import { useAuth } from "@/lib/auth-context"
import { getVehiculeById, updateVehicule, Vehicule } from "@/lib/database"

// Stub useUpload for now if it causes issues, or reuse it if it works.
// For now I'll just reuse the same logic as new/page.tsx but adapted.

// reusing constants
const etatsVehicule = [
    { id: "excellent", label: "Excellent", color: "bg-emerald-50 text-emerald-600 border-emerald-200", icon: CheckCircle },
    { id: "bon", label: "Bon", color: "bg-blue-50 text-blue-600 border-blue-200", icon: Info },
    { id: "moyen", label: "Moyen", color: "bg-amber-50 text-amber-600 border-amber-200", icon: AlertCircle },
    { id: "mauvais", label: "Mauvais", color: "bg-red-50 text-red-600 border-red-200", icon: AlertTriangle },
]

const carburants = ["Essence", "Diesel", "Hybride", "Électrique", "GPL", "Hybride rechargeable"]
const couleurs = ["Blanc", "Noir", "Gris", "Bleu", "Rouge", "Vert", "Beige", "Marron", "Orange", "Jaune"]

export default function EditVehiclePage() {
    const params = useParams()
    const router = useRouter()
    const { garage } = useAuth()
    const vehicleId = params.id as string

    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [isSearching, setIsSearching] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Photos refs for drag and drop
    const fileInputAvantRef = useRef<HTMLInputElement>(null)
    const fileInputApresRef = useRef<HTMLInputElement>(null)

    const {
        uploading,
        uploadFiles,
        removeFile,
        getFilesByType,
        files,
        setFiles // We need to expose this from hook or handle initial load differently
    } = useUpload({
        folder: 'vehicles',
        maxFiles: 20,
        onUploadError: (error) => setError(error)
    })

    const photosAvant = getFilesByType('avant')
    const photosApres = getFilesByType('apres')

    // Form Data
    const [formData, setFormData] = useState({
        plaque: "",
        vin: "",
        marque: "",
        modele: "",
        version: "",
        annee: new Date().getFullYear(),
        couleur: "",
        carburant: "Essence",
        kilometrage: 0,
        clientId: "",
        notes: "",
        etat: "bon",
        etatCarrosserie: "",
        etatInterieur: "",
        etatMecanique: "",
        remarquesEtat: "",
    })

    useEffect(() => {
        if (vehicleId && garage?.id) {
            loadVehicle()
        }
    }, [vehicleId, garage?.id])

    const loadVehicle = async () => {
        try {
            const data = await getVehiculeById(vehicleId)
            if (!data) {
                setError("Véhicule introuvable")
                return
            }
            setFormData({
                plaque: data.plaque,
                vin: data.vin || "",
                marque: data.marque,
                modele: data.modele,
                version: data.version || "",
                annee: data.annee || new Date().getFullYear(),
                couleur: data.couleur || "",
                carburant: data.carburant,
                kilometrage: data.kilometrage,
                clientId: data.clientId,
                notes: data.notes || "",
                etat: data.etat || "bon",
                etatCarrosserie: data.etatCarrosserie || "",
                etatInterieur: data.etatInterieur || "",
                etatMecanique: data.etatMecanique || "",
                remarquesEtat: data.remarquesEtat || "",
            })
        } catch (error) {
            console.error("Erreur chargement:", error)
            setError("Erreur lors du chargement du véhicule")
        } finally {
            setIsLoading(false)
        }
    }

    const updateField = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const searchByPlaque = async () => {
        if (!formData.plaque) return

        setIsSearching(true)
        try {
            // Simulation d'une recherche API
            await new Promise(resolve => setTimeout(resolve, 1500))

            // Exemple de données simulées
            if (formData.plaque === "AA-123-BB") {
                setFormData(prev => ({
                    ...prev,
                    marque: "Renault",
                    modele: "Clio 4",
                    version: "1.5 dCi 90ch Zen",
                    annee: 2018,
                    carburant: "Diesel",
                    vin: "VF1R123456789",
                }))
            }
        } catch (error) {
            console.error("Erreur recherche:", error)
        } finally {
            setIsSearching(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const canSubmit = formData.plaque && formData.marque && formData.modele
        if (!canSubmit) return

        setIsSaving(true)
        setError(null)

        try {
            const photosAvantUrls = files.filter(f => f.type === 'avant' && f.url).map(f => ({ url: f.url }))
            const photosApresUrls = files.filter(f => f.type === 'apres' && f.url).map(f => ({ url: f.url }))

            const vehicleData: Partial<Vehicule> = {
                plaque: formData.plaque.toUpperCase(),
                vin: formData.vin || undefined,
                marque: formData.marque,
                modele: formData.modele,
                version: formData.version || undefined,
                annee: formData.annee,
                couleur: formData.couleur || undefined,
                carburant: formData.carburant,
                kilometrage: formData.kilometrage,
                notes: formData.notes || undefined,
                etat: formData.etat || undefined,
                etatCarrosserie: formData.etatCarrosserie || undefined,
                etatInterieur: formData.etatInterieur || undefined,
                etatMecanique: formData.etatMecanique || undefined,
                remarquesEtat: formData.remarquesEtat || undefined,
                photosAvant: photosAvantUrls,
                photosApres: photosApresUrls,
            }

            await updateVehicule(vehicleId, vehicleData)
            router.push(`/vehicles/${vehicleId}`)
        } catch (error) {
            console.error("Erreur lors de la modification:", error)
            setError("Une erreur est survenue lors de la modification")
        } finally {
            setIsSaving(false)
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-6 w-6 animate-spin text-[var(--text-muted)]" />
            </div>
        )
    }

    const canSubmit = formData.plaque && formData.marque && formData.modele

    return (
        <div className="space-y-4 sm:space-y-6 pb-24 sm:pb-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <Link href={`/vehicles/${vehicleId}`} className="p-2 -ml-2 hover:bg-zinc-100 rounded-lg transition-colors">
                    <ArrowLeft className="h-5 w-5 text-zinc-500" />
                </Link>
                <div>
                    <h1 className="text-lg sm:text-xl font-semibold text-zinc-900">Modifier le véhicule</h1>
                    <p className="text-xs sm:text-sm text-zinc-500">{formData.marque} {formData.modele}</p>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm font-medium text-red-800">{error}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="max-w-2xl space-y-4 sm:space-y-5">
                {/* Identification */}
                <section className="bg-white rounded-xl sm:rounded-2xl border border-zinc-100 sm:border-zinc-200 p-4 sm:p-5">
                    <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                        <Car className="h-3.5 w-3.5" />
                        Identification
                    </h2>

                    <div className="space-y-3">
                        <div>
                            <label className="text-xs font-medium text-zinc-600 mb-1.5 block">
                                Plaque d'immatriculation <span className="text-red-400">*</span>
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={formData.plaque}
                                    onChange={(e) => updateField("plaque", e.target.value.toUpperCase())}
                                    placeholder="AA-123-BB"
                                    className="flex-1 h-11 px-3 bg-zinc-50 border border-zinc-200 rounded-lg text-base sm:text-sm font-mono text-center uppercase focus:outline-none focus:ring-1 focus:ring-zinc-400 focus:bg-white"
                                />
                                <button
                                    type="button"
                                    onClick={searchByPlaque}
                                    disabled={isSearching || !formData.plaque}
                                    className="h-11 px-3 sm:px-4 bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-200 text-white rounded-lg flex items-center gap-2 transition-colors"
                                >
                                    {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                                    <span className="hidden sm:inline text-sm">Autofill</span>
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="relative">
                                <label className="text-xs font-medium text-zinc-600 mb-1.5 block">
                                    Marque <span className="text-red-400">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={formData.marque}
                                        onChange={(e) => updateField("marque", e.target.value)}
                                        placeholder="Renault"
                                        className="w-full h-10 px-3 bg-white border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400 pl-11"
                                    />
                                    {formData.marque && (
                                        <div className="absolute left-2.5 top-1/2 -translate-y-1/2">
                                            <BrandLogo brand={formData.marque} size={24} />
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-zinc-600 mb-1.5 block">
                                    Modèle <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.modele}
                                    onChange={(e) => updateField("modele", e.target.value)}
                                    placeholder="Clio"
                                    className="w-full h-10 px-3 bg-white border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-medium text-zinc-600 mb-1.5 block">Version</label>
                            <input
                                type="text"
                                value={formData.version}
                                onChange={(e) => updateField("version", e.target.value)}
                                placeholder="1.5 dCi 90ch Zen"
                                className="w-full h-10 px-3 bg-white border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-medium text-zinc-600 mb-1.5 block">VIN</label>
                            <input
                                type="text"
                                value={formData.vin}
                                onChange={(e) => updateField("vin", e.target.value.toUpperCase())}
                                placeholder="VF1XXXXXX00000000"
                                maxLength={17}
                                className="w-full h-10 px-3 bg-white border border-zinc-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-1 focus:ring-zinc-400"
                            />
                        </div>
                    </div>
                </section>

                {/* Caractéristiques */}
                <section className="bg-white rounded-xl sm:rounded-2xl border border-zinc-100 sm:border-zinc-200 p-4 sm:p-5">
                    <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-3">Caractéristiques</h2>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs font-medium text-zinc-600 mb-1.5 flex items-center gap-1">
                                <Calendar className="h-3 w-3 text-zinc-400" />
                                Année
                            </label>
                            <input
                                type="number"
                                value={formData.annee}
                                onChange={(e) => updateField("annee", parseInt(e.target.value))}
                                min={1900}
                                max={new Date().getFullYear() + 1}
                                className="w-full h-10 px-3 bg-white border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-zinc-600 mb-1.5 flex items-center gap-1">
                                <Gauge className="h-3 w-3 text-zinc-400" />
                                Kilométrage
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={formData.kilometrage}
                                    onChange={(e) => updateField("kilometrage", parseInt(e.target.value))}
                                    min={0}
                                    className="w-full h-10 px-3 pr-10 bg-white border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400">km</span>
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-zinc-600 mb-1.5 flex items-center gap-1">
                                <Fuel className="h-3 w-3 text-zinc-400" />
                                Carburant
                            </label>
                            <select
                                value={formData.carburant}
                                onChange={(e) => updateField("carburant", e.target.value)}
                                className="w-full h-10 px-3 bg-white border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400"
                            >
                                {carburants.map(c => <option key={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-zinc-600 mb-1.5 flex items-center gap-1">
                                <Palette className="h-3 w-3 text-zinc-400" />
                                Couleur
                            </label>
                            <select
                                value={formData.couleur}
                                onChange={(e) => updateField("couleur", e.target.value)}
                                className="w-full h-10 px-3 bg-white border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400"
                            >
                                <option value="">Sélectionner</option>
                                {couleurs.map(c => <option key={c}>{c}</option>)}
                            </select>
                        </div>
                    </div>
                </section>

                {/* Photos */}
                <section className="bg-white rounded-xl sm:rounded-2xl border border-zinc-100 sm:border-zinc-200 p-4 sm:p-5">
                    <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                        <Camera className="h-3.5 w-3.5" />
                        Photos
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Photos Avant */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-medium text-zinc-600">Avant travaux</label>
                                <button
                                    type="button"
                                    onClick={() => fileInputAvantRef.current?.click()}
                                    disabled={uploading}
                                    className="text-[10px] font-medium text-zinc-500 hover:text-zinc-900 flex items-center gap-1 transition-colors"
                                >
                                    <Upload className="h-3 w-3" />
                                    Ajouter
                                </button>
                                <input
                                    ref={fileInputAvantRef}
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => e.target.files && uploadFiles(e.target.files, 'avant')}
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                                {photosAvant.map((file) => (
                                    <div key={file.id} className="group relative aspect-square bg-zinc-50 rounded-lg overflow-hidden border border-zinc-200">
                                        <img
                                            src={file.preview || file.url}
                                            alt="Avant"
                                            className="w-full h-full object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeFile(file.id)}
                                            className="absolute top-1 right-1 p-1 bg-white/90 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-zinc-500 hover:text-red-500"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                        {file.uploading && (
                                            <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
                                                <Loader2 className="h-4 w-4 animate-spin text-zinc-900" />
                                            </div>
                                        )}
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => fileInputAvantRef.current?.click()}
                                    disabled={uploading}
                                    className="aspect-square bg-zinc-50 hover:bg-zinc-100 border border-dashed border-zinc-300 rounded-lg flex flex-col items-center justify-center gap-1 transition-colors"
                                >
                                    <Camera className="h-4 w-4 text-zinc-400" />
                                </button>
                            </div>
                        </div>

                        {/* Photos Après */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-medium text-zinc-600">Après travaux</label>
                                <button
                                    type="button"
                                    onClick={() => fileInputApresRef.current?.click()}
                                    disabled={uploading}
                                    className="text-[10px] font-medium text-zinc-500 hover:text-zinc-900 flex items-center gap-1 transition-colors"
                                >
                                    <Upload className="h-3 w-3" />
                                    Ajouter
                                </button>
                                <input
                                    ref={fileInputApresRef}
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => e.target.files && uploadFiles(e.target.files, 'apres')}
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                                {photosApres.map((file) => (
                                    <div key={file.id} className="group relative aspect-square bg-zinc-50 rounded-lg overflow-hidden border border-zinc-200">
                                        <img
                                            src={file.preview || file.url}
                                            alt="Après"
                                            className="w-full h-full object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeFile(file.id)}
                                            className="absolute top-1 right-1 p-1 bg-white/90 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-zinc-500 hover:text-red-500"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                        {file.uploading && (
                                            <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
                                                <Loader2 className="h-4 w-4 animate-spin text-zinc-900" />
                                            </div>
                                        )}
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => fileInputApresRef.current?.click()}
                                    disabled={uploading}
                                    className="aspect-square bg-zinc-50 hover:bg-zinc-100 border border-dashed border-zinc-300 rounded-lg flex flex-col items-center justify-center gap-1 transition-colors"
                                >
                                    <Camera className="h-4 w-4 text-zinc-400" />
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* État */}
                <section className="bg-white rounded-xl sm:rounded-2xl border border-zinc-100 sm:border-zinc-200 p-4 sm:p-5">
                    <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-3">État du véhicule</h2>

                    <div className="grid grid-cols-4 gap-2 mb-3">
                        {etatsVehicule.map(etat => {
                            const Icon = etat.icon
                            const isActive = formData.etat === etat.id
                            return (
                                <button
                                    key={etat.id}
                                    type="button"
                                    onClick={() => updateField("etat", etat.id)}
                                    className={cn(
                                        "p-2 sm:p-3 rounded-lg border text-center transition-all",
                                        isActive ? `${etat.color} border-current` : "border-zinc-100 bg-zinc-50 hover:bg-zinc-100"
                                    )}
                                >
                                    <Icon className={cn("h-4 w-4 mx-auto mb-0.5", isActive ? "" : "text-zinc-400")} />
                                    <span className={cn("text-xs font-medium", isActive ? "" : "text-zinc-600")}>{etat.label}</span>
                                </button>
                            )
                        })}
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-3 border-t border-zinc-100">
                        <div>
                            <label className="text-[10px] text-zinc-500 mb-1 block">Carrosserie</label>
                            <select
                                value={formData.etatCarrosserie}
                                onChange={(e) => updateField("etatCarrosserie", e.target.value)}
                                className="w-full h-9 px-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs"
                            >
                                <option value="">—</option>
                                <option value="impeccable">Impeccable</option>
                                <option value="quelques_rayures">Rayures</option>
                                <option value="bosses_rayures">Bosses</option>
                                <option value="rouille">Rouille</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] text-zinc-500 mb-1 block">Intérieur</label>
                            <select
                                value={formData.etatInterieur}
                                onChange={(e) => updateField("etatInterieur", e.target.value)}
                                className="w-full h-9 px-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs"
                            >
                                <option value="">—</option>
                                <option value="impeccable">Impeccable</option>
                                <option value="usure_normale">Usure</option>
                                <option value="taches">Taches</option>
                                <option value="dechirures">Déchirures</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] text-zinc-500 mb-1 block">Mécanique</label>
                            <select
                                value={formData.etatMecanique}
                                onChange={(e) => updateField("etatMecanique", e.target.value)}
                                className="w-full h-9 px-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs"
                            >
                                <option value="">—</option>
                                <option value="parfait">Parfait</option>
                                <option value="bon">Bon</option>
                                <option value="travaux_legers">À revoir</option>
                                <option value="travaux_importants">Importants</option>
                            </select>
                        </div>
                    </div>

                    <textarea
                        value={formData.remarquesEtat}
                        onChange={(e) => updateField("remarquesEtat", e.target.value)}
                        placeholder="Remarques sur l'état..."
                        rows={2}
                        className="w-full mt-3 px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-1 focus:ring-zinc-400 focus:bg-white"
                    />
                </section>

                {/* Notes */}
                <section className="bg-white rounded-xl sm:rounded-2xl border border-zinc-100 sm:border-zinc-200 p-4 sm:p-5">
                    <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-3">Notes</h2>
                    <textarea
                        value={formData.notes}
                        onChange={(e) => updateField("notes", e.target.value)}
                        placeholder="Notes internes..."
                        rows={2}
                        className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-1 focus:ring-zinc-400 focus:bg-white"
                    />
                </section>

                {/* Fixed bottom actions (mobile) */}
                <div className="fixed bottom-0 left-0 right-0 p-3 bg-white border-t border-zinc-100 flex gap-2 sm:hidden safe-area-bottom">
                    <Link href={`/vehicles/${vehicleId}`} className="flex-1 h-11 flex items-center justify-center text-zinc-600 text-sm font-medium rounded-lg bg-zinc-100">
                        Annuler
                    </Link>
                    <button
                        type="submit"
                        disabled={!canSubmit || isSaving}
                        className="flex-1 h-11 bg-zinc-900 disabled:bg-zinc-300 text-white text-sm font-semibold rounded-lg flex items-center justify-center gap-2"
                    >
                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        Enregistrer
                    </button>
                </div>

                {/* Desktop actions */}
                <div className="hidden sm:flex items-center justify-end gap-3">
                    <Link href={`/vehicles/${vehicleId}`} className="h-10 px-5 text-zinc-600 text-sm font-medium rounded-lg hover:bg-zinc-100 flex items-center">
                        Annuler
                    </Link>
                    <button
                        type="submit"
                        disabled={!canSubmit || isSaving}
                        className="h-10 px-5 bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-300 text-white text-sm font-semibold rounded-lg flex items-center gap-2 transition-colors"
                    >
                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        Enregistrer
                    </button>
                </div>
            </form>
        </div>
    )
}
