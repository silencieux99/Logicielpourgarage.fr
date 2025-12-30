"use client"

import { useState } from "react"
import Link from "next/link"
import {
    HelpCircle,
    Search,
    Book,
    Video,
    MessageCircle,
    Phone,
    Mail,
    ChevronRight,
    ChevronDown,
    ExternalLink,
    FileText,
    Settings,
    Users,
    Car,
    Wrench,
    FileText as Invoice,
    Calendar,
    Package
} from "lucide-react"
import { cn } from "@/lib/utils"

const categories = [
    { id: "demarrage", label: "Démarrage", icon: Book, count: 8 },
    { id: "clients", label: "Clients", icon: Users, count: 6 },
    { id: "vehicules", label: "Véhicules", icon: Car, count: 5 },
    { id: "reparations", label: "Réparations", icon: Wrench, count: 12 },
    { id: "facturation", label: "Facturation", icon: Invoice, count: 9 },
    { id: "agenda", label: "Agenda", icon: Calendar, count: 4 },
    { id: "stock", label: "Stock", icon: Package, count: 7 },
    { id: "parametres", label: "Paramètres", icon: Settings, count: 5 },
]

const faqItems = [
    {
        question: "Comment ajouter un nouveau client ?",
        answer: "Rendez-vous dans la section Clients, puis cliquez sur 'Nouveau client'. Remplissez les informations et validez.",
        category: "clients"
    },
    {
        question: "Comment créer un devis ?",
        answer: "Allez dans Factures > Nouveau devis. Sélectionnez un client, ajoutez les lignes de prestation et enregistrez. Vous pouvez ensuite l'envoyer par email ou le télécharger en PDF.",
        category: "facturation"
    },
    {
        question: "Comment transformer un devis en facture ?",
        answer: "Ouvrez le devis, puis cliquez sur 'Convertir en facture'. Toutes les informations seront automatiquement reprises.",
        category: "facturation"
    },
    {
        question: "Comment rechercher un véhicule par plaque ?",
        answer: "Dans la section Véhicules, utilisez la barre de recherche et entrez la plaque d'immatriculation. Le système recherchera automatiquement dans votre base.",
        category: "vehicules"
    },
    {
        question: "Comment gérer le stock de pièces ?",
        answer: "Rendez-vous dans Stock. Vous pouvez ajouter des articles, définir des seuils d'alerte et suivre les mouvements de stock automatiquement liés aux réparations.",
        category: "stock"
    },
    {
        question: "Comment configurer les rappels SMS ?",
        answer: "Dans Paramètres > Notifications, activez les rappels SMS. Configurez le délai (24h, 48h avant) et personnalisez le message.",
        category: "parametres"
    },
]

const videos = [
    { title: "Prise en main de GaragePro", duration: "5:32", thumbnail: "🎬" },
    { title: "Créer votre premier devis", duration: "3:45", thumbnail: "📄" },
    { title: "Gérer votre planning", duration: "4:12", thumbnail: "📅" },
    { title: "Suivi des réparations", duration: "6:20", thumbnail: "🔧" },
]

export default function HelpPage() {
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
    const [openFaq, setOpenFaq] = useState<number | null>(null)

    const filteredFaq = faqItems.filter(item => {
        const matchesSearch = item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.answer.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesCategory = !selectedCategory || item.category === selectedCategory
        return matchesSearch && matchesCategory
    })

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="text-center max-w-2xl mx-auto">
                <div className="w-16 h-16 rounded-2xl bg-zinc-100 flex items-center justify-center mx-auto mb-4">
                    <HelpCircle className="h-8 w-8 text-zinc-600" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-2">
                    Comment pouvons-nous vous aider ?
                </h1>
                <p className="text-zinc-500">
                    Trouvez rapidement des réponses à vos questions
                </p>
            </div>

            {/* Search */}
            <div className="max-w-xl mx-auto">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
                    <input
                        type="text"
                        placeholder="Rechercher dans l'aide..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-12 sm:h-14 pl-12 pr-4 bg-white border border-zinc-200 rounded-2xl text-sm sm:text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
                    />
                </div>
            </div>

            {/* Categories */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {categories.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                        className={cn(
                            "p-4 rounded-xl border-2 transition-all text-left",
                            selectedCategory === cat.id
                                ? "border-zinc-900 bg-zinc-50"
                                : "border-zinc-200 bg-white hover:border-zinc-300"
                        )}
                    >
                        <cat.icon className={cn(
                            "h-5 w-5 mb-2",
                            selectedCategory === cat.id ? "text-zinc-900" : "text-zinc-400"
                        )} />
                        <p className="text-sm font-semibold text-zinc-900">{cat.label}</p>
                        <p className="text-xs text-zinc-500">{cat.count} articles</p>
                    </button>
                ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* FAQ */}
                <div className="lg:col-span-2 space-y-4">
                    <h2 className="text-lg font-semibold text-zinc-900">Questions fréquentes</h2>

                    <div className="bg-white rounded-2xl border border-zinc-200 divide-y divide-zinc-100">
                        {filteredFaq.map((item, i) => (
                            <div key={i}>
                                <button
                                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                    className="w-full p-4 flex items-center justify-between text-left hover:bg-zinc-50 transition-colors"
                                >
                                    <span className="text-[15px] font-medium text-zinc-900 pr-4">{item.question}</span>
                                    <ChevronDown className={cn(
                                        "h-5 w-5 text-zinc-400 flex-shrink-0 transition-transform",
                                        openFaq === i && "rotate-180"
                                    )} />
                                </button>
                                {openFaq === i && (
                                    <div className="px-4 pb-4">
                                        <p className="text-sm text-zinc-600 leading-relaxed">{item.answer}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {filteredFaq.length === 0 && (
                        <div className="bg-white rounded-2xl border border-zinc-200 p-8 text-center">
                            <p className="text-sm text-zinc-500">Aucun résultat trouvé</p>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Video Tutorials */}
                    <div className="bg-white rounded-2xl border border-zinc-200 p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <Video className="h-5 w-5 text-zinc-400" />
                            <h2 className="text-base font-semibold text-zinc-900">Tutoriels vidéo</h2>
                        </div>

                        <div className="space-y-3">
                            {videos.map((video, i) => (
                                <button
                                    key={i}
                                    className="w-full flex items-center gap-3 p-3 bg-zinc-50 rounded-xl hover:bg-zinc-100 transition-colors text-left"
                                >
                                    <div className="w-10 h-10 rounded-lg bg-zinc-200 flex items-center justify-center text-lg">
                                        {video.thumbnail}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-zinc-900 truncate">{video.title}</p>
                                        <p className="text-xs text-zinc-500">{video.duration}</p>
                                    </div>
                                    <ChevronRight className="h-4 w-4 text-zinc-400" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Contact */}
                    <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-2xl p-5 text-white">
                        <h2 className="text-base font-semibold mb-4">Besoin d'aide ?</h2>

                        <div className="space-y-3">
                            <a href="mailto:support@garagepro.fr" className="flex items-center gap-3 p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-colors">
                                <Mail className="h-5 w-5" />
                                <div>
                                    <p className="text-sm font-medium">Email</p>
                                    <p className="text-xs text-zinc-400">support@garagepro.fr</p>
                                </div>
                            </a>

                            <a href="tel:0123456789" className="flex items-center gap-3 p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-colors">
                                <Phone className="h-5 w-5" />
                                <div>
                                    <p className="text-sm font-medium">Téléphone</p>
                                    <p className="text-xs text-zinc-400">01 23 45 67 89</p>
                                </div>
                            </a>

                            <button className="w-full flex items-center justify-center gap-2 p-3 bg-white text-zinc-900 rounded-xl font-medium text-sm hover:bg-zinc-100 transition-colors">
                                <MessageCircle className="h-4 w-4" />
                                Chat en direct
                            </button>
                        </div>
                    </div>

                    {/* Documentation */}
                    <div className="bg-white rounded-2xl border border-zinc-200 p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <Book className="h-5 w-5 text-zinc-400" />
                            <h2 className="text-base font-semibold text-zinc-900">Documentation</h2>
                        </div>

                        <a
                            href="#"
                            className="flex items-center justify-between p-3 bg-zinc-50 rounded-xl hover:bg-zinc-100 transition-colors group"
                        >
                            <span className="text-sm font-medium text-zinc-900">Guide complet</span>
                            <ExternalLink className="h-4 w-4 text-zinc-400 group-hover:text-zinc-600" />
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
}
