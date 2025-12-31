import { NextRequest, NextResponse } from 'next/server'
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
      .where('status', 'in', ['active', 'trialing'])
      .limit(1)
      .get()

    if (snapshot.empty) {
      return NextResponse.json({ hasSubscription: false })
    }

    const subscriptionData = snapshot.docs[0].data()
    
    return NextResponse.json({
      hasSubscription: true,
      subscription: {
        status: subscriptionData.status,
        currentPeriodEnd: subscriptionData.currentPeriodEnd.toDate(),
        cancelAtPeriodEnd: subscriptionData.cancelAtPeriodEnd,
      },
    })
  } catch (error: any) {
    console.error('Erreur vérification abonnement:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la vérification' },
      { status: 500 }
    )
  }
}
