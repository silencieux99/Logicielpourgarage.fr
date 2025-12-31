"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { CreditCard, Loader2, Check, ArrowRight } from "lucide-react"

export default function BillingPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)

  const handleSubscribe = async () => {
    if (!user) {
      router.push('/login')
      return
    }

    setLoading(true)
    try {
      // Appeler l'API pour créer une session Stripe Checkout
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          email: user.email,
        }),
      })

      const data = await response.json()

      if (data.url) {
        // Rediriger vers Stripe Checkout
        window.location.href = data.url
      } else {
        throw new Error('URL de paiement non reçue')
      }
    } catch (error) {
      console.error('Erreur checkout:', error)
      alert('Une erreur est survenue. Veuillez réessayer.')
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900 mb-2">Abonnement</h1>
        <p className="text-zinc-600">Gérez votre abonnement et vos paiements</p>
      </div>

      {/* Plan gratuit */}
      <div className="bg-white rounded-xl border border-zinc-200 p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-zinc-900 mb-1">Plan Gratuit</h3>
            <p className="text-sm text-zinc-600">Actuellement actif</p>
          </div>
          <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-sm font-medium rounded-full">
            Actif
          </span>
        </div>

        <div className="space-y-2 mb-6">
          <div className="flex items-center gap-2 text-sm text-zinc-600">
            <Check className="h-4 w-4 text-emerald-500" />
            <span>5 clients maximum</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-zinc-600">
            <Check className="h-4 w-4 text-emerald-500" />
            <span>5 véhicules maximum</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-zinc-600">
            <Check className="h-4 w-4 text-emerald-500" />
            <span>Fonctionnalités de base</span>
          </div>
        </div>
      </div>

      {/* Plan Pro */}
      <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-xl p-6 text-white">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold mb-1">Plan Pro</h3>
            <p className="text-zinc-300 text-sm">Débloquez toutes les fonctionnalités</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">59,99€</div>
            <div className="text-sm text-zinc-400">HT/mois</div>
            <div className="text-xs text-zinc-500 mt-1">71,99€ TTC</div>
          </div>
        </div>

        <div className="space-y-2 mb-6">
          <div className="flex items-center gap-2 text-sm">
            <Check className="h-4 w-4 text-emerald-400" />
            <span>Clients illimités</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Check className="h-4 w-4 text-emerald-400" />
            <span>Véhicules illimités</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Check className="h-4 w-4 text-emerald-400" />
            <span>Toutes les fonctionnalités</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Check className="h-4 w-4 text-emerald-400" />
            <span>Support prioritaire</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Check className="h-4 w-4 text-emerald-400" />
            <span>Sans engagement</span>
          </div>
        </div>

        <button
          onClick={handleSubscribe}
          disabled={loading}
          className="w-full h-12 bg-white text-zinc-900 font-semibold rounded-lg flex items-center justify-center gap-2 hover:bg-zinc-100 transition-colors disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              <CreditCard className="h-5 w-5" />
              Passer au Plan Pro
              <ArrowRight className="h-5 w-5" />
            </>
          )}
        </button>

        <p className="text-xs text-zinc-400 text-center mt-4">
          Paiement sécurisé par Stripe • Annulation à tout moment
        </p>
      </div>
    </div>
  )
}
