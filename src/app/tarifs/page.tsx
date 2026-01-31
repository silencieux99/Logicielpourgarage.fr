"use client"

import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, CheckCircle2, Shield, ArrowRight, X } from "lucide-react"

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

export default function TarifsPage() {
    return (
        <div className="min-h-screen bg-white">
            {/* Nav */}
            <nav className="border-b border-zinc-100">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 h-24 sm:h-28 md:h-32 flex items-center justify-between">
                    <Link href="/" className="flex items-center">
                        <img
                            src="/GaragePROlogo.png"
                            alt="GaragePro"
                            className="h-20 sm:h-24 md:h-28 w-auto"
                        />
                    </Link>
                    <Link href="/" className="text-[14px] text-zinc-600 hover:text-zinc-900 flex items-center gap-1">
                        <ArrowLeft className="h-4 w-4" />
                        Retour
                    </Link>
                </div>
            </nav>

            <main className="py-12 sm:py-20 px-4 sm:px-6">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <h1 className="text-[32px] sm:text-[42px] font-bold text-zinc-900 mb-4">
                            Tarifs transparents
                        </h1>
                        <p className="text-[16px] sm:text-[18px] text-zinc-600 max-w-xl mx-auto">
                            Un seul prix, sans surprise. Sans engagement, résiliable à tout moment.
                        </p>
                    </div>

                    {/* Plans */}
                    <div className="grid md:grid-cols-2 gap-6 mb-12">
                        {/* Demo */}
                        <div className="bg-white rounded-2xl p-6 sm:p-8 border-2 border-zinc-200">
                            <h2 className="text-[20px] font-bold text-zinc-900 mb-1">Démo gratuite</h2>
                            <p className="text-[14px] text-zinc-500 mb-6">Testez le logiciel sans engagement</p>

                            <div className="flex items-baseline gap-1 mb-6">
                                <span className="text-[48px] font-bold text-zinc-900">0</span>
                                <span className="text-[18px] text-zinc-400">€</span>
                            </div>

                            <div className="space-y-3 mb-8">
                                {benefitsDemo.map((b) => (
                                    <div key={b} className="flex items-center gap-3 text-[14px] text-zinc-700">
                                        <CheckCircle2 className="h-5 w-5 text-zinc-400 flex-shrink-0" />
                                        {b}
                                    </div>
                                ))}
                            </div>

                            <Link href="/inscription" className="block w-full h-12 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 text-[15px] font-semibold rounded-xl text-center leading-[48px] transition-colors">
                                Créer un compte gratuit
                            </Link>
                        </div>

                        {/* Pro */}
                        <div className="bg-zinc-900 rounded-2xl p-6 sm:p-8 relative">
                            <div className="absolute top-6 right-6">
                                <span className="px-3 py-1 bg-emerald-500 text-white text-[11px] font-bold rounded-full">
                                    RECOMMANDÉ
                                </span>
                            </div>

                            <h2 className="text-[20px] font-bold text-white mb-1">Pro</h2>
                            <p className="text-[14px] text-zinc-400 mb-6">Accès complet et illimité</p>

                            <div className="flex items-baseline gap-1 mb-2">
                                <span className="text-[48px] font-bold text-white">59,99</span>
                                <div>
                                    <span className="text-[18px] text-white/80">€</span>
                                    <span className="text-[14px] text-zinc-400 ml-1">HT/mois</span>
                                </div>
                            </div>

                            <p className="text-[13px] text-emerald-400 mb-6">Sans engagement • Résiliation à tout moment • Sans frais cachés</p>

                            <div className="space-y-3 mb-8">
                                {benefitsPro.map((b) => (
                                    <div key={b} className="flex items-center gap-3 text-[14px] text-white/90">
                                        <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                                        {b}
                                    </div>
                                ))}
                            </div>

                            <button className="w-full h-12 bg-white hover:bg-zinc-100 text-zinc-900 text-[15px] font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors">
                                <Shield className="h-5 w-5" />
                                S'abonner maintenant
                            </button>

                                <p className="text-[12px] text-zinc-500 mt-4 text-center">Paiement sécurisé par Stripe • Résiliable à tout moment</p>
                        </div>
                    </div>

                    {/* Garanties */}
                    <div className="bg-zinc-50 rounded-2xl p-6 sm:p-8 mb-12">
                        <h3 className="text-[18px] font-bold text-zinc-900 mb-6 text-center">Ce qui est garanti</h3>
                        <div className="grid sm:grid-cols-3 gap-6">
                            <div className="text-center">
                                <div className="flex items-center justify-center gap-2 text-red-500 mb-2">
                                    <X className="h-5 w-5" />
                                    <span className="text-[14px] font-medium">Aucun frais caché</span>
                                </div>
                                <p className="text-[13px] text-zinc-500">59,99€ HT/mois, point final</p>
                            </div>
                            <div className="text-center">
                                <div className="flex items-center justify-center gap-2 text-red-500 mb-2">
                                    <X className="h-5 w-5" />
                                    <span className="text-[14px] font-medium">Aucun engagement</span>
                                </div>
                                <p className="text-[13px] text-zinc-500">Résiliation possible à tout moment</p>
                            </div>
                            <div className="text-center">
                                <div className="flex items-center justify-center gap-2 text-red-500 mb-2">
                                    <X className="h-5 w-5" />
                                    <span className="text-[14px] font-medium">Aucune limite cachée</span>
                                </div>
                                <p className="text-[13px] text-zinc-500">Tout est vraiment illimité</p>
                            </div>
                        </div>
                    </div>

                    {/* FAQ Pricing */}
                    <div className="space-y-4">
                        <h3 className="text-[18px] font-bold text-zinc-900 mb-4">Questions sur les tarifs</h3>
                        {[
                            { q: "Le prix va-t-il augmenter ?", a: "Non. Le prix est fixé à 59,99€ HT/mois. Si nous décidons d'augmenter les tarifs pour les nouveaux clients, votre tarif restera le même." },
                            { q: "Comment puis-je payer ?", a: "Par carte bancaire (Visa, Mastercard, etc.) via notre partenaire Stripe. Le paiement est 100% sécurisé." },
                            { q: "Puis-je être remboursé ?", a: "Oui, nous offrons une garantie satisfait ou remboursé de 14 jours après le premier paiement." },
                            { q: "Y a-t-il des réductions ?", a: "Nous proposons -20% pour un paiement annuel (soit 575€ HT/an au lieu de 719€)." },
                        ].map((item, i) => (
                            <details key={i} className="group bg-white rounded-xl border border-zinc-200">
                                <summary className="p-5 cursor-pointer list-none flex items-center justify-between">
                                    <span className="text-[15px] font-medium text-zinc-900">{item.q}</span>
                                    <ArrowRight className="h-4 w-4 text-zinc-400 transition-transform group-open:rotate-90" />
                                </summary>
                                <div className="px-5 pb-5 text-[14px] text-zinc-600">{item.a}</div>
                            </details>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    )
}
