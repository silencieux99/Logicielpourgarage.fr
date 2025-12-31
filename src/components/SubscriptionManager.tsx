"use client"

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useSubscription } from '@/hooks/useSubscription'
import { CreditCard, Calendar, AlertCircle, CheckCircle2, Loader2, ExternalLink } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

export function SubscriptionManager() {
  const { user } = useAuth()
  const { subscription, loading, isActive, isTrial, isPastDue } = useSubscription()
  const [loadingPortal, setLoadingPortal] = useState(false)

  const handleManageSubscription = async () => {
    if (!user) return

    setLoadingPortal(true)
    try {
      const response = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.uid }),
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la création de la session')
      }

      const { url } = await response.json()
      window.location.href = url
    } catch (error) {
      console.error('Erreur:', error)
      alert('Une erreur est survenue. Veuillez réessayer.')
    } finally {
      setLoadingPortal(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-zinc-200 p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
        </div>
      </div>
    )
  }

  if (!subscription || !isActive) {
    return (
      <div className="bg-white rounded-xl border border-zinc-200 p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-amber-100 rounded-lg">
            <AlertCircle className="h-6 w-6 text-amber-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-zinc-900 mb-2">
              Aucun abonnement actif
            </h3>
            <p className="text-sm text-zinc-600 mb-4">
              Vous utilisez actuellement la version démo limitée à 5 clients et 5 véhicules.
            </p>
            <a
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white text-sm font-medium rounded-lg hover:bg-zinc-800 transition-colors"
            >
              Voir les offres
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    )
  }

  const periodEnd = subscription.currentPeriodEnd instanceof Date 
    ? subscription.currentPeriodEnd 
    : new Date((subscription.currentPeriodEnd as any).seconds * 1000)

  return (
    <div className="bg-white rounded-xl border border-zinc-200 p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-lg ${
            isTrial ? 'bg-blue-100' : 
            isPastDue ? 'bg-red-100' : 
            'bg-emerald-100'
          }`}>
            {isTrial ? (
              <Calendar className="h-6 w-6 text-blue-600" />
            ) : isPastDue ? (
              <AlertCircle className="h-6 w-6 text-red-600" />
            ) : (
              <CheckCircle2 className="h-6 w-6 text-emerald-600" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-zinc-900 mb-1">
              {isTrial ? 'Période d\'essai' : 'Plan Pro'}
            </h3>
            <p className="text-sm text-zinc-600">
              {isTrial ? 'Essai gratuit de 14 jours' : '59,99€ HT/mois'}
            </p>
          </div>
        </div>

        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
          isTrial ? 'bg-blue-100 text-blue-700' :
          isPastDue ? 'bg-red-100 text-red-700' :
          'bg-emerald-100 text-emerald-700'
        }`}>
          {isTrial ? 'Essai' : isPastDue ? 'Paiement en retard' : 'Actif'}
        </div>
      </div>

      {/* Info */}
      <div className="space-y-3 mb-6">
        <div className="flex items-center justify-between py-3 border-t border-zinc-100">
          <span className="text-sm text-zinc-600">Prochaine facturation</span>
          <span className="text-sm font-medium text-zinc-900">
            {format(periodEnd, 'dd MMMM yyyy', { locale: fr })}
          </span>
        </div>

        {subscription.cancelAtPeriodEnd && (
          <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-900">
                Annulation programmée
              </p>
              <p className="text-xs text-amber-700 mt-1">
                Votre abonnement sera annulé le {format(periodEnd, 'dd MMMM yyyy', { locale: fr })}
              </p>
            </div>
          </div>
        )}

        {isPastDue && (
          <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-900">
                Problème de paiement
              </p>
              <p className="text-xs text-red-700 mt-1">
                Le dernier paiement a échoué. Veuillez mettre à jour votre mode de paiement.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <button
        onClick={handleManageSubscription}
        disabled={loadingPortal}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-400 text-white text-sm font-medium rounded-lg transition-colors"
      >
        {loadingPortal ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            <CreditCard className="h-4 w-4" />
            Gérer mon abonnement
          </>
        )}
      </button>

      <p className="text-xs text-zinc-500 text-center mt-3">
        Modifier le mode de paiement, annuler ou voir l'historique
      </p>
    </div>
  )
}
