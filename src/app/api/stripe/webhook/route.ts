import { NextRequest, NextResponse } from 'next/server'
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

// ============================================
// HELPER: Mettre à jour le garage
// ============================================
async function updateGarageSubscription(
  userId: string,
  data: {
    plan?: 'demo' | 'pro'
    stripeCustomerId?: string
    stripeSubscriptionId?: string
    subscriptionStatus?: 'active' | 'past_due' | 'canceled' | 'unpaid' | 'trialing'
    subscriptionCurrentPeriodEnd?: Timestamp
  }
) {
  const garageSnapshot = await adminDb.collection('garages').where('userId', '==', userId).limit(1).get()

  if (!garageSnapshot.empty) {
    const garageDoc = garageSnapshot.docs[0]
    await garageDoc.ref.update({
      ...data,
      updatedAt: Timestamp.now()
    })
    console.log(`✓ Garage ${garageDoc.id} mis à jour: plan=${data.plan}, status=${data.subscriptionStatus}`)
  } else {
    console.error(`Garage non trouvé pour userId: ${userId}`)
  }
}

// ============================================
// HELPER: Envoyer email de rappel de paiement
// ============================================
async function sendPaymentReminderEmail(userId: string, invoice: Stripe.Invoice) {
  try {
    const garageSnapshot = await adminDb.collection('garages').where('userId', '==', userId).limit(1).get()
    if (garageSnapshot.empty) return

    const garage = garageSnapshot.docs[0].data()
    const email = garage.email
    const garageName = garage.nom

    if (!email) {
      console.error('Email du garage non trouvé')
      return
    }

    // Générer le lien de mise à jour du moyen de paiement
    const updatePaymentUrl = `${process.env.NEXT_PUBLIC_APP_URL}/upgrade?retry=true`

    await sendEmail({
      to: email,
      subject: '⚠️ Échec de paiement - GaragePro',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #18181b 0%, #27272a 100%); padding: 32px; text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">GaragePro</h1>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px 32px;">
                      <div style="text-align: center; margin-bottom: 24px;">
                        <div style="width: 64px; height: 64px; background-color: #fef2f2; border-radius: 50%; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center;">
                          <span style="font-size: 32px;">⚠️</span>
                        </div>
                      </div>
                      
                      <h2 style="margin: 0 0 16px; font-size: 22px; color: #18181b; text-align: center;">
                        Échec du paiement
                      </h2>
                      
                      <p style="margin: 0 0 24px; font-size: 16px; color: #52525b; line-height: 1.6;">
                        Bonjour ${garageName},
                      </p>
                      
                      <p style="margin: 0 0 16px; font-size: 16px; color: #52525b; line-height: 1.6;">
                        Nous n'avons pas pu prélever le montant de votre abonnement GaragePro Pro.
                      </p>
                      
                      <p style="margin: 0 0 24px; font-size: 16px; color: #52525b; line-height: 1.6;">
                        <strong>Conséquences :</strong><br>
                        • Votre accès aux fonctionnalités Pro est temporairement suspendu<br>
                        • Vous êtes limité à 5 clients et 5 véhicules<br>
                        • Vos données restent en sécurité
                      </p>
                      
                      <p style="margin: 0 0 32px; font-size: 16px; color: #52525b; line-height: 1.6;">
                        Pour réactiver votre abonnement, cliquez sur le bouton ci-dessous pour mettre à jour votre moyen de paiement :
                      </p>
                      
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td align="center">
                            <a href="${updatePaymentUrl}" style="display: inline-block; background-color: #18181b; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 12px;">
                              Mettre à jour mon paiement
                            </a>
                          </td>
                        </tr>
                      </table>
                      
                      <p style="margin: 32px 0 0; font-size: 14px; color: #71717a; line-height: 1.6; text-align: center;">
                        Si vous avez des questions, répondez à cet email ou contactez notre support à support@garagepro.fr
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f4f4f5; padding: 24px 32px; text-align: center;">
                      <p style="margin: 0; font-size: 13px; color: #71717a;">
                        © ${new Date().getFullYear()} GaragePro - Tous droits réservés
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `
    })

    console.log(`✓ Email de rappel de paiement envoyé à ${email}`)
  } catch (error) {
    console.error('Erreur envoi email de rappel:', error)
  }
}

// ============================================
// HANDLERS
// ============================================

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

  // Sauvegarder l'abonnement
  await saveSubscription(userId, customerId, subscription)

  // Mettre à jour le garage avec le plan Pro
  const sub = subscription as any
  await updateGarageSubscription(userId, {
    plan: 'pro',
    stripeCustomerId: customerId,
    stripeSubscriptionId: subscriptionId,
    subscriptionStatus: subscription.status as any,
    subscriptionCurrentPeriodEnd: Timestamp.fromDate(new Date(sub.current_period_end * 1000))
  })

  console.log(`✓ Checkout complété pour ${userId}, plan activé: Pro`)
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

  const sub = subscription as any
  await updateGarageSubscription(userId, {
    plan: 'pro',
    stripeCustomerId: customerId,
    stripeSubscriptionId: subscription.id,
    subscriptionStatus: subscription.status as any,
    subscriptionCurrentPeriodEnd: Timestamp.fromDate(new Date(sub.current_period_end * 1000))
  })
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

  const sub = subscription as any
  const isPro = subscription.status === 'active' || subscription.status === 'trialing'

  await updateGarageSubscription(userId, {
    plan: isPro ? 'pro' : 'demo',
    subscriptionStatus: subscription.status as any,
    subscriptionCurrentPeriodEnd: Timestamp.fromDate(new Date(sub.current_period_end * 1000))
  })
}

// Gérer la suppression d'abonnement
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId

  if (!userId) {
    console.error('userId manquant dans les metadata')
    return
  }

  // Mettre à jour le statut de l'abonnement dans la collection subscriptions
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

  // Rétrograder le garage au plan démo
  await updateGarageSubscription(userId, {
    plan: 'demo',
    subscriptionStatus: 'canceled'
  })

  console.log(`⚠️ Abonnement annulé pour ${userId}, plan rétrogradé à Démo`)
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

  // Réactiver le plan Pro sur le garage
  const sub = subscription as any
  await updateGarageSubscription(userId, {
    plan: 'pro',
    subscriptionStatus: 'active',
    subscriptionCurrentPeriodEnd: Timestamp.fromDate(new Date(sub.current_period_end * 1000))
  })

  // Générer et envoyer la facture
  try {
    const customer = await stripe.customers.retrieve(invoice.customer as string) as Stripe.Customer
    const userDoc = await adminDb.collection('users').doc(userId).get()
    const userData = userDoc.data()

    const garageSnapshot = await adminDb.collection('garages').where('userId', '==', userId).limit(1).get()
    const garageData = !garageSnapshot.empty ? garageSnapshot.docs[0].data() : null

    const amounts = calculateInvoiceAmounts(59.99, 20)
    const invoiceNumber = generateInvoiceNumber()

    const periodStart = new Date(sub.current_period_start * 1000)
    const periodEnd = new Date(sub.current_period_end * 1000)
    const period = `${periodStart.toLocaleDateString('fr-FR')} - ${periodEnd.toLocaleDateString('fr-FR')}`

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

  // Rétrograder le garage au plan démo avec statut past_due
  await updateGarageSubscription(userId, {
    plan: 'demo', // Rétrograder au plan démo
    subscriptionStatus: 'past_due'
  })

  console.log(`⚠️ Paiement échoué pour ${userId}`)

  // Envoyer l'email de rappel de paiement
  await sendPaymentReminderEmail(userId, invoice)
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
    await subscriptionsRef.add({
      ...subscriptionData,
      createdAt: Timestamp.now(),
    })
  } else {
    const doc = snapshot.docs[0]
    await doc.ref.update(subscriptionData)
  }
}
