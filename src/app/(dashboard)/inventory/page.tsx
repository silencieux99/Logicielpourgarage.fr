"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
    Plus,
    Search,
    Package,
    AlertTriangle,
    Loader2,
    ChevronRight
} from "lucide-react"
import { cn } from "@/lib/utils"

interface Article {
    id: string
    reference: string
    designation: string
    categorie?: string
    marque?: string
    quantiteStock: number
    seuilAlerte: number
    prixVenteHT: number
    emplacement?: string
}

export default function InventoryPage() {
    const [articles, setArticles] = useState<Article[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [showLowStock, setShowLowStock] = useState(false)

    useEffect(() => {
        loadArticles()
    }, [])

    const loadArticles = async () => {
        setLoading(true)
        try {
            // TODO: Load from Firebase
            setArticles([])
        } catch (error) {
            console.error("Erreur chargement articles:", error)
        } finally {
            setLoading(false)
        }
    }

    const filteredArticles = articles.filter(article => {
        const matchesSearch =
            article.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
            article.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
            article.marque?.toLowerCase().includes(searchQuery.toLowerCase())

        const matchesLowStock = !showLowStock || article.quantiteStock <= article.seuilAlerte

        return matchesSearch && matchesLowStock
    })

    const lowStockCount = articles.filter(a => a.quantiteStock <= a.seuilAlerte).length

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-semibold text-[var(--text-primary)] tracking-tight">Stock</h1>
                        <p className="text-[13px] text-[var(--text-tertiary)] mt-0.5">{articles.length} article{articles.length !== 1 ? 's' : ''}</p>
                    </div>
                    <Link
                        href="/inventory/new"
                        className="hidden sm:inline-flex h-9 px-4 bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-white text-[13px] font-medium rounded-lg items-center gap-2 transition-colors"
                    >
                        <Plus className="h-4 w-4" />
                        <span>Nouvel article</span>
                    </Link>
                </div>

                {/* Search & Filters */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                        <input
                            type="text"
                            placeholder="Rechercher par référence, désignation..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-10 pl-10 pr-4 bg-white border border-[var(--border-default)] rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent transition-shadow"
                        />
                    </div>
                    <button
                        onClick={() => setShowLowStock(!showLowStock)}
                        className={cn(
                            "h-10 px-4 rounded-lg text-[13px] font-medium flex items-center gap-2 transition-all",
                            showLowStock
                                ? "bg-amber-100 text-amber-700"
                                : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                        )}
                    >
                        <AlertTriangle className="h-4 w-4" />
                        Stock bas {lowStockCount > 0 && `(${lowStockCount})`}
                    </button>
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-6 w-6 animate-spin text-[var(--text-muted)]" />
                </div>
            ) : filteredArticles.length === 0 ? (
                <div className="bg-white rounded-xl sm:rounded-2xl border border-zinc-200 p-8 sm:p-16 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-zinc-100 flex items-center justify-center mx-auto mb-4">
                        <Package className="h-8 w-8 text-zinc-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-zinc-900 mb-2">
                        {searchQuery || showLowStock ? "Aucun résultat" : "Aucun article en stock"}
                    </h3>
                    <p className="text-sm text-zinc-500 mb-6 max-w-md mx-auto">
                        {searchQuery || showLowStock
                            ? "Aucun article ne correspond à vos critères"
                            : "Commencez par ajouter vos pièces et articles"}
                    </p>
                    {!searchQuery && !showLowStock && (
                        <Link
                            href="/inventory/new"
                            className="inline-flex h-11 px-6 bg-zinc-900 hover:bg-zinc-800 text-white text-sm font-medium rounded-xl items-center gap-2 transition-colors"
                        >
                            <Plus className="h-4 w-4" />
                            Ajouter un article
                        </Link>
                    )}
                </div>
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredArticles.map((article) => {
                        const isLowStock = article.quantiteStock <= article.seuilAlerte

                        return (
                            <Link
                                key={article.id}
                                href={`/inventory/${article.id}`}
                                className="bg-white rounded-xl border border-[var(--border-light)] p-4 hover:border-[var(--border-default)] transition-all"
                                style={{ boxShadow: 'var(--shadow-sm)' }}
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <span className="px-2.5 py-1 bg-zinc-100 text-zinc-700 text-xs font-mono font-semibold rounded-lg">
                                        {article.reference}
                                    </span>
                                    {isLowStock && (
                                        <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-lg flex items-center gap-1">
                                            <AlertTriangle className="h-3 w-3" />
                                            Stock bas
                                        </span>
                                    )}
                                </div>

                                <h3 className="text-[15px] font-semibold text-zinc-900 mb-1 line-clamp-2">
                                    {article.designation}
                                </h3>

                                {article.marque && (
                                    <p className="text-sm text-zinc-500 mb-3">{article.marque}</p>
                                )}

                                <div className="flex items-center justify-between pt-3 border-t border-zinc-100">
                                    <div>
                                        <p className={cn(
                                            "text-lg font-bold",
                                            isLowStock ? "text-amber-600" : "text-zinc-900"
                                        )}>
                                            {article.quantiteStock}
                                        </p>
                                        <p className="text-xs text-zinc-500">en stock</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-bold text-zinc-900">{article.prixVenteHT.toFixed(2)} €</p>
                                        <p className="text-xs text-zinc-500">HT</p>
                                    </div>
                                </div>
                            </Link>
                        )
                    })}
                </div>
            )}

            {/* Mobile FAB */}
            <Link
                href="/inventory/new"
                className="md:hidden fixed right-4 bottom-20 w-12 h-12 bg-[var(--accent-primary)] text-white rounded-full flex items-center justify-center z-30"
                style={{ boxShadow: 'var(--shadow-lg)' }}
            >
                <Plus className="h-5 w-5" />
            </Link>
        </div>
    )
}
