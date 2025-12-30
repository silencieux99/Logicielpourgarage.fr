"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
    ArrowLeft,
    Save,
    Loader2,
    User,
    Phone,
    Mail,
    MapPin,
    Star,
    Building2,
    Car,
    Plus,
    Search,
    X,
    ChevronRight,
    FileText,
    Wrench,
    Check
} from "lucide-react"
import { cn } from "@/lib/utils"

interface Vehicle {
    id: string
    plaque: string
    marque: string
    modele: string
    annee: number
}

interface NewVehicle {
    plaque: string
    marque: string
    modele: string
    annee: number
    carburant: string
    kilometrage: number
}

export default function NewClientPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [step, setStep] = useState<"info" | "vehicle" | "action">("info")

    // Vehicles from database
    const [vehicles, setVehicles] = useState<Vehicle[]>([])
    const [loadingVehicles, setLoadingVehicles] = useState(false)

    // Client form data
    const [formData, setFormData] = useState({
        type: "particulier" as "particulier" | "societe",
        civilite: "M.",
        prenom: "",
        nom: "",
        email: "",
        telephone: "",
        adresse: "",
        codePostal: "",
        ville: "",
        notes: "",
        isVIP: false,
        raisonSociale: "",
        siret: "",
        tvaIntracommunautaire: "",
        contactNom: "",
        contactPrenom: "",
        contactFonction: "",
    })

    // Vehicle selection
    const [vehicleMode, setVehicleMode] = useState<"none" | "existing" | "new">("none")
    const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null)
    const [vehicleSearch, setVehicleSearch] = useState("")
    const [newVehicle, setNewVehicle] = useState<NewVehicle>({
        plaque: "",
        marque: "",
        modele: "",
        annee: new Date().getFullYear(),
        carburant: "Essence",
        kilometrage: 0,
    })

    // After-save action
    const [afterSaveAction, setAfterSaveAction] = useState<"none" | "devis" | "reparation">("none")

    // Load vehicles when mode changes to existing
    useEffect(() => {
        if (vehicleMode === "existing") {
            loadVehicles()
        }
    }, [vehicleMode])

    const loadVehicles = async () => {
        setLoadingVehicles(true)
        try {
            // TODO: Load from Firebase
            // const vehiclesData = await getVehicles(garageId)
            // setVehicles(vehiclesData)
            setVehicles([])
        } catch (error) {
            console.error("Erreur chargement véhicules:", error)
        } finally {
            setLoadingVehicles(false)
        }
    }

    const updateField = (field: string, value: string | boolean) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const updateVehicleField = (field: string, value: string | number) => {
        setNewVehicle(prev => ({ ...prev, [field]: value }))
    }

    const filteredVehicles = vehicles.filter(v =>
        v.plaque.toLowerCase().includes(vehicleSearch.toLowerCase()) ||
        v.marque.toLowerCase().includes(vehicleSearch.toLowerCase()) ||
        v.modele.toLowerCase().includes(vehicleSearch.toLowerCase())
    )

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            // TODO: Save to Firebase
            // 1. Create client
            // 2. Create vehicle if new
            // 3. Link vehicle to client

            await new Promise(resolve => setTimeout(resolve, 500))

            if (afterSaveAction === "devis") {
                router.push("/invoices/new?type=devis")
            } else if (afterSaveAction === "reparation") {
                router.push("/repairs/new")
            } else {
                router.push("/clients")
            }
        } catch (error) {
            console.error("Erreur lors de la création:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const canProceedToVehicle = formData.type === "particulier"
        ? (formData.prenom && formData.nom)
        : (formData.raisonSociale)

    const canSubmit = canProceedToVehicle

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/clients" className="p-2 hover:bg-zinc-100 rounded-lg transition-colors">
                    <ArrowLeft className="h-5 w-5 text-zinc-600" />
                </Link>
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-zinc-900">Nouveau client</h1>
                    <p className="text-sm text-zinc-500">Ajoutez un nouveau client à votre base de données</p>
                </div>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center gap-2 max-w-2xl">
                {["info", "vehicle", "action"].map((s, i) => (
                    <div
                        key={s}
                        className={cn(
                            "flex-1 h-2 rounded-full transition-colors",
                            step === s || (s === "info" && step !== "info") || (s === "vehicle" && step === "action")
                                ? "bg-zinc-900"
                                : "bg-zinc-200"
                        )}
                    />
                ))}
            </div>

            <form onSubmit={handleSubmit} className="max-w-2xl">
                {/* Step 1: Client Info */}
                {step === "info" && (
                    <>
                        {/* Type de client */}
                        <div className="bg-white rounded-2xl border border-zinc-200 p-6 mb-6">
                            <h2 className="text-[15px] font-semibold text-zinc-900 mb-4">Type de client</h2>

                            <div className="grid sm:grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => updateField("type", "particulier")}
                                    className={cn(
                                        "p-4 rounded-xl border-2 text-left transition-all flex items-center gap-3",
                                        formData.type === "particulier" ? "border-zinc-900 bg-zinc-50" : "border-zinc-200 hover:border-zinc-300"
                                    )}
                                >
                                    <div className={cn(
                                        "w-10 h-10 rounded-xl flex items-center justify-center",
                                        formData.type === "particulier" ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-600"
                                    )}>
                                        <User className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-zinc-900">Particulier</p>
                                        <p className="text-xs text-zinc-500">Client individuel</p>
                                    </div>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => updateField("type", "societe")}
                                    className={cn(
                                        "p-4 rounded-xl border-2 text-left transition-all flex items-center gap-3",
                                        formData.type === "societe" ? "border-zinc-900 bg-zinc-50" : "border-zinc-200 hover:border-zinc-300"
                                    )}
                                >
                                    <div className={cn(
                                        "w-10 h-10 rounded-xl flex items-center justify-center",
                                        formData.type === "societe" ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-600"
                                    )}>
                                        <Building2 className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-zinc-900">Société</p>
                                        <p className="text-xs text-zinc-500">Entreprise, association...</p>
                                    </div>
                                </button>
                            </div>
                        </div>

                        {/* Société Info */}
                        {formData.type === "societe" && (
                            <div className="bg-white rounded-2xl border border-zinc-200 p-6 mb-6">
                                <h2 className="text-[15px] font-semibold text-zinc-900 mb-4 flex items-center gap-2">
                                    <Building2 className="h-4 w-4 text-zinc-400" />
                                    Informations société
                                </h2>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-700 mb-2">
                                            Raison sociale <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.raisonSociale}
                                            onChange={(e) => updateField("raisonSociale", e.target.value)}
                                            placeholder="SARL Garage Martin"
                                            className="w-full h-11 px-4 bg-white border border-zinc-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
                                        />
                                    </div>

                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-zinc-700 mb-2">N° SIRET</label>
                                            <input
                                                type="text"
                                                value={formData.siret}
                                                onChange={(e) => updateField("siret", e.target.value)}
                                                placeholder="123 456 789 00012"
                                                className="w-full h-11 px-4 bg-white border border-zinc-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-zinc-700 mb-2">N° TVA Intracom.</label>
                                            <input
                                                type="text"
                                                value={formData.tvaIntracommunautaire}
                                                onChange={(e) => updateField("tvaIntracommunautaire", e.target.value)}
                                                placeholder="FR12345678901"
                                                className="w-full h-11 px-4 bg-white border border-zinc-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-zinc-200">
                                        <p className="text-sm font-medium text-zinc-700 mb-3">Contact principal</p>
                                        <div className="grid sm:grid-cols-3 gap-3">
                                            <input
                                                type="text"
                                                value={formData.contactPrenom}
                                                onChange={(e) => updateField("contactPrenom", e.target.value)}
                                                placeholder="Prénom"
                                                className="h-10 px-3 bg-white border border-zinc-300 rounded-lg text-sm"
                                            />
                                            <input
                                                type="text"
                                                value={formData.contactNom}
                                                onChange={(e) => updateField("contactNom", e.target.value)}
                                                placeholder="Nom"
                                                className="h-10 px-3 bg-white border border-zinc-300 rounded-lg text-sm"
                                            />
                                            <input
                                                type="text"
                                                value={formData.contactFonction}
                                                onChange={(e) => updateField("contactFonction", e.target.value)}
                                                placeholder="Fonction"
                                                className="h-10 px-3 bg-white border border-zinc-300 rounded-lg text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Particulier Info */}
                        {formData.type === "particulier" && (
                            <div className="bg-white rounded-2xl border border-zinc-200 p-6 mb-6">
                                <h2 className="text-[15px] font-semibold text-zinc-900 mb-4 flex items-center gap-2">
                                    <User className="h-4 w-4 text-zinc-400" />
                                    Informations personnelles
                                </h2>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-700 mb-2">Civilité</label>
                                        <div className="flex gap-2">
                                            {["M.", "Mme"].map(c => (
                                                <button
                                                    key={c}
                                                    type="button"
                                                    onClick={() => updateField("civilite", c)}
                                                    className={cn(
                                                        "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                                                        formData.civilite === c ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                                                    )}
                                                >
                                                    {c}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-zinc-700 mb-2">
                                                Prénom <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.prenom}
                                                onChange={(e) => updateField("prenom", e.target.value)}
                                                placeholder="Jean"
                                                className="w-full h-11 px-4 bg-white border border-zinc-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-zinc-700 mb-2">
                                                Nom <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.nom}
                                                onChange={(e) => updateField("nom", e.target.value)}
                                                placeholder="Dupont"
                                                className="w-full h-11 px-4 bg-white border border-zinc-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Contact */}
                        <div className="bg-white rounded-2xl border border-zinc-200 p-6 mb-6">
                            <h2 className="text-[15px] font-semibold text-zinc-900 mb-4 flex items-center gap-2">
                                <Phone className="h-4 w-4 text-zinc-400" />
                                Contact
                            </h2>

                            <div className="grid sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 mb-2">Téléphone</label>
                                    <input
                                        type="tel"
                                        value={formData.telephone}
                                        onChange={(e) => updateField("telephone", e.target.value)}
                                        placeholder="06 12 34 56 78"
                                        className="w-full h-11 px-4 bg-white border border-zinc-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 mb-2">Email</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => updateField("email", e.target.value)}
                                        placeholder="contact@email.fr"
                                        className="w-full h-11 px-4 bg-white border border-zinc-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Adresse */}
                        <div className="bg-white rounded-2xl border border-zinc-200 p-6 mb-6">
                            <h2 className="text-[15px] font-semibold text-zinc-900 mb-4 flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-zinc-400" />
                                Adresse
                            </h2>

                            <div className="space-y-4">
                                <input
                                    type="text"
                                    value={formData.adresse}
                                    onChange={(e) => updateField("adresse", e.target.value)}
                                    placeholder="12 rue de la Paix"
                                    className="w-full h-11 px-4 bg-white border border-zinc-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
                                />
                                <div className="grid grid-cols-3 gap-4">
                                    <input
                                        type="text"
                                        value={formData.codePostal}
                                        onChange={(e) => updateField("codePostal", e.target.value)}
                                        placeholder="75001"
                                        maxLength={5}
                                        className="h-11 px-4 bg-white border border-zinc-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
                                    />
                                    <input
                                        type="text"
                                        value={formData.ville}
                                        onChange={(e) => updateField("ville", e.target.value)}
                                        placeholder="Paris"
                                        className="col-span-2 h-11 px-4 bg-white border border-zinc-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* VIP + Notes */}
                        <div className="bg-white rounded-2xl border border-zinc-200 p-6 mb-6">
                            <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl mb-4">
                                <input
                                    type="checkbox"
                                    id="vip"
                                    checked={formData.isVIP}
                                    onChange={(e) => updateField("isVIP", e.target.checked)}
                                    className="w-5 h-5 rounded border-amber-300 text-amber-600 focus:ring-amber-500"
                                />
                                <label htmlFor="vip" className="flex items-center gap-2 text-sm font-medium text-amber-900">
                                    <Star className="h-4 w-4" />
                                    Client VIP
                                </label>
                            </div>

                            <textarea
                                value={formData.notes}
                                onChange={(e) => updateField("notes", e.target.value)}
                                placeholder="Notes internes sur ce client..."
                                rows={2}
                                className="w-full px-4 py-3 bg-white border border-zinc-300 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-zinc-900"
                            />
                        </div>

                        <div className="flex items-center justify-end gap-3">
                            <Link href="/clients" className="h-11 px-6 text-zinc-700 text-sm font-medium rounded-xl hover:bg-zinc-100 transition-colors flex items-center">
                                Annuler
                            </Link>
                            <button
                                type="button"
                                onClick={() => setStep("vehicle")}
                                disabled={!canProceedToVehicle}
                                className="h-11 px-6 bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-300 text-white text-sm font-semibold rounded-xl flex items-center gap-2 transition-colors"
                            >
                                Continuer
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </>
                )}

                {/* Step 2: Vehicle */}
                {step === "vehicle" && (
                    <>
                        <div className="bg-white rounded-2xl border border-zinc-200 p-6 mb-6">
                            <h2 className="text-[15px] font-semibold text-zinc-900 mb-4 flex items-center gap-2">
                                <Car className="h-4 w-4 text-zinc-400" />
                                Véhicule du client
                            </h2>

                            <p className="text-sm text-zinc-500 mb-4">Associez un véhicule à ce client (optionnel)</p>

                            <div className="grid sm:grid-cols-3 gap-3 mb-6">
                                <button
                                    type="button"
                                    onClick={() => setVehicleMode("none")}
                                    className={cn(
                                        "p-4 rounded-xl border-2 text-center transition-all",
                                        vehicleMode === "none" ? "border-zinc-900 bg-zinc-50" : "border-zinc-200 hover:border-zinc-300"
                                    )}
                                >
                                    <X className="h-5 w-5 mx-auto mb-2 text-zinc-400" />
                                    <p className="text-sm font-medium text-zinc-900">Pas maintenant</p>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setVehicleMode("existing")}
                                    className={cn(
                                        "p-4 rounded-xl border-2 text-center transition-all",
                                        vehicleMode === "existing" ? "border-zinc-900 bg-zinc-50" : "border-zinc-200 hover:border-zinc-300"
                                    )}
                                >
                                    <Search className="h-5 w-5 mx-auto mb-2 text-zinc-400" />
                                    <p className="text-sm font-medium text-zinc-900">Existant</p>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setVehicleMode("new")}
                                    className={cn(
                                        "p-4 rounded-xl border-2 text-center transition-all",
                                        vehicleMode === "new" ? "border-zinc-900 bg-zinc-50" : "border-zinc-200 hover:border-zinc-300"
                                    )}
                                >
                                    <Plus className="h-5 w-5 mx-auto mb-2 text-zinc-400" />
                                    <p className="text-sm font-medium text-zinc-900">Nouveau</p>
                                </button>
                            </div>

                            {vehicleMode === "existing" && (
                                <div className="space-y-4">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                                        <input
                                            type="text"
                                            value={vehicleSearch}
                                            onChange={(e) => setVehicleSearch(e.target.value)}
                                            placeholder="Rechercher par plaque, marque..."
                                            className="w-full h-11 pl-10 pr-4 bg-white border border-zinc-300 rounded-xl text-sm"
                                        />
                                    </div>

                                    {loadingVehicles ? (
                                        <div className="flex items-center justify-center py-8">
                                            <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
                                        </div>
                                    ) : filteredVehicles.length === 0 ? (
                                        <div className="text-center py-8 bg-zinc-50 rounded-xl">
                                            <Car className="h-8 w-8 text-zinc-300 mx-auto mb-2" />
                                            <p className="text-sm text-zinc-500">Aucun véhicule enregistré</p>
                                            <button
                                                type="button"
                                                onClick={() => setVehicleMode("new")}
                                                className="mt-2 text-sm text-zinc-900 font-medium hover:underline"
                                            >
                                                Créer un nouveau véhicule
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-2 max-h-60 overflow-y-auto">
                                            {filteredVehicles.map(vehicle => (
                                                <button
                                                    key={vehicle.id}
                                                    type="button"
                                                    onClick={() => setSelectedVehicleId(vehicle.id)}
                                                    className={cn(
                                                        "w-full p-3 rounded-xl border-2 text-left flex items-center gap-3 transition-all",
                                                        selectedVehicleId === vehicle.id ? "border-zinc-900 bg-zinc-50" : "border-zinc-200 hover:border-zinc-300"
                                                    )}
                                                >
                                                    <div className="w-10 h-10 rounded-lg bg-zinc-100 flex items-center justify-center">
                                                        <Car className="h-5 w-5 text-zinc-600" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-sm font-semibold text-zinc-900">{vehicle.marque} {vehicle.modele}</p>
                                                        <p className="text-xs text-zinc-500 font-mono">{vehicle.plaque} • {vehicle.annee}</p>
                                                    </div>
                                                    {selectedVehicleId === vehicle.id && <Check className="h-5 w-5 text-zinc-900" />}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {vehicleMode === "new" && (
                                <div className="space-y-4 p-4 bg-zinc-50 rounded-xl">
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-zinc-700 mb-2">Plaque</label>
                                            <input
                                                type="text"
                                                value={newVehicle.plaque}
                                                onChange={(e) => updateVehicleField("plaque", e.target.value.toUpperCase())}
                                                placeholder="AA-123-BB"
                                                className="w-full h-11 px-4 bg-white border border-zinc-300 rounded-xl text-sm font-mono text-center"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-zinc-700 mb-2">Marque</label>
                                            <input
                                                type="text"
                                                value={newVehicle.marque}
                                                onChange={(e) => updateVehicleField("marque", e.target.value)}
                                                placeholder="Renault"
                                                className="w-full h-11 px-4 bg-white border border-zinc-300 rounded-xl text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-zinc-700 mb-2">Modèle</label>
                                            <input
                                                type="text"
                                                value={newVehicle.modele}
                                                onChange={(e) => updateVehicleField("modele", e.target.value)}
                                                placeholder="Clio"
                                                className="w-full h-11 px-4 bg-white border border-zinc-300 rounded-xl text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-zinc-700 mb-2">Année</label>
                                            <input
                                                type="number"
                                                value={newVehicle.annee}
                                                onChange={(e) => updateVehicleField("annee", parseInt(e.target.value))}
                                                className="w-full h-11 px-4 bg-white border border-zinc-300 rounded-xl text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-zinc-700 mb-2">Carburant</label>
                                            <select
                                                value={newVehicle.carburant}
                                                onChange={(e) => updateVehicleField("carburant", e.target.value)}
                                                className="w-full h-11 px-4 bg-white border border-zinc-300 rounded-xl text-sm"
                                            >
                                                <option>Essence</option>
                                                <option>Diesel</option>
                                                <option>Hybride</option>
                                                <option>Électrique</option>
                                                <option>GPL</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-zinc-700 mb-2">Kilométrage</label>
                                            <input
                                                type="number"
                                                value={newVehicle.kilometrage}
                                                onChange={(e) => updateVehicleField("kilometrage", parseInt(e.target.value))}
                                                placeholder="50000"
                                                className="w-full h-11 px-4 bg-white border border-zinc-300 rounded-xl text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center justify-between">
                            <button type="button" onClick={() => setStep("info")} className="h-11 px-6 text-zinc-700 text-sm font-medium rounded-xl hover:bg-zinc-100 transition-colors flex items-center gap-2">
                                <ArrowLeft className="h-4 w-4" />
                                Retour
                            </button>
                            <button type="button" onClick={() => setStep("action")} className="h-11 px-6 bg-zinc-900 hover:bg-zinc-800 text-white text-sm font-semibold rounded-xl flex items-center gap-2 transition-colors">
                                Continuer
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </>
                )}

                {/* Step 3: Action */}
                {step === "action" && (
                    <>
                        <div className="bg-white rounded-2xl border border-zinc-200 p-6 mb-6">
                            <h2 className="text-[15px] font-semibold text-zinc-900 mb-4">Que souhaitez-vous faire ensuite ?</h2>

                            <div className="space-y-3">
                                {[
                                    { id: "none", label: "Terminer ici", desc: "Le client sera ajouté sans autre action", icon: Check, color: "zinc" },
                                    { id: "devis", label: "Créer un devis", desc: "Établir un devis pour ce client", icon: FileText, color: "blue" },
                                    { id: "reparation", label: "Démarrer une réparation", desc: "Ouvrir un ordre de réparation", icon: Wrench, color: "amber" },
                                ].map(action => (
                                    <button
                                        key={action.id}
                                        type="button"
                                        onClick={() => setAfterSaveAction(action.id as any)}
                                        className={cn(
                                            "w-full p-4 rounded-xl border-2 text-left flex items-center gap-4 transition-all",
                                            afterSaveAction === action.id ? "border-zinc-900 bg-zinc-50" : "border-zinc-200 hover:border-zinc-300"
                                        )}
                                    >
                                        <div className={cn(
                                            "w-12 h-12 rounded-xl flex items-center justify-center",
                                            afterSaveAction === action.id
                                                ? action.color === "zinc" ? "bg-zinc-900 text-white" : action.color === "blue" ? "bg-blue-600 text-white" : "bg-amber-600 text-white"
                                                : action.color === "zinc" ? "bg-zinc-100 text-zinc-600" : action.color === "blue" ? "bg-blue-100 text-blue-600" : "bg-amber-100 text-amber-600"
                                        )}>
                                            <action.icon className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-zinc-900">{action.label}</p>
                                            <p className="text-xs text-zinc-500">{action.desc}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="bg-zinc-50 rounded-2xl p-6 mb-6">
                            <h3 className="text-sm font-semibold text-zinc-900 mb-3">Récapitulatif</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-zinc-500">Client</span>
                                    <span className="font-medium text-zinc-900">
                                        {formData.type === "societe" ? formData.raisonSociale : `${formData.prenom} ${formData.nom}`}
                                    </span>
                                </div>
                                {formData.telephone && (
                                    <div className="flex justify-between">
                                        <span className="text-zinc-500">Téléphone</span>
                                        <span className="font-medium text-zinc-900">{formData.telephone}</span>
                                    </div>
                                )}
                                {vehicleMode === "new" && newVehicle.plaque && (
                                    <div className="flex justify-between">
                                        <span className="text-zinc-500">Nouveau véhicule</span>
                                        <span className="font-medium text-zinc-900">{newVehicle.plaque}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <button type="button" onClick={() => setStep("vehicle")} className="h-11 px-6 text-zinc-700 text-sm font-medium rounded-xl hover:bg-zinc-100 transition-colors flex items-center gap-2">
                                <ArrowLeft className="h-4 w-4" />
                                Retour
                            </button>
                            <button
                                type="submit"
                                disabled={!canSubmit || isLoading}
                                className="h-11 px-6 bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-300 text-white text-sm font-semibold rounded-xl flex items-center gap-2 transition-colors"
                            >
                                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                {isLoading ? "Création..." : "Créer le client"}
                            </button>
                        </div>
                    </>
                )}
            </form>
        </div>
    )
}
