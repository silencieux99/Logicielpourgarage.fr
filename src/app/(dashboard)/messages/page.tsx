"use client"

import { useState, useEffect } from "react"
import {
    MessageSquare,
    Send,
    Mail,
    Smartphone,
    Clock,
    Check,
    CheckCheck,
    Plus,
    Search,
    FileText,
    ChevronRight,
    Loader2
} from "lucide-react"
import { cn } from "@/lib/utils"

interface MessageTemplate {
    id: string
    nom: string
    type: "sms" | "email"
    sujet?: string
    contenu: string
}

interface SentMessage {
    id: string
    client: string
    type: "sms" | "email"
    contenu: string
    date: string
    statut: "sent" | "delivered" | "read"
}

export default function MessagesPage() {
    const [activeTab, setActiveTab] = useState<"envois" | "templates">("envois")
    const [loading, setLoading] = useState(true)
    const [templates, setTemplates] = useState<MessageTemplate[]>([])
    const [messages, setMessages] = useState<SentMessage[]>([])
    const [searchQuery, setSearchQuery] = useState("")

    // Stats
    const [smsCount, setSmsCount] = useState(0)
    const [emailCount, setEmailCount] = useState(0)
    const [smsCredits, setSmsCredits] = useState(0)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        setLoading(true)
        try {
            // TODO: Load from Firebase
            setTemplates([])
            setMessages([])
            setSmsCount(0)
            setEmailCount(0)
            setSmsCredits(0)
        } catch (error) {
            console.error("Erreur chargement messages:", error)
        } finally {
            setLoading(false)
        }
    }

    const filteredMessages = messages.filter(msg =>
        msg.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
        msg.contenu.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-zinc-900">Messages</h1>
                    <p className="text-sm text-zinc-500 mt-1">Gérez vos communications clients</p>
                </div>

                <button className="h-10 sm:h-11 px-4 sm:px-5 bg-zinc-900 hover:bg-zinc-800 text-white text-sm font-medium rounded-xl flex items-center gap-2 transition-colors">
                    <Plus className="h-4 w-4" />
                    <span>Nouveau message</span>
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 p-1 bg-zinc-100 rounded-xl w-fit">
                <button
                    onClick={() => setActiveTab("envois")}
                    className={cn(
                        "px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2",
                        activeTab === "envois" ? "bg-white shadow-sm text-zinc-900" : "text-zinc-600 hover:text-zinc-900"
                    )}
                >
                    <Send className="h-4 w-4" />
                    Envois récents
                </button>
                <button
                    onClick={() => setActiveTab("templates")}
                    className={cn(
                        "px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2",
                        activeTab === "templates" ? "bg-white shadow-sm text-zinc-900" : "text-zinc-600 hover:text-zinc-900"
                    )}
                >
                    <FileText className="h-4 w-4" />
                    Modèles
                </button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
                </div>
            ) : activeTab === "envois" ? (
                <>
                    {/* Stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="bg-white rounded-xl border border-zinc-200 p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                                    <Smartphone className="h-4 w-4 text-blue-600" />
                                </div>
                            </div>
                            <p className="text-xl font-bold text-zinc-900">{smsCount}</p>
                            <p className="text-xs text-zinc-500">SMS ce mois</p>
                        </div>
                        <div className="bg-white rounded-xl border border-zinc-200 p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
                                    <Mail className="h-4 w-4 text-violet-600" />
                                </div>
                            </div>
                            <p className="text-xl font-bold text-zinc-900">{emailCount}</p>
                            <p className="text-xs text-zinc-500">Emails ce mois</p>
                        </div>
                        <div className="bg-white rounded-xl border border-zinc-200 p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                                    <CheckCheck className="h-4 w-4 text-emerald-600" />
                                </div>
                            </div>
                            <p className="text-xl font-bold text-zinc-900">--</p>
                            <p className="text-xs text-zinc-500">Taux délivrabilité</p>
                        </div>
                        <div className="bg-white rounded-xl border border-zinc-200 p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                                    <Clock className="h-4 w-4 text-amber-600" />
                                </div>
                            </div>
                            <p className="text-xl font-bold text-zinc-900">0</p>
                            <p className="text-xs text-zinc-500">Programmés</p>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                        <input
                            type="text"
                            placeholder="Rechercher un message..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-11 pl-10 pr-4 bg-white border border-zinc-200 rounded-xl text-sm"
                        />
                    </div>

                    {/* Message List */}
                    {filteredMessages.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-zinc-200 p-8 sm:p-16 text-center">
                            <div className="w-16 h-16 rounded-2xl bg-zinc-100 flex items-center justify-center mx-auto mb-4">
                                <MessageSquare className="h-8 w-8 text-zinc-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-zinc-900 mb-2">Aucun message envoyé</h3>
                            <p className="text-sm text-zinc-500 max-w-md mx-auto">
                                Envoyez des rappels SMS et emails à vos clients
                            </p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl border border-zinc-200">
                            <div className="p-4 border-b border-zinc-100">
                                <h2 className="text-base font-semibold text-zinc-900">Historique des envois</h2>
                            </div>
                            <div className="divide-y divide-zinc-100">
                                {filteredMessages.map((msg) => (
                                    <div key={msg.id} className="p-4 hover:bg-zinc-50 transition-colors cursor-pointer">
                                        <div className="flex items-start gap-3">
                                            <div className={cn(
                                                "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                                                msg.type === "sms" ? "bg-blue-100" : "bg-violet-100"
                                            )}>
                                                {msg.type === "sms" ? (
                                                    <Smartphone className="h-5 w-5 text-blue-600" />
                                                ) : (
                                                    <Mail className="h-5 w-5 text-violet-600" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-2">
                                                    <p className="text-sm font-semibold text-zinc-900">{msg.client}</p>
                                                    <span className="text-xs text-zinc-500">{msg.date}</span>
                                                </div>
                                                <p className="text-sm text-zinc-600 truncate">{msg.contenu}</p>
                                                <div className="flex items-center gap-1 mt-1">
                                                    {msg.statut === "read" ? (
                                                        <CheckCheck className="h-3.5 w-3.5 text-blue-500" />
                                                    ) : (
                                                        <Check className="h-3.5 w-3.5 text-zinc-400" />
                                                    )}
                                                    <span className="text-xs text-zinc-500">
                                                        {msg.statut === "read" ? "Lu" : msg.statut === "delivered" ? "Délivré" : "Envoyé"}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            ) : (
                // Templates tab
                <div>
                    {templates.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-zinc-200 p-8 sm:p-16 text-center">
                            <div className="w-16 h-16 rounded-2xl bg-zinc-100 flex items-center justify-center mx-auto mb-4">
                                <FileText className="h-8 w-8 text-zinc-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-zinc-900 mb-2">Aucun modèle</h3>
                            <p className="text-sm text-zinc-500 mb-6 max-w-md mx-auto">
                                Créez des modèles de messages pour gagner du temps
                            </p>
                            <button className="inline-flex h-11 px-6 bg-zinc-900 hover:bg-zinc-800 text-white text-sm font-medium rounded-xl items-center gap-2 transition-colors">
                                <Plus className="h-4 w-4" />
                                Créer un modèle
                            </button>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {templates.map((template) => (
                                <div
                                    key={template.id}
                                    className="bg-white rounded-xl border border-zinc-200 p-5 hover:border-zinc-300 transition-colors cursor-pointer"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <div className={cn(
                                                "w-8 h-8 rounded-lg flex items-center justify-center",
                                                template.type === "sms" ? "bg-blue-100" : "bg-violet-100"
                                            )}>
                                                {template.type === "sms" ? (
                                                    <Smartphone className="h-4 w-4 text-blue-600" />
                                                ) : (
                                                    <Mail className="h-4 w-4 text-violet-600" />
                                                )}
                                            </div>
                                            <span className="text-xs font-medium text-zinc-500 uppercase">{template.type}</span>
                                        </div>
                                        <ChevronRight className="h-4 w-4 text-zinc-400" />
                                    </div>

                                    <h3 className="text-[15px] font-semibold text-zinc-900 mb-2">{template.nom}</h3>
                                    <p className="text-sm text-zinc-600 line-clamp-3">{template.contenu}</p>
                                </div>
                            ))}

                            <button className="border-2 border-dashed border-zinc-300 rounded-xl p-6 flex flex-col items-center justify-center gap-3 hover:border-zinc-400 hover:bg-zinc-50 transition-colors min-h-[200px]">
                                <div className="w-12 h-12 rounded-xl bg-zinc-100 flex items-center justify-center">
                                    <Plus className="h-6 w-6 text-zinc-500" />
                                </div>
                                <p className="text-sm font-medium text-zinc-600">Créer un modèle</p>
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* SMS Credits Banner */}
            <div className="bg-gradient-to-r from-blue-600 to-violet-600 rounded-2xl p-6 text-white">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h3 className="text-lg font-semibold mb-1">Crédit SMS</h3>
                        <p className="text-sm text-white/80">
                            {smsCredits > 0
                                ? `Il vous reste ${smsCredits} SMS disponibles`
                                : "Configurez vos crédits SMS pour envoyer des rappels"}
                        </p>
                    </div>
                    <button className="h-11 px-6 bg-white text-violet-600 font-semibold rounded-xl hover:bg-zinc-100 transition-colors">
                        {smsCredits > 0 ? "Acheter des crédits" : "Configurer"}
                    </button>
                </div>
            </div>
        </div>
    )
}
