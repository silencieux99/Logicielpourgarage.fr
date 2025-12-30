"use client"

import { useState, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
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
    Palette
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useUpload } from "@/hooks/use-upload"
import { BrandLogo } from "@/components/ui/brand-logo"

const etatsVehicule = [
    { id: "excellent", label: "Excellent", color: "bg-emerald-50 text-emerald-600 border-emerald-200", icon: CheckCircle },
    { id: "bon", label: "Bon", color: "bg-blue-50 text-blue-600 border-blue-200", icon: Info },
    { id: "moyen", label: "Moyen", color: "bg-amber-50 text-amber-600 border-amber-200", icon: AlertCircle },
    { id: "mauvais", label: "Mauvais", color: "bg-red-50 text-red-600 border-red-200", icon: AlertTriangle },
]

const carburants = ["Essence", "Diesel", "Hybride", "Électrique", "GPL", "Hybride rechargeable"]
const couleurs = ["Blanc", "Noir", "Gris", "Bleu", "Rouge", "Vert", "Beige", "Marron", "Orange", "Jaune"]

export default function NewVehiclePage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [isSearching, setIsSearching] = useState(false)

    const fileInputAvantRef = useRef<HTMLInputElement>(null)
    const fileInputApresRef = useRef<HTMLInputElement>(null)

    const {
        uploading,
        uploadFiles,
        removeFile,
        getFilesByType
    } = useUpload({
        folder: 'vehicles',
        maxFiles: 20,
        onUploadError: (error) => console.error('Upload error:', error)
    })

    const photosAvant = getFilesByType('avant')
    const photosApres = getFilesByType('apres')

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

    const updateField = (field: string, value: string | number) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const mapFuelType = (apiFuel: string | undefined): string => {
        if (!apiFuel) return ''
        const fuelMap: Record<string, string> = {
            'Diesel': 'Diesel',
            'Essence': 'Essence',
            'Electrique': 'Électrique',
            'Hybride': 'Hybride',
            'GPL': 'GPL',
        }
        return fuelMap[apiFuel] || apiFuel
    }

    const searchByPlaque = async () => {
        const plaque = formData.plaque.trim()

        // Basic validation - French plates are 7-9 characters
        if (!plaque || plaque.length < 5) {
            console.log('Plaque trop courte:', plaque)
            return
        }

        setIsSearching(true)

        try {
            // Format: ensure dashes for French plates
            const cleanPlate = plaque.toUpperCase().replace(/\s+/g, '-')
            console.log('Recherche plaque:', cleanPlate)

            const response = await fetch(`/api/vehicle-lookup?type=plate&value=${encodeURIComponent(cleanPlate)}`)
            const result = await response.json()

            console.log('API response:', result)

            if (result.success && result.data) {
                const vehicle = result.data
                setFormData(prev => ({
                    ...prev,
                    marque: vehicle.make || prev.marque,
                    modele: vehicle.model || prev.modele,
                    version: vehicle.fullName || prev.version,
                    annee: vehicle.year || prev.annee,
                    carburant: mapFuelType(vehicle.fuel) || prev.carburant,
                    vin: vehicle.vin || prev.vin,
                }))
                console.log('Véhicule trouvé:', vehicle.make, vehicle.model)
            } else {
                console.log('Véhicule non trouvé:', result.error)
                // Could show a toast notification here
            }
        } catch (error) {
            console.error("Erreur recherche plaque:", error)
        } finally {
            setIsSearching(false)
        }
    }

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'avant' | 'apres') => {
        const fileList = e.target.files
        if (!fileList) return
        await uploadFiles(fileList, type)
        e.target.value = ""
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const photosAvantUrls = photosAvant.map(p => ({ url: p.url, uploadedAt: new Date().toISOString() }))
            const photosApresUrls = photosApres.map(p => ({ url: p.url, uploadedAt: new Date().toISOString() }))

            const vehicleData = {
                ...formData,
                photosAvant: photosAvantUrls,
                photosApres: photosApresUrls,
                createdAt: new Date().toISOString(),
            }

            console.log('Vehicle data to save:', vehicleData)
            await new Promise(resolve => setTimeout(resolve, 500))
            router.push("/vehicles")
        } catch (error) {
            console.error("Erreur lors de la création:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const canSubmit = formData.plaque && formData.marque && formData.modele && !uploading

    return (
        <div className="space-y-4 sm:space-y-6 pb-24 sm:pb-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <Link href="/vehicles" className="p-2 -ml-2 hover:bg-zinc-100 rounded-lg transition-colors">
                    <ArrowLeft className="h-5 w-5 text-zinc-500" />
                </Link>
                <div>
                    <h1 className="text-lg sm:text-xl font-semibold text-zinc-900">Nouveau véhicule</h1>
                    <p className="text-xs sm:text-sm text-zinc-500">Ajoutez un véhicule</p>
                </div>
            </div>

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
                                    <span className="hidden sm:inline text-sm">Rechercher</span>
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
                                        className={cn(
                                            "w-full h-10 bg-white border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400",
                                            formData.marque ? "pl-11" : "px-3"
                                        )}
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

                {/* Photos */}
                <section className="bg-white rounded-xl sm:rounded-2xl border border-zinc-100 sm:border-zinc-200 p-4 sm:p-5">
                    <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                        <Camera className="h-3.5 w-3.5" />
                        Photos
                        {uploading && <Loader2 className="h-3 w-3 animate-spin" />}
                    </h2>

                    <div className="grid grid-cols-2 gap-3">
                        {/* AVANT */}
                        <div>
                            <div className="flex items-center gap-1.5 mb-2">
                                <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-semibold rounded">AVANT</span>
                                {photosAvant.length > 0 && <span className="text-[10px] text-zinc-400">({photosAvant.length})</span>}
                            </div>
                            <div className="grid grid-cols-3 gap-1.5">
                                {photosAvant.slice(0, 5).map(photo => (
                                    <div key={photo.id} className="relative aspect-square rounded-lg overflow-hidden bg-zinc-100">
                                        {photo.uploading ? (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />
                                            </div>
                                        ) : (
                                            <img src={photo.url || photo.preview} alt="" className="w-full h-full object-cover" />
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => removeFile(photo.id)}
                                            className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/60 text-white rounded-full flex items-center justify-center"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => fileInputAvantRef.current?.click()}
                                    disabled={uploading}
                                    className="aspect-square rounded-lg border border-dashed border-amber-300 bg-amber-50 flex flex-col items-center justify-center text-amber-600 hover:bg-amber-100 transition-colors disabled:opacity-50"
                                >
                                    <Upload className="h-4 w-4" />
                                </button>
                            </div>
                            <input ref={fileInputAvantRef} type="file" accept="image/*" multiple onChange={(e) => handlePhotoUpload(e, "avant")} className="hidden" />
                        </div>

                        {/* APRÈS */}
                        <div>
                            <div className="flex items-center gap-1.5 mb-2">
                                <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-semibold rounded">APRÈS</span>
                                {photosApres.length > 0 && <span className="text-[10px] text-zinc-400">({photosApres.length})</span>}
                            </div>
                            <div className="grid grid-cols-3 gap-1.5">
                                {photosApres.slice(0, 5).map(photo => (
                                    <div key={photo.id} className="relative aspect-square rounded-lg overflow-hidden bg-zinc-100">
                                        {photo.uploading ? (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />
                                            </div>
                                        ) : (
                                            <img src={photo.url || photo.preview} alt="" className="w-full h-full object-cover" />
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => removeFile(photo.id)}
                                            className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/60 text-white rounded-full flex items-center justify-center"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => fileInputApresRef.current?.click()}
                                    disabled={uploading}
                                    className="aspect-square rounded-lg border border-dashed border-emerald-300 bg-emerald-50 flex flex-col items-center justify-center text-emerald-600 hover:bg-emerald-100 transition-colors disabled:opacity-50"
                                >
                                    <Upload className="h-4 w-4" />
                                </button>
                            </div>
                            <input ref={fileInputApresRef} type="file" accept="image/*" multiple onChange={(e) => handlePhotoUpload(e, "apres")} className="hidden" />
                        </div>
                    </div>
                </section>

                {/* Client */}
                <section className="bg-white rounded-xl sm:rounded-2xl border border-zinc-100 sm:border-zinc-200 p-4 sm:p-5">
                    <button
                        type="button"
                        className="w-full h-12 border border-dashed border-zinc-200 rounded-lg flex items-center justify-center gap-2 text-zinc-500 hover:border-zinc-300 hover:bg-zinc-50 transition-colors"
                    >
                        <User className="h-4 w-4" />
                        <span className="text-sm">Associer à un client</span>
                    </button>
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
                    <Link href="/vehicles" className="flex-1 h-11 flex items-center justify-center text-zinc-600 text-sm font-medium rounded-lg bg-zinc-100">
                        Annuler
                    </Link>
                    <button
                        type="submit"
                        disabled={!canSubmit || isLoading}
                        className="flex-1 h-11 bg-zinc-900 disabled:bg-zinc-300 text-white text-sm font-semibold rounded-lg flex items-center justify-center gap-2"
                    >
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        Créer
                    </button>
                </div>

                {/* Desktop actions */}
                <div className="hidden sm:flex items-center justify-end gap-3">
                    <Link href="/vehicles" className="h-10 px-5 text-zinc-600 text-sm font-medium rounded-lg hover:bg-zinc-100 flex items-center">
                        Annuler
                    </Link>
                    <button
                        type="submit"
                        disabled={!canSubmit || isLoading}
                        className="h-10 px-5 bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-300 text-white text-sm font-semibold rounded-lg flex items-center gap-2 transition-colors"
                    >
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        Créer le véhicule
                    </button>
                </div>
            </form>
        </div>
    )
}
