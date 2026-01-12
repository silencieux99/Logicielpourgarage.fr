"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
    Plus,
    Search,
    FileText,
    Send,
    Download,
    ChevronRight,
    Loader2,
    Clock,
    CheckCircle,
    XCircle
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"
import { getGarageByUserId, getDocuments, getClients, Document as GarageDocument } from "@/lib/database"

interface Invoice {
    id: string
    numero: string
    type: "devis" | "facture"
    status: "brouillon" | "envoye" | "accepte" | "refuse" | "paye" | "en_retard"
    clientNom: string
    montantTTC: number
    createdAt: string
}

const statusConfig = {
    brouillon: { label: "Brouillon", color: "bg-zinc-100 text-zinc-700" },
    envoye: { label: "Envoyé", color: "bg-blue-100 text-blue-700" },
    accepte: { label: "Accepté", color: "bg-emerald-100 text-emerald-700" },
    refuse: { label: "Refusé", color: "bg-red-100 text-red-700" },
    paye: { label: "Payé", color: "bg-emerald-100 text-emerald-700" },
    en_retard: { label: "En retard", color: "bg-red-100 text-red-700" },
}

export default function InvoicesPage() {
    const [documents, setDocuments] = useState<Invoice[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [filterType, setFilterType] = useState<"all" | "devis" | "facture">("all")

    const { user } = useAuth()

    useEffect(() => {
        if (user) {
            loadDocuments()
        }
    }, [user])

    const loadDocuments = async () => {
        if (!user) return
        setLoading(true)
        try {
            const garage = await getGarageByUserId(user.uid)
            if (!garage || !garage.id) return

            // Charger les documents et les clients en parallèle
            const [docsData, clientsData] = await Promise.all([
                getDocuments(garage.id),
                getClients(garage.id)
            ])

            // Créer une map des clients pour un accès rapide
            const clientsMap = new Map(clientsData.map(c => [c.id, c]))

            // Formater les documents pour l'affichage
            const formattedDocs: Invoice[] = docsData.map(doc => {
                const client = doc.clientId ? clientsMap.get(doc.clientId) : null
                const dateCreation = doc.createdAt?.toDate ? doc.createdAt.toDate() : new Date()

                return {
                    id: doc.id || "",
                    numero: doc.numero,
                    type: doc.type,
                    status: doc.statut,
                    clientNom: client?.nom || "Client inconnu",
                    montantTTC: doc.montantTTC,
                    createdAt: dateCreation.toISOString()
                }
            })

            setDocuments(formattedDocs)
        } catch (error) {
            console.error("Erreur chargement documents:", error)
        } finally {
            setLoading(false)
        }
    }

    const filteredDocuments = documents.filter(doc => {
        const matchesSearch =
            doc.numero.toLowerCase().includes(searchQuery.toLowerCase()) ||
            doc.clientNom.toLowerCase().includes(searchQuery.toLowerCase())

        const matchesFilter = filterType === "all" || doc.type === filterType

        return matchesSearch && matchesFilter
    })

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-semibold text-[var(--text-primary)] tracking-tight">Factures & Devis</h1>
                        <p className="text-[13px] text-[var(--text-tertiary)] mt-0.5">{documents.length} document{documents.length !== 1 ? 's' : ''}</p>
                    </div>
                    <div className="hidden sm:flex gap-2">
                        <Link
                            href="/invoices/new?type=devis"
                            className="h-9 px-4 bg-[var(--bg-tertiary)] hover:bg-[var(--border-default)] text-[var(--text-secondary)] text-[13px] font-medium rounded-lg flex items-center gap-2 transition-colors"
                        >
                            <Plus className="h-4 w-4" />
                            Devis
                        </Link>
                        <Link
                            href="/invoices/new?type=facture"
                            className="h-9 px-4 bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-white text-[13px] font-medium rounded-lg flex items-center gap-2 transition-colors"
                        >
                            <Plus className="h-4 w-4" />
                            Facture
                        </Link>
                    </div>
                </div>

                {/* Search & Filters */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                        <input
                            type="text"
                            placeholder="Rechercher par numéro ou client..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-10 pl-10 pr-4 bg-white border border-[var(--border-default)] rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent transition-shadow"
                        />
                    </div>
                    <div className="flex gap-0.5 p-1 bg-[var(--bg-tertiary)] rounded-lg">
                        {[
                            { id: "all", label: "Tous" },
                            { id: "devis", label: "Devis" },
                            { id: "facture", label: "Factures" },
                        ].map(filter => (
                            <button
                                key={filter.id}
                                onClick={() => setFilterType(filter.id as any)}
                                className={cn(
                                    "px-3 py-1.5 rounded-md text-[12px] font-medium transition-all",
                                    filterType === filter.id ? "bg-white text-[var(--text-primary)]" : "text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
                                )}
                                style={filterType === filter.id ? { boxShadow: 'var(--shadow-xs)' } : {}}
                            >
                                {filter.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-6 w-6 animate-spin text-[var(--text-muted)]" />
                </div>
            ) : filteredDocuments.length === 0 ? (
                <div className="bg-white rounded-xl sm:rounded-2xl border border-zinc-200 p-8 sm:p-16 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-zinc-100 flex items-center justify-center mx-auto mb-4">
                        <FileText className="h-8 w-8 text-zinc-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-zinc-900 mb-2">
                        {searchQuery || filterType !== "all" ? "Aucun résultat" : "Aucun document"}
                    </h3>
                    <p className="text-sm text-zinc-500 mb-6 max-w-md mx-auto">
                        {searchQuery || filterType !== "all"
                            ? "Aucun document ne correspond à vos critères"
                            : "Créez votre premier devis ou facture"}
                    </p>
                    {!searchQuery && filterType === "all" && (
                        <div className="flex justify-center gap-3">
                            <Link
                                href="/invoices/new?type=devis"
                                className="h-11 px-6 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-sm font-medium rounded-xl flex items-center gap-2 transition-colors"
                            >
                                Créer un devis
                            </Link>
                            <Link
                                href="/invoices/new?type=facture"
                                className="h-11 px-6 bg-zinc-900 hover:bg-zinc-800 text-white text-sm font-medium rounded-xl flex items-center gap-2 transition-colors"
                            >
                                Créer une facture
                            </Link>
                        </div>
                    )}
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredDocuments.map((doc) => {
                        const status = statusConfig[doc.status]

                        return (
                            <Link
                                key={doc.id}
                                href={`/invoices/${doc.id}`}
                                className="block bg-white rounded-xl border border-[var(--border-light)] p-4 hover:border-[var(--border-default)] transition-all"
                                style={{ boxShadow: 'var(--shadow-sm)' }}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={cn(
                                        "w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0",
                                        doc.type === "facture" ? "bg-[var(--bg-tertiary)]" : "bg-[var(--bg-tertiary)]"
                                    )}>
                                        <FileText className="h-4 w-4 text-[var(--text-muted)]" strokeWidth={1.5} />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <p className="text-[15px] font-semibold text-zinc-900">{doc.numero}</p>
                                            <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", status.color)}>
                                                {status.label}
                                            </span>
                                        </div>
                                        <p className="text-sm text-zinc-500">{doc.clientNom}</p>
                                    </div>

                                    <div className="text-right flex-shrink-0">
                                        <p className="text-[15px] font-bold text-zinc-900">{doc.montantTTC.toFixed(2)} €</p>
                                        <p className="text-xs text-zinc-500">
                                            {new Date(doc.createdAt).toLocaleDateString('fr-FR')}
                                        </p>
                                    </div>

                                    <ChevronRight className="h-5 w-5 text-zinc-400 hidden sm:block" />
                                </div>
                            </Link>
                        )
                    })}
                </div>
            )}

            {/* Mobile FAB */}
            <Link
                href="/invoices/new?type=devis"
                className="md:hidden fixed right-4 bottom-20 w-12 h-12 bg-[var(--accent-primary)] text-white rounded-full flex items-center justify-center z-30"
                style={{ boxShadow: 'var(--shadow-lg)' }}
            >
                <Plus className="h-5 w-5" />
            </Link>
        </div>
    )
}
