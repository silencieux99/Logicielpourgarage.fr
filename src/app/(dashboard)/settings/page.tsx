"use client"

import { useState, useRef } from "react"
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
    X
} from "lucide-react"
import { useUpload } from "@/hooks/use-upload"
import { useAuth } from "@/lib/auth-context"
import { useEffect } from "react"

const settingsSections = [
    { id: "profil", label: "Mon profil", icon: User, description: "Informations personnelles" },
    { id: "garage", label: "Mon garage", icon: Building2, description: "Coordonnées et logo" },
    { id: "documents", label: "Documents", icon: FileText, description: "Devis et factures" },
    { id: "facturation", label: "Abonnement", icon: CreditCard, description: "Plan et paiement" },
    { id: "notifications", label: "Notifications", icon: Bell, description: "Email et SMS" },
    { id: "securite", label: "Sécurité", icon: Shield, description: "Mot de passe" },
    { id: "apparence", label: "Apparence", icon: Palette, description: "Thème et affichage" },
]

export default function SettingsPage() {
    const { user, garage, config } = useAuth()
    const [activeSection, setActiveSection] = useState("garage") // Commencer sur "Mon garage" pour l'onboarding
    const [isSaving, setIsSaving] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    // File input refs
    const avatarInputRef = useRef<HTMLInputElement>(null)
    const logoInputRef = useRef<HTMLInputElement>(null)

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

    const avatarUrl = avatarFiles[0]?.url || avatarFiles[0]?.preview
    const logoUrl = logoFiles[0]?.url || logoFiles[0]?.preview

    // Form states
    const [profileData, setProfileData] = useState({
        prenom: "",
        nom: "",
        email: "",
        telephone: "",
    })

    const [garageData, setGarageData] = useState({
        nom: "",
        siret: "",
        tva: "",
        adresse: "",
        codePostal: "",
        ville: "",
        telephone: "",
        email: "",
        siteWeb: "",
    })

    const [documentSettings, setDocumentSettings] = useState({
        prefixeDevis: "D",
        prefixeFacture: "F",
        prochainNumeroDevis: 1,
        prochainNumeroFacture: 1,
        mentionsLegales: "En cas de retard de paiement, une pénalité de 3 fois le taux d'intérêt légal sera appliquée.",
        conditionsGenerales: "",
        tauxHoraire: 55,
        tauxTVA: 20,
    })

    const [notificationSettings, setNotificationSettings] = useState({
        emailRappelRDV: true,
        smsRappelRDV: true,
        emailDevis: true,
        emailFacture: true,
        rappelDelai: 24,
    })

    // Charger les données du garage et de l'utilisateur
    useEffect(() => {
        if (user) {
            setProfileData({
                prenom: "",
                nom: "",
                email: user.email || "",
                telephone: "",
            })
        }

        if (garage) {
            setGarageData({
                nom: garage.nom || "",
                siret: garage.siret || "",
                tva: garage.numeroTVA || "",
                adresse: garage.adresse || "",
                codePostal: garage.codePostal || "",
                ville: garage.ville || "",
                telephone: garage.telephone || "",
                email: garage.email || "",
                siteWeb: garage.siteWeb || "",
            })
        }

        if (config) {
            setDocumentSettings({
                prefixeDevis: config.prefixeDevis || "D",
                prefixeFacture: config.prefixeFacture || "F",
                prochainNumeroDevis: config.prochainNumeroDevis || 1,
                prochainNumeroFacture: config.prochainNumeroFacture || 1,
                mentionsLegales: config.mentionsLegales || "En cas de retard de paiement, une pénalité de 3 fois le taux d'intérêt légal sera appliquée.",
                conditionsGenerales: "",
                tauxHoraire: config.tauxHoraireMO || 55,
                tauxTVA: config.tauxTVA || 20,
            })
        }
    }, [user, garage, config])

    // Scroll automatique vers le haut lors du changement de section (surtout utile sur mobile)
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'instant' })
    }, [activeSection])

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files || files.length === 0) return

        // Remove existing avatar first
        if (avatarFiles[0]) {
            await removeAvatarFile(avatarFiles[0].id)
        }

        await uploadAvatar(files, 'general')
        e.target.value = ""
    }

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files || files.length === 0) return

        // Remove existing logo first
        if (logoFiles[0]) {
            await removeLogoFile(logoFiles[0].id)
        }

        await uploadLogo(files, 'general')
        e.target.value = ""
    }

    const handleSave = async () => {
        setIsSaving(true)
        try {
            // TODO: Save to Firebase with avatarUrl and logoUrl
            const dataToSave = {
                profile: {
                    ...profileData,
                    avatarUrl: avatarFiles[0]?.url
                },
                garage: {
                    ...garageData,
                    logoUrl: logoFiles[0]?.url
                },
                documents: documentSettings,
                notifications: notificationSettings,
            }
            console.log('Saving settings:', dataToSave)
            await new Promise(r => setTimeout(r, 1000))
        } catch (error) {
            console.error('Error saving settings:', error)
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

                        {/* Avatar with Vercel Blob */}
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                {avatarUrl ? (
                                    <div className="relative w-20 h-20">
                                        <img
                                            src={avatarUrl}
                                            alt="Avatar"
                                            className="w-20 h-20 rounded-full object-cover"
                                        />
                                        <button
                                            onClick={() => avatarFiles[0] && removeAvatarFile(avatarFiles[0].id)}
                                            className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                                        >
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
                                <button
                                    onClick={() => avatarInputRef.current?.click()}
                                    disabled={avatarUploading}
                                    className="h-9 px-4 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-sm font-medium rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
                                >
                                    <Camera className="h-4 w-4" />
                                    Changer la photo
                                </button>
                                <input
                                    ref={avatarInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleAvatarUpload}
                                    className="hidden"
                                />
                                <p className="text-xs text-zinc-500 mt-1">JPG, PNG. Max 10 Mo</p>
                            </div>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-2">Prénom</label>
                                <input
                                    type="text"
                                    value={profileData.prenom}
                                    onChange={(e) => setProfileData({ ...profileData, prenom: e.target.value })}
                                    placeholder="Jean"
                                    className="w-full h-11 px-4 border border-zinc-300 rounded-xl text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-2">Nom</label>
                                <input
                                    type="text"
                                    value={profileData.nom}
                                    onChange={(e) => setProfileData({ ...profileData, nom: e.target.value })}
                                    placeholder="Dupont"
                                    className="w-full h-11 px-4 border border-zinc-300 rounded-xl text-sm"
                                />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-zinc-700 mb-2">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                                    <input
                                        type="email"
                                        value={profileData.email}
                                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                        placeholder="jean@exemple.fr"
                                        className="w-full h-11 pl-10 pr-4 border border-zinc-300 rounded-xl text-sm"
                                    />
                                </div>
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-zinc-700 mb-2">Téléphone</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                                    <input
                                        type="tel"
                                        value={profileData.telephone}
                                        onChange={(e) => setProfileData({ ...profileData, telephone: e.target.value })}
                                        placeholder="06 12 34 56 78"
                                        className="w-full h-11 pl-10 pr-4 border border-zinc-300 rounded-xl text-sm"
                                    />
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

                        {/* Logo with Vercel Blob */}
                        <div className="flex items-center gap-4 p-4 bg-zinc-50 rounded-xl">
                            <div className="relative">
                                {logoUrl ? (
                                    <div className="relative">
                                        <img
                                            src={logoUrl}
                                            alt="Logo"
                                            className="w-20 h-20 rounded-xl object-contain bg-white border border-zinc-200"
                                        />
                                        <button
                                            onClick={() => logoFiles[0] && removeLogoFile(logoFiles[0].id)}
                                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                                        >
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
                                <button
                                    onClick={() => logoInputRef.current?.click()}
                                    disabled={logoUploading}
                                    className="h-9 px-4 bg-zinc-900 hover:bg-zinc-800 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                                >
                                    {logoUrl ? 'Changer le logo' : 'Télécharger un logo'}
                                </button>
                                <input
                                    ref={logoInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleLogoUpload}
                                    className="hidden"
                                />
                                <p className="text-xs text-zinc-500 mt-1">Visible sur vos documents</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-2">Nom du garage</label>
                                <input
                                    type="text"
                                    value={garageData.nom}
                                    onChange={(e) => setGarageData({ ...garageData, nom: e.target.value })}
                                    placeholder="Garage Dupont"
                                    className="w-full h-11 px-4 border border-zinc-300 rounded-xl text-sm"
                                />
                            </div>

                            <div className="grid sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 mb-2">SIRET</label>
                                    <input
                                        type="text"
                                        value={garageData.siret}
                                        onChange={(e) => setGarageData({ ...garageData, siret: e.target.value })}
                                        placeholder="123 456 789 00012"
                                        className="w-full h-11 px-4 border border-zinc-300 rounded-xl text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 mb-2">N° TVA</label>
                                    <input
                                        type="text"
                                        value={garageData.tva}
                                        onChange={(e) => setGarageData({ ...garageData, tva: e.target.value })}
                                        placeholder="FR12345678901"
                                        className="w-full h-11 px-4 border border-zinc-300 rounded-xl text-sm"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-2">Adresse</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                                    <input
                                        type="text"
                                        value={garageData.adresse}
                                        onChange={(e) => setGarageData({ ...garageData, adresse: e.target.value })}
                                        placeholder="12 rue de la Mécanique"
                                        className="w-full h-11 pl-10 pr-4 border border-zinc-300 rounded-xl text-sm"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 mb-2">Code postal</label>
                                    <input
                                        type="text"
                                        value={garageData.codePostal}
                                        onChange={(e) => setGarageData({ ...garageData, codePostal: e.target.value })}
                                        placeholder="75001"
                                        maxLength={5}
                                        className="w-full h-11 px-4 border border-zinc-300 rounded-xl text-sm"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-zinc-700 mb-2">Ville</label>
                                    <input
                                        type="text"
                                        value={garageData.ville}
                                        onChange={(e) => setGarageData({ ...garageData, ville: e.target.value })}
                                        placeholder="Paris"
                                        className="w-full h-11 px-4 border border-zinc-300 rounded-xl text-sm"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )

            case "documents":
                return (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-lg font-semibold text-zinc-900 mb-1">Documents</h2>
                            <p className="text-sm text-zinc-500">Configuration des devis et factures</p>
                        </div>

                        <div className="bg-zinc-50 rounded-xl p-4">
                            <h3 className="text-sm font-semibold text-zinc-900 mb-4">Numérotation</h3>
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-zinc-600 mb-1">Préfixe devis</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={documentSettings.prefixeDevis}
                                            onChange={(e) => setDocumentSettings({ ...documentSettings, prefixeDevis: e.target.value })}
                                            className="w-20 h-10 px-3 border border-zinc-300 rounded-lg text-sm text-center"
                                        />
                                        <input
                                            type="number"
                                            value={documentSettings.prochainNumeroDevis}
                                            onChange={(e) => setDocumentSettings({ ...documentSettings, prochainNumeroDevis: parseInt(e.target.value) })}
                                            className="flex-1 h-10 px-3 border border-zinc-300 rounded-lg text-sm"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-zinc-600 mb-1">Préfixe facture</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={documentSettings.prefixeFacture}
                                            onChange={(e) => setDocumentSettings({ ...documentSettings, prefixeFacture: e.target.value })}
                                            className="w-20 h-10 px-3 border border-zinc-300 rounded-lg text-sm text-center"
                                        />
                                        <input
                                            type="number"
                                            value={documentSettings.prochainNumeroFacture}
                                            onChange={(e) => setDocumentSettings({ ...documentSettings, prochainNumeroFacture: parseInt(e.target.value) })}
                                            className="flex-1 h-10 px-3 border border-zinc-300 rounded-lg text-sm"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-zinc-50 rounded-xl p-4">
                            <h3 className="text-sm font-semibold text-zinc-900 mb-4">Tarification par défaut</h3>
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-zinc-600 mb-1">Taux horaire MO (€ HT)</label>
                                    <input
                                        type="number"
                                        value={documentSettings.tauxHoraire}
                                        onChange={(e) => setDocumentSettings({ ...documentSettings, tauxHoraire: parseFloat(e.target.value) })}
                                        className="w-full h-10 px-3 border border-zinc-300 rounded-lg text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-zinc-600 mb-1">TVA par défaut (%)</label>
                                    <select
                                        value={documentSettings.tauxTVA}
                                        onChange={(e) => setDocumentSettings({ ...documentSettings, tauxTVA: parseFloat(e.target.value) })}
                                        className="w-full h-10 px-3 border border-zinc-300 rounded-lg text-sm"
                                    >
                                        <option value={20}>20%</option>
                                        <option value={10}>10%</option>
                                        <option value={5.5}>5.5%</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-zinc-700 mb-2">Mentions légales</label>
                            <textarea
                                value={documentSettings.mentionsLegales}
                                onChange={(e) => setDocumentSettings({ ...documentSettings, mentionsLegales: e.target.value })}
                                rows={3}
                                className="w-full px-4 py-3 border border-zinc-300 rounded-xl text-sm resize-none"
                            />
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
                                    <button
                                        onClick={() => setNotificationSettings({ ...notificationSettings, [item.key]: !notificationSettings[item.key as keyof typeof notificationSettings] })}
                                        className={cn(
                                            "w-12 h-7 rounded-full transition-colors relative",
                                            notificationSettings[item.key as keyof typeof notificationSettings] ? "bg-zinc-900" : "bg-zinc-300"
                                        )}
                                    >
                                        <span className={cn(
                                            "absolute w-5 h-5 bg-white rounded-full top-1 transition-all",
                                            notificationSettings[item.key as keyof typeof notificationSettings] ? "left-6" : "left-1"
                                        )} />
                                    </button>
                                </div>
                            ))}

                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-2">Délai de rappel (heures avant)</label>
                                <select
                                    value={notificationSettings.rappelDelai}
                                    onChange={(e) => setNotificationSettings({ ...notificationSettings, rappelDelai: parseInt(e.target.value) })}
                                    className="w-full h-11 px-4 border border-zinc-300 rounded-xl text-sm"
                                >
                                    <option value={12}>12 heures</option>
                                    <option value={24}>24 heures</option>
                                    <option value={48}>48 heures</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )

            case "securite":
                return (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-lg font-semibold text-zinc-900 mb-1">Sécurité</h2>
                            <p className="text-sm text-zinc-500">Gérez votre mot de passe</p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-2">Mot de passe actuel</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        className="w-full h-11 pl-10 pr-12 border border-zinc-300 rounded-xl text-sm"
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
                                    <input type="password" placeholder="••••••••" className="w-full h-11 pl-10 pr-4 border border-zinc-300 rounded-xl text-sm" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-2">Confirmer le nouveau mot de passe</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                                    <input type="password" placeholder="••••••••" className="w-full h-11 pl-10 pr-4 border border-zinc-300 rounded-xl text-sm" />
                                </div>
                            </div>

                            <button className="h-11 px-6 bg-zinc-900 hover:bg-zinc-800 text-white text-sm font-medium rounded-xl transition-colors">
                                Changer le mot de passe
                            </button>
                        </div>
                    </div>
                )

            case "facturation":
                return (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-lg font-semibold text-zinc-900 mb-1">Abonnement</h2>
                            <p className="text-sm text-zinc-500">Gérez votre plan et votre facturation</p>
                        </div>

                        {/* Plan actuel */}
                        <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-2xl p-6 text-white">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                                <div>
                                    <p className="text-sm text-zinc-400 mb-1">Plan actuel</p>
                                    <p className="text-2xl font-bold">Démo gratuite</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="px-3 py-1 bg-amber-500/20 text-amber-300 text-xs font-semibold rounded-full border border-amber-500/30">
                                        ESSAI GRATUIT
                                    </span>
                                </div>
                            </div>

                            {/* Période d'essai */}
                            <div className="bg-white/10 rounded-xl p-4 mb-6">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-zinc-300">Période d'essai</span>
                                    <span className="text-sm font-semibold text-white">14 jours restants</span>
                                </div>
                                <div className="w-full bg-white/20 rounded-full h-2">
                                    <div className="bg-amber-400 h-2 rounded-full" style={{ width: '50%' }} />
                                </div>
                                <p className="text-xs text-zinc-400 mt-2">
                                    Votre essai gratuit se termine le 15 janvier 2025
                                </p>
                            </div>

                            {/* Limites d'utilisation */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-white">2/5</p>
                                    <p className="text-xs text-zinc-400">Clients</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-white">3/5</p>
                                    <p className="text-xs text-zinc-400">Véhicules</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-white">4/10</p>
                                    <p className="text-xs text-zinc-400">Documents</p>
                                </div>
                            </div>
                        </div>

                        {/* Alerte upgrade */}
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                                <Bell className="h-5 w-5 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-amber-900">Passez au plan Pro pour débloquer toutes les fonctionnalités</p>
                                <p className="text-xs text-amber-700 mt-1">
                                    Clients illimités, véhicules illimités, SMS automatiques et plus encore.
                                </p>
                            </div>
                        </div>

                        {/* Plans disponibles */}
                        <div>
                            <h3 className="text-md font-semibold text-zinc-900 mb-4">Choisir un plan</h3>
                            <div className="grid md:grid-cols-2 gap-4">
                                {/* Plan Pro Mensuel */}
                                <div className="bg-white rounded-2xl border-2 border-zinc-200 p-6 hover:border-zinc-900 transition-colors cursor-pointer">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <p className="text-lg font-bold text-zinc-900">Pro Mensuel</p>
                                            <p className="text-xs text-zinc-500">Sans engagement</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-bold text-zinc-900">59,99 €</p>
                                            <p className="text-xs text-zinc-500">HT / mois</p>
                                        </div>
                                    </div>
                                    <ul className="space-y-2 text-sm text-zinc-600 mb-6">
                                        <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> Clients illimités</li>
                                        <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> Véhicules illimités</li>
                                        <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> Documents illimités</li>
                                        <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> 100 SMS / mois inclus</li>
                                        <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> Support prioritaire</li>
                                    </ul>
                                    <button className="w-full h-11 bg-zinc-900 hover:bg-zinc-800 text-white font-semibold rounded-xl transition-colors">
                                        Choisir ce plan
                                    </button>
                                </div>

                                {/* Plan Pro Annuel */}
                                <div className="relative bg-white rounded-2xl border-2 border-emerald-500 p-6">
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-emerald-500 text-white text-xs font-bold rounded-full">
                                        ÉCONOMISEZ 20%
                                    </div>
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <p className="text-lg font-bold text-zinc-900">Pro Annuel</p>
                                            <p className="text-xs text-zinc-500">Engagement 12 mois</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-bold text-zinc-900">47,99 €</p>
                                            <p className="text-xs text-zinc-500">HT / mois</p>
                                            <p className="text-xs text-emerald-600 font-medium">soit 575,88 € / an</p>
                                        </div>
                                    </div>
                                    <ul className="space-y-2 text-sm text-zinc-600 mb-6">
                                        <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> Tout du plan Pro Mensuel</li>
                                        <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> 200 SMS / mois inclus</li>
                                        <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> Formation personnalisée</li>
                                        <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> Backup quotidien</li>
                                        <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> 2 mois offerts</li>
                                    </ul>
                                    <button className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors">
                                        Choisir ce plan
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Mode de paiement */}
                        <div className="bg-zinc-50 rounded-xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-md font-semibold text-zinc-900">Mode de paiement</h3>
                                <button className="text-sm text-zinc-600 font-medium hover:text-zinc-900">
                                    + Ajouter une carte
                                </button>
                            </div>

                            <div className="bg-white rounded-xl border border-zinc-200 p-4 flex items-center gap-4">
                                <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-blue-400 rounded-md flex items-center justify-center">
                                    <span className="text-white text-xs font-bold">VISA</span>
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-zinc-900">•••• •••• •••• 4242</p>
                                    <p className="text-xs text-zinc-500">Expire 12/26</p>
                                </div>
                                <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded">
                                    Par défaut
                                </span>
                            </div>

                            <p className="text-xs text-zinc-500 mt-4">
                                Vos paiements sont sécurisés par Stripe. Nous ne stockons jamais vos données bancaires.
                            </p>
                        </div>

                        {/* Historique de facturation */}
                        <div>
                            <h3 className="text-md font-semibold text-zinc-900 mb-4">Historique de facturation</h3>

                            <div className="bg-white rounded-xl border border-zinc-200 divide-y divide-zinc-100">
                                <div className="p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-zinc-100 flex items-center justify-center">
                                            <FileText className="h-5 w-5 text-zinc-500" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-zinc-900">Facture #001</p>
                                            <p className="text-xs text-zinc-500">1er décembre 2024</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <p className="text-sm font-semibold text-zinc-900">59,99 €</p>
                                            <span className="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded">Payée</span>
                                        </div>
                                        <button className="p-2 hover:bg-zinc-100 rounded-lg transition-colors">
                                            <FileText className="h-4 w-4 text-zinc-500" />
                                        </button>
                                    </div>
                                </div>

                                <div className="p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-zinc-100 flex items-center justify-center">
                                            <FileText className="h-5 w-5 text-zinc-500" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-zinc-900">Facture #000</p>
                                            <p className="text-xs text-zinc-500">1er novembre 2024</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <p className="text-sm font-semibold text-zinc-900">59,99 €</p>
                                            <span className="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded">Payée</span>
                                        </div>
                                        <button className="p-2 hover:bg-zinc-100 rounded-lg transition-colors">
                                            <FileText className="h-4 w-4 text-zinc-500" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <p className="text-xs text-zinc-500 mt-3 text-center">
                                Les factures sont automatiquement envoyées par email.
                            </p>
                        </div>

                        {/* Annuler l'abonnement */}
                        <div className="pt-6 border-t border-zinc-200">
                            <button className="text-sm text-red-600 hover:text-red-700 font-medium">
                                Annuler mon abonnement
                            </button>
                            <p className="text-xs text-zinc-500 mt-1">
                                Vous conserverez l'accès jusqu'à la fin de votre période de facturation.
                            </p>
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

                        <div>
                            <label className="block text-sm font-medium text-zinc-700 mb-3">Thème</label>
                            <div className="grid grid-cols-3 gap-3">
                                <button className="p-4 rounded-xl border-2 border-zinc-900 bg-white text-center">
                                    <div className="w-12 h-8 bg-white border border-zinc-200 rounded mx-auto mb-2" />
                                    <span className="text-sm font-medium text-zinc-900">Clair</span>
                                </button>
                                <button className="p-4 rounded-xl border-2 border-zinc-200 bg-white text-center hover:border-zinc-300">
                                    <div className="w-12 h-8 bg-zinc-900 rounded mx-auto mb-2" />
                                    <span className="text-sm font-medium text-zinc-600">Sombre</span>
                                </button>
                                <button className="p-4 rounded-xl border-2 border-zinc-200 bg-white text-center hover:border-zinc-300">
                                    <div className="w-12 h-8 bg-gradient-to-r from-white to-zinc-900 rounded mx-auto mb-2" />
                                    <span className="text-sm font-medium text-zinc-600">Système</span>
                                </button>
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
            <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-zinc-900">Paramètres</h1>
                <p className="text-sm text-zinc-500 mt-1">Gérez votre compte et vos préférences</p>
            </div>

            {/* Mobile: List view */}
            <div className="lg:hidden space-y-2">
                {settingsSections.map((section) => (
                    <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={cn(
                            "w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-colors text-left",
                            activeSection === section.id ? "border-zinc-900 bg-zinc-50" : "border-zinc-200 bg-white hover:border-zinc-300"
                        )}
                    >
                        <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                            activeSection === section.id ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-600"
                        )}>
                            <section.icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[15px] font-semibold text-zinc-900">{section.label}</p>
                            <p className="text-[13px] text-zinc-500">{section.description}</p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-zinc-400 flex-shrink-0" />
                    </button>
                ))}
            </div>

            {/* Mobile: Selected section content */}
            <div className="lg:hidden bg-white rounded-2xl border border-zinc-200 p-6">
                {renderContent()}
                <div className="flex justify-end pt-6 mt-6 border-t border-zinc-200">
                    <button
                        onClick={handleSave}
                        disabled={isSaving || avatarUploading || logoUploading}
                        className="h-11 px-6 bg-zinc-900 hover:bg-zinc-800 text-white text-sm font-semibold rounded-xl flex items-center gap-2 transition-colors disabled:opacity-50"
                    >
                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        Enregistrer
                    </button>
                </div>
            </div>

            {/* Desktop: Side nav + content */}
            <div className="hidden lg:grid lg:grid-cols-4 gap-6">
                <div className="space-y-1">
                    {settingsSections.map((section) => (
                        <button
                            key={section.id}
                            onClick={() => setActiveSection(section.id)}
                            className={cn(
                                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors",
                                activeSection === section.id ? "bg-zinc-900 text-white" : "text-zinc-600 hover:bg-zinc-100"
                            )}
                        >
                            <section.icon className="h-5 w-5" />
                            <span className="text-[14px] font-medium">{section.label}</span>
                        </button>
                    ))}
                </div>

                <div className="lg:col-span-3 bg-white rounded-2xl border border-zinc-200 p-6">
                    {renderContent()}
                    <div className="flex justify-end pt-6 mt-6 border-t border-zinc-200">
                        <button
                            onClick={handleSave}
                            disabled={isSaving || avatarUploading || logoUploading}
                            className="h-11 px-6 bg-zinc-900 hover:bg-zinc-800 text-white text-sm font-semibold rounded-xl flex items-center gap-2 transition-colors disabled:opacity-50"
                        >
                            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            Enregistrer
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
