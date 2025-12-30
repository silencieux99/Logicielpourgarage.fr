"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import {
    ArrowLeft,
    Edit,
    Trash2,
    Phone,
    Mail,
    MapPin,
    Star,
    Car,
    Wrench,
    FileText,
    Calendar,
    Plus,
    ChevronRight,
    Loader2,
    MessageSquare,
    Clock,
    TrendingUp,
    AlertCircle,
    Check,
    X,
    Euro,
    Save
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"
import {
    getClient,
    updateClient,
    deleteClient,
    Client,
    getVehiculesByClient,
    Vehicule,
    getReparations,
    getDocuments,
    Reparation,
    Document
} from "@/lib/database"

export default function ClientDetailPage() {
    const { id } = useParams()
    const router = useRouter()
    const { garage } = useAuth()

    const [client, setClient] = useState<Client | null>(null)
    const [vehicles, setVehicles] = useState<Vehicule[]>([])
    const [reparations, setReparations] = useState<Reparation[]>([])
    const [documents, setDocuments] = useState<Document[]>([])
    const [loading, setLoading] = useState(true)
    const [isEditing, setIsEditing] = useState(false)
    const [saving, setSaving] = useState(false)
    const [deleteConfirm, setDeleteConfirm] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [activeTab, setActiveTab] = useState<"info" | "vehicles" | "history" | "documents">("info")

    // Form state pour l'édition
    const [editForm, setEditForm] = useState({
        civilite: "",
        prenom: "",
        nom: "",
        email: "",
        telephone: "",
        adresse: "",
        codePostal: "",
        ville: "",
        notes: "",
        isVIP: false
    })

    useEffect(() => {
        if (id && typeof id === 'string') {
            loadClientData(id)
        }
    }, [id])

    const loadClientData = async (clientId: string) => {
        setLoading(true)
        try {
            const clientData = await getClient(clientId)
            if (!clientData) {
                router.push('/clients')
                return
            }

            setClient(clientData)
            setEditForm({
                civilite: clientData.civilite || "",
                prenom: clientData.prenom || "",
                nom: clientData.nom || "",
                email: clientData.email || "",
                telephone: clientData.telephone || "",
                adresse: clientData.adresse || "",
                codePostal: clientData.codePostal || "",
                ville: clientData.ville || "",
                notes: clientData.notes || "",
                isVIP: clientData.isVIP || false
            })

            // Charger les données associées
            const [vehiclesData, reparationsData, documentsData] = await Promise.all([
                getVehiculesByClient(clientId),
                garage?.id ? getReparations(garage.id) : Promise.resolve([]),
                garage?.id ? getDocuments(garage.id) : Promise.resolve([])
            ])

            setVehicles(vehiclesData)
            setReparations(reparationsData.filter(r => r.clientId === clientId))
            setDocuments(documentsData.filter(d => d.clientId === clientId))
        } catch (error) {
            console.error("Erreur chargement client:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        if (!client?.id) return

        setSaving(true)
        try {
            await updateClient(client.id, editForm)
            setClient(prev => prev ? { ...prev, ...editForm } : null)
            setIsEditing(false)
        } catch (error) {
            console.error("Erreur mise à jour client:", error)
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async () => {
        if (!client?.id) return

        setDeleting(true)
        try {
            await deleteClient(client.id)
            router.push('/clients')
        } catch (error) {
            console.error("Erreur suppression client:", error)
            setDeleting(false)
        }
    }

    const toggleVIP = async () => {
        if (!client?.id) return

        const newVIP = !client.isVIP
        try {
            await updateClient(client.id, { isVIP: newVIP })
            setClient(prev => prev ? { ...prev, isVIP: newVIP } : null)
            setEditForm(prev => ({ ...prev, isVIP: newVIP }))
        } catch (error) {
            console.error("Erreur mise à jour VIP:", error)
        }
    }

    // Statistiques
    const totalCA = documents
        .filter(d => d.type === 'facture' && d.statut === 'paye')
        .reduce((sum, d) => sum + d.montantTTC, 0)

    const reparationsEnCours = reparations.filter(r => r.statut === 'en_cours' || r.statut === 'en_attente').length
    const devisEnAttente = documents.filter(d => d.type === 'devis' && d.statut === 'envoye').length

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
            </div>
        )
    }

    if (!client) {
        return (
            <div className="text-center py-20">
                <AlertCircle className="h-12 w-12 text-zinc-300 mx-auto mb-4" />
                <h2 className="text-lg font-semibold text-zinc-900 mb-2">Client introuvable</h2>
                <p className="text-sm text-zinc-500 mb-4">Ce client n'existe pas ou a été supprimé.</p>
                <Link href="/clients" className="text-sm text-zinc-900 font-medium hover:underline">
                    Retour à la liste
                </Link>
            </div>
        )
    }

    const clientName = `${client.civilite || ''} ${client.prenom || ''} ${client.nom}`.trim()

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/clients" className="p-2 hover:bg-zinc-100 rounded-lg transition-colors">
                        <ArrowLeft className="h-5 w-5 text-zinc-600" />
                    </Link>
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-zinc-200 to-zinc-300 flex items-center justify-center">
                            <span className="text-lg font-bold text-zinc-600">
                                {client.prenom?.[0]}{client.nom?.[0]}
                            </span>
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl sm:text-2xl font-bold text-zinc-900">{clientName}</h1>
                                <button
                                    onClick={toggleVIP}
                                    className={cn(
                                        "p-1.5 rounded-lg transition-colors",
                                        client.isVIP ? "bg-amber-100 text-amber-600" : "hover:bg-zinc-100 text-zinc-400"
                                    )}
                                    title={client.isVIP ? "Retirer VIP" : "Marquer VIP"}
                                >
                                    <Star className={cn("h-5 w-5", client.isVIP && "fill-amber-500")} />
                                </button>
                            </div>
                            <p className="text-sm text-zinc-500">
                                Client depuis le {client.createdAt.toDate().toLocaleDateString('fr-FR')}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {!isEditing ? (
                        <>
                            <button
                                onClick={() => setIsEditing(true)}
                                className="hidden sm:flex h-10 px-4 text-zinc-700 text-sm font-medium rounded-xl hover:bg-zinc-100 items-center gap-2 transition-colors"
                            >
                                <Edit className="h-4 w-4" />
                                Modifier
                            </button>
                            <button
                                onClick={() => setDeleteConfirm(true)}
                                className="hidden sm:flex h-10 px-4 text-red-600 text-sm font-medium rounded-xl hover:bg-red-50 items-center gap-2 transition-colors"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={() => setIsEditing(false)}
                                className="h-10 px-4 text-zinc-700 text-sm font-medium rounded-xl hover:bg-zinc-100 flex items-center gap-2 transition-colors"
                            >
                                <X className="h-4 w-4" />
                                Annuler
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="h-10 px-4 bg-zinc-900 hover:bg-zinc-800 text-white text-sm font-medium rounded-xl flex items-center gap-2 transition-colors"
                            >
                                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                Enregistrer
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white rounded-xl border border-zinc-200 p-4">
                    <div className="flex items-center gap-2 text-zinc-500 mb-1">
                        <Car className="h-4 w-4" />
                        <span className="text-xs">Véhicules</span>
                    </div>
                    <p className="text-2xl font-bold text-zinc-900">{vehicles.length}</p>
                </div>
                <div className="bg-white rounded-xl border border-zinc-200 p-4">
                    <div className="flex items-center gap-2 text-zinc-500 mb-1">
                        <Wrench className="h-4 w-4" />
                        <span className="text-xs">Réparations</span>
                    </div>
                    <p className="text-2xl font-bold text-zinc-900">{reparations.length}</p>
                </div>
                <div className="bg-white rounded-xl border border-zinc-200 p-4">
                    <div className="flex items-center gap-2 text-zinc-500 mb-1">
                        <Euro className="h-4 w-4" />
                        <span className="text-xs">CA Total</span>
                    </div>
                    <p className="text-2xl font-bold text-zinc-900">{totalCA.toLocaleString()} €</p>
                </div>
                <div className="bg-white rounded-xl border border-zinc-200 p-4">
                    <div className="flex items-center gap-2 text-zinc-500 mb-1">
                        <FileText className="h-4 w-4" />
                        <span className="text-xs">Documents</span>
                    </div>
                    <p className="text-2xl font-bold text-zinc-900">{documents.length}</p>
                </div>
            </div>

            {/* Alerts */}
            {(reparationsEnCours > 0 || devisEnAttente > 0) && (
                <div className="flex flex-wrap gap-3">
                    {reparationsEnCours > 0 && (
                        <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg">
                            <Wrench className="h-4 w-4 text-amber-600" />
                            <span className="text-sm text-amber-800">{reparationsEnCours} réparation(s) en cours</span>
                        </div>
                    )}
                    {devisEnAttente > 0 && (
                        <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                            <FileText className="h-4 w-4 text-blue-600" />
                            <span className="text-sm text-blue-800">{devisEnAttente} devis en attente</span>
                        </div>
                    )}
                </div>
            )}

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2">
                <Link
                    href={`/repairs/new?clientId=${client.id}`}
                    className="h-10 px-4 bg-amber-100 text-amber-700 text-sm font-medium rounded-xl flex items-center gap-2 hover:bg-amber-200 transition-colors"
                >
                    <Wrench className="h-4 w-4" />
                    Nouvelle réparation
                </Link>
                <Link
                    href={`/invoices/new?type=devis&clientId=${client.id}`}
                    className="h-10 px-4 bg-blue-100 text-blue-700 text-sm font-medium rounded-xl flex items-center gap-2 hover:bg-blue-200 transition-colors"
                >
                    <FileText className="h-4 w-4" />
                    Nouveau devis
                </Link>
                <Link
                    href={`/vehicles/new?clientId=${client.id}`}
                    className="h-10 px-4 bg-emerald-100 text-emerald-700 text-sm font-medium rounded-xl flex items-center gap-2 hover:bg-emerald-200 transition-colors"
                >
                    <Car className="h-4 w-4" />
                    Ajouter véhicule
                </Link>
                <Link
                    href={`/schedule/new?clientId=${client.id}`}
                    className="h-10 px-4 bg-violet-100 text-violet-700 text-sm font-medium rounded-xl flex items-center gap-2 hover:bg-violet-200 transition-colors"
                >
                    <Calendar className="h-4 w-4" />
                    Planifier RDV
                </Link>
                {client.telephone && (
                    <a
                        href={`tel:${client.telephone}`}
                        className="h-10 px-4 bg-zinc-100 text-zinc-700 text-sm font-medium rounded-xl flex items-center gap-2 hover:bg-zinc-200 transition-colors"
                    >
                        <Phone className="h-4 w-4" />
                        Appeler
                    </a>
                )}
            </div>

            {/* Tabs */}
            <div className="border-b border-zinc-200">
                <div className="flex gap-1 -mb-px">
                    {[
                        { id: "info", label: "Informations", icon: null },
                        { id: "vehicles", label: "Véhicules", icon: Car, count: vehicles.length },
                        { id: "history", label: "Historique", icon: Wrench, count: reparations.length },
                        { id: "documents", label: "Documents", icon: FileText, count: documents.length },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={cn(
                                "px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2",
                                activeTab === tab.id
                                    ? "border-zinc-900 text-zinc-900"
                                    : "border-transparent text-zinc-500 hover:text-zinc-700"
                            )}
                        >
                            {tab.icon && <tab.icon className="h-4 w-4" />}
                            {tab.label}
                            {tab.count !== undefined && tab.count > 0 && (
                                <span className="px-2 py-0.5 bg-zinc-100 text-zinc-600 text-xs rounded-full">
                                    {tab.count}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab Content */}
            <div className="pb-8">
                {/* Info Tab */}
                {activeTab === "info" && (
                    <div className="bg-white rounded-2xl border border-zinc-200 divide-y divide-zinc-100">
                        {/* Contact */}
                        <div className="p-6">
                            <h3 className="text-sm font-semibold text-zinc-900 mb-4">Contact</h3>
                            {isEditing ? (
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-zinc-600 mb-1">Téléphone</label>
                                        <input
                                            type="tel"
                                            value={editForm.telephone}
                                            onChange={(e) => setEditForm(prev => ({ ...prev, telephone: e.target.value }))}
                                            className="w-full h-10 px-3 border border-zinc-300 rounded-lg text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-zinc-600 mb-1">Email</label>
                                        <input
                                            type="email"
                                            value={editForm.email}
                                            onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                                            className="w-full h-10 px-3 border border-zinc-300 rounded-lg text-sm"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {client.telephone && (
                                        <a href={`tel:${client.telephone}`} className="flex items-center gap-3 text-sm text-zinc-600 hover:text-zinc-900">
                                            <Phone className="h-4 w-4 text-zinc-400" />
                                            {client.telephone}
                                        </a>
                                    )}
                                    {client.email && (
                                        <a href={`mailto:${client.email}`} className="flex items-center gap-3 text-sm text-zinc-600 hover:text-zinc-900">
                                            <Mail className="h-4 w-4 text-zinc-400" />
                                            {client.email}
                                        </a>
                                    )}
                                    {!client.telephone && !client.email && (
                                        <p className="text-sm text-zinc-400">Aucun contact renseigné</p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Adresse */}
                        <div className="p-6">
                            <h3 className="text-sm font-semibold text-zinc-900 mb-4">Adresse</h3>
                            {isEditing ? (
                                <div className="space-y-3">
                                    <input
                                        type="text"
                                        value={editForm.adresse}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, adresse: e.target.value }))}
                                        placeholder="Adresse"
                                        className="w-full h-10 px-3 border border-zinc-300 rounded-lg text-sm"
                                    />
                                    <div className="grid grid-cols-3 gap-3">
                                        <input
                                            type="text"
                                            value={editForm.codePostal}
                                            onChange={(e) => setEditForm(prev => ({ ...prev, codePostal: e.target.value }))}
                                            placeholder="Code postal"
                                            className="h-10 px-3 border border-zinc-300 rounded-lg text-sm"
                                        />
                                        <input
                                            type="text"
                                            value={editForm.ville}
                                            onChange={(e) => setEditForm(prev => ({ ...prev, ville: e.target.value }))}
                                            placeholder="Ville"
                                            className="col-span-2 h-10 px-3 border border-zinc-300 rounded-lg text-sm"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-start gap-3">
                                    <MapPin className="h-4 w-4 text-zinc-400 mt-0.5" />
                                    {client.adresse || client.ville ? (
                                        <div className="text-sm text-zinc-600">
                                            {client.adresse && <p>{client.adresse}</p>}
                                            {(client.codePostal || client.ville) && (
                                                <p>{client.codePostal} {client.ville}</p>
                                            )}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-zinc-400">Aucune adresse renseignée</p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Notes */}
                        <div className="p-6">
                            <h3 className="text-sm font-semibold text-zinc-900 mb-4">Notes internes</h3>
                            {isEditing ? (
                                <textarea
                                    value={editForm.notes}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, notes: e.target.value }))}
                                    placeholder="Notes sur ce client..."
                                    rows={3}
                                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm resize-none"
                                />
                            ) : client.notes ? (
                                <p className="text-sm text-zinc-600 whitespace-pre-wrap">{client.notes}</p>
                            ) : (
                                <p className="text-sm text-zinc-400">Aucune note</p>
                            )}
                        </div>
                    </div>
                )}

                {/* Vehicles Tab */}
                {activeTab === "vehicles" && (
                    <div className="space-y-4">
                        {vehicles.length === 0 ? (
                            <div className="bg-white rounded-2xl border border-zinc-200 p-8 text-center">
                                <Car className="h-12 w-12 text-zinc-300 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-zinc-900 mb-2">Aucun véhicule</h3>
                                <p className="text-sm text-zinc-500 mb-4">Ce client n'a pas encore de véhicule enregistré</p>
                                <Link
                                    href={`/vehicles/new?clientId=${client.id}`}
                                    className="inline-flex h-10 px-5 bg-zinc-900 text-white text-sm font-medium rounded-xl items-center gap-2"
                                >
                                    <Plus className="h-4 w-4" />
                                    Ajouter un véhicule
                                </Link>
                            </div>
                        ) : (
                            vehicles.map(vehicle => (
                                <Link
                                    key={vehicle.id}
                                    href={`/vehicles/${vehicle.id}`}
                                    className="flex items-center gap-4 p-4 bg-white rounded-xl border border-zinc-200 hover:border-zinc-300 transition-colors"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                                        <Car className="h-6 w-6 text-emerald-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-semibold text-zinc-900">
                                            {vehicle.marque} {vehicle.modele}
                                        </p>
                                        <p className="text-xs text-zinc-500">
                                            {vehicle.plaque} • {vehicle.annee} • {vehicle.kilometrage?.toLocaleString()} km
                                        </p>
                                    </div>
                                    <ChevronRight className="h-5 w-5 text-zinc-400" />
                                </Link>
                            ))
                        )}
                    </div>
                )}

                {/* History Tab */}
                {activeTab === "history" && (
                    <div className="space-y-4">
                        {reparations.length === 0 ? (
                            <div className="bg-white rounded-2xl border border-zinc-200 p-8 text-center">
                                <Wrench className="h-12 w-12 text-zinc-300 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-zinc-900 mb-2">Aucune réparation</h3>
                                <p className="text-sm text-zinc-500 mb-4">Aucun historique de réparation pour ce client</p>
                                <Link
                                    href={`/repairs/new?clientId=${client.id}`}
                                    className="inline-flex h-10 px-5 bg-zinc-900 text-white text-sm font-medium rounded-xl items-center gap-2"
                                >
                                    <Plus className="h-4 w-4" />
                                    Nouvelle réparation
                                </Link>
                            </div>
                        ) : (
                            reparations.map(reparation => (
                                <Link
                                    key={reparation.id}
                                    href={`/repairs/${reparation.id}`}
                                    className="flex items-center gap-4 p-4 bg-white rounded-xl border border-zinc-200 hover:border-zinc-300 transition-colors"
                                >
                                    <div className={cn(
                                        "w-12 h-12 rounded-xl flex items-center justify-center",
                                        reparation.statut === 'termine' || reparation.statut === 'facture' ? "bg-emerald-100" :
                                            reparation.statut === 'en_cours' ? "bg-amber-100" : "bg-zinc-100"
                                    )}>
                                        <Wrench className={cn(
                                            "h-6 w-6",
                                            reparation.statut === 'termine' || reparation.statut === 'facture' ? "text-emerald-600" :
                                                reparation.statut === 'en_cours' ? "text-amber-600" : "text-zinc-600"
                                        )} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-semibold text-zinc-900">{reparation.description}</p>
                                        <p className="text-xs text-zinc-500">
                                            {reparation.numero} • {reparation.dateEntree.toDate().toLocaleDateString('fr-FR')}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-semibold text-zinc-900">{reparation.montantTTC} €</p>
                                        <span className={cn(
                                            "text-xs px-2 py-0.5 rounded-full",
                                            reparation.statut === 'termine' || reparation.statut === 'facture' ? "bg-emerald-100 text-emerald-700" :
                                                reparation.statut === 'en_cours' ? "bg-amber-100 text-amber-700" : "bg-zinc-100 text-zinc-600"
                                        )}>
                                            {reparation.statut === 'en_attente' && 'En attente'}
                                            {reparation.statut === 'en_cours' && 'En cours'}
                                            {reparation.statut === 'termine' && 'Terminé'}
                                            {reparation.statut === 'facture' && 'Facturé'}
                                        </span>
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                )}

                {/* Documents Tab */}
                {activeTab === "documents" && (
                    <div className="space-y-4">
                        {documents.length === 0 ? (
                            <div className="bg-white rounded-2xl border border-zinc-200 p-8 text-center">
                                <FileText className="h-12 w-12 text-zinc-300 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-zinc-900 mb-2">Aucun document</h3>
                                <p className="text-sm text-zinc-500 mb-4">Aucun devis ou facture pour ce client</p>
                                <Link
                                    href={`/invoices/new?type=devis&clientId=${client.id}`}
                                    className="inline-flex h-10 px-5 bg-zinc-900 text-white text-sm font-medium rounded-xl items-center gap-2"
                                >
                                    <Plus className="h-4 w-4" />
                                    Nouveau devis
                                </Link>
                            </div>
                        ) : (
                            documents.map(doc => (
                                <Link
                                    key={doc.id}
                                    href={`/invoices/${doc.id}`}
                                    className="flex items-center gap-4 p-4 bg-white rounded-xl border border-zinc-200 hover:border-zinc-300 transition-colors"
                                >
                                    <div className={cn(
                                        "w-12 h-12 rounded-xl flex items-center justify-center",
                                        doc.type === 'facture' ? "bg-emerald-100" : "bg-blue-100"
                                    )}>
                                        <FileText className={cn(
                                            "h-6 w-6",
                                            doc.type === 'facture' ? "text-emerald-600" : "text-blue-600"
                                        )} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-semibold text-zinc-900">
                                            {doc.type === 'facture' ? 'Facture' : 'Devis'} {doc.numero}
                                        </p>
                                        <p className="text-xs text-zinc-500">
                                            {doc.dateEmission.toDate().toLocaleDateString('fr-FR')}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-semibold text-zinc-900">{doc.montantTTC} €</p>
                                        <span className={cn(
                                            "text-xs px-2 py-0.5 rounded-full",
                                            doc.statut === 'paye' ? "bg-emerald-100 text-emerald-700" :
                                                doc.statut === 'en_retard' ? "bg-red-100 text-red-700" :
                                                    doc.statut === 'envoye' ? "bg-blue-100 text-blue-700" : "bg-zinc-100 text-zinc-600"
                                        )}>
                                            {doc.statut === 'brouillon' && 'Brouillon'}
                                            {doc.statut === 'envoye' && 'Envoyé'}
                                            {doc.statut === 'accepte' && 'Accepté'}
                                            {doc.statut === 'refuse' && 'Refusé'}
                                            {doc.statut === 'paye' && 'Payé'}
                                            {doc.statut === 'en_retard' && 'En retard'}
                                        </span>
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <>
                    <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setDeleteConfirm(false)} />
                    <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-md bg-white rounded-2xl shadow-xl z-50 p-6">
                        <h3 className="text-lg font-semibold text-zinc-900 mb-2">Supprimer ce client ?</h3>
                        <p className="text-sm text-zinc-500 mb-6">
                            Cette action est irréversible. Toutes les données de {clientName} seront supprimées.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setDeleteConfirm(false)}
                                className="h-10 px-4 text-zinc-700 text-sm font-medium rounded-lg hover:bg-zinc-100 transition-colors"
                                disabled={deleting}
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={deleting}
                                className="h-10 px-4 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg flex items-center gap-2 transition-colors"
                            >
                                {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                Supprimer
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
