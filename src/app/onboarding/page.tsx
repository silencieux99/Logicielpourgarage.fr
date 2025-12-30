"use client"

import { useState, useRef } from "react"
import { cn } from "@/lib/utils"
import {
    Building2,
    Users,
    Car,
    CheckCircle2,
    ArrowRight,
    ArrowLeft,
    Upload,
    MapPin,
    Phone,
    Mail,
    Globe,
    Loader2,
    X
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useUpload } from "@/hooks/use-upload"

const steps = [
    { id: 1, title: "Votre garage", icon: Building2 },
    { id: 2, title: "Équipe", icon: Users },
    { id: 3, title: "Premiers véhicules", icon: Car },
    { id: 4, title: "Terminé", icon: CheckCircle2 },
]

export default function OnboardingPage() {
    const [currentStep, setCurrentStep] = useState(1)
    const [formData, setFormData] = useState({
        garageName: "",
        address: "",
        phone: "",
        email: "",
        website: "",
        siret: "",
        teamMembers: [{ name: "", role: "mechanic" }],
    })
    const router = useRouter()

    // File input refs
    const logoInputRef = useRef<HTMLInputElement>(null)
    const vehicleFileInputRef = useRef<HTMLInputElement>(null)

    // Upload hooks
    const {
        files: logoFiles,
        uploadFiles: uploadLogo,
        removeFile: removeLogoFile,
        uploading: logoUploading
    } = useUpload({ folder: 'logos', maxFiles: 1 })

    const {
        files: vehicleImportFiles,
        uploadFiles: uploadVehicleFile,
        removeFile: removeVehicleFile,
        uploading: vehicleFileUploading
    } = useUpload({ folder: 'imports', maxFiles: 1 })

    const logoUrl = logoFiles[0]?.url || logoFiles[0]?.preview
    const vehicleFileName = vehicleImportFiles[0]?.name

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files || files.length === 0) return

        if (logoFiles[0]) {
            await removeLogoFile(logoFiles[0].id)
        }

        await uploadLogo(files, 'general')
        e.target.value = ""
    }

    const handleVehicleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files || files.length === 0) return

        if (vehicleImportFiles[0]) {
            await removeVehicleFile(vehicleImportFiles[0].id)
        }

        await uploadVehicleFile(files, 'general')
        e.target.value = ""
    }

    const nextStep = () => {
        if (currentStep < 4) setCurrentStep(currentStep + 1)
    }

    const prevStep = () => {
        if (currentStep > 1) setCurrentStep(currentStep - 1)
    }

    const finishOnboarding = async () => {
        // TODO: Save garage data to Firebase with logoUrl
        const dataToSave = {
            ...formData,
            logoUrl: logoFiles[0]?.url,
            vehicleImportUrl: vehicleImportFiles[0]?.url,
        }
        console.log('Onboarding data:', dataToSave)

        localStorage.setItem("onboarding_completed", "true")
        router.push("/dashboard")
    }

    return (
        <div className="min-h-screen bg-zinc-50 flex">
            {/* Left Panel - Progress */}
            <div className="w-80 bg-white border-r border-zinc-100 p-8 flex flex-col">
                <div className="mb-12">
                    <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center mb-4">
                        <span className="text-white font-semibold">G</span>
                    </div>
                    <h1 className="text-xl font-semibold text-zinc-900">Configuration</h1>
                    <p className="text-[13px] text-zinc-500 mt-1">Configurez votre espace de travail</p>
                </div>

                <div className="flex-1">
                    <div className="space-y-1">
                        {steps.map((step, index) => {
                            const isActive = step.id === currentStep
                            const isCompleted = step.id < currentStep

                            return (
                                <div key={step.id} className="relative">
                                    <div
                                        className={cn(
                                            "flex items-center gap-3 p-3 rounded-lg transition-all",
                                            isActive && "bg-zinc-100",
                                            isCompleted && "opacity-60"
                                        )}
                                    >
                                        <div className={cn(
                                            "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                                            isActive ? "bg-zinc-900 text-white" : isCompleted ? "bg-green-100 text-green-600" : "bg-zinc-100 text-zinc-400"
                                        )}>
                                            {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : <step.icon className="h-4 w-4" />}
                                        </div>
                                        <div>
                                            <p className={cn(
                                                "text-[13px] font-medium",
                                                isActive ? "text-zinc-900" : "text-zinc-500"
                                            )}>
                                                {step.title}
                                            </p>
                                            <p className="text-[11px] text-zinc-400">Étape {step.id}</p>
                                        </div>
                                    </div>

                                    {index < steps.length - 1 && (
                                        <div className="absolute left-[1.35rem] top-12 w-0.5 h-4 bg-zinc-200"></div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>

                <div className="text-[12px] text-zinc-400">
                    Besoin d'aide ? <a href="#" className="text-zinc-900 font-medium hover:underline">Contactez-nous</a>
                </div>
            </div>

            {/* Right Panel - Content */}
            <div className="flex-1 p-12 flex flex-col">
                <div className="flex-1 max-w-2xl">
                    {/* Step 1: Garage Info */}
                    {currentStep === 1 && (
                        <div className="animate-fade-in">
                            <h2 className="text-2xl font-semibold text-zinc-900 mb-2">Informations de votre garage</h2>
                            <p className="text-[15px] text-zinc-500 mb-8">Ces informations apparaîtront sur vos factures et devis.</p>

                            <div className="space-y-5">
                                <div>
                                    <label className="block text-[13px] font-medium text-zinc-700 mb-2">Nom du garage *</label>
                                    <input
                                        type="text"
                                        value={formData.garageName}
                                        onChange={(e) => setFormData({ ...formData, garageName: e.target.value })}
                                        placeholder="Ex: Garage Dupont"
                                        className="w-full h-11 px-4 bg-white border border-zinc-200 rounded-lg text-[14px] placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400 transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[13px] font-medium text-zinc-700 mb-2">Adresse *</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                                        <input
                                            type="text"
                                            value={formData.address}
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                            placeholder="123 Rue du Garage, 75001 Paris"
                                            className="w-full h-11 pl-10 pr-4 bg-white border border-zinc-200 rounded-lg text-[14px] placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400 transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[13px] font-medium text-zinc-700 mb-2">Téléphone</label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                                            <input
                                                type="tel"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                placeholder="01 23 45 67 89"
                                                className="w-full h-11 pl-10 pr-4 bg-white border border-zinc-200 rounded-lg text-[14px] placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400 transition-all"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[13px] font-medium text-zinc-700 mb-2">Email</label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                                            <input
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                placeholder="contact@garage.fr"
                                                className="w-full h-11 pl-10 pr-4 bg-white border border-zinc-200 rounded-lg text-[14px] placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400 transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[13px] font-medium text-zinc-700 mb-2">Site web</label>
                                        <div className="relative">
                                            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                                            <input
                                                type="url"
                                                value={formData.website}
                                                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                                placeholder="www.garage.fr"
                                                className="w-full h-11 pl-10 pr-4 bg-white border border-zinc-200 rounded-lg text-[14px] placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400 transition-all"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[13px] font-medium text-zinc-700 mb-2">SIRET</label>
                                        <input
                                            type="text"
                                            value={formData.siret}
                                            onChange={(e) => setFormData({ ...formData, siret: e.target.value })}
                                            placeholder="123 456 789 00012"
                                            className="w-full h-11 px-4 bg-white border border-zinc-200 rounded-lg text-[14px] placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400 transition-all"
                                        />
                                    </div>
                                </div>

                                {/* Logo upload with Vercel Blob */}
                                <div>
                                    <label className="block text-[13px] font-medium text-zinc-700 mb-2">Logo</label>
                                    {logoUrl ? (
                                        <div className="flex items-center gap-4 p-4 bg-zinc-50 rounded-xl">
                                            <div className="relative">
                                                <img
                                                    src={logoUrl}
                                                    alt="Logo garage"
                                                    className="w-20 h-20 object-contain rounded-lg bg-white border border-zinc-200"
                                                />
                                                <button
                                                    onClick={() => logoFiles[0] && removeLogoFile(logoFiles[0].id)}
                                                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-zinc-900">Logo téléchargé</p>
                                                <button
                                                    onClick={() => logoInputRef.current?.click()}
                                                    className="text-xs text-zinc-500 hover:text-zinc-900"
                                                >
                                                    Changer le logo
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div
                                            onClick={() => !logoUploading && logoInputRef.current?.click()}
                                            className={cn(
                                                "border-2 border-dashed border-zinc-200 rounded-xl p-8 text-center hover:border-zinc-300 transition-colors cursor-pointer relative",
                                                logoUploading && "opacity-50 cursor-wait"
                                            )}
                                        >
                                            {logoUploading ? (
                                                <Loader2 className="h-8 w-8 text-zinc-400 mx-auto mb-2 animate-spin" />
                                            ) : (
                                                <Upload className="h-8 w-8 text-zinc-400 mx-auto mb-2" />
                                            )}
                                            <p className="text-[13px] text-zinc-600">
                                                {logoUploading ? 'Téléchargement...' : <>Glissez votre logo ici ou <span className="text-zinc-900 font-medium">parcourir</span></>}
                                            </p>
                                            <p className="text-[11px] text-zinc-400 mt-1">PNG, JPG jusqu'à 10 Mo</p>
                                        </div>
                                    )}
                                    <input
                                        ref={logoInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleLogoUpload}
                                        className="hidden"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Team */}
                    {currentStep === 2 && (
                        <div className="animate-fade-in">
                            <h2 className="text-2xl font-semibold text-zinc-900 mb-2">Votre équipe</h2>
                            <p className="text-[15px] text-zinc-500 mb-8">Ajoutez les membres de votre équipe pour assigner les réparations.</p>

                            <div className="space-y-4">
                                {formData.teamMembers.map((member, index) => (
                                    <div key={index} className="flex gap-4 items-start p-4 bg-white border border-zinc-200 rounded-xl">
                                        <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500 font-medium text-sm">
                                            {member.name ? member.name[0]?.toUpperCase() : (index + 1)}
                                        </div>
                                        <div className="flex-1 grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-[12px] text-zinc-500 mb-1">Nom complet</label>
                                                <input
                                                    type="text"
                                                    value={member.name}
                                                    onChange={(e) => {
                                                        const newMembers = [...formData.teamMembers]
                                                        newMembers[index].name = e.target.value
                                                        setFormData({ ...formData, teamMembers: newMembers })
                                                    }}
                                                    placeholder="Jean Dupont"
                                                    className="w-full h-10 px-3 bg-zinc-50 border border-zinc-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-zinc-300 transition-all"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[12px] text-zinc-500 mb-1">Rôle</label>
                                                <select
                                                    value={member.role}
                                                    onChange={(e) => {
                                                        const newMembers = [...formData.teamMembers]
                                                        newMembers[index].role = e.target.value
                                                        setFormData({ ...formData, teamMembers: newMembers })
                                                    }}
                                                    className="w-full h-10 px-3 bg-zinc-50 border border-zinc-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-zinc-300"
                                                >
                                                    <option value="mechanic">Mécanicien</option>
                                                    <option value="receptionist">Réceptionniste</option>
                                                    <option value="manager">Responsable</option>
                                                    <option value="admin">Administrateur</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                <button
                                    onClick={() => setFormData({ ...formData, teamMembers: [...formData.teamMembers, { name: "", role: "mechanic" }] })}
                                    className="w-full py-3 border-2 border-dashed border-zinc-200 rounded-xl text-[13px] font-medium text-zinc-600 hover:border-zinc-300 hover:text-zinc-900 transition-all"
                                >
                                    + Ajouter un membre
                                </button>
                            </div>

                            <div className="mt-8 p-4 bg-zinc-100 rounded-xl">
                                <p className="text-[13px] text-zinc-600">
                                    <span className="font-medium text-zinc-900">Astuce :</span> Vous pourrez toujours ajouter ou modifier les membres de l'équipe plus tard dans les paramètres.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Step 3: First Vehicles */}
                    {currentStep === 3 && (
                        <div className="animate-fade-in">
                            <h2 className="text-2xl font-semibold text-zinc-900 mb-2">Premiers véhicules</h2>
                            <p className="text-[15px] text-zinc-500 mb-8">Importez vos véhicules existants ou commencez à zéro.</p>

                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <button
                                    onClick={() => vehicleFileInputRef.current?.click()}
                                    className="p-6 bg-white border-2 border-zinc-200 rounded-xl text-left hover:border-zinc-900 transition-all group"
                                >
                                    <Upload className="h-8 w-8 text-zinc-400 group-hover:text-zinc-900 mb-3 transition-colors" />
                                    <p className="font-medium text-zinc-900">Importer un fichier</p>
                                    <p className="text-[13px] text-zinc-500 mt-1">CSV, Excel avec vos véhicules existants</p>
                                </button>
                                <button
                                    onClick={nextStep}
                                    className="p-6 bg-white border-2 border-zinc-200 rounded-xl text-left hover:border-zinc-900 transition-all group"
                                >
                                    <Car className="h-8 w-8 text-zinc-400 group-hover:text-zinc-900 mb-3 transition-colors" />
                                    <p className="font-medium text-zinc-900">Commencer à zéro</p>
                                    <p className="text-[13px] text-zinc-500 mt-1">Ajoutez vos véhicules un par un</p>
                                </button>
                            </div>

                            {/* Vehicle import with Vercel Blob */}
                            <div className="bg-zinc-100 rounded-xl p-6">
                                <h3 className="font-medium text-zinc-900 mb-3">Import de fichier</h3>
                                {vehicleFileName ? (
                                    <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-zinc-200">
                                        <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                                            <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-zinc-900">{vehicleFileName}</p>
                                            <p className="text-xs text-zinc-500">Fichier prêt à être importé</p>
                                        </div>
                                        <button
                                            onClick={() => vehicleImportFiles[0] && removeVehicleFile(vehicleImportFiles[0].id)}
                                            className="p-2 text-zinc-400 hover:text-red-500"
                                        >
                                            <X className="h-5 w-5" />
                                        </button>
                                    </div>
                                ) : (
                                    <div
                                        onClick={() => !vehicleFileUploading && vehicleFileInputRef.current?.click()}
                                        className={cn(
                                            "border-2 border-dashed border-zinc-300 rounded-xl p-8 text-center bg-white cursor-pointer hover:border-zinc-400 transition-colors",
                                            vehicleFileUploading && "opacity-50 cursor-wait"
                                        )}
                                    >
                                        {vehicleFileUploading ? (
                                            <Loader2 className="h-10 w-10 text-zinc-400 mx-auto mb-3 animate-spin" />
                                        ) : (
                                            <Upload className="h-10 w-10 text-zinc-400 mx-auto mb-3" />
                                        )}
                                        <p className="text-[14px] text-zinc-700 mb-1">
                                            {vehicleFileUploading ? 'Téléchargement...' : 'Glissez votre fichier ici'}
                                        </p>
                                        <p className="text-[12px] text-zinc-500">ou <span className="text-zinc-900 font-medium cursor-pointer hover:underline">parcourir</span></p>
                                    </div>
                                )}
                                <input
                                    ref={vehicleFileInputRef}
                                    type="file"
                                    accept=".csv,.xlsx,.xls"
                                    onChange={handleVehicleFileUpload}
                                    className="hidden"
                                />
                                <p className="text-[12px] text-zinc-500 mt-3">Formats acceptés : .csv, .xlsx, .xls</p>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Complete */}
                    {currentStep === 4 && (
                        <div className="animate-fade-in text-center py-12">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle2 className="h-10 w-10 text-green-600" />
                            </div>
                            <h2 className="text-2xl font-semibold text-zinc-900 mb-2">Configuration terminée !</h2>
                            <p className="text-[15px] text-zinc-500 mb-8 max-w-md mx-auto">
                                Votre espace de travail est prêt. Vous pouvez maintenant commencer à utiliser GaragePro.
                            </p>

                            <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto mb-8">
                                <div className="p-4 bg-zinc-100 rounded-xl">
                                    <p className="text-2xl font-semibold text-zinc-900">{formData.teamMembers.filter(m => m.name).length}</p>
                                    <p className="text-[12px] text-zinc-500">Membres</p>
                                </div>
                                <div className="p-4 bg-zinc-100 rounded-xl">
                                    <p className="text-2xl font-semibold text-zinc-900">0</p>
                                    <p className="text-[12px] text-zinc-500">Véhicules</p>
                                </div>
                                <div className="p-4 bg-zinc-100 rounded-xl">
                                    <p className="text-2xl font-semibold text-zinc-900">0</p>
                                    <p className="text-[12px] text-zinc-500">Clients</p>
                                </div>
                            </div>

                            <Button
                                onClick={finishOnboarding}
                                className="h-12 px-8 bg-zinc-900 hover:bg-zinc-800 text-white text-[14px] font-medium rounded-xl"
                            >
                                Accéder au tableau de bord
                                <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                        </div>
                    )}
                </div>

                {/* Navigation */}
                {currentStep < 4 && (
                    <div className="flex items-center justify-between pt-8 border-t border-zinc-200 mt-8">
                        <button
                            onClick={prevStep}
                            disabled={currentStep === 1}
                            className={cn(
                                "flex items-center gap-2 text-[13px] font-medium transition-colors",
                                currentStep === 1 ? "text-zinc-300 cursor-not-allowed" : "text-zinc-600 hover:text-zinc-900"
                            )}
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Retour
                        </button>
                        <Button
                            onClick={nextStep}
                            disabled={logoUploading || vehicleFileUploading}
                            className="h-10 px-6 bg-zinc-900 hover:bg-zinc-800 text-white text-[13px] font-medium rounded-lg disabled:opacity-50"
                        >
                            Continuer
                            <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}
