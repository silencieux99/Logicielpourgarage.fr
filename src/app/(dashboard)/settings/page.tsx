"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import {
    User,
    Building2,
    CreditCard,
    Bell,
    Shield,
    Palette,
    FileText,
    ChevronRight,
    Check,
    Upload,
    Camera,
    Mail,
    Phone,
    MapPin,
    Lock,
    Eye,
    EyeOff,
    Smartphone,
    Save,
    Loader2,
    X,
    Hash,
    Euro,
    Zap,
    Sun,
    Moon
} from "lucide-react"
import { useUpload } from "@/hooks/use-upload"
import { useAuth } from "@/lib/auth-context"
import { updateUserPassword } from "@/lib/auth"
import { getGarageByUserId, getGarageConfig, updateGarage, updateGarageConfig, createGarageConfig } from "@/lib/database"
import { InvoiceTemplate } from "@/components/InvoiceTemplate"

const settingsSections = [
    { id: "profil", label: "Mon profil", icon: User, description: "Informations personnelles" },
    { id: "garage", label: "Mon garage", icon: Building2, description: "Coordonnées et logo" },
    { id: "documents", label: "Documents", icon: FileText, description: "Devis et factures" },
    { id: "facturation", label: "Abonnement", icon: CreditCard, description: "Plan et paiement" },
    { id: "notifications", label: "Notifications", icon: Bell, description: "Email et SMS" },
    { id: "securite", label: "Sécurité", icon: Shield, description: "Mot de passe" },
    { id: "apparence", label: "Apparence", icon: Palette, description: "Thème et affichage" },
]

const civilites = ["M.", "Mme"]
const fonctions = ["Gérant", "Directeur", "Responsable atelier", "Chef mécanicien", "Secrétaire", "Autre"]
const statutsJuridiques = [
    "Auto-entrepreneur",
    "EURL",
    "SARL",
    "SAS",
    "SASU",
    "SA",
    "Entreprise individuelle",
    "Autre",
]
const effectifs = [
    "1 personne (moi seul)",
    "2-5 personnes",
    "6-10 personnes",
    "11-20 personnes",
    "Plus de 20 personnes",
]
const paysOptions = ["France", "Belgique", "Suisse", "Luxembourg", "Canada", "Autre"]

export default function SettingsPage() {
    const { user, garage, loading } = useAuth()
    const [activeSection, setActiveSection] = useState("garage")
    const [isSaving, setIsSaving] = useState(false)
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle')
    const [showPassword, setShowPassword] = useState(false)
    const [mobileContentOpen, setMobileContentOpen] = useState(false)

    // Password change states
    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    })
    const [passwordLoading, setPasswordLoading] = useState(false)
    const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    // Refs
    const avatarInputRef = useRef<HTMLInputElement>(null)
    const logoInputRef = useRef<HTMLInputElement>(null)
    const mobileContentRef = useRef<HTMLDivElement>(null)

    // Upload hooks
    const {
        files: avatarFiles,
        uploadFiles: uploadAvatar,
        removeFile: removeAvatarFile,
        uploading: avatarUploading
    } = useUpload({ folder: 'avatars', maxFiles: 1 })

    const {
        files: logoFiles,
        uploadFiles: uploadLogo,
        removeFile: removeLogoFile,
        uploading: logoUploading
    } = useUpload({ folder: 'logos', maxFiles: 1 })

    // URLs existantes depuis Firestore (avant upload de nouveaux fichiers)
    const [existingAvatarUrl, setExistingAvatarUrl] = useState<string | null>(null)
    const [existingLogoUrl, setExistingLogoUrl] = useState<string | null>(null)

    // Utiliser l'URL uploadée si disponible, sinon l'URL existante
    const avatarUrl = avatarFiles[0]?.url || avatarFiles[0]?.preview || existingAvatarUrl
    const logoUrl = logoFiles[0]?.url || logoFiles[0]?.preview || existingLogoUrl

    // Form states
    const [profileData, setProfileData] = useState({
        civilite: "",
        prenom: "",
        nom: "",
        fonction: "",
        email: "",
        telephone: "",
    })

    const [garageData, setGarageData] = useState({
        nom: "",
        statutJuridique: "",
        siret: "",
        tva: "",
        activitePrincipale: "",
        adresse: "",
        codePostal: "",
        ville: "",
        pays: "",
        telephone: "",
        email: "",
        siteWeb: "",
        effectif: "",
    })

    const [documentSettings, setDocumentSettings] = useState({
        prefixeDevis: "D",
        prefixeFacture: "F",
        prochainNumeroDevis: 1,
        prochainNumeroFacture: 1,
        mentionsLegales: "En cas de retard de paiement, une pénalité de 3 fois le taux d'intérêt légal sera appliquée.",
        tauxHoraire: 55,
        tauxTVA: 20,
    })

    const [notificationSettings, setNotificationSettings] = useState({
        emailRappelRDV: true,
        smsRappelRDV: false,
        emailDevis: true,
        emailFacture: true,
        rappelDelai: 24,
    })

    const [preferencesData, setPreferencesData] = useState({
        acceptCGU: false,
        acceptNewsletter: false,
    })
    const [theme, setTheme] = useState<"light" | "dark">("light")
    const [accentColor, setAccentColor] = useState("#4f46e5")
    const [textColor, setTextColor] = useState("#111111")

    const activeSectionMeta = settingsSections.find((section) => section.id === activeSection)

    useEffect(() => {
        if (typeof window === "undefined") return
        const storedTheme = localStorage.getItem("theme") as "light" | "dark" | null
        const currentTheme = storedTheme || (document.documentElement.dataset.theme as "light" | "dark") || "light"
        setTheme(currentTheme)
        const storedAccent = localStorage.getItem("accentColor")
        if (storedAccent) setAccentColor(storedAccent)
        const storedText = localStorage.getItem("textColor")
        if (storedText) setTextColor(storedText)
    }, [])

    const clamp = (value: number) => Math.max(0, Math.min(255, value))
    const hexToRgb = (hex: string) => {
        const clean = hex.replace("#", "")
        const normalized = clean.length === 3
            ? clean.split("").map((c) => c + c).join("")
            : clean
        const r = parseInt(normalized.slice(0, 2), 16)
        const g = parseInt(normalized.slice(2, 4), 16)
        const b = parseInt(normalized.slice(4, 6), 16)
        return { r, g, b }
    }
    const darken = (value: number, factor: number) => clamp(Math.round(value * factor))

    const applyTheme = (nextTheme: "light" | "dark") => {
        setTheme(nextTheme)
        if (typeof window === "undefined") return
        document.documentElement.dataset.theme = nextTheme
        document.documentElement.classList.toggle("dark", nextTheme === "dark")
        localStorage.setItem("theme", nextTheme)
    }

    const applyAccent = (color: string) => {
        setAccentColor(color)
        if (typeof window === "undefined") return
        const root = document.documentElement
        const { r, g, b } = hexToRgb(color)
        const hover = `rgb(${darken(r, 0.88)}, ${darken(g, 0.88)}, ${darken(b, 0.88)})`
        const soft = `rgba(${r}, ${g}, ${b}, 0.12)`
        root.style.setProperty("--accent-primary", color)
        root.style.setProperty("--accent-hover", hover)
        root.style.setProperty("--accent-soft", soft)
        localStorage.setItem("accentColor", color)
    }

    const applyTextColor = (color: string) => {
        setTextColor(color)
        if (typeof window === "undefined") return
        const root = document.documentElement
        const { r, g, b } = hexToRgb(color)
        const secondary = `rgb(${darken(r, 0.78)}, ${darken(g, 0.78)}, ${darken(b, 0.78)})`
        const tertiary = `rgb(${darken(r, 0.62)}, ${darken(g, 0.62)}, ${darken(b, 0.62)})`
        const muted = `rgb(${darken(r, 0.5)}, ${darken(g, 0.5)}, ${darken(b, 0.5)})`
        root.style.setProperty("--text-primary", color)
        root.style.setProperty("--text-secondary", secondary)
        root.style.setProperty("--text-tertiary", tertiary)
        root.style.setProperty("--text-muted", muted)
        localStorage.setItem("textColor", color)
    }

    // Charger les données initiales
    useEffect(() => {
        const loadInitialData = async () => {
            if (!user) return;

            console.log('🔄 Chargement des données pour user:', user.uid);
            setProfileData(prev => ({ ...prev, email: user.email || "" }));

            try {
                const garageDataFetched = await getGarageByUserId(user.uid);
                console.log('📦 Données garage chargées:', garageDataFetched);

                if (garageDataFetched) {
                    // Charger les données du profil utilisateur
                    setProfileData(prev => ({
                        ...prev,
                        civilite: garageDataFetched.ownerCivilite || "",
                        prenom: garageDataFetched.ownerPrenom || "",
                        nom: garageDataFetched.ownerNom || "",
                        fonction: garageDataFetched.ownerFonction || "",
                        telephone: garageDataFetched.ownerTelephone || "",
                    }));

                    // Charger les URLs d'avatar et logo existantes
                    if (garageDataFetched.ownerAvatar) {
                        setExistingAvatarUrl(garageDataFetched.ownerAvatar);
                    }
                    if (garageDataFetched.logo) {
                        setExistingLogoUrl(garageDataFetched.logo);
                    }

                    setGarageData({
                        nom: garageDataFetched.nom || "",
                        statutJuridique: garageDataFetched.statutJuridique || "",
                        siret: garageDataFetched.siret || "",
                        tva: garageDataFetched.numeroTVA || "",
                        activitePrincipale: garageDataFetched.activitePrincipale || "",
                        adresse: garageDataFetched.adresse || "",
                        codePostal: garageDataFetched.codePostal || "",
                        ville: garageDataFetched.ville || "",
                        pays: garageDataFetched.pays || "",
                        telephone: garageDataFetched.telephone || "",
                        email: garageDataFetched.email || "",
                        siteWeb: garageDataFetched.siteWeb || "",
                        effectif: garageDataFetched.effectif || "",
                    });

                    setPreferencesData({
                        acceptCGU: garageDataFetched.acceptCGU ?? false,
                        acceptNewsletter: garageDataFetched.acceptNewsletter ?? false,
                    })

                    if (garageDataFetched.id) {
                        const configDataFetched = await getGarageConfig(garageDataFetched.id);
                        console.log('📦 Données config chargées:', configDataFetched);

                        if (configDataFetched) {
                            setDocumentSettings({
                                prefixeDevis: configDataFetched.prefixeDevis || "D",
                                prefixeFacture: configDataFetched.prefixeFacture || "F",
                                prochainNumeroDevis: configDataFetched.prochainNumeroDevis || 1,
                                prochainNumeroFacture: configDataFetched.prochainNumeroFacture || 1,
                                mentionsLegales: configDataFetched.mentionsLegales || "En cas de retard de paiement, une pénalité de 3 fois le taux d'intérêt légal sera appliquée.",
                                tauxHoraire: configDataFetched.tauxHoraireMO || 55,
                                tauxTVA: configDataFetched.tauxTVA || 20,
                            });
                            setNotificationSettings({
                                emailRappelRDV: configDataFetched.emailNotifications ?? true,
                                smsRappelRDV: configDataFetched.smsRappels ?? false,
                                emailDevis: true,
                                emailFacture: true,
                                rappelDelai: 24,
                            });
                        }
                    }
                }
                console.log('✅ Chargement terminé');
            } catch (err) {
                console.error('❌ Settings - Erreur chargement:', err);
            }
        };

        if (!loading) loadInitialData();
    }, [user, loading]);

    // Scroll mobile
    useEffect(() => {
        if (mobileContentRef.current) {
            mobileContentRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
    }, [activeSection])

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files || files.length === 0) return
        if (avatarFiles[0]) await removeAvatarFile(avatarFiles[0].id)
        await uploadAvatar(files, 'general')
        e.target.value = ""
    }

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files || files.length === 0) return
        if (logoFiles[0]) await removeLogoFile(logoFiles[0].id)
        await uploadLogo(files, 'general')
        e.target.value = ""
    }

    const handleSave = async () => {
        if (!user) {
            console.error('❌ handleSave: Pas d\'utilisateur connecté')
            return
        }
        setIsSaving(true)
        setSaveStatus('saving')

        try {
            console.log('🔄 Début sauvegarde...')
            const currentGarage = await getGarageByUserId(user.uid)
            if (!currentGarage || !currentGarage.id) {
                console.error('❌ handleSave: Garage non trouvé pour user:', user.uid)
                throw new Error("Garage non trouvé")
            }
            console.log('✅ Garage trouvé:', currentGarage.id)

            // Mettre à jour le garage (+ données profil)
            const garageUpdateData: any = {
                nom: garageData.nom,
                statutJuridique: garageData.statutJuridique,
                siret: garageData.siret,
                numeroTVA: garageData.tva,
                activitePrincipale: garageData.activitePrincipale,
                adresse: garageData.adresse,
                codePostal: garageData.codePostal,
                ville: garageData.ville,
                pays: garageData.pays,
                telephone: garageData.telephone,
                email: garageData.email,
                siteWeb: garageData.siteWeb,
                effectif: garageData.effectif,
                acceptCGU: preferencesData.acceptCGU,
                acceptNewsletter: preferencesData.acceptNewsletter,
                // Données profil utilisateur
                ownerCivilite: profileData.civilite,
                ownerPrenom: profileData.prenom,
                ownerNom: profileData.nom,
                ownerFonction: profileData.fonction,
                ownerTelephone: profileData.telephone,
            }

            // Ajouter le logo (nouveau upload ou existant)
            const logoToSave = logoFiles[0]?.url || existingLogoUrl
            if (logoToSave) {
                garageUpdateData.logo = logoToSave
            }

            // Ajouter l'avatar (nouveau upload ou existant)
            const avatarToSave = avatarFiles[0]?.url || existingAvatarUrl
            if (avatarToSave) {
                garageUpdateData.ownerAvatar = avatarToSave
            }

            // Filtrer les undefined
            const cleanGarageData = Object.fromEntries(
                Object.entries(garageUpdateData).filter(([_, v]) => v !== undefined)
            )

            console.log('🔄 Mise à jour garage avec:', cleanGarageData)
            await updateGarage(currentGarage.id, cleanGarageData)
            console.log('✅ Garage mis à jour')

            // Vérifier si la config existe, sinon la créer
            let currentConfig = await getGarageConfig(currentGarage.id)
            console.log('🔍 Config actuelle:', currentConfig)

            const configData = {
                prefixeDevis: documentSettings.prefixeDevis,
                prefixeFacture: documentSettings.prefixeFacture,
                prochainNumeroDevis: documentSettings.prochainNumeroDevis,
                prochainNumeroFacture: documentSettings.prochainNumeroFacture,
                mentionsLegales: documentSettings.mentionsLegales,
                tauxHoraireMO: documentSettings.tauxHoraire,
                tauxTVA: documentSettings.tauxTVA,
                emailNotifications: notificationSettings.emailRappelRDV,
                smsRappels: notificationSettings.smsRappelRDV,
            }

            if (!currentConfig || !currentConfig.id) {
                // Créer la config si elle n'existe pas
                console.log('🔄 Création nouvelle config avec:', configData)
                await createGarageConfig({
                    garageId: currentGarage.id,
                    ...configData,
                })
                console.log('✅ Config créée')
            } else {
                // Mettre à jour la config existante
                console.log('🔄 Mise à jour config', currentConfig.id, 'avec:', configData)
                await updateGarageConfig(currentConfig.id, configData)
                console.log('✅ Config mise à jour')
            }

            setSaveStatus('success')
            console.log('✅ Sauvegarde complète réussie!')
            setTimeout(() => setSaveStatus('idle'), 3000)
        } catch (error) {
            console.error('❌ Erreur sauvegarde settings:', error)
            setSaveStatus('error')
            setTimeout(() => setSaveStatus('idle'), 3000)
        } finally {
            setIsSaving(false)
        }
    }

    const renderContent = () => {
        switch (activeSection) {
            case "profil":
                return (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-lg font-semibold text-zinc-900 mb-1">Mon profil</h2>
                            <p className="text-sm text-zinc-500">Gérez vos informations personnelles</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                {avatarUrl ? (
                                    <div className="relative w-20 h-20">
                                        <img src={avatarUrl} alt="Avatar" className="w-20 h-20 rounded-full object-cover" />
                                        <button onClick={() => avatarFiles[0] && removeAvatarFile(avatarFiles[0].id)} className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600">
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="w-20 h-20 rounded-full bg-zinc-200 flex items-center justify-center text-2xl font-bold text-zinc-600">
                                        {profileData.prenom?.[0] || "U"}{profileData.nom?.[0] || ""}
                                    </div>
                                )}
                                {avatarUploading && (
                                    <div className="absolute inset-0 bg-white/80 rounded-full flex items-center justify-center">
                                        <Loader2 className="h-6 w-6 animate-spin text-zinc-600" />
                                    </div>
                                )}
                            </div>
                            <div>
                                <button onClick={() => avatarInputRef.current?.click()} disabled={avatarUploading} className="h-9 px-4 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-sm font-medium rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50">
                                    <Camera className="h-4 w-4" /> Changer la photo
                                </button>
                                <input ref={avatarInputRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                                <p className="text-xs text-zinc-500 mt-1">JPG, PNG. Max 10 Mo</p>
                            </div>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-2">Civilité</label>
                                <select value={profileData.civilite} onChange={(e) => setProfileData({ ...profileData, civilite: e.target.value })} className="w-full h-11 px-4 border border-zinc-300 rounded-xl text-sm bg-white">
                                    <option value="">Sélectionner...</option>
                                    {civilites.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-2">Prénom</label>
                                <input type="text" value={profileData.prenom} onChange={(e) => setProfileData({ ...profileData, prenom: e.target.value })} placeholder="Jean" className="w-full h-11 px-4 border border-zinc-300 rounded-xl text-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-2">Nom</label>
                                <input type="text" value={profileData.nom} onChange={(e) => setProfileData({ ...profileData, nom: e.target.value })} placeholder="Dupont" className="w-full h-11 px-4 border border-zinc-300 rounded-xl text-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-2">Fonction</label>
                                <select value={profileData.fonction} onChange={(e) => setProfileData({ ...profileData, fonction: e.target.value })} className="w-full h-11 px-4 border border-zinc-300 rounded-xl text-sm bg-white">
                                    <option value="">Sélectionner...</option>
                                    {fonctions.map(f => <option key={f} value={f}>{f}</option>)}
                                </select>
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-zinc-700 mb-2">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                                    <input type="email" value={profileData.email} onChange={(e) => setProfileData({ ...profileData, email: e.target.value })} placeholder="jean@exemple.fr" className="w-full h-11 pl-10 pr-4 border border-zinc-300 rounded-xl text-sm" />
                                </div>
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-zinc-700 mb-2">Téléphone</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                                    <input type="tel" value={profileData.telephone} onChange={(e) => setProfileData({ ...profileData, telephone: e.target.value })} placeholder="06 12 34 56 78" className="w-full h-11 pl-10 pr-4 border border-zinc-300 rounded-xl text-sm" />
                                </div>
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-zinc-700 mb-2">CGU</label>
                                <div className="h-11 px-4 border border-zinc-200 rounded-xl text-sm flex items-center text-zinc-600 bg-zinc-50">
                                    {preferencesData.acceptCGU ? "Acceptées" : "Non acceptées"}
                                </div>
                            </div>
                        </div>
                    </div>
                )
            case "garage":
                return (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-lg font-semibold text-zinc-900 mb-1">Mon garage</h2>
                            <p className="text-sm text-zinc-500">Identité et coordonnées de votre entreprise</p>
                        </div>
                        <div className="flex items-center gap-4 p-4 bg-zinc-50 rounded-xl">
                            <div className="relative">
                                {logoUrl ? (
                                    <div className="relative">
                                        <img src={logoUrl} alt="Logo" className="w-20 h-20 rounded-xl object-contain bg-white border border-zinc-200" />
                                        <button onClick={() => logoFiles[0] && removeLogoFile(logoFiles[0].id)} className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600">
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="w-20 h-20 rounded-xl bg-white border-2 border-dashed border-zinc-300 flex items-center justify-center">
                                        <Upload className="h-6 w-6 text-zinc-400" />
                                    </div>
                                )}
                                {logoUploading && (
                                    <div className="absolute inset-0 bg-white/80 rounded-xl flex items-center justify-center">
                                        <Loader2 className="h-6 w-6 animate-spin text-zinc-600" />
                                    </div>
                                )}
                            </div>
                            <div>
                                <button onClick={() => logoInputRef.current?.click()} disabled={logoUploading} className="h-9 px-4 bg-zinc-900 hover:bg-zinc-800 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50">
                                    {logoUrl ? 'Changer le logo' : 'Télécharger un logo'}
                                </button>
                                <input ref={logoInputRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                                <p className="text-xs text-zinc-500 mt-1">Visible sur vos documents</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-2">Nom du garage</label>
                                <input type="text" value={garageData.nom} onChange={(e) => setGarageData({ ...garageData, nom: e.target.value })} placeholder="Garage Dupont" className="w-full h-11 px-4 border border-zinc-300 rounded-xl text-sm" />
                            </div>
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 mb-2">Statut juridique</label>
                                    <select value={garageData.statutJuridique} onChange={(e) => setGarageData({ ...garageData, statutJuridique: e.target.value })} className="w-full h-11 px-4 border border-zinc-300 rounded-xl text-sm bg-white">
                                        <option value="">Sélectionner...</option>
                                        {statutsJuridiques.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 mb-2">Effectif</label>
                                    <select value={garageData.effectif} onChange={(e) => setGarageData({ ...garageData, effectif: e.target.value })} className="w-full h-11 px-4 border border-zinc-300 rounded-xl text-sm bg-white">
                                        <option value="">Sélectionner...</option>
                                        {effectifs.map(e => <option key={e} value={e}>{e}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-2">Activité principale</label>
                                <input type="text" value={garageData.activitePrincipale} onChange={(e) => setGarageData({ ...garageData, activitePrincipale: e.target.value })} placeholder="Mécanique générale" className="w-full h-11 px-4 border border-zinc-300 rounded-xl text-sm" />
                            </div>
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 mb-2">SIRET</label>
                                    <input type="text" value={garageData.siret} onChange={(e) => setGarageData({ ...garageData, siret: e.target.value })} placeholder="123 456 789 00012" className="w-full h-11 px-4 border border-zinc-300 rounded-xl text-sm" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 mb-2">N° TVA</label>
                                    <input type="text" value={garageData.tva} onChange={(e) => setGarageData({ ...garageData, tva: e.target.value })} placeholder="FR12345678901" className="w-full h-11 px-4 border border-zinc-300 rounded-xl text-sm" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-2">Adresse</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                                    <input type="text" value={garageData.adresse} onChange={(e) => setGarageData({ ...garageData, adresse: e.target.value })} placeholder="12 rue de la Mécanique" className="w-full h-11 pl-10 pr-4 border border-zinc-300 rounded-xl text-sm" />
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 mb-2">Code postal</label>
                                    <input type="text" value={garageData.codePostal} onChange={(e) => setGarageData({ ...garageData, codePostal: e.target.value })} placeholder="75001" maxLength={5} className="w-full h-11 px-4 border border-zinc-300 rounded-xl text-sm" />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-zinc-700 mb-2">Ville</label>
                                    <input type="text" value={garageData.ville} onChange={(e) => setGarageData({ ...garageData, ville: e.target.value })} placeholder="Paris" className="w-full h-11 px-4 border border-zinc-300 rounded-xl text-sm" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-2">Pays</label>
                                <select value={garageData.pays} onChange={(e) => setGarageData({ ...garageData, pays: e.target.value })} className="w-full h-11 px-4 border border-zinc-300 rounded-xl text-sm bg-white">
                                    <option value="">Sélectionner...</option>
                                    {paysOptions.map(p => <option key={p} value={p}>{p}</option>)}
                                </select>
                            </div>
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 mb-2">Téléphone du garage</label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                                        <input type="tel" value={garageData.telephone} onChange={(e) => setGarageData({ ...garageData, telephone: e.target.value })} placeholder="01 23 45 67 89" className="w-full h-11 pl-10 pr-4 border border-zinc-300 rounded-xl text-sm" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 mb-2">Email du garage</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                                        <input type="email" value={garageData.email} onChange={(e) => setGarageData({ ...garageData, email: e.target.value })} placeholder="contact@garage.fr" className="w-full h-11 pl-10 pr-4 border border-zinc-300 rounded-xl text-sm" />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-2">Site web</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                                    <input type="url" value={garageData.siteWeb} onChange={(e) => setGarageData({ ...garageData, siteWeb: e.target.value })} placeholder="https://www.mongarage.fr" className="w-full h-11 pl-10 pr-4 border border-zinc-300 rounded-xl text-sm" />
                                </div>
                            </div>
                        </div>
                    </div>
                )
            case "documents":
                const today = new Date()
                const formatDate = (d: Date) => d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
                const dueDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)
                const exampleHT = 450.00
                const exampleTVA = exampleHT * (documentSettings.tauxTVA / 100)
                const exampleTTC = exampleHT + exampleTVA

                return (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-lg font-semibold text-zinc-900 mb-1">Documents</h2>
                            <p className="text-sm text-zinc-500">Configuration des devis et factures avec aperçu en temps réel</p>
                        </div>

                        <div className="flex flex-col lg:grid lg:grid-cols-2 gap-6 lg:gap-8">
                            {/* Formulaires */}
                            <div className="space-y-4 lg:space-y-6">
                                <div className="bg-white rounded-xl lg:rounded-2xl border border-zinc-200 p-4 lg:p-6">
                                    <h3 className="text-sm font-semibold text-zinc-900 mb-3 lg:mb-4 flex items-center gap-2">
                                        <Hash className="h-4 w-4 text-zinc-400" />
                                        Numérotation
                                    </h3>
                                    <div className="space-y-3 lg:space-y-4">
                                        <div>
                                            <label className="block text-xs font-medium text-zinc-600 mb-1.5">Préfixe et n° (Devis)</label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={documentSettings.prefixeDevis}
                                                    onChange={(e) => setDocumentSettings({ ...documentSettings, prefixeDevis: e.target.value })}
                                                    className="w-16 lg:w-20 h-10 lg:h-11 px-2 lg:px-3 border border-zinc-300 rounded-lg lg:rounded-xl text-sm text-center bg-white font-mono uppercase"
                                                    placeholder="D"
                                                />
                                                <input
                                                    type="number"
                                                    value={documentSettings.prochainNumeroDevis}
                                                    onChange={(e) => setDocumentSettings({ ...documentSettings, prochainNumeroDevis: parseInt(e.target.value) || 1 })}
                                                    className="flex-1 h-10 lg:h-11 px-3 lg:px-4 border border-zinc-300 rounded-lg lg:rounded-xl text-sm bg-white"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-zinc-600 mb-1.5">Préfixe et n° (Facture)</label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={documentSettings.prefixeFacture}
                                                    onChange={(e) => setDocumentSettings({ ...documentSettings, prefixeFacture: e.target.value })}
                                                    className="w-16 lg:w-20 h-10 lg:h-11 px-2 lg:px-3 border border-zinc-300 rounded-lg lg:rounded-xl text-sm text-center bg-white font-mono uppercase"
                                                    placeholder="F"
                                                />
                                                <input
                                                    type="number"
                                                    value={documentSettings.prochainNumeroFacture}
                                                    onChange={(e) => setDocumentSettings({ ...documentSettings, prochainNumeroFacture: parseInt(e.target.value) || 1 })}
                                                    className="flex-1 h-10 lg:h-11 px-3 lg:px-4 border border-zinc-300 rounded-lg lg:rounded-xl text-sm bg-white"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-xl lg:rounded-2xl border border-zinc-200 p-4 lg:p-6">
                                    <h3 className="text-sm font-semibold text-zinc-900 mb-3 lg:mb-4 flex items-center gap-2">
                                        <Euro className="h-4 w-4 text-zinc-400" />
                                        Tarification
                                    </h3>
                                    <div className="grid grid-cols-2 gap-3 lg:gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-zinc-600 mb-1.5">Taux horaire (€)</label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    value={documentSettings.tauxHoraire}
                                                    onChange={(e) => setDocumentSettings({ ...documentSettings, tauxHoraire: parseFloat(e.target.value) || 0 })}
                                                    className="w-full h-10 lg:h-11 pl-8 lg:pl-10 pr-3 border border-zinc-300 rounded-lg lg:rounded-xl text-sm bg-white"
                                                />
                                                <Euro className="absolute left-2.5 lg:left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-zinc-600 mb-1.5">TVA (%)</label>
                                            <select
                                                value={documentSettings.tauxTVA}
                                                onChange={(e) => setDocumentSettings({ ...documentSettings, tauxTVA: parseFloat(e.target.value) })}
                                                className="w-full h-10 lg:h-11 px-3 lg:px-4 border border-zinc-300 rounded-lg lg:rounded-xl text-sm bg-white appearance-none"
                                            >
                                                <option value={20}>20%</option>
                                                <option value={10}>10%</option>
                                                <option value={5.5}>5.5%</option>
                                                <option value={0}>0%</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-xl lg:rounded-2xl border border-zinc-200 p-4 lg:p-6">
                                    <h3 className="text-sm font-semibold text-zinc-900 mb-3 lg:mb-4 flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-zinc-400" />
                                        Mentions légales
                                    </h3>
                                    <textarea
                                        value={documentSettings.mentionsLegales}
                                        onChange={(e) => setDocumentSettings({ ...documentSettings, mentionsLegales: e.target.value })}
                                        rows={3}
                                        className="w-full px-3 lg:px-4 py-2.5 lg:py-3 border border-zinc-300 rounded-lg lg:rounded-xl text-sm resize-none bg-white focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 outline-none transition-all"
                                        placeholder="Mentions légales..."
                                    />
                                </div>
                            </div>

                            {/* Aperçu */}
                            <div className="relative order-first lg:order-last">
                                <div className="lg:sticky lg:top-24">
                                    <div className="flex items-center justify-between mb-3 lg:mb-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Aperçu</span>
                                        </div>
                                        <span className="text-[10px] text-zinc-400 lg:hidden">← Glissez →</span>
                                    </div>

                                    <div className="w-full overflow-x-auto pb-4 -mx-4 px-4 lg:mx-0 lg:px-0">
                                        <div className="min-w-[320px] lg:min-w-0">
                                            <InvoiceTemplate
                                                data={{
                                                    type: "facture",
                                                    numero: `${documentSettings.prefixeFacture}-${String(documentSettings.prochainNumeroFacture).padStart(5, '0')}`,
                                                    dateEmission: today,
                                                    dateEcheance: dueDate,
                                                    garage: {
                                                        nom: garageData.nom || "Votre Garage",
                                                        adresse: garageData.adresse || "12 rue Exemple",
                                                        codePostal: garageData.codePostal || "75000",
                                                        ville: garageData.ville || "Paris",
                                                        telephone: garageData.telephone,
                                                        email: garageData.email,
                                                        siret: garageData.siret,
                                                        tva: garageData.tva,
                                                        logo: logoUrl || undefined
                                                    },
                                                    client: {
                                                        nom: "Client Exemple",
                                                        adresse: "123 Avenue du Client",
                                                        codePostal: "75001",
                                                        ville: "Paris"
                                                    },
                                                    lignes: [
                                                        { designation: "Main d'œuvre", description: "Révision", quantite: "2h", prixUnitaireHT: documentSettings.tauxHoraire },
                                                        { designation: "Filtre à huile", quantite: 1, prixUnitaireHT: 25 },
                                                        { designation: "Huile 5W40", quantite: 1, prixUnitaireHT: 65 }
                                                    ],
                                                    totalHT: exampleHT,
                                                    tauxTVA: documentSettings.tauxTVA,
                                                    totalTVA: exampleTVA,
                                                    totalTTC: exampleTTC,
                                                    mentionsLegales: documentSettings.mentionsLegales
                                                }}
                                                scale={0.65}
                                            />
                                        </div>
                                    </div>

                                    <div className="hidden lg:block mt-4 p-3 bg-zinc-100 rounded-xl border border-zinc-200">
                                        <p className="text-xs text-zinc-600 flex items-start gap-2">
                                            <Zap className="h-4 w-4 text-zinc-400 flex-shrink-0" />
                                            <span>
                                                Prochain devis : <span className="font-mono font-bold text-zinc-900">{documentSettings.prefixeDevis}-{String(documentSettings.prochainNumeroDevis).padStart(5, '0')}</span>
                                            </span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            case "notifications":
                return (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-lg font-semibold text-zinc-900 mb-1">Notifications</h2>
                            <p className="text-sm text-zinc-500">Configurez les rappels automatiques</p>
                        </div>
                        <div className="space-y-4">
                            {[
                                { key: 'emailRappelRDV', icon: Mail, label: 'Rappel RDV par email', desc: 'Envoyer un email de rappel avant chaque RDV' },
                                { key: 'smsRappelRDV', icon: Smartphone, label: 'Rappel RDV par SMS', desc: 'Envoyer un SMS de rappel avant chaque RDV' },
                                { key: 'emailDevis', icon: FileText, label: 'Envoi automatique devis', desc: 'Envoyer le devis par email après création' },
                            ].map(item => (
                                <div key={item.key} className="flex items-center justify-between p-4 bg-zinc-50 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <item.icon className="h-5 w-5 text-zinc-400" />
                                        <div>
                                            <p className="text-sm font-medium text-zinc-900">{item.label}</p>
                                            <p className="text-xs text-zinc-500">{item.desc}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setNotificationSettings({ ...notificationSettings, [item.key]: !notificationSettings[item.key as keyof typeof notificationSettings] })} className={cn("w-12 h-7 rounded-full transition-colors relative", notificationSettings[item.key as keyof typeof notificationSettings] ? "bg-zinc-900" : "bg-zinc-300")}>
                                        <span className={cn("absolute w-5 h-5 bg-white rounded-full top-1 transition-all", notificationSettings[item.key as keyof typeof notificationSettings] ? "left-6" : "left-1")} />
                                    </button>
                                </div>
                            ))}
                            <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <Mail className="h-5 w-5 text-zinc-400" />
                                    <div>
                                        <p className="text-sm font-medium text-zinc-900">Newsletter</p>
                                        <p className="text-xs text-zinc-500">Recevoir des conseils par email</p>
                                    </div>
                                </div>
                                <button onClick={() => setPreferencesData({ ...preferencesData, acceptNewsletter: !preferencesData.acceptNewsletter })} className={cn("w-12 h-7 rounded-full transition-colors relative", preferencesData.acceptNewsletter ? "bg-zinc-900" : "bg-zinc-300")}>
                                    <span className={cn("absolute w-5 h-5 bg-white rounded-full top-1 transition-all", preferencesData.acceptNewsletter ? "left-6" : "left-1")} />
                                </button>
                            </div>
                        </div>
                    </div>
                )
            case "securite":
                const handlePasswordChange = async () => {
                    // Validation
                    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
                        setPasswordMessage({ type: 'error', text: 'Veuillez remplir tous les champs' })
                        return
                    }
                    if (passwordData.newPassword.length < 6) {
                        setPasswordMessage({ type: 'error', text: 'Le nouveau mot de passe doit contenir au moins 6 caractères' })
                        return
                    }
                    if (passwordData.newPassword !== passwordData.confirmPassword) {
                        setPasswordMessage({ type: 'error', text: 'Les mots de passe ne correspondent pas' })
                        return
                    }

                    setPasswordLoading(true)
                    setPasswordMessage(null)

                    try {
                        await updateUserPassword(passwordData.currentPassword, passwordData.newPassword)
                        setPasswordMessage({ type: 'success', text: 'Mot de passe modifié avec succès !' })
                        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
                    } catch (error: any) {
                        console.error('Erreur changement mot de passe:', error)
                        if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
                            setPasswordMessage({ type: 'error', text: 'Mot de passe actuel incorrect' })
                        } else if (error.code === 'auth/weak-password') {
                            setPasswordMessage({ type: 'error', text: 'Le nouveau mot de passe est trop faible' })
                        } else {
                            setPasswordMessage({ type: 'error', text: 'Une erreur est survenue. Veuillez réessayer.' })
                        }
                    } finally {
                        setPasswordLoading(false)
                    }
                }

                return (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-lg font-semibold text-zinc-900 mb-1">Sécurité</h2>
                            <p className="text-sm text-zinc-500">Gérez votre mot de passe et la sécurité de votre compte</p>
                        </div>

                        {/* Message de feedback */}
                        {passwordMessage && (
                            <div className={cn(
                                "p-4 rounded-xl flex items-center gap-3",
                                passwordMessage.type === 'success' ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                            )}>
                                {passwordMessage.type === 'success' ? (
                                    <Check className="h-5 w-5 flex-shrink-0" />
                                ) : (
                                    <X className="h-5 w-5 flex-shrink-0" />
                                )}
                                <span className="text-sm font-medium">{passwordMessage.text}</span>
                            </div>
                        )}

                        <div className="bg-white rounded-xl lg:rounded-2xl border border-zinc-200 p-4 lg:p-6">
                            <h3 className="text-sm font-semibold text-zinc-900 mb-4 flex items-center gap-2">
                                <Lock className="h-4 w-4 text-zinc-400" />
                                Changer le mot de passe
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 mb-2">Mot de passe actuel</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={passwordData.currentPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                            placeholder="••••••••"
                                            className="w-full h-10 lg:h-11 pl-10 pr-12 border border-zinc-300 rounded-lg lg:rounded-xl text-sm"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                                        >
                                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 mb-2">Nouveau mot de passe</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={passwordData.newPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                            placeholder="••••••••"
                                            className="w-full h-10 lg:h-11 pl-10 pr-4 border border-zinc-300 rounded-lg lg:rounded-xl text-sm"
                                        />
                                    </div>
                                    <p className="mt-1 text-xs text-zinc-500">Minimum 6 caractères</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 mb-2">Confirmer le nouveau mot de passe</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={passwordData.confirmPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                            placeholder="••••••••"
                                            className="w-full h-10 lg:h-11 pl-10 pr-4 border border-zinc-300 rounded-lg lg:rounded-xl text-sm"
                                        />
                                    </div>
                                </div>

                                <button
                                    onClick={handlePasswordChange}
                                    disabled={passwordLoading}
                                    className="w-full sm:w-auto h-10 lg:h-11 px-6 bg-zinc-900 hover:bg-zinc-800 text-white text-sm font-medium rounded-lg lg:rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {passwordLoading ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Modification...
                                        </>
                                    ) : (
                                        <>
                                            <Shield className="h-4 w-4" />
                                            Changer le mot de passe
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Info compte */}
                        <div className="bg-zinc-50 rounded-xl lg:rounded-2xl border border-zinc-200 p-4 lg:p-6">
                            <h3 className="text-sm font-semibold text-zinc-900 mb-3">Informations du compte</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex items-center justify-between py-2 border-b border-zinc-200">
                                    <span className="text-zinc-500">Email</span>
                                    <span className="font-medium text-zinc-900">{user?.email}</span>
                                </div>
                                <div className="flex items-center justify-between py-2">
                                    <span className="text-zinc-500">Dernière connexion</span>
                                    <span className="font-medium text-zinc-900">
                                        {user?.metadata?.lastSignInTime ? new Date(user.metadata.lastSignInTime).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            case "facturation":
                // Récupérer les infos du garage depuis le contexte auth
                const isPro = garage?.plan === 'pro' && garage?.subscriptionStatus === 'active'

                return (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-lg font-semibold text-zinc-900 mb-1">Abonnement</h2>
                            <p className="text-sm text-zinc-500">Gérez votre plan et vos paiements</p>
                        </div>

                        {isPro ? (
                            /* Plan Pro Actif */
                            <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-2xl p-6 text-white relative overflow-hidden">
                                <div className="absolute top-4 right-4">
                                    <span className="px-3 py-1 bg-white/20 text-white text-xs font-bold rounded-full">
                                        ACTIF
                                    </span>
                                </div>
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />

                                <div className="relative">
                                    <p className="text-xs font-medium text-emerald-200 uppercase tracking-wide mb-1">Votre plan</p>
                                    <p className="text-2xl font-bold text-white mb-2">Pro</p>

                                    <div className="flex items-baseline gap-1 mb-4">
                                        <span className="text-4xl font-bold">59,99€</span>
                                        <span className="text-emerald-200">HT/mois</span>
                                    </div>

                                    <div className="space-y-2 mb-6">
                                        {["Clients illimités", "Véhicules illimités", "Factures & devis illimités", "Support prioritaire"].map((feature, i) => (
                                            <div key={i} className="flex items-center gap-2">
                                                <Check className="h-4 w-4 text-white flex-shrink-0" />
                                                <span className="text-sm text-emerald-100">{feature}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <button
                                        onClick={() => window.location.href = '/settings/billing'}
                                        className="w-full h-12 bg-white/20 hover:bg-white/30 text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors border border-white/20"
                                    >
                                        <CreditCard className="h-4 w-4" />
                                        Gérer mon abonnement
                                    </button>
                                </div>
                            </div>
                        ) : (
                            /* Plan Démo */
                            <>
                                <div className="bg-gradient-to-br from-zinc-100 to-zinc-50 rounded-2xl p-6 border border-zinc-200">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-1">Plan actuel</p>
                                            <p className="text-xl font-bold text-zinc-900">Démo Gratuite</p>
                                        </div>
                                        <div className="px-3 py-1.5 bg-zinc-200 rounded-full">
                                            <span className="text-xs font-semibold text-zinc-700">Gratuit</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div className="bg-white rounded-xl p-4 border border-zinc-200">
                                            <p className="text-2xl font-bold text-zinc-900">5</p>
                                            <p className="text-sm text-zinc-500">Clients max</p>
                                        </div>
                                        <div className="bg-white rounded-xl p-4 border border-zinc-200">
                                            <p className="text-2xl font-bold text-zinc-900">5</p>
                                            <p className="text-sm text-zinc-500">Véhicules max</p>
                                        </div>
                                    </div>

                                    <p className="text-sm text-zinc-500">
                                        Vous utilisez actuellement la version démo. Passez au Pro pour débloquer toutes les fonctionnalités.
                                    </p>
                                </div>

                                {/* Plan Pro */}
                                <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-2xl p-6 text-white relative overflow-hidden">
                                    <div className="absolute top-4 right-4">
                                        <span className="px-3 py-1 bg-emerald-500 text-white text-xs font-bold rounded-full">
                                            RECOMMANDÉ
                                        </span>
                                    </div>

                                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />

                                    <div className="relative">
                                        <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-1">Passer au</p>
                                        <p className="text-2xl font-bold text-white mb-2">Pro</p>

                                        <div className="flex items-baseline gap-1 mb-4">
                                            <span className="text-4xl font-bold">59,99€</span>
                                            <span className="text-zinc-400">HT/mois</span>
                                        </div>

                                        <div className="space-y-2 mb-6">
                                            {["Clients illimités", "Véhicules illimités", "Factures & devis illimités", "Support prioritaire"].map((feature, i) => (
                                                <div key={i} className="flex items-center gap-2">
                                                    <Check className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                                                    <span className="text-sm text-zinc-300">{feature}</span>
                                                </div>
                                            ))}
                                        </div>

                                        <button
                                            onClick={() => window.location.href = '/upgrade'}
                                            className="w-full h-12 bg-white hover:bg-zinc-100 text-zinc-900 text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors"
                                        >
                                            <CreditCard className="h-4 w-4" />
                                            S'abonner maintenant
                                        </button>

                                        <p className="text-xs text-zinc-500 text-center mt-3">
                                            Sans engagement • Annulation à tout moment
                                        </p>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* FAQ */}
                        <div className="space-y-3">
                            <h3 className="font-semibold text-zinc-900">Questions fréquentes</h3>
                            {[
                                { q: "Puis-je annuler à tout moment ?", a: "Oui, sans frais. Vous gardez l'accès jusqu'à la fin de la période payée." },
                                { q: "Mes données sont-elles sécurisées ?", a: "Oui, hébergement en France, conforme RGPD avec sauvegardes quotidiennes." },
                            ].map((faq, i) => (
                                <details key={i} className="group bg-zinc-50 rounded-xl">
                                    <summary className="flex items-center justify-between p-4 cursor-pointer list-none">
                                        <span className="text-sm font-medium text-zinc-900">{faq.q}</span>
                                        <ChevronRight className="h-4 w-4 text-zinc-400 transition-transform group-open:rotate-90" />
                                    </summary>
                                    <div className="px-4 pb-4 text-sm text-zinc-600">
                                        {faq.a}
                                    </div>
                                </details>
                            ))}
                        </div>
                    </div>
                )
            case "apparence":
                return (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-lg font-semibold text-zinc-900 mb-1">Apparence</h2>
                            <p className="text-sm text-zinc-500">Personnalisez l'affichage</p>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => applyTheme("light")}
                                className={cn(
                                    "p-4 rounded-2xl border-2 text-left transition-all",
                                    theme === "light" ? "border-[var(--accent-primary)] bg-[var(--accent-soft)]" : "border-zinc-200 bg-white hover:border-zinc-300"
                                )}
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <div className={cn(
                                        "w-9 h-9 rounded-xl flex items-center justify-center",
                                        theme === "light" ? "bg-[var(--accent-primary)] text-white" : "bg-zinc-100 text-zinc-600"
                                    )}>
                                        <Sun className="h-4 w-4" />
                                    </div>
                                    {theme === "light" && <Check className="h-4 w-4 text-[var(--accent-primary)]" />}
                                </div>
                                <div className="h-14 rounded-xl border border-zinc-200 bg-white mb-3 shadow-[var(--shadow-xs)]" />
                                <p className="text-sm font-semibold text-zinc-900">Clair</p>
                                <p className="text-xs text-zinc-500 mt-0.5">Contraste doux, lisible</p>
                            </button>

                            <button
                                onClick={() => applyTheme("dark")}
                                className={cn(
                                    "p-4 rounded-2xl border-2 text-left transition-all",
                                    theme === "dark" ? "border-[var(--accent-primary)] bg-[var(--accent-soft)]" : "border-zinc-200 bg-white hover:border-zinc-300"
                                )}
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <div className={cn(
                                        "w-9 h-9 rounded-xl flex items-center justify-center",
                                        theme === "dark" ? "bg-[var(--accent-primary)] text-white" : "bg-zinc-100 text-zinc-600"
                                    )}>
                                        <Moon className="h-4 w-4" />
                                    </div>
                                    {theme === "dark" && <Check className="h-4 w-4 text-[var(--accent-primary)]" />}
                                </div>
                                <div className="h-14 rounded-xl bg-zinc-900 border border-zinc-800 mb-3 shadow-[var(--shadow-xs)]" />
                                <p className="text-sm font-semibold text-zinc-900">Sombre</p>
                                <p className="text-xs text-zinc-500 mt-0.5">Confort visuel nocturne</p>
                            </button>
                        </div>
                        <div className="bg-white rounded-2xl border border-zinc-200 p-4">
                            <div className="flex items-center justify-between mb-3">
                                <div>
                                    <p className="text-sm font-semibold text-zinc-900">Couleur principale</p>
                                    <p className="text-xs text-zinc-500">Personnalisez l’accent de l’interface</p>
                                </div>
                                <div className="w-9 h-9 rounded-lg border border-zinc-200" style={{ backgroundColor: accentColor }} />
                            </div>
                            <div className="flex items-center gap-3">
                                <input
                                    type="color"
                                    value={accentColor}
                                    onChange={(e) => applyAccent(e.target.value)}
                                    className="h-10 w-14 p-0 border border-zinc-200 rounded-lg bg-white"
                                />
                                <input
                                    type="text"
                                    value={accentColor}
                                    onChange={(e) => applyAccent(e.target.value)}
                                    className="flex-1 h-10 px-3 border border-zinc-300 rounded-lg text-sm font-mono"
                                />
                            </div>
                            <div className="grid grid-cols-6 gap-2 mt-3">
                                {["#4f46e5", "#2563eb", "#0ea5e9", "#10b981", "#f59e0b", "#ef4444"].map((color) => (
                                    <button
                                        key={color}
                                        type="button"
                                        onClick={() => applyAccent(color)}
                                        className={cn(
                                            "h-8 rounded-lg border transition-all",
                                            accentColor.toLowerCase() === color ? "border-[var(--accent-primary)]" : "border-zinc-200"
                                        )}
                                        style={{ backgroundColor: color }}
                                        aria-label={`Choisir ${color}`}
                                    />
                                ))}
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl border border-zinc-200 p-4">
                            <div className="flex items-center justify-between mb-3">
                                <div>
                                    <p className="text-sm font-semibold text-zinc-900">Couleur du texte</p>
                                    <p className="text-xs text-zinc-500">Choisissez la teinte principale du texte</p>
                                </div>
                                <div className="w-9 h-9 rounded-lg border border-zinc-200" style={{ backgroundColor: textColor }} />
                            </div>
                            <div className="flex items-center gap-3">
                                <input
                                    type="color"
                                    value={textColor}
                                    onChange={(e) => applyTextColor(e.target.value)}
                                    className="h-10 w-14 p-0 border border-zinc-200 rounded-lg bg-white"
                                />
                                <input
                                    type="text"
                                    value={textColor}
                                    onChange={(e) => applyTextColor(e.target.value)}
                                    className="flex-1 h-10 px-3 border border-zinc-300 rounded-lg text-sm font-mono"
                                />
                            </div>
                            <div className="grid grid-cols-6 gap-2 mt-3">
                                {["#111111", "#1f2937", "#334155", "#6b7280", "#0f172a", "#ffffff"].map((color) => (
                                    <button
                                        key={color}
                                        type="button"
                                        onClick={() => applyTextColor(color)}
                                        className={cn(
                                            "h-8 rounded-lg border transition-all",
                                            textColor.toLowerCase() === color ? "border-[var(--accent-primary)]" : "border-zinc-200"
                                        )}
                                        style={{ backgroundColor: color }}
                                        aria-label={`Choisir ${color}`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                )
            default:
                return null
        }
    }

    return (
        <div className="space-y-4 sm:space-y-6">
            <div className="flex items-start gap-3">
                <Link
                    href="/dashboard"
                    className="h-9 w-9 rounded-lg border border-zinc-200 flex items-center justify-center text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 transition-colors"
                    aria-label="Retour au tableau de bord"
                >
                    <ChevronRight className="h-4 w-4 rotate-180" />
                </Link>
                <div>
                    <h1 className="text-xl sm:text-2xl font-semibold text-[var(--text-primary)] tracking-tight">Paramètres</h1>
                    <p className="text-[13px] text-[var(--text-tertiary)] mt-0.5">Gérez votre compte et vos préférences</p>
                </div>
            </div>

            <div className="lg:hidden">
                {!mobileContentOpen ? (
                    <div className="space-y-2">
                        {settingsSections.map((section) => (
                            <button key={section.id} onClick={() => { setActiveSection(section.id); setMobileContentOpen(true); }} className={cn("w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left", activeSection === section.id ? "border-[var(--accent-primary)] bg-[var(--accent-soft)]" : "border-[var(--border-light)] bg-white hover:border-[var(--border-default)]")} style={{ boxShadow: 'var(--shadow-xs)' }}>
                                <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0", activeSection === section.id ? "bg-[var(--accent-primary)] text-white" : "bg-[var(--bg-tertiary)] text-[var(--text-muted)]")}>
                                    <section.icon className="h-4 w-4" strokeWidth={1.5} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[14px] font-medium text-[var(--text-primary)]">{section.label}</p>
                                    <p className="text-[12px] text-[var(--text-tertiary)]">{section.description}</p>
                                </div>
                                <ChevronRight className="h-5 w-5 text-zinc-400 flex-shrink-0" />
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="sticky top-0 z-20 -mx-4 px-4 py-2 bg-white border-b border-zinc-200 flex items-center gap-2">
                            <button
                                onClick={() => setMobileContentOpen(false)}
                                className="h-9 w-9 rounded-lg border border-zinc-200 flex items-center justify-center text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 transition-colors"
                                aria-label="Retour aux paramètres"
                            >
                                <ChevronRight className="h-4 w-4 rotate-180" />
                            </button>
                            <div className="min-w-0">
                                <p className="text-[13px] text-zinc-500">Paramètres</p>
                                <p className="text-[14px] font-medium text-zinc-900 truncate">
                                    {activeSectionMeta?.label || "Section"}
                                </p>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl border border-[var(--border-light)] p-4 sm:p-5" style={{ boxShadow: 'var(--shadow-sm)' }}>
                            <div ref={mobileContentRef}>
                                {renderContent()}
                            </div>
                            <div className="flex justify-end pt-6 mt-6">
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving || avatarUploading || logoUploading}
                                    className={cn(
                                        "h-10 px-5 text-[13px] font-medium rounded-lg flex items-center gap-2 transition-all duration-200 disabled:opacity-50",
                                        saveStatus === 'success' ? "bg-emerald-600 hover:bg-emerald-700 text-white" :
                                            saveStatus === 'error' ? "bg-red-600 hover:bg-red-700 text-white" :
                                                "bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-white"
                                    )}
                                >
                                    {isSaving ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : saveStatus === 'success' ? (
                                        <>
                                            <Check className="h-4 w-4" />
                                            Enregistré
                                        </>
                                    ) : saveStatus === 'error' ? (
                                        <>
                                            <X className="h-4 w-4" />
                                            Erreur
                                        </>
                                    ) : (
                                        <>
                                            <Save className="h-4 w-4" />
                                            Enregistrer
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="hidden lg:grid lg:grid-cols-4 gap-6">
                <div className="space-y-1">
                    {settingsSections.map((section) => (
                        <button key={section.id} onClick={() => setActiveSection(section.id)} className={cn("w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all", activeSection === section.id ? "bg-[var(--accent-primary)] text-white" : "text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]")}>
                            <section.icon className="h-4 w-4" strokeWidth={1.5} />
                            <span className="text-[13px] font-medium">{section.label}</span>
                        </button>
                    ))}
                </div>

                <div className="lg:col-span-3 bg-white rounded-xl border border-[var(--border-light)] p-5" style={{ boxShadow: 'var(--shadow-sm)' }}>
                    <div ref={mobileContentRef}>
                        {renderContent()}
                    </div>
                    <div className="flex justify-end pt-6 mt-6">
                        <button
                            onClick={handleSave}
                            disabled={isSaving || avatarUploading || logoUploading}
                            className={cn(
                                "h-10 px-5 text-[13px] font-medium rounded-lg flex items-center gap-2 transition-all duration-200 disabled:opacity-50",
                                saveStatus === 'success' ? "bg-emerald-600 hover:bg-emerald-700 text-white" :
                                    saveStatus === 'error' ? "bg-red-600 hover:bg-red-700 text-white" :
                                        "bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-white"
                            )}
                        >
                            {isSaving ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : saveStatus === 'success' ? (
                                <>
                                    <Check className="h-4 w-4" />
                                    Enregistré
                                </>
                            ) : saveStatus === 'error' ? (
                                <>
                                    <X className="h-4 w-4" />
                                    Erreur
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4" />
                                    Enregistrer
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
