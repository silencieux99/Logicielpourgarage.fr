"use client"

import { useState, useEffect, Suspense } from "react"
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
    Eye,
    X,
    Search,
    Printer
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"
import { InvoiceTemplate, InvoiceTemplateData } from "@/components/InvoiceTemplate"
import {
    getGarageByUserId,
    getGarageConfig,
    getClients,
    getVehiculesByClient,
    getClient,
    createDocument,
    updateGarageConfig,
    Client,
    Vehicule,
    Reparation,
    LigneReparation,
    Document as GarageDocument
} from "@/lib/database"
import { doc, getDoc, collection, query, where, getDocs, Timestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"

interface LigneDocument {
    id: string
    designation: string
    description?: string
    quantite: number
    prixUnitaireHT: number
    tauxTVA: number
}

function NewInvoiceContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const type = (searchParams.get("type") || "devis") as "devis" | "facture"
    const reparationId = searchParams.get("reparationId")
    const { user } = useAuth()

    const [isLoading, setIsLoading] = useState(false)
    const [showPreview, setShowPreview] = useState(true)
    const [showPrintView, setShowPrintView] = useState(false)
    const [garageId, setGarageId] = useState<string | null>(null)
    const [configId, setConfigId] = useState<string | null>(null)

    // Garage et config
    const [garageData, setGarageData] = useState({
        nom: "",
        adresse: "",
        codePostal: "",
        ville: "",
        telephone: "",
        email: "",
        siret: "",
        tva: "",
        logo: ""
    })

    const [documentConfig, setDocumentConfig] = useState({
        prefixeDevis: "D",
        prefixeFacture: "F",
        prochainNumeroDevis: 1,
        prochainNumeroFacture: 1,
        tauxTVA: 20,
        mentionsLegales: ""
    })

    // Clients et véhicules
    const [clients, setClients] = useState<Client[]>([])
    const [vehicules, setVehicules] = useState<Vehicule[]>([])
    const [showClientPicker, setShowClientPicker] = useState(false)
    const [showVehiculePicker, setShowVehiculePicker] = useState(false)
    const [clientSearch, setClientSearch] = useState("")

    const [formData, setFormData] = useState({
        clientId: "",
        vehiculeId: "",
        dateEcheance: "",
        notes: "",
    })

    const [selectedClient, setSelectedClient] = useState<Client | null>(null)
    const [selectedVehicule, setSelectedVehicule] = useState<Vehicule | null>(null)

    const [lignes, setLignes] = useState<LigneDocument[]>([
        { id: "1", designation: "", description: "", quantite: 1, prixUnitaireHT: 0, tauxTVA: 20 }
    ])

    // Charger les données du garage
    useEffect(() => {
        const loadGarageData = async () => {
            if (!user) return

            try {
                const garage = await getGarageByUserId(user.uid)
                if (garage) {
                    setGarageData({
                        nom: garage.nom || "",
                        adresse: garage.adresse || "",
                        codePostal: garage.codePostal || "",
                        ville: garage.ville || "",
                        telephone: garage.telephone || "",
                        email: garage.email || "",
                        siret: garage.siret || "",
                        tva: garage.numeroTVA || "",
                        logo: garage.logo || ""
                    })

                    // Charger les clients
                    const clientsList = await getClients(garage.id!)
                    setClients(clientsList)

                    if (garage.id) {
                        setGarageId(garage.id)
                        const config = await getGarageConfig(garage.id)
                        if (config) {
                            setConfigId(config.id || null)
                            setDocumentConfig({
                                prefixeDevis: config.prefixeDevis || "D",
                                prefixeFacture: config.prefixeFacture || "F",
                                prochainNumeroDevis: config.prochainNumeroDevis || 1,
                                prochainNumeroFacture: config.prochainNumeroFacture || 1,
                                tauxTVA: config.tauxTVA || 20,
                                mentionsLegales: config.mentionsLegales || ""
                            })

                            // Mettre à jour le taux TVA par défaut des lignes
                            setLignes(prev => prev.map(l => ({ ...l, tauxTVA: config.tauxTVA || 20 })))
                        }
                    }
                }
            } catch (error) {
                console.error("Erreur chargement données:", error)
            }
        }

        loadGarageData()
    }, [user])

    // Charger les véhicules du client sélectionné
    useEffect(() => {
        const loadVehicules = async () => {
            if (!selectedClient?.id) {
                setVehicules([])
                return
            }

            try {
                const vehiculesList = await getVehiculesByClient(selectedClient.id)
                setVehicules(vehiculesList)
            } catch (error) {
                console.error("Erreur chargement véhicules:", error)
            }
        }

        loadVehicules()
    }, [selectedClient])

    // Charger les données de réparation si reparationId est fourni
    useEffect(() => {
        const loadRepairData = async () => {
            if (!reparationId || !user) return

            try {
                // Charger la réparation
                const repairDoc = await getDoc(doc(db, 'reparations', reparationId))
                if (!repairDoc.exists()) return

                const repairData = repairDoc.data() as Reparation

                // Charger et sélectionner le client
                if (repairData.clientId) {
                    const clientData = await getClient(repairData.clientId)
                    if (clientData) {
                        setSelectedClient(clientData)
                        setFormData(prev => ({ ...prev, clientId: clientData.id || "" }))
                    }
                }

                // Charger et sélectionner le véhicule
                if (repairData.vehiculeId) {
                    const vehiculeDoc = await getDoc(doc(db, 'vehicules', repairData.vehiculeId))
                    if (vehiculeDoc.exists()) {
                        const vehiculeData = { id: vehiculeDoc.id, ...vehiculeDoc.data() } as Vehicule
                        setSelectedVehicule(vehiculeData)
                        setFormData(prev => ({ ...prev, vehiculeId: vehiculeData.id || "" }))
                    }
                }

                // Charger les lignes de réparation
                const lignesQuery = query(
                    collection(db, 'lignesReparation'),
                    where('reparationId', '==', reparationId)
                )
                const lignesSnapshot = await getDocs(lignesQuery)

                if (!lignesSnapshot.empty) {
                    const repairLignes = lignesSnapshot.docs.map(d => {
                        const data = d.data() as LigneReparation
                        return {
                            id: d.id,
                            designation: data.designation,
                            description: "",
                            quantite: data.quantite,
                            prixUnitaireHT: data.prixUnitaireHT,
                            tauxTVA: data.tauxTVA || 20
                        }
                    })
                    setLignes(repairLignes)
                } else if (repairData.description) {
                    // Si pas de lignes mais description, utiliser celle-ci
                    setLignes([{
                        id: "1",
                        designation: repairData.description,
                        description: "",
                        quantite: 1,
                        prixUnitaireHT: repairData.montantHT || 0,
                        tauxTVA: 20
                    }])
                }

            } catch (error) {
                console.error("Erreur chargement réparation:", error)
            }
        }

        loadRepairData()
    }, [reparationId, user])

    const updateField = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const addLigne = () => {
        setLignes([...lignes, {
            id: Date.now().toString(),
            designation: "",
            description: "",
            quantite: 1,
            prixUnitaireHT: 0,
            tauxTVA: documentConfig.tauxTVA
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

    const selectClient = (client: Client) => {
        setSelectedClient(client)
        setFormData(prev => ({ ...prev, clientId: client.id || "" }))
        setShowClientPicker(false)
        setSelectedVehicule(null)
    }

    const selectVehicule = (vehicule: Vehicule) => {
        setSelectedVehicule(vehicule)
        setFormData(prev => ({ ...prev, vehiculeId: vehicule.id || "" }))
        setShowVehiculePicker(false)
    }

    const totalHT = lignes.reduce((sum, l) => sum + (l.quantite * l.prixUnitaireHT), 0)
    const totalTVA = lignes.reduce((sum, l) => sum + (l.quantite * l.prixUnitaireHT * (l.tauxTVA / 100)), 0)
    const totalTTC = totalHT + totalTVA

    // Numéro du document
    const numeroDocument = type === "facture"
        ? `${documentConfig.prefixeFacture}-${String(documentConfig.prochainNumeroFacture).padStart(5, '0')}`
        : `${documentConfig.prefixeDevis}-${String(documentConfig.prochainNumeroDevis).padStart(5, '0')}`

    // Data pour le template
    const templateData: InvoiceTemplateData = {
        type,
        numero: numeroDocument,
        dateEmission: new Date(),
        dateEcheance: formData.dateEcheance ? new Date(formData.dateEcheance) : undefined,
        garage: garageData,
        client: {
            nom: selectedClient ? `${selectedClient.prenom} ${selectedClient.nom}` : "Sélectionnez un client",
            adresse: selectedClient?.adresse,
            codePostal: selectedClient?.codePostal,
            ville: selectedClient?.ville,
            email: selectedClient?.email
        },
        vehicule: selectedVehicule ? {
            plaque: selectedVehicule.plaque,
            marque: selectedVehicule.marque,
            modele: selectedVehicule.modele
        } : undefined,
        lignes: lignes.filter(l => l.designation).map(l => ({
            id: l.id,
            designation: l.designation,
            description: l.description,
            quantite: l.quantite,
            prixUnitaireHT: l.prixUnitaireHT
        })),
        totalHT,
        tauxTVA: documentConfig.tauxTVA,
        totalTVA,
        totalTTC,
        mentionsLegales: documentConfig.mentionsLegales,
        notes: formData.notes
    }

    const handleSubmit = async (action: "save" | "send") => {
        if (!garageId || !selectedClient?.id) return

        setIsLoading(true)

        try {
            // Créer le document - filtrer les champs undefined
            const documentData = {
                garageId,
                clientId: selectedClient.id,
                type,
                numero: numeroDocument,
                statut: action === 'send' ? 'envoye' : 'brouillon',
                dateEmission: Timestamp.now(),
                montantHT: totalHT,
                montantTVA: totalTVA,
                montantTTC: totalTTC,
                ...(selectedVehicule?.id && { vehiculeId: selectedVehicule.id }),
                ...(reparationId && { reparationId }),
                ...(formData.dateEcheance && { dateEcheance: Timestamp.fromDate(new Date(formData.dateEcheance)) }),
                ...(formData.notes && { notes: formData.notes })
            } as Omit<GarageDocument, 'id' | 'createdAt' | 'updatedAt'>

            const documentLignes = lignes.filter(l => l.designation).map(l => ({
                designation: l.designation,
                quantite: l.quantite,
                prixUnitaireHT: l.prixUnitaireHT,
                tauxTVA: l.tauxTVA,
                montantHT: l.quantite * l.prixUnitaireHT,
                ...(l.description && { description: l.description })
            }))

            await createDocument(documentData, documentLignes)

            // Mettre à jour le prochain numéro
            if (configId) {
                if (type === 'devis') {
                    await updateGarageConfig(configId, { prochainNumeroDevis: documentConfig.prochainNumeroDevis + 1 })
                } else {
                    await updateGarageConfig(configId, { prochainNumeroFacture: documentConfig.prochainNumeroFacture + 1 })
                }
            }

            router.push("/invoices")
        } catch (error) {
            console.error("Erreur:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const hasContent = lignes.some(l => l.designation && l.prixUnitaireHT > 0)

    const filteredClients = clients.filter(c =>
        clientSearch === "" ||
        `${c.prenom} ${c.nom}`.toLowerCase().includes(clientSearch.toLowerCase()) ||
        c.email?.toLowerCase().includes(clientSearch.toLowerCase()) ||
        c.telephone?.includes(clientSearch)
    )

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
                            N° {numeroDocument}
                        </p>
                    </div>
                </div>

                {/* Preview Toggle - Desktop */}
                <button
                    onClick={() => setShowPreview(!showPreview)}
                    className={cn(
                        "hidden xl:flex h-10 px-4 text-sm font-medium rounded-xl items-center gap-2 transition-colors",
                        showPreview
                            ? "bg-zinc-900 text-white hover:bg-zinc-800"
                            : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                    )}
                >
                    <Eye className="h-4 w-4" />
                    Aperçu {showPreview ? "ON" : "OFF"}
                </button>
            </div>

            <div className={cn("grid gap-6", showPreview ? "xl:grid-cols-2" : "")}>
                {/* Form */}
                <div className="space-y-6">
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
                            {/* Client */}
                            {selectedClient ? (
                                <div className="p-4 bg-zinc-50 rounded-xl relative">
                                    <button
                                        onClick={() => { setSelectedClient(null); setSelectedVehicule(null); }}
                                        className="absolute top-2 right-2 p-1 hover:bg-zinc-200 rounded-lg"
                                    >
                                        <X className="h-4 w-4 text-zinc-500" />
                                    </button>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-zinc-200 rounded-full flex items-center justify-center">
                                            <User className="h-5 w-5 text-zinc-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-zinc-900">{selectedClient.prenom} {selectedClient.nom}</p>
                                            <p className="text-sm text-zinc-500">{selectedClient.email || selectedClient.telephone}</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => setShowClientPicker(true)}
                                    className="h-24 border-2 border-dashed border-zinc-300 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-zinc-400 hover:bg-zinc-50 transition-colors"
                                >
                                    <User className="h-6 w-6 text-zinc-400" />
                                    <span className="text-sm font-medium text-zinc-600">Sélectionner un client</span>
                                </button>
                            )}

                            {/* Véhicule */}
                            {selectedVehicule ? (
                                <div className="p-4 bg-zinc-50 rounded-xl relative">
                                    <button
                                        onClick={() => setSelectedVehicule(null)}
                                        className="absolute top-2 right-2 p-1 hover:bg-zinc-200 rounded-lg"
                                    >
                                        <X className="h-4 w-4 text-zinc-500" />
                                    </button>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-zinc-200 rounded-full flex items-center justify-center">
                                            <Car className="h-5 w-5 text-zinc-600" />
                                        </div>
                                        <div>
                                            <p className="font-mono font-bold text-zinc-900">{selectedVehicule.plaque}</p>
                                            <p className="text-sm text-zinc-500">{selectedVehicule.marque} {selectedVehicule.modele}</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => selectedClient && setShowVehiculePicker(true)}
                                    disabled={!selectedClient}
                                    className={cn(
                                        "h-24 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 transition-colors",
                                        selectedClient
                                            ? "border-zinc-300 hover:border-zinc-400 hover:bg-zinc-50"
                                            : "border-zinc-200 bg-zinc-50 cursor-not-allowed opacity-50"
                                    )}
                                >
                                    <Car className="h-6 w-6 text-zinc-400" />
                                    <span className="text-sm font-medium text-zinc-600">
                                        {selectedClient ? "Véhicule (optionnel)" : "Sélectionnez d'abord un client"}
                                    </span>
                                </button>
                            )}
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
                                <div className="col-span-5">Désignation</div>
                                <div className="col-span-2 text-center">Qté</div>
                                <div className="col-span-2 text-right">Prix HT</div>
                                <div className="col-span-2 text-right">TVA</div>
                                <div className="col-span-1"></div>
                            </div>

                            {lignes.map((ligne) => (
                                <div key={ligne.id} className="grid sm:grid-cols-12 gap-3 p-3 bg-zinc-50 rounded-xl">
                                    <div className="sm:col-span-5">
                                        <input
                                            type="text"
                                            value={ligne.designation}
                                            onChange={(e) => updateLigne(ligne.id, "designation", e.target.value)}
                                            placeholder="Description..."
                                            className="w-full h-10 px-3 bg-white border border-zinc-200 rounded-lg text-sm"
                                        />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="sm:hidden text-xs text-zinc-500 mb-1 block">Quantité</label>
                                        <input
                                            type="number"
                                            value={ligne.quantite}
                                            onChange={(e) => updateLigne(ligne.id, "quantite", parseFloat(e.target.value) || 0)}
                                            min={0.01}
                                            step={0.01}
                                            className="w-full h-10 px-3 bg-white border border-zinc-200 rounded-lg text-sm text-center"
                                        />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="sm:hidden text-xs text-zinc-500 mb-1 block">Prix HT</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                value={ligne.prixUnitaireHT}
                                                onChange={(e) => updateLigne(ligne.id, "prixUnitaireHT", parseFloat(e.target.value) || 0)}
                                                min={0}
                                                step={0.01}
                                                className="w-full h-10 px-3 pr-8 bg-white border border-zinc-200 rounded-lg text-sm text-right"
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400">€</span>
                                        </div>
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="sm:hidden text-xs text-zinc-500 mb-1 block">TVA</label>
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

                    {/* Notes & Totaux */}
                    <div className="grid sm:grid-cols-2 gap-6">
                        <div className="bg-white rounded-2xl border border-zinc-200 p-6">
                            <h2 className="text-[15px] font-semibold text-zinc-900 mb-4">
                                Notes
                            </h2>
                            <textarea
                                value={formData.notes}
                                onChange={(e) => updateField("notes", e.target.value)}
                                placeholder="Notes visibles sur le document..."
                                rows={4}
                                className="w-full px-4 py-3 bg-white border border-zinc-300 rounded-xl text-sm resize-none"
                            />
                            <div className="mt-4">
                                <label className="block text-sm font-medium text-zinc-700 mb-2">
                                    {type === "devis" ? "Validité" : "Échéance"}
                                </label>
                                <input
                                    type="date"
                                    value={formData.dateEcheance}
                                    onChange={(e) => updateField("dateEcheance", e.target.value)}
                                    className="w-full h-11 px-4 bg-white border border-zinc-300 rounded-xl text-sm"
                                />
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl border border-zinc-200 p-6">
                            <h2 className="text-[15px] font-semibold text-zinc-900 mb-4">
                                Totaux
                            </h2>

                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-zinc-500">Total HT</span>
                                    <span className="font-medium font-mono">{totalHT.toFixed(2)} €</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-zinc-500">TVA</span>
                                    <span className="font-medium font-mono">{totalTVA.toFixed(2)} €</span>
                                </div>
                                <div className="flex justify-between pt-3 border-t border-zinc-200">
                                    <span className="text-lg font-semibold text-zinc-900">Total TTC</span>
                                    <span className="text-xl font-bold text-zinc-900 font-mono">{totalTTC.toFixed(2)} €</span>
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
                                    disabled={!hasContent || !selectedClient || isLoading}
                                    className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 disabled:bg-zinc-300 text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors"
                                >
                                    <Send className="h-4 w-4" />
                                    Envoyer au client
                                </button>

                                <button
                                    onClick={() => {
                                        setShowPrintView(true)
                                        setTimeout(() => {
                                            window.print()
                                            setShowPrintView(false)
                                        }, 100)
                                    }}
                                    disabled={!hasContent}
                                    className="w-full h-12 bg-zinc-100 hover:bg-zinc-200 disabled:bg-zinc-50 text-zinc-700 disabled:text-zinc-400 text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors"
                                >
                                    <Printer className="h-4 w-4" />
                                    Imprimer / PDF
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Live Preview */}
                {showPreview && (
                    <div className="hidden xl:block">
                        <div className="sticky top-6">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Aperçu en temps réel</span>
                            </div>

                            <InvoiceTemplate data={templateData} scale={0.95} />
                        </div>
                    </div>
                )}
            </div>

            {/* Client Picker Modal */}
            {showClientPicker && (
                <>
                    <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setShowClientPicker(false)} />
                    <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-md bg-white rounded-2xl shadow-xl z-50 max-h-[80vh] overflow-hidden flex flex-col">
                        <div className="p-4 border-b border-zinc-200">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-semibold text-zinc-900">Sélectionner un client</h3>
                                <button onClick={() => setShowClientPicker(false)} className="p-1 hover:bg-zinc-100 rounded-lg">
                                    <X className="h-5 w-5 text-zinc-500" />
                                </button>
                            </div>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                                <input
                                    type="text"
                                    value={clientSearch}
                                    onChange={(e) => setClientSearch(e.target.value)}
                                    placeholder="Rechercher..."
                                    className="w-full h-10 pl-10 pr-4 border border-zinc-200 rounded-lg text-sm"
                                    autoFocus
                                />
                            </div>
                        </div>
                        <div className="overflow-y-auto flex-1 p-2">
                            {filteredClients.length === 0 ? (
                                <p className="text-center text-zinc-500 py-8">Aucun client trouvé</p>
                            ) : (
                                <div className="space-y-1">
                                    {filteredClients.map(client => (
                                        <button
                                            key={client.id}
                                            onClick={() => selectClient(client)}
                                            className="w-full flex items-center gap-3 p-3 hover:bg-zinc-50 rounded-xl text-left transition-colors"
                                        >
                                            <div className="w-10 h-10 bg-zinc-200 rounded-full flex items-center justify-center flex-shrink-0">
                                                <span className="text-sm font-medium text-zinc-600">
                                                    {client.prenom?.[0]}{client.nom?.[0]}
                                                </span>
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-medium text-zinc-900">{client.prenom} {client.nom}</p>
                                                <p className="text-sm text-zinc-500 truncate">{client.email || client.telephone}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}

            {/* Vehicule Picker Modal */}
            {showVehiculePicker && (
                <>
                    <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setShowVehiculePicker(false)} />
                    <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-md bg-white rounded-2xl shadow-xl z-50 max-h-[80vh] overflow-hidden flex flex-col">
                        <div className="p-4 border-b border-zinc-200">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-zinc-900">Sélectionner un véhicule</h3>
                                <button onClick={() => setShowVehiculePicker(false)} className="p-1 hover:bg-zinc-100 rounded-lg">
                                    <X className="h-5 w-5 text-zinc-500" />
                                </button>
                            </div>
                        </div>
                        <div className="overflow-y-auto flex-1 p-2">
                            {vehicules.length === 0 ? (
                                <p className="text-center text-zinc-500 py-8">Aucun véhicule pour ce client</p>
                            ) : (
                                <div className="space-y-1">
                                    {vehicules.map(vehicule => (
                                        <button
                                            key={vehicule.id}
                                            onClick={() => selectVehicule(vehicule)}
                                            className="w-full flex items-center gap-3 p-3 hover:bg-zinc-50 rounded-xl text-left transition-colors"
                                        >
                                            <div className="w-10 h-10 bg-zinc-200 rounded-full flex items-center justify-center flex-shrink-0">
                                                <Car className="h-5 w-5 text-zinc-600" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-mono font-bold text-zinc-900">{vehicule.plaque}</p>
                                                <p className="text-sm text-zinc-500">{vehicule.marque} {vehicule.modele}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}

            {/* Print View - Only visible during printing */}
            {showPrintView && (
                <div
                    id="print-container"
                    className="fixed inset-0 bg-white z-[9999] overflow-auto"
                    style={{ padding: '20px' }}
                >
                    <InvoiceTemplate data={templateData} scale={1} />
                </div>
            )}
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
