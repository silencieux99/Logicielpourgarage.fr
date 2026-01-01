"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
    collection,
    getDocs,
    query,
    orderBy,
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
    Search,
    Mail,
    Phone,
    MapPin,
    Loader2,
    ShieldCheck,
    X,
    LayoutDashboard,
    CreditCard,
    Settings,
    ChevronDown,
    Crown,
    Calendar,
    ExternalLink
} from "lucide-react"
import { cn } from "@/lib/utils"

// Liste des emails admin autorisés
const ADMIN_EMAILS = [
    "admin@logicielpourgarage.fr",
    "contact@logicielpourgarage.fr",
    "silencieux99@gmail.com"
]

interface Stats {
    totalGarages: number
    totalClients: number
    totalVehicules: number
    totalReparations: number
    totalDocuments: number
    garagesThisMonth: number
    garagesThisWeek: number
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
    userId?: string
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

type Tab = 'overview' | 'garages' | 'clients' | 'subscriptions' | 'settings'

export default function AdminPage() {
    const router = useRouter()
    const { user, loading: authLoading } = useAuth()
    const [isAdmin, setIsAdmin] = useState(false)
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState<Stats | null>(null)
    const [garages, setGarages] = useState<GarageWithDetails[]>([])
    const [clients, setClients] = useState<ClientWithGarage[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedGarage, setSelectedGarage] = useState<GarageWithDetails | null>(null)
    const [refreshing, setRefreshing] = useState(false)
    const [activeTab, setActiveTab] = useState<Tab>('overview')

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
            const now = new Date()
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
            const startOfWeek = new Date(now)
            startOfWeek.setDate(now.getDate() - now.getDay())

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
                    vehiculesCount: vehiculesSnap.size,
                    userId: data.userId
                })
            }

            setGarages(garagesData)

            // Calculer les stats globales
            const clientsSnap = await getDocs(collection(db, 'clients'))
            const vehiculesSnap = await getDocs(collection(db, 'vehicules'))
            const reparationsSnap = await getDocs(collection(db, 'reparations'))
            const documentsSnap = await getDocs(collection(db, 'documents'))

            const garagesThisMonth = garagesData.filter(g =>
                g.createdAt && g.createdAt.toDate() >= startOfMonth
            ).length

            const garagesThisWeek = garagesData.filter(g =>
                g.createdAt && g.createdAt.toDate() >= startOfWeek
            ).length

            setStats({
                totalGarages: garagesData.length,
                totalClients: clientsSnap.size,
                totalVehicules: vehiculesSnap.size,
                totalReparations: reparationsSnap.size,
                totalDocuments: documentsSnap.size,
                garagesThisMonth,
                garagesThisWeek
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
            const clientsSnap = await getDocs(query(collection(db, 'clients'), where('garageId', '==', garageId)))
            const vehiculesSnap = await getDocs(query(collection(db, 'vehicules'), where('garageId', '==', garageId)))
            const reparationsSnap = await getDocs(query(collection(db, 'reparations'), where('garageId', '==', garageId)))
            const documentsSnap = await getDocs(query(collection(db, 'documents'), where('garageId', '==', garageId)))

            for (const d of clientsSnap.docs) await deleteDoc(d.ref)
            for (const d of vehiculesSnap.docs) await deleteDoc(d.ref)
            for (const d of reparationsSnap.docs) await deleteDoc(d.ref)
            for (const d of documentsSnap.docs) await deleteDoc(d.ref)

            await deleteDoc(doc(db, 'garages', garageId))
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
        c.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.garageName.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const formatDate = (timestamp: Timestamp | undefined) => {
        if (!timestamp) return 'N/A'
        return timestamp.toDate().toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        })
    }

    const formatDateShort = (timestamp: Timestamp | undefined) => {
        if (!timestamp) return 'N/A'
        return timestamp.toDate().toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit'
        })
    }

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-white mx-auto mb-3" />
                    <p className="text-zinc-500 text-sm">Chargement...</p>
                </div>
            </div>
        )
    }

    if (!isAdmin) {
        return null
    }

    const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
        { id: 'overview', label: 'Accueil', icon: LayoutDashboard },
        { id: 'garages', label: 'Garages', icon: Building2 },
        { id: 'clients', label: 'Clients', icon: Users },
        { id: 'subscriptions', label: 'Abos', icon: CreditCard },
        { id: 'settings', label: 'Config', icon: Settings },
    ]

    return (
        <div className="min-h-screen bg-zinc-950 text-white pb-20">
            {/* Header - Compact */}
            <header className="bg-zinc-900/80 backdrop-blur-xl border-b border-zinc-800 sticky top-0 z-40">
                <div className="px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                            <ShieldCheck className="h-4 w-4 text-white" />
                        </div>
                        <div>
                            <h1 className="font-bold text-sm">Admin Panel</h1>
                            <p className="text-[10px] text-zinc-500">GaragePro</p>
                        </div>
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
                            className="h-9 w-9 rounded-lg bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center transition-colors"
                        >
                            <LogOut className="h-4 w-4" />
                        </Link>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="px-4 py-4 space-y-4">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <>
                        {/* Quick Stats - 2x3 Grid */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-4">
                                <Building2 className="h-5 w-5 text-blue-200 mb-2" />
                                <p className="text-2xl font-bold">{stats?.totalGarages || 0}</p>
                                <p className="text-xs text-blue-200">Garages</p>
                                {stats && stats.garagesThisWeek > 0 && (
                                    <p className="text-[10px] text-blue-100 mt-1">+{stats.garagesThisWeek} cette semaine</p>
                                )}
                            </div>
                            <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-2xl p-4">
                                <Users className="h-5 w-5 text-emerald-200 mb-2" />
                                <p className="text-2xl font-bold">{stats?.totalClients || 0}</p>
                                <p className="text-xs text-emerald-200">Clients</p>
                            </div>
                            <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
                                <Car className="h-5 w-5 text-amber-400 mb-2" />
                                <p className="text-2xl font-bold">{stats?.totalVehicules || 0}</p>
                                <p className="text-xs text-zinc-500">Véhicules</p>
                            </div>
                            <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
                                <Wrench className="h-5 w-5 text-violet-400 mb-2" />
                                <p className="text-2xl font-bold">{stats?.totalReparations || 0}</p>
                                <p className="text-xs text-zinc-500">Réparations</p>
                            </div>
                            <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
                                <FileText className="h-5 w-5 text-rose-400 mb-2" />
                                <p className="text-2xl font-bold">{stats?.totalDocuments || 0}</p>
                                <p className="text-xs text-zinc-500">Documents</p>
                            </div>
                            <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
                                <TrendingUp className="h-5 w-5 text-cyan-400 mb-2" />
                                <p className="text-2xl font-bold">
                                    {stats && stats.totalGarages > 0
                                        ? (stats.totalClients / stats.totalGarages).toFixed(1)
                                        : '0'}
                                </p>
                                <p className="text-xs text-zinc-500">Clients/garage</p>
                            </div>
                        </div>

                        {/* Recent Garages */}
                        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
                            <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
                                <h2 className="font-semibold text-sm">Dernières inscriptions</h2>
                                <button
                                    onClick={() => setActiveTab('garages')}
                                    className="text-xs text-violet-400"
                                >
                                    Voir tout
                                </button>
                            </div>
                            <div className="divide-y divide-zinc-800">
                                {garages.slice(0, 5).map(garage => (
                                    <button
                                        key={garage.id}
                                        onClick={() => setSelectedGarage(garage)}
                                        className="w-full p-4 flex items-center justify-between hover:bg-zinc-800/50 transition-colors text-left"
                                    >
                                        <div className="min-w-0 flex-1">
                                            <p className="font-medium text-sm truncate">{garage.nom}</p>
                                            <p className="text-xs text-zinc-500">{garage.ville}</p>
                                        </div>
                                        <div className="text-right ml-3">
                                            <p className="text-xs text-zinc-400">{formatDateShort(garage.createdAt)}</p>
                                            <p className="text-[10px] text-zinc-600">{garage.clientsCount} clients</p>
                                        </div>
                                    </button>
                                ))}
                                {garages.length === 0 && (
                                    <p className="p-6 text-center text-zinc-500 text-sm">Aucun garage</p>
                                )}
                            </div>
                        </div>
                    </>
                )}

                {/* Garages Tab */}
                {activeTab === 'garages' && (
                    <>
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Rechercher..."
                                className="w-full h-11 pl-10 pr-4 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                            />
                        </div>

                        {/* Results count */}
                        <p className="text-xs text-zinc-500">{filteredGarages.length} garage(s)</p>

                        {/* Garages List */}
                        <div className="space-y-2">
                            {filteredGarages.map(garage => (
                                <div
                                    key={garage.id}
                                    className="bg-zinc-900 rounded-xl border border-zinc-800 p-4"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0 flex-1">
                                            <p className="font-medium text-sm">{garage.nom}</p>
                                            <div className="flex items-center gap-2 mt-1 text-xs text-zinc-500">
                                                <MapPin className="h-3 w-3" />
                                                <span>{garage.ville}</span>
                                            </div>
                                            {garage.email && (
                                                <a href={`mailto:${garage.email}`} className="flex items-center gap-2 mt-1 text-xs text-zinc-400 hover:text-white">
                                                    <Mail className="h-3 w-3" />
                                                    <span className="truncate">{garage.email}</span>
                                                </a>
                                            )}
                                            <div className="flex items-center gap-3 mt-2 text-[10px] text-zinc-600">
                                                <span>{garage.clientsCount} clients</span>
                                                <span>{garage.vehiculesCount} véhicules</span>
                                                <span>{formatDateShort(garage.createdAt)}</span>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setSelectedGarage(garage)}
                                                className="h-9 w-9 rounded-lg bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteGarage(garage.id)}
                                                className="h-9 w-9 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 flex items-center justify-center"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {filteredGarages.length === 0 && (
                                <p className="text-center text-zinc-500 text-sm py-8">Aucun résultat</p>
                            )}
                        </div>
                    </>
                )}

                {/* Clients Tab */}
                {activeTab === 'clients' && (
                    <>
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Rechercher un client..."
                                className="w-full h-11 pl-10 pr-4 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                            />
                        </div>

                        {/* Results count */}
                        <p className="text-xs text-zinc-500">{filteredClients.length} client(s)</p>

                        {/* Clients List */}
                        <div className="space-y-2">
                            {filteredClients.map(client => (
                                <div
                                    key={client.id}
                                    className="bg-zinc-900 rounded-xl border border-zinc-800 p-4"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2">
                                                <p className="font-medium text-sm">{client.prenom} {client.nom}</p>
                                                {client.isVIP && (
                                                    <Crown className="h-3 w-3 text-amber-400" />
                                                )}
                                            </div>
                                            <p className="text-xs text-violet-400 mt-0.5">{client.garageName}</p>
                                            {client.email && (
                                                <a href={`mailto:${client.email}`} className="flex items-center gap-2 mt-1 text-xs text-zinc-400 hover:text-white">
                                                    <Mail className="h-3 w-3" />
                                                    <span className="truncate">{client.email}</span>
                                                </a>
                                            )}
                                            {client.telephone && (
                                                <a href={`tel:${client.telephone}`} className="flex items-center gap-2 mt-1 text-xs text-zinc-400 hover:text-white">
                                                    <Phone className="h-3 w-3" />
                                                    <span>{client.telephone}</span>
                                                </a>
                                            )}
                                        </div>
                                        <p className="text-[10px] text-zinc-600">{formatDateShort(client.createdAt)}</p>
                                    </div>
                                </div>
                            ))}
                            {filteredClients.length === 0 && (
                                <p className="text-center text-zinc-500 text-sm py-8">Aucun résultat</p>
                            )}
                        </div>
                    </>
                )}

                {/* Subscriptions Tab */}
                {activeTab === 'subscriptions' && (
                    <div className="space-y-4">
                        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6 text-center">
                            <CreditCard className="h-10 w-10 text-zinc-600 mx-auto mb-3" />
                            <h3 className="font-semibold mb-1">Gestion des abonnements</h3>
                            <p className="text-sm text-zinc-500 mb-4">
                                Gérez les abonnements via le dashboard Stripe
                            </p>
                            <a
                                href="https://dashboard.stripe.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 h-10 px-4 bg-violet-600 hover:bg-violet-500 rounded-lg text-sm font-medium transition-colors"
                            >
                                Ouvrir Stripe
                                <ExternalLink className="h-4 w-4" />
                            </a>
                        </div>

                        {/* Stats abonnements */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-4">
                                <p className="text-xs text-zinc-500 mb-1">Essais gratuits</p>
                                <p className="text-xl font-bold">{stats?.totalGarages || 0}</p>
                            </div>
                            <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-4">
                                <p className="text-xs text-zinc-500 mb-1">Abonnés Pro</p>
                                <p className="text-xl font-bold">0</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Settings Tab */}
                {activeTab === 'settings' && (
                    <div className="space-y-4">
                        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
                            <div className="p-4 border-b border-zinc-800">
                                <h3 className="font-semibold text-sm">Administration</h3>
                            </div>
                            <div className="divide-y divide-zinc-800">
                                <Link
                                    href="/"
                                    className="w-full p-4 flex items-center justify-between hover:bg-zinc-800/50 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <ExternalLink className="h-4 w-4 text-zinc-500" />
                                        <span className="text-sm">Voir le site</span>
                                    </div>
                                </Link>
                                <Link
                                    href="/dashboard"
                                    className="w-full p-4 flex items-center justify-between hover:bg-zinc-800/50 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <LayoutDashboard className="h-4 w-4 text-zinc-500" />
                                        <span className="text-sm">Dashboard utilisateur</span>
                                    </div>
                                </Link>
                            </div>
                        </div>

                        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
                            <div className="p-4 border-b border-zinc-800">
                                <h3 className="font-semibold text-sm">Emails admins autorisés</h3>
                            </div>
                            <div className="p-4 space-y-2">
                                {ADMIN_EMAILS.map((email, i) => (
                                    <div key={i} className="flex items-center gap-2 text-sm text-zinc-400">
                                        <Mail className="h-3 w-3" />
                                        <span>{email}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-4">
                            <p className="text-xs text-zinc-500 mb-2">Connecté en tant que</p>
                            <p className="text-sm font-medium">{user?.email}</p>
                        </div>
                    </div>
                )}
            </main>

            {/* Bottom Navigation - Mobile Style */}
            <nav className="fixed bottom-0 left-0 right-0 bg-zinc-900/95 backdrop-blur-xl border-t border-zinc-800 z-50 safe-area-bottom">
                <div className="flex items-center justify-around h-16">
                    {tabs.map(tab => {
                        const isActive = activeTab === tab.id
                        return (
                            <button
                                key={tab.id}
                                onClick={() => {
                                    setActiveTab(tab.id)
                                    setSearchTerm('')
                                }}
                                className={cn(
                                    "flex-1 flex flex-col items-center justify-center gap-1 py-2 transition-colors",
                                    isActive ? "text-white" : "text-zinc-500"
                                )}
                            >
                                <tab.icon className={cn("h-5 w-5", isActive && "text-violet-400")} />
                                <span className="text-[10px] font-medium">{tab.label}</span>
                            </button>
                        )
                    })}
                </div>
            </nav>

            {/* Garage Detail Modal */}
            {selectedGarage && (
                <>
                    <div
                        className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
                        onClick={() => setSelectedGarage(null)}
                    />
                    <div className="fixed inset-x-4 bottom-4 top-auto z-50 max-h-[80vh] overflow-y-auto">
                        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
                            {/* Handle */}
                            <div className="flex justify-center py-2">
                                <div className="w-10 h-1 bg-zinc-700 rounded-full" />
                            </div>

                            <div className="px-5 pb-2 flex items-center justify-between">
                                <h3 className="font-semibold">Détails du garage</h3>
                                <button
                                    onClick={() => setSelectedGarage(null)}
                                    className="h-8 w-8 rounded-lg hover:bg-zinc-800 flex items-center justify-center"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            <div className="px-5 pb-5 space-y-4">
                                <div>
                                    <p className="text-xs text-zinc-500">Nom</p>
                                    <p className="font-medium">{selectedGarage.nom}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-zinc-500">Ville</p>
                                        <p className="text-sm">{selectedGarage.ville}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-zinc-500">Statut</p>
                                        <p className="text-sm">{selectedGarage.statutJuridique || 'N/A'}</p>
                                    </div>
                                </div>

                                {selectedGarage.email && (
                                    <div>
                                        <p className="text-xs text-zinc-500">Email</p>
                                        <a href={`mailto:${selectedGarage.email}`} className="text-sm text-violet-400">
                                            {selectedGarage.email}
                                        </a>
                                    </div>
                                )}

                                {selectedGarage.telephone && (
                                    <div>
                                        <p className="text-xs text-zinc-500">Téléphone</p>
                                        <a href={`tel:${selectedGarage.telephone}`} className="text-sm text-violet-400">
                                            {selectedGarage.telephone}
                                        </a>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-zinc-800">
                                    <div className="bg-zinc-800 rounded-xl p-3 text-center">
                                        <p className="text-xl font-bold">{selectedGarage.clientsCount}</p>
                                        <p className="text-xs text-zinc-500">Clients</p>
                                    </div>
                                    <div className="bg-zinc-800 rounded-xl p-3 text-center">
                                        <p className="text-xl font-bold">{selectedGarage.vehiculesCount}</p>
                                        <p className="text-xs text-zinc-500">Véhicules</p>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-xs text-zinc-500">Inscrit le</p>
                                    <p className="text-sm">{formatDate(selectedGarage.createdAt)}</p>
                                </div>
                            </div>

                            <div className="p-4 border-t border-zinc-800 flex gap-3">
                                <button
                                    onClick={() => setSelectedGarage(null)}
                                    className="flex-1 h-11 bg-zinc-800 hover:bg-zinc-700 rounded-xl font-medium text-sm transition-colors"
                                >
                                    Fermer
                                </button>
                                <button
                                    onClick={() => handleDeleteGarage(selectedGarage.id)}
                                    className="h-11 px-4 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl font-medium text-sm transition-colors flex items-center gap-2"
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
