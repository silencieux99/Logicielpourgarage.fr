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
import { useUpload, type UploadedFile } from "@/hooks/use-upload"

const etatsVehicule = [
    { id: "excellent", label: "Excellent", description: "Véhicule en parfait état", color: "bg-emerald-100 text-emerald-700 border-emerald-300", icon: CheckCircle },
    { id: "bon", label: "Bon", description: "Quelques traces d'usure normales", color: "bg-blue-100 text-blue-700 border-blue-300", icon: Info },
    { id: "moyen", label: "Moyen", description: "Signes d'usure visibles", color: "bg-amber-100 text-amber-700 border-amber-300", icon: AlertCircle },
    { id: "mauvais", label: "Mauvais", description: "Dégradations importantes", color: "bg-red-100 text-red-700 border-red-300", icon: AlertTriangle },
]

const carburants = ["Essence", "Diesel", "Hybride", "Électrique", "GPL", "Hybride rechargeable"]
const couleurs = ["Blanc", "Noir", "Gris", "Bleu", "Rouge", "Vert", "Beige", "Marron", "Orange", "Jaune"]

export default function NewVehiclePage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [isSearching, setIsSearching] = useState(false)

    const fileInputAvantRef = useRef<HTMLInputElement>(null)
    const fileInputApresRef = useRef<HTMLInputElement>(null)

    // Upload hook with Vercel Blob
    const {
        files,
        uploading,
        uploadFiles,
        removeFile,
        getFilesByType
    } = useUpload({
        folder: 'vehicles',
        maxFiles: 20,
        onUploadError: (error) => {
            console.error('Upload error:', error)
            // TODO: Show toast notification
        }
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

    const searchByPlaque = async () => {
        if (!formData.plaque || formData.plaque.length < 7) return

        setIsSearching(true)
        try {
            // Format plate for API
            const cleanPlate = formData.plaque.replace(/\s+/g, '-')
            const response = await fetch(`/api/vehicle-lookup?type=plate&value=${encodeURIComponent(cleanPlate)}`)

            if (response.ok) {
                const result = await response.json()
                console.log('API Response:', result)

                if (result.success && result.data) {
                    const vehicle = result.data

                    // Map API response to form fields
                    setFormData(prev => ({
                        ...prev,
                        marque: vehicle.make || prev.marque,
                        modele: vehicle.model || prev.modele,
                        version: vehicle.fullName || prev.version,
                        annee: vehicle.year || prev.annee,
                        carburant: mapFuelType(vehicle.fuel) || prev.carburant,
                        vin: vehicle.vin || prev.vin,
                    }))
                }
            }
        } catch (error) {
            console.error("Erreur recherche plaque:", error)
        } finally {
            setIsSearching(false)
        }
    }

    // Map API fuel types to form dropdown values
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


    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'avant' | 'apres') => {
        const fileList = e.target.files
        if (!fileList) return

        await uploadFiles(fileList, type)

        // Reset input
        e.target.value = ""
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            // Prepare photo URLs for database
            const photosAvantUrls = photosAvant.map(p => ({
                url: p.url,
                uploadedAt: new Date().toISOString()
            }))

            const photosApresUrls = photosApres.map(p => ({
                url: p.url,
                uploadedAt: new Date().toISOString()
            }))

            // TODO: Save vehicle to Firebase with photo URLs
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

    const selectedEtat = etatsVehicule.find(e => e.id === formData.etat)

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/vehicles" className="p-2 hover:bg-zinc-100 rounded-lg transition-colors">
                    <ArrowLeft className="h-5 w-5 text-zinc-600" />
                </Link>
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-zinc-900">Nouveau véhicule</h1>
                    <p className="text-sm text-zinc-500">Ajoutez un véhicule à votre base</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="max-w-3xl">
                {/* Identification */}
                <div className="bg-white rounded-2xl border border-zinc-200 p-6 mb-6">
                    <h2 className="text-[15px] font-semibold text-zinc-900 mb-4 flex items-center gap-2">
                        <Car className="h-4 w-4 text-zinc-400" />
                        Identification
                    </h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-zinc-700 mb-2">
                                Plaque d'immatriculation <span className="text-red-500">*</span>
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={formData.plaque}
                                    onChange={(e) => updateField("plaque", e.target.value.toUpperCase())}
                                    placeholder="AA-123-BB"
                                    className="flex-1 h-12 px-4 bg-zinc-50 border border-zinc-300 rounded-xl text-lg font-mono text-center uppercase focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:bg-white"
                                />
                                <button
                                    type="button"
                                    onClick={searchByPlaque}
                                    disabled={isSearching || !formData.plaque}
                                    className="h-12 px-4 bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-300 text-white rounded-xl flex items-center gap-2 transition-colors"
                                >
                                    {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                                    <span className="hidden sm:inline">Rechercher</span>
                                </button>
                            </div>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-2">
                                    Marque <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.marque}
                                    onChange={(e) => updateField("marque", e.target.value)}
                                    placeholder="Renault"
                                    className="w-full h-11 px-4 bg-white border border-zinc-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-2">
                                    Modèle <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.modele}
                                    onChange={(e) => updateField("modele", e.target.value)}
                                    placeholder="Clio"
                                    className="w-full h-11 px-4 bg-white border border-zinc-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-zinc-700 mb-2">Version / Finition</label>
                            <input
                                type="text"
                                value={formData.version}
                                onChange={(e) => updateField("version", e.target.value)}
                                placeholder="1.5 dCi 90ch Zen"
                                className="w-full h-11 px-4 bg-white border border-zinc-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-zinc-700 mb-2">N° VIN (Châssis)</label>
                            <input
                                type="text"
                                value={formData.vin}
                                onChange={(e) => updateField("vin", e.target.value.toUpperCase())}
                                placeholder="VF1XXXXXX00000000"
                                maxLength={17}
                                className="w-full h-11 px-4 bg-white border border-zinc-300 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-zinc-900"
                            />
                        </div>
                    </div>
                </div>

                {/* Caractéristiques */}
                <div className="bg-white rounded-2xl border border-zinc-200 p-6 mb-6">
                    <h2 className="text-[15px] font-semibold text-zinc-900 mb-4">Caractéristiques</h2>

                    <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-zinc-700 mb-2 flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                                Année
                            </label>
                            <input
                                type="number"
                                value={formData.annee}
                                onChange={(e) => updateField("annee", parseInt(e.target.value))}
                                min={1900}
                                max={new Date().getFullYear() + 1}
                                className="w-full h-11 px-4 bg-white border border-zinc-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-zinc-700 mb-2 flex items-center gap-1">
                                <Gauge className="h-3.5 w-3.5 text-zinc-400" />
                                Kilométrage
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={formData.kilometrage}
                                    onChange={(e) => updateField("kilometrage", parseInt(e.target.value))}
                                    min={0}
                                    className="w-full h-11 px-4 pr-12 bg-white border border-zinc-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-zinc-400">km</span>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-zinc-700 mb-2 flex items-center gap-1">
                                <Fuel className="h-3.5 w-3.5 text-zinc-400" />
                                Carburant
                            </label>
                            <select
                                value={formData.carburant}
                                onChange={(e) => updateField("carburant", e.target.value)}
                                className="w-full h-11 px-4 bg-white border border-zinc-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
                            >
                                {carburants.map(c => <option key={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-zinc-700 mb-2 flex items-center gap-1">
                                <Palette className="h-3.5 w-3.5 text-zinc-400" />
                                Couleur
                            </label>
                            <select
                                value={formData.couleur}
                                onChange={(e) => updateField("couleur", e.target.value)}
                                className="w-full h-11 px-4 bg-white border border-zinc-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
                            >
                                <option value="">Sélectionner...</option>
                                {couleurs.map(c => <option key={c}>{c}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                {/* État du véhicule */}
                <div className="bg-white rounded-2xl border border-zinc-200 p-6 mb-6">
                    <h2 className="text-[15px] font-semibold text-zinc-900 mb-4 flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-zinc-400" />
                        État du véhicule
                    </h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-zinc-700 mb-3">État général</label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                {etatsVehicule.map(etat => {
                                    const Icon = etat.icon
                                    return (
                                        <button
                                            key={etat.id}
                                            type="button"
                                            onClick={() => updateField("etat", etat.id)}
                                            className={cn(
                                                "p-3 rounded-xl border-2 text-left transition-all",
                                                formData.etat === etat.id
                                                    ? `${etat.color} border-current`
                                                    : "border-zinc-200 hover:border-zinc-300 bg-white"
                                            )}
                                        >
                                            <Icon className={cn("h-5 w-5 mb-1", formData.etat === etat.id ? "" : "text-zinc-400")} />
                                            <p className={cn("text-sm font-semibold", formData.etat === etat.id ? "" : "text-zinc-900")}>{etat.label}</p>
                                        </button>
                                    )
                                })}
                            </div>
                            {selectedEtat && (
                                <p className="text-xs text-zinc-500 mt-2">{selectedEtat.description}</p>
                            )}
                        </div>

                        <div className="grid sm:grid-cols-3 gap-4 pt-4 border-t border-zinc-100">
                            <div>
                                <label className="block text-xs font-medium text-zinc-600 mb-1">Carrosserie</label>
                                <select
                                    value={formData.etatCarrosserie}
                                    onChange={(e) => updateField("etatCarrosserie", e.target.value)}
                                    className="w-full h-10 px-3 bg-white border border-zinc-200 rounded-lg text-sm"
                                >
                                    <option value="">Évaluer...</option>
                                    <option value="impeccable">Impeccable</option>
                                    <option value="quelques_rayures">Quelques rayures</option>
                                    <option value="bosses_rayures">Bosses/rayures</option>
                                    <option value="rouille">Traces de rouille</option>
                                    <option value="accident">Traces d'accident</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-zinc-600 mb-1">Intérieur</label>
                                <select
                                    value={formData.etatInterieur}
                                    onChange={(e) => updateField("etatInterieur", e.target.value)}
                                    className="w-full h-10 px-3 bg-white border border-zinc-200 rounded-lg text-sm"
                                >
                                    <option value="">Évaluer...</option>
                                    <option value="impeccable">Impeccable</option>
                                    <option value="usure_normale">Usure normale</option>
                                    <option value="taches">Taches</option>
                                    <option value="dechirures">Déchirures sièges</option>
                                    <option value="mauvais">Mauvais état</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-zinc-600 mb-1">Mécanique</label>
                                <select
                                    value={formData.etatMecanique}
                                    onChange={(e) => updateField("etatMecanique", e.target.value)}
                                    className="w-full h-10 px-3 bg-white border border-zinc-200 rounded-lg text-sm"
                                >
                                    <option value="">Évaluer...</option>
                                    <option value="parfait">Parfait état</option>
                                    <option value="bon">Bon état</option>
                                    <option value="travaux_legers">Petits travaux à prévoir</option>
                                    <option value="travaux_importants">Travaux importants</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-zinc-700 mb-2">Remarques sur l'état</label>
                            <textarea
                                value={formData.remarquesEtat}
                                onChange={(e) => updateField("remarquesEtat", e.target.value)}
                                placeholder="Décrivez tout défaut visible, rayure, bosse, problème connu..."
                                rows={2}
                                className="w-full px-4 py-3 bg-white border border-zinc-300 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-zinc-900"
                            />
                        </div>
                    </div>
                </div>

                {/* Photos avant/après avec Vercel Blob */}
                <div className="bg-white rounded-2xl border border-zinc-200 p-6 mb-6">
                    <h2 className="text-[15px] font-semibold text-zinc-900 mb-2 flex items-center gap-2">
                        <Camera className="h-4 w-4 text-zinc-400" />
                        Photos du véhicule
                        {uploading && <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />}
                    </h2>
                    <p className="text-sm text-zinc-500 mb-4">
                        Gardez une trace visuelle de l'état du véhicule avant et après intervention
                    </p>

                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Photos AVANT */}
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded-lg">AVANT</span>
                                <span className="text-sm text-zinc-500">État à la réception</span>
                                {photosAvant.length > 0 && (
                                    <span className="text-xs text-zinc-400">({photosAvant.length} photo{photosAvant.length > 1 ? 's' : ''})</span>
                                )}
                            </div>

                            <div className="grid grid-cols-3 gap-2 mb-3">
                                {photosAvant.map(photo => (
                                    <div key={photo.id} className="relative aspect-square rounded-lg overflow-hidden bg-zinc-100">
                                        {photo.uploading ? (
                                            <div className="absolute inset-0 flex items-center justify-center bg-zinc-100">
                                                <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
                                            </div>
                                        ) : photo.error ? (
                                            <div className="absolute inset-0 flex items-center justify-center bg-red-50">
                                                <AlertCircle className="h-6 w-6 text-red-400" />
                                            </div>
                                        ) : (
                                            <img
                                                src={photo.url || photo.preview}
                                                alt="Photo avant"
                                                className="w-full h-full object-cover"
                                            />
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => removeFile(photo.id)}
                                            disabled={photo.uploading}
                                            className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 disabled:opacity-50"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                ))}

                                <button
                                    type="button"
                                    onClick={() => fileInputAvantRef.current?.click()}
                                    disabled={uploading}
                                    className={cn(
                                        "aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1 transition-colors disabled:opacity-50",
                                        photosAvant.length === 0
                                            ? "border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-600"
                                            : "border-zinc-300 bg-zinc-50 hover:bg-zinc-100 text-zinc-500"
                                    )}
                                >
                                    <Upload className="h-5 w-5" />
                                    <span className="text-xs font-medium">Ajouter</span>
                                </button>
                            </div>

                            <input
                                ref={fileInputAvantRef}
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={(e) => handlePhotoUpload(e, "avant")}
                                className="hidden"
                            />
                        </div>

                        {/* Photos APRÈS */}
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-lg">APRÈS</span>
                                <span className="text-sm text-zinc-500">État après intervention</span>
                                {photosApres.length > 0 && (
                                    <span className="text-xs text-zinc-400">({photosApres.length} photo{photosApres.length > 1 ? 's' : ''})</span>
                                )}
                            </div>

                            <div className="grid grid-cols-3 gap-2 mb-3">
                                {photosApres.map(photo => (
                                    <div key={photo.id} className="relative aspect-square rounded-lg overflow-hidden bg-zinc-100">
                                        {photo.uploading ? (
                                            <div className="absolute inset-0 flex items-center justify-center bg-zinc-100">
                                                <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
                                            </div>
                                        ) : photo.error ? (
                                            <div className="absolute inset-0 flex items-center justify-center bg-red-50">
                                                <AlertCircle className="h-6 w-6 text-red-400" />
                                            </div>
                                        ) : (
                                            <img
                                                src={photo.url || photo.preview}
                                                alt="Photo après"
                                                className="w-full h-full object-cover"
                                            />
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => removeFile(photo.id)}
                                            disabled={photo.uploading}
                                            className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 disabled:opacity-50"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                ))}

                                <button
                                    type="button"
                                    onClick={() => fileInputApresRef.current?.click()}
                                    disabled={uploading}
                                    className={cn(
                                        "aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1 transition-colors disabled:opacity-50",
                                        photosApres.length === 0
                                            ? "border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-600"
                                            : "border-zinc-300 bg-zinc-50 hover:bg-zinc-100 text-zinc-500"
                                    )}
                                >
                                    <Upload className="h-5 w-5" />
                                    <span className="text-xs font-medium">Ajouter</span>
                                </button>
                            </div>

                            <input
                                ref={fileInputApresRef}
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={(e) => handlePhotoUpload(e, "apres")}
                                className="hidden"
                            />
                        </div>
                    </div>

                    <div className="mt-4 p-3 bg-blue-50 rounded-xl flex gap-3">
                        <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-blue-800">
                            <p className="font-medium mb-1">Conseils pour les photos</p>
                            <ul className="text-xs space-y-0.5 text-blue-700">
                                <li>• Prenez des photos de face, arrière, côtés et intérieur</li>
                                <li>• Photographiez tout rayure, bosse ou défaut existant</li>
                                <li>• Photos stockées de manière sécurisée sur le cloud</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Propriétaire */}
                <div className="bg-white rounded-2xl border border-zinc-200 p-6 mb-6">
                    <h2 className="text-[15px] font-semibold text-zinc-900 mb-4 flex items-center gap-2">
                        <User className="h-4 w-4 text-zinc-400" />
                        Propriétaire
                    </h2>

                    <button
                        type="button"
                        className="w-full h-16 border-2 border-dashed border-zinc-300 rounded-xl flex items-center justify-center gap-2 hover:border-zinc-400 hover:bg-zinc-50 transition-colors"
                    >
                        <User className="h-5 w-5 text-zinc-400" />
                        <span className="text-sm font-medium text-zinc-600">Associer à un client (optionnel)</span>
                    </button>
                </div>

                {/* Notes */}
                <div className="bg-white rounded-2xl border border-zinc-200 p-6 mb-6">
                    <h2 className="text-[15px] font-semibold text-zinc-900 mb-4">Notes internes</h2>
                    <textarea
                        value={formData.notes}
                        onChange={(e) => updateField("notes", e.target.value)}
                        placeholder="Informations supplémentaires sur ce véhicule..."
                        rows={3}
                        className="w-full px-4 py-3 bg-white border border-zinc-300 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-zinc-900"
                    />
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3">
                    <Link
                        href="/vehicles"
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
                                Créer le véhicule
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    )
}
