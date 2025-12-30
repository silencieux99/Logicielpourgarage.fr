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
  X
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"

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

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-zinc-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-20 sm:h-22 md:h-24 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <img
              src="/GaragePROlogo.png"
              alt="GaragePro"
              width="300"
              height="75"
              className="w-[180px] sm:w-[220px] md:w-[260px] h-auto"
            />
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-[14px] text-zinc-600 hover:text-zinc-900">Fonctionnalités</a>
            <a href="#pricing" className="text-[14px] text-zinc-600 hover:text-zinc-900">Tarifs</a>
            <a href="#faq" className="text-[14px] text-zinc-600 hover:text-zinc-900">FAQ</a>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link href="/dashboard" className="text-[14px] font-medium text-zinc-600 hover:text-zinc-900 px-3 py-2">
              Connexion
            </Link>
            <a href="#pricing" className="h-9 px-4 bg-zinc-900 text-white text-[14px] font-medium rounded-lg flex items-center transition-colors hover:bg-zinc-800">
              Commencer
            </a>
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
          <div className="md:hidden bg-white border-t border-zinc-100 px-4 py-4 space-y-3">
            <a href="#features" className="block text-[15px] text-zinc-700 py-2" onClick={() => setMobileMenuOpen(false)}>Fonctionnalités</a>
            <a href="#pricing" className="block text-[15px] text-zinc-700 py-2" onClick={() => setMobileMenuOpen(false)}>Tarifs</a>
            <a href="#faq" className="block text-[15px] text-zinc-700 py-2" onClick={() => setMobileMenuOpen(false)}>FAQ</a>
            <div className="pt-3 border-t border-zinc-100 space-y-2">
              <Link href="/dashboard" className="block w-full h-11 bg-zinc-100 text-zinc-900 text-[15px] font-medium rounded-lg text-center leading-[44px]">
                Connexion
              </Link>
              <a href="#pricing" className="block w-full h-11 bg-zinc-900 text-white text-[15px] font-medium rounded-lg text-center leading-[44px]">
                Commencer
              </a>
            </div>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="pt-28 sm:pt-32 md:pt-36 pb-16 sm:pb-24 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="inline-block px-3 py-1.5 bg-zinc-100 rounded-full text-zinc-700 text-[13px] font-medium mb-6">
            Démo gratuite • Sans carte bancaire
          </p>

          <h1 className="text-[32px] sm:text-[44px] lg:text-[52px] font-bold text-zinc-900 leading-[1.15] tracking-tight mb-5">
            Le logiciel de gestion pour votre garage
          </h1>

          <p className="text-[16px] sm:text-[18px] text-zinc-600 leading-relaxed max-w-2xl mx-auto mb-8">
            Gérez vos clients, véhicules, réparations et factures depuis une interface simple. Gagnez du temps au quotidien.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
            <Link href="/dashboard" className="w-full sm:w-auto h-12 px-6 bg-zinc-900 text-white text-[15px] font-semibold rounded-lg flex items-center justify-center gap-2 hover:bg-zinc-800 transition-colors">
              Essayer gratuitement
            </Link>
            <a href="#pricing" className="w-full sm:w-auto h-12 px-6 bg-zinc-100 text-zinc-900 text-[15px] font-semibold rounded-lg flex items-center justify-center gap-2 hover:bg-zinc-200 transition-colors">
              Voir les tarifs
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[13px] text-zinc-500">
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

              <Link href="/dashboard" className="block w-full h-11 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 text-[14px] font-semibold rounded-lg text-center leading-[44px] transition-colors">
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

              <button className="w-full h-11 bg-white hover:bg-zinc-100 text-zinc-900 text-[14px] font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors">
                <Shield className="h-4 w-4" />
                S'abonner
              </button>

              <p className="text-[11px] text-zinc-500 mt-3 text-center">Paiement sécurisé Stripe</p>
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
            Essayez gratuitement ou passez au Pro pour un accès illimité.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/dashboard" className="w-full sm:w-auto h-12 px-8 bg-white text-zinc-900 text-[15px] font-semibold rounded-lg flex items-center justify-center hover:bg-zinc-100 transition-colors">
              Essayer gratuitement
            </Link>
            <a href="#pricing" className="w-full sm:w-auto h-12 px-8 bg-zinc-800 text-white text-[15px] font-semibold rounded-lg flex items-center justify-center gap-2 border border-zinc-700 hover:bg-zinc-700 transition-colors">
              59,99€/mois
              <ArrowRight className="h-4 w-4" />
            </a>
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
                className="w-[160px] sm:w-[200px] h-auto"
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
