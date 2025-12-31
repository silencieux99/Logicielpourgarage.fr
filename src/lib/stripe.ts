import Stripe from 'stripe'
import { loadStripe } from '@stripe/stripe-js'

// Stripe server-side instance
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
  typescript: true,
})

// Stripe client-side instance
let stripePromise: ReturnType<typeof loadStripe>
export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
  }
  return stripePromise
}

// Prix IDs - À créer dans votre dashboard Stripe
export const STRIPE_PRICES = {
  monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY_ID || 'price_monthly', // À remplacer
}

// Configuration des plans
export const PLANS = {
  monthly: {
    name: 'Plan Pro Mensuel',
    price: 59.99,
    currency: 'EUR',
    interval: 'month' as const,
    features: [
      'Clients illimités',
      'Véhicules illimités',
      'Factures et devis illimités',
      'Mises à jour incluses',
      'Support prioritaire',
      'Exports Excel et PDF',
      'Hébergement en France',
      'Conforme RGPD',
    ],
  },
}

// Types
export interface SubscriptionData {
  id: string
  userId: string
  garageId?: string
  stripeCustomerId: string
  stripeSubscriptionId: string
  stripePriceId: string
  status: 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete'
  currentPeriodStart: Date
  currentPeriodEnd: Date
  cancelAtPeriodEnd: boolean
  createdAt: Date
  updatedAt: Date
}
