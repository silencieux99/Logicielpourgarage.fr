import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import { adminDb } from '@/lib/firebase-admin'
import { Timestamp } from 'firebase-admin/firestore'
import { sendEmail } from '@/lib/email'
import { invoiceEmail } from '@/lib/email-templates'
import { generateInvoiceHTML, generateInvoiceNumber, calculateInvoiceAmounts } from '@/lib/invoice-template'

// Désactiver le body parser de Next.js pour les webhooks Stripe
export const runtime = 'nodejs'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'Signature manquante' },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err: any) {
    console.error('Erreur webhook signature:', err.message)
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    )
  }

  // Gérer les différents types d'événements
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session)
        break

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice)
        break

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice)
        break

      default:
        console.log(`Événement non géré: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Erreur traitement webhook:', error)
    return NextResponse.json(
      { error: 'Erreur traitement webhook' },
      { status: 500 }
    )
  }
}

// Gérer la session de checkout complétée
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId
  const customerId = session.customer as string
  const subscriptionId = session.subscription as string

  if (!userId) {
    console.error('userId manquant dans les metadata')
    return
  }

  // Récupérer les détails de l'abonnement
  const subscription = await stripe.subscriptions.retrieve(subscriptionId)

  // Sauvegarder l'abonnement dans Firestore
  await saveSubscription(userId, customerId, subscription)
}

// Gérer la création d'abonnement
async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId
  const customerId = subscription.customer as string

  if (!userId) {
    console.error('userId manquant dans les metadata')
    return
  }

  await saveSubscription(userId, customerId, subscription)
}

// Gérer la mise à jour d'abonnement
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId
  const customerId = subscription.customer as string

  if (!userId) {
    console.error('userId manquant dans les metadata')
    return
  }

  await saveSubscription(userId, customerId, subscription)
}

// Gérer la suppression d'abonnement
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId

  if (!userId) {
    console.error('userId manquant dans les metadata')
    return
  }

  // Mettre à jour le statut de l'abonnement
  const subscriptionsRef = adminDb.collection('subscriptions')
  const snapshot = await subscriptionsRef
    .where('userId', '==', userId)
    .where('stripeSubscriptionId', '==', subscription.id)
    .limit(1)
    .get()

  if (!snapshot.empty) {
    const doc = snapshot.docs[0]
    await doc.ref.update({
      status: 'canceled',
      updatedAt: Timestamp.now(),
    })
  }
}

// Gérer le paiement réussi
async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  const subscriptionId = (invoice as any).subscription as string | undefined

  if (!subscriptionId) return

  const subscription = await stripe.subscriptions.retrieve(subscriptionId)
  const userId = subscription.metadata?.userId

  if (!userId) return

  // Mettre à jour le statut de l'abonnement
  const subscriptionsRef = adminDb.collection('subscriptions')
  const snapshot = await subscriptionsRef
    .where('userId', '==', userId)
    .where('stripeSubscriptionId', '==', subscriptionId)
    .limit(1)
    .get()

  if (!snapshot.empty) {
    const doc = snapshot.docs[0]
    await doc.ref.update({
      status: 'active',
      updatedAt: Timestamp.now(),
    })
  }

  // Générer et envoyer la facture
  try {
    // Récupérer les infos du client
    const customer = await stripe.customers.retrieve(invoice.customer as string) as Stripe.Customer
    const userDoc = await adminDb.collection('users').doc(userId).get()
    const userData = userDoc.data()

    // Récupérer les infos du garage
    const garageSnapshot = await adminDb.collection('garages').where('userId', '==', userId).limit(1).get()
    const garageData = !garageSnapshot.empty ? garageSnapshot.docs[0].data() : null

    // Calculer les montants (59.99€ HT + 20% TVA)
    const amounts = calculateInvoiceAmounts(59.99, 20)
    const invoiceNumber = generateInvoiceNumber()
    
    // Formater la période
    const periodStart = new Date((subscription as any).current_period_start * 1000)
    const periodEnd = new Date((subscription as any).current_period_end * 1000)
    const period = `${periodStart.toLocaleDateString('fr-FR')} - ${periodEnd.toLocaleDateString('fr-FR')}`

    // Générer le HTML de la facture
    const invoiceHTML = generateInvoiceHTML({
      invoiceNumber,
      invoiceDate: new Date().toLocaleDateString('fr-FR'),
      customerName: garageData?.nom || customer.name || customer.email || 'Client',
      customerEmail: customer.email || '',
      customerAddress: garageData?.adresse ? `${garageData.adresse}, ${garageData.codePostal} ${garageData.ville}` : undefined,
      amountHT: amounts.amountHT,
      vatRate: amounts.vatRate,
      amountTVA: amounts.amountTVA,
      amountTTC: amounts.amountTTC,
      description: 'Abonnement GaragePro - Plan Pro',
      period,
    })

    // Sauvegarder la facture dans Firestore
    const invoiceRef = await adminDb.collection('invoices').add({
      userId,
      invoiceNumber,
      stripeInvoiceId: invoice.id,
      stripeCustomerId: invoice.customer,
      amountHT: amounts.amountHT,
      amountTVA: amounts.amountTVA,
      amountTTC: amounts.amountTTC,
      vatRate: amounts.vatRate,
      status: 'paid',
      type: 'subscription',
      description: 'Abonnement GaragePro - Plan Pro',
      period,
      invoiceHTML,
      createdAt: Timestamp.now(),
      paidAt: Timestamp.now(),
    })

    // Envoyer l'email avec la facture
    const invoiceUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/invoices/${invoiceRef.id}`
    
    await sendEmail({
      to: customer.email!,
      ...invoiceEmail({
        prenom: userData?.prenom || garageData?.nom || 'Client',
        invoiceNumber,
        amountTTC: amounts.amountTTC,
        invoiceUrl,
      }),
    })

    console.log(`✓ Facture ${invoiceNumber} générée et envoyée`)
  } catch (error) {
    console.error('Erreur génération facture:', error)
    // On continue même si la facture échoue
  }
}

// Gérer l'échec de paiement
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const subscriptionId = (invoice as any).subscription as string | undefined

  if (!subscriptionId) return

  const subscription = await stripe.subscriptions.retrieve(subscriptionId)
  const userId = subscription.metadata?.userId

  if (!userId) return

  // Mettre à jour le statut de l'abonnement
  const subscriptionsRef = adminDb.collection('subscriptions')
  const snapshot = await subscriptionsRef
    .where('userId', '==', userId)
    .where('stripeSubscriptionId', '==', subscriptionId)
    .limit(1)
    .get()

  if (!snapshot.empty) {
    const doc = snapshot.docs[0]
    await doc.ref.update({
      status: 'past_due',
      updatedAt: Timestamp.now(),
    })
  }
}

// Fonction utilitaire pour sauvegarder/mettre à jour l'abonnement
async function saveSubscription(
  userId: string,
  customerId: string,
  subscription: Stripe.Subscription
) {
  const sub = subscription as any
  const subscriptionData = {
    userId,
    stripeCustomerId: customerId,
    stripeSubscriptionId: subscription.id,
    stripePriceId: subscription.items.data[0].price.id,
    status: subscription.status,
    currentPeriodStart: Timestamp.fromDate(new Date(sub.current_period_start * 1000)),
    currentPeriodEnd: Timestamp.fromDate(new Date(sub.current_period_end * 1000)),
    cancelAtPeriodEnd: sub.cancel_at_period_end || false,
    updatedAt: Timestamp.now(),
  }

  const subscriptionsRef = adminDb.collection('subscriptions')
  const snapshot = await subscriptionsRef
    .where('userId', '==', userId)
    .where('stripeSubscriptionId', '==', subscription.id)
    .limit(1)
    .get()

  if (snapshot.empty) {
    // Créer un nouveau document
    await subscriptionsRef.add({
      ...subscriptionData,
      createdAt: Timestamp.now(),
    })
  } else {
    // Mettre à jour le document existant
    const doc = snapshot.docs[0]
    await doc.ref.update(subscriptionData)
  }
}
