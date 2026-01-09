"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import {
    ArrowLeft,
    Printer,
    Edit,
    Mail,
    Download,
    Loader2,
    FileText,
    Share2
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
    getDocumentById,
    getDocumentLignes,
    getGarageById,
    getClient,
    getVehiculeById,
    Document as GarageDocument,
    LigneDocument,
} from "@/lib/database"
import { InvoiceTemplate, InvoiceTemplateData } from "@/components/InvoiceTemplate"

export default function DocumentViewerPage() {
    const params = useParams()
    const documentId = params?.id as string

    const [loading, setLoading] = useState(true)
    const [document, setDocument] = useState<GarageDocument | null>(null)
    const [templateData, setTemplateData] = useState<InvoiceTemplateData | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [showPrintView, setShowPrintView] = useState(false)

    useEffect(() => {
        if (documentId) {
            loadDocumentData()
        }
    }, [documentId])

    const loadDocumentData = async () => {
        setLoading(true)
        setError(null)
        try {
            // 1. Charger le document
            const doc = await getDocumentById(documentId)
            if (!doc) {
                setError("Document introuvable")
                return
            }
            setDocument(doc)

            // 2. Charger les données liées en parallèle
            const [garage, client, lignes] = await Promise.all([
                getGarageById(doc.garageId),
                doc.clientId ? getClient(doc.clientId) : null,
                getDocumentLignes(documentId)
            ])

            if (!garage) {
                setError("Données du garage introuvables")
                return
            }

            if (!client) {
                setError("Client introuvable")
                return
            }

            // 3. Charger le véhicule si présent
            let vehicule = null
            if (doc.vehiculeId) {
                vehicule = await getVehiculeById(doc.vehiculeId)
            }

            // 4. Construire les données pour le template
            const data: InvoiceTemplateData = {
                type: doc.type,
                numero: doc.numero,
                dateEmission: doc.dateEmission?.toDate ? doc.dateEmission.toDate() : new Date(),
                dateEcheance: doc.dateEcheance?.toDate ? doc.dateEcheance.toDate() : undefined,
                garage: {
                    nom: garage.nom,
                    adresse: garage.adresse,
                    codePostal: garage.codePostal,
                    ville: garage.ville,
                    telephone: garage.telephone,
                    email: garage.email,
                    siret: garage.siret,
                    tva: garage.numeroTVA,
                    logo: garage.logo
                },
                client: {
                    nom: client.nom || `${client.prenom || ''} ${client.nom || ''}`.trim(),
                    adresse: client.adresse,
                    codePostal: client.codePostal,
                    ville: client.ville,
                    email: client.email
                },
                vehicule: vehicule ? {
                    plaque: vehicule.plaque,
                    marque: vehicule.marque,
                    modele: vehicule.modele
                } : undefined,
                lignes: lignes.map(l => ({
                    id: l.id,
                    designation: l.designation,
                    description: l.description,
                    quantite: l.quantite,
                    prixUnitaireHT: l.prixUnitaireHT,
                    totalHT: l.montantHT
                })),
                totalHT: doc.montantHT,
                tauxTVA: lignes.length > 0 ? lignes[0].tauxTVA : 20,
                totalTVA: doc.montantTVA,
                totalTTC: doc.montantTTC,
                notes: doc.notes,
                mentionsLegales: "Mentions légales à définir dans la configuration" // Placeholder car pas dans Garage
            }

            setTemplateData(data)
        } catch (err) {
            console.error("Erreur chargement document:", err)
            setError("Erreur lors du chargement du document")
        } finally {
            setLoading(false)
        }
    }

    const handlePrint = () => {
        setShowPrintView(true)
        setTimeout(() => {
            window.print()
            setShowPrintView(false)
        }, 100)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
            </div>
        )
    }

    if (error || !templateData) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <div className="bg-red-50 p-4 rounded-full">
                    <FileText className="h-8 w-8 text-red-500" />
                </div>
                <h1 className="text-xl font-semibold text-zinc-900">{error || "Document introuvable"}</h1>
                <Link
                    href="/invoices"
                    className="flex items-center gap-2 text-sm font-medium text-zinc-600 hover:text-zinc-900"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Retour à la liste
                </Link>
            </div>
        )
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            {/* Header / Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link
                        href="/invoices"
                        className="p-2 hover:bg-zinc-100 rounded-lg text-zinc-500 transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold text-zinc-900">
                                {templateData.type === 'devis' ? 'Devis' : 'Facture'} {templateData.numero}
                            </h1>
                            <span className={cn(
                                "px-2.5 py-0.5 rounded-full text-xs font-medium",
                                document?.statut === 'brouillon' && "bg-zinc-100 text-zinc-700",
                                document?.statut === 'envoye' && "bg-blue-100 text-blue-700",
                                document?.statut === 'accepte' && "bg-emerald-100 text-emerald-700",
                                document?.statut === 'paye' && "bg-emerald-100 text-emerald-700",
                                document?.statut === 'refuse' && "bg-red-100 text-red-700",
                            )}>
                                {document?.statut.toUpperCase()}
                            </span>
                        </div>
                        <p className="text-sm text-zinc-500 mt-1">
                            Crée le {templateData.dateEmission instanceof Date ? templateData.dateEmission.toLocaleDateString() : templateData.dateEmission} pour {templateData.client.nom}
                        </p>
                    </div>
                </div>

                <div className="flex  items-center gap-2">
                    <button
                        onClick={handlePrint}
                        className="h-10 px-4 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
                    >
                        <Printer className="h-4 w-4" />
                        Imprimer / PDF
                    </button>
                    {/* Add more actions here like Send Email */}
                </div>
            </div>

            {/* Document Preview */}
            <div className="bg-zinc-100/50 p-4 sm:p-8 rounded-2xl overflow-x-auto">
                <div className="min-w-[800px] flex justify-center">
                    <InvoiceTemplate data={templateData} />
                </div>
            </div>

            {/* Print Container */}
            {showPrintView && (
                <div
                    id="print-container"
                    className="fixed inset-0 bg-white z-[9999] overflow-auto"
                    style={{ padding: '0' }}
                >
                    <InvoiceTemplate data={templateData} scale={1} />
                </div>
            )}
        </div>
    )
}
