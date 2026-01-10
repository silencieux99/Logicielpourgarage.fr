"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import {
    ArrowLeft,
    Download,
    Loader2,
    FileText,
    ZoomIn,
    ZoomOut,
    Maximize2
} from "lucide-react"
import { cn } from "@/lib/utils"
// import html2canvas from "html2canvas" // Dynamically imported
// import jsPDF from "jspdf" // Dynamically imported
import {
    getDocumentById,
    getDocumentLignes,
    getGarageById,
    getClient,
    getVehiculeById,
    Document as GarageDocument,
} from "@/lib/database"
import { InvoiceTemplate, InvoiceTemplateData } from "@/components/InvoiceTemplate"

export default function DocumentViewerPage() {
    const params = useParams()
    const documentId = params?.id as string
    const printRef = useRef<HTMLDivElement>(null)
    const exportRef = useRef<HTMLDivElement>(null)

    const [loading, setLoading] = useState(true)
    const [exporting, setExporting] = useState(false)
    const [document, setDocument] = useState<GarageDocument | null>(null)
    const [templateData, setTemplateData] = useState<InvoiceTemplateData | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [zoom, setZoom] = useState(0.6)

    // Responsive zoom based on screen size
    useEffect(() => {
        const updateZoom = () => {
            const width = window.innerWidth
            if (width >= 1280) {
                setZoom(0.8)
            } else if (width >= 1024) {
                setZoom(0.7)
            } else if (width >= 768) {
                setZoom(0.55)
            } else if (width >= 640) {
                setZoom(0.45)
            } else {
                setZoom(0.38)
            }
        }
        updateZoom()
        window.addEventListener('resize', updateZoom)
        return () => window.removeEventListener('resize', updateZoom)
    }, [])

    useEffect(() => {
        if (documentId) {
            loadDocumentData()
        }
    }, [documentId])

    const loadDocumentData = async () => {
        setLoading(true)
        setError(null)
        try {
            const doc = await getDocumentById(documentId)
            if (!doc) {
                setError("Document introuvable")
                return
            }
            setDocument(doc)

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

            let vehicule = null
            if (doc.vehiculeId) {
                vehicule = await getVehiculeById(doc.vehiculeId)
            }

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
                mentionsLegales: "Mentions légales à définir dans la configuration"
            }

            setTemplateData(data)
        } catch (err) {
            console.error("Erreur chargement document:", err)
            setError("Erreur lors du chargement du document")
        } finally {
            setLoading(false)
        }
    }

    const handleExportPDF = async () => {
        if (!exportRef.current || !templateData) return

        setExporting(true)
        try {
            const html2canvas = (await import('html2canvas')).default
            const { jsPDF } = await import('jspdf')

            // Use the DEDICATED EXPORT CONTAINER
            const canvas = await html2canvas(exportRef.current, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff',
                windowWidth: 794, // A4 width in px at 96 DPI (approx)
            })

            const pdfWidth = 210
            const pdfHeight = 297
            const imgWidth = pdfWidth
            const imgHeight = (canvas.height * imgWidth) / canvas.width

            const pdf = new jsPDF('p', 'mm', 'a4')
            const imgData = canvas.toDataURL('image/png')

            // Tolerance logic: If image height is only slightly larger than A4 (e.g. < 5mm excess), fit on one page
            const tolerance = 5 // mm

            if (imgHeight > (pdfHeight + tolerance)) {
                // True multi-page content
                let heightLeft = imgHeight
                let position = 0

                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
                heightLeft -= pdfHeight
                position -= pdfHeight

                while (heightLeft > 5) { // Stop if remainder is tiny
                    pdf.addPage()
                    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
                    heightLeft -= pdfHeight
                    position -= pdfHeight
                }
            } else {
                // Single page fit (even if slightly larger, we assume it's whitespace/rounding error)
                pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight)
            }

            const docType = templateData.type === 'devis' ? 'Devis' : 'Facture'
            const filename = `${docType}_${templateData.numero}.pdf`
            pdf.save(filename)
        } catch (err) {
            console.error("Erreur export PDF:", err)
            alert("Erreur lors de l'export PDF. Veuillez réessayer.")
        } finally {
            setExporting(false)
        }
    }

    const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.1, 1.2))
    const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.1, 0.25))
    const handleZoomFit = () => {
        const width = window.innerWidth
        if (width >= 1024) setZoom(0.7)
        else if (width >= 768) setZoom(0.55)
        else setZoom(0.38)
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
        <div className="flex flex-col h-full">
            {/* HIDDEN EXPORT CONTAINER - OFF SCREEN BUT RENDERED */}
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: '-2000px', // Far off-screen
                    width: '210mm', // Exact A4 width
                    zIndex: -1000
                }}
            >
                <div ref={exportRef}>
                    <InvoiceTemplate data={templateData} scale={1} />
                </div>
            </div>

            {/* Fixed Header */}
            <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-zinc-200">
                <div className="px-3 sm:px-4 lg:px-6 py-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        {/* Left: Back + Title */}
                        <div className="flex items-center gap-3 min-w-0">
                            <Link
                                href="/invoices"
                                className="p-2 hover:bg-zinc-100 rounded-lg text-zinc-500 transition-colors flex-shrink-0"
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </Link>
                            <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h1 className="text-lg sm:text-xl font-bold text-zinc-900 truncate">
                                        {templateData.type === 'devis' ? 'Devis' : 'Facture'} {templateData.numero}
                                    </h1>
                                    <span className={cn(
                                        "px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0",
                                        document?.statut === 'brouillon' && "bg-zinc-100 text-zinc-700",
                                        document?.statut === 'envoye' && "bg-blue-100 text-blue-700",
                                        document?.statut === 'accepte' && "bg-emerald-100 text-emerald-700",
                                        document?.statut === 'paye' && "bg-emerald-100 text-emerald-700",
                                        document?.statut === 'refuse' && "bg-red-100 text-red-700",
                                    )}>
                                        {document?.statut.toUpperCase()}
                                    </span>
                                </div>
                                <p className="text-xs sm:text-sm text-zinc-500 truncate">
                                    {templateData.client.nom}
                                </p>
                            </div>
                        </div>

                        {/* Right: Actions */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                            {/* Zoom Controls */}
                            <div className="hidden sm:flex items-center gap-1 bg-zinc-100 rounded-lg p-1">
                                <button
                                    onClick={handleZoomOut}
                                    className="p-1.5 hover:bg-zinc-200 rounded text-zinc-600 transition-colors"
                                    title="Zoom -"
                                >
                                    <ZoomOut className="h-4 w-4" />
                                </button>
                                <span className="text-xs font-medium text-zinc-600 w-12 text-center">
                                    {Math.round(zoom * 100)}%
                                </span>
                                <button
                                    onClick={handleZoomIn}
                                    className="p-1.5 hover:bg-zinc-200 rounded text-zinc-600 transition-colors"
                                    title="Zoom +"
                                >
                                    <ZoomIn className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={handleZoomFit}
                                    className="p-1.5 hover:bg-zinc-200 rounded text-zinc-600 transition-colors"
                                    title="Ajuster"
                                >
                                    <Maximize2 className="h-4 w-4" />
                                </button>
                            </div>

                            {/* Export Button */}
                            <button
                                onClick={handleExportPDF}
                                disabled={exporting}
                                className="h-9 sm:h-10 px-3 sm:px-4 bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-400 text-white rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
                            >
                                {exporting ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Download className="h-4 w-4" />
                                )}
                                <span className="hidden sm:inline">Télécharger PDF</span>
                                <span className="sm:hidden">PDF</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Document Preview Area */}
            <div className="flex-1 overflow-auto bg-zinc-100/80">
                <div className="min-h-full p-4 sm:p-8 flex items-start justify-center">
                    <div
                        className="relative bg-white shadow-2xl transition-transform duration-200 ease-out origin-top"
                        style={{
                            transform: `scale(${zoom})`,
                            marginBottom: `${(zoom * 300) - 300}px`
                        }}
                    >
                        <div ref={printRef} className="overflow-hidden">
                            <InvoiceTemplate data={templateData} scale={1} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Zoom Controls */}
            <div className="sm:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-30">
                <div className="flex items-center gap-1 bg-white/95 backdrop-blur-sm rounded-full shadow-lg border border-zinc-200 p-1">
                    <button
                        onClick={handleZoomOut}
                        className="p-2.5 hover:bg-zinc-100 rounded-full text-zinc-600 transition-colors"
                    >
                        <ZoomOut className="h-5 w-5" />
                    </button>
                    <span className="text-sm font-medium text-zinc-700 w-14 text-center">
                        {Math.round(zoom * 100)}%
                    </span>
                    <button
                        onClick={handleZoomIn}
                        className="p-2.5 hover:bg-zinc-100 rounded-full text-zinc-600 transition-colors"
                    >
                        <ZoomIn className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </div>
    )
}
