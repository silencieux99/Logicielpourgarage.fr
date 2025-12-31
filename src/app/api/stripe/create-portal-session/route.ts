import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { adminDb } from '@/lib/firebase-admin'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'userId manquant' },
        { status: 400 }
      )
    }

    // Récupérer l'abonnement de l'utilisateur
    const subscriptionsRef = adminDb.collection('subscriptions')
    const snapshot = await subscriptionsRef
      .where('userId', '==', userId)
      .where('status', 'in', ['active', 'trialing', 'past_due'])
      .limit(1)
      .get()

    if (snapshot.empty) {
      return NextResponse.json(
        { error: 'Aucun abonnement actif trouvé' },
        { status: 404 }
      )
    }

    const subscriptionData = snapshot.docs[0].data()
    const customerId = subscriptionData.stripeCustomerId

    // Créer une session du portail client Stripe
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/settings`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error('Erreur création portal session:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la création de la session' },
      { status: 500 }
    )
  }
}
