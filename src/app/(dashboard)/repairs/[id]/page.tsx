"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import {
    ArrowLeft,
    Edit,
    Trash2,
    Wrench,
    Car,
    User,
    Clock,
    Calendar,
    Euro,
    FileText,
    Plus,
    ChevronRight,
    Loader2,
    CheckCircle,
    AlertTriangle,
    Play,
    Pause,
    Save,
    X,
    Printer,
    Share2,
    Phone,
    MessageSquare
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"
import {
    getClient,
    updateReparation,
    Client,
    Vehicule,
    Reparation,
    LigneReparation
} from "@/lib/database"
import {
    doc,
    getDoc,
    collection,
    query,
    where,
    getDocs,
    Timestamp
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import { BrandLogo } from "@/components/ui/brand-logo"

const statusConfig = {
    en_attente: { label: "En attente", color: "bg-amber-100 text-amber-700", bgColor: "bg-amber-50", icon: Clock },
    en_cours: { label: "En cours", color: "bg-blue-100 text-blue-700", bgColor: "bg-blue-50", icon: Wrench },
    termine: { label: "Terminé", color: "bg-emerald-100 text-emerald-700", bgColor: "bg-emerald-50", icon: CheckCircle },
    facture: { label: "Facturé", color: "bg-violet-100 text-violet-700", bgColor: "bg-violet-50", icon: FileText },
}

const prioriteConfig = {
    normal: { label: "Normal", color: "bg-zinc-100 text-zinc-700" },
    prioritaire: { label: "Prioritaire", color: "bg-amber-100 text-amber-700" },
    urgent: { label: "Urgent", color: "bg-red-100 text-red-700" },
}

export default function RepairDetailPage() {
    const { id } = useParams()
    const router = useRouter()
    const { garage } = useAuth()

    const [repair, setRepair] = useState<Reparation | null>(null)
    const [client, setClient] = useState<Client | null>(null)
    const [vehicule, setVehicule] = useState<Vehicule | null>(null)
    const [lignes, setLignes] = useState<LigneReparation[]>([])
    const [loading, setLoading] = useState(true)
    const [updating, setUpdating] = useState(false)
    const [deleteConfirm, setDeleteConfirm] = useState(false)

    useEffect(() => {
        if (id && typeof id === 'string') {
            loadRepairData(id)
        }
    }, [id])

    const loadRepairData = async (repairId: string) => {
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

            // Charger le client
            if (repairData.clientId) {
                const clientData = await getClient(repairData.clientId)
                setClient(clientData)
            }

            // Charger le véhicule
            if (repairData.vehiculeId) {
                const vehiculeDoc = await getDoc(doc(db, 'vehicules', repairData.vehiculeId))
                if (vehiculeDoc.exists()) {
                    setVehicule({ id: vehiculeDoc.id, ...vehiculeDoc.data() } as Vehicule)
                }
            }

            // Charger les lignes de réparation
            const lignesQuery = query(
                collection(db, 'lignesReparation'),
                where('reparationId', '==', repairId)
            )
            const lignesSnapshot = await getDocs(lignesQuery)
            setLignes(lignesSnapshot.docs.map(d => ({ id: d.id, ...d.data() } as LigneReparation)))

        } catch (error) {
            console.error("Erreur chargement réparation:", error)
        } finally {
            setLoading(false)
        }
    }

    const updateStatus = async (newStatus: 'en_attente' | 'en_cours' | 'termine' | 'facture') => {
        if (!repair?.id) return

        setUpdating(true)
        try {
            const updateData: Partial<Reparation> = { statut: newStatus }

            // Si on termine, on ajoute la date de sortie effective
            if (newStatus === 'termine' || newStatus === 'facture') {
                updateData.dateSortieEffective = Timestamp.now()
            }

            await updateReparation(repair.id, updateData)
            setRepair(prev => prev ? { ...prev, ...updateData } : null)
        } catch (error) {
            console.error("Erreur mise à jour statut:", error)
        } finally {
            setUpdating(false)
        }
    }

    const updatePriority = async (newPriority: 'normal' | 'prioritaire' | 'urgent') => {
        if (!repair?.id) return

        setUpdating(true)
        try {
            await updateReparation(repair.id, { priorite: newPriority })
            setRepair(prev => prev ? { ...prev, priorite: newPriority } : null)
        } catch (error) {
            console.error("Erreur mise à jour priorité:", error)
        } finally {
            setUpdating(false)
        }
    }

    // Calculs
    const totalMO = lignes
        .filter(l => l.type === 'main_oeuvre')
        .reduce((sum, l) => sum + l.montantHT, 0)
    const totalPieces = lignes
        .filter(l => l.type === 'piece')
        .reduce((sum, l) => sum + l.montantHT, 0)
    const totalHT = repair?.montantHT || (totalMO + totalPieces)
    const tva = totalHT * 0.2
    const totalTTC = repair?.montantTTC || (totalHT + tva)

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
            </div>
        )
    }

    if (!repair) {
        return (
            <div className="text-center py-20">
                <Wrench className="h-12 w-12 text-zinc-300 mx-auto mb-4" />
                <h2 className="text-lg font-semibold text-zinc-900 mb-2">Réparation introuvable</h2>
                <p className="text-sm text-zinc-500 mb-4">Cette réparation n'existe pas ou a été supprimée.</p>
                <Link href="/repairs" className="text-sm text-zinc-900 font-medium hover:underline">
                    Retour à la liste
                </Link>
            </div>
        )
    }

    const status = statusConfig[repair.statut]
    const StatusIcon = status.icon
    const priorite = prioriteConfig[repair.priorite]

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/repairs" className="p-2 hover:bg-zinc-100 rounded-lg transition-colors">
                        <ArrowLeft className="h-5 w-5 text-zinc-600" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <span className="text-sm font-mono text-zinc-400">{repair.numero}</span>
                            <span className={cn("px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1", status.color)}>
                                <StatusIcon className="h-3 w-3" />
                                {status.label}
                            </span>
                            <span className={cn("px-2.5 py-1 rounded-full text-xs font-medium", priorite.color)}>
                                {priorite.label}
                            </span>
                        </div>
                        <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 line-clamp-2">
                            {repair.description}
                        </h1>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2">
                {repair.statut === 'en_attente' && (
                    <button
                        onClick={() => updateStatus('en_cours')}
                        disabled={updating}
                        className="h-10 px-4 bg-blue-600 text-white text-sm font-medium rounded-xl flex items-center gap-2 hover:bg-blue-700 transition-colors"
                    >
                        <Play className="h-4 w-4" />
                        Démarrer
                    </button>
                )}
                {repair.statut === 'en_cours' && (
                    <>
                        <button
                            onClick={() => updateStatus('termine')}
                            disabled={updating}
                            className="h-10 px-4 bg-emerald-600 text-white text-sm font-medium rounded-xl flex items-center gap-2 hover:bg-emerald-700 transition-colors"
                        >
                            <CheckCircle className="h-4 w-4" />
                            Terminer
                        </button>
                        <button
                            onClick={() => updateStatus('en_attente')}
                            disabled={updating}
                            className="h-10 px-4 bg-amber-100 text-amber-700 text-sm font-medium rounded-xl flex items-center gap-2 hover:bg-amber-200 transition-colors"
                        >
                            <Pause className="h-4 w-4" />
                            Mettre en pause
                        </button>
                    </>
                )}
                {repair.statut === 'termine' && (
                    <Link
                        href={`/invoices/new?type=facture&reparationId=${repair.id}`}
                        className="h-10 px-4 bg-violet-600 text-white text-sm font-medium rounded-xl flex items-center gap-2 hover:bg-violet-700 transition-colors"
                    >
                        <FileText className="h-4 w-4" />
                        Créer la facture
                    </Link>
                )}
                <Link
                    href={`/repairs/${repair.id}/edit`}
                    className="h-10 px-4 bg-zinc-100 text-zinc-700 text-sm font-medium rounded-xl flex items-center gap-2 hover:bg-zinc-200 transition-colors"
                >
                    <Edit className="h-4 w-4" />
                    Modifier
                </Link>
                <button className="h-10 px-4 bg-zinc-100 text-zinc-700 text-sm font-medium rounded-xl flex items-center gap-2 hover:bg-zinc-200 transition-colors">
                    <Printer className="h-4 w-4" />
                    Imprimer OR
                </button>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Véhicule */}
                    {vehicule && (
                        <div className="bg-white rounded-2xl border border-zinc-200 p-6">
                            <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-4">Véhicule</h2>
                            <Link href={`/vehicles/${vehicule.id}`} className="flex items-center gap-4 p-4 bg-zinc-50 rounded-xl hover:bg-zinc-100 transition-colors">
                                <div className="w-14 h-14 rounded-xl bg-white border border-zinc-200 flex items-center justify-center">
                                    <BrandLogo brand={vehicule.marque} size={32} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-lg font-semibold text-zinc-900">
                                        {vehicule.marque} {vehicule.modele}
                                    </p>
                                    <div className="flex items-center gap-3 text-sm text-zinc-500">
                                        <span className="font-mono bg-zinc-200 px-2 py-0.5 rounded">{vehicule.plaque}</span>
                                        <span>{vehicule.annee}</span>
                                        <span>{vehicule.kilometrage?.toLocaleString()} km</span>
                                    </div>
                                </div>
                                <ChevronRight className="h-5 w-5 text-zinc-400" />
                            </Link>
                        </div>
                    )}

                    {/* Client */}
                    {client && (
                        <div className="bg-white rounded-2xl border border-zinc-200 p-6">
                            <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-4">Client</h2>
                            <Link href={`/clients/${client.id}`} className="flex items-center gap-4 p-4 bg-zinc-50 rounded-xl hover:bg-zinc-100 transition-colors">
                                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-zinc-200 to-zinc-300 flex items-center justify-center">
                                    <span className="text-lg font-bold text-zinc-600">
                                        {client.prenom?.[0]}{client.nom?.[0]}
                                    </span>
                                </div>
                                <div className="flex-1">
                                    <p className="text-lg font-semibold text-zinc-900">
                                        {client.civilite} {client.prenom} {client.nom}
                                    </p>
                                    {client.telephone && (
                                        <p className="text-sm text-zinc-500">{client.telephone}</p>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    {client.telephone && (
                                        <a
                                            href={`tel:${client.telephone}`}
                                            onClick={(e) => e.stopPropagation()}
                                            className="p-2 bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-200 transition-colors"
                                        >
                                            <Phone className="h-4 w-4" />
                                        </a>
                                    )}
                                    <ChevronRight className="h-5 w-5 text-zinc-400 self-center" />
                                </div>
                            </Link>
                        </div>
                    )}

                    {/* Détail intervention */}
                    <div className="bg-white rounded-2xl border border-zinc-200 p-6">
                        <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-4">Détail de l'intervention</h2>

                        {lignes.length === 0 ? (
                            <div className="text-center py-8 bg-zinc-50 rounded-xl">
                                <FileText className="h-8 w-8 text-zinc-300 mx-auto mb-2" />
                                <p className="text-sm text-zinc-500">Aucune ligne d'intervention</p>
                                <Link
                                    href={`/repairs/${repair.id}/edit`}
                                    className="text-sm text-zinc-900 font-medium hover:underline"
                                >
                                    Ajouter des lignes
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {lignes.map(ligne => (
                                    <div key={ligne.id} className="flex items-center gap-3 p-3 bg-zinc-50 rounded-xl">
                                        <div className={cn(
                                            "w-2 h-12 rounded-full",
                                            ligne.type === 'main_oeuvre' ? "bg-blue-500" : "bg-emerald-500"
                                        )} />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-zinc-900">{ligne.designation}</p>
                                            <p className="text-xs text-zinc-500">
                                                {ligne.quantite} {ligne.type === 'main_oeuvre' ? 'h' : 'x'} × {ligne.prixUnitaireHT.toFixed(2)} €
                                            </p>
                                        </div>
                                        <p className="text-sm font-semibold text-zinc-900">{ligne.montantHT.toFixed(2)} €</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Notes */}
                    {repair.notes && (
                        <div className="bg-white rounded-2xl border border-zinc-200 p-6">
                            <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-4">Notes internes</h2>
                            <p className="text-sm text-zinc-600 whitespace-pre-wrap">{repair.notes}</p>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Récapitulatif */}
                    <div className="bg-white rounded-2xl border border-zinc-200 p-6 sticky top-6">
                        <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-4">Récapitulatif</h2>

                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-zinc-500">Main d'œuvre</span>
                                <span className="font-medium">{totalMO.toFixed(2)} €</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-zinc-500">Pièces</span>
                                <span className="font-medium">{totalPieces.toFixed(2)} €</span>
                            </div>
                            <div className="flex justify-between pt-3 border-t border-zinc-200">
                                <span className="text-zinc-500">Total HT</span>
                                <span className="font-medium">{totalHT.toFixed(2)} €</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-zinc-500">TVA (20%)</span>
                                <span className="font-medium">{tva.toFixed(2)} €</span>
                            </div>
                            <div className="flex justify-between pt-3 border-t border-zinc-200">
                                <span className="font-semibold text-zinc-900">Total TTC</span>
                                <span className="text-xl font-bold text-zinc-900">{totalTTC.toFixed(2)} €</span>
                            </div>
                        </div>
                    </div>

                    {/* Infos */}
                    <div className="bg-white rounded-2xl border border-zinc-200 p-6">
                        <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-4">Informations</h2>

                        <div className="space-y-4 text-sm">
                            <div>
                                <span className="text-zinc-500 block mb-1">Date d'entrée</span>
                                <span className="font-medium text-zinc-900">
                                    {repair.dateEntree.toDate().toLocaleDateString('fr-FR', {
                                        weekday: 'long',
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric'
                                    })}
                                </span>
                            </div>
                            {repair.dateSortiePrevue && (
                                <div>
                                    <span className="text-zinc-500 block mb-1">Sortie prévue</span>
                                    <span className="font-medium text-zinc-900">
                                        {repair.dateSortiePrevue.toDate().toLocaleDateString('fr-FR', {
                                            weekday: 'long',
                                            day: 'numeric',
                                            month: 'long'
                                        })}
                                    </span>
                                </div>
                            )}
                            {repair.dateSortieEffective && (
                                <div>
                                    <span className="text-zinc-500 block mb-1">Sortie effective</span>
                                    <span className="font-medium text-emerald-600">
                                        {repair.dateSortieEffective.toDate().toLocaleDateString('fr-FR', {
                                            weekday: 'long',
                                            day: 'numeric',
                                            month: 'long'
                                        })}
                                    </span>
                                </div>
                            )}
                            <div>
                                <span className="text-zinc-500 block mb-1">Temps estimé</span>
                                <span className="font-medium text-zinc-900">
                                    {Math.floor(repair.tempsEstime / 60)}h{repair.tempsEstime % 60 > 0 ? ` ${repair.tempsEstime % 60}min` : ''}
                                </span>
                            </div>
                            {repair.tempsPasse > 0 && (
                                <div>
                                    <span className="text-zinc-500 block mb-1">Temps passé</span>
                                    <span className="font-medium text-zinc-900">
                                        {Math.floor(repair.tempsPasse / 60)}h{repair.tempsPasse % 60 > 0 ? ` ${repair.tempsPasse % 60}min` : ''}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Priorité */}
                    <div className="bg-white rounded-2xl border border-zinc-200 p-6">
                        <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-4">Priorité</h2>
                        <div className="flex gap-2">
                            {(['normal', 'prioritaire', 'urgent'] as const).map(p => (
                                <button
                                    key={p}
                                    onClick={() => updatePriority(p)}
                                    disabled={updating}
                                    className={cn(
                                        "flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all",
                                        repair.priorite === p
                                            ? prioriteConfig[p].color + " ring-2 ring-offset-2 ring-zinc-900"
                                            : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                                    )}
                                >
                                    {p === 'urgent' && <AlertTriangle className="h-3 w-3 inline mr-1" />}
                                    {prioriteConfig[p].label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
