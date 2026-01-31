"use client"

import Link from "next/link"
import Image from "next/image"
import {
  CheckCircle2,
  ArrowRight,
  Star,
  Shield,
  ChevronRight,
  Menu,
  X,
  Loader2,
  CreditCard,
  Search,
  Car
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { BrandLogo } from "@/components/ui/brand-logo"
import { ThemeToggleButton } from "@/components/ui/theme-toggle-button"

const features = [
  { title: "Gestion clients", description: "Centralisez toutes les informations de vos clients et leur historique." },
  { title: "Parc automobile", description: "Recherche par plaque ou VIN, infos véhicule automatiques." },
  { title: "Suivi réparations", description: "Suivez l'avancement des interventions en temps réel." },
  { title: "Devis & Factures", description: "Documents professionnels conformes en quelques clics." },
  { title: "Agenda intégré", description: "Planifiez vos RDV et envoyez des rappels automatiques." },
  { title: "Gestion de stock", description: "Gérez votre inventaire avec alertes de stock bas." },
  { title: "Analytiques", description: "Suivez votre CA et vos performances en temps réel." },
  { title: "Communications", description: "SMS et emails automatisés pour vos clients." },
]

const benefitsPro = [
  "Clients illimités",
  "Véhicules illimités",
  "Factures et devis illimités",
  "Mises à jour incluses",
  "Support prioritaire",
  "Exports Excel et PDF",
  "Hébergement en France",
  "Conforme RGPD",
]

const benefitsDemo = [
  "5 clients maximum",
  "5 véhicules maximum",
  "Toutes les fonctionnalités",
  "Sans carte bancaire",
]

const testimonials = [
  { name: "Pierre M.", garage: "Lyon", quote: "J'ai divisé par 3 le temps passé sur l'administratif." },
  { name: "Sophie D.", garage: "Paris", quote: "Interface intuitive, adoptée en moins d'une journée." },
  { name: "Marc L.", garage: "Bordeaux", quote: "Le rapport qualité/prix est imbattable." },
]

const faqs = [
  { q: "Y a-t-il des frais cachés ?", a: "Non. 59,99€ HT/mois, point final. Pas de frais de mise en service, pas de frais de résiliation. Annulez quand vous voulez." },
  { q: "Comment fonctionne la démo ?", a: "Accès à toutes les fonctionnalités, limité à 5 clients et 5 véhicules. Parfait pour tester avant de s'abonner." },
  { q: "Puis-je annuler quand je veux ?", a: "Oui, sans engagement. Annulation en un clic depuis votre espace." },
  { q: "Mes données sont-elles sécurisées ?", a: "Hébergement en France, conforme RGPD, sauvegardes quotidiennes." },
  { q: "Combien d'utilisateurs ?", a: "Illimité. Ajoutez autant de collaborateurs que vous voulez sans surcoût." },
]

// Composant Modal Checkout
function CheckoutModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Pour l'instant, rediriger vers l'inscription
      // Le paiement se fera après la création du compte
      window.location.href = `/inscription`
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue')
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="bg-zinc-900 px-6 py-5 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-400">Abonnement Pro</p>
                <p className="text-2xl font-bold">59,99€ <span className="text-sm font-normal text-zinc-400">HT/mois</span></p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-medium rounded">
                Accès complet
              </span>
              <span className="text-sm text-zinc-400">59,99€/mois</span>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <form onSubmit={handleCheckout}>
              <p className="text-sm text-zinc-600 mb-4">
                Entrez votre email pour vous inscrire
              </p>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                  {error}
                </div>
              )}

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vous@exemple.fr"
                required
                className="w-full h-12 px-4 border border-zinc-300 rounded-xl text-[15px] mb-4 focus:outline-none focus:ring-2 focus:ring-zinc-900"
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-400 text-white text-[15px] font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <Shield className="h-5 w-5" />
                    Commencer gratuitement
                  </>
                )}
              </button>

              <p className="text-xs text-zinc-400 text-center mt-4">
                Paiement sécurisé par Stripe • Sans engagement, résiliable à tout moment
              </p>
            </form>

            {/* Features */}
            <div className="mt-6 pt-6 border-t border-zinc-100">
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-3">Inclus :</p>
              <div className="grid grid-cols-2 gap-2">
                {['Clients illimités', 'Véhicules illimités', 'Support prioritaire', 'Sans engagement'].map((f) => (
                  <div key={f} className="flex items-center gap-2 text-[13px] text-zinc-600">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                    {f}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default function HomePage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [plate, setPlate] = useState("")
  const [lookupLoading, setLookupLoading] = useState(false)
  const [lookupError, setLookupError] = useState<string | null>(null)
  const [lookupResult, setLookupResult] = useState<any>(null)

  const openCheckout = () => {
    setCheckoutOpen(true)
  }

  const handlePlateLookup = async (e: React.FormEvent) => {
    e.preventDefault()
    const cleanPlate = plate.trim()
    if (!cleanPlate || cleanPlate.length < 5) return

    setLookupLoading(true)
    setLookupError(null)
    setLookupResult(null)

    try {
      const formatted = cleanPlate.toUpperCase().replace(/\s+/g, '-')
      const response = await fetch(`/api/vehicle-lookup?type=plate&value=${encodeURIComponent(formatted)}`)
      const result = await response.json()
      if (!result.success || !result.data) {
        throw new Error(result.error || "Véhicule introuvable")
      }
      setLookupResult(result.data)
    } catch (err: any) {
      setLookupError(err.message || "Une erreur est survenue")
    } finally {
      setLookupLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Modal Checkout */}
      <CheckoutModal
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
      />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[var(--bg-primary)]/95 backdrop-blur-sm border-b border-[var(--border-light)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-20 sm:h-22 md:h-24 flex items-center justify-between">
          <Link href="/" className="flex items-center -ml-4 mt-3">
            <img
              src="/GaragePROlogo.png"
              alt="GaragePro"
              width="300"
              height="75"
              className="w-[180px] sm:w-[220px] md:w-[260px] h-auto logo-invert"
            />
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-[14px] text-zinc-600 hover:text-zinc-900">Fonctionnalités</a>
            <a href="#pricing" className="text-[14px] text-zinc-600 hover:text-zinc-900">Tarifs</a>
            <a href="#faq" className="text-[14px] text-zinc-600 hover:text-zinc-900">FAQ</a>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <ThemeToggleButton />
            <Link href="/login" className="text-[14px] font-medium text-zinc-600 hover:text-zinc-900 px-3 py-2">
              Connexion
            </Link>
            <Link href="/inscription" className="h-9 px-4 bg-zinc-900 text-white text-[14px] font-medium rounded-lg flex items-center transition-colors hover:bg-zinc-800">
              Essai gratuit
            </Link>
          </div>

          <button
            className="md:hidden p-2 -mr-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[var(--bg-primary)] border-t border-[var(--border-light)] px-4 py-4 space-y-3">
            <a href="#features" className="block text-[15px] text-zinc-700 py-2" onClick={() => setMobileMenuOpen(false)}>Fonctionnalités</a>
            <a href="#pricing" className="block text-[15px] text-zinc-700 py-2" onClick={() => setMobileMenuOpen(false)}>Tarifs</a>
            <a href="#faq" className="block text-[15px] text-zinc-700 py-2" onClick={() => setMobileMenuOpen(false)}>FAQ</a>
            <div className="pt-3 border-t border-zinc-100 space-y-2">
              <ThemeToggleButton className="w-full justify-center" />
              <Link href="/login" className="block w-full h-11 bg-zinc-100 text-zinc-900 text-[15px] font-medium rounded-lg text-center leading-[44px]">
                Connexion
              </Link>
              <Link href="/inscription" className="block w-full h-11 bg-zinc-900 text-white text-[15px] font-medium rounded-lg text-center leading-[44px]">
                Essai gratuit
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="pt-28 sm:pt-32 md:pt-36 pb-16 sm:pb-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-10 items-center">
          <div className="text-center lg:text-left">
            <p className="inline-block px-3 py-1.5 bg-zinc-100 rounded-full text-zinc-700 text-[13px] font-medium mb-6">
              Version gratuite • 5 clients & 5 véhicules
            </p>

            <h1 className="text-[32px] sm:text-[44px] lg:text-[52px] font-bold text-zinc-900 leading-[1.15] tracking-tight mb-5">
              Le logiciel de gestion pour votre garage
            </h1>

            <p className="text-[16px] sm:text-[18px] text-zinc-600 leading-relaxed max-w-2xl mx-auto lg:mx-0 mb-8">
              Gérez vos clients, véhicules, réparations et factures depuis une interface simple. Gagnez du temps au quotidien.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 mb-8">
              <Link href="/inscription" className="w-full sm:w-auto h-12 px-6 bg-zinc-900 text-white text-[15px] font-semibold rounded-lg flex items-center justify-center gap-2 hover:bg-zinc-800 transition-colors">
                Démarrer l'essai gratuit
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a href="#pricing" className="w-full sm:w-auto h-12 px-6 bg-zinc-100 text-zinc-900 text-[15px] font-semibold rounded-lg flex items-center justify-center gap-2 hover:bg-zinc-200 transition-colors">
                Voir les tarifs
              </a>
            </div>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-2 text-[13px] text-zinc-500">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                Sans engagement
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                Sans frais cachés
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                Support inclus
              </span>
            </div>
          </div>

          {/* Plate Lookup Demo */}
          <div className="bg-white rounded-xl sm:rounded-2xl border border-zinc-200 p-4 sm:p-6 shadow-sm sm:shadow-lg">
            <p className="text-zinc-900 font-semibold text-center mb-1">Testez la détection</p>
            <p className="text-zinc-500 text-xs sm:text-sm text-center mb-5">Entrez une immatriculation française</p>

            <form onSubmit={handlePlateLookup} className="space-y-3">
              {/* French License Plate - forced light colors */}
              <div 
                className="flex items-stretch h-12 sm:h-14 rounded overflow-hidden border-2"
                style={{ backgroundColor: "#ffffff", borderColor: "#27272a" }}
              >
                {/* Left EU band */}
                <div className="w-8 sm:w-10 flex flex-col items-center justify-center shrink-0" style={{ backgroundColor: "#003399" }}>
                  <svg className="w-3 sm:w-4 h-2.5 sm:h-3 mb-0.5" viewBox="0 0 16 12">
                    <circle cx="8" cy="2" r="0.8" fill="#FFCC00"/>
                    <circle cx="5" cy="3" r="0.8" fill="#FFCC00"/>
                    <circle cx="11" cy="3" r="0.8" fill="#FFCC00"/>
                    <circle cx="4" cy="6" r="0.8" fill="#FFCC00"/>
                    <circle cx="12" cy="6" r="0.8" fill="#FFCC00"/>
                    <circle cx="5" cy="9" r="0.8" fill="#FFCC00"/>
                    <circle cx="11" cy="9" r="0.8" fill="#FFCC00"/>
                    <circle cx="8" cy="10" r="0.8" fill="#FFCC00"/>
                  </svg>
                  <span className="text-[9px] sm:text-[11px] font-bold" style={{ color: "#ffffff" }}>F</span>
                </div>
                {/* Plate input */}
                <input
                  type="text"
                  value={plate}
                  onChange={(e) => setPlate(e.target.value.toUpperCase())}
                  placeholder="AB-123-CD"
                  maxLength={9}
                  className="flex-1 min-w-0 text-base sm:text-xl font-bold tracking-wider text-center outline-none px-2"
                  style={{ backgroundColor: "#ffffff", color: "#18181b" }}
                />
                {/* Right region band */}
                <div className="w-8 sm:w-10 flex flex-col items-center justify-center shrink-0" style={{ backgroundColor: "#003399" }}>
                  <span className="text-[8px] sm:text-[10px] font-bold mb-0.5" style={{ color: "#ffffff" }}>IDF</span>
                  {/* French flag - vertical stripes */}
                  <div className="w-3 sm:w-4 h-2 sm:h-3 rounded-[1px] overflow-hidden flex flex-row">
                    <div className="flex-1" style={{ backgroundColor: "#002395" }}></div>
                    <div className="flex-1" style={{ backgroundColor: "#ffffff" }}></div>
                    <div className="flex-1" style={{ backgroundColor: "#ED2939" }}></div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={lookupLoading}
                className="w-full h-10 sm:h-11 bg-zinc-900 text-white text-sm font-medium rounded-lg flex items-center justify-center gap-2 hover:bg-zinc-800 transition-colors"
              >
                {lookupLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                Rechercher
              </button>

              {lookupError && (
                <p className="text-xs sm:text-sm text-red-600 text-center">{lookupError}</p>
              )}

              {lookupResult && (
                <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 sm:p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-white border border-zinc-200 flex items-center justify-center shrink-0">
                      <BrandLogo brand={lookupResult.make || ""} size={24} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-zinc-900 text-sm sm:text-base font-semibold truncate">
                        {lookupResult.make} {lookupResult.model}
                      </p>
                      <p className="text-zinc-500 text-xs sm:text-sm">
                        {lookupResult.year} • {lookupResult.fuel || "—"}
                      </p>
                    </div>
                  </div>
                  {lookupResult.vin && (
                    <p className="text-zinc-400 text-[10px] sm:text-xs font-mono mt-2 sm:mt-3 truncate">VIN {lookupResult.vin}</p>
                  )}
                  <Link
                    href="/inscription"
                    className="mt-3 w-full h-9 sm:h-10 bg-zinc-900 hover:bg-zinc-800 text-white text-xs sm:text-sm font-medium rounded-lg flex items-center justify-center gap-2 transition-colors"
                  >
                    Créer un devis
                    <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </Link>
                </div>
              )}
            </form>

            <p className="text-zinc-400 text-[10px] sm:text-xs text-center mt-4">
              Données SIV en temps réel
            </p>
          </div>
        </div>
      </section>

      {/* Social Proof Bar */}
      <section className="py-8 px-4 sm:px-6 border-y border-zinc-100 bg-zinc-50">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-center gap-6 sm:gap-12">
          <div className="text-center">
            <p className="text-[28px] sm:text-[32px] font-bold text-zinc-900">500+</p>
            <p className="text-[13px] text-zinc-500">Garages équipés</p>
          </div>
          <div className="hidden sm:block w-px h-10 bg-zinc-200"></div>
          <div className="text-center">
            <p className="text-[28px] sm:text-[32px] font-bold text-zinc-900">50 000+</p>
            <p className="text-[13px] text-zinc-500">Véhicules gérés</p>
          </div>
          <div className="hidden sm:block w-px h-10 bg-zinc-200"></div>
          <div className="text-center">
            <p className="text-[28px] sm:text-[32px] font-bold text-zinc-900">4.9/5</p>
            <p className="text-[13px] text-zinc-500">Satisfaction client</p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-[28px] sm:text-[36px] font-bold text-zinc-900 mb-3">Tout ce dont vous avez besoin</h2>
            <p className="text-[15px] sm:text-[17px] text-zinc-600 max-w-xl mx-auto">
              Une suite complète pour gérer votre garage de A à Z.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="p-5 sm:p-6 bg-zinc-50 hover:bg-zinc-100 rounded-xl transition-colors"
              >
                <h3 className="text-[15px] font-semibold text-zinc-900 mb-2">{feature.title}</h3>
                <p className="text-[14px] text-zinc-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-16 sm:py-24 px-4 sm:px-6 bg-zinc-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10 sm:mb-12">
            <h2 className="text-[28px] sm:text-[36px] font-bold text-zinc-900 mb-3">Tarifs simples</h2>
            <p className="text-[15px] sm:text-[17px] text-zinc-600">
              Pas de frais cachés. Sans engagement.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
            {/* Demo */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-zinc-200">
              <div className="mb-5">
                <h3 className="text-[18px] font-bold text-zinc-900 mb-1">Démo</h3>
                <p className="text-[14px] text-zinc-500">Pour tester</p>
              </div>

              <div className="flex items-baseline gap-1 mb-5">
                <span className="text-[40px] font-bold text-zinc-900">0€</span>
                <span className="text-[14px] text-zinc-400">gratuit</span>
              </div>

              <div className="space-y-3 mb-6">
                {benefitsDemo.map((b) => (
                  <div key={b} className="flex items-center gap-2.5 text-[14px] text-zinc-700">
                    <CheckCircle2 className="h-4 w-4 text-zinc-400 flex-shrink-0" />
                    {b}
                  </div>
                ))}
              </div>

              <Link href="/login" className="block w-full h-11 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 text-[14px] font-semibold rounded-lg text-center leading-[44px] transition-colors">
                Commencer gratuitement
              </Link>
            </div>

            {/* Pro */}
            <div className="bg-zinc-900 rounded-2xl p-6 sm:p-8 relative">
              <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
                <span className="px-2.5 py-1 bg-emerald-500 text-white text-[11px] font-bold rounded-full">
                  POPULAIRE
                </span>
              </div>

              <div className="mb-5">
                <h3 className="text-[18px] font-bold text-white mb-1">Pro</h3>
                <p className="text-[14px] text-zinc-400">Accès complet</p>
              </div>

              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-[40px] font-bold text-white">59,99€</span>
                <span className="text-[14px] text-zinc-400">HT/mois</span>
              </div>

              <p className="text-[13px] text-emerald-400 mb-5">Sans engagement • Sans frais cachés</p>

              <div className="space-y-3 mb-6">
                {benefitsPro.map((b) => (
                  <div key={b} className="flex items-center gap-2.5 text-[14px] text-white/90">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                    {b}
                  </div>
                ))}
              </div>

              <button
                onClick={openCheckout}
                className="w-full h-11 bg-white hover:bg-zinc-100 text-zinc-900 text-[14px] font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                <Shield className="h-4 w-4" />
                S'abonner maintenant
              </button>

              <p className="text-[11px] text-zinc-500 mt-3 text-center">Paiement sécurisé Stripe • Sans engagement</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 sm:mb-12">
            <h2 className="text-[28px] sm:text-[36px] font-bold text-zinc-900 mb-3">Ils nous font confiance</h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-4 sm:gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-zinc-50 rounded-xl p-5 sm:p-6">
                <div className="flex gap-0.5 mb-3">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="h-4 w-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-[14px] text-zinc-700 leading-relaxed mb-4">"{t.quote}"</p>
                <p className="text-[13px] font-medium text-zinc-900">{t.name} <span className="text-zinc-400 font-normal">• {t.garage}</span></p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-16 sm:py-24 px-4 sm:px-6 bg-zinc-50">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10 sm:mb-12">
            <h2 className="text-[28px] sm:text-[36px] font-bold text-zinc-900 mb-3">Questions fréquentes</h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <details key={i} className="group bg-white rounded-xl border border-zinc-200">
                <summary className="flex items-center justify-between p-4 sm:p-5 cursor-pointer list-none">
                  <span className="text-[14px] sm:text-[15px] font-medium text-zinc-900 pr-4">{faq.q}</span>
                  <ChevronRight className="h-4 w-4 text-zinc-400 transition-transform group-open:rotate-90 flex-shrink-0" />
                </summary>
                <div className="px-4 sm:px-5 pb-4 sm:pb-5 text-[14px] text-zinc-600 leading-relaxed">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 bg-zinc-900">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-[28px] sm:text-[36px] font-bold text-white mb-4">
            Prêt à simplifier votre gestion ?
          </h2>
          <p className="text-[15px] sm:text-[17px] text-zinc-400 mb-8">
            Commencez gratuitement avec 5 clients et 5 véhicules. Passez au Pro quand vous voulez.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/inscription" className="w-full sm:w-auto h-12 px-8 bg-white text-zinc-900 text-[15px] font-semibold rounded-lg flex items-center justify-center gap-2 hover:bg-zinc-100 transition-colors">
              Démarrer l'essai gratuit
              <ArrowRight className="h-4 w-4" />
            </Link>
            <button
              onClick={openCheckout}
              className="w-full sm:w-auto h-12 px-8 bg-zinc-800 text-white text-[15px] font-semibold rounded-lg flex items-center justify-center gap-2 border border-zinc-700 hover:bg-zinc-700 transition-colors"
            >
              S'abonner au Pro
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 sm:py-10 px-4 sm:px-6 border-t border-zinc-100">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center">
              <img
                src="/GaragePROlogo.png"
                alt="GaragePro"
                width="240"
                height="60"
                className="w-[160px] sm:w-[200px] h-auto logo-invert"
              />
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-[13px] text-zinc-500">
              <a href="#" className="hover:text-zinc-900">Mentions légales</a>
              <a href="#" className="hover:text-zinc-900">CGV</a>
              <a href="#" className="hover:text-zinc-900">Confidentialité</a>
              <a href="mailto:contact@garagepro.fr" className="hover:text-zinc-900">Contact</a>
            </div>

            <p className="text-[12px] text-zinc-400">© 2024 GaragePro</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
