"use client"

import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import {
    ArrowLeft,
    Check,
    CreditCard,
    Loader2,
    Shield,
    Zap,
    Lock,
    Star,
    ChevronRight
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"

const features = [
    "Clients illimités",
    "Véhicules illimités",
    "Factures & devis illimités",
    "Support prioritaire 7j/7",
    "Export Excel & PDF",
    "Rappels SMS automatiques",
    "Mises à jour gratuites",
    "Hébergement sécurisé en France",
]

const testimonials = [
    { name: "Jean M.", garage: "Garage du Centre", text: "Je gagne 2h par jour grâce à GaragePro !" },
    { name: "Marie L.", garage: "Auto Service Plus", text: "Mes clients adorent les SMS de rappel." },
    { name: "Pierre D.", garage: "Mécanique Express", text: "Enfin un logiciel simple et efficace." },
]

// Wrapper component with Suspense for useSearchParams
export default function UpgradePage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
            </div>
        }>
            <UpgradePageContent />
        </Suspense>
    )
}

function UpgradePageContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { user, garage } = useAuth()
    const [isLoading, setIsLoading] = useState(false)
    const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly")
    const [error, setError] = useState<string | null>(null)

    const pricing = {
        monthly: { price: 59.99, period: "mois", savings: null },
        yearly: { price: 49.99, period: "mois", savings: "2 mois offerts" }
    }

    const currentPricing = pricing[billingPeriod]

    const handleSubscribe = async () => {
        if (!user) {
            router.push("/login?redirect=/upgrade")
            return
        }

        setIsLoading(true)
        setError(null)

        try {
            const response = await fetch("/api/stripe/create-checkout-session", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: user.uid,
                    email: user.email,
                    garageName: garage?.nom || "Mon Garage",
                    billingPeriod,
                    successUrl: `${window.location.origin}/dashboard?upgrade=success`,
                    cancelUrl: `${window.location.origin}/upgrade?canceled=true`,
                }),
            })

            const data = await response.json()

            if (data.error) {
                throw new Error(data.error)
            }

            // Rediriger vers Stripe Checkout via l'URL retournée
            if (data.url) {
                window.location.href = data.url
            } else {
                throw new Error("Aucune URL de paiement reçue")
            }
        } catch (err: any) {
            console.error("Erreur checkout:", err)
            setError(err.message || "Une erreur est survenue. Veuillez réessayer.")
            setIsLoading(false)
        }
    }

    // Check if coming back from canceled checkout
    useEffect(() => {
        if (searchParams.get("canceled") === "true") {
            setError("Paiement annulé. Vous pouvez réessayer quand vous voulez.")
        }
    }, [searchParams])

    return (
        <div className="min-h-screen bg-zinc-50">
            {/* Header */}
            <header className="bg-white border-b border-zinc-200 sticky top-0 z-50">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-2 text-zinc-600 hover:text-zinc-900 transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5" />
                        <span className="text-sm font-medium">Retour au dashboard</span>
                    </Link>

                    <div className="flex items-center gap-2 text-sm text-zinc-500">
                        <Shield className="h-4 w-4 text-emerald-500" />
                        <span>Paiement 100% sécurisé</span>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                {/* Hero */}
                <div className="text-center mb-8 sm:mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-full text-emerald-700 text-sm font-medium mb-4">
                        <Zap className="h-4 w-4" />
                        Offre spéciale : 2 mois offerts sur l'abonnement annuel
                    </div>
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-zinc-900 mb-4">
                        Passez au <span className="text-emerald-600">Pro</span>
                    </h1>
                    <p className="text-lg text-zinc-600 max-w-2xl mx-auto">
                        Débloquez toutes les fonctionnalités et gérez votre garage sans limites.
                    </p>
                </div>

                {error && (
                    <div className="max-w-lg mx-auto mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                        {error}
                    </div>
                )}

                <div className="grid lg:grid-cols-5 gap-8">
                    {/* Pricing Card */}
                    <div className="lg:col-span-3">
                        <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
                            {/* Billing Toggle */}
                            <div className="p-6 border-b border-zinc-100 bg-zinc-50">
                                <div className="flex items-center justify-center gap-2 p-1 bg-white border border-zinc-200 rounded-xl max-w-xs mx-auto">
                                    <button
                                        onClick={() => setBillingPeriod("monthly")}
                                        className={cn(
                                            "flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-colors",
                                            billingPeriod === "monthly"
                                                ? "bg-zinc-900 text-white"
                                                : "text-zinc-600 hover:text-zinc-900"
                                        )}
                                    >
                                        Mensuel
                                    </button>
                                    <button
                                        onClick={() => setBillingPeriod("yearly")}
                                        className={cn(
                                            "flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-colors relative",
                                            billingPeriod === "yearly"
                                                ? "bg-zinc-900 text-white"
                                                : "text-zinc-600 hover:text-zinc-900"
                                        )}
                                    >
                                        Annuel
                                        <span className="absolute -top-2 -right-2 px-1.5 py-0.5 bg-emerald-500 text-white text-[10px] font-bold rounded-full">
                                            -17%
                                        </span>
                                    </button>
                                </div>
                            </div>

                            {/* Pricing */}
                            <div className="p-6 sm:p-8 text-center">
                                <div className="flex items-baseline justify-center gap-1 mb-2">
                                    <span className="text-5xl sm:text-6xl font-bold text-zinc-900">
                                        {currentPricing.price.toFixed(2).replace(".", ",")}€
                                    </span>
                                    <span className="text-xl text-zinc-500">HT/{currentPricing.period}</span>
                                </div>

                                {currentPricing.savings && (
                                    <div className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 text-sm font-medium rounded-full mb-4">
                                        {currentPricing.savings}
                                    </div>
                                )}

                                {billingPeriod === "yearly" && (
                                    <p className="text-sm text-zinc-500 mb-6">
                                        Facturé {(currentPricing.price * 12).toFixed(2).replace(".", ",")}€ HT/an
                                    </p>
                                )}
                            </div>

                            {/* Features */}
                            <div className="px-6 sm:px-8 pb-8">
                                <div className="grid sm:grid-cols-2 gap-3">
                                    {features.map((feature, i) => (
                                        <div key={i} className="flex items-center gap-3">
                                            <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                                                <Check className="h-3 w-3 text-emerald-600" />
                                            </div>
                                            <span className="text-sm text-zinc-700">{feature}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* CTA Button */}
                                <button
                                    onClick={handleSubscribe}
                                    disabled={isLoading}
                                    className="w-full h-14 mt-8 bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-400 text-white text-base font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                            Redirection vers le paiement...
                                        </>
                                    ) : (
                                        <>
                                            <CreditCard className="h-5 w-5" />
                                            S'abonner maintenant
                                        </>
                                    )}
                                </button>

                                {/* Trust badges */}
                                <div className="flex items-center justify-center gap-6 mt-6 pt-6 border-t border-zinc-100">
                                    <div className="flex items-center gap-2 text-sm text-zinc-500">
                                        <Lock className="h-4 w-4" />
                                        <span>SSL sécurisé</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-zinc-500">
                                        <Shield className="h-4 w-4" />
                                        <span>Via Stripe</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Guarantee */}
                        <div className="mt-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                                    <Shield className="h-5 w-5 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="font-semibold text-emerald-900">Satisfait ou remboursé</p>
                                    <p className="text-sm text-emerald-700">
                                        Vous avez 30 jours pour tester. Si vous n'êtes pas satisfait, nous vous remboursons intégralement.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Current plan */}
                        <div className="bg-white rounded-xl border border-zinc-200 p-5">
                            <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wide mb-3">
                                Votre plan actuel
                            </h3>
                            <div className="flex items-center justify-between">
                                <div>
                                    {garage?.plan === 'pro' && garage?.subscriptionStatus === 'active' ? (
                                        <>
                                            <p className="font-semibold text-emerald-600">Plan Pro Actif ✓</p>
                                            <p className="text-sm text-zinc-500">Illimité • Support prioritaire</p>
                                        </>
                                    ) : garage?.subscriptionStatus === 'past_due' ? (
                                        <>
                                            <p className="font-semibold text-amber-600">Paiement en attente</p>
                                            <p className="text-sm text-zinc-500">Mettez à jour votre paiement</p>
                                        </>
                                    ) : (
                                        <>
                                            <p className="font-semibold text-zinc-900">Démo Gratuite</p>
                                            <p className="text-sm text-zinc-500">5 clients • 5 véhicules</p>
                                        </>
                                    )}
                                </div>
                                {garage?.plan !== 'pro' && <ChevronRight className="h-5 w-5 text-zinc-400" />}
                            </div>
                        </div>

                        {/* Testimonials */}
                        <div className="bg-white rounded-xl border border-zinc-200 p-5">
                            <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wide mb-4">
                                Ils utilisent GaragePro
                            </h3>
                            <div className="space-y-4">
                                {testimonials.map((t, i) => (
                                    <div key={i} className="border-b border-zinc-100 last:border-0 pb-4 last:pb-0">
                                        <div className="flex items-center gap-1 mb-2">
                                            {[...Array(5)].map((_, j) => (
                                                <Star key={j} className="h-4 w-4 text-amber-400 fill-amber-400" />
                                            ))}
                                        </div>
                                        <p className="text-sm text-zinc-700 mb-2">"{t.text}"</p>
                                        <p className="text-xs text-zinc-500">
                                            <span className="font-medium">{t.name}</span> — {t.garage}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* FAQ */}
                        <div className="bg-white rounded-xl border border-zinc-200 p-5">
                            <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wide mb-4">
                                Questions fréquentes
                            </h3>
                            <div className="space-y-3">
                                {[
                                    { q: "Puis-je annuler ?", a: "Oui, à tout moment sans frais." },
                                    { q: "Mes données sont-elles transférées ?", a: "Oui, vous gardez tout ce que vous avez créé." },
                                    { q: "Y a-t-il un engagement ?", a: "Non, vous êtes libre d'arrêter quand vous voulez." },
                                ].map((faq, i) => (
                                    <details key={i} className="group">
                                        <summary className="flex items-center justify-between cursor-pointer list-none py-2">
                                            <span className="text-sm font-medium text-zinc-900">{faq.q}</span>
                                            <ChevronRight className="h-4 w-4 text-zinc-400 transition-transform group-open:rotate-90" />
                                        </summary>
                                        <p className="text-sm text-zinc-600 pb-2">{faq.a}</p>
                                    </details>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
