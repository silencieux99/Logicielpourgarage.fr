"use client"

import { useState } from "react"
import Link from "next/link"
import {
    GraduationCap,
    Play,
    Clock,
    BookOpen,
    Wrench,
    Car,
    Settings,
    FileText,
    Search,
    ChevronRight,
    Star,
    Users,
    Zap
} from "lucide-react"
import { cn } from "@/lib/utils"

// Types pour les tutoriaux
export interface Tutorial {
    id: string
    title: string
    description: string
    category: string
    duration: string
    level: "Débutant" | "Intermédiaire" | "Avancé"
    thumbnail: string
    views: number
    rating: number
    featured?: boolean
}

// Types pour les catégories
export interface Category {
    id: string
    name: string
    icon: React.ComponentType<{ className?: string }>
}

// Catégories de tutoriaux
const categories: Category[] = [
    { id: "all", name: "Tous", icon: BookOpen },
    { id: "mecanique", name: "Mécanique", icon: Wrench },
    { id: "diagnostic", name: "Diagnostic", icon: Car },
    { id: "gestion", name: "Gestion", icon: FileText },
    { id: "logiciel", name: "Logiciel", icon: Settings },
]

// Liste des tutoriaux - À remplir avec vos tutoriaux
const tutoriaux: Tutorial[] = [
    // Exemple de structure pour ajouter un tutoriel :
    // {
    //     id: "mon-tutoriel",
    //     title: "Titre du tutoriel",
    //     description: "Description du tutoriel",
    //     category: "mecanique",
    //     duration: "15 min",
    //     level: "Débutant",
    //     thumbnail: "🔧",
    //     views: 0,
    //     rating: 0,
    //     featured: false,
    // },
]

const levelColors: Record<string, string> = {
    "Débutant": "bg-emerald-100 text-emerald-700",
    "Intermédiaire": "bg-amber-100 text-amber-700",
    "Avancé": "bg-rose-100 text-rose-700",
}

export default function TutoriauxPage() {
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedCategory, setSelectedCategory] = useState("all")

    const filteredTutoriaux = tutoriaux.filter(tuto => {
        const matchesSearch = tuto.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tuto.description.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesCategory = selectedCategory === "all" || tuto.category === selectedCategory
        return matchesSearch && matchesCategory
    })

    const featuredTutoriaux = tutoriaux.filter(t => t.featured)

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 flex items-center gap-2">
                        <GraduationCap className="h-6 w-6 text-zinc-700" />
                        Tutoriaux
                    </h1>
                    <p className="text-sm text-zinc-500 mt-1">
                        {tutoriaux.length} tutoriaux disponibles
                    </p>
                </div>

                {/* Search */}
                {tutoriaux.length > 0 && (
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                        <input
                            type="text"
                            placeholder="Rechercher un tutoriel..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-10 pl-9 pr-4 bg-white border border-zinc-200 rounded-lg text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-300 transition-all"
                        />
                    </div>
                )}
            </div>

            {/* Featured Section */}
            {selectedCategory === "all" && searchQuery === "" && featuredTutoriaux.length > 0 && (
                <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-xl p-6 text-white">
                    <div className="flex items-center gap-2 mb-3">
                        <Zap className="h-5 w-5" />
                        <span className="text-sm font-semibold">Tutoriaux populaires</span>
                    </div>
                    <div className="grid sm:grid-cols-3 gap-3">
                        {featuredTutoriaux.slice(0, 3).map((tuto) => (
                            <Link
                                key={tuto.id}
                                href={`/tutoriaux/${tuto.id}`}
                                className="bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg p-4 transition-all"
                            >
                                <div className="text-2xl mb-2">{tuto.thumbnail}</div>
                                <h3 className="text-sm font-medium line-clamp-1">{tuto.title}</h3>
                                <p className="text-xs text-white/70 mt-1">{tuto.duration}</p>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Categories */}
            {tutoriaux.length > 0 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
                                selectedCategory === cat.id
                                    ? "bg-zinc-900 text-white"
                                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                            )}
                        >
                            <cat.icon className="h-4 w-4" />
                            {cat.name}
                        </button>
                    ))}
                </div>
            )}

            {/* Tutorials Grid */}
            {filteredTutoriaux.length > 0 ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredTutoriaux.map((tuto) => (
                        <Link
                            key={tuto.id}
                            href={`/tutoriaux/${tuto.id}`}
                            className="group bg-white rounded-xl border border-zinc-200 overflow-hidden hover:shadow-lg hover:border-zinc-300 transition-all duration-200"
                        >
                            {/* Thumbnail */}
                            <div className="relative h-32 bg-gradient-to-br from-zinc-100 to-zinc-200 flex items-center justify-center">
                                <span className="text-5xl">{tuto.thumbnail}</span>
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all flex items-center justify-center">
                                    <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all">
                                        <Play className="h-5 w-5 text-zinc-900 ml-0.5" />
                                    </div>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-4">
                                {/* Meta */}
                                <div className="flex items-center gap-2 mb-2">
                                    <span className={cn(
                                        "px-2 py-0.5 rounded text-[10px] font-semibold",
                                        levelColors[tuto.level]
                                    )}>
                                        {tuto.level}
                                    </span>
                                    <span className="flex items-center gap-1 text-[11px] text-zinc-500">
                                        <Clock className="h-3 w-3" />
                                        {tuto.duration}
                                    </span>
                                </div>

                                {/* Title */}
                                <h3 className="text-[15px] font-semibold text-zinc-900 mb-1.5 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                                    {tuto.title}
                                </h3>
                                <p className="text-[13px] text-zinc-500 leading-relaxed line-clamp-2">
                                    {tuto.description}
                                </p>

                                {/* Stats */}
                                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-zinc-100">
                                    <span className="flex items-center gap-1 text-[12px] text-zinc-500">
                                        <Users className="h-3.5 w-3.5" />
                                        {tuto.views.toLocaleString()} vues
                                    </span>
                                    <span className="flex items-center gap-1 text-[12px] text-zinc-500">
                                        <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                                        {tuto.rating}
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                /* Empty State */
                <div className="text-center py-16 bg-white rounded-xl border border-zinc-200">
                    <GraduationCap className="h-12 w-12 text-zinc-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-zinc-900 mb-2">Aucun tutoriel disponible</h3>
                    <p className="text-sm text-zinc-500 max-w-md mx-auto">
                        Les tutoriaux pour garagistes seront ajoutés ici prochainement.
                    </p>
                </div>
            )}

            {/* Request Tutorial */}
            <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h3 className="text-lg font-semibold text-zinc-900 mb-1">
                            🎥 Besoin d'un tutoriel spécifique ?
                        </h3>
                        <p className="text-sm text-zinc-600">
                            Dites-nous quel sujet vous intéresse et nous créerons un tutoriel dédié.
                        </p>
                    </div>
                    <button className="h-10 px-5 bg-zinc-900 text-white text-sm font-medium rounded-lg hover:bg-zinc-800 transition-colors whitespace-nowrap">
                        Demander un tutoriel
                    </button>
                </div>
            </div>
        </div>
    )
}
