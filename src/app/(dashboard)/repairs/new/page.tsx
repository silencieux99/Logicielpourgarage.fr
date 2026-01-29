"use client"

import { useState, useEffect, Suspense, useCallback } from "react"
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
    X,
    History,
    CheckCircle2,
    Timer,
    ChevronRight
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"
import {
    createReparation,
    getClients,
    getVehicules,
    getVehiculesByClient,
    getVehiculeByPlaque,
    getReparationsByVehicule,
    getArticles,
    createClient,
    createVehicule,
    getActivePersonnel,
    Client,
    Vehicule,
    Reparation,
    Article,
    Personnel
} from "@/lib/database"
import { Timestamp, addDoc, collection } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { BrandLogo } from "@/components/ui/brand-logo"

// Templates de réparations courantes - design épuré
const repairTemplates = [
    {
        id: "vidange",
        label: "Vidange",
        lignes: [
            { type: "main_oeuvre" as const, designation: "Vidange moteur", quantite: 0.5, prixUnitaireHT: 55 },
            { type: "piece" as const, designation: "Huile moteur 5L", quantite: 1, prixUnitaireHT: 45 },
            { type: "piece" as const, designation: "Filtre à huile", quantite: 1, prixUnitaireHT: 15 },
        ]
    },
    {
        id: "freins",
        label: "Freins",
        lignes: [
            { type: "main_oeuvre" as const, designation: "Changement plaquettes", quantite: 1.5, prixUnitaireHT: 55 },
            { type: "piece" as const, designation: "Plaquettes de frein", quantite: 1, prixUnitaireHT: 65 },
        ]
    },
    {
        id: "revision",
        label: "Révision",
        lignes: [
            { type: "main_oeuvre" as const, designation: "Révision complète", quantite: 2, prixUnitaireHT: 55 },
            { type: "piece" as const, designation: "Kit filtres", quantite: 1, prixUnitaireHT: 75 },
            { type: "piece" as const, designation: "Huile moteur 5L", quantite: 1, prixUnitaireHT: 45 },
        ]
    },
    {
        id: "pneus",
        label: "Pneus",
        lignes: [
            { type: "main_oeuvre" as const, designation: "Montage équilibrage x4", quantite: 1, prixUnitaireHT: 60 },
        ]
    },
    {
        id: "clim",
        label: "Climatisation",
        lignes: [
            { type: "main_oeuvre" as const, designation: "Recharge climatisation", quantite: 1, prixUnitaireHT: 55 },
            { type: "piece" as const, designation: "Gaz réfrigérant", quantite: 1, prixUnitaireHT: 45 },
        ]
    },
    {
        id: "batterie",
        label: "Batterie",
        lignes: [
            { type: "main_oeuvre" as const, designation: "Remplacement batterie", quantite: 0.5, prixUnitaireHT: 55 },
            { type: "piece" as const, designation: "Batterie 12V", quantite: 1, prixUnitaireHT: 120 },
        ]
    },
]

const priorites = [
    { id: "normal", label: "Normal", desc: "Standard" },
    { id: "prioritaire", label: "Prioritaire", desc: "Rapide" },
    { id: "urgent", label: "Urgent", desc: "Immédiat" },
]

interface LigneIntervention {
    id: string
    type: "main_oeuvre" | "piece" | "forfait"
    designation: string
    quantite: number
    prixUnitaireHT: number
}

const DRAFT_KEY = "repair_draft"

function NewRepairForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { garage, config } = useAuth()

    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Data
    const [clients, setClients] = useState<Client[]>([])
    const [vehicules, setVehicules] = useState<Vehicule[]>([])
    const [vehicleHistory, setVehicleHistory] = useState<Reparation[]>([])
    const [articles, setArticles] = useState<Article[]>([])
    const [personnel, setPersonnel] = useState<Personnel[]>([])
    const [loadingData, setLoadingData] = useState(true)

    // Catalog picker
    const [showCatalogPicker, setShowCatalogPicker] = useState(false)
    const [catalogSearch, setCatalogSearch] = useState("")

    // Selection
    const [selectedClient, setSelectedClient] = useState<Client | null>(null)
    const [selectedVehicle, setSelectedVehicle] = useState<Vehicule | null>(null)
    const [showClientPicker, setShowClientPicker] = useState(false)
    const [showVehiclePicker, setShowVehiclePicker] = useState(false)
    const [clientSearch, setClientSearch] = useState("")
    const [vehicleSearch, setVehicleSearch] = useState("")
    const [showQuickVehicleForm, setShowQuickVehicleForm] = useState(false)
    const [creatingVehicle, setCreatingVehicle] = useState(false)
    const [vehicleLookupLoading, setVehicleLookupLoading] = useState(false)
    const [newVehicleData, setNewVehicleData] = useState({
        plaque: "",
        vin: "",
        marque: "",
        modele: "",
        version: "",
        annee: new Date().getFullYear(),
        carburant: "Essence",
        kilometrage: 0,
        couleur: "",
    })

    // Quick client creation
    const [showQuickClientForm, setShowQuickClientForm] = useState(false)
    const [creatingClient, setCreatingClient] = useState(false)
    const [newClientData, setNewClientData] = useState({
        type: "particulier" as "particulier" | "societe",
        prenom: "",
        nom: "",
        telephone: "",
        email: ""
    })

    // Form
    const initialFormData = {
        description: "",
        priorite: "normal" as "normal" | "prioritaire" | "urgent",
        dateSortiePrevue: "",
        heureSortiePrevue: "",
        tempsEstime: 60,
        mecanicienId: "",
        notes: "",
    }
    const [formData, setFormData] = useState(initialFormData)

    const [lignes, setLignes] = useState<LigneIntervention[]>([])

    // Auto-save draft
    const saveDraft = useCallback(() => {
        if (typeof window !== 'undefined') {
            const draft = {
                selectedClientId: selectedClient?.id,
                selectedVehicleId: selectedVehicle?.id,
                formData,
                lignes,
                savedAt: new Date().toISOString()
            }
            localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
        }
    }, [selectedClient, selectedVehicle, formData, lignes])

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedDraft = localStorage.getItem(DRAFT_KEY)
            if (savedDraft) {
                try {
                    const draft = JSON.parse(savedDraft)
                    if (draft.formData) setFormData({ ...initialFormData, ...draft.formData })
                    if (draft.lignes) setLignes(draft.lignes)
                } catch (e) {
                    console.error("Error loading draft:", e)
                }
            }
        }
    }, [])

    useEffect(() => {
        const interval = setInterval(saveDraft, 5000)
        return () => clearInterval(interval)
    }, [saveDraft])

    const clearDraft = () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem(DRAFT_KEY)
        }
    }

    useEffect(() => {
        if (garage?.id) {
            loadData()
        }
    }, [garage?.id])

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

    useEffect(() => {
        if (selectedVehicle?.id) {
            loadVehicleHistory(selectedVehicle.id)
        }
    }, [selectedVehicle?.id])

    const loadData = async () => {
        if (!garage?.id) return
        setLoadingData(true)
        try {
            const [clientsData, vehiculesData, articlesData, personnelData] = await Promise.all([
                getClients(garage.id),
                getVehicules(garage.id),
                getArticles(garage.id),
                getActivePersonnel(garage.id)
            ])
            setClients(clientsData)
            setVehicules(vehiculesData)
            setArticles(articlesData)
            setPersonnel(personnelData)
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
            if (vehicles.length === 1) {
                setSelectedVehicle(vehicles[0])
            }
        } catch (error) {
            console.error("Erreur chargement véhicules:", error)
        }
    }

    const loadVehicleHistory = async (vehicleId: string) => {
        try {
            const history = await getReparationsByVehicule(vehicleId)
            setVehicleHistory(history.slice(0, 3))
        } catch (error) {
            console.error("Erreur chargement historique:", error)
        }
    }

    const selectClient = (client: Client) => {
        setSelectedClient(client)
        setSelectedVehicle(null)
        setVehicleHistory([])
        setShowClientPicker(false)
        if (client.id) {
            loadClientVehicles(client.id)
        }
    }

    const selectVehicle = (vehicle: Vehicule) => {
        setSelectedVehicle(vehicle)
        setShowVehiclePicker(false)
    }

    const handleQuickClientCreate = async () => {
        if (!garage?.id || !newClientData.nom) return

        setCreatingClient(true)
        try {
            const clientId = await createClient({
                garageId: garage.id,
                type: newClientData.type,
                civilite: "",
                prenom: newClientData.type === "particulier" ? newClientData.prenom : "",
                nom: newClientData.nom,
                raisonSociale: newClientData.type === "societe" ? newClientData.nom : undefined,
                telephone: newClientData.telephone || undefined,
                email: newClientData.email || undefined,
                isVIP: false
            })

            // Créer l'objet client et le sélectionner
            const newClient: Client = {
                id: clientId,
                garageId: garage.id,
                type: newClientData.type,
                civilite: "",
                prenom: newClientData.type === "particulier" ? newClientData.prenom : "",
                nom: newClientData.nom,
                raisonSociale: newClientData.type === "societe" ? newClientData.nom : undefined,
                telephone: newClientData.telephone,
                email: newClientData.email,
                isVIP: false,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now()
            }

            setClients(prev => [newClient, ...prev])
            selectClient(newClient)
            setShowQuickClientForm(false)
            setNewClientData({ type: "particulier", prenom: "", nom: "", telephone: "", email: "" })
        } catch (error) {
            console.error("Erreur création client:", error)
        } finally {
            setCreatingClient(false)
        }
    }

    const handleVehicleLookup = async () => {
        const plaque = newVehicleData.plaque.trim()
        if (!plaque || plaque.length < 5) return

        setVehicleLookupLoading(true)
        try {
            const cleanPlate = plaque.toUpperCase().replace(/\s+/g, '-')
            const response = await fetch(`/api/vehicle-lookup?type=plate&value=${encodeURIComponent(cleanPlate)}`)
            const result = await response.json()
            if (result.success && result.data) {
                const vehicle = result.data
                setNewVehicleData(prev => ({
                    ...prev,
                    marque: vehicle.make || prev.marque,
                    modele: vehicle.model || prev.modele,
                    version: vehicle.fullName || prev.version,
                    annee: vehicle.year || prev.annee,
                    carburant: vehicle.fuel || prev.carburant,
                    vin: vehicle.vin || prev.vin,
                }))
            }
        } catch (error) {
            console.error("Erreur recherche immatriculation:", error)
        } finally {
            setVehicleLookupLoading(false)
        }
    }

    const handleQuickVehicleCreate = async () => {
        if (!garage?.id || !selectedClient?.id || !newVehicleData.plaque || !newVehicleData.marque || !newVehicleData.modele) return

        setCreatingVehicle(true)
        try {
            const existingVehicle = await getVehiculeByPlaque(garage.id, newVehicleData.plaque)
            if (existingVehicle) {
                if (existingVehicle.clientId && existingVehicle.clientId !== selectedClient.id) {
                    setError("Ce véhicule est déjà rattaché à un autre client.")
                    setCreatingVehicle(false)
                    return
                }
                setSelectedVehicle(existingVehicle)
                setShowQuickVehicleForm(false)
                setShowVehiclePicker(false)
                setCreatingVehicle(false)
                return
            }

            const vehicleId = await createVehicule({
                garageId: garage.id,
                clientId: selectedClient.id,
                plaque: newVehicleData.plaque.toUpperCase(),
                vin: newVehicleData.vin || undefined,
                marque: newVehicleData.marque,
                modele: newVehicleData.modele,
                version: newVehicleData.version || undefined,
                annee: newVehicleData.annee,
                couleur: newVehicleData.couleur || undefined,
                carburant: newVehicleData.carburant,
                kilometrage: newVehicleData.kilometrage,
            })

            const createdVehicle: Vehicule = {
                id: vehicleId,
                garageId: garage.id,
                clientId: selectedClient.id,
                plaque: newVehicleData.plaque.toUpperCase(),
                vin: newVehicleData.vin || undefined,
                marque: newVehicleData.marque,
                modele: newVehicleData.modele,
                version: newVehicleData.version || undefined,
                annee: newVehicleData.annee,
                couleur: newVehicleData.couleur || undefined,
                carburant: newVehicleData.carburant,
                kilometrage: newVehicleData.kilometrage,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
            }

            setVehicules(prev => [createdVehicle, ...prev])
            setSelectedVehicle(createdVehicle)
            setShowQuickVehicleForm(false)
            setShowVehiclePicker(false)
            setNewVehicleData({
                plaque: "",
                vin: "",
                marque: "",
                modele: "",
                version: "",
                annee: new Date().getFullYear(),
                carburant: "Essence",
                kilometrage: 0,
                couleur: "",
            })
        } catch (error) {
            console.error("Erreur création véhicule:", error)
        } finally {
            setCreatingVehicle(false)
        }
    }

    const updateField = (field: string, value: string | number) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const applyTemplate = (template: typeof repairTemplates[0]) => {
        const templateLignes = template.lignes.map(l => ({
            ...l,
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            prixUnitaireHT: l.type === "main_oeuvre" ? (config?.tauxHoraireMO || l.prixUnitaireHT) : l.prixUnitaireHT
        }))
        setLignes(prev => [...prev, ...templateLignes])
        setFormData(prev => ({
            ...prev,
            description: prev.description ? prev.description + "\n" + template.label : template.label
        }))
    }

    const addLigne = (type: "main_oeuvre" | "piece" | "forfait") => {
        const tauxHoraire = config?.tauxHoraireMO || 55
        const newLigne: LigneIntervention = {
            id: Date.now().toString(),
            type,
            designation: "",
            quantite: 1,
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

    const addFromCatalog = (article: Article) => {
        const newLigne: LigneIntervention = {
            id: Date.now().toString(),
            type: "piece",
            designation: article.designation,
            quantite: 1,
            prixUnitaireHT: article.prixVenteHT,
        }
        setLignes([...lignes, newLigne])
        setShowCatalogPicker(false)
        setCatalogSearch("")
    }

    const filteredArticles = articles.filter(a =>
        a.designation?.toLowerCase().includes(catalogSearch.toLowerCase()) ||
        a.reference?.toLowerCase().includes(catalogSearch.toLowerCase()) ||
        a.categorie?.toLowerCase().includes(catalogSearch.toLowerCase())
    )

    const totalMO = lignes.filter(l => l.type === "main_oeuvre").reduce((sum, l) => sum + (l.quantite * l.prixUnitaireHT), 0)
    const totalPieces = lignes.filter(l => l.type === "piece" || l.type === "forfait").reduce((sum, l) => sum + (l.quantite * l.prixUnitaireHT), 0)
    const totalHT = totalMO + totalPieces
    const tauxTVA = config?.tauxTVA || 20
    const tva = totalHT * (tauxTVA / 100)
    const totalTTC = totalHT + tva

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
                    ? Timestamp.fromDate(new Date(`${formData.dateSortiePrevue}T${formData.heureSortiePrevue || "09:00"}:00`))
                    : undefined,
                mecanicienId: formData.mecanicienId || undefined,
                tempsEstime: formData.tempsEstime,
                tempsPasse: 0,
                montantHT: totalHT,
                montantTTC: totalTTC,
                notes: formData.notes || undefined,
            })

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

            clearDraft()
            router.push(`/repairs/${reparationId}`)
        } catch (error) {
            console.error("Erreur création réparation:", error)
            setError("Une erreur est survenue lors de la création")
        } finally {
            setIsLoading(false)
        }
    }

    const canSubmit = formData.description && !isLoading

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
        <div className="min-h-screen pb-32 lg:pb-8">
            {/* Header - Clean & Minimal */}
            <div className="mb-8">
                <div className="flex items-center gap-4">
                    <Link href="/repairs" className="p-2.5 hover:bg-zinc-100 rounded-xl transition-colors">
                        <ArrowLeft className="h-5 w-5 text-zinc-400" />
                    </Link>
                    <div className="flex-1">
                        <h1 className="text-2xl sm:text-3xl font-semibold text-zinc-900 tracking-tight">
                            Nouvelle réparation
                        </h1>
                    </div>
                </div>
            </div>

            {error && (
                <div className="mb-6 bg-zinc-50 border border-zinc-200 rounded-2xl p-4 flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-zinc-400" />
                    <p className="text-sm text-zinc-600">{error}</p>
                    <button onClick={() => setError(null)} className="ml-auto p-1 hover:bg-zinc-100 rounded-lg">
                        <X className="h-4 w-4 text-zinc-400" />
                    </button>
                </div>
            )}

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Main Form */}
                <form onSubmit={handleSubmit} id="repair-form" className="lg:col-span-2 space-y-6">

                    {/* Client & Véhicule - Minimal */}
                    <div className="space-y-4">
                        <div className="grid sm:grid-cols-2 gap-4">
                            {/* Client */}
                            <div>
                                <label className="block text-[13px] font-medium text-zinc-500 mb-2">Client</label>
                                {selectedClient ? (
                                    <div className="h-16 px-4 bg-zinc-50 border border-zinc-200 rounded-2xl flex items-center justify-between group hover:border-zinc-300 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-zinc-900 flex items-center justify-center">
                                                <span className="text-xs font-medium text-white">
                                                    {selectedClient.prenom?.[0]}{selectedClient.nom?.[0]}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-zinc-900">
                                                    {selectedClient.prenom} {selectedClient.nom}
                                                </p>
                                                {selectedClient.telephone && (
                                                    <p className="text-xs text-zinc-400">{selectedClient.telephone}</p>
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSelectedClient(null)
                                                setSelectedVehicle(null)
                                                setVehicleHistory([])
                                            }}
                                            className="p-1.5 hover:bg-zinc-200 rounded-lg transition-all"
                                        >
                                            <X className="h-4 w-4 text-zinc-400" />
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => setShowClientPicker(true)}
                                        className="w-full h-16 border border-dashed border-zinc-300 rounded-2xl flex items-center justify-center gap-2 hover:border-zinc-400 hover:bg-zinc-50/50 transition-all"
                                    >
                                        <User className="h-4 w-4 text-zinc-400" />
                                        <span className="text-sm text-zinc-500">Sélectionner</span>
                                    </button>
                                )}

                                {/* Client Picker */}
                                {showClientPicker && (
                                    <div className="fixed inset-0 bg-black/20 z-40 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowClientPicker(false)}>
                                        <div className="w-full max-w-md bg-white rounded-2xl border border-zinc-200 shadow-2xl flex flex-col max-h-[80vh]" onClick={(e) => e.stopPropagation()}>
                                            <div className="p-4 border-b border-zinc-100 flex-shrink-0">
                                                <div className="relative">
                                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                                                    <input
                                                        type="text"
                                                        value={clientSearch}
                                                        onChange={(e) => setClientSearch(e.target.value)}
                                                        placeholder="Rechercher..."
                                                        className="w-full h-10 pl-10 pr-4 bg-zinc-50 border-0 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
                                                        autoFocus
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex-1 overflow-y-auto min-h-0">
                                                {filteredClients.length === 0 ? (
                                                    <div className="p-8 text-center text-sm text-zinc-400">Aucun client</div>
                                                ) : (
                                                    filteredClients.map((client) => (
                                                        <button
                                                            key={client.id}
                                                            type="button"
                                                            onClick={() => selectClient(client)}
                                                            className="w-full p-4 flex items-center gap-3 hover:bg-zinc-50 transition-colors text-left"
                                                        >
                                                            <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center">
                                                                <span className="text-xs font-medium text-zinc-600">
                                                                    {client.prenom?.[0]}{client.nom?.[0]}
                                                                </span>
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-medium text-zinc-900 truncate">
                                                                    {client.prenom} {client.nom}
                                                                </p>
                                                                {client.telephone && (
                                                                    <p className="text-xs text-zinc-400">{client.telephone}</p>
                                                                )}
                                                            </div>
                                                            <ChevronRight className="h-4 w-4 text-zinc-300" />
                                                        </button>
                                                    ))
                                                )}
                                            </div>
                                            {/* Footer - Créer un client */}
                                            <div className="border-t border-zinc-100 bg-zinc-50 flex-shrink-0">
                                                {showQuickClientForm ? (
                                                    <div className="p-4 space-y-3">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-sm font-medium text-zinc-900">Nouveau client</span>
                                                            <button
                                                                type="button"
                                                                onClick={() => setShowQuickClientForm(false)}
                                                                className="p-1 hover:bg-zinc-200 rounded-lg"
                                                            >
                                                                <X className="h-4 w-4 text-zinc-400" />
                                                            </button>
                                                        </div>
                                                        {/* Toggle Particulier / Société */}
                                                        <div className="flex gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={() => setNewClientData(prev => ({ ...prev, type: "particulier" }))}
                                                                className={`flex-1 h-9 text-sm font-medium rounded-lg transition-colors ${newClientData.type === "particulier"
                                                                    ? "bg-zinc-900 text-white"
                                                                    : "bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50"
                                                                    }`}
                                                            >
                                                                Particulier
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => setNewClientData(prev => ({ ...prev, type: "societe" }))}
                                                                className={`flex-1 h-9 text-sm font-medium rounded-lg transition-colors ${newClientData.type === "societe"
                                                                    ? "bg-zinc-900 text-white"
                                                                    : "bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50"
                                                                    }`}
                                                            >
                                                                Société
                                                            </button>
                                                        </div>
                                                        {newClientData.type === "particulier" ? (
                                                            <div className="grid grid-cols-2 gap-2">
                                                                <input
                                                                    type="text"
                                                                    value={newClientData.prenom}
                                                                    onChange={(e) => setNewClientData(prev => ({ ...prev, prenom: e.target.value }))}
                                                                    placeholder="Prénom"
                                                                    className="h-10 px-3 bg-white border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
                                                                />
                                                                <input
                                                                    type="text"
                                                                    value={newClientData.nom}
                                                                    onChange={(e) => setNewClientData(prev => ({ ...prev, nom: e.target.value }))}
                                                                    placeholder="Nom *"
                                                                    className="h-10 px-3 bg-white border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
                                                                />
                                                            </div>
                                                        ) : (
                                                            <input
                                                                type="text"
                                                                value={newClientData.nom}
                                                                onChange={(e) => setNewClientData(prev => ({ ...prev, nom: e.target.value }))}
                                                                placeholder="Raison sociale *"
                                                                className="w-full h-10 px-3 bg-white border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
                                                            />
                                                        )}
                                                        <input
                                                            type="tel"
                                                            value={newClientData.telephone}
                                                            onChange={(e) => setNewClientData(prev => ({ ...prev, telephone: e.target.value }))}
                                                            placeholder="Téléphone"
                                                            className="w-full h-10 px-3 bg-white border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={handleQuickClientCreate}
                                                            disabled={!newClientData.nom || creatingClient}
                                                            className="w-full h-10 bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-300 text-white text-sm font-medium rounded-xl flex items-center justify-center gap-2 transition-colors"
                                                        >
                                                            {creatingClient ? (
                                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                            ) : (
                                                                <>
                                                                    <Plus className="h-4 w-4" />
                                                                    Ajouter et sélectionner
                                                                </>
                                                            )}
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="p-3">
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowQuickClientForm(true)}
                                                            className="w-full h-10 bg-zinc-900 hover:bg-zinc-800 text-white text-sm font-medium rounded-xl flex items-center justify-center gap-2 transition-colors"
                                                        >
                                                            <Plus className="h-4 w-4" />
                                                            Créer un client
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Véhicule */}
                            <div>
                                <label className="block text-[13px] font-medium text-zinc-500 mb-2">Véhicule</label>
                                {selectedVehicle ? (
                                    <div className="h-16 px-4 bg-zinc-50 border border-zinc-200 rounded-2xl flex items-center justify-between group hover:border-zinc-300 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-white border border-zinc-200 flex items-center justify-center">
                                                <BrandLogo brand={selectedVehicle.marque} size={20} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-zinc-900">
                                                    {selectedVehicle.marque} {selectedVehicle.modele}
                                                </p>
                                                <p className="text-xs text-zinc-400 font-mono">{selectedVehicle.plaque}</p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSelectedVehicle(null)
                                                setVehicleHistory([])
                                            }}
                                            className="p-1.5 hover:bg-zinc-200 rounded-lg transition-all"
                                        >
                                            <X className="h-4 w-4 text-zinc-400" />
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => setShowVehiclePicker(true)}
                                        className="w-full h-16 border border-dashed border-zinc-300 rounded-2xl flex items-center justify-center gap-2 hover:border-zinc-400 hover:bg-zinc-50/50 transition-all"
                                    >
                                        <Car className="h-4 w-4 text-zinc-400" />
                                        <span className="text-sm text-zinc-500">Sélectionner</span>
                                    </button>
                                )}

                                {/* Vehicle Picker */}
                                {showVehiclePicker && (
                                    <>
                                        <div className="fixed inset-0 bg-black/20 z-40 backdrop-blur-sm" onClick={() => setShowVehiclePicker(false)} />
                                        <div className="fixed sm:absolute inset-x-4 bottom-4 sm:inset-auto sm:top-full sm:left-0 sm:right-0 sm:mt-2 bg-white rounded-2xl border border-zinc-200 shadow-2xl z-50 overflow-hidden">
                                            <div className="p-4 border-b border-zinc-100">
                                                <div className="relative">
                                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                                                    <input
                                                        type="text"
                                                        value={vehicleSearch}
                                                        onChange={(e) => setVehicleSearch(e.target.value)}
                                                        placeholder="Rechercher..."
                                                        className="w-full h-10 pl-10 pr-4 bg-zinc-50 border-0 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
                                                        autoFocus
                                                    />
                                                </div>
                                            </div>
                                            <div className="max-h-64 overflow-y-auto">
                                                {filteredVehicles.length === 0 ? (
                                                    <div className="p-8 text-center text-sm text-zinc-400">Aucun véhicule</div>
                                                ) : (
                                                    filteredVehicles.map((vehicle) => (
                                                        <button
                                                            key={vehicle.id}
                                                            type="button"
                                                            onClick={() => selectVehicle(vehicle)}
                                                            className="w-full p-4 flex items-center gap-3 hover:bg-zinc-50 transition-colors text-left"
                                                        >
                                                            <div className="w-8 h-8 rounded-full bg-zinc-50 flex items-center justify-center">
                                                                <BrandLogo brand={vehicle.marque} size={18} />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-medium text-zinc-900 truncate">
                                                                    {vehicle.marque} {vehicle.modele}
                                                                </p>
                                                                <p className="text-xs text-zinc-400 font-mono">{vehicle.plaque}</p>
                                                            </div>
                                                            <ChevronRight className="h-4 w-4 text-zinc-300" />
                                                        </button>
                                                    ))
                                                )}
                                            </div>
                                            <div className="border-t border-zinc-100 bg-zinc-50 p-3">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        if (!selectedClient) return
                                                        setShowQuickVehicleForm(true)
                                                    }}
                                                    className={cn(
                                                        "w-full h-10 text-sm font-medium rounded-xl flex items-center justify-center gap-2 transition-colors",
                                                        selectedClient
                                                            ? "bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-white"
                                                            : "bg-zinc-200 text-zinc-500 cursor-not-allowed"
                                                    )}
                                                >
                                                    <Plus className="h-4 w-4" />
                                                    Ajouter un véhicule rapidement
                                                </button>
                                                {!selectedClient && (
                                                    <p className="text-[11px] text-zinc-400 mt-2 text-center">Sélectionnez un client d’abord</p>
                                                )}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Vehicle History - Subtle */}
                        {selectedVehicle && vehicleHistory.length > 0 && (
                            <div className="flex items-center gap-3 text-xs text-zinc-400">
                                <History className="h-3.5 w-3.5" />
                                <span>Dernières : </span>
                                {vehicleHistory.map((rep, i) => (
                                    <span key={rep.id} className="text-zinc-500">
                                        {rep.description?.slice(0, 20)}{(rep.description?.length || 0) > 20 ? '...' : ''}
                                        {i < vehicleHistory.length - 1 && ' • '}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-[13px] font-medium text-zinc-500 mb-2">
                            Description <span className="text-zinc-300">*</span>
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => updateField("description", e.target.value)}
                            placeholder="Décrivez l'intervention..."
                            rows={3}
                            className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-2xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent placeholder:text-zinc-300"
                        />
                    </div>

                    {/* Templates - Minimal Pills */}
                    <div>
                        <label className="block text-[13px] font-medium text-zinc-500 mb-3">Raccourcis</label>
                        <div className="flex flex-wrap gap-2">
                            {repairTemplates.map((template) => (
                                <button
                                    key={template.id}
                                    type="button"
                                    onClick={() => applyTemplate(template)}
                                    className="h-9 px-4 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-sm font-medium rounded-full transition-colors"
                                >
                                    {template.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Priorité - Minimal Segmented Control */}
                    <div>
                        <label className="block text-[13px] font-medium text-zinc-500 mb-3">Priorité</label>
                        <div className="inline-flex p-1 bg-zinc-100 rounded-xl">
                            {priorites.map(p => (
                                <button
                                    key={p.id}
                                    type="button"
                                    onClick={() => updateField("priorite", p.id)}
                                    className={cn(
                                        "px-5 py-2 text-sm font-medium rounded-lg transition-all",
                                        formData.priorite === p.id
                                            ? "bg-white text-zinc-900 shadow-sm"
                                            : "text-zinc-500 hover:text-zinc-700"
                                    )}
                                >
                                    {p.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Mécanicien assigné */}
                    <div>
                        <label className="block text-[13px] font-medium text-zinc-500 mb-2">
                            Mécanicien assigné
                        </label>
                        {personnel.length > 0 ? (
                            <select
                                value={formData.mecanicienId}
                                onChange={(e) => updateField("mecanicienId", e.target.value)}
                                className="w-full h-11 px-4 bg-white border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 appearance-none"
                            >
                                <option value="">Non assigné</option>
                                {personnel.map(p => (
                                    <option key={p.id} value={p.id}>
                                        {p.prenom} {p.nom} ({p.role})
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <div className="space-y-2">
                                <div className="h-11 px-4 bg-zinc-50 border border-zinc-200 rounded-xl text-sm flex items-center text-zinc-500">
                                    Aucun mécanicien disponible
                                </div>
                                <Link
                                    href="/personnel"
                                    className="inline-flex h-9 px-3 text-[13px] font-medium text-[var(--accent-primary)] hover:text-[var(--accent-hover)]"
                                >
                                    Ajouter un mécanicien
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Dates - Clean Grid */}
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-1">
                            <label className="block text-[13px] font-medium text-zinc-500 mb-2">
                                <Clock className="inline h-3.5 w-3.5 mr-1 opacity-50" />
                                Sortie prévue
                            </label>
                            <div className="flex flex-col sm:flex-row gap-2">
                                <input
                                    type="date"
                                    value={formData.dateSortiePrevue}
                                    onChange={(e) => updateField("dateSortiePrevue", e.target.value)}
                                    min={new Date().toISOString().split('T')[0]}
                                    className="w-full min-w-0 h-11 px-3 bg-white border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
                                />
                                <input
                                    type="time"
                                    value={formData.heureSortiePrevue}
                                    onChange={(e) => updateField("heureSortiePrevue", e.target.value)}
                                    className="w-full min-w-0 h-11 px-3 bg-white border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-[13px] font-medium text-zinc-500 mb-2">
                                <Timer className="inline h-3.5 w-3.5 mr-1 opacity-50" />
                                Durée estimée
                            </label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    value={Math.floor(formData.tempsEstime / 60)}
                                    onChange={(e) => updateField("tempsEstime", parseInt(e.target.value || "0") * 60 + (formData.tempsEstime % 60))}
                                    min={0}
                                    className="w-16 h-11 px-3 bg-white border border-zinc-200 rounded-xl text-sm text-center"
                                />
                                <span className="text-sm text-zinc-400">h</span>
                                <input
                                    type="number"
                                    value={formData.tempsEstime % 60}
                                    onChange={(e) => updateField("tempsEstime", Math.floor(formData.tempsEstime / 60) * 60 + parseInt(e.target.value || "0"))}
                                    min={0}
                                    max={59}
                                    step={15}
                                    className="w-16 h-11 px-3 bg-white border border-zinc-200 rounded-xl text-sm text-center"
                                />
                                <span className="text-sm text-zinc-400">min</span>
                            </div>
                        </div>
                    </div>

                    {/* Lignes - Ultra Clean */}
                    <div className="relative">
                        <div className="flex items-center justify-between mb-4">
                            <label className="text-[13px] font-medium text-zinc-500">Lignes</label>
                            {/* Desktop buttons */}
                            <div className="hidden sm:flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => addLigne("main_oeuvre")}
                                    className="h-8 px-3 text-xs font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors flex items-center gap-1.5"
                                >
                                    <Plus className="h-3.5 w-3.5" />
                                    Main d'œuvre
                                </button>
                                <button
                                    type="button"
                                    onClick={() => addLigne("piece")}
                                    className="h-8 px-3 text-xs font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors flex items-center gap-1.5"
                                >
                                    <Plus className="h-3.5 w-3.5" />
                                    Pièce
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowCatalogPicker(true)}
                                    className="h-8 px-3 text-xs font-medium bg-zinc-900 text-white hover:bg-zinc-800 rounded-lg transition-colors flex items-center gap-1.5"
                                >
                                    <Search className="h-3.5 w-3.5" />
                                    Catalogue
                                </button>
                            </div>
                        </div>

                        {/* Mobile action buttons - Full width */}
                        <div className="sm:hidden grid grid-cols-2 gap-2 mb-4">
                            <button
                                type="button"
                                onClick={() => addLigne("main_oeuvre")}
                                className="h-12 px-4 text-sm font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl transition-colors flex items-center justify-center gap-2"
                            >
                                <Plus className="h-4 w-4" />
                                Main d'œuvre
                            </button>
                            <button
                                type="button"
                                onClick={() => addLigne("piece")}
                                className="h-12 px-4 text-sm font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl transition-colors flex items-center justify-center gap-2"
                            >
                                <Plus className="h-4 w-4" />
                                Pièce
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowCatalogPicker(true)}
                                className="col-span-2 h-12 px-4 text-sm font-medium bg-zinc-900 text-white hover:bg-zinc-800 rounded-xl transition-colors flex items-center justify-center gap-2"
                            >
                                <Search className="h-4 w-4" />
                                Depuis le catalogue
                            </button>
                        </div>

                        {/* Catalog Picker Modal */}
                        {showCatalogPicker && (
                            <>
                                <div className="fixed inset-0 bg-black/20 z-40 backdrop-blur-sm" onClick={() => setShowCatalogPicker(false)} />
                                <div className="fixed inset-x-4 inset-y-20 sm:inset-auto sm:absolute sm:top-12 sm:right-0 sm:w-96 bg-white rounded-2xl border border-zinc-200 shadow-2xl z-50 flex flex-col max-h-[70vh] sm:max-h-96 overflow-hidden">
                                    <div className="p-4 border-b border-zinc-100">
                                        <div className="flex items-center justify-between mb-3">
                                            <h3 className="text-sm font-semibold text-zinc-900">Catalogue pièces</h3>
                                            <button
                                                type="button"
                                                onClick={() => setShowCatalogPicker(false)}
                                                className="p-1.5 hover:bg-zinc-100 rounded-lg"
                                            >
                                                <X className="h-4 w-4 text-zinc-400" />
                                            </button>
                                        </div>
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                                            <input
                                                type="text"
                                                value={catalogSearch}
                                                onChange={(e) => setCatalogSearch(e.target.value)}
                                                placeholder="Rechercher une pièce..."
                                                className="w-full h-10 pl-10 pr-4 bg-zinc-50 border-0 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
                                                autoFocus
                                            />
                                        </div>
                                    </div>
                                    <div className="flex-1 overflow-y-auto">
                                        {filteredArticles.length === 0 ? (
                                            <div className="p-8 text-center">
                                                <p className="text-sm text-zinc-400">
                                                    {articles.length === 0 ? "Aucun article dans le catalogue" : "Aucun résultat"}
                                                </p>
                                                {articles.length === 0 && (
                                                    <Link href="/inventory" className="text-xs text-zinc-500 hover:text-zinc-700 underline mt-2 inline-block">
                                                        Gérer le stock
                                                    </Link>
                                                )}
                                            </div>
                                        ) : (
                                            filteredArticles.map((article) => (
                                                <button
                                                    key={article.id}
                                                    type="button"
                                                    onClick={() => addFromCatalog(article)}
                                                    className="w-full p-4 flex items-center justify-between hover:bg-zinc-50 transition-colors text-left border-b border-zinc-50 last:border-0"
                                                >
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-zinc-900 truncate">{article.designation}</p>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            <span className="text-xs text-zinc-400">{article.reference}</span>
                                                            {article.categorie && (
                                                                <>
                                                                    <span className="text-zinc-300">•</span>
                                                                    <span className="text-xs text-zinc-400">{article.categorie}</span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="text-right ml-4">
                                                        <p className="text-sm font-medium text-zinc-900">{article.prixVenteHT.toFixed(2)} €</p>
                                                        <p className="text-[10px] text-zinc-400">Stock: {article.quantiteStock}</p>
                                                    </div>
                                                </button>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </>
                        )}

                        {lignes.length === 0 ? (
                            <div className="py-12 text-center border border-dashed border-zinc-200 rounded-2xl">
                                <p className="text-sm text-zinc-400">Aucune ligne</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {lignes.map((ligne) => (
                                    <div
                                        key={ligne.id}
                                        className={cn(
                                            "p-4 rounded-2xl space-y-3 sm:space-y-0 border-l-4",
                                            ligne.type === "main_oeuvre"
                                                ? "bg-blue-50/60 border-blue-400"
                                                : "bg-emerald-50/60 border-emerald-400"
                                        )}
                                    >
                                        {/* Header mobile: Type indicator + Delete */}
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
                                                type="button"
                                                onClick={() => removeLigne(ligne.id)}
                                                className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>

                                        {/* Desktop: Single row layout */}
                                        <div className="hidden sm:flex items-center gap-3">
                                            <span className={cn(
                                                "px-2.5 py-1 rounded-full text-[11px] font-semibold",
                                                ligne.type === "main_oeuvre"
                                                    ? "bg-blue-100 text-blue-700"
                                                    : "bg-emerald-100 text-emerald-700"
                                            )}>
                                                {ligne.type === "main_oeuvre" ? "Main d'œuvre" : "Pièce"}
                                            </span>
                                            <input
                                                type="text"
                                                value={ligne.designation}
                                                onChange={(e) => updateLigne(ligne.id, "designation", e.target.value)}
                                                placeholder={ligne.type === "main_oeuvre" ? "Main d'œuvre..." : "Pièce..."}
                                                className="flex-1 h-9 px-3 bg-white border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-zinc-900"
                                            />
                                            <input
                                                type="number"
                                                value={ligne.quantite}
                                                onChange={(e) => updateLigne(ligne.id, "quantite", parseFloat(e.target.value) || 0)}
                                                min={ligne.type === "main_oeuvre" ? 0.5 : 1}
                                                step={ligne.type === "main_oeuvre" ? 0.5 : 1}
                                                className="w-16 h-9 px-2 bg-white border border-zinc-200 rounded-lg text-sm text-center"
                                            />
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    value={ligne.prixUnitaireHT}
                                                    onChange={(e) => updateLigne(ligne.id, "prixUnitaireHT", parseFloat(e.target.value) || 0)}
                                                    step={0.01}
                                                    className="w-24 h-9 px-3 pr-6 bg-white border border-zinc-200 rounded-lg text-sm text-right"
                                                />
                                                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-zinc-400">€</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeLigne(ligne.id)}
                                                className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-lg transition-all"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>

                                        {/* Mobile: Stacked layout */}
                                        <div className="sm:hidden space-y-3">
                                            {/* Designation - Full width */}
                                            <input
                                                type="text"
                                                value={ligne.designation}
                                                onChange={(e) => updateLigne(ligne.id, "designation", e.target.value)}
                                                placeholder={ligne.type === "main_oeuvre" ? "Désignation main d'œuvre..." : "Désignation pièce..."}
                                                className="w-full h-11 px-4 bg-white border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
                                            />

                                            {/* Quantité + Prix - Side by side */}
                                            <div className="flex gap-3">
                                                <div className="flex-1">
                                                    <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                                                        {ligne.type === "main_oeuvre" ? "Heures" : "Quantité"}
                                                    </label>
                                                    <input
                                                        type="number"
                                                        value={ligne.quantite}
                                                        onChange={(e) => updateLigne(ligne.id, "quantite", parseFloat(e.target.value) || 0)}
                                                        min={ligne.type === "main_oeuvre" ? 0.5 : 1}
                                                        step={ligne.type === "main_oeuvre" ? 0.5 : 1}
                                                        className="w-full h-11 px-4 bg-white border border-zinc-200 rounded-xl text-sm text-center"
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <label className="block text-[11px] font-medium text-zinc-400 mb-1">Prix HT</label>
                                                    <div className="relative">
                                                        <input
                                                            type="number"
                                                            value={ligne.prixUnitaireHT}
                                                            onChange={(e) => updateLigne(ligne.id, "prixUnitaireHT", parseFloat(e.target.value) || 0)}
                                                            step={0.01}
                                                            className="w-full h-11 px-4 pr-8 bg-white border border-zinc-200 rounded-xl text-sm text-right"
                                                        />
                                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">€</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Total for this line */}
                                            <div className="flex justify-between items-center pt-2">
                                                <span className="text-xs text-zinc-400">Sous-total HT</span>
                                                <span className="text-sm font-semibold text-zinc-900">
                                                    {(ligne.quantite * ligne.prixUnitaireHT).toFixed(2)} €
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-[13px] font-medium text-zinc-500 mb-2">
                            <FileText className="inline h-3.5 w-3.5 mr-1 opacity-50" />
                            Notes internes
                        </label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => updateField("notes", e.target.value)}
                            placeholder="Optionnel..."
                            rows={2}
                            className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-2xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-zinc-900 placeholder:text-zinc-300"
                        />
                    </div>
                </form>

                {/* Sidebar - Recap (desktop) */}
                <div className="hidden lg:block">
                    <div className="sticky top-6 bg-white rounded-3xl border border-[var(--border-light)] p-6" style={{ boxShadow: 'var(--shadow-sm)' }}>
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <p className="text-[11px] uppercase tracking-wider text-[var(--text-muted)]">Récapitulatif</p>
                                <p className="text-sm font-semibold text-[var(--text-primary)]">Synthèse de l’intervention</p>
                            </div>
                            <div className="w-9 h-9 rounded-xl bg-[var(--accent-soft)] flex items-center justify-center">
                                <Wrench className="h-4 w-4 text-[var(--accent-primary)]" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-light)]">
                                <p className="text-[11px] text-[var(--text-tertiary)]">Main d’œuvre</p>
                                <p className="text-[15px] font-semibold text-[var(--text-primary)]">{totalMO.toFixed(2)} €</p>
                            </div>
                            <div className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-light)]">
                                <p className="text-[11px] text-[var(--text-tertiary)]">Pièces</p>
                                <p className="text-[15px] font-semibold text-[var(--text-primary)]">{totalPieces.toFixed(2)} €</p>
                            </div>
                        </div>

                        <div className="mt-4 space-y-2 text-sm">
                            <div className="flex justify-between text-[var(--text-tertiary)]">
                                <span>HT</span>
                                <span className="text-[var(--text-primary)]">{totalHT.toFixed(2)} €</span>
                            </div>
                            <div className="flex justify-between text-[var(--text-tertiary)]">
                                <span>TVA {tauxTVA}%</span>
                                <span className="text-[var(--text-primary)]">{tva.toFixed(2)} €</span>
                            </div>
                        </div>

                        <div className="mt-5 p-4 rounded-2xl bg-[var(--accent-soft)] border border-[var(--border-light)]">
                            <p className="text-[11px] text-[var(--text-tertiary)] uppercase tracking-wide">Total TTC</p>
                            <div className="flex items-baseline justify-between">
                                <span className="text-2xl font-semibold text-[var(--text-primary)]">{totalTTC.toFixed(2)} €</span>
                                <span className="text-[11px] text-[var(--text-tertiary)]">à facturer</span>
                            </div>
                        </div>

                        <button
                            type="submit"
                            form="repair-form"
                            disabled={!canSubmit}
                            className="w-full h-11 mt-6 bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] disabled:bg-zinc-300 text-white text-sm font-medium rounded-xl flex items-center justify-center gap-2 transition-colors"
                        >
                            {isLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <>
                                    <Save className="h-4 w-4" />
                                    Créer
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Quick Vehicle Modal */}
            {showQuickVehicleForm && (
                <div className="fixed inset-0 z-50">
                    <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowQuickVehicleForm(false)} />
                    <div className="absolute inset-x-0 bottom-0 sm:inset-0 sm:flex sm:items-center sm:justify-center p-0 sm:p-4 safe-area-bottom">
                        <div className="w-full sm:max-w-xl bg-white rounded-t-2xl sm:rounded-2xl border border-zinc-200 shadow-2xl overflow-hidden max-h-[85vh] sm:max-h-[90vh] flex flex-col">
                        <div className="p-4 sm:p-5 border-b border-zinc-100 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-semibold text-zinc-900">Ajout rapide d’un véhicule</p>
                                <p className="text-xs text-zinc-500">Renseignez l’immatriculation pour pré-remplir</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowQuickVehicleForm(false)}
                                className="p-2 hover:bg-zinc-100 rounded-lg"
                            >
                                <X className="h-4 w-4 text-zinc-400" />
                            </button>
                        </div>

                        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto">
                            <div className="grid sm:grid-cols-3 gap-3">
                                <div className="sm:col-span-2">
                                    <label className="block text-[12px] font-medium text-zinc-500 mb-1.5">Immatriculation *</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={newVehicleData.plaque}
                                            onChange={(e) => setNewVehicleData(prev => ({ ...prev, plaque: e.target.value.toUpperCase() }))}
                                            placeholder="AA-123-BB"
                                            className="flex-1 h-11 px-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-mono text-center"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleVehicleLookup}
                                            disabled={vehicleLookupLoading || !newVehicleData.plaque}
                                            className="h-11 px-3 bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-white rounded-xl flex items-center gap-2 text-sm"
                                        >
                                            {vehicleLookupLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                                            <span className="hidden sm:inline">Rechercher</span>
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[12px] font-medium text-zinc-500 mb-1.5">Année</label>
                                    <input
                                        type="number"
                                        value={newVehicleData.annee}
                                        onChange={(e) => setNewVehicleData(prev => ({ ...prev, annee: parseInt(e.target.value || "0") }))}
                                        min={1900}
                                        max={new Date().getFullYear() + 1}
                                        className="w-full h-11 px-3 bg-white border border-zinc-200 rounded-xl text-sm"
                                    />
                                </div>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[12px] font-medium text-zinc-500 mb-1.5">Marque *</label>
                                    <input
                                        type="text"
                                        value={newVehicleData.marque}
                                        onChange={(e) => setNewVehicleData(prev => ({ ...prev, marque: e.target.value }))}
                                        placeholder="Renault"
                                        className="w-full h-11 px-3 bg-white border border-zinc-200 rounded-xl text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[12px] font-medium text-zinc-500 mb-1.5">Modèle *</label>
                                    <input
                                        type="text"
                                        value={newVehicleData.modele}
                                        onChange={(e) => setNewVehicleData(prev => ({ ...prev, modele: e.target.value }))}
                                        placeholder="Clio"
                                        className="w-full h-11 px-3 bg-white border border-zinc-200 rounded-xl text-sm"
                                    />
                                </div>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[12px] font-medium text-zinc-500 mb-1.5">Version</label>
                                    <input
                                        type="text"
                                        value={newVehicleData.version}
                                        onChange={(e) => setNewVehicleData(prev => ({ ...prev, version: e.target.value }))}
                                        placeholder="1.5 dCi 90ch"
                                        className="w-full h-11 px-3 bg-white border border-zinc-200 rounded-xl text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[12px] font-medium text-zinc-500 mb-1.5">VIN</label>
                                    <input
                                        type="text"
                                        value={newVehicleData.vin}
                                        onChange={(e) => setNewVehicleData(prev => ({ ...prev, vin: e.target.value.toUpperCase() }))}
                                        placeholder="VF1XXXXXX00000000"
                                        className="w-full h-11 px-3 bg-white border border-zinc-200 rounded-xl text-sm font-mono"
                                    />
                                </div>
                            </div>

                            <div className="grid sm:grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-[12px] font-medium text-zinc-500 mb-1.5">Carburant</label>
                                    <select
                                        value={newVehicleData.carburant}
                                        onChange={(e) => setNewVehicleData(prev => ({ ...prev, carburant: e.target.value }))}
                                        className="w-full h-11 px-3 bg-white border border-zinc-200 rounded-xl text-sm"
                                    >
                                        <option>Essence</option>
                                        <option>Diesel</option>
                                        <option>Hybride</option>
                                        <option>Électrique</option>
                                        <option>GPL</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[12px] font-medium text-zinc-500 mb-1.5">Couleur</label>
                                    <input
                                        type="text"
                                        value={newVehicleData.couleur}
                                        onChange={(e) => setNewVehicleData(prev => ({ ...prev, couleur: e.target.value }))}
                                        placeholder="Gris"
                                        className="w-full h-11 px-3 bg-white border border-zinc-200 rounded-xl text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[12px] font-medium text-zinc-500 mb-1.5">Kilométrage</label>
                                    <input
                                        type="number"
                                        value={newVehicleData.kilometrage}
                                        onChange={(e) => setNewVehicleData(prev => ({ ...prev, kilometrage: parseInt(e.target.value || "0") }))}
                                        min={0}
                                        className="w-full h-11 px-3 bg-white border border-zinc-200 rounded-xl text-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-zinc-50 border-t border-zinc-100 flex items-center justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setShowQuickVehicleForm(false)}
                                className="h-10 px-4 text-sm text-zinc-600 hover:text-zinc-900 rounded-lg"
                            >
                                Annuler
                            </button>
                            <button
                                type="button"
                                onClick={handleQuickVehicleCreate}
                                disabled={creatingVehicle || !selectedClient?.id || !newVehicleData.plaque || !newVehicleData.marque || !newVehicleData.modele}
                                className="h-10 px-5 bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] disabled:bg-zinc-300 text-white text-sm font-medium rounded-lg flex items-center gap-2"
                            >
                                {creatingVehicle ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                                Ajouter le véhicule
                            </button>
                        </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Mobile Bottom Bar - Recap */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-zinc-100 px-4 py-3 safe-area-bottom z-40">
                <div className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                        <p className="text-[10px] text-zinc-400 uppercase tracking-wide">Total TTC</p>
                        <p className="text-lg font-semibold text-zinc-900 truncate">{totalTTC.toFixed(2)} €</p>
                        <p className="text-[11px] text-zinc-500">HT {totalHT.toFixed(2)} € • TVA {tauxTVA}%</p>
                    </div>
                    <button
                        type="submit"
                        form="repair-form"
                        disabled={!canSubmit}
                        className="h-11 px-6 bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] disabled:bg-zinc-200 disabled:text-zinc-400 text-white text-sm font-medium rounded-xl flex items-center gap-2 transition-colors"
                    >
                        {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <>
                                <Save className="h-4 w-4" />
                                Créer
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default function NewRepairPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-zinc-300" />
            </div>
        }>
            <NewRepairForm />
        </Suspense>
    )
}
