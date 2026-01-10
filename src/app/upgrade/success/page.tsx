"use client"

import { useEffect, useState, Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { CheckCircle, Loader2, AlertCircle, ArrowRight, Crown } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

function UpgradeSuccessContent() {
    const searchParams = useSearchParams()
    const { user, refreshGarage } = useAuth()
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
    const [error, setError] = useState<string | null>(null)

    const sessionId = searchParams.get('session_id')

    useEffect(() => {
        if (sessionId && user) {
            verifySubscription()
        } else if (!sessionId) {
            setStatus('error')
            setError('Session de paiement introuvable')
        }
    }, [sessionId, user])

    const verifySubscription = async () => {
        try {
            const response = await fetch('/api/stripe/verify-session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sessionId,
                    userId: user?.uid
                })
            })

            const data = await response.json()

            if (data.success) {
                setStatus('success')
                // Refresh garage data to update the plan
                if (refreshGarage) {
                    await refreshGarage()
                }
            } else {
                setStatus('error')
                setError(data.error || 'Erreur lors de la vérification')
            }
        } catch (err: any) {
            console.error('Erreur:', err)
            setStatus('error')
            setError('Erreur de connexion')
        }
    }

    return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
            <div className="max-w-md w-full text-center">
                {status === 'loading' && (
                    <>
                        <div className="w-16 h-16 rounded-2xl bg-zinc-800 flex items-center justify-center mx-auto mb-6">
                            <Loader2 className="h-8 w-8 text-white animate-spin" />
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-2">
                            Activation en cours...
                        </h1>
                        <p className="text-zinc-400">
                            Nous vérifions votre paiement
                        </p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="h-10 w-10 text-white" />
                        </div>
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-400 text-sm font-medium mb-4">
                            <Crown className="h-4 w-4" />
                            Plan Pro activé
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-3">
                            Bienvenue dans le Pro !
                        </h1>
                        <p className="text-zinc-400 mb-8">
                            Votre abonnement est maintenant actif. Profitez d'un accès illimité à toutes les fonctionnalités.
                        </p>
                        <Link
                            href="/dashboard"
                            className="inline-flex h-12 px-8 bg-white text-zinc-900 font-semibold rounded-xl items-center gap-2 hover:bg-zinc-100 transition-colors"
                        >
                            Accéder au dashboard
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-6">
                            <AlertCircle className="h-8 w-8 text-red-400" />
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-2">
                            Un problème est survenu
                        </h1>
                        <p className="text-zinc-400 mb-2">
                            {error}
                        </p>
                        <p className="text-sm text-zinc-500 mb-8">
                            Si le paiement a été effectué, contactez le support. Votre abonnement sera activé manuellement.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Link
                                href="/dashboard"
                                className="h-11 px-6 bg-zinc-800 text-white font-medium rounded-xl flex items-center justify-center hover:bg-zinc-700 transition-colors"
                            >
                                Retour au dashboard
                            </Link>
                            <button
                                onClick={() => {
                                    setStatus('loading')
                                    verifySubscription()
                                }}
                                className="h-11 px-6 bg-white text-zinc-900 font-medium rounded-xl flex items-center justify-center hover:bg-zinc-100 transition-colors"
                            >
                                Réessayer
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

export default function UpgradeSuccessPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-zinc-600" />
            </div>
        }>
            <UpgradeSuccessContent />
        </Suspense>
    )
}
