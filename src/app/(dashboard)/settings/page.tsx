"use client"

import { useState, useRef, useEffect } from "react"
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
import { getGarageByUserId, getGarageConfig, updateGarage, updateGarageConfig, createGarageConfig } from "@/lib/database"
import { InvoiceTemplate, InvoiceTemplateData } from "@/components/InvoiceTemplate"

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
    const { user, loading } = useAuth()
    const [activeSection, setActiveSection] = useState("garage")
    const [isSaving, setIsSaving] = useState(false)
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle')
    const [showPassword, setShowPassword] = useState(false)

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

    // Charger les données initiales
    useEffect(() => {
        const loadInitialData = async () => {
            if (!user) return;

            setProfileData(prev => ({ ...prev, email: user.email || "" }));

            try {
                const garageDataFetched = await getGarageByUserId(user.uid);
                if (garageDataFetched) {
                    setGarageData({
                        nom: garageDataFetched.nom || "",
                        siret: garageDataFetched.siret || "",
                        tva: garageDataFetched.numeroTVA || "",
                        adresse: garageDataFetched.adresse || "",
                        codePostal: garageDataFetched.codePostal || "",
                        ville: garageDataFetched.ville || "",
                        telephone: garageDataFetched.telephone || "",
                        email: garageDataFetched.email || "",
                        siteWeb: garageDataFetched.siteWeb || "",
                    });

                    if (garageDataFetched.id) {
                        const configDataFetched = await getGarageConfig(garageDataFetched.id);
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
        if (!user) return
        setIsSaving(true)
        setSaveStatus('saving')

        try {
            const currentGarage = await getGarageByUserId(user.uid)
            if (!currentGarage || !currentGarage.id) throw new Error("Garage non trouvé")

            // Mettre à jour le garage
            const garageUpdateData: any = {
                nom: garageData.nom,
                siret: garageData.siret,
                numeroTVA: garageData.tva,
                adresse: garageData.adresse,
                codePostal: garageData.codePostal,
                ville: garageData.ville,
                telephone: garageData.telephone,
                email: garageData.email,
                siteWeb: garageData.siteWeb,
            }

            // Ajouter le logo seulement s'il existe
            if (logoFiles[0]?.url) {
                garageUpdateData.logo = logoFiles[0].url
            }

            // Filtrer les undefined
            const cleanGarageData = Object.fromEntries(
                Object.entries(garageUpdateData).filter(([_, v]) => v !== undefined)
            )

            await updateGarage(currentGarage.id, cleanGarageData)

            // Vérifier si la config existe, sinon la créer
            let currentConfig = await getGarageConfig(currentGarage.id)
            if (!currentConfig || !currentConfig.id) {
                // Créer la config si elle n'existe pas
                const configId = await createGarageConfig({
                    garageId: currentGarage.id,
                    prefixeDevis: documentSettings.prefixeDevis,
                    prefixeFacture: documentSettings.prefixeFacture,
                    prochainNumeroDevis: documentSettings.prochainNumeroDevis,
                    prochainNumeroFacture: documentSettings.prochainNumeroFacture,
                    mentionsLegales: documentSettings.mentionsLegales,
                    tauxHoraireMO: documentSettings.tauxHoraire,
                    tauxTVA: documentSettings.tauxTVA,
                    emailNotifications: notificationSettings.emailRappelRDV,
                    smsRappels: notificationSettings.smsRappelRDV,
                })
                console.log('✅ Config créée:', configId)
            } else {
                // Mettre à jour la config existante
                await updateGarageConfig(currentConfig.id, {
                    prefixeDevis: documentSettings.prefixeDevis,
                    prefixeFacture: documentSettings.prefixeFacture,
                    prochainNumeroDevis: documentSettings.prochainNumeroDevis,
                    prochainNumeroFacture: documentSettings.prochainNumeroFacture,
                    mentionsLegales: documentSettings.mentionsLegales,
                    tauxHoraireMO: documentSettings.tauxHoraire,
                    tauxTVA: documentSettings.tauxTVA,
                    emailNotifications: notificationSettings.emailRappelRDV,
                    smsRappels: notificationSettings.smsRappelRDV,
                })
            }

            setSaveStatus('success')
            setTimeout(() => setSaveStatus('idle'), 3000)
        } catch (error) {
            console.error('Error saving settings:', error)
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
                                <label className="block text-sm font-medium text-zinc-700 mb-2">Prénom</label>
                                <input type="text" value={profileData.prenom} onChange={(e) => setProfileData({ ...profileData, prenom: e.target.value })} placeholder="Jean" className="w-full h-11 px-4 border border-zinc-300 rounded-xl text-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-2">Nom</label>
                                <input type="text" value={profileData.nom} onChange={(e) => setProfileData({ ...profileData, nom: e.target.value })} placeholder="Dupont" className="w-full h-11 px-4 border border-zinc-300 rounded-xl text-sm" />
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

                        <div className="grid xl:grid-cols-2 gap-6">
                            {/* Configuration */}
                            <div className="space-y-4">
                                <div className="bg-zinc-50 rounded-xl p-4">
                                    <h3 className="text-sm font-semibold text-zinc-900 mb-4">Numérotation</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-medium text-zinc-600 mb-1">Préfixe devis</label>
                                            <div className="flex gap-2">
                                                <input type="text" value={documentSettings.prefixeDevis} onChange={(e) => setDocumentSettings({ ...documentSettings, prefixeDevis: e.target.value })} className="w-20 h-10 px-3 border border-zinc-300 rounded-lg text-sm text-center bg-white" />
                                                <input type="number" value={documentSettings.prochainNumeroDevis} onChange={(e) => setDocumentSettings({ ...documentSettings, prochainNumeroDevis: parseInt(e.target.value) || 1 })} className="flex-1 h-10 px-3 border border-zinc-300 rounded-lg text-sm bg-white" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-zinc-600 mb-1">Préfixe facture</label>
                                            <div className="flex gap-2">
                                                <input type="text" value={documentSettings.prefixeFacture} onChange={(e) => setDocumentSettings({ ...documentSettings, prefixeFacture: e.target.value })} className="w-20 h-10 px-3 border border-zinc-300 rounded-lg text-sm text-center bg-white" />
                                                <input type="number" value={documentSettings.prochainNumeroFacture} onChange={(e) => setDocumentSettings({ ...documentSettings, prochainNumeroFacture: parseInt(e.target.value) || 1 })} className="flex-1 h-10 px-3 border border-zinc-300 rounded-lg text-sm bg-white" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-zinc-50 rounded-xl p-4">
                                    <h3 className="text-sm font-semibold text-zinc-900 mb-4">Tarification par défaut</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-zinc-600 mb-1">Taux horaire MO (€ HT)</label>
                                            <input type="number" value={documentSettings.tauxHoraire} onChange={(e) => setDocumentSettings({ ...documentSettings, tauxHoraire: parseFloat(e.target.value) || 0 })} className="w-full h-10 px-3 border border-zinc-300 rounded-lg text-sm bg-white" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-zinc-600 mb-1">TVA par défaut (%)</label>
                                            <select value={documentSettings.tauxTVA} onChange={(e) => setDocumentSettings({ ...documentSettings, tauxTVA: parseFloat(e.target.value) })} className="w-full h-10 px-3 border border-zinc-300 rounded-lg text-sm bg-white">
                                                <option value={20}>20%</option>
                                                <option value={10}>10%</option>
                                                <option value={5.5}>5.5%</option>
                                                <option value={0}>Exonéré (0%)</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 mb-2">Mentions légales</label>
                                    <textarea
                                        value={documentSettings.mentionsLegales}
                                        onChange={(e) => setDocumentSettings({ ...documentSettings, mentionsLegales: e.target.value })}
                                        rows={4}
                                        className="w-full px-4 py-3 border border-zinc-300 rounded-xl text-sm resize-none bg-white"
                                        placeholder="Mentions légales apparaissant en bas de vos documents..."
                                    />
                                </div>
                            </div>

                            {/* Live Preview */}
                            <div className="relative">
                                <div className="sticky top-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Aperçu en temps réel</span>
                                    </div>

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
                                                logo: logoUrl
                                            },
                                            client: {
                                                nom: "Client Exemple",
                                                adresse: "123 Avenue du Client",
                                                codePostal: "75001",
                                                ville: "Paris"
                                            },
                                            lignes: [
                                                { designation: "Main d'œuvre - Révision", description: "Forfait vidange + contrôles", quantite: "2h", prixUnitaireHT: documentSettings.tauxHoraire },
                                                { designation: "Filtre à huile", description: "Réf: FH-2024-X", quantite: 1, prixUnitaireHT: 25 },
                                                { designation: "Huile moteur 5W40", description: "5 litres - Synthétique", quantite: 1, prixUnitaireHT: 65 }
                                            ],
                                            totalHT: exampleHT,
                                            tauxTVA: documentSettings.tauxTVA,
                                            totalTVA: exampleTVA,
                                            totalTTC: exampleTTC,
                                            mentionsLegales: documentSettings.mentionsLegales
                                        }}
                                        scale={0.9}
                                    />

                                    {/* Devis preview hint */}
                                    <div className="mt-4 text-center">
                                        <p className="text-xs text-zinc-400">
                                            Le devis utilisera le préfixe <span className="font-mono font-semibold text-zinc-600">{documentSettings.prefixeDevis}-{String(documentSettings.prochainNumeroDevis).padStart(5, '0')}</span>
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
                                    <input type={showPassword ? "text" : "password"} placeholder="••••••••" className="w-full h-11 pl-10 pr-12 border border-zinc-300 rounded-xl text-sm" />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600">
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>
                            <button className="h-11 px-6 bg-zinc-900 hover:bg-zinc-800 text-white text-sm font-medium rounded-xl transition-colors">Changer le mot de passe</button>
                        </div>
                    </div>
                )
            case "facturation":
                return (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-lg font-semibold text-zinc-900 mb-1">Abonnement</h2>
                            <p className="text-sm text-zinc-500">Gérez votre plan et passez au Pro</p>
                        </div>

                        {/* Plan actuel */}
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
                        <div className="grid grid-cols-3 gap-3">
                            <button className="p-4 rounded-xl border-2 border-zinc-900 bg-white text-center">
                                <div className="w-12 h-8 bg-white border border-zinc-200 rounded mx-auto mb-2" />
                                <span className="text-sm font-medium text-zinc-900">Clair</span>
                            </button>
                            <button className="p-4 rounded-xl border-2 border-zinc-200 bg-white text-center hover:border-zinc-300">
                                <div className="w-12 h-8 bg-zinc-900 rounded mx-auto mb-2" />
                                <span className="text-sm font-medium text-zinc-600">Sombre</span>
                            </button>
                        </div>
                    </div>
                )
            default: return null
        }
    }

    return (
        <div className="space-y-4 sm:space-y-6">
            <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-zinc-900">Paramètres</h1>
                <p className="text-sm text-zinc-500 mt-1">Gérez votre compte et vos préférences</p>
            </div>

            <div className="lg:hidden space-y-2">
                {settingsSections.map((section) => (
                    <button key={section.id} onClick={() => setActiveSection(section.id)} className={cn("w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-colors text-left", activeSection === section.id ? "border-zinc-900 bg-zinc-50" : "border-zinc-200 bg-white hover:border-zinc-300")}>
                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0", activeSection === section.id ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-600")}>
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

            <div className="hidden lg:grid lg:grid-cols-4 gap-6">
                <div className="space-y-1">
                    {settingsSections.map((section) => (
                        <button key={section.id} onClick={() => setActiveSection(section.id)} className={cn("w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors", activeSection === section.id ? "bg-zinc-900 text-white" : "text-zinc-600 hover:bg-zinc-100")}>
                            <section.icon className="h-5 w-5" />
                            <span className="text-[14px] font-medium">{section.label}</span>
                        </button>
                    ))}
                </div>

                <div className="lg:col-span-3 bg-white rounded-2xl border border-zinc-200 p-6">
                    <div ref={mobileContentRef}>
                        {renderContent()}
                    </div>
                    <div className="flex justify-end pt-6 mt-6 border-t border-zinc-200">
                        <button
                            onClick={handleSave}
                            disabled={isSaving || avatarUploading || logoUploading}
                            className={cn(
                                "h-11 px-6 text-sm font-semibold rounded-xl flex items-center gap-2 transition-all duration-300 disabled:opacity-50",
                                saveStatus === 'success' ? "bg-emerald-600 hover:bg-emerald-700 text-white" :
                                    saveStatus === 'error' ? "bg-red-600 hover:bg-red-700 text-white" :
                                        "bg-zinc-900 hover:bg-zinc-800 text-white"
                            )}
                        >
                            {isSaving ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : saveStatus === 'success' ? (
                                <Check className="h-4 w-4" />
                            ) : saveStatus === 'error' ? (
                                <X className="h-4 w-4" />
                            ) : (
                                <Save className="h-4 w-4" />
                            )}
                            {saveStatus === 'success' ? "Enregistré !" :
                                saveStatus === 'error' ? "Erreur" :
                                    "Enregistrer"}
                        </button>
                    </div>
                </div>
            </div>

            {/* Content for mobile when a section is active */}
            <div className="lg:hidden bg-white rounded-2xl border border-zinc-200 p-6">
                {renderContent()}
                <div className="flex justify-end pt-6 mt-6 border-t border-zinc-200">
                    <button
                        onClick={handleSave}
                        disabled={isSaving || avatarUploading || logoUploading}
                        className={cn(
                            "h-11 px-6 text-sm font-semibold rounded-xl flex items-center gap-2 transition-all duration-300 disabled:opacity-50",
                            saveStatus === 'success' ? "bg-emerald-600 hover:bg-emerald-700 text-white" :
                                saveStatus === 'error' ? "bg-red-600 hover:bg-red-700 text-white" :
                                    "bg-zinc-900 hover:bg-zinc-800 text-white"
                        )}
                    >
                        {isSaving ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : saveStatus === 'success' ? (
                            <Check className="h-4 w-4" />
                        ) : saveStatus === 'error' ? (
                            <X className="h-4 w-4" />
                        ) : (
                            <Save className="h-4 w-4" />
                        )}
                        {saveStatus === 'success' ? "Enregistré !" :
                            saveStatus === 'error' ? "Erreur" :
                                "Enregistrer"}
                    </button>
                </div>
            </div>
        </div>
    )
}
