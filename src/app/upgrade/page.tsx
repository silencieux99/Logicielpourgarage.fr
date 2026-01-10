"use client"

import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import {
    ArrowLeft,
    Check,
    Loader2,
    Sparkles,
    ArrowRight
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"

const features = [
    { title: "Clients illimités", desc: "Gérez tous vos clients sans restriction" },
    { title: "Véhicules illimités", desc: "Ajoutez autant de véhicules que nécessaire" },
    { title: "Devis & Factures", desc: "Création illimitée de documents" },
    { title: "Support prioritaire", desc: "Assistance dédiée 7j/7" },
    { title: "Exports avancés", desc: "Excel, PDF et intégrations" },
    { title: "Rappels SMS", desc: "Notifications automatiques clients" },
]

// Wrapper component with Suspense for useSearchParams
export default function UpgradePage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-zinc-600" />
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
    const [error, setError] = useState<string | null>(null)

    const priceHT = 59.99
    const priceTTC = priceHT * 1.2

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
                    billingPeriod: "monthly",
                    successUrl: `${window.location.origin}/dashboard?upgrade=success`,
                    cancelUrl: `${window.location.origin}/upgrade?canceled=true`,
                }),
            })

            const data = await response.json()

            if (data.error) {
                throw new Error(data.error)
            }

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

    useEffect(() => {
        if (searchParams.get("canceled") === "true") {
            setError("Paiement annulé. Vous pouvez réessayer quand vous voulez.")
        }
    }, [searchParams])

    // Already Pro - redirect
    if (garage?.plan === 'pro' && garage?.subscriptionStatus === 'active') {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
                <div className="max-w-md w-full text-center">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center mx-auto mb-6">
                        <Sparkles className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">Vous êtes déjà Pro</h1>
                    <p className="text-zinc-400 mb-8">Vous bénéficiez de toutes les fonctionnalités sans limites.</p>
                    <Link
                        href="/dashboard"
                        className="inline-flex h-12 px-8 bg-white text-zinc-900 font-semibold rounded-xl items-center gap-2 hover:bg-zinc-100 transition-colors"
                    >
                        Retour au dashboard
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-zinc-950">
            {/* Subtle gradient background */}
            <div className="absolute inset-0 bg-gradient-to-b from-zinc-900 via-zinc-950 to-zinc-950" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-800/20 via-transparent to-transparent" />

            {/* Content */}
            <div className="relative">
                {/* Header */}
                <header className="border-b border-zinc-800/50">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
                        <Link
                            href="/dashboard"
                            className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            <span className="text-sm font-medium">Retour</span>
                        </Link>
                        <div className="flex items-center gap-2 text-xs text-zinc-500">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Paiement sécurisé
                        </div>
                    </div>
                </header>

                <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
                    {/* Hero */}
                    <div className="text-center mb-12 sm:mb-16">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-zinc-800/50 border border-zinc-700/50 rounded-full text-zinc-300 text-xs font-medium mb-6">
                            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                            Plan Pro
                        </div>
                        <h1 className="text-3xl sm:text-5xl font-bold text-white mb-4 tracking-tight">
                            Libérez tout le potentiel<br className="hidden sm:block" /> de votre garage
                        </h1>
                        <p className="text-lg text-zinc-300 max-w-xl mx-auto">
                            Un seul abonnement. Aucune limite. Tout inclus.
                        </p>
                    </div>

                    {error && (
                        <div className="max-w-md mx-auto mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center">
                            {error}
                        </div>
                    )}

                    {/* Pricing Card */}
                    <div className="max-w-md mx-auto mb-16">
                        <div className="relative">
                            {/* Glow effect */}
                            <div className="absolute -inset-px bg-gradient-to-b from-zinc-700/50 to-zinc-800/50 rounded-2xl blur-sm" />

                            <div className="relative bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
                                {/* Price section */}
                                <div className="p-8 text-center border-b border-zinc-800/50">
                                    <div className="flex items-baseline justify-center gap-1 mb-1">
                                        <span className="text-5xl font-bold text-white tracking-tight">
                                            {priceHT.toFixed(2).replace(".", ",")}€
                                        </span>
                                        <span className="text-zinc-400 text-lg">/mois</span>
                                    </div>
                                    <p className="text-sm text-zinc-400">
                                        {priceTTC.toFixed(2).replace(".", ",")}€ TTC • Sans engagement
                                    </p>
                                </div>

                                {/* CTA */}
                                <div className="p-6">
                                    <button
                                        onClick={handleSubscribe}
                                        disabled={isLoading}
                                        className="w-full h-14 bg-white hover:bg-zinc-100 disabled:bg-zinc-700 text-zinc-900 disabled:text-zinc-400 text-base font-semibold rounded-xl flex items-center justify-center gap-2 transition-all"
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="h-5 w-5 animate-spin" />
                                                <span>Redirection...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>Commencer maintenant</span>
                                                <ArrowRight className="h-4 w-4" />
                                            </>
                                        )}
                                    </button>

                                    <p className="text-center text-xs text-zinc-400 mt-4">
                                        Annulable à tout moment • Paiement via Stripe
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Features Grid */}
                    <div className="mb-16">
                        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider text-center mb-8">
                            Tout ce qui est inclus
                        </h2>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {features.map((feature, i) => (
                                <div
                                    key={i}
                                    className="p-5 bg-zinc-900/50 border border-zinc-800/50 rounded-xl"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <Check className="h-3 w-3 text-emerald-400" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-white text-sm">{feature.title}</p>
                                            <p className="text-xs text-zinc-400 mt-0.5">{feature.desc}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Current plan indicator */}
                    <div className="text-center">
                        <div className="inline-flex items-center gap-3 px-4 py-2.5 bg-zinc-900/50 border border-zinc-800/50 rounded-xl">
                            <div className="w-2 h-2 rounded-full bg-zinc-600" />
                            <span className="text-sm text-zinc-400">
                                Actuellement : <span className="text-zinc-300 font-medium">Plan Démo</span> (5 clients, 5 véhicules)
                            </span>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
}
