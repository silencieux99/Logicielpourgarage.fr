import nodemailer from 'nodemailer'

// Configuration du transporteur email
export const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.hostinger.com',
  port: parseInt(process.env.EMAIL_PORT || '465'),
  secure: true, // true pour le port 465
  auth: {
    user: process.env.EMAIL_USER, // contact@logicielpourgarage.fr
    pass: process.env.EMAIL_PASSWORD,
  },
})

// Vérifier la connexion
export async function verifyEmailConnection() {
  try {
    await transporter.verify()
    console.log('✓ Serveur email prêt')
    return true
  } catch (error) {
    console.error('✗ Erreur connexion email:', error)
    return false
  }
}

// Types d'emails
export interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

// Fonction d'envoi d'email
export async function sendEmail({ to, subject, html, text }: EmailOptions) {
  try {
    const info = await transporter.sendMail({
      from: `"GaragePro" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
      text: text || stripHtml(html),
    })

    console.log('✓ Email envoyé:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('✗ Erreur envoi email:', error)
    return { success: false, error }
  }
}

// Fonction utilitaire pour extraire le texte du HTML
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
}
