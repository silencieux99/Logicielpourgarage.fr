import { NextRequest, NextResponse } from 'next/server'
import { sendEmail, verifyEmailConnection } from '@/lib/email'
import { welcomeEmail } from '@/lib/email-templates'

export async function GET(req: NextRequest) {
  try {
    // Vérifier la connexion
    const isConnected = await verifyEmailConnection()

    if (!isConnected) {
      return NextResponse.json(
        { error: 'Impossible de se connecter au serveur email' },
        { status: 500 }
      )
    }

    // Envoyer un email de test
    const testEmail = welcomeEmail({
      prenom: 'Test',
      nomGarage: 'Garage Test',
      email: 'test@example.com',
    })

    const result = await sendEmail({
      to: process.env.EMAIL_USER || 'contact@logicielpourgarage.fr',
      subject: '[TEST] ' + testEmail.subject,
      html: testEmail.html,
    })

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Email de test envoyé avec succès',
        messageId: result.messageId,
      })
    } else {
      return NextResponse.json(
        { error: 'Erreur lors de l\'envoi de l\'email de test', details: result.error },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('Erreur test email:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    )
  }
}
