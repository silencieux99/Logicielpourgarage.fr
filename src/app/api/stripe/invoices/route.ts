import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { adminDb } from '@/lib/firebase-admin'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-12-15.clover',
})

export async function POST(request: NextRequest) {
    try {
        const { userId } = await request.json()

        if (!userId) {
            return NextResponse.json({ error: 'userId requis' }, { status: 400 })
        }

        // Récupérer le garage et son customerId Stripe via Firebase Admin
        const garagesSnapshot = await adminDb
            .collection('garages')
            .where('userId', '==', userId)
            .limit(1)
            .get()

        if (garagesSnapshot.empty) {
            return NextResponse.json({ invoices: [] })
        }

        const garage = garagesSnapshot.docs[0].data()

        if (!garage.stripeCustomerId) {
            return NextResponse.json({ invoices: [] })
        }

        // Récupérer les factures depuis Stripe
        const invoices = await stripe.invoices.list({
            customer: garage.stripeCustomerId,
            limit: 12, // 12 dernières factures
        })

        // Formater les factures
        const formattedInvoices = invoices.data.map(invoice => ({
            id: invoice.id,
            number: invoice.number,
            date: invoice.created,
            amount: invoice.amount_paid / 100,
            status: invoice.status,
            pdfUrl: invoice.invoice_pdf,
            hostedUrl: invoice.hosted_invoice_url,
        }))

        return NextResponse.json({ invoices: formattedInvoices })

    } catch (error) {
        console.error('Erreur récupération factures:', error)
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
    }
}
