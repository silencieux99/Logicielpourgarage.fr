"use client"

import Link from "next/link"
import { useState } from "react"
import {
    ArrowRight,
    ArrowLeft,
    FileText,
    Globe,
    Euro,
    Clock,
    Settings,
    Check,
    Loader2,
    Building2,
    Palette
} from "lucide-react"
import { cn } from "@/lib/utils"

const steps = [
    { id: 1, title: "Documents", icon: FileText },
    { id: 2, title: "Fiscalité", icon: Euro },
    { id: 3, title: "Tarifs", icon: Clock },
    { id: 4, title: "Préférences", icon: Settings },
]

const paysOptions = [
    { code: "FR", nom: "France", devise: "EUR", tva: 20 },
    { code: "BE", nom: "Belgique", devise: "EUR", tva: 21 },
    { code: "CH", nom: "Suisse", devise: "CHF", tva: 7.7 },
    { code: "LU", nom: "Luxembourg", devise: "EUR", tva: 17 },
]

const formatsPapier = [
    { id: "A4", nom: "A4 (210 × 297 mm)" },
    { id: "Letter", nom: "Letter (US)" },
]

const modeleEntete = [
    { id: "classique", nom: "Classique", description: "Logo à gauche, coordonnées à droite" },
    { id: "centre", nom: "Centré", description: "Logo et nom centrés en haut" },
    { id: "minimal", nom: "Minimaliste", description: "Design épuré, sans bordure" },
]

export default function ConfigurationPage() {
    const [currentStep, setCurrentStep] = useState(1)
    const [isLoading, setIsLoading] = useState(false)

    const [config, setConfig] = useState({
        // Documents
        formatPapier: "A4",
        modeleEntete: "classique",
        afficherLogo: true,
        couleurPrincipale: "#18181b",
        prefixeDevis: "DEV-",
        prefixeFacture: "FAC-",
        numeroDevisDepart: "001",
        numeroFactureDepart: "001",
        mentionsDevis: "Devis valable 30 jours. Acompte de 30% à la commande.",
        mentionsFacture: "Paiement à réception. Pénalités de retard : 3x le taux légal.",
        conditionsGenerales: "",

        // Fiscalité
        pays: "FR",
        devise: "EUR",
        regimeTVA: "normal",
        tauxTVA: 20,
        exonerationTVA: false,
        mentionExoneration: "TVA non applicable, art. 293 B du CGI",

        // Tarifs
        tauxHoraireMO: 55,
        tarifDiagnostic: 45,
        margeMinPieces: 25,
        arrondiPrix: "0.01",

        // Préférences
        deviseSymbole: "€",
        formatDate: "DD/MM/YYYY",
        formatHeure: "24h",
        premierJourSemaine: "lundi",
        fuseauHoraire: "Europe/Paris",
        langue: "fr",
        emailNotifications: true,
        smsRappels: true,
    })

    const updateConfig = (field: string, value: any) => {
        setConfig(prev => ({ ...prev, [field]: value }))

        // Auto-update devise when country changes
        if (field === "pays") {
            const pays = paysOptions.find(p => p.code === value)
            if (pays) {
                setConfig(prev => ({
                    ...prev,
                    devise: pays.devise,
                    tauxTVA: pays.tva,
                    deviseSymbole: pays.devise === "EUR" ? "€" : "CHF"
                }))
            }
        }
    }

    const nextStep = () => {
        if (currentStep < 4) setCurrentStep(currentStep + 1)
    }

    const prevStep = () => {
        if (currentStep > 1) setCurrentStep(currentStep - 1)
    }

    const handleFinish = async () => {
        setIsLoading(true)
        await new Promise(resolve => setTimeout(resolve, 1500))
        setIsLoading(false)
        window.location.href = "/dashboard"
    }

    return (
        <div className="min-h-screen bg-zinc-50">
            {/* Header */}
            <header className="bg-white border-b border-zinc-200">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">G</span>
                        </div>
                        <span className="text-[16px] font-bold text-zinc-900">GaragePro</span>
                    </div>

                    <button
                        onClick={() => window.location.href = "/dashboard"}
                        className="text-[14px] text-zinc-600 hover:text-zinc-900"
                    >
                        Passer cette étape
                    </button>
                </div>
            </header>

            {/* Progress */}
            <div className="bg-white border-b border-zinc-200">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
                    <div className="flex items-center justify-between">
                        {steps.map((step, i) => (
                            <div key={step.id} className="flex items-center">
                                <div className="flex flex-col items-center">
                                    <div className={cn(
                                        "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                                        currentStep > step.id ? "bg-emerald-500 text-white" :
                                            currentStep === step.id ? "bg-zinc-900 text-white" :
                                                "bg-zinc-100 text-zinc-400"
                                    )}>
                                        {currentStep > step.id ? <Check className="h-5 w-5" /> : <step.icon className="h-5 w-5" />}
                                    </div>
                                    <span className={cn(
                                        "text-[12px] mt-2 hidden sm:block",
                                        currentStep >= step.id ? "text-zinc-900 font-medium" : "text-zinc-400"
                                    )}>
                                        {step.title}
                                    </span>
                                </div>
                                {i < steps.length - 1 && (
                                    <div className={cn(
                                        "w-12 sm:w-24 h-0.5 mx-2 sm:mx-4",
                                        currentStep > step.id ? "bg-emerald-500" : "bg-zinc-200"
                                    )}></div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content */}
            <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
                {/* Step 1 - Documents */}
                {currentStep === 1 && (
                    <div className="animate-fade-in">
                        <div className="mb-8">
                            <h1 className="text-[24px] sm:text-[28px] font-bold text-zinc-900 mb-2">
                                Configuration des documents
                            </h1>
                            <p className="text-[15px] text-zinc-600">
                                Personnalisez l'apparence de vos devis et factures.
                            </p>
                        </div>

                        <div className="space-y-6">
                            {/* Modèle d'en-tête */}
                            <div className="bg-white rounded-2xl border border-zinc-200 p-6 sm:p-8">
                                <h2 className="text-[16px] font-semibold text-zinc-900 mb-4 flex items-center gap-2">
                                    <Palette className="h-5 w-5 text-zinc-400" />
                                    Style d'en-tête
                                </h2>

                                <div className="grid sm:grid-cols-3 gap-4 mb-6">
                                    {modeleEntete.map(m => (
                                        <button
                                            key={m.id}
                                            onClick={() => updateConfig("modeleEntete", m.id)}
                                            className={cn(
                                                "p-4 rounded-xl border-2 text-left transition-all",
                                                config.modeleEntete === m.id
                                                    ? "border-zinc-900 bg-zinc-50"
                                                    : "border-zinc-200 hover:border-zinc-300"
                                            )}
                                        >
                                            <p className="text-[14px] font-medium text-zinc-900">{m.nom}</p>
                                            <p className="text-[12px] text-zinc-500 mt-1">{m.description}</p>
                                        </button>
                                    ))}
                                </div>

                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[14px] font-medium text-zinc-700 mb-2">
                                            Format de papier
                                        </label>
                                        <select
                                            value={config.formatPapier}
                                            onChange={(e) => updateConfig("formatPapier", e.target.value)}
                                            className="w-full h-12 px-4 bg-white border border-zinc-300 rounded-xl text-[15px] focus:outline-none focus:ring-2 focus:ring-zinc-900"
                                        >
                                            {formatsPapier.map(f => <option key={f.id} value={f.id}>{f.nom}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[14px] font-medium text-zinc-700 mb-2">
                                            Couleur principale
                                        </label>
                                        <div className="flex gap-3">
                                            <input
                                                type="color"
                                                value={config.couleurPrincipale}
                                                onChange={(e) => updateConfig("couleurPrincipale", e.target.value)}
                                                className="w-12 h-12 rounded-xl border border-zinc-300 cursor-pointer"
                                            />
                                            <input
                                                type="text"
                                                value={config.couleurPrincipale}
                                                onChange={(e) => updateConfig("couleurPrincipale", e.target.value)}
                                                className="flex-1 h-12 px-4 bg-white border border-zinc-300 rounded-xl text-[15px] font-mono"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Numérotation */}
                            <div className="bg-white rounded-2xl border border-zinc-200 p-6 sm:p-8">
                                <h2 className="text-[16px] font-semibold text-zinc-900 mb-4 flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-zinc-400" />
                                    Numérotation
                                </h2>

                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[14px] font-medium text-zinc-700 mb-2">
                                            Préfixe des devis
                                        </label>
                                        <input
                                            type="text"
                                            value={config.prefixeDevis}
                                            onChange={(e) => updateConfig("prefixeDevis", e.target.value)}
                                            placeholder="DEV-"
                                            className="w-full h-12 px-4 bg-white border border-zinc-300 rounded-xl text-[15px]"
                                        />
                                        <p className="text-[12px] text-zinc-500 mt-1">Ex: {config.prefixeDevis}2024-001</p>
                                    </div>
                                    <div>
                                        <label className="block text-[14px] font-medium text-zinc-700 mb-2">
                                            Préfixe des factures
                                        </label>
                                        <input
                                            type="text"
                                            value={config.prefixeFacture}
                                            onChange={(e) => updateConfig("prefixeFacture", e.target.value)}
                                            placeholder="FAC-"
                                            className="w-full h-12 px-4 bg-white border border-zinc-300 rounded-xl text-[15px]"
                                        />
                                        <p className="text-[12px] text-zinc-500 mt-1">Ex: {config.prefixeFacture}2024-001</p>
                                    </div>
                                </div>
                            </div>

                            {/* Mentions légales */}
                            <div className="bg-white rounded-2xl border border-zinc-200 p-6 sm:p-8">
                                <h2 className="text-[16px] font-semibold text-zinc-900 mb-4">
                                    Mentions sur les documents
                                </h2>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-[14px] font-medium text-zinc-700 mb-2">
                                            Mentions sur les devis
                                        </label>
                                        <textarea
                                            value={config.mentionsDevis}
                                            onChange={(e) => updateConfig("mentionsDevis", e.target.value)}
                                            rows={2}
                                            className="w-full px-4 py-3 bg-white border border-zinc-300 rounded-xl text-[14px] resize-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[14px] font-medium text-zinc-700 mb-2">
                                            Mentions sur les factures
                                        </label>
                                        <textarea
                                            value={config.mentionsFacture}
                                            onChange={(e) => updateConfig("mentionsFacture", e.target.value)}
                                            rows={2}
                                            className="w-full px-4 py-3 bg-white border border-zinc-300 rounded-xl text-[14px] resize-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 2 - Fiscalité */}
                {currentStep === 2 && (
                    <div className="animate-fade-in">
                        <div className="mb-8">
                            <h1 className="text-[24px] sm:text-[28px] font-bold text-zinc-900 mb-2">
                                Configuration fiscale
                            </h1>
                            <p className="text-[15px] text-zinc-600">
                                Définissez les règles de TVA et votre régime fiscal.
                            </p>
                        </div>

                        <div className="space-y-6">
                            {/* Pays et devise */}
                            <div className="bg-white rounded-2xl border border-zinc-200 p-6 sm:p-8">
                                <h2 className="text-[16px] font-semibold text-zinc-900 mb-4 flex items-center gap-2">
                                    <Globe className="h-5 w-5 text-zinc-400" />
                                    Localisation
                                </h2>

                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[14px] font-medium text-zinc-700 mb-2">
                                            Pays d'exercice
                                        </label>
                                        <select
                                            value={config.pays}
                                            onChange={(e) => updateConfig("pays", e.target.value)}
                                            className="w-full h-12 px-4 bg-white border border-zinc-300 rounded-xl text-[15px]"
                                        >
                                            {paysOptions.map(p => <option key={p.code} value={p.code}>{p.nom}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[14px] font-medium text-zinc-700 mb-2">
                                            Devise
                                        </label>
                                        <select
                                            value={config.devise}
                                            onChange={(e) => updateConfig("devise", e.target.value)}
                                            className="w-full h-12 px-4 bg-white border border-zinc-300 rounded-xl text-[15px]"
                                        >
                                            <option value="EUR">Euro (€)</option>
                                            <option value="CHF">Franc suisse (CHF)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* TVA */}
                            <div className="bg-white rounded-2xl border border-zinc-200 p-6 sm:p-8">
                                <h2 className="text-[16px] font-semibold text-zinc-900 mb-4 flex items-center gap-2">
                                    <Euro className="h-5 w-5 text-zinc-400" />
                                    Taxe sur la valeur ajoutée (TVA)
                                </h2>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-[14px] font-medium text-zinc-700 mb-3">
                                            Régime de TVA
                                        </label>
                                        <div className="grid sm:grid-cols-3 gap-3">
                                            {[
                                                { id: "normal", nom: "Assujetti TVA", desc: "Vous collectez la TVA" },
                                                { id: "franchise", nom: "Franchise de base", desc: "Art. 293 B du CGI" },
                                                { id: "exonere", nom: "Exonéré", desc: "Activité exonérée" },
                                            ].map(r => (
                                                <button
                                                    key={r.id}
                                                    onClick={() => {
                                                        updateConfig("regimeTVA", r.id)
                                                        updateConfig("exonerationTVA", r.id !== "normal")
                                                    }}
                                                    className={cn(
                                                        "p-4 rounded-xl border-2 text-left transition-all",
                                                        config.regimeTVA === r.id
                                                            ? "border-zinc-900 bg-zinc-50"
                                                            : "border-zinc-200 hover:border-zinc-300"
                                                    )}
                                                >
                                                    <p className="text-[14px] font-medium text-zinc-900">{r.nom}</p>
                                                    <p className="text-[12px] text-zinc-500 mt-1">{r.desc}</p>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {config.regimeTVA === "normal" && (
                                        <div>
                                            <label className="block text-[14px] font-medium text-zinc-700 mb-2">
                                                Taux de TVA par défaut (%)
                                            </label>
                                            <input
                                                type="number"
                                                value={config.tauxTVA}
                                                onChange={(e) => updateConfig("tauxTVA", parseFloat(e.target.value))}
                                                step="0.1"
                                                className="w-32 h-12 px-4 bg-white border border-zinc-300 rounded-xl text-[15px]"
                                            />
                                        </div>
                                    )}

                                    {config.regimeTVA !== "normal" && (
                                        <div>
                                            <label className="block text-[14px] font-medium text-zinc-700 mb-2">
                                                Mention d'exonération
                                            </label>
                                            <input
                                                type="text"
                                                value={config.mentionExoneration}
                                                onChange={(e) => updateConfig("mentionExoneration", e.target.value)}
                                                className="w-full h-12 px-4 bg-white border border-zinc-300 rounded-xl text-[14px]"
                                            />
                                            <p className="text-[12px] text-zinc-500 mt-1">Cette mention apparaîtra sur vos factures</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 3 - Tarifs */}
                {currentStep === 3 && (
                    <div className="animate-fade-in">
                        <div className="mb-8">
                            <h1 className="text-[24px] sm:text-[28px] font-bold text-zinc-900 mb-2">
                                Tarifs et main d'œuvre
                            </h1>
                            <p className="text-[15px] text-zinc-600">
                                Définissez vos tarifs horaires et marges par défaut.
                            </p>
                        </div>

                        <div className="space-y-6">
                            {/* Tarifs horaires */}
                            <div className="bg-white rounded-2xl border border-zinc-200 p-6 sm:p-8">
                                <h2 className="text-[16px] font-semibold text-zinc-900 mb-4 flex items-center gap-2">
                                    <Clock className="h-5 w-5 text-zinc-400" />
                                    Tarifs horaires
                                </h2>

                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[14px] font-medium text-zinc-700 mb-2">
                                            Taux horaire main d'œuvre ({config.deviseSymbole}/h)
                                        </label>
                                        <input
                                            type="number"
                                            value={config.tauxHoraireMO}
                                            onChange={(e) => updateConfig("tauxHoraireMO", parseFloat(e.target.value))}
                                            step="0.5"
                                            className="w-full h-12 px-4 bg-white border border-zinc-300 rounded-xl text-[15px]"
                                        />
                                        <p className="text-[12px] text-zinc-500 mt-1">
                                            Taux par défaut pour les interventions
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-[14px] font-medium text-zinc-700 mb-2">
                                            Tarif diagnostic ({config.deviseSymbole})
                                        </label>
                                        <input
                                            type="number"
                                            value={config.tarifDiagnostic}
                                            onChange={(e) => updateConfig("tarifDiagnostic", parseFloat(e.target.value))}
                                            step="1"
                                            className="w-full h-12 px-4 bg-white border border-zinc-300 rounded-xl text-[15px]"
                                        />
                                        <p className="text-[12px] text-zinc-500 mt-1">
                                            Forfait diagnostic véhicule
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Marges */}
                            <div className="bg-white rounded-2xl border border-zinc-200 p-6 sm:p-8">
                                <h2 className="text-[16px] font-semibold text-zinc-900 mb-4 flex items-center gap-2">
                                    <Euro className="h-5 w-5 text-zinc-400" />
                                    Marges sur pièces
                                </h2>

                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[14px] font-medium text-zinc-700 mb-2">
                                            Marge minimum sur pièces (%)
                                        </label>
                                        <input
                                            type="number"
                                            value={config.margeMinPieces}
                                            onChange={(e) => updateConfig("margeMinPieces", parseFloat(e.target.value))}
                                            step="1"
                                            min="0"
                                            max="100"
                                            className="w-full h-12 px-4 bg-white border border-zinc-300 rounded-xl text-[15px]"
                                        />
                                        <p className="text-[12px] text-zinc-500 mt-1">
                                            Appliquée automatiquement sur les pièces
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-[14px] font-medium text-zinc-700 mb-2">
                                            Arrondi des prix
                                        </label>
                                        <select
                                            value={config.arrondiPrix}
                                            onChange={(e) => updateConfig("arrondiPrix", e.target.value)}
                                            className="w-full h-12 px-4 bg-white border border-zinc-300 rounded-xl text-[15px]"
                                        >
                                            <option value="0.01">Au centime (0.01)</option>
                                            <option value="0.05">5 centimes (0.05)</option>
                                            <option value="0.10">10 centimes (0.10)</option>
                                            <option value="0.50">50 centimes (0.50)</option>
                                            <option value="1.00">À l'euro (1.00)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 4 - Préférences */}
                {currentStep === 4 && (
                    <div className="animate-fade-in">
                        <div className="mb-8">
                            <h1 className="text-[24px] sm:text-[28px] font-bold text-zinc-900 mb-2">
                                Préférences générales
                            </h1>
                            <p className="text-[15px] text-zinc-600">
                                Personnalisez l'affichage et les notifications.
                            </p>
                        </div>

                        <div className="space-y-6">
                            {/* Format et langue */}
                            <div className="bg-white rounded-2xl border border-zinc-200 p-6 sm:p-8">
                                <h2 className="text-[16px] font-semibold text-zinc-900 mb-4 flex items-center gap-2">
                                    <Settings className="h-5 w-5 text-zinc-400" />
                                    Formats d'affichage
                                </h2>

                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[14px] font-medium text-zinc-700 mb-2">
                                            Format de date
                                        </label>
                                        <select
                                            value={config.formatDate}
                                            onChange={(e) => updateConfig("formatDate", e.target.value)}
                                            className="w-full h-12 px-4 bg-white border border-zinc-300 rounded-xl text-[15px]"
                                        >
                                            <option value="DD/MM/YYYY">31/12/2024 (FR)</option>
                                            <option value="MM/DD/YYYY">12/31/2024 (US)</option>
                                            <option value="YYYY-MM-DD">2024-12-31 (ISO)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[14px] font-medium text-zinc-700 mb-2">
                                            Format d'heure
                                        </label>
                                        <select
                                            value={config.formatHeure}
                                            onChange={(e) => updateConfig("formatHeure", e.target.value)}
                                            className="w-full h-12 px-4 bg-white border border-zinc-300 rounded-xl text-[15px]"
                                        >
                                            <option value="24h">14:30 (24h)</option>
                                            <option value="12h">2:30 PM (12h)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[14px] font-medium text-zinc-700 mb-2">
                                            Premier jour de la semaine
                                        </label>
                                        <select
                                            value={config.premierJourSemaine}
                                            onChange={(e) => updateConfig("premierJourSemaine", e.target.value)}
                                            className="w-full h-12 px-4 bg-white border border-zinc-300 rounded-xl text-[15px]"
                                        >
                                            <option value="lundi">Lundi</option>
                                            <option value="dimanche">Dimanche</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[14px] font-medium text-zinc-700 mb-2">
                                            Fuseau horaire
                                        </label>
                                        <select
                                            value={config.fuseauHoraire}
                                            onChange={(e) => updateConfig("fuseauHoraire", e.target.value)}
                                            className="w-full h-12 px-4 bg-white border border-zinc-300 rounded-xl text-[15px]"
                                        >
                                            <option value="Europe/Paris">Europe/Paris (GMT+1)</option>
                                            <option value="Europe/Brussels">Europe/Brussels (GMT+1)</option>
                                            <option value="Europe/Zurich">Europe/Zurich (GMT+1)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Notifications */}
                            <div className="bg-white rounded-2xl border border-zinc-200 p-6 sm:p-8">
                                <h2 className="text-[16px] font-semibold text-zinc-900 mb-4">
                                    Notifications
                                </h2>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-xl">
                                        <div>
                                            <p className="text-[14px] font-medium text-zinc-900">Notifications par email</p>
                                            <p className="text-[12px] text-zinc-500">Recevoir les alertes et résumés par email</p>
                                        </div>
                                        <button
                                            onClick={() => updateConfig("emailNotifications", !config.emailNotifications)}
                                            className={cn(
                                                "w-12 h-7 rounded-full transition-colors relative",
                                                config.emailNotifications ? "bg-emerald-500" : "bg-zinc-300"
                                            )}
                                        >
                                            <div className={cn(
                                                "w-5 h-5 bg-white rounded-full absolute top-1 transition-transform shadow-sm",
                                                config.emailNotifications ? "translate-x-6" : "translate-x-1"
                                            )}></div>
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-xl">
                                        <div>
                                            <p className="text-[14px] font-medium text-zinc-900">Rappels SMS aux clients</p>
                                            <p className="text-[12px] text-zinc-500">Envoyer des rappels de RDV par SMS</p>
                                        </div>
                                        <button
                                            onClick={() => updateConfig("smsRappels", !config.smsRappels)}
                                            className={cn(
                                                "w-12 h-7 rounded-full transition-colors relative",
                                                config.smsRappels ? "bg-emerald-500" : "bg-zinc-300"
                                            )}
                                        >
                                            <div className={cn(
                                                "w-5 h-5 bg-white rounded-full absolute top-1 transition-transform shadow-sm",
                                                config.smsRappels ? "translate-x-6" : "translate-x-1"
                                            )}></div>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Résumé */}
                            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                                        <Check className="h-5 w-5 text-emerald-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-[15px] font-semibold text-emerald-900 mb-1">
                                            Configuration terminée !
                                        </h3>
                                        <p className="text-[14px] text-emerald-700">
                                            Vous pouvez modifier ces paramètres à tout moment depuis les réglages.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Navigation */}
                <div className="flex items-center justify-between mt-8">
                    {currentStep > 1 ? (
                        <button
                            onClick={prevStep}
                            className="h-12 px-6 text-zinc-700 text-[15px] font-medium rounded-xl flex items-center gap-2 hover:bg-zinc-100 transition-colors"
                        >
                            <ArrowLeft className="h-5 w-5" />
                            Retour
                        </button>
                    ) : (
                        <div></div>
                    )}

                    {currentStep < 4 ? (
                        <button
                            onClick={nextStep}
                            className="h-12 px-8 bg-zinc-900 hover:bg-zinc-800 text-white text-[15px] font-semibold rounded-xl flex items-center gap-2 transition-colors"
                        >
                            Continuer
                            <ArrowRight className="h-5 w-5" />
                        </button>
                    ) : (
                        <button
                            onClick={handleFinish}
                            disabled={isLoading}
                            className="h-12 px-8 bg-emerald-600 hover:bg-emerald-700 text-white text-[15px] font-semibold rounded-xl flex items-center gap-2 transition-colors"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    Enregistrement...
                                </>
                            ) : (
                                <>
                                    Accéder à mon garage
                                    <ArrowRight className="h-5 w-5" />
                                </>
                            )}
                        </button>
                    )}
                </div>
            </main>
        </div>
    )
}
