"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
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
    AlertTriangle,
    Search,
    Check,
    X,
    ChevronDown
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"
import {
    createReparation,
    getClients,
    getVehicules,
    getVehiculesByClient,
    Client,
    Vehicule
} from "@/lib/database"
import { Timestamp, addDoc, collection } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { BrandLogo } from "@/components/ui/brand-logo"

const priorites = [
    { id: "normal", label: "Normal", color: "bg-zinc-100 text-zinc-700", desc: "Traitement standard" },
    { id: "prioritaire", label: "Prioritaire", color: "bg-amber-100 text-amber-700", desc: "À traiter rapidement" },
    { id: "urgent", label: "Urgent", color: "bg-red-100 text-red-700", desc: "Intervention immédiate" },
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
    const searchParams = useSearchParams()
    const { garage, config } = useAuth()

    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Data
    const [clients, setClients] = useState<Client[]>([])
    const [vehicules, setVehicules] = useState<Vehicule[]>([])
    const [loadingData, setLoadingData] = useState(true)

    // Selection
    const [selectedClient, setSelectedClient] = useState<Client | null>(null)
    const [selectedVehicle, setSelectedVehicle] = useState<Vehicule | null>(null)
    const [showClientPicker, setShowClientPicker] = useState(false)
    const [showVehiclePicker, setShowVehiclePicker] = useState(false)
    const [clientSearch, setClientSearch] = useState("")
    const [vehicleSearch, setVehicleSearch] = useState("")

    // Form
    const [formData, setFormData] = useState({
        description: "",
        priorite: "normal" as "normal" | "prioritaire" | "urgent",
        dateSortiePrevue: "",
        tempsEstime: 60, // minutes
        notes: "",
    })

    const [lignes, setLignes] = useState<LigneIntervention[]>([])

    // Charger les données
    useEffect(() => {
        if (garage?.id) {
            loadData()
        }
    }, [garage?.id])

    // Pré-sélection si clientId passé en paramètre
    useEffect(() => {
        const clientId = searchParams.get('clientId')
        if (clientId && clients.length > 0) {
            const client = clients.find(c => c.id === clientId)
            if (client) {
                setSelectedClient(client)
                loadClientVehicles(clientId)
            }
        }
    }, [searchParams, clients])

    const loadData = async () => {
        if (!garage?.id) return

        setLoadingData(true)
        try {
            const [clientsData, vehiculesData] = await Promise.all([
                getClients(garage.id),
                getVehicules(garage.id)
            ])
            setClients(clientsData)
            setVehicules(vehiculesData)
        } catch (error) {
            console.error("Erreur chargement données:", error)
        } finally {
            setLoadingData(false)
        }
    }

    const loadClientVehicles = async (clientId: string) => {
        try {
            const vehicles = await getVehiculesByClient(clientId)
            setVehicules(vehicles)
            // Sélectionner automatiquement si un seul véhicule
            if (vehicles.length === 1) {
                setSelectedVehicle(vehicles[0])
            }
        } catch (error) {
            console.error("Erreur chargement véhicules:", error)
        }
    }

    const selectClient = (client: Client) => {
        setSelectedClient(client)
        setSelectedVehicle(null) // Reset vehicle
        setShowClientPicker(false)
        if (client.id) {
            loadClientVehicles(client.id)
        }
    }

    const selectVehicle = (vehicle: Vehicule) => {
        setSelectedVehicle(vehicle)
        setShowVehiclePicker(false)
    }

    const updateField = (field: string, value: string | number) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const addLigne = (type: "main_oeuvre" | "piece" | "forfait") => {
        const tauxHoraire = config?.tauxHoraireMO || 55
        const newLigne: LigneIntervention = {
            id: Date.now().toString(),
            type,
            designation: "",
            quantite: type === "main_oeuvre" ? 1 : 1,
            prixUnitaireHT: type === "main_oeuvre" ? tauxHoraire : 0,
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
    const tauxTVA = config?.tauxTVA || 20
    const tva = totalHT * (tauxTVA / 100)
    const totalTTC = totalHT + tva

    // Générer le numéro de réparation
    const generateNumero = () => {
        const prefix = "REP"
        const date = new Date()
        const year = date.getFullYear().toString().slice(-2)
        const month = (date.getMonth() + 1).toString().padStart(2, '0')
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
        return `${prefix}${year}${month}-${random}`
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!garage?.id) {
            setError("Veuillez d'abord configurer votre garage")
            return
        }

        if (!formData.description) {
            setError("Veuillez entrer une description")
            return
        }

        setIsLoading(true)
        setError(null)

        try {
            // Créer la réparation
            const reparationId = await createReparation({
                garageId: garage.id,
                clientId: selectedClient?.id || "",
                vehiculeId: selectedVehicle?.id || "",
                numero: generateNumero(),
                statut: "en_attente",
                priorite: formData.priorite,
                description: formData.description,
                dateEntree: Timestamp.now(),
                dateSortiePrevue: formData.dateSortiePrevue
                    ? Timestamp.fromDate(new Date(formData.dateSortiePrevue))
                    : undefined,
                tempsEstime: formData.tempsEstime,
                tempsPasse: 0,
                montantHT: totalHT,
                montantTTC: totalTTC,
                notes: formData.notes || undefined,
            })

            // Créer les lignes de réparation
            for (const ligne of lignes) {
                await addDoc(collection(db, 'lignesReparation'), {
                    reparationId,
                    type: ligne.type,
                    designation: ligne.designation,
                    quantite: ligne.quantite,
                    prixUnitaireHT: ligne.prixUnitaireHT,
                    tauxTVA: tauxTVA,
                    montantHT: ligne.quantite * ligne.prixUnitaireHT
                })
            }

            router.push(`/repairs/${reparationId}`)
        } catch (error) {
            console.error("Erreur création réparation:", error)
            setError("Une erreur est survenue lors de la création")
        } finally {
            setIsLoading(false)
        }
    }

    const canSubmit = formData.description && !isLoading

    // Filtrage
    const filteredClients = clients.filter(c =>
        c.nom?.toLowerCase().includes(clientSearch.toLowerCase()) ||
        c.prenom?.toLowerCase().includes(clientSearch.toLowerCase()) ||
        c.telephone?.includes(clientSearch)
    )

    const filteredVehicles = vehicules.filter(v =>
        v.plaque?.toLowerCase().includes(vehicleSearch.toLowerCase()) ||
        v.marque?.toLowerCase().includes(vehicleSearch.toLowerCase()) ||
        v.modele?.toLowerCase().includes(vehicleSearch.toLowerCase())
    )

    return (
        <div className="space-y-6 pb-8">
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

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0" />
                    <p className="text-sm text-red-700">{error}</p>
                </div>
            )}

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Main Form */}
                <form onSubmit={handleSubmit} id="repair-form" className="lg:col-span-2 space-y-6">
                    {/* Client & Véhicule */}
                    <div className="bg-white rounded-2xl border border-zinc-200 p-6">
                        <h2 className="text-[15px] font-semibold text-zinc-900 mb-4">
                            Client & Véhicule
                        </h2>

                        <div className="grid sm:grid-cols-2 gap-4">
                            {/* Sélection Client */}
                            <div className="relative">
                                {selectedClient ? (
                                    <div className="p-4 border-2 border-zinc-900 rounded-xl bg-zinc-50">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-zinc-200 flex items-center justify-center">
                                                    <span className="text-sm font-bold text-zinc-600">
                                                        {selectedClient.prenom?.[0]}{selectedClient.nom?.[0]}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-zinc-900">
                                                        {selectedClient.prenom} {selectedClient.nom}
                                                    </p>
                                                    {selectedClient.telephone && (
                                                        <p className="text-xs text-zinc-500">{selectedClient.telephone}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setSelectedClient(null)
                                                    setSelectedVehicle(null)
                                                }}
                                                className="p-1 hover:bg-zinc-200 rounded"
                                            >
                                                <X className="h-4 w-4 text-zinc-500" />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => setShowClientPicker(true)}
                                        className="w-full h-24 border-2 border-dashed border-zinc-300 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-zinc-400 hover:bg-zinc-50 transition-colors"
                                    >
                                        <User className="h-6 w-6 text-zinc-400" />
                                        <span className="text-sm font-medium text-zinc-600">Sélectionner un client</span>
                                    </button>
                                )}

                                {/* Client Picker Modal */}
                                {showClientPicker && (
                                    <>
                                        <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowClientPicker(false)} />
                                        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-zinc-200 shadow-xl z-50 max-h-80 overflow-hidden">
                                            <div className="p-3 border-b border-zinc-100">
                                                <div className="relative">
                                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                                                    <input
                                                        type="text"
                                                        value={clientSearch}
                                                        onChange={(e) => setClientSearch(e.target.value)}
                                                        placeholder="Rechercher..."
                                                        className="w-full h-9 pl-9 pr-3 bg-zinc-100 rounded-lg text-sm"
                                                        autoFocus
                                                    />
                                                </div>
                                            </div>
                                            <div className="max-h-60 overflow-y-auto">
                                                {filteredClients.length === 0 ? (
                                                    <div className="p-4 text-center text-sm text-zinc-500">
                                                        Aucun client trouvé
                                                    </div>
                                                ) : (
                                                    filteredClients.map(client => (
                                                        <button
                                                            key={client.id}
                                                            type="button"
                                                            onClick={() => selectClient(client)}
                                                            className="w-full p-3 flex items-center gap-3 hover:bg-zinc-50 transition-colors text-left"
                                                        >
                                                            <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center">
                                                                <span className="text-xs font-bold text-zinc-600">
                                                                    {client.prenom?.[0]}{client.nom?.[0]}
                                                                </span>
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-medium text-zinc-900">
                                                                    {client.prenom} {client.nom}
                                                                </p>
                                                                {client.telephone && (
                                                                    <p className="text-xs text-zinc-500">{client.telephone}</p>
                                                                )}
                                                            </div>
                                                        </button>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Sélection Véhicule */}
                            <div className="relative">
                                {selectedVehicle ? (
                                    <div className="p-4 border-2 border-zinc-900 rounded-xl bg-zinc-50">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-white border border-zinc-200 flex items-center justify-center">
                                                    <BrandLogo brand={selectedVehicle.marque} size={24} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-zinc-900">
                                                        {selectedVehicle.marque} {selectedVehicle.modele}
                                                    </p>
                                                    <p className="text-xs text-zinc-500 font-mono">{selectedVehicle.plaque}</p>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setSelectedVehicle(null)}
                                                className="p-1 hover:bg-zinc-200 rounded"
                                            >
                                                <X className="h-4 w-4 text-zinc-500" />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => setShowVehiclePicker(true)}
                                        className="w-full h-24 border-2 border-dashed border-zinc-300 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-zinc-400 hover:bg-zinc-50 transition-colors"
                                    >
                                        <Car className="h-6 w-6 text-zinc-400" />
                                        <span className="text-sm font-medium text-zinc-600">Sélectionner un véhicule</span>
                                    </button>
                                )}

                                {/* Vehicle Picker Modal */}
                                {showVehiclePicker && (
                                    <>
                                        <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowVehiclePicker(false)} />
                                        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-zinc-200 shadow-xl z-50 max-h-80 overflow-hidden">
                                            <div className="p-3 border-b border-zinc-100">
                                                <div className="relative">
                                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                                                    <input
                                                        type="text"
                                                        value={vehicleSearch}
                                                        onChange={(e) => setVehicleSearch(e.target.value)}
                                                        placeholder="Rechercher..."
                                                        className="w-full h-9 pl-9 pr-3 bg-zinc-100 rounded-lg text-sm"
                                                        autoFocus
                                                    />
                                                </div>
                                            </div>
                                            <div className="max-h-60 overflow-y-auto">
                                                {filteredVehicles.length === 0 ? (
                                                    <div className="p-4 text-center text-sm text-zinc-500">
                                                        {selectedClient ? "Aucun véhicule pour ce client" : "Aucun véhicule trouvé"}
                                                    </div>
                                                ) : (
                                                    filteredVehicles.map(vehicle => (
                                                        <button
                                                            key={vehicle.id}
                                                            type="button"
                                                            onClick={() => selectVehicle(vehicle)}
                                                            className="w-full p-3 flex items-center gap-3 hover:bg-zinc-50 transition-colors text-left"
                                                        >
                                                            <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center">
                                                                <BrandLogo brand={vehicle.marque} size={20} />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-medium text-zinc-900">
                                                                    {vehicle.marque} {vehicle.modele}
                                                                </p>
                                                                <p className="text-xs text-zinc-500 font-mono">{vehicle.plaque}</p>
                                                            </div>
                                                        </button>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Description & Priorité */}
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
                                <div className="grid grid-cols-3 gap-2">
                                    {priorites.map(p => (
                                        <button
                                            key={p.id}
                                            type="button"
                                            onClick={() => updateField("priorite", p.id)}
                                            className={cn(
                                                "p-3 rounded-xl text-center transition-all",
                                                formData.priorite === p.id
                                                    ? p.color + " ring-2 ring-offset-2 ring-zinc-900"
                                                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                                            )}
                                        >
                                            {p.id === "urgent" && <AlertTriangle className="h-4 w-4 mx-auto mb-1" />}
                                            <p className="text-sm font-medium">{p.label}</p>
                                            <p className="text-[10px] opacity-70">{p.desc}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Dates */}
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 mb-2 flex items-center gap-1">
                                        <Clock className="h-3.5 w-3.5" />
                                        Date de sortie prévue
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.dateSortiePrevue}
                                        onChange={(e) => updateField("dateSortiePrevue", e.target.value)}
                                        min={new Date().toISOString().split('T')[0]}
                                        className="w-full h-11 px-4 bg-white border border-zinc-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 mb-2">
                                        Temps estimé
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="number"
                                            value={Math.floor(formData.tempsEstime / 60)}
                                            onChange={(e) => updateField("tempsEstime", parseInt(e.target.value) * 60 + (formData.tempsEstime % 60))}
                                            min={0}
                                            className="w-20 h-11 px-3 bg-white border border-zinc-300 rounded-xl text-sm text-center"
                                        />
                                        <span className="self-center text-sm text-zinc-500">h</span>
                                        <input
                                            type="number"
                                            value={formData.tempsEstime % 60}
                                            onChange={(e) => updateField("tempsEstime", Math.floor(formData.tempsEstime / 60) * 60 + parseInt(e.target.value))}
                                            min={0}
                                            max={59}
                                            step={15}
                                            className="w-20 h-11 px-3 bg-white border border-zinc-300 rounded-xl text-sm text-center"
                                        />
                                        <span className="self-center text-sm text-zinc-500">min</span>
                                    </div>
                                </div>
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
                                                    onChange={(e) => updateLigne(ligne.id, "quantite", parseFloat(e.target.value))}
                                                    min={0.5}
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
                            disabled={!canSubmit}
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
                                <span className="text-zinc-500">TVA ({tauxTVA}%)</span>
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
                                disabled={!canSubmit}
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
