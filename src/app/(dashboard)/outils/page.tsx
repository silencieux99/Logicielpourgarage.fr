"use client"

import { useState } from "react"
import Link from "next/link"
import {
    Hammer,
    Radio,
    ArrowRight,
    Search,
    Sparkles
} from "lucide-react"
import { cn } from "@/lib/utils"

// Types pour les outils
export interface Outil {
    id: string
    name: string
    description: string
    icon: React.ComponentType<{ className?: string }>
    color: string
    bgColor: string
    available: boolean
    comingSoon?: boolean
}

// Liste des outils
const outils: Outil[] = [
    {
        id: "code-autoradio-renault",
        name: "Code Autoradio Renault",
        description: "Retrouvez le code de déblocage de votre autoradio Renault à partir du précode",
        icon: Radio,
        color: "from-yellow-500 to-orange-600",
        bgColor: "bg-yellow-50",
        available: true,
    },
    // Ajoutez vos autres outils ici...
]

export default function OutilsPage() {
    const [searchQuery, setSearchQuery] = useState("")

    const filteredOutils = outils.filter(outil =>
        outil.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        outil.description.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const availableCount = outils.filter(o => o.available).length
    const comingSoonCount = outils.filter(o => o.comingSoon).length

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 flex items-center gap-2">
                        <Hammer className="h-6 w-6 text-zinc-700" />
                        Outils
                    </h1>
                    <p className="text-sm text-zinc-500 mt-1">
                        {availableCount} outils disponibles {comingSoonCount > 0 && `• ${comingSoonCount} à venir`}
                    </p>
                </div>

                {/* Search */}
                {outils.length > 0 && (
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                        <input
                            type="text"
                            placeholder="Rechercher un outil..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-10 pl-9 pr-4 bg-white border border-zinc-200 rounded-lg text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-300 transition-all"
                        />
                    </div>
                )}
            </div>

            {/* Grid d'outils */}
            {filteredOutils.length > 0 ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredOutils.map((outil) => (
                        <div
                            key={outil.id}
                            className={cn(
                                "group relative bg-white rounded-xl border border-zinc-200 p-5 transition-all duration-200",
                                outil.available
                                    ? "hover:shadow-lg hover:border-zinc-300 cursor-pointer"
                                    : "opacity-75"
                            )}
                        >
                            {/* Coming Soon Badge */}
                            {outil.comingSoon && (
                                <div className="absolute top-3 right-3">
                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-zinc-100 text-zinc-600 text-[10px] font-semibold rounded-full">
                                        <Sparkles className="h-3 w-3" />
                                        Bientôt
                                    </span>
                                </div>
                            )}

                            {/* Icon */}
                            <div className={cn(
                                "w-12 h-12 rounded-xl flex items-center justify-center mb-4",
                                outil.bgColor
                            )}>
                                <div className={cn(
                                    "w-10 h-10 rounded-lg bg-gradient-to-br flex items-center justify-center",
                                    outil.color
                                )}>
                                    <outil.icon className="h-5 w-5 text-white" />
                                </div>
                            </div>

                            {/* Content */}
                            <h3 className="text-[15px] font-semibold text-zinc-900 mb-1.5">
                                {outil.name}
                            </h3>
                            <p className="text-[13px] text-zinc-500 leading-relaxed mb-4">
                                {outil.description}
                            </p>

                            {/* Action */}
                            {outil.available ? (
                                <Link
                                    href={`/outils/${outil.id}`}
                                    className="inline-flex items-center gap-1.5 text-[13px] font-medium text-zinc-900 group-hover:gap-2 transition-all"
                                >
                                    Utiliser
                                    <ArrowRight className="h-3.5 w-3.5" />
                                </Link>
                            ) : (
                                <span className="text-[13px] text-zinc-400">
                                    Disponible prochainement
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                /* Empty State */
                <div className="text-center py-16 bg-white rounded-xl border border-zinc-200">
                    <Hammer className="h-12 w-12 text-zinc-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-zinc-900 mb-2">Aucun outil trouvé</h3>
                    <p className="text-sm text-zinc-500 max-w-md mx-auto">
                        Essayez avec d'autres termes de recherche.
                    </p>
                </div>
            )}

            {/* Suggestion Box */}
            <div className="bg-gradient-to-r from-zinc-900 to-zinc-800 rounded-xl p-6 text-white">
                <h3 className="text-lg font-semibold mb-2">💡 Une idée d'outil ?</h3>
                <p className="text-sm text-zinc-300 mb-4">
                    Vous avez besoin d'un outil spécifique pour votre garage ? Dites-le nous et nous l'ajouterons !
                </p>
                <button className="h-9 px-4 bg-white text-zinc-900 text-sm font-medium rounded-lg hover:bg-zinc-100 transition-colors">
                    Suggérer un outil
                </button>
            </div>
        </div>
    )
}
