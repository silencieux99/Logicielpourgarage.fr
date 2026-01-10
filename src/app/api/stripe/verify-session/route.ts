import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { adminDb } from '@/lib/firebase-admin'
import { Timestamp } from 'firebase-admin/firestore'

export async function POST(req: NextRequest) {
    try {
        const { sessionId, userId } = await req.json()

        if (!sessionId || !userId) {
            return NextResponse.json(
                { error: 'Session ID et User ID requis' },
                { status: 400 }
            )
        }

        // Récupérer la session Stripe
        const session = await stripe.checkout.sessions.retrieve(sessionId)

        if (session.payment_status !== 'paid' && session.status !== 'complete') {
            return NextResponse.json(
                { error: 'Paiement non complété', status: session.status },
                { status: 400 }
            )
        }

        const subscriptionId = session.subscription as string
        const customerId = session.customer as string

        if (!subscriptionId) {
            return NextResponse.json(
                { error: 'Aucun abonnement trouvé' },
                { status: 400 }
            )
        }

        // Récupérer l'abonnement séparément pour avoir toutes les données
        const subscription = await stripe.subscriptions.retrieve(subscriptionId)

        // Mettre à jour le garage
        const garageSnapshot = await adminDb
            .collection('garages')
            .where('userId', '==', userId)
            .limit(1)
            .get()

        if (garageSnapshot.empty) {
            return NextResponse.json(
                { error: 'Garage non trouvé' },
                { status: 404 }
            )
        }

        const garageDoc = garageSnapshot.docs[0]

        // Créer la date de fin de période
        const periodEnd = subscription.current_period_end
            ? new Date(subscription.current_period_end * 1000)
            : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // +30 jours par défaut

        await garageDoc.ref.update({
            plan: 'pro',
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscription.id,
            subscriptionStatus: subscription.status,
            subscriptionCurrentPeriodEnd: Timestamp.fromDate(periodEnd),
            updatedAt: Timestamp.now()
        })

        // Sauvegarder/mettre à jour dans la collection subscriptions
        const subscriptionsRef = adminDb.collection('subscriptions')
        const existingSubscription = await subscriptionsRef
            .where('userId', '==', userId)
            .where('stripeSubscriptionId', '==', subscription.id)
            .limit(1)
            .get()

        const periodStart = subscription.current_period_start
            ? new Date(subscription.current_period_start * 1000)
            : new Date()

        const subscriptionData = {
            userId,
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscription.id,
            stripePriceId: subscription.items.data[0]?.price?.id || null,
            status: subscription.status,
            currentPeriodStart: Timestamp.fromDate(periodStart),
            currentPeriodEnd: Timestamp.fromDate(periodEnd),
            cancelAtPeriodEnd: subscription.cancel_at_period_end || false,
            updatedAt: Timestamp.now(),
        }

        if (existingSubscription.empty) {
            await subscriptionsRef.add({
                ...subscriptionData,
                createdAt: Timestamp.now(),
            })
        } else {
            await existingSubscription.docs[0].ref.update(subscriptionData)
        }

        console.log(`✓ Abonnement activé pour userId: ${userId}, garageId: ${garageDoc.id}`)

        return NextResponse.json({
            success: true,
            plan: 'pro',
            subscriptionId: subscription.id,
            status: subscription.status
        })
    } catch (error: any) {
        console.error('Erreur vérification session:', error)
        return NextResponse.json(
            { error: error.message || 'Erreur lors de la vérification' },
            { status: 500 }
        )
    }
}
