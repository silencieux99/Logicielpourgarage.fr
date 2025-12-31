import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email'
import { welcomeEmail } from '@/lib/email-templates'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, prenom, nomGarage } = body

    if (!email || !prenom || !nomGarage) {
      return NextResponse.json(
        { error: 'Données manquantes' },
        { status: 400 }
      )
    }

    // Générer le template d'email
    const emailTemplate = welcomeEmail({
      prenom,
      nomGarage,
      email,
    })

    // Envoyer l'email
    const result = await sendEmail({
      to: email,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
    })

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Email de bienvenue envoyé',
      })
    } else {
      return NextResponse.json(
        { error: 'Erreur lors de l\'envoi de l\'email' },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('Erreur envoi email bienvenue:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    )
  }
}
