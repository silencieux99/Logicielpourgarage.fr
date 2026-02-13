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
  Check
} from "lucide-react"
import { useState } from "react"
import { LandingHeader } from "@/components/layout/LandingHeader"

/* ─── DATA ──────────────────────────────────────────────────────── */

const features = [
  { icon: Users, title: "Gestion clients", description: "Centralisez vos fiches clients, historiques et contacts en un seul endroit." },
  { icon: Car, title: "Parc automobile", description: "Recherche par plaque ou VIN avec détection automatique du véhicule." },
  { icon: Wrench, title: "Suivi réparations", description: "Suivez chaque intervention du diagnostic à la livraison." },
  { icon: FileText, title: "Devis & Factures", description: "Créez des documents conformes et professionnels en quelques clics." },
  { icon: CalendarDays, title: "Agenda intégré", description: "Planifiez vos rendez-vous et envoyez des rappels automatiques." },
  { icon: Package, title: "Gestion de stock", description: "Inventaire en temps réel avec alertes de stock bas." },
  { icon: BarChart3, title: "Analytiques", description: "Tableaux de bord pour suivre votre CA et vos KPIs." },
  { icon: Mail, title: "Communications", description: "Emails et SMS automatisés pour fidéliser vos clients." },
]

const steps = [
  { num: "01", title: "Créez votre compte", description: "Inscription en 30 secondes. Aucune carte bancaire requise pour démarrer." },
  { num: "02", title: "Configurez votre garage", description: "Ajoutez vos informations, personnalisez vos documents et tarifs." },
  { num: "03", title: "Gérez tout au même endroit", description: "Clients, véhicules, réparations, factures — tout est centralisé." },
]

const testimonials = [
  { name: "Pierre M.", garage: "Auto Service Lyon", quote: "J'ai divisé par 3 le temps passé sur l'administratif. L'interface est tellement intuitive que mes mécaniciens l'ont adoptée en une journée." },
  { name: "Sophie D.", garage: "Garage Central Paris", quote: "Le meilleur investissement qu'on ait fait cette année. On ne pourrait plus s'en passer pour la gestion quotidienne." },
  { name: "Marc L.", garage: "Atelier Bordeaux Sud", quote: "Le rapport qualité-prix est imbattable. On a enfin un outil moderne qui correspond à nos besoins réels." },
]

const faqs = [
  { q: "Y a-t-il des frais cachés ?", a: "Non. 59,99€ HT/mois, point final. Pas de frais de mise en service, pas de frais de résiliation. Annulez quand vous voulez." },
  { q: "Comment fonctionne la version gratuite ?", a: "Accès à toutes les fonctionnalités, limité à 5 clients et 5 véhicules. Parfait pour tester avant de s'engager." },
  { q: "Puis-je annuler quand je veux ?", a: "Oui, sans engagement. Annulation en un clic depuis votre espace, effective immédiatement." },
  { q: "Mes données sont-elles sécurisées ?", a: "Hébergement en France, conforme RGPD, chiffrement des données, sauvegardes quotidiennes automatiques." },
  { q: "Combien d'utilisateurs par garage ?", a: "Illimité. Ajoutez autant de collaborateurs que nécessaire sans surcoût." },
  { q: "Faut-il installer un logiciel ?", a: "Non. GaragePro fonctionne 100% dans votre navigateur, sur ordinateur, tablette ou téléphone." },
]

const pricingFeatures = [
  { name: "Clients", demo: "5 max", pro: "Illimités" },
  { name: "Véhicules", demo: "5 max", pro: "Illimités" },
  { name: "Devis & Factures", demo: "Illimités", pro: "Illimités" },
  { name: "Recherche par plaque", demo: true, pro: true },
  { name: "Agenda & planning", demo: true, pro: true },
  { name: "Gestion de stock", demo: true, pro: true },
  { name: "Analytiques & stats", demo: false, pro: true },
  { name: "Export PDF & Excel", demo: false, pro: true },
  { name: "Support prioritaire", demo: false, pro: true },
  { name: "SMS & emails auto", demo: false, pro: true },
]

/* ─── CHECKOUT MODAL ────────────────────────────────────────────── */

function CheckoutModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-[var(--bg-primary)] rounded-3xl w-full max-w-lg overflow-hidden border border-[var(--border-default)]"
          onClick={(e) => e.stopPropagation()}
          style={{ boxShadow: '0 25px 60px -12px rgba(0,0,0,0.2)' }}
        >
          <div className="bg-zinc-900 px-8 py-7 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-base text-zinc-400 mb-1">Abonnement Pro</p>
                <p className="text-3xl font-bold">59,99€ <span className="text-base font-normal text-zinc-400">HT/mois</span></p>
              </div>
              <button onClick={onClose} className="p-3 hover:bg-white/10 rounded-xl transition-colors">
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>
          <div className="p-8">
            <form onSubmit={handleCheckout}>
              <p className="text-base text-[var(--text-secondary)] mb-5">
                Entrez votre email pour commencer
              </p>
              {error && (
                <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl text-base text-red-600">
                  {error}
                </div>
              )}
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vous@exemple.fr"
                required
                className="w-full h-14 px-5 border border-[var(--border-default)] rounded-2xl text-base mb-5 focus:outline-none focus:ring-2 focus:ring-zinc-900 bg-[var(--bg-secondary)]"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full h-14 bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-400 text-white text-base font-semibold rounded-2xl flex items-center justify-center gap-2.5 transition-colors"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <Shield className="h-5 w-5" />
                    Commencer maintenant
                  </>
                )}
              </button>
              <p className="text-sm text-[var(--text-muted)] text-center mt-5">
                Paiement sécurisé par Stripe · Sans engagement
              </p>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}

/* ─── FAQ ITEM ──────────────────────────────────────────────────── */

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border-b border-[var(--border-light)]">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-7 sm:py-8 text-left group"
      >
        <span className="text-lg sm:text-xl font-medium text-[var(--text-primary)] pr-8 group-hover:text-[var(--text-secondary)] transition-colors">
          {q}
        </span>
        <ChevronRight
          className={`h-5 w-5 sm:h-6 sm:w-6 text-[var(--text-muted)] flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-90' : ''}`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-out ${open ? 'max-h-48 pb-7 sm:pb-8' : 'max-h-0'}`}
      >
        <p className="text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed pr-12">
          {a}
        </p>
      </div>
    </div>
  )
}

/* ─── HOME PAGE ─────────────────────────────────────────────────── */

export default function HomePage() {
  const [checkoutOpen, setCheckoutOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <CheckoutModal isOpen={checkoutOpen} onClose={() => setCheckoutOpen(false)} />
      <LandingHeader />

      {/* ═══════════════════════════════════════
          HERO — Full viewport impact
      ═══════════════════════════════════════ */}
      <section className="min-h-[90vh] sm:min-h-screen flex items-center justify-center px-5 sm:px-8 lg:px-12">
        <div className="w-full max-w-[1400px] mx-auto text-center py-20 sm:py-0">
          {/* Badge */}
          <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full border border-[var(--border-default)] bg-[var(--bg-secondary)] mb-10 sm:mb-12">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-sm sm:text-base font-medium text-[var(--text-secondary)]">
              Essai gratuit · Sans carte bancaire
            </span>
          </div>

          {/* Headline — MASSIVE */}
          <h1 className="landing-hero-title text-[var(--text-primary)] mb-8 sm:mb-10 max-w-5xl mx-auto">
            Le logiciel de gestion
            <br />
            <span className="text-[var(--text-muted)]">pour votre garage</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl lg:text-2xl text-[var(--text-secondary)] leading-relaxed max-w-3xl mx-auto mb-12 sm:mb-14">
            Clients, véhicules, réparations, devis et factures — simplifiez votre quotidien avec un outil pensé pour les pros de l'automobile.
          </p>

          {/* CTAs — BIG */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5 mb-14 sm:mb-16">
            <Link
              href="/inscription"
              className="w-full sm:w-auto h-14 sm:h-16 px-10 sm:px-14 bg-zinc-900 text-white text-base sm:text-lg font-semibold rounded-2xl flex items-center justify-center gap-3 hover:bg-zinc-800 transition-all duration-200 hover:shadow-xl active:scale-[0.98]"
            >
              Démarrer gratuitement
              <ArrowRight className="h-5 w-5" />
            </Link>
            <a
              href="#pricing"
              className="w-full sm:w-auto h-14 sm:h-16 px-10 sm:px-14 bg-[var(--bg-secondary)] text-[var(--text-primary)] text-base sm:text-lg font-semibold rounded-2xl flex items-center justify-center gap-2 border border-[var(--border-default)] hover:border-[var(--border-strong)] transition-all duration-200 active:scale-[0.98]"
            >
              Voir les tarifs
            </a>
          </div>

          {/* Trust signals */}
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-sm sm:text-base text-[var(--text-tertiary)]">
            <span className="flex items-center gap-2.5">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              Sans engagement
            </span>
            <span className="flex items-center gap-2.5">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              Données hébergées en France
            </span>
            <span className="flex items-center gap-2.5">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              Support inclus
            </span>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          SOCIAL PROOF — Large numbers
      ═══════════════════════════════════════ */}
      <section className="border-y border-[var(--border-light)] bg-[var(--bg-secondary)]">
        <div className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-12 py-14 sm:py-20">
          <div className="grid grid-cols-3 gap-4 sm:gap-8">
            {[
              { value: "500+", label: "Garages équipés" },
              { value: "50 000+", label: "Véhicules gérés" },
              { value: "4.9/5", label: "Satisfaction client" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl sm:text-5xl lg:text-6xl font-bold text-[var(--text-primary)] tracking-tight leading-none">
                  {stat.value}
                </p>
                <p className="text-sm sm:text-base lg:text-lg text-[var(--text-tertiary)] mt-2 sm:mt-3">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          FEATURES — 2-column grid, big cards
      ═══════════════════════════════════════ */}
      <section id="features" className="px-5 sm:px-8 lg:px-12 py-28 sm:py-36 lg:py-44">
        <div className="max-w-[1400px] mx-auto">
          {/* Section header */}
          <div className="text-center mb-16 sm:mb-24">
            <p className="text-sm sm:text-base font-semibold text-[var(--text-muted)] uppercase tracking-[0.15em] mb-5">
              Fonctionnalités
            </p>
            <h2 className="landing-section-title text-[var(--text-primary)] mb-6">
              Tout ce dont vous avez besoin
            </h2>
            <p className="text-lg sm:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed">
              Une suite complète d'outils pour gérer votre garage de A à Z.
            </p>
          </div>

          {/* Grid — 2 cols mobile, 4 cols large */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <div
                  key={feature.title}
                  className="group p-6 sm:p-8 lg:p-10 rounded-2xl sm:rounded-3xl border border-[var(--border-light)] hover:border-[var(--border-default)] bg-[var(--bg-primary)] hover:bg-[var(--bg-secondary)] transition-all duration-300"
                >
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[var(--bg-secondary)] group-hover:bg-[var(--bg-tertiary)] flex items-center justify-center mb-5 sm:mb-6 transition-colors duration-300">
                    <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-[var(--text-tertiary)]" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-[var(--text-primary)] mb-2 sm:mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          HOW IT WORKS — 3 steps, big numbers
      ═══════════════════════════════════════ */}
      <section className="px-5 sm:px-8 lg:px-12 py-28 sm:py-36 lg:py-44 bg-[var(--bg-secondary)]">
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center mb-16 sm:mb-24">
            <p className="text-sm sm:text-base font-semibold text-[var(--text-muted)] uppercase tracking-[0.15em] mb-5">
              Comment ça marche
            </p>
            <h2 className="landing-section-title text-[var(--text-primary)]">
              Opérationnel en 5 minutes
            </h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-8 sm:gap-10 lg:gap-16 max-w-6xl mx-auto">
            {steps.map((step) => (
              <div key={step.num} className="text-center">
                <span className="inline-block text-6xl sm:text-7xl lg:text-8xl font-bold text-[var(--border-strong)] leading-none mb-6 sm:mb-8">
                  {step.num}
                </span>
                <h3 className="text-xl sm:text-2xl font-semibold text-[var(--text-primary)] mb-3 sm:mb-4">
                  {step.title}
                </h3>
                <p className="text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed max-w-xs mx-auto">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          PRICING — Totally redesigned comparison
      ═══════════════════════════════════════ */}
      <section id="pricing" className="px-5 sm:px-8 lg:px-12 py-28 sm:py-36 lg:py-44">
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center mb-16 sm:mb-24">
            <p className="text-sm sm:text-base font-semibold text-[var(--text-muted)] uppercase tracking-[0.15em] mb-5">
              Tarifs
            </p>
            <h2 className="landing-section-title text-[var(--text-primary)] mb-6">
              Un prix, zéro surprise
            </h2>
            <p className="text-lg sm:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto">
              Testez gratuitement ou passez directement au Pro. Sans engagement, sans frais cachés.
            </p>
          </div>

          {/* Cards side by side — NEW DESIGN */}
          <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-6 sm:gap-8">

            {/* DEMO CARD */}
            <div className="rounded-3xl border-2 border-[var(--border-default)] bg-[var(--bg-primary)] p-8 sm:p-10 lg:p-12 flex flex-col">
              <div className="flex items-center justify-between mb-8 sm:mb-10">
                <div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">Démo</h3>
                  <p className="text-base sm:text-lg text-[var(--text-tertiary)] mt-1">Pour découvrir</p>
                </div>
              </div>

              <div className="mb-10 sm:mb-12">
                <div className="flex items-end gap-2">
                  <span className="text-6xl sm:text-7xl font-extrabold text-[var(--text-primary)] tracking-tighter leading-none">0€</span>
                </div>
                <p className="text-base text-[var(--text-muted)] mt-2">Gratuit pour toujours</p>
              </div>

              <div className="space-y-5 mb-10 sm:mb-12 flex-1">
                <p className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider">Inclus :</p>
                <div className="flex items-center gap-3 text-base sm:text-lg text-[var(--text-secondary)]">
                  <Check className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                  5 clients maximum
                </div>
                <div className="flex items-center gap-3 text-base sm:text-lg text-[var(--text-secondary)]">
                  <Check className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                  5 véhicules maximum
                </div>
                <div className="flex items-center gap-3 text-base sm:text-lg text-[var(--text-secondary)]">
                  <Check className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                  Toutes les fonctionnalités
                </div>
                <div className="flex items-center gap-3 text-base sm:text-lg text-[var(--text-secondary)]">
                  <Check className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                  Sans carte bancaire
                </div>
              </div>

              <Link
                href="/inscription"
                className="w-full h-14 sm:h-16 bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] text-[var(--text-primary)] text-base sm:text-lg font-semibold rounded-2xl flex items-center justify-center transition-all duration-200 border border-[var(--border-default)] active:scale-[0.98]"
              >
                Commencer gratuitement
              </Link>
            </div>

            {/* PRO CARD — Highlighted */}
            <div className="rounded-3xl bg-zinc-900 p-8 sm:p-10 lg:p-12 flex flex-col relative overflow-hidden ring-2 ring-zinc-900">
              {/* Glow effect top */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-px bg-gradient-to-r from-transparent via-zinc-600 to-transparent" />

              <div className="flex items-center justify-between mb-8 sm:mb-10">
                <div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-white">Pro</h3>
                  <p className="text-base sm:text-lg text-zinc-400 mt-1">Accès complet</p>
                </div>
                <span className="px-4 py-2 bg-emerald-500 text-white text-xs sm:text-sm font-bold rounded-full uppercase tracking-wider">
                  Populaire
                </span>
              </div>

              <div className="mb-10 sm:mb-12">
                <div className="flex items-end gap-2">
                  <span className="text-6xl sm:text-7xl font-extrabold text-white tracking-tighter leading-none">59,99€</span>
                  <span className="text-lg sm:text-xl text-zinc-500 mb-2">/mois HT</span>
                </div>
                <p className="text-base text-emerald-400 mt-2">Sans engagement · Résiliable à tout moment</p>
              </div>

              <div className="space-y-5 mb-10 sm:mb-12 flex-1">
                <p className="text-sm font-semibold text-zinc-500 uppercase tracking-wider">Tout de Démo, plus :</p>
                <div className="flex items-center gap-3 text-base sm:text-lg text-white/90">
                  <Check className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                  Clients illimités
                </div>
                <div className="flex items-center gap-3 text-base sm:text-lg text-white/90">
                  <Check className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                  Véhicules illimités
                </div>
                <div className="flex items-center gap-3 text-base sm:text-lg text-white/90">
                  <Check className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                  Factures et devis illimités
                </div>
                <div className="flex items-center gap-3 text-base sm:text-lg text-white/90">
                  <Check className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                  Support prioritaire
                </div>
                <div className="flex items-center gap-3 text-base sm:text-lg text-white/90">
                  <Check className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                  Exports PDF & Excel
                </div>
                <div className="flex items-center gap-3 text-base sm:text-lg text-white/90">
                  <Check className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                  SMS & emails automatiques
                </div>
              </div>

              <button
                onClick={() => setCheckoutOpen(true)}
                className="w-full h-14 sm:h-16 bg-white hover:bg-zinc-100 text-zinc-900 text-base sm:text-lg font-semibold rounded-2xl flex items-center justify-center gap-3 transition-all duration-200 active:scale-[0.98]"
              >
                S'abonner maintenant
                <ArrowRight className="h-5 w-5" />
              </button>
              <p className="text-sm text-zinc-500 mt-4 text-center">
                Paiement sécurisé Stripe · Facture disponible
              </p>
            </div>
          </div>

          {/* Comparison table — desktop only */}
          <div className="hidden lg:block max-w-4xl mx-auto mt-20">
            <div className="rounded-2xl border border-[var(--border-default)] overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-[var(--bg-secondary)]">
                    <th className="text-left text-base font-semibold text-[var(--text-primary)] px-8 py-5">Fonctionnalité</th>
                    <th className="text-center text-base font-semibold text-[var(--text-primary)] px-8 py-5 w-40">Démo</th>
                    <th className="text-center text-base font-semibold text-[var(--text-primary)] px-8 py-5 w-40 bg-zinc-900 text-white">Pro</th>
                  </tr>
                </thead>
                <tbody>
                  {pricingFeatures.map((f, i) => (
                    <tr key={f.name} className={i % 2 === 0 ? 'bg-[var(--bg-primary)]' : 'bg-[var(--bg-secondary)]'}>
                      <td className="text-base text-[var(--text-secondary)] px-8 py-4">{f.name}</td>
                      <td className="text-center px-8 py-4">
                        {typeof f.demo === 'boolean' ? (
                          f.demo ? <Check className="h-5 w-5 text-emerald-500 mx-auto" /> : <span className="text-[var(--text-muted)]">—</span>
                        ) : (
                          <span className="text-base text-[var(--text-secondary)]">{f.demo}</span>
                        )}
                      </td>
                      <td className="text-center px-8 py-4 bg-zinc-900/5">
                        {typeof f.pro === 'boolean' ? (
                          f.pro ? <Check className="h-5 w-5 text-emerald-500 mx-auto" /> : <span className="text-[var(--text-muted)]">—</span>
                        ) : (
                          <span className="text-base font-medium text-[var(--text-primary)]">{f.pro}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          TESTIMONIALS — Big quote cards
      ═══════════════════════════════════════ */}
      <section className="px-5 sm:px-8 lg:px-12 py-28 sm:py-36 lg:py-44 bg-[var(--bg-secondary)]">
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center mb-16 sm:mb-24">
            <p className="text-sm sm:text-base font-semibold text-[var(--text-muted)] uppercase tracking-[0.15em] mb-5">
              Témoignages
            </p>
            <h2 className="landing-section-title text-[var(--text-primary)]">
              Ils nous font confiance
            </h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-5 sm:gap-6 lg:gap-8 max-w-6xl mx-auto">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="p-8 sm:p-10 rounded-3xl bg-[var(--bg-primary)] border border-[var(--border-light)]"
              >
                <div className="flex gap-1 mb-6">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="h-5 w-5 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed mb-8">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div>
                  <p className="text-base sm:text-lg font-semibold text-[var(--text-primary)]">{t.name}</p>
                  <p className="text-sm sm:text-base text-[var(--text-tertiary)]">{t.garage}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          FAQ — Wide accordion
      ═══════════════════════════════════════ */}
      <section id="faq" className="px-5 sm:px-8 lg:px-12 py-28 sm:py-36 lg:py-44">
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center mb-16 sm:mb-24">
            <p className="text-sm sm:text-base font-semibold text-[var(--text-muted)] uppercase tracking-[0.15em] mb-5">
              FAQ
            </p>
            <h2 className="landing-section-title text-[var(--text-primary)]">
              Questions fréquentes
            </h2>
          </div>

          <div className="max-w-4xl mx-auto">
            {faqs.map((faq, i) => (
              <FaqItem key={i} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          CTA FINAL — Full impact
      ═══════════════════════════════════════ */}
      <section className="px-5 sm:px-8 lg:px-12 py-28 sm:py-36 lg:py-44 bg-zinc-900 relative overflow-hidden">
        {/* Subtle gradient orb */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-zinc-800/50 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-[1400px] mx-auto text-center relative z-10">
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight mb-6 sm:mb-8 max-w-3xl mx-auto">
            Prêt à simplifier la gestion de votre garage ?
          </h2>
          <p className="text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto mb-12 sm:mb-14 leading-relaxed">
            Rejoignez plus de 500 garages qui utilisent GaragePro au quotidien. Commencez gratuitement, passez au Pro quand vous êtes prêt.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5">
            <Link
              href="/inscription"
              className="w-full sm:w-auto h-14 sm:h-16 px-10 sm:px-14 bg-white text-zinc-900 text-base sm:text-lg font-semibold rounded-2xl flex items-center justify-center gap-3 hover:bg-zinc-100 transition-all duration-200 active:scale-[0.98]"
            >
              Démarrer gratuitement
              <ArrowRight className="h-5 w-5" />
            </Link>
            <button
              onClick={() => setCheckoutOpen(true)}
              className="w-full sm:w-auto h-14 sm:h-16 px-10 sm:px-14 bg-transparent text-white text-base sm:text-lg font-semibold rounded-2xl flex items-center justify-center gap-2 border border-zinc-700 hover:border-zinc-500 hover:bg-white/5 transition-all duration-200 active:scale-[0.98]"
            >
              S'abonner au Pro
            </button>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          FOOTER
      ═══════════════════════════════════════ */}
      <footer className="border-t border-[var(--border-light)] bg-[var(--bg-primary)]">
        <div className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-12 py-12 sm:py-16">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-8">
            <div className="flex items-center">
              <img
                src="/logo.png"
                alt="GaragePro"
                width="128"
                height="128"
                className="h-24 w-24 sm:h-28 sm:w-28 lg:h-32 lg:w-32 object-contain"
              />
            </div>

            <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-10 text-sm sm:text-base text-[var(--text-tertiary)]">
              <a href="#" className="hover:text-[var(--text-primary)] transition-colors">Mentions légales</a>
              <a href="#" className="hover:text-[var(--text-primary)] transition-colors">CGV</a>
              <a href="#" className="hover:text-[var(--text-primary)] transition-colors">Confidentialité</a>
              <a href="mailto:contact@garagepro.fr" className="hover:text-[var(--text-primary)] transition-colors">Contact</a>
            </div>

            <p className="text-sm text-[var(--text-muted)]">
              © {new Date().getFullYear()} GaragePro
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
