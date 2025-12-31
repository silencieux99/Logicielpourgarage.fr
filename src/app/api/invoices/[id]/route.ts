import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Récupérer la facture
    const invoiceDoc = await adminDb.collection('invoices').doc(id).get()

    if (!invoiceDoc.exists) {
      return NextResponse.json(
        { error: 'Facture non trouvée' },
        { status: 404 }
      )
    }

    const invoiceData = invoiceDoc.data()

    // Retourner le HTML de la facture
    return new NextResponse(invoiceData?.invoiceHTML || '', {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    })
  } catch (error: any) {
    console.error('Erreur récupération facture:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    )
  }
}
