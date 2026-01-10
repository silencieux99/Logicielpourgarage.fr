import { NextRequest, NextResponse } from 'next/server'
import { stripe, STRIPE_PRICES } from '@/lib/stripe'
import { adminAuth } from '@/lib/firebase-admin'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { userId, email, plan = 'monthly' } = body

    // Vérifier que l'utilisateur est authentifié
    if (!userId || !email) {
      return NextResponse.json(
        { error: 'Informations utilisateur manquantes' },
        { status: 400 }
      )
    }

    // Vérifier si le client Stripe existe déjà
    const customers = await stripe.customers.list({
      email: email,
      limit: 1,
    })

    let customerId: string

    if (customers.data.length > 0) {
      customerId = customers.data[0].id
    } else {
      // Créer un nouveau client Stripe
      const customer = await stripe.customers.create({
        email: email,
        metadata: {
          userId: userId,
        },
      })
      customerId = customer.id
    }

    // Créer la session de checkout
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: STRIPE_PRICES.monthly,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/upgrade/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/upgrade?canceled=true`,
      metadata: {
        userId: userId,
      },
      subscription_data: {
        metadata: {
          userId: userId,
        },
        // No trial period - charge immediately
      },
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      customer_update: {
        address: 'auto',
        name: 'auto',
      },
    })

    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (error: any) {
    console.error('Erreur création session Stripe:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la création de la session' },
      { status: 500 }
    )
  }
}
