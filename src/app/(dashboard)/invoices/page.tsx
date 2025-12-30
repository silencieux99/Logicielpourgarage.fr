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

interface Invoice {
    id: string
    numero: string
    type: "devis" | "facture"
    status: "brouillon" | "envoye" | "accepte" | "refuse" | "paye"
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
}

export default function InvoicesPage() {
    const [documents, setDocuments] = useState<Invoice[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [filterType, setFilterType] = useState<"all" | "devis" | "facture">("all")

    useEffect(() => {
        loadDocuments()
    }, [])

    const loadDocuments = async () => {
        setLoading(true)
        try {
            // TODO: Load from Firebase
            setDocuments([])
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
                        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-zinc-900">Factures & Devis</h1>
                        <p className="text-sm text-zinc-500 mt-1">{documents.length} document{documents.length !== 1 ? 's' : ''}</p>
                    </div>
                    <div className="hidden sm:flex gap-2">
                        <Link
                            href="/invoices/new?type=devis"
                            className="h-11 px-5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-sm font-medium rounded-xl flex items-center gap-2 transition-colors"
                        >
                            <Plus className="h-4 w-4" />
                            Devis
                        </Link>
                        <Link
                            href="/invoices/new?type=facture"
                            className="h-11 px-5 bg-zinc-900 hover:bg-zinc-800 text-white text-sm font-medium rounded-xl flex items-center gap-2 transition-colors"
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
                            className="w-full h-10 sm:h-11 pl-10 pr-4 bg-white border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
                        />
                    </div>
                    <div className="flex gap-1 p-1 bg-zinc-100 rounded-xl">
                        {[
                            { id: "all", label: "Tous" },
                            { id: "devis", label: "Devis" },
                            { id: "facture", label: "Factures" },
                        ].map(filter => (
                            <button
                                key={filter.id}
                                onClick={() => setFilterType(filter.id as any)}
                                className={cn(
                                    "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                                    filterType === filter.id ? "bg-white shadow-sm text-zinc-900" : "text-zinc-600 hover:text-zinc-900"
                                )}
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
                    <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
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
                                className="block bg-white rounded-xl border border-zinc-200 p-4 sm:p-5 hover:border-zinc-300 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={cn(
                                        "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                                        doc.type === "facture" ? "bg-emerald-100" : "bg-blue-100"
                                    )}>
                                        <FileText className={cn(
                                            "h-5 w-5",
                                            doc.type === "facture" ? "text-emerald-600" : "text-blue-600"
                                        )} />
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
                className="md:hidden fixed right-4 bottom-20 w-14 h-14 bg-zinc-900 hover:bg-zinc-800 text-white rounded-full shadow-lg flex items-center justify-center z-30"
            >
                <Plus className="h-6 w-6" />
            </Link>
        </div>
    )
}
