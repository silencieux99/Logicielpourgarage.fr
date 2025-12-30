"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import {
    ArrowRight,
    ArrowLeft,
    Building2,
    User,
    Mail,
    Check,
    Loader2,
    Eye,
    EyeOff
} from "lucide-react"
import { cn } from "@/lib/utils"

const steps = [
    { id: 1, title: "Entreprise", icon: Building2 },
    { id: 2, title: "Responsable", icon: User },
    { id: 3, title: "Compte", icon: Mail },
    { id: 4, title: "Confirmation", icon: Check },
]

const statutsJuridiques = [
    "Auto-entrepreneur",
    "EURL",
    "SARL",
    "SAS",
    "SASU",
    "SA",
    "Entreprise individuelle",
    "Autre"
]

const effectifs = [
    "1 personne (moi seul)",
    "2-5 personnes",
    "6-10 personnes",
    "11-20 personnes",
    "Plus de 20 personnes"
]

export default function InscriptionPage() {
    const [currentStep, setCurrentStep] = useState(1)
    const [isLoading, setIsLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    const [formData, setFormData] = useState({
        // Étape 1 - Entreprise
        nomGarage: "",
        statutJuridique: "",
        siret: "",
        numeroTVA: "",
        adresse: "",
        codePostal: "",
        ville: "",
        telephone: "",
        siteWeb: "",
        effectif: "",
        activitePrincipale: "Mécanique générale",

        // Étape 2 - Responsable
        civilite: "M.",
        prenom: "",
        nom: "",
        fonction: "Gérant",
        telephonePersonnel: "",

        // Étape 3 - Compte
        email: "",
        password: "",
        confirmPassword: "",
        acceptCGU: false,
        acceptNewsletter: false,
    })

    const updateField = (field: string, value: string | boolean) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const nextStep = () => {
        if (currentStep < 4) setCurrentStep(currentStep + 1)
    }

    const prevStep = () => {
        if (currentStep > 1) setCurrentStep(currentStep - 1)
    }

    const handleSubmit = async () => {
        setIsLoading(true)
        await new Promise(resolve => setTimeout(resolve, 2000))
        setIsLoading(false)
        setCurrentStep(4)
    }

    const canProceed = () => {
        switch (currentStep) {
            case 1:
                return formData.nomGarage && formData.statutJuridique && formData.adresse && formData.codePostal && formData.ville
            case 2:
                return formData.prenom && formData.nom
            case 3:
                return formData.email && formData.password && formData.password === formData.confirmPassword && formData.acceptCGU && formData.password.length >= 8
            default:
                return true
        }
    }

    return (
        <div className="min-h-screen bg-zinc-50">
            {/* Header */}
            <header className="bg-white border-b border-zinc-200">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 flex items-center justify-between">
                    <Link href="/" className="flex items-center">
                        <img
                            src="/GaragePROlogo.png"
                            alt="GaragePro"
                            className="h-20 sm:h-24 w-auto"
                        />
                    </Link>

                    <Link href="/connexion" className="text-[14px] text-zinc-600 hover:text-zinc-900">
                        Déjà inscrit ?
                    </Link>
                </div>
            </header>

            {/* Progress */}
            <div className="bg-white border-b border-zinc-200">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
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
            <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
                {/* Step 1 - Entreprise */}
                {currentStep === 1 && (
                    <div className="animate-fade-in">
                        <div className="mb-8">
                            <h1 className="text-[24px] sm:text-[28px] font-bold text-zinc-900 mb-2">
                                Informations sur votre garage
                            </h1>
                            <p className="text-[15px] text-zinc-600">
                                Ces informations apparaîtront sur vos devis et factures.
                            </p>
                        </div>

                        <div className="bg-white rounded-2xl border border-zinc-200 p-6 sm:p-8 space-y-6">
                            {/* Nom du garage */}
                            <div>
                                <label className="block text-[14px] font-medium text-zinc-700 mb-2">
                                    Nom du garage <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.nomGarage}
                                    onChange={(e) => updateField("nomGarage", e.target.value)}
                                    placeholder="Ex: Garage Dupont"
                                    className="w-full h-12 px-4 bg-white border border-zinc-300 rounded-xl text-[15px] placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                                />
                            </div>

                            {/* Statut juridique + SIRET */}
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[14px] font-medium text-zinc-700 mb-2">
                                        Statut juridique <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={formData.statutJuridique}
                                        onChange={(e) => updateField("statutJuridique", e.target.value)}
                                        className="w-full h-12 px-4 bg-white border border-zinc-300 rounded-xl text-[15px] focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                                    >
                                        <option value="">Sélectionner...</option>
                                        {statutsJuridiques.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[14px] font-medium text-zinc-700 mb-2">
                                        SIRET
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.siret}
                                        onChange={(e) => updateField("siret", e.target.value)}
                                        placeholder="123 456 789 00012"
                                        maxLength={17}
                                        className="w-full h-12 px-4 bg-white border border-zinc-300 rounded-xl text-[15px] placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            {/* TVA */}
                            <div>
                                <label className="block text-[14px] font-medium text-zinc-700 mb-2">
                                    Numéro de TVA intracommunautaire
                                </label>
                                <input
                                    type="text"
                                    value={formData.numeroTVA}
                                    onChange={(e) => updateField("numeroTVA", e.target.value)}
                                    placeholder="FR12345678901"
                                    className="w-full h-12 px-4 bg-white border border-zinc-300 rounded-xl text-[15px] placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                                />
                            </div>

                            {/* Adresse */}
                            <div>
                                <label className="block text-[14px] font-medium text-zinc-700 mb-2">
                                    Adresse <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.adresse}
                                    onChange={(e) => updateField("adresse", e.target.value)}
                                    placeholder="12 rue de la Mécanique"
                                    className="w-full h-12 px-4 bg-white border border-zinc-300 rounded-xl text-[15px] placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                                />
                            </div>

                            {/* CP + Ville */}
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-[14px] font-medium text-zinc-700 mb-2">
                                        Code postal <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.codePostal}
                                        onChange={(e) => updateField("codePostal", e.target.value)}
                                        placeholder="75001"
                                        maxLength={5}
                                        className="w-full h-12 px-4 bg-white border border-zinc-300 rounded-xl text-[15px] placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-[14px] font-medium text-zinc-700 mb-2">
                                        Ville <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.ville}
                                        onChange={(e) => updateField("ville", e.target.value)}
                                        placeholder="Paris"
                                        className="w-full h-12 px-4 bg-white border border-zinc-300 rounded-xl text-[15px] placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            {/* Téléphone + Site */}
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[14px] font-medium text-zinc-700 mb-2">
                                        Téléphone du garage
                                    </label>
                                    <input
                                        type="tel"
                                        value={formData.telephone}
                                        onChange={(e) => updateField("telephone", e.target.value)}
                                        placeholder="01 23 45 67 89"
                                        className="w-full h-12 px-4 bg-white border border-zinc-300 rounded-xl text-[15px] placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[14px] font-medium text-zinc-700 mb-2">
                                        Site web
                                    </label>
                                    <input
                                        type="url"
                                        value={formData.siteWeb}
                                        onChange={(e) => updateField("siteWeb", e.target.value)}
                                        placeholder="https://www.mongarage.fr"
                                        className="w-full h-12 px-4 bg-white border border-zinc-300 rounded-xl text-[15px] placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            {/* Effectif */}
                            <div>
                                <label className="block text-[14px] font-medium text-zinc-700 mb-2">
                                    Taille de l'équipe
                                </label>
                                <select
                                    value={formData.effectif}
                                    onChange={(e) => updateField("effectif", e.target.value)}
                                    className="w-full h-12 px-4 bg-white border border-zinc-300 rounded-xl text-[15px] focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                                >
                                    <option value="">Sélectionner...</option>
                                    {effectifs.map(e => <option key={e} value={e}>{e}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 2 - Responsable */}
                {currentStep === 2 && (
                    <div className="animate-fade-in">
                        <div className="mb-8">
                            <h1 className="text-[24px] sm:text-[28px] font-bold text-zinc-900 mb-2">
                                Vos informations personnelles
                            </h1>
                            <p className="text-[15px] text-zinc-600">
                                Informations sur le responsable du compte.
                            </p>
                        </div>

                        <div className="bg-white rounded-2xl border border-zinc-200 p-6 sm:p-8 space-y-6">
                            {/* Civilité */}
                            <div>
                                <label className="block text-[14px] font-medium text-zinc-700 mb-3">
                                    Civilité
                                </label>
                                <div className="flex gap-3">
                                    {["M.", "Mme"].map(c => (
                                        <button
                                            key={c}
                                            type="button"
                                            onClick={() => updateField("civilite", c)}
                                            className={cn(
                                                "px-6 py-3 rounded-xl text-[14px] font-medium transition-colors",
                                                formData.civilite === c
                                                    ? "bg-zinc-900 text-white"
                                                    : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                                            )}
                                        >
                                            {c}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Prénom + Nom */}
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[14px] font-medium text-zinc-700 mb-2">
                                        Prénom <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.prenom}
                                        onChange={(e) => updateField("prenom", e.target.value)}
                                        placeholder="Jean"
                                        className="w-full h-12 px-4 bg-white border border-zinc-300 rounded-xl text-[15px] placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[14px] font-medium text-zinc-700 mb-2">
                                        Nom <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.nom}
                                        onChange={(e) => updateField("nom", e.target.value)}
                                        placeholder="Dupont"
                                        className="w-full h-12 px-4 bg-white border border-zinc-300 rounded-xl text-[15px] placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            {/* Fonction */}
                            <div>
                                <label className="block text-[14px] font-medium text-zinc-700 mb-2">
                                    Fonction dans l'entreprise
                                </label>
                                <select
                                    value={formData.fonction}
                                    onChange={(e) => updateField("fonction", e.target.value)}
                                    className="w-full h-12 px-4 bg-white border border-zinc-300 rounded-xl text-[15px] focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                                >
                                    <option value="Gérant">Gérant</option>
                                    <option value="Directeur">Directeur</option>
                                    <option value="Responsable atelier">Responsable atelier</option>
                                    <option value="Chef mécanicien">Chef mécanicien</option>
                                    <option value="Secrétaire">Secrétaire</option>
                                    <option value="Autre">Autre</option>
                                </select>
                            </div>

                            {/* Téléphone perso */}
                            <div>
                                <label className="block text-[14px] font-medium text-zinc-700 mb-2">
                                    Téléphone personnel
                                </label>
                                <input
                                    type="tel"
                                    value={formData.telephonePersonnel}
                                    onChange={(e) => updateField("telephonePersonnel", e.target.value)}
                                    placeholder="06 12 34 56 78"
                                    className="w-full h-12 px-4 bg-white border border-zinc-300 rounded-xl text-[15px] placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 3 - Compte */}
                {currentStep === 3 && (
                    <div className="animate-fade-in">
                        <div className="mb-8">
                            <h1 className="text-[24px] sm:text-[28px] font-bold text-zinc-900 mb-2">
                                Créez votre compte
                            </h1>
                            <p className="text-[15px] text-zinc-600">
                                Ces identifiants vous permettront de vous connecter.
                            </p>
                        </div>

                        <div className="bg-white rounded-2xl border border-zinc-200 p-6 sm:p-8 space-y-6">
                            {/* Email */}
                            <div>
                                <label className="block text-[14px] font-medium text-zinc-700 mb-2">
                                    Adresse email <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => updateField("email", e.target.value)}
                                    placeholder="vous@exemple.fr"
                                    className="w-full h-12 px-4 bg-white border border-zinc-300 rounded-xl text-[15px] placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                                />
                                <p className="text-[12px] text-zinc-500 mt-2">
                                    Un email de vérification vous sera envoyé
                                </p>
                            </div>

                            {/* Mot de passe */}
                            <div>
                                <label className="block text-[14px] font-medium text-zinc-700 mb-2">
                                    Mot de passe <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={formData.password}
                                        onChange={(e) => updateField("password", e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full h-12 px-4 pr-12 bg-white border border-zinc-300 rounded-xl text-[15px] placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                                    >
                                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                                <p className={cn(
                                    "text-[12px] mt-2",
                                    formData.password.length >= 8 ? "text-emerald-600" : "text-zinc-500"
                                )}>
                                    {formData.password.length >= 8 ? "✓ " : ""}Minimum 8 caractères
                                </p>
                            </div>

                            {/* Confirmer mot de passe */}
                            <div>
                                <label className="block text-[14px] font-medium text-zinc-700 mb-2">
                                    Confirmer le mot de passe <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={formData.confirmPassword}
                                        onChange={(e) => updateField("confirmPassword", e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full h-12 px-4 pr-12 bg-white border border-zinc-300 rounded-xl text-[15px] placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                                    >
                                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                                {formData.confirmPassword && (
                                    <p className={cn(
                                        "text-[12px] mt-2",
                                        formData.password === formData.confirmPassword ? "text-emerald-600" : "text-red-500"
                                    )}>
                                        {formData.password === formData.confirmPassword ? "✓ Les mots de passe correspondent" : "✗ Les mots de passe ne correspondent pas"}
                                    </p>
                                )}
                            </div>

                            {/* CGU */}
                            <div className="space-y-3 pt-4 border-t border-zinc-100">
                                <div className="flex items-start gap-3">
                                    <input
                                        type="checkbox"
                                        id="cgu"
                                        checked={formData.acceptCGU}
                                        onChange={(e) => updateField("acceptCGU", e.target.checked)}
                                        className="w-5 h-5 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900 mt-0.5"
                                    />
                                    <label htmlFor="cgu" className="text-[13px] text-zinc-600">
                                        J'accepte les <a href="#" className="text-zinc-900 font-medium hover:underline">conditions générales d'utilisation</a> et la <a href="#" className="text-zinc-900 font-medium hover:underline">politique de confidentialité</a> <span className="text-red-500">*</span>
                                    </label>
                                </div>

                                <div className="flex items-start gap-3">
                                    <input
                                        type="checkbox"
                                        id="newsletter"
                                        checked={formData.acceptNewsletter}
                                        onChange={(e) => updateField("acceptNewsletter", e.target.checked)}
                                        className="w-5 h-5 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900 mt-0.5"
                                    />
                                    <label htmlFor="newsletter" className="text-[13px] text-zinc-600">
                                        Je souhaite recevoir des conseils et actualités par email (optionnel)
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 4 - Confirmation */}
                {currentStep === 4 && (
                    <div className="animate-fade-in text-center py-8">
                        <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
                            <Check className="h-10 w-10 text-emerald-600" />
                        </div>

                        <h1 className="text-[28px] sm:text-[32px] font-bold text-zinc-900 mb-3">
                            Bienvenue, {formData.prenom} !
                        </h1>

                        <p className="text-[16px] text-zinc-600 max-w-md mx-auto mb-8">
                            Votre compte <strong>{formData.nomGarage}</strong> a été créé avec succès.
                        </p>

                        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 max-w-md mx-auto mb-8">
                            <div className="flex items-start gap-3">
                                <Mail className="h-6 w-6 text-amber-600 flex-shrink-0 mt-0.5" />
                                <div className="text-left">
                                    <p className="text-[14px] font-medium text-amber-900 mb-1">
                                        Vérifiez votre email
                                    </p>
                                    <p className="text-[13px] text-amber-700">
                                        Un email de confirmation a été envoyé à <strong>{formData.email}</strong>.
                                        Cliquez sur le lien pour activer votre compte.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <Link
                            href="/configuration"
                            className="inline-flex h-12 px-8 bg-zinc-900 hover:bg-zinc-800 text-white text-[15px] font-semibold rounded-xl items-center gap-2 transition-colors"
                        >
                            Configurer mon garage
                            <ArrowRight className="h-5 w-5" />
                        </Link>

                        <p className="text-[13px] text-zinc-500 mt-4">
                            Vous pourrez personnaliser vos paramètres de facturation
                        </p>
                    </div>
                )}

                {/* Navigation */}
                {currentStep < 4 && (
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

                        {currentStep < 3 ? (
                            <button
                                onClick={nextStep}
                                disabled={!canProceed()}
                                className="h-12 px-8 bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-300 disabled:cursor-not-allowed text-white text-[15px] font-semibold rounded-xl flex items-center gap-2 transition-colors"
                            >
                                Continuer
                                <ArrowRight className="h-5 w-5" />
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={!canProceed() || isLoading}
                                className="h-12 px-8 bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-300 disabled:cursor-not-allowed text-white text-[15px] font-semibold rounded-xl flex items-center gap-2 transition-colors"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        Création en cours...
                                    </>
                                ) : (
                                    <>
                                        Créer mon compte
                                        <ArrowRight className="h-5 w-5" />
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                )}
            </main>
        </div>
    )
}
