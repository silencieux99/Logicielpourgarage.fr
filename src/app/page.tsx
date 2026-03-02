"use client"

import Link from "next/link"
import {
    CheckCircle2,
    ArrowRight,
    Star,
    Shield,
    ChevronRight,
    Loader2,
    X,
    Users,
    Car,
    Wrench,
    FileText,
    CalendarDays,
    Package,
    BarChart3,
    Mail,
    Zap,
    Check,
    LayoutDashboard,
    BellRing,
    Smartphone,
    Plus,
    TrendingUp,
    Calendar,
    Search
} from "lucide-react"
import { useState, useEffect } from "react"
import { LandingHeader } from "@/components/layout/LandingHeader"
import { motion, AnimatePresence } from "framer-motion"
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts'

/* ─── DATA ──────────────────────────────────────────────────────── */

const faqs = [
    { q: "Y a-t-il des frais cachés ?", a: "Non. 59,99€ HT/mois, point final. Pas de frais de mise en service, pas de frais de résiliation. Annulez quand vous voulez." },
    { q: "Comment fonctionne la version gratuite ?", a: "Accès à toutes les fonctionnalités, limité à 5 clients et 5 véhicules. Parfait pour tester avant de s'engager." },
    { q: "Puis-je annuler quand je veux ?", a: "Oui, sans engagement. Annulation en un clic depuis votre espace, effective immédiatement." },
    { q: "Mes données sont-elles sécurisées ?", a: "Hébergement en France, conforme RGPD, chiffrement des données, sauvegardes quotidiennes automatiques." },
    { q: "Combien d'utilisateurs par garage ?", a: "Illimité. Ajoutez autant de collaborateurs que nécessaire sans surcoût." },
    { q: "Faut-il installer un logiciel ?", a: "Non. GaragePro fonctionne 100% dans votre navigateur, sur ordinateur, tablette ou téléphone." },
]

const mockChartData = [
    { name: 'Jan', revenue: 42000, repairs: 145 },
    { name: 'Fév', revenue: 48000, repairs: 160 },
    { name: 'Mar', revenue: 51000, repairs: 175 },
    { name: 'Avr', revenue: 49000, repairs: 168 },
    { name: 'Mai', revenue: 58000, repairs: 195 },
    { name: 'Juin', revenue: 65000, repairs: 215 },
]

const bentoFeatures = [
    {
        title: "Tableau de bord intelligent",
        description: "Une vue d'ensemble instantanée sur votre activité, vos KPIs et les tâches prioritaires de la journée.",
        icon: LayoutDashboard,
        className: "md:col-span-2 md:row-span-2",
    },
    {
        title: "Recherche intelligente",
        description: "Tapez une plaque, trouvez le véhicule et son historique en millisecondes.",
        icon: Car,
        className: "md:col-span-1 md:row-span-1",
    },
    {
        title: "Notifications temps réel",
        description: "Soyez alerté quand un stock est bas ou qu'un rendez-vous est pris en ligne.",
        icon: BellRing,
        className: "md:col-span-1 md:row-span-1",
    },
    {
        title: "Facturation en 1 clic",
        description: "Transformez un devis en facture et envoyez-le par email directement depuis l'application.",
        icon: Zap,
        className: "md:col-span-2 md:row-span-1",
    }
]

/* ─── CHECKOUT MODAL ────────────────────────────────────────────── */

function CheckoutModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const [email, setEmail] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }
        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [isOpen])

    const handleCheckout = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        try {
            window.location.href = `/inscription`
        } catch (err: any) {
            setError(err.message || 'Une erreur est survenue')
            setLoading(false)
        }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 z-50 backdrop-blur-md"
                        onClick={onClose}
                    />
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
                            className="bg-[#0a0a0b] rounded-[32px] w-full max-w-md overflow-hidden border border-white/10 pointer-events-auto relative shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[300px] bg-white/5 opacity-50 blur-[100px] pointer-events-none" />

                            <div className="relative z-10 p-8 sm:p-10">
                                <div className="flex justify-between items-start mb-8">
                                    <div>
                                        <h3 className="text-2xl font-bold text-white tracking-tight">Passez au niveau supérieur.</h3>
                                        <p className="text-zinc-400 mt-2 text-sm leading-relaxed">
                                            Abonnement Pro. Illimité. Sans engagement.
                                        </p>
                                    </div>
                                    <button onClick={onClose} className="p-2 -mr-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors text-zinc-400 hover:text-white">
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>

                                <div className="mb-8">
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-5xl font-extrabold text-white tracking-tighter">59,99€</span>
                                        <span className="text-zinc-500 font-medium">HT / mois</span>
                                    </div>
                                </div>

                                <form onSubmit={handleCheckout} className="space-y-4">
                                    {error && (
                                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-sm text-red-500">
                                            {error}
                                        </motion.div>
                                    )}
                                    <div>
                                        <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 block ml-1">Adresse Email</label>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="vous@garage.fr"
                                            required
                                            className="w-full h-14 px-5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/20 transition-all font-medium"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full h-14 bg-white hover:bg-zinc-200 disabled:opacity-50 text-black font-semibold rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] relative overflow-hidden group"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent translate-x-[-100%] group-hover:animate-[shimmer_1.5s_infinite]" />
                                        {loading ? (
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                        ) : (
                                            <>
                                                <Shield className="h-5 w-5 fill-black/10" />
                                                Accéder au paiement sécurisé
                                            </>
                                        )}
                                    </button>
                                    <p className="text-xs text-zinc-500 text-center mt-4">
                                        Paiement sécurisé par Stripe · Facture avec TVA déductible
                                    </p>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    )
}

/* ─── FAQ ITEM ──────────────────────────────────────────────────── */

function FaqItem({ q, a }: { q: string; a: string }) {
    const [open, setOpen] = useState(false)

    return (
        <div className="border-b border-zinc-200 dark:border-zinc-800">
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between py-6 sm:py-8 text-left group"
            >
                <span className="text-lg sm:text-xl font-semibold text-zinc-900 dark:text-zinc-100 pr-8 group-hover:text-zinc-600 dark:group-hover:text-zinc-400 transition-colors">
                    {q}
                </span>
                <motion.div animate={{ rotate: open ? 45 : 0 }} transition={{ duration: 0.2 }}>
                    <div className="relative w-6 h-6 flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 rounded-full text-zinc-500">
                        <X className="h-3 w-3" />
                    </div>
                </motion.div>
            </button>
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                    >
                        <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed pr-12 pb-8">
                            {a}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

/* ─── UI MOCKUP COMPONENTS ──────────────────────────────────────── */

const DashboardMockup = () => (
    <div className="w-full h-full bg-white dark:bg-[#0a0a0b] flex flex-col font-sans text-left overflow-hidden border-t border-zinc-200 dark:border-white/10">
        <div className="flex-1 flex overflow-hidden">
            {/* Sidebar */}
            <div className="w-16 hidden sm:flex flex-col items-center py-4 border-r border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-[#0f0f11] gap-8">
                <div className="w-8 h-8 rounded-lg bg-zinc-900 dark:bg-white flex items-center justify-center">
                    <Wrench className="w-4 h-4 text-white dark:text-black" />
                </div>
                <div className="flex flex-col gap-6">
                    {[LayoutDashboard, Users, Car, Calendar, FileText].map((Icon, i) => (
                        <div key={i} className={`p-2 rounded-md ${i === 0 ? 'bg-zinc-200 dark:bg-white/10 text-zinc-900 dark:text-white' : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors'}`}>
                            <Icon className="w-[18px] h-[18px]" strokeWidth={2} />
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 bg-white dark:bg-[#0a0a0b] flex flex-col">
                {/* Topbar */}
                <div className="h-14 border-b border-zinc-200 dark:border-white/10 px-6 flex items-center justify-between bg-white dark:bg-[#0a0a0b]">
                    <div className="flex items-center gap-2 text-sm font-medium text-zinc-600 dark:text-zinc-400">
                        <span className="text-zinc-900 dark:text-white font-semibold">GaragePro</span>
                        <span className="text-zinc-300 dark:text-zinc-700">/</span>
                        <span>Tableau de bord</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <div className="w-64 h-8 pl-9 pr-3 text-xs flex items-center bg-zinc-100 dark:bg-[#151518] rounded-md text-zinc-400">
                                Rechercher (Immatriculation, Client...)
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex-1 p-6 overflow-hidden flex flex-col gap-6">
                    {/* KPIs */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { label: "Chiffre d'affaires", value: "12 450 €", trend: "+14.5%", color: "text-emerald-500" },
                            { label: "Réparations", value: "142", trend: "+5.2%", color: "text-emerald-500" },
                            { label: "Panier moyen", value: "354 €", trend: "-1.4%", color: "text-red-500" },
                            { label: "Nouveaux clients", value: "28", trend: "+12.0%", color: "text-emerald-500" }
                        ].map((stat, i) => (
                            <div key={i} className="bg-white dark:bg-[#0f0f11] border border-zinc-200 dark:border-white/10 p-5 rounded-xl shadow-sm">
                                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">{stat.label}</p>
                                <div className="flex items-end justify-between">
                                    <p className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">{stat.value}</p>
                                    <span className={`text-xs font-medium ${stat.color} bg-current/10 px-1.5 py-0.5 rounded`}>{stat.trend}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Table View */}
                    <div className="flex-1 bg-white dark:bg-[#0f0f11] border border-zinc-200 dark:border-white/10 rounded-xl flex flex-col shadow-sm overflow-hidden">
                        <div className="h-12 border-b border-zinc-200 dark:border-white/10 px-5 flex items-center justify-between bg-zinc-50/50 dark:bg-[#151518]/50">
                            <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Interventions récentes</h3>
                            <button className="text-xs font-semibold text-zinc-900 dark:text-white bg-white dark:bg-white/10 border border-zinc-200 dark:border-white/5 shadow-sm px-3 py-1.5 rounded-md hover:bg-zinc-50 dark:hover:bg-white/20 transition-colors">Tout afficher</button>
                        </div>
                        <div className="flex-1 p-0 flex flex-col">
                            {/* Table Header */}
                            <div className="grid grid-cols-5 gap-4 px-5 py-3 border-b border-zinc-100 dark:border-white/5 text-xs font-semibold text-zinc-500">
                                <div className="col-span-1">Immatriculation</div>
                                <div className="col-span-1">Client</div>
                                <div className="col-span-2">Prestation</div>
                                <div className="col-span-1 text-right">Statut</div>
                            </div>
                            {/* Table Rows */}
                            {[
                                { plate: "AB-123-CD", name: "Jean Dupont", task: "Révision des 60 000 km", status: "Terminé", color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" },
                                { plate: "EF-456-GH", name: "Marie Martin", task: "Changement courroie distribution", status: "En cours", color: "text-amber-500 bg-amber-500/10 border-amber-500/20" },
                                { plate: "IJ-789-KL", name: "Société Alpha", task: "Diagnostic électronique", status: "En attente", color: "text-zinc-500 bg-zinc-500/10 border-zinc-500/20" },
                                { plate: "MN-012-OP", name: "Luc Bernard", task: "Remplacement plaquettes frein", status: "Terminé", color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" },
                            ].map((row, i) => (
                                <div key={i} className="grid grid-cols-5 gap-4 px-5 py-3 border-b border-zinc-50 dark:border-white/5 items-center hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors">
                                    <div className="col-span-1 font-mono text-xs font-semibold text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-black border border-zinc-200 dark:border-white/10 shadow-sm px-2 py-1 rounded inline-flex w-fit">{row.plate}</div>
                                    <div className="col-span-1 text-sm text-zinc-700 dark:text-zinc-300 font-medium">{row.name}</div>
                                    <div className="col-span-2 text-sm text-zinc-900 dark:text-white font-medium">{row.task}</div>
                                    <div className="col-span-1 flex justify-end">
                                        <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded border ${row.color}`}>{row.status}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
)

/* ─── HOME PAGE ─────────────────────────────────────────────────── */

export default function HomePage() {
    const [checkoutOpen, setCheckoutOpen] = useState(false)
    const [isScrolled, setIsScrolled] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return (
        <div className="min-h-screen bg-[#fafafa] dark:bg-[#0a0a0b] selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black">
            <CheckoutModal isOpen={checkoutOpen} onClose={() => setCheckoutOpen(false)} />

            <div className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${isScrolled
                ? 'bg-white/80 dark:bg-[#0a0a0b]/80 backdrop-blur-xl border-b border-zinc-200 dark:border-white/10 shadow-sm'
                : 'bg-transparent'
                }`}>
                <LandingHeader />
            </div>

            {/* ═══════════════════════════════════════
          HERO — Powerful, Tech SaaS 2026 Look
      ═══════════════════════════════════════ */}
            <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-32 lg:pt-48 lg:pb-40 overflow-hidden">
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] opacity-20 blur-[100px] pointer-events-none bg-indigo-500 rounded-full mix-blend-screen" />
                </div>

                <div className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-12 relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-zinc-200 dark:border-white/10 bg-white/50 dark:bg-white/5 backdrop-blur-md mb-8 shadow-sm">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-zinc-900 dark:bg-white opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600 dark:bg-indigo-400"></span>
                            </span>
                            <span className="text-xs sm:text-sm font-medium text-indigo-900 dark:text-indigo-100 tracking-wide">
                                GaragePro 2.0 est disponible
                            </span>
                        </div>

                        <h1 className="text-5xl sm:text-7xl lg:text-[90px] font-extrabold text-zinc-900 dark:text-white tracking-tighter leading-[1.05] mb-8 max-w-5xl mx-auto">
                            L'outil ultime pour <br className="hidden sm:block" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-indigo-400 dark:from-indigo-400 dark:to-indigo-600">
                                piloter votre garage.
                            </span>
                        </h1>

                        <p className="text-lg sm:text-xl lg:text-2xl text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-3xl mx-auto mb-10 font-medium">
                            Reprenez le contrôle. Centralisez vos clients, vos véhicules et votre facturation dans une interface d'une fluidité absolue.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
                            <Link
                                href="/inscription"
                                className="w-full sm:w-auto h-14 sm:h-16 px-10 bg-indigo-600 hover:bg-indigo-700 text-white text-base sm:text-lg font-semibold rounded-2xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-xl shadow-indigo-600/20"
                            >
                                Commencer l'essai gratuit
                                <ArrowRight className="h-5 w-5" />
                            </Link>
                            <a
                                href="#demo"
                                className="w-full sm:w-auto h-14 sm:h-16 px-10 bg-white dark:bg-white/5 text-zinc-900 dark:text-white text-base sm:text-lg font-semibold rounded-2xl flex items-center justify-center gap-2 border border-zinc-200 dark:border-white/10 hover:bg-zinc-50 dark:hover:bg-white/10 transition-all duration-200"
                            >
                                Voir une démo
                            </a>
                        </div>

                        <p className="mt-6 text-sm text-zinc-500 dark:text-zinc-400 flex items-center justify-center gap-2">
                            <Check className="h-4 w-4" /> Pas de carte bancaire. Installation en 2 min.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.2 }}
                        className="mt-20 max-w-6xl mx-auto relative group"
                        id="demo"
                        style={{ perspective: "1000px" }}
                    >
                        <div className="w-full aspect-[4/3] sm:aspect-video rounded-3xl overflow-hidden border border-zinc-200 dark:border-white/10 bg-zinc-100 dark:bg-[#0a0a0b] shadow-2xl ring-1 ring-black/5 dark:ring-white/10" style={{ transform: "rotateX(2deg) scale(0.98)", transition: "all 0.7s ease-out" }} onMouseEnter={(e) => { e.currentTarget.style.transform = "rotateX(0deg) scale(1)" }} onMouseLeave={(e) => { e.currentTarget.style.transform = "rotateX(2deg) scale(0.98)" }}>
                            <DashboardMockup />
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ═══════════════════════════════════════
          SOCIAL PROOF — Clean Typography
      ═══════════════════════════════════════ */}
            <section className="border-y border-zinc-200 dark:border-white/10 bg-white dark:bg-[#0a0a0b]">
                <div className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-12 py-16">
                    <p className="text-center text-sm font-semibold text-zinc-500 uppercase tracking-widest mb-10">La confiance de l'industrie</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {[
                            { value: "500+", label: "Garages équipés" },
                            { value: "1.2M€", label: "CA géré mensuellement" },
                            { value: "50k+", label: "Véhicules enregistrés" },
                            { value: "4.9/5", label: "Note sur Trustpilot" },
                        ].map((stat, i) => (
                            <motion.div
                                key={stat.label}
                                className="text-center"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                viewport={{ once: true }}
                            >
                                <p className="text-4xl sm:text-5xl font-extrabold text-zinc-900 dark:text-white tracking-tight mb-2">
                                    {stat.value}
                                </p>
                                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                                    {stat.label}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════
          BENTO GRID FEATURES — SaaS 2026 Style
      ═══════════════════════════════════════ */}
            <section className="py-24 sm:py-32 relative z-10">
                <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
                    <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-24">
                        <h2 className="text-4xl sm:text-5xl font-bold text-zinc-900 dark:text-white tracking-tight mb-6">
                            Tout est pensé. <br className="hidden sm:block" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-indigo-700 dark:from-indigo-400 dark:to-indigo-600">Rien n'est laissé au hasard.</span>
                        </h2>
                        <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
                            Oubliez les logiciels des années 2000. GaragePro est conçu avec les derniers standards ergonomiques pour vous faire gagner du temps.
                        </p>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
                        {/* Tableau de bord intelligent */}
                        <div className="lg:col-span-2 relative group rounded-[32px] p-8 sm:p-12 overflow-hidden bg-white dark:bg-[#111113] border border-zinc-200 dark:border-white/5 hover:border-indigo-500/30 dark:hover:border-indigo-500/30 transition-colors shadow-sm">
                            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none group-hover:bg-indigo-500/10 transition-colors duration-700" />
                            <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
                                <div>
                                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-6">
                                        <LayoutDashboard className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                                    </div>
                                    <h3 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white mb-4 tracking-tight">
                                        Tableau de bord intelligent
                                    </h3>
                                    <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                        Une vue d'ensemble instantanée sur votre activité, vos KPIs et les tâches prioritaires de la journée.
                                    </p>
                                </div>
                                <div className="relative h-[250px] w-full rounded-2xl bg-[#fafafa] dark:bg-[#0a0a0b] border border-zinc-200 dark:border-white/10 overflow-hidden shadow-sm group-hover:border-zinc-300 dark:group-hover:border-white/20 transition-colors p-6 flex flex-col">
                                    <div className="flex justify-between items-center mb-6">
                                        <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Facture #F-2604</div>
                                        <div className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-md">PAYÉE</div>
                                    </div>
                                    <div className="space-y-4 flex-1">
                                        <div className="flex justify-between items-center border-b border-zinc-100 dark:border-white/5 pb-3">
                                            <div>
                                                <div className="text-sm font-semibold text-zinc-900 dark:text-white">Révision Complète</div>
                                                <div className="text-xs text-zinc-500 font-medium">Pièces & Main d'oeuvre</div>
                                            </div>
                                            <div className="text-sm font-bold text-zinc-900 dark:text-white">245,00 €</div>
                                        </div>
                                        <div className="flex justify-between items-center border-b border-zinc-100 dark:border-white/5 pb-3">
                                            <div>
                                                <div className="text-sm font-semibold text-zinc-900 dark:text-white">Vidange Huile 5W30</div>
                                                <div className="text-xs text-zinc-500 font-medium">Forfait standard</div>
                                            </div>
                                            <div className="text-sm font-bold text-zinc-900 dark:text-white">89,00 €</div>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center pt-2">
                                        <div className="text-sm font-bold text-zinc-500">Total TTC</div>
                                        <div className="text-2xl font-black text-zinc-900 dark:text-white">334,00 €</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recherche intelligente */}
                        <div className="relative group rounded-[32px] p-8 sm:p-10 overflow-hidden bg-white dark:bg-[#111113] border border-zinc-200 dark:border-white/5 hover:border-indigo-500/30 dark:hover:border-indigo-500/30 transition-colors shadow-sm">
                            <div className="relative z-10 flex flex-col h-full">
                                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-6">
                                    <Search className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                                </div>
                                <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4 tracking-tight">
                                    Recherche intelligente
                                </h3>
                                <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed mb-8 flex-1">
                                    Tapez une plaque, trouvez le véhicule et son historique en millisecondes.
                                </p>

                                <div className="mt-8 relative">
                                    <div className="h-14 rounded-xl bg-white dark:bg-[#151518] border border-zinc-200 dark:border-white/10 flex items-center px-4 relative z-20 shadow-sm group-hover:border-indigo-500/30 transition-colors">
                                        <Search className="w-5 h-5 text-zinc-400 mr-3" />
                                        <div className="flex gap-1 items-center w-full">
                                            <span className="text-zinc-900 dark:text-white font-mono font-bold text-lg tracking-wider">AB-</span>
                                            <div className="w-[2px] h-6 bg-zinc-900 dark:bg-white animate-pulse" />
                                        </div>
                                    </div>
                                    {/* Fake Dropdown */}
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#151518] border border-zinc-200 dark:border-white/10 rounded-xl shadow-xl overflow-hidden z-10 opacity-50 group-hover:opacity-100 group-hover:translate-y-0 translate-y-2 transition-all duration-300">
                                        <div className="p-3 border-b border-zinc-100 dark:border-white/5 flex items-center gap-3 hover:bg-zinc-50 dark:hover:bg-white/5 cursor-pointer transition-colors">
                                            <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-black border border-zinc-200 dark:border-white/10 flex items-center justify-center font-mono text-xs font-bold text-zinc-900 dark:text-white shadow-sm">AB</div>
                                            <div>
                                                <div className="text-sm font-bold text-zinc-900 dark:text-white">AB-123-CD</div>
                                                <div className="text-xs text-zinc-500 font-medium tracking-wide">Peugeot 208 • Jean Dupont</div>
                                            </div>
                                        </div>
                                        <div className="p-3 flex items-center gap-3 hover:bg-zinc-50 dark:hover:bg-white/5 cursor-pointer transition-colors">
                                            <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-black border border-zinc-200 dark:border-white/10 flex items-center justify-center font-mono text-xs font-bold text-zinc-900 dark:text-white shadow-sm">EF</div>
                                            <div>
                                                <div className="text-sm font-bold text-zinc-900 dark:text-white">EF-456-GH</div>
                                                <div className="text-xs text-zinc-500 font-medium tracking-wide">Renault Clio • Marie Martin</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Notifications & Facturation (Stacked) */}
                        <div className="grid gap-6">
                            {/* Notifications */}
                            <div className="relative group rounded-[32px] p-8 overflow-hidden bg-white dark:bg-[#111113] border border-zinc-200 dark:border-white/5 hover:border-indigo-500/30 dark:hover:border-indigo-500/30 transition-colors shadow-sm">
                                <div className="relative z-10 flex items-start gap-6">
                                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                                        <BellRing className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2 tracking-tight">
                                            Notifications temps réel
                                        </h3>
                                        <p className="text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                            Soyez alerté quand un stock est bas ou qu'un rendez-vous est pris en ligne.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Facturation en 1 clic */}
                            <div className="relative group rounded-[32px] p-8 overflow-hidden bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-[40px] pointer-events-none" />
                                <div className="relative z-10 flex items-start gap-6">
                                    <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0 text-white">
                                        <Zap className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white mb-2 tracking-tight">
                                            Facturation en 1 clic
                                        </h3>
                                        <p className="text-base text-indigo-100/90 leading-relaxed">
                                            Transformez un devis en facture et envoyez-le par email directement depuis l'application.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════
          DATA VISUALIZATION SECTION
      ═══════════════════════════════════════ */}
            <section className="px-5 sm:px-8 lg:px-12 py-32 bg-white dark:bg-black border-y border-zinc-200 dark:border-white/10">
                <div className="max-w-[1400px] mx-auto grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-white/10 mb-6">
                            <BarChart3 className="w-4 h-4 text-zinc-900 dark:text-white" />
                            <span className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white">Analytiques Incluses</span>
                        </div>
                        <h2 className="text-4xl sm:text-5xl font-bold text-zinc-900 dark:text-white tracking-tight mb-6">
                            Ne devinez plus. <br />
                            Pilotez avec des <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-indigo-700 dark:from-indigo-400 dark:to-indigo-600">données.</span>
                        </h2>
                        <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-8 leading-relaxed max-w-xl">
                            Suivez l'évolution de votre chiffre d'affaires, le nombre de véhicules réparés et identifiez vos meilleures périodes. Les graphiques sont générés automatiquement depuis vos factures.
                        </p>
                        <ul className="space-y-4 mb-10">
                            {['CA mensuel et annuel en temps réel', 'Export facile pour votre comptable', 'Analyse du temps moyen par réparation'].map((item, i) => (
                                <li key={i} className="flex items-center gap-3 text-zinc-700 dark:text-zinc-300 font-medium">
                                    <div className="w-6 h-6 rounded-full bg-zinc-100 dark:bg-white/10 flex items-center justify-center flex-shrink-0">
                                        <Check className="w-3.5 h-3.5 text-zinc-900 dark:text-white" />
                                    </div>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="w-full aspect-video sm:aspect-square lg:aspect-video bg-[#fafafa] dark:bg-[#111113] rounded-[32px] p-6 sm:p-8 border border-zinc-200 dark:border-white/10 shadow-xl relative">
                        <div className="mb-6 flex justify-between items-end">
                            <div>
                                <p className="text-sm font-semibold text-zinc-500 uppercase tracking-widest mb-1">Revenus 2026</p>
                                <div className="flex items-baseline gap-2">
                                    <p className="text-3xl font-bold text-zinc-900 dark:text-white">310 000 €</p>
                                    <p className="text-sm font-medium text-emerald-500">+12%</p>
                                </div>
                            </div>
                        </div>
                        <div className="h-[200px] sm:h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={mockChartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4} />
                                            <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#52525b" strokeOpacity={0.2} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#71717A', fontSize: 12 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#71717A', fontSize: 12 }} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#18181B', borderRadius: '12px', border: 'none', color: '#fff', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }}
                                        itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                                        labelStyle={{ color: '#A1A1AA', marginBottom: '4px' }}
                                    />
                                    <Area type="monotone" dataKey="revenue" stroke="#6366F1" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════
          PREMIUM PRICING — Ultra sleek dark card
      ═══════════════════════════════════════ */}
            <section id="pricing" className="px-5 sm:px-8 lg:px-12 py-32 bg-[#fafafa] dark:bg-[#0a0a0b]">
                <div className="max-w-[1400px] mx-auto">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl sm:text-6xl font-bold text-zinc-900 dark:text-white tracking-tight mb-6">
                            Simple. Transparent.
                        </h2>
                        <p className="text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto font-medium">
                            Un tarif unique pour débloquer toute la puissance du logiciel.
                        </p>
                    </div>

                    <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-8 items-center">

                        <div className="p-10 lg:p-12 rounded-[32px] bg-white dark:bg-transparent border border-zinc-200 dark:border-white/10 lg:h-[90%] flex flex-col justify-between hidden lg:flex shadow-sm">
                            <div>
                                <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">Phase d'essai</h3>
                                <p className="text-zinc-500 font-medium mb-8">Pour les créateurs d'entreprise.</p>
                                <div className="text-5xl font-extrabold text-zinc-900 dark:text-white mb-10">0€ <span className="text-lg text-zinc-500 font-medium">/ à vie</span></div>

                                <ul className="space-y-5">
                                    {['Jusqu\'à 5 clients', 'Jusqu\'à 5 véhicules', 'Outils de facturation de base', 'Sans durée limitée'].map((feat, i) => (
                                        <li key={i} className="flex items-center gap-3 text-zinc-600 dark:text-zinc-400 font-medium">
                                            <div className="w-1.5 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                                            {feat}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <Link href="/inscription" className="mt-12 w-full h-14 rounded-2xl border border-zinc-200 dark:border-white/10 flex items-center justify-center font-semibold text-zinc-900 dark:text-white hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors">
                                Commencer gratuitement
                            </Link>
                        </div>

                        <div className="relative group p-[1px] rounded-[32px] overflow-hidden lg:scale-105 z-10">
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-indigo-800 to-black dark:from-indigo-400 dark:via-indigo-900/30 dark:to-transparent opacity-100" />

                            <div className="relative h-full bg-[#0a0a0b] rounded-[31px] p-10 lg:p-14 flex flex-col">
                                <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none" />

                                <div className="flex justify-between items-start mb-8 relative z-10">
                                    <div>
                                        <h3 className="text-3xl font-bold text-white tracking-tight mb-2">Pro Illimité</h3>
                                        <p className="text-indigo-200/60 font-medium text-lg">La suite complète pour votre garage.</p>
                                    </div>
                                    <div className="px-3 py-1 bg-indigo-500 text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-lg shadow-indigo-500/30">
                                        Recommandé
                                    </div>
                                </div>

                                <div className="flex items-baseline gap-2 mb-12 relative z-10">
                                    <span className="text-6xl sm:text-7xl font-extrabold text-white tracking-tighter">59,99€</span>
                                    <span className="text-indigo-200/50 font-medium text-lg">HT / mois</span>
                                </div>

                                <ul className="space-y-6 mb-12 flex-1 relative z-10">
                                    {[
                                        'Clients et véhicules illimités',
                                        'Recherche par immatriculation',
                                        'Facturation & Devis illimités',
                                        'Gestion de stock avancée',
                                        'Analytiques et tableaux de bord',
                                        'Support client prioritaire 7j/7'
                                    ].map((feat, i) => (
                                        <li key={i} className="flex items-center gap-4 text-zinc-300 text-lg font-medium">
                                            <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
                                                <Check className="w-3.5 h-3.5 text-indigo-400" />
                                            </div>
                                            {feat}
                                        </li>
                                    ))}
                                </ul>

                                <button
                                    onClick={() => setCheckoutOpen(true)}
                                    className="w-full h-16 bg-white hover:bg-zinc-200 text-black text-lg font-bold rounded-2xl flex items-center justify-center gap-3 transition-transform active:scale-[0.98] relative z-10"
                                >
                                    S'abonner maintenant
                                    <ArrowRight className="w-5 h-5" />
                                </button>
                                <p className="text-center text-zinc-500 mt-6 text-sm font-medium relative z-10">
                                    Sans aucun engagement. Résiliable en un clic.
                                </p>
                            </div>
                        </div>

                    </div>
                </div>
            </section >

            {/* ═══════════════════════════════════════
          FAQ SECTION
      ═══════════════════════════════════════ */}
            <section id="faq" className="px-5 sm:px-8 lg:px-12 py-32 bg-white dark:bg-black border-y border-zinc-200 dark:border-white/10">
                <div className="max-w-[1400px] mx-auto">
                    <div className="mb-16 text-center">
                        <h2 className="text-4xl sm:text-5xl font-bold text-zinc-900 dark:text-white tracking-tight mb-6">
                            Questions fréquentes
                        </h2>
                    </div>
                    <div className="max-w-3xl mx-auto">
                        {faqs.map((faq, i) => (
                            <FaqItem key={i} q={faq.q} a={faq.a} />
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════
          FOOTER — Ultra Clean
      ═══════════════════════════════════════ */}
            <footer className="bg-white dark:bg-[#0a0a0b]">
                <div className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-12 py-16">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="flex items-center">
                            <span className="text-2xl font-black tracking-tighter text-zinc-900 dark:text-white">
                                Garage<span className="text-zinc-400">Pro.</span>
                            </span>
                        </div>

                        <div className="flex flex-wrap items-center justify-center gap-8 font-medium text-sm text-zinc-500 dark:text-zinc-400">
                            <a href="#" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Fonctionnalités</a>
                            <a href="#pricing" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Tarifs</a>
                            <a href="#" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Mentions légales</a>
                            <a href="mailto:contact@garagepro.fr" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Contact</a>
                        </div>

                        <p className="text-sm font-medium text-zinc-400 dark:text-zinc-600">
                            © {new Date().getFullYear()} Tous droits réservés.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    )
}
