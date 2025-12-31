"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
    collection,
    getDocs,
    query,
    orderBy,
    limit,
    where,
    deleteDoc,
    doc,
    Timestamp
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/lib/auth-context'
import {
    Users,
    Building2,
    Car,
    FileText,
    Wrench,
    TrendingUp,
    LogOut,
    RefreshCw,
    Trash2,
    Eye,
    ChevronRight,
    Search,
    Calendar,
    Mail,
    Phone,
    MapPin,
    Loader2,
    ShieldCheck,
    X,
    Menu
} from "lucide-react"
import { cn } from "@/lib/utils"

// Liste des emails admin autorisés
const ADMIN_EMAILS = [
    "admin@logicielpourgarage.fr",
    "contact@logicielpourgarage.fr",
    "silencieux99@gmail.com" // Ajoute tes emails admin ici
]

interface Stats {
    totalGarages: number
    totalClients: number
    totalVehicules: number
    totalReparations: number
    totalDocuments: number
    garagesThisMonth: number
}

interface GarageWithDetails {
    id: string
    nom: string
    ville: string
    email?: string
    telephone?: string
    statutJuridique?: string
    createdAt: Timestamp
    clientsCount: number
    vehiculesCount: number
}

interface ClientWithGarage {
    id: string
    prenom: string
    nom: string
    email?: string
    telephone?: string
    ville?: string
    garageId: string
    garageName: string
    isVIP: boolean
    createdAt: Timestamp
}

export default function AdminPage() {
    const router = useRouter()
    const { user, loading: authLoading } = useAuth()
    const [isAdmin, setIsAdmin] = useState(false)
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState<Stats | null>(null)
    const [garages, setGarages] = useState<GarageWithDetails[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedGarage, setSelectedGarage] = useState<GarageWithDetails | null>(null)
    const [refreshing, setRefreshing] = useState(false)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [activeTab, setActiveTab] = useState<'overview' | 'garages' | 'clients'>('overview')
    const [clients, setClients] = useState<ClientWithGarage[]>([])
    const [clientSearchTerm, setClientSearchTerm] = useState("")

    // Vérifier si l'utilisateur est admin
    useEffect(() => {
        if (!authLoading) {
            if (!user) {
                router.push('/login')
                return
            }
            if (user.email && ADMIN_EMAILS.includes(user.email)) {
                setIsAdmin(true)
                loadData()
            } else {
                router.push('/')
            }
        }
    }, [user, authLoading, router])

    const loadData = async () => {
        setLoading(true)
        try {
            // Charger les garages
            const garagesSnap = await getDocs(
                query(collection(db, 'garages'), orderBy('createdAt', 'desc'))
            )

            const garagesData: GarageWithDetails[] = []

            for (const garageDoc of garagesSnap.docs) {
                const data = garageDoc.data()

                // Compter clients et véhicules pour ce garage
                const clientsSnap = await getDocs(
                    query(collection(db, 'clients'), where('garageId', '==', garageDoc.id))
                )
                const vehiculesSnap = await getDocs(
                    query(collection(db, 'vehicules'), where('garageId', '==', garageDoc.id))
                )

                garagesData.push({
                    id: garageDoc.id,
                    nom: data.nom || 'Sans nom',
                    ville: data.ville || 'N/A',
                    email: data.email,
                    telephone: data.telephone,
                    statutJuridique: data.statutJuridique,
                    createdAt: data.createdAt,
                    clientsCount: clientsSnap.size,
                    vehiculesCount: vehiculesSnap.size
                })
            }

            setGarages(garagesData)

            // Calculer les stats globales
            const clientsSnap = await getDocs(collection(db, 'clients'))
            const vehiculesSnap = await getDocs(collection(db, 'vehicules'))
            const reparationsSnap = await getDocs(collection(db, 'reparations'))
            const documentsSnap = await getDocs(collection(db, 'documents'))

            // Garages créés ce mois
            const now = new Date()
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
            const garagesThisMonth = garagesData.filter(g =>
                g.createdAt && g.createdAt.toDate() >= startOfMonth
            ).length

            setStats({
                totalGarages: garagesData.length,
                totalClients: clientsSnap.size,
                totalVehicules: vehiculesSnap.size,
                totalReparations: reparationsSnap.size,
                totalDocuments: documentsSnap.size,
                garagesThisMonth
            })

            // Charger tous les clients avec leur garage
            const clientsData: ClientWithGarage[] = []
            for (const clientDoc of clientsSnap.docs) {
                const data = clientDoc.data()
                const garage = garagesData.find(g => g.id === data.garageId)
                clientsData.push({
                    id: clientDoc.id,
                    prenom: data.prenom || '',
                    nom: data.nom || '',
                    email: data.email,
                    telephone: data.telephone,
                    ville: data.ville,
                    garageId: data.garageId,
                    garageName: garage?.nom || 'Garage inconnu',
                    isVIP: data.isVIP || false,
                    createdAt: data.createdAt
                })
            }
            setClients(clientsData.sort((a, b) => {
                if (!a.createdAt || !b.createdAt) return 0
                return b.createdAt.toMillis() - a.createdAt.toMillis()
            }))

        } catch (error) {
            console.error('Erreur chargement admin:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleRefresh = async () => {
        setRefreshing(true)
        await loadData()
        setRefreshing(false)
    }

    const handleDeleteGarage = async (garageId: string) => {
        if (!confirm('Supprimer ce garage et toutes ses données ? Cette action est irréversible.')) {
            return
        }

        try {
            // Supprimer les données liées
            const clientsSnap = await getDocs(query(collection(db, 'clients'), where('garageId', '==', garageId)))
            const vehiculesSnap = await getDocs(query(collection(db, 'vehicules'), where('garageId', '==', garageId)))
            const reparationsSnap = await getDocs(query(collection(db, 'reparations'), where('garageId', '==', garageId)))
            const documentsSnap = await getDocs(query(collection(db, 'documents'), where('garageId', '==', garageId)))

            // Supprimer en batch
            for (const d of clientsSnap.docs) await deleteDoc(d.ref)
            for (const d of vehiculesSnap.docs) await deleteDoc(d.ref)
            for (const d of reparationsSnap.docs) await deleteDoc(d.ref)
            for (const d of documentsSnap.docs) await deleteDoc(d.ref)

            // Supprimer le garage
            await deleteDoc(doc(db, 'garages', garageId))

            // Rafraîchir
            await loadData()
            setSelectedGarage(null)
        } catch (error) {
            console.error('Erreur suppression:', error)
            alert('Erreur lors de la suppression')
        }
    }

    const filteredGarages = garages.filter(g =>
        g.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.ville.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.email?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const filteredClients = clients.filter(c =>
        c.prenom.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
        c.nom.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
        c.email?.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
        c.garageName.toLowerCase().includes(clientSearchTerm.toLowerCase())
    )

    const formatDate = (timestamp: Timestamp | undefined) => {
        if (!timestamp) return 'N/A'
        return timestamp.toDate().toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        })
    }

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
            </div>
        )
    }

    if (!isAdmin) {
        return null
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-white">
            {/* Header */}
            <header className="bg-zinc-900 border-b border-zinc-800 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="h-16 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
                                <ShieldCheck className="h-5 w-5 text-zinc-900" />
                            </div>
                            <span className="font-bold text-lg hidden sm:block">Admin Panel</span>
                        </div>

                        {/* Desktop nav */}
                        <div className="hidden sm:flex items-center gap-6">
                            <button
                                onClick={() => setActiveTab('overview')}
                                className={cn(
                                    "text-sm font-medium transition-colors",
                                    activeTab === 'overview' ? "text-white" : "text-zinc-400 hover:text-white"
                                )}
                            >
                                Vue d'ensemble
                            </button>
                            <button
                                onClick={() => setActiveTab('garages')}
                                className={cn(
                                    "text-sm font-medium transition-colors",
                                    activeTab === 'garages' ? "text-white" : "text-zinc-400 hover:text-white"
                                )}
                            >
                                Garages
                            </button>
                            <button
                                onClick={() => setActiveTab('clients')}
                                className={cn(
                                    "text-sm font-medium transition-colors",
                                    activeTab === 'clients' ? "text-white" : "text-zinc-400 hover:text-white"
                                )}
                            >
                                Clients
                            </button>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleRefresh}
                                disabled={refreshing}
                                className="h-9 w-9 rounded-lg bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center transition-colors"
                            >
                                <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
                            </button>
                            <Link
                                href="/"
                                className="h-9 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 flex items-center gap-2 text-sm transition-colors"
                            >
                                <LogOut className="h-4 w-4" />
                                <span className="hidden sm:inline">Quitter</span>
                            </Link>

                            {/* Mobile menu button */}
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="sm:hidden h-9 w-9 rounded-lg bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center"
                            >
                                {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile menu */}
                {mobileMenuOpen && (
                    <div className="sm:hidden border-t border-zinc-800 px-4 py-3 space-y-1">
                        <button
                            onClick={() => { setActiveTab('overview'); setMobileMenuOpen(false) }}
                            className={cn(
                                "w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                                activeTab === 'overview' ? "bg-zinc-800 text-white" : "text-zinc-400"
                            )}
                        >
                            Vue d'ensemble
                        </button>
                        <button
                            onClick={() => { setActiveTab('garages'); setMobileMenuOpen(false) }}
                            className={cn(
                                "w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                                activeTab === 'garages' ? "bg-zinc-800 text-white" : "text-zinc-400"
                            )}
                        >
                            Garages ({stats?.totalGarages || 0})
                        </button>
                        <button
                            onClick={() => { setActiveTab('clients'); setMobileMenuOpen(false) }}
                            className={cn(
                                "w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                                activeTab === 'clients' ? "bg-zinc-800 text-white" : "text-zinc-400"
                            )}
                        >
                            Clients ({stats?.totalClients || 0})
                        </button>
                    </div>
                )}
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <div className="space-y-6">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                            <div className="bg-zinc-900 rounded-xl p-4 sm:p-5 border border-zinc-800">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                                        <Building2 className="h-5 w-5 text-blue-400" />
                                    </div>
                                </div>
                                <p className="text-2xl sm:text-3xl font-bold">{stats?.totalGarages || 0}</p>
                                <p className="text-sm text-zinc-500">Garages</p>
                                {stats && stats.garagesThisMonth > 0 && (
                                    <p className="text-xs text-emerald-400 mt-1">+{stats.garagesThisMonth} ce mois</p>
                                )}
                            </div>

                            <div className="bg-zinc-900 rounded-xl p-4 sm:p-5 border border-zinc-800">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                                        <Users className="h-5 w-5 text-emerald-400" />
                                    </div>
                                </div>
                                <p className="text-2xl sm:text-3xl font-bold">{stats?.totalClients || 0}</p>
                                <p className="text-sm text-zinc-500">Clients</p>
                            </div>

                            <div className="bg-zinc-900 rounded-xl p-4 sm:p-5 border border-zinc-800">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                                        <Car className="h-5 w-5 text-amber-400" />
                                    </div>
                                </div>
                                <p className="text-2xl sm:text-3xl font-bold">{stats?.totalVehicules || 0}</p>
                                <p className="text-sm text-zinc-500">Véhicules</p>
                            </div>

                            <div className="bg-zinc-900 rounded-xl p-4 sm:p-5 border border-zinc-800">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
                                        <Wrench className="h-5 w-5 text-violet-400" />
                                    </div>
                                </div>
                                <p className="text-2xl sm:text-3xl font-bold">{stats?.totalReparations || 0}</p>
                                <p className="text-sm text-zinc-500">Réparations</p>
                            </div>

                            <div className="bg-zinc-900 rounded-xl p-4 sm:p-5 border border-zinc-800">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center">
                                        <FileText className="h-5 w-5 text-rose-400" />
                                    </div>
                                </div>
                                <p className="text-2xl sm:text-3xl font-bold">{stats?.totalDocuments || 0}</p>
                                <p className="text-sm text-zinc-500">Documents</p>
                            </div>

                            <div className="bg-zinc-900 rounded-xl p-4 sm:p-5 border border-zinc-800">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                                        <TrendingUp className="h-5 w-5 text-cyan-400" />
                                    </div>
                                </div>
                                <p className="text-2xl sm:text-3xl font-bold">
                                    {stats && stats.totalGarages > 0
                                        ? (stats.totalClients / stats.totalGarages).toFixed(1)
                                        : '0'}
                                </p>
                                <p className="text-sm text-zinc-500">Clients/garage</p>
                            </div>
                        </div>

                        {/* Recent Garages */}
                        <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
                            <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between">
                                <h2 className="font-semibold">Derniers garages inscrits</h2>
                                <button
                                    onClick={() => setActiveTab('garages')}
                                    className="text-sm text-zinc-400 hover:text-white flex items-center gap-1"
                                >
                                    Voir tout
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>
                            <div className="divide-y divide-zinc-800">
                                {garages.slice(0, 5).map(garage => (
                                    <div
                                        key={garage.id}
                                        className="p-4 sm:p-5 hover:bg-zinc-800/50 transition-colors cursor-pointer"
                                        onClick={() => setSelectedGarage(garage)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="min-w-0 flex-1">
                                                <p className="font-medium truncate">{garage.nom}</p>
                                                <p className="text-sm text-zinc-500 flex items-center gap-1">
                                                    <MapPin className="h-3 w-3" />
                                                    {garage.ville}
                                                </p>
                                            </div>
                                            <div className="text-right ml-4">
                                                <p className="text-sm text-zinc-400">{formatDate(garage.createdAt)}</p>
                                                <p className="text-xs text-zinc-500">{garage.clientsCount} clients</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {garages.length === 0 && (
                                    <div className="p-8 text-center text-zinc-500">
                                        Aucun garage inscrit
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Garages Tab */}
                {activeTab === 'garages' && (
                    <div className="space-y-4">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Rechercher un garage..."
                                className="w-full h-12 pl-12 pr-4 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-700"
                            />
                        </div>

                        {/* Garages List */}
                        <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
                            <div className="p-4 border-b border-zinc-800">
                                <p className="text-sm text-zinc-400">{filteredGarages.length} garage(s)</p>
                            </div>
                            <div className="divide-y divide-zinc-800 max-h-[60vh] overflow-y-auto">
                                {filteredGarages.map(garage => (
                                    <div
                                        key={garage.id}
                                        className="p-4 sm:p-5 hover:bg-zinc-800/50 transition-colors"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="min-w-0 flex-1">
                                                <p className="font-medium">{garage.nom}</p>
                                                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-zinc-500">
                                                    <span className="flex items-center gap-1">
                                                        <MapPin className="h-3 w-3" />
                                                        {garage.ville}
                                                    </span>
                                                    {garage.email && (
                                                        <span className="flex items-center gap-1">
                                                            <Mail className="h-3 w-3" />
                                                            {garage.email}
                                                        </span>
                                                    )}
                                                    {garage.telephone && (
                                                        <span className="flex items-center gap-1">
                                                            <Phone className="h-3 w-3" />
                                                            {garage.telephone}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex gap-4 mt-2 text-xs text-zinc-500">
                                                    <span>{garage.clientsCount} clients</span>
                                                    <span>{garage.vehiculesCount} véhicules</span>
                                                    <span>{formatDate(garage.createdAt)}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                <button
                                                    onClick={() => setSelectedGarage(garage)}
                                                    className="h-9 w-9 rounded-lg bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center transition-colors"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteGarage(garage.id)}
                                                    className="h-9 w-9 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 flex items-center justify-center transition-colors"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {filteredGarages.length === 0 && (
                                    <div className="p-8 text-center text-zinc-500">
                                        {searchTerm ? 'Aucun résultat' : 'Aucun garage'}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Clients Tab */}
                {activeTab === 'clients' && (
                    <div className="space-y-4">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
                            <input
                                type="text"
                                value={clientSearchTerm}
                                onChange={(e) => setClientSearchTerm(e.target.value)}
                                placeholder="Rechercher un client..."
                                className="w-full h-12 pl-12 pr-4 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-700"
                            />
                        </div>

                        {/* Clients List */}
                        <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
                            <div className="p-4 border-b border-zinc-800">
                                <p className="text-sm text-zinc-400">{filteredClients.length} client(s)</p>
                            </div>
                            <div className="divide-y divide-zinc-800 max-h-[60vh] overflow-y-auto">
                                {filteredClients.map(client => (
                                    <div
                                        key={client.id}
                                        className="p-4 sm:p-5 hover:bg-zinc-800/50 transition-colors"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2">
                                                    <p className="font-medium">{client.prenom} {client.nom}</p>
                                                    {client.isVIP && (
                                                        <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-400 text-[10px] font-bold rounded">VIP</span>
                                                    )}
                                                </div>
                                                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-zinc-500">
                                                    <span className="flex items-center gap-1">
                                                        <Building2 className="h-3 w-3" />
                                                        {client.garageName}
                                                    </span>
                                                    {client.email && (
                                                        <span className="flex items-center gap-1">
                                                            <Mail className="h-3 w-3" />
                                                            {client.email}
                                                        </span>
                                                    )}
                                                    {client.telephone && (
                                                        <span className="flex items-center gap-1">
                                                            <Phone className="h-3 w-3" />
                                                            {client.telephone}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex gap-4 mt-2 text-xs text-zinc-500">
                                                    {client.ville && <span>{client.ville}</span>}
                                                    <span>{formatDate(client.createdAt)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {filteredClients.length === 0 && (
                                    <div className="p-8 text-center text-zinc-500">
                                        {clientSearchTerm ? 'Aucun résultat' : 'Aucun client'}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* Garage Detail Modal */}
            {selectedGarage && (
                <>
                    <div
                        className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
                        onClick={() => setSelectedGarage(null)}
                    />
                    <div className="fixed inset-x-4 top-[10%] sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-lg z-50">
                        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden shadow-2xl">
                            <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
                                <h3 className="font-semibold text-lg">Détails du garage</h3>
                                <button
                                    onClick={() => setSelectedGarage(null)}
                                    className="h-8 w-8 rounded-lg hover:bg-zinc-800 flex items-center justify-center transition-colors"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                            <div className="p-5 space-y-4">
                                <div>
                                    <p className="text-sm text-zinc-500">Nom</p>
                                    <p className="font-medium text-lg">{selectedGarage.nom}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-zinc-500">Ville</p>
                                        <p>{selectedGarage.ville}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-zinc-500">Statut juridique</p>
                                        <p>{selectedGarage.statutJuridique || 'N/A'}</p>
                                    </div>
                                </div>
                                {selectedGarage.email && (
                                    <div>
                                        <p className="text-sm text-zinc-500">Email</p>
                                        <a href={`mailto:${selectedGarage.email}`} className="text-blue-400 hover:underline">
                                            {selectedGarage.email}
                                        </a>
                                    </div>
                                )}
                                {selectedGarage.telephone && (
                                    <div>
                                        <p className="text-sm text-zinc-500">Téléphone</p>
                                        <a href={`tel:${selectedGarage.telephone}`} className="text-blue-400 hover:underline">
                                            {selectedGarage.telephone}
                                        </a>
                                    </div>
                                )}
                                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-zinc-800">
                                    <div className="bg-zinc-800 rounded-xl p-4 text-center">
                                        <p className="text-2xl font-bold">{selectedGarage.clientsCount}</p>
                                        <p className="text-sm text-zinc-500">Clients</p>
                                    </div>
                                    <div className="bg-zinc-800 rounded-xl p-4 text-center">
                                        <p className="text-2xl font-bold">{selectedGarage.vehiculesCount}</p>
                                        <p className="text-sm text-zinc-500">Véhicules</p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm text-zinc-500">Inscrit le</p>
                                    <p>{formatDate(selectedGarage.createdAt)}</p>
                                </div>
                            </div>
                            <div className="p-5 border-t border-zinc-800 flex gap-3">
                                <button
                                    onClick={() => setSelectedGarage(null)}
                                    className="flex-1 h-11 bg-zinc-800 hover:bg-zinc-700 rounded-xl font-medium transition-colors"
                                >
                                    Fermer
                                </button>
                                <button
                                    onClick={() => handleDeleteGarage(selectedGarage.id)}
                                    className="h-11 px-5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl font-medium transition-colors flex items-center gap-2"
                                >
                                    <Trash2 className="h-4 w-4" />
                                    Supprimer
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
