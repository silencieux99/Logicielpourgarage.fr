"use client"

import { useState, useEffect } from "react"
import {
    Users,
    Plus,
    Search,
    Phone,
    Mail,
    Clock,
    Wrench,
    Loader2,
    X,
    Edit,
    Trash2,
    User,
    Calendar,
    CheckCircle
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"
import {
    getPersonnelByGarage,
    createPersonnel,
    updatePersonnel,
    deletePersonnel,
    Personnel
} from "@/lib/database"
import { Timestamp } from "firebase/firestore"

const ROLES = [
    { id: 'mecanicien', label: 'Mécanicien', color: 'bg-blue-100 text-blue-700' },
    { id: 'carrossier', label: 'Carrossier', color: 'bg-orange-100 text-orange-700' },
    { id: 'electricien', label: 'Électricien', color: 'bg-yellow-100 text-yellow-700' },
    { id: 'apprenti', label: 'Apprenti', color: 'bg-purple-100 text-purple-700' },
    { id: 'receptionniste', label: 'Réceptionniste', color: 'bg-green-100 text-green-700' },
    { id: 'manager', label: 'Manager', color: 'bg-zinc-100 text-zinc-700' },
]

const COLORS = [
    '#4f46e5', '#0891b2', '#059669', '#ca8a04', '#ea580c',
    '#dc2626', '#c026d3', '#7c3aed', '#475569', '#000000'
]

const SPECIALITES = [
    'Mécanique générale', 'Diagnostic électronique', 'Climatisation',
    'Freinage', 'Embrayage', 'Distribution', 'Injection',
    'Carrosserie', 'Peinture', 'Électricité auto', 'Pneumatiques'
]

export default function PersonnelPage() {
    const { garage } = useAuth()
    const [personnel, setPersonnel] = useState<Personnel[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [showModal, setShowModal] = useState(false)
    const [editingPersonnel, setEditingPersonnel] = useState<Personnel | null>(null)
    const [saving, setSaving] = useState(false)
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

    const [formData, setFormData] = useState({
        prenom: "",
        nom: "",
        email: "",
        telephone: "",
        role: "mecanicien" as Personnel['role'],
        specialites: [] as string[],
        tauxHoraire: 55,
        couleur: COLORS[0],
        actif: true,
        notes: ""
    })

    useEffect(() => {
        if (garage?.id) {
            loadPersonnel()
        }
    }, [garage?.id])

    const loadPersonnel = async () => {
        if (!garage?.id) return
        setLoading(true)
        try {
            const data = await getPersonnelByGarage(garage.id)
            setPersonnel(data)
        } catch (error) {
            console.error("Erreur chargement personnel:", error)
        } finally {
            setLoading(false)
        }
    }

    const openCreateModal = () => {
        setEditingPersonnel(null)
        setFormData({
            prenom: "",
            nom: "",
            email: "",
            telephone: "",
            role: "mecanicien",
            specialites: [],
            tauxHoraire: 55,
            couleur: COLORS[Math.floor(Math.random() * COLORS.length)],
            actif: true,
            notes: ""
        })
        setShowModal(true)
    }

    const openEditModal = (p: Personnel) => {
        setEditingPersonnel(p)
        setFormData({
            prenom: p.prenom,
            nom: p.nom,
            email: p.email || "",
            telephone: p.telephone || "",
            role: p.role,
            specialites: p.specialites || [],
            tauxHoraire: p.tauxHoraire,
            couleur: p.couleur,
            actif: p.actif,
            notes: p.notes || ""
        })
        setShowModal(true)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!garage?.id || !formData.prenom || !formData.nom) return

        setSaving(true)
        try {
            if (editingPersonnel?.id) {
                await updatePersonnel(editingPersonnel.id, {
                    ...formData,
                    email: formData.email || undefined,
                    telephone: formData.telephone || undefined,
                    notes: formData.notes || undefined
                })
            } else {
                await createPersonnel({
                    garageId: garage.id,
                    ...formData,
                    email: formData.email || undefined,
                    telephone: formData.telephone || undefined,
                    notes: formData.notes || undefined,
                    dateEmbauche: Timestamp.now()
                })
            }
            await loadPersonnel()
            setShowModal(false)
        } catch (error) {
            console.error("Erreur sauvegarde:", error)
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (id: string) => {
        try {
            await deletePersonnel(id)
            await loadPersonnel()
            setDeleteConfirm(null)
        } catch (error) {
            console.error("Erreur suppression:", error)
        }
    }

    const toggleSpecialite = (spec: string) => {
        setFormData(prev => ({
            ...prev,
            specialites: prev.specialites.includes(spec)
                ? prev.specialites.filter(s => s !== spec)
                : [...prev.specialites, spec]
        }))
    }

    const filteredPersonnel = personnel.filter(p =>
        p.prenom.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.role.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const getRoleConfig = (role: string) => {
        return ROLES.find(r => r.id === role) || ROLES[0]
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-6 w-6 animate-spin text-[var(--text-muted)]" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-semibold text-[var(--text-primary)] tracking-tight">
                        Personnel
                    </h1>
                    <p className="text-[13px] text-[var(--text-tertiary)] mt-0.5">
                        {personnel.length} employé{personnel.length > 1 ? 's' : ''}
                    </p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="h-10 px-4 bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-white text-[13px] font-medium rounded-xl flex items-center gap-2 transition-colors"
                >
                    <Plus className="h-4 w-4" />
                    Nouvel employé
                </button>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Rechercher un employé..."
                    className="w-full h-11 pl-11 pr-4 bg-white border border-[var(--border-default)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent"
                />
            </div>

            {/* Grid */}
            {filteredPersonnel.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-[var(--border-light)]">
                    <Users className="h-10 w-10 text-[var(--text-muted)] mx-auto mb-3" />
                    <h3 className="text-[15px] font-medium text-[var(--text-primary)] mb-1">
                        Aucun employé
                    </h3>
                    <p className="text-[13px] text-[var(--text-tertiary)] mb-4">
                        Ajoutez votre premier employé
                    </p>
                    <button
                        onClick={openCreateModal}
                        className="h-9 px-4 bg-[var(--accent-primary)] text-white text-[13px] font-medium rounded-lg"
                    >
                        Ajouter
                    </button>
                </div>
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredPersonnel.map((p) => {
                        const roleConfig = getRoleConfig(p.role)
                        return (
                            <div
                                key={p.id}
                                className="bg-white rounded-2xl p-5 relative group"
                                style={{ boxShadow: 'var(--shadow-sm)' }}
                            >
                                {/* Color indicator */}
                                <div
                                    className="absolute top-0 left-6 right-6 h-1 rounded-b-full"
                                    style={{ backgroundColor: p.couleur }}
                                />

                                {/* Avatar + Info */}
                                <div className="flex items-start gap-4 mt-2">
                                    <div
                                        className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-semibold text-lg flex-shrink-0"
                                        style={{ backgroundColor: p.couleur }}
                                    >
                                        {p.prenom[0]}{p.nom[0]}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-[15px] font-semibold text-[var(--text-primary)] truncate">
                                                {p.prenom} {p.nom}
                                            </h3>
                                            {!p.actif && (
                                                <span className="px-2 py-0.5 bg-zinc-100 text-zinc-500 text-[10px] font-medium rounded-full">
                                                    Inactif
                                                </span>
                                            )}
                                        </div>
                                        <span className={cn(
                                            "inline-block px-2 py-0.5 text-[11px] font-medium rounded-full mt-1",
                                            roleConfig.color
                                        )}>
                                            {roleConfig.label}
                                        </span>
                                    </div>
                                </div>

                                {/* Contact */}
                                <div className="mt-4 space-y-2">
                                    {p.telephone && (
                                        <div className="flex items-center gap-2 text-[13px] text-[var(--text-secondary)]">
                                            <Phone className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                                            {p.telephone}
                                        </div>
                                    )}
                                    {p.email && (
                                        <div className="flex items-center gap-2 text-[13px] text-[var(--text-secondary)] truncate">
                                            <Mail className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                                            {p.email}
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2 text-[13px] text-[var(--text-secondary)]">
                                        <Clock className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                                        {p.tauxHoraire} €/h
                                    </div>
                                </div>

                                {/* Spécialités */}
                                {p.specialites && p.specialites.length > 0 && (
                                    <div className="mt-4 flex flex-wrap gap-1">
                                        {p.specialites.slice(0, 3).map(s => (
                                            <span key={s} className="px-2 py-0.5 bg-zinc-100 text-zinc-600 text-[10px] rounded-full">
                                                {s}
                                            </span>
                                        ))}
                                        {p.specialites.length > 3 && (
                                            <span className="px-2 py-0.5 bg-zinc-100 text-zinc-600 text-[10px] rounded-full">
                                                +{p.specialites.length - 3}
                                            </span>
                                        )}
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="mt-4 pt-4 border-t border-[var(--border-light)] flex gap-2">
                                    <button
                                        onClick={() => openEditModal(p)}
                                        className="flex-1 h-9 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-[13px] font-medium rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                                    >
                                        <Edit className="h-3.5 w-3.5" />
                                        Modifier
                                    </button>
                                    {deleteConfirm === p.id ? (
                                        <button
                                            onClick={() => handleDelete(p.id!)}
                                            className="flex-1 h-9 bg-red-500 hover:bg-red-600 text-white text-[13px] font-medium rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                                        >
                                            Confirmer
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => setDeleteConfirm(p.id!)}
                                            className="h-9 w-9 bg-zinc-100 hover:bg-red-100 text-zinc-400 hover:text-red-500 rounded-lg flex items-center justify-center transition-colors"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <>
                    <div className="fixed inset-0 bg-black/40 z-50" onClick={() => setShowModal(false)} />
                    <div className="fixed inset-4 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-lg bg-white rounded-2xl z-50 flex flex-col max-h-[90vh] overflow-hidden" style={{ boxShadow: 'var(--shadow-xl)' }}>
                        <div className="px-6 py-4 border-b border-[var(--border-light)] flex items-center justify-between flex-shrink-0">
                            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                                {editingPersonnel ? 'Modifier' : 'Nouvel employé'}
                            </h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="w-8 h-8 rounded-full hover:bg-zinc-100 flex items-center justify-center transition-colors"
                            >
                                <X className="h-4 w-4 text-zinc-500" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
                            {/* Nom / Prénom */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[12px] font-medium text-[var(--text-tertiary)] mb-1.5">Prénom *</label>
                                    <input
                                        type="text"
                                        value={formData.prenom}
                                        onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                                        className="w-full h-11 px-4 bg-zinc-50 border-0 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-[12px] font-medium text-[var(--text-tertiary)] mb-1.5">Nom *</label>
                                    <input
                                        type="text"
                                        value={formData.nom}
                                        onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                                        className="w-full h-11 px-4 bg-zinc-50 border-0 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Contact */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[12px] font-medium text-[var(--text-tertiary)] mb-1.5">Téléphone</label>
                                    <input
                                        type="tel"
                                        value={formData.telephone}
                                        onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                                        className="w-full h-11 px-4 bg-zinc-50 border-0 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[12px] font-medium text-[var(--text-tertiary)] mb-1.5">Email</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full h-11 px-4 bg-zinc-50 border-0 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                                    />
                                </div>
                            </div>

                            {/* Rôle */}
                            <div>
                                <label className="block text-[12px] font-medium text-[var(--text-tertiary)] mb-2">Rôle *</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {ROLES.map(role => (
                                        <button
                                            key={role.id}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, role: role.id as Personnel['role'] })}
                                            className={cn(
                                                "h-10 px-3 text-[12px] font-medium rounded-xl transition-all flex items-center justify-center",
                                                formData.role === role.id
                                                    ? "bg-[var(--accent-primary)] text-white"
                                                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                                            )}
                                        >
                                            {role.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Couleur */}
                            <div>
                                <label className="block text-[12px] font-medium text-[var(--text-tertiary)] mb-2">Couleur planning</label>
                                <div className="flex gap-2 flex-wrap">
                                    {COLORS.map(color => (
                                        <button
                                            key={color}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, couleur: color })}
                                            className={cn(
                                                "w-8 h-8 rounded-full transition-all",
                                                formData.couleur === color && "ring-2 ring-offset-2 ring-[var(--accent-primary)]"
                                            )}
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Taux horaire */}
                            <div>
                                <label className="block text-[12px] font-medium text-[var(--text-tertiary)] mb-1.5">Taux horaire (€)</label>
                                <input
                                    type="number"
                                    value={formData.tauxHoraire}
                                    onChange={(e) => setFormData({ ...formData, tauxHoraire: parseFloat(e.target.value) || 0 })}
                                    min={0}
                                    step={0.5}
                                    className="w-full h-11 px-4 bg-zinc-50 border-0 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                                />
                            </div>

                            {/* Spécialités */}
                            <div>
                                <label className="block text-[12px] font-medium text-[var(--text-tertiary)] mb-2">Spécialités</label>
                                <div className="flex flex-wrap gap-2">
                                    {SPECIALITES.map(spec => (
                                        <button
                                            key={spec}
                                            type="button"
                                            onClick={() => toggleSpecialite(spec)}
                                            className={cn(
                                                "px-3 py-1.5 text-[11px] font-medium rounded-full transition-all",
                                                formData.specialites.includes(spec)
                                                    ? "bg-[var(--accent-primary)] text-white"
                                                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                                            )}
                                        >
                                            {spec}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Actif */}
                            <div className="flex items-center justify-between py-3 px-4 bg-zinc-50 rounded-xl">
                                <div>
                                    <p className="text-[13px] font-medium text-[var(--text-primary)]">Employé actif</p>
                                    <p className="text-[11px] text-[var(--text-tertiary)]">Peut être assigné aux réparations</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, actif: !formData.actif })}
                                    className={cn(
                                        "w-12 h-7 rounded-full transition-colors relative",
                                        formData.actif ? "bg-[var(--accent-primary)]" : "bg-zinc-300"
                                    )}
                                >
                                    <div className={cn(
                                        "w-5 h-5 bg-white rounded-full absolute top-1 transition-all",
                                        formData.actif ? "right-1" : "left-1"
                                    )} />
                                </button>
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="block text-[12px] font-medium text-[var(--text-tertiary)] mb-1.5">Notes</label>
                                <textarea
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    rows={2}
                                    className="w-full px-4 py-3 bg-zinc-50 border-0 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                                    placeholder="Remarques..."
                                />
                            </div>
                        </form>

                        <div className="px-6 py-4 border-t border-[var(--border-light)] flex gap-3 flex-shrink-0">
                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                className="flex-1 h-11 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-[13px] font-medium rounded-xl transition-colors"
                            >
                                Annuler
                            </button>
                            <button
                                type="submit"
                                form="personnel-form"
                                onClick={handleSubmit}
                                disabled={saving || !formData.prenom || !formData.nom}
                                className="flex-1 h-11 bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] disabled:bg-zinc-300 text-white text-[13px] font-medium rounded-xl flex items-center justify-center gap-2 transition-colors"
                            >
                                {saving ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <>
                                        <CheckCircle className="h-4 w-4" />
                                        {editingPersonnel ? 'Enregistrer' : 'Créer'}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
