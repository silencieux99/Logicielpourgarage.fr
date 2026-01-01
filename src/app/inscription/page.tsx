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
import { signUp } from "@/lib/auth"
import { createGarage, createGarageConfig } from "@/lib/database"
import { Timestamp } from "firebase/firestore"
import { useAuth } from "@/lib/auth-context"

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
    const router = useRouter()
    const { refreshGarage } = useAuth()
    const [currentStep, setCurrentStep] = useState(1)
    const [isLoading, setIsLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const [formData, setFormData] = useState({
        // Étape 1 - Entreprise
        nomGarage: "",
        statutJuridique: "",
        siret: "",
        numeroTVA: "",
        adresse: "",
        codePostal: "",
        ville: "",
        pays: "France",
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
        if (currentStep < 4) {
            setCurrentStep(currentStep + 1)
            // Scroll vers le haut immédiatement
            setTimeout(() => window.scrollTo({ top: 0, behavior: 'instant' }), 0)
        }
    }

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1)
            setTimeout(() => window.scrollTo({ top: 0, behavior: 'instant' }), 0)
        }
    }

    const handleSubmit = async () => {
        setIsLoading(true)
        setError(null)

        try {
            // 1. Créer le compte utilisateur Firebase
            const user = await signUp(formData.email, formData.password)

            // 2. Sauvegarder les données du garage dans Firestore
            // Note: Firebase n'accepte pas les valeurs undefined, on filtre les champs vides
            const garageData: any = {
                userId: user.uid,
                nom: formData.nomGarage,
                statutJuridique: formData.statutJuridique,
                adresse: formData.adresse,
                codePostal: formData.codePostal,
                ville: formData.ville,
                email: formData.email,
            }
            // Ajouter les champs optionnels seulement s'ils ont une valeur
            if (formData.siret) garageData.siret = formData.siret
            if (formData.numeroTVA) garageData.numeroTVA = formData.numeroTVA
            if (formData.telephone) garageData.telephone = formData.telephone
            if (formData.siteWeb) garageData.siteWeb = formData.siteWeb
            if (formData.effectif) garageData.effectif = formData.effectif

            console.log('💾 Inscription - Création du garage:', garageData)
            const garageId = await createGarage(garageData)
            console.log('✅ Inscription - Garage créé avec ID:', garageId)

            // 3. Créer la configuration du garage avec les valeurs par défaut
            console.log('⚙️ Inscription - Création de la config pour garageId:', garageId)
            await createGarageConfig({ garageId })
            console.log('✅ Inscription - Config créée')

            // 4. Forcer le rechargement des données du garage dans le contexte
            console.log('🔄 Inscription - Rechargement des données du garage...')
            await refreshGarage()
            console.log('✅ Inscription - Données rechargées')

            // 5. Sauvegarder les données temporaires pour l'onboarding
            if (typeof window !== 'undefined') {
                sessionStorage.setItem('onboarding_data', JSON.stringify({
                    civilite: formData.civilite,
                    prenom: formData.prenom,
                    nom: formData.nom,
                    fonction: formData.fonction,
                    telephonePersonnel: formData.telephonePersonnel,
                    pays: formData.pays,
                    acceptNewsletter: formData.acceptNewsletter,
                }))
            }

            // 6. Envoyer l'email de bienvenue
            try {
                await fetch('/api/email/send-welcome', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: formData.email,
                        prenom: formData.prenom,
                        nomGarage: formData.nomGarage,
                    }),
                })
            } catch (emailError) {
                console.error('Erreur envoi email:', emailError)
                // On continue même si l'email échoue
            }

            // 7. Afficher la page de confirmation
            setCurrentStep(4)

            // Scroll vers le haut immédiatement pour afficher la confirmation
            setTimeout(() => window.scrollTo({ top: 0, behavior: 'instant' }), 0)

            // Note: L'utilisateur est automatiquement connecté après signUp
            // La redirection vers le dashboard se fera depuis le bouton de l'étape 4
        } catch (err: any) {
            console.error('Erreur inscription:', err)
            if (err.code === 'auth/email-already-in-use') {
                setError('Un compte existe déjà avec cet email')
            } else if (err.code === 'auth/weak-password') {
                setError('Le mot de passe est trop faible')
            } else {
                setError('Une erreur est survenue. Veuillez réessayer.')
            }
        } finally {
            setIsLoading(false)
        }
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
        <div className="min-h-screen bg-zinc-50 pb-24 sm:pb-0">
            {/* Header */}
            <header className="bg-white border-b border-zinc-200">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5 flex items-center justify-between">
                    <Link href="/" className="text-[15px] sm:text-[16px] lg:text-[18px] font-bold text-zinc-900 hover:text-zinc-700 transition-colors">
                        <span className="hidden sm:inline">← Retour à l'accueil</span>
                        <span className="sm:hidden">← Accueil</span>
                    </Link>

                    <Link href="/login" className="text-[13px] sm:text-[14px] font-medium text-zinc-600 hover:text-zinc-900 transition-colors">
                        Déjà inscrit ?
                    </Link>
                </div>
            </header>

            {/* Progress */}
            <div className="bg-white border-b border-zinc-200">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
                    <div className="flex items-center justify-between max-w-2xl mx-auto">
                        {steps.map((step, i) => (
                            <div key={step.id} className="flex items-center">
                                <div className="flex flex-col items-center">
                                    <div className={cn(
                                        "w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium transition-colors",
                                        currentStep > step.id ? "bg-emerald-500 text-white" :
                                            currentStep === step.id ? "bg-zinc-900 text-white" :
                                                "bg-zinc-100 text-zinc-400"
                                    )}>
                                        {currentStep > step.id ? <Check className="h-4 w-4 sm:h-5 sm:w-5" /> : <step.icon className="h-4 w-4 sm:h-5 sm:w-5" />}
                                    </div>
                                    <span className={cn(
                                        "text-[11px] sm:text-[12px] mt-1.5 sm:mt-2 hidden md:block",
                                        currentStep >= step.id ? "text-zinc-900 font-medium" : "text-zinc-400"
                                    )}>
                                        {step.title}
                                    </span>
                                </div>
                                {i < steps.length - 1 && (
                                    <div className={cn(
                                        "w-8 sm:w-16 lg:w-24 h-0.5 mx-1.5 sm:mx-3 lg:mx-4",
                                        currentStep > step.id ? "bg-emerald-500" : "bg-zinc-200"
                                    )}></div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content */}
            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 lg:py-12">
                {/* Step 1 - Entreprise */}
                {currentStep === 1 && (
                    <div className="animate-fade-in">
                        <div className="mb-6 sm:mb-8">
                            <div className="inline-block px-2.5 sm:px-3 py-1 sm:py-1.5 bg-emerald-50 border border-emerald-200 rounded-full text-emerald-700 text-[12px] sm:text-[13px] font-medium mb-3 sm:mb-4">
                                Étape 1 sur 3
                            </div>
                            <h1 className="text-[24px] sm:text-[28px] lg:text-[32px] font-bold text-zinc-900 mb-2 sm:mb-3">
                                Informations sur votre garage
                            </h1>
                            <p className="text-[14px] sm:text-[15px] text-zinc-600">
                                Ces informations apparaîtront sur vos devis et factures.
                            </p>
                        </div>

                        <div className="bg-white rounded-xl sm:rounded-2xl border border-zinc-200 p-4 sm:p-6 lg:p-8 space-y-5 sm:space-y-6">
                            {/* Nom du garage */}
                            <div>
                                <label className="block text-[13px] sm:text-[14px] font-medium text-zinc-700 mb-2">
                                    Nom du garage <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.nomGarage}
                                    onChange={(e) => updateField("nomGarage", e.target.value)}
                                    placeholder="Ex: Garage Dupont"
                                    className="w-full h-11 sm:h-12 px-3 sm:px-4 bg-white border border-zinc-300 rounded-lg sm:rounded-xl text-[14px] sm:text-[15px] placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                                />
                            </div>

                            {/* Statut juridique + SIRET */}
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[13px] sm:text-[14px] font-medium text-zinc-700 mb-2">
                                        Statut juridique <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={formData.statutJuridique}
                                        onChange={(e) => updateField("statutJuridique", e.target.value)}
                                        className="w-full h-11 sm:h-12 px-3 sm:px-4 bg-white border border-zinc-300 rounded-lg sm:rounded-xl text-[14px] sm:text-[15px] focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                                    >
                                        <option value="">Sélectionner...</option>
                                        {statutsJuridiques.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[13px] sm:text-[14px] font-medium text-zinc-700 mb-2">
                                        SIRET
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.siret}
                                        onChange={(e) => updateField("siret", e.target.value)}
                                        placeholder="123 456 789 00012"
                                        maxLength={17}
                                        className="w-full h-11 sm:h-12 px-3 sm:px-4 bg-white border border-zinc-300 rounded-lg sm:rounded-xl text-[14px] sm:text-[15px] placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            {/* TVA */}
                            <div>
                                <label className="block text-[13px] sm:text-[14px] font-medium text-zinc-700 mb-2">
                                    Numéro de TVA intracommunautaire
                                </label>
                                <input
                                    type="text"
                                    value={formData.numeroTVA}
                                    onChange={(e) => updateField("numeroTVA", e.target.value)}
                                    placeholder="FR12345678901"
                                    className="w-full h-11 sm:h-12 px-3 sm:px-4 bg-white border border-zinc-300 rounded-lg sm:rounded-xl text-[14px] sm:text-[15px] placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                                />
                            </div>

                            {/* Adresse */}
                            <div>
                                <label className="block text-[13px] sm:text-[14px] font-medium text-zinc-700 mb-2">
                                    Adresse <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.adresse}
                                    onChange={(e) => updateField("adresse", e.target.value)}
                                    placeholder="12 rue de la Mécanique"
                                    className="w-full h-11 sm:h-12 px-3 sm:px-4 bg-white border border-zinc-300 rounded-lg sm:rounded-xl text-[14px] sm:text-[15px] placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                                />
                            </div>

                            {/* CP + Ville */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                                <div className="col-span-1">
                                    <label className="block text-[13px] sm:text-[14px] font-medium text-zinc-700 mb-1.5 sm:mb-2">
                                        Code postal <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        value={formData.codePostal}
                                        onChange={(e) => updateField("codePostal", e.target.value)}
                                        placeholder="75001"
                                        maxLength={5}
                                        className="w-full h-12 px-3 sm:px-4 bg-white border border-zinc-300 rounded-xl text-[15px] sm:text-[15px] placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                                    />
                                </div>
                                <div className="col-span-1 sm:col-span-2">
                                    <label className="block text-[13px] sm:text-[14px] font-medium text-zinc-700 mb-1.5 sm:mb-2">
                                        Ville <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.ville}
                                        onChange={(e) => updateField("ville", e.target.value)}
                                        placeholder="Paris"
                                        className="w-full h-12 px-3 sm:px-4 bg-white border border-zinc-300 rounded-xl text-[15px] sm:text-[15px] placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            {/* Pays */}
                            <div>
                                <label className="block text-[13px] sm:text-[14px] font-medium text-zinc-700 mb-2">
                                    Pays <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formData.pays}
                                    onChange={(e) => updateField("pays", e.target.value)}
                                    className="w-full h-11 sm:h-12 px-3 sm:px-4 bg-white border border-zinc-300 rounded-lg sm:rounded-xl text-[14px] sm:text-[15px] focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                                >
                                    <option value="France">France</option>
                                    <option value="Belgique">Belgique</option>
                                    <option value="Suisse">Suisse</option>
                                    <option value="Luxembourg">Luxembourg</option>
                                    <option value="Canada">Canada</option>
                                    <option value="Autre">Autre</option>
                                </select>
                            </div>

                            {/* Téléphone + Site */}
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[13px] sm:text-[14px] font-medium text-zinc-700 mb-2">
                                        Téléphone du garage
                                    </label>
                                    <input
                                        type="tel"
                                        value={formData.telephone}
                                        onChange={(e) => updateField("telephone", e.target.value)}
                                        placeholder="01 23 45 67 89"
                                        className="w-full h-11 sm:h-12 px-3 sm:px-4 bg-white border border-zinc-300 rounded-lg sm:rounded-xl text-[14px] sm:text-[15px] placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[13px] sm:text-[14px] font-medium text-zinc-700 mb-2">
                                        Site web
                                    </label>
                                    <input
                                        type="url"
                                        value={formData.siteWeb}
                                        onChange={(e) => updateField("siteWeb", e.target.value)}
                                        placeholder="https://www.mongarage.fr"
                                        className="w-full h-11 sm:h-12 px-3 sm:px-4 bg-white border border-zinc-300 rounded-lg sm:rounded-xl text-[14px] sm:text-[15px] placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            {/* Effectif */}
                            <div>
                                <label className="block text-[13px] sm:text-[14px] font-medium text-zinc-700 mb-2">
                                    Taille de l'équipe
                                </label>
                                <select
                                    value={formData.effectif}
                                    onChange={(e) => updateField("effectif", e.target.value)}
                                    className="w-full h-11 sm:h-12 px-3 sm:px-4 bg-white border border-zinc-300 rounded-lg sm:rounded-xl text-[14px] sm:text-[15px] focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
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
                        <div className="mb-6 sm:mb-8">
                            <div className="inline-block px-2.5 sm:px-3 py-1 sm:py-1.5 bg-emerald-50 border border-emerald-200 rounded-full text-emerald-700 text-[12px] sm:text-[13px] font-medium mb-3 sm:mb-4">
                                Étape 2 sur 3
                            </div>
                            <h1 className="text-[24px] sm:text-[28px] lg:text-[32px] font-bold text-zinc-900 mb-2 sm:mb-3">
                                Vos informations personnelles
                            </h1>
                            <p className="text-[14px] sm:text-[15px] text-zinc-600">
                                Informations sur le responsable du compte.
                            </p>
                        </div>

                        <div className="bg-white rounded-xl sm:rounded-2xl border border-zinc-200 p-4 sm:p-6 lg:p-8 space-y-5 sm:space-y-6">
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
                                                "px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-[13px] sm:text-[14px] font-medium transition-colors",
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
                                    <label className="block text-[13px] sm:text-[14px] font-medium text-zinc-700 mb-2">
                                        Prénom <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.prenom}
                                        onChange={(e) => updateField("prenom", e.target.value)}
                                        placeholder="Jean"
                                        className="w-full h-11 sm:h-12 px-3 sm:px-4 bg-white border border-zinc-300 rounded-lg sm:rounded-xl text-[14px] sm:text-[15px] placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[13px] sm:text-[14px] font-medium text-zinc-700 mb-2">
                                        Nom <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.nom}
                                        onChange={(e) => updateField("nom", e.target.value)}
                                        placeholder="Dupont"
                                        className="w-full h-11 sm:h-12 px-3 sm:px-4 bg-white border border-zinc-300 rounded-lg sm:rounded-xl text-[14px] sm:text-[15px] placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            {/* Fonction */}
                            <div>
                                <label className="block text-[13px] sm:text-[14px] font-medium text-zinc-700 mb-2">
                                    Fonction dans l'entreprise
                                </label>
                                <select
                                    value={formData.fonction}
                                    onChange={(e) => updateField("fonction", e.target.value)}
                                    className="w-full h-11 sm:h-12 px-3 sm:px-4 bg-white border border-zinc-300 rounded-lg sm:rounded-xl text-[14px] sm:text-[15px] focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
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
                                <label className="block text-[13px] sm:text-[14px] font-medium text-zinc-700 mb-2">
                                    Téléphone personnel
                                </label>
                                <input
                                    type="tel"
                                    value={formData.telephonePersonnel}
                                    onChange={(e) => updateField("telephonePersonnel", e.target.value)}
                                    placeholder="06 12 34 56 78"
                                    className="w-full h-11 sm:h-12 px-3 sm:px-4 bg-white border border-zinc-300 rounded-lg sm:rounded-xl text-[14px] sm:text-[15px] placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 3 - Compte */}
                {currentStep === 3 && (
                    <div className="animate-fade-in">
                        <div className="mb-6 sm:mb-8">
                            <div className="inline-block px-2.5 sm:px-3 py-1 sm:py-1.5 bg-emerald-50 border border-emerald-200 rounded-full text-emerald-700 text-[12px] sm:text-[13px] font-medium mb-3 sm:mb-4">
                                Étape 3 sur 3
                            </div>
                            <h1 className="text-[24px] sm:text-[28px] lg:text-[32px] font-bold text-zinc-900 mb-2 sm:mb-3">
                                Créez votre compte
                            </h1>
                            <p className="text-[14px] sm:text-[15px] text-zinc-600">
                                Commencez gratuitement avec 5 clients et 5 véhicules.
                            </p>
                        </div>

                        {error && (
                            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg sm:rounded-xl">
                                <p className="text-[13px] sm:text-sm text-red-700">{error}</p>
                            </div>
                        )}

                        <div className="bg-white rounded-xl sm:rounded-2xl border border-zinc-200 p-4 sm:p-6 lg:p-8 space-y-5 sm:space-y-6">
                            {/* Email */}
                            <div>
                                <label className="block text-[13px] sm:text-[14px] font-medium text-zinc-700 mb-2">
                                    Adresse email <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => updateField("email", e.target.value)}
                                    placeholder="vous@exemple.fr"
                                    className="w-full h-11 sm:h-12 px-3 sm:px-4 bg-white border border-zinc-300 rounded-lg sm:rounded-xl text-[14px] sm:text-[15px] placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                                />
                                <p className="text-[12px] text-zinc-500 mt-2">
                                    💡 Un email de vérification vous sera envoyé
                                </p>
                            </div>

                            {/* Mot de passe */}
                            <div>
                                <label className="block text-[13px] sm:text-[14px] font-medium text-zinc-700 mb-2">
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
                                <label className="block text-[13px] sm:text-[14px] font-medium text-zinc-700 mb-2">
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
                            <div className="space-y-4 pt-4 border-t border-zinc-100">
                                <label htmlFor="cgu" className="flex items-start gap-3 cursor-pointer active:bg-zinc-50 -mx-2 px-2 py-2 rounded-lg">
                                    <input
                                        type="checkbox"
                                        id="cgu"
                                        checked={formData.acceptCGU}
                                        onChange={(e) => updateField("acceptCGU", e.target.checked)}
                                        className="w-6 h-6 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900 mt-0.5 flex-shrink-0"
                                    />
                                    <span className="text-[13px] sm:text-[14px] text-zinc-600 leading-relaxed">
                                        J'accepte les <a href="#" className="text-zinc-900 font-medium underline">CGU</a> et la <a href="#" className="text-zinc-900 font-medium underline">politique de confidentialité</a> <span className="text-red-500">*</span>
                                    </span>
                                </label>

                                <label htmlFor="newsletter" className="flex items-start gap-3 cursor-pointer active:bg-zinc-50 -mx-2 px-2 py-2 rounded-lg">
                                    <input
                                        type="checkbox"
                                        id="newsletter"
                                        checked={formData.acceptNewsletter}
                                        onChange={(e) => updateField("acceptNewsletter", e.target.checked)}
                                        className="w-6 h-6 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900 mt-0.5 flex-shrink-0"
                                    />
                                    <span className="text-[13px] sm:text-[14px] text-zinc-600 leading-relaxed">
                                        Recevoir des conseils par email (optionnel)
                                    </span>
                                </label>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 4 - Confirmation */}
                {currentStep === 4 && (
                    <div className="animate-fade-in max-w-lg mx-auto">
                        {/* Header minimaliste */}
                        <div className="text-center mb-8 sm:mb-10">
                            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-zinc-900 flex items-center justify-center mx-auto mb-5">
                                <Check className="h-7 w-7 sm:h-8 sm:w-8 text-white" />
                            </div>
                            <h1 className="text-[22px] sm:text-[26px] font-bold text-zinc-900 mb-2">
                                Compte créé avec succès
                            </h1>
                            <p className="text-[14px] sm:text-[15px] text-zinc-500">
                                {formData.nomGarage} est prêt à être utilisé
                            </p>
                        </div>

                        {/* Card principale */}
                        <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden mb-6">
                            {/* Récapitulatif */}
                            <div className="p-5 sm:p-6 border-b border-zinc-100">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-zinc-100 flex items-center justify-center flex-shrink-0">
                                        <Building2 className="h-6 w-6 text-zinc-600" />
                                    </div>
                                    <div>
                                        <p className="text-[15px] font-semibold text-zinc-900">{formData.nomGarage}</p>
                                        <p className="text-[13px] text-zinc-500">{formData.ville} • Plan Gratuit</p>
                                    </div>
                                </div>
                            </div>

                            {/* Prochaines étapes */}
                            <div className="p-5 sm:p-6 space-y-4">
                                <p className="text-[13px] font-medium text-zinc-400 uppercase tracking-wide">Prochaines étapes</p>
                                <div className="space-y-3">
                                    <div className="flex items-start gap-3">
                                        <div className="w-6 h-6 rounded-full bg-zinc-900 text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">1</div>
                                        <div>
                                            <p className="text-[14px] font-medium text-zinc-900">Complétez les informations de votre garage</p>
                                            <p className="text-[13px] text-zinc-500">Logo, coordonnées, mentions légales...</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-6 h-6 rounded-full bg-zinc-200 text-zinc-600 text-[11px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">2</div>
                                        <div>
                                            <p className="text-[14px] font-medium text-zinc-900">Ajoutez votre premier client</p>
                                            <p className="text-[13px] text-zinc-500">Et son véhicule pour commencer</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-6 h-6 rounded-full bg-zinc-200 text-zinc-600 text-[11px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">3</div>
                                        <div>
                                            <p className="text-[14px] font-medium text-zinc-900">Créez votre premier devis</p>
                                            <p className="text-[13px] text-zinc-500">Générez un document professionnel</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Bouton CTA */}
                        <Link
                            href="/settings"
                            className="w-full h-12 sm:h-14 bg-zinc-900 hover:bg-zinc-800 text-white text-[15px] font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors"
                        >
                            Configurer mon garage
                            <ArrowRight className="h-5 w-5" />
                        </Link>

                        {/* Info version gratuite */}
                        <p className="text-[12px] sm:text-[13px] text-zinc-400 text-center mt-4">
                            Version gratuite • 5 clients • 5 véhicules • Sans engagement
                        </p>
                    </div>
                )}

                {/* Navigation - Fixed on mobile */}
                {currentStep < 4 && (
                    <>
                        {/* Desktop navigation */}
                        <div className="hidden sm:flex items-center justify-between mt-8">
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

                        {/* Mobile fixed bottom navigation */}
                        <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-200 px-4 py-3 flex items-center gap-3 z-50">
                            {currentStep > 1 && (
                                <button
                                    onClick={prevStep}
                                    className="h-12 w-12 bg-zinc-100 text-zinc-700 rounded-xl flex items-center justify-center active:bg-zinc-200 transition-colors flex-shrink-0"
                                >
                                    <ArrowLeft className="h-5 w-5" />
                                </button>
                            )}

                            {currentStep < 3 ? (
                                <button
                                    onClick={nextStep}
                                    disabled={!canProceed()}
                                    className="flex-1 h-12 bg-zinc-900 active:bg-zinc-800 disabled:bg-zinc-300 disabled:cursor-not-allowed text-white text-[15px] font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors"
                                >
                                    Continuer
                                    <ArrowRight className="h-5 w-5" />
                                </button>
                            ) : (
                                <button
                                    onClick={handleSubmit}
                                    disabled={!canProceed() || isLoading}
                                    className="flex-1 h-12 bg-zinc-900 active:bg-zinc-800 disabled:bg-zinc-300 disabled:cursor-not-allowed text-white text-[15px] font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                            Création...
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
                    </>
                )}
            </main>
        </div>
    )
}
