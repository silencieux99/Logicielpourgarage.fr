"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import {
  CreditCard,
  Loader2,
  Check,
  ArrowRight,
  Calendar,
  AlertCircle,
  AlertTriangle,
  XCircle,
  Download,
  ExternalLink,
  FileText,
  RefreshCw
} from "lucide-react"

interface Invoice {
  id: string
  number: string
  date: number
  amount: number
  status: string
  pdfUrl: string | null
  hostedUrl: string | null
}

export default function BillingPage() {
  const router = useRouter()
  const { user, garage } = useAuth()
  const [loading, setLoading] = useState(false)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [invoicesLoading, setInvoicesLoading] = useState(true)

  const isPro = garage?.plan === 'pro'
  const isActive = garage?.subscriptionStatus === 'active'
  const isPastDue = garage?.subscriptionStatus === 'past_due'
  const isCanceled = garage?.subscriptionStatus === 'canceled'
  const isUnpaid = garage?.subscriptionStatus === 'unpaid'

  // Charger les factures
  useEffect(() => {
    const loadInvoices = async () => {
      if (!user) return

      try {
        const response = await fetch('/api/stripe/invoices', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.uid }),
        })
        const data = await response.json()
        setInvoices(data.invoices || [])
      } catch (error) {
        console.error('Erreur chargement factures:', error)
      } finally {
        setInvoicesLoading(false)
      }
    }

    loadInvoices()
  }, [user])

  const handleSubscribe = async () => {
    if (!user) {
      router.push('/login')
      return
    }

    setLoading(true)
    try {
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

  const handleManageSubscription = async () => {
    if (!user) return

    setLoading(true)
    try {
      const response = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
        }),
      })

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error('URL du portail non reçue')
      }
    } catch (error) {
      console.error('Erreur portail:', error)
      alert('Une erreur est survenue. Veuillez réessayer.')
      setLoading(false)
    }
  }

  // Formater les dates
  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const formatEndDate = () => {
    if (!garage?.subscriptionCurrentPeriodEnd) return null
    const date = garage.subscriptionCurrentPeriodEnd.toDate()
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  // Rendu du statut d'abonnement
  const renderSubscriptionStatus = () => {
    if (isPro && isActive) {
      return (
        <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-sm font-medium rounded-full">
          Actif
        </span>
      )
    }
    if (isPastDue) {
      return (
        <span className="px-3 py-1 bg-amber-100 text-amber-700 text-sm font-medium rounded-full flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          Paiement en retard
        </span>
      )
    }
    if (isUnpaid) {
      return (
        <span className="px-3 py-1 bg-red-100 text-red-700 text-sm font-medium rounded-full flex items-center gap-1">
          <XCircle className="h-3 w-3" />
          Impayé
        </span>
      )
    }
    if (isCanceled) {
      return (
        <span className="px-3 py-1 bg-zinc-100 text-zinc-700 text-sm font-medium rounded-full">
          Annulé
        </span>
      )
    }
    return null
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900 mb-2">Abonnement</h1>
        <p className="text-zinc-600">Gérez votre abonnement et vos paiements</p>
      </div>

      {/* Alerte paiement en retard */}
      {isPastDue && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-amber-800">Paiement en retard</h3>
            <p className="text-sm text-amber-700 mt-1">
              Votre dernier paiement a échoué. Veuillez mettre à jour votre moyen de paiement pour éviter la suspension de votre compte.
            </p>
            <button
              onClick={handleManageSubscription}
              className="mt-3 text-sm font-medium text-amber-700 hover:text-amber-800 flex items-center gap-1"
            >
              Mettre à jour le paiement <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Alerte impayé */}
      {isUnpaid && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-start gap-3">
          <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-800">Abonnement suspendu</h3>
            <p className="text-sm text-red-700 mt-1">
              Votre abonnement est suspendu pour cause d'impayé. Régularisez votre situation pour retrouver l'accès complet.
            </p>
            <button
              onClick={handleManageSubscription}
              className="mt-3 text-sm font-medium text-red-700 hover:text-red-800 flex items-center gap-1"
            >
              Régulariser <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Alerte annulation */}
      {isCanceled && isPro && (
        <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-zinc-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-zinc-800">Abonnement annulé</h3>
            <p className="text-sm text-zinc-600 mt-1">
              Votre abonnement Pro a été annulé. {formatEndDate() && `Vous gardez l'accès jusqu'au ${formatEndDate()}.`}
            </p>
            <button
              onClick={handleSubscribe}
              className="mt-3 text-sm font-medium text-zinc-700 hover:text-zinc-800 flex items-center gap-1"
            >
              Réactiver l'abonnement <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {isPro && (isActive || isPastDue || isUnpaid) ? (
        /* Abonnement Pro */
        <div className={`rounded-xl p-6 text-white mb-6 ${isActive ? 'bg-gradient-to-br from-emerald-600 to-emerald-700' :
            isPastDue ? 'bg-gradient-to-br from-amber-500 to-amber-600' :
              'bg-gradient-to-br from-red-500 to-red-600'
          }`}>
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold mb-1">Plan Pro</h3>
              <p className="text-white/80 text-sm">
                {isActive && 'Votre abonnement est actif'}
                {isPastDue && 'Action requise - paiement en attente'}
                {isUnpaid && 'Abonnement suspendu'}
              </p>
            </div>
            {renderSubscriptionStatus()}
          </div>

          <div className="space-y-2 mb-6">
            <div className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-white" />
              <span>Clients illimités</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-white" />
              <span>Véhicules illimités</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-white" />
              <span>Toutes les fonctionnalités</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-white" />
              <span>Support prioritaire</span>
            </div>
          </div>

          {formatEndDate() && (
            <div className="flex items-center gap-2 text-sm text-white/80 mb-6 bg-white/10 rounded-lg p-3">
              <Calendar className="h-4 w-4" />
              <span>
                {isCanceled ? 'Accès jusqu\'au' : 'Prochain renouvellement'} : {formatEndDate()}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between bg-white/10 rounded-lg p-4 mb-4">
            <div>
              <p className="text-sm text-white/80">Montant mensuel</p>
              <p className="text-2xl font-bold">59,99€ <span className="text-sm font-normal text-white/70">HT/mois</span></p>
            </div>
          </div>

          <button
            onClick={handleManageSubscription}
            disabled={loading}
            className="w-full h-12 bg-white text-zinc-900 font-semibold rounded-lg flex items-center justify-center gap-2 hover:bg-zinc-100 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <CreditCard className="h-5 w-5" />
                {isPastDue || isUnpaid ? 'Mettre à jour le paiement' : 'Gérer mon abonnement'}
              </>
            )}
          </button>
        </div>
      ) : (
        /* Plan Gratuit ou Démo */
        <>
          <div className="bg-white rounded-xl border border-zinc-200 p-6 mb-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-zinc-900 mb-1">Plan Gratuit</h3>
                <p className="text-sm text-zinc-600">Actuellement actif</p>
              </div>
              <span className="px-3 py-1 bg-zinc-100 text-zinc-700 text-sm font-medium rounded-full">
                Actif
              </span>
            </div>

            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-2 text-sm text-zinc-600">
                <Check className="h-4 w-4 text-zinc-400" />
                <span>5 clients maximum</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-zinc-600">
                <Check className="h-4 w-4 text-zinc-400" />
                <span>5 véhicules maximum</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-zinc-600">
                <Check className="h-4 w-4 text-zinc-400" />
                <span>Fonctionnalités de base</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 rounded-lg p-3">
              <AlertCircle className="h-4 w-4" />
              <span>Passez au Pro pour débloquer toutes les fonctionnalités</span>
            </div>
          </div>

          {/* Plan Pro */}
          <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-xl p-6 text-white mb-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold mb-1">Plan Pro</h3>
                <p className="text-zinc-300 text-sm">Débloquez toutes les fonctionnalités</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">59,99€</div>
                <div className="text-sm text-zinc-400">HT/mois</div>
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
        </>
      )}

      {/* Historique des factures */}
      <div className="bg-white rounded-xl border border-zinc-200 p-6">
        <h3 className="text-lg font-semibold text-zinc-900 mb-4 flex items-center gap-2">
          <FileText className="h-5 w-5 text-zinc-400" />
          Historique des factures
        </h3>

        {invoicesLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
          </div>
        ) : invoices.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-zinc-200 mx-auto mb-3" />
            <p className="text-zinc-500">Aucune facture pour le moment</p>
          </div>
        ) : (
          <div className="space-y-3">
            {invoices.map((invoice) => (
              <div
                key={invoice.id}
                className="flex items-center justify-between p-4 bg-zinc-50 rounded-xl hover:bg-zinc-100 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-zinc-200">
                    <FileText className="h-5 w-5 text-zinc-400" />
                  </div>
                  <div>
                    <p className="font-medium text-zinc-900">
                      Facture {invoice.number || invoice.id.slice(-8)}
                    </p>
                    <p className="text-sm text-zinc-500">{formatDate(invoice.date)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-semibold text-zinc-900">{invoice.amount.toFixed(2)}€</p>
                    <p className={`text-xs ${invoice.status === 'paid' ? 'text-emerald-600' :
                        invoice.status === 'open' ? 'text-amber-600' :
                          'text-zinc-500'
                      }`}>
                      {invoice.status === 'paid' ? 'Payée' :
                        invoice.status === 'open' ? 'En attente' :
                          invoice.status === 'draft' ? 'Brouillon' :
                            invoice.status}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {invoice.pdfUrl && (
                      <a
                        href={invoice.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-white rounded-lg transition-colors"
                        title="Télécharger PDF"
                      >
                        <Download className="h-4 w-4" />
                      </a>
                    )}
                    {invoice.hostedUrl && (
                      <a
                        href={invoice.hostedUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-white rounded-lg transition-colors"
                        title="Voir en ligne"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Assistance */}
      {isPro && (
        <div className="bg-zinc-50 rounded-xl p-6 border border-zinc-200 mt-6">
          <h3 className="font-semibold text-zinc-900 mb-2">Besoin d'aide ?</h3>
          <p className="text-sm text-zinc-600 mb-4">
            En tant qu'abonné Pro, vous bénéficiez d'un support prioritaire.
          </p>
          <a
            href="mailto:contact@garagepro.fr"
            className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
          >
            Contacter le support →
          </a>
        </div>
      )}
    </div>
  )
}
