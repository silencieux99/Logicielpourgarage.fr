// Template de base pour tous les emails
const baseTemplate = (content: string) => `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>GaragePro</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #fafafa;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fafafa; padding: 40px 20px;">
    <tr>
      <td align="center">
        <!-- Container principal -->
        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);">
          
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 32px; text-align: center; border-bottom: 1px solid #f4f4f5;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #18181b; letter-spacing: -0.5px;">
                GaragePro
              </h1>
              <p style="margin: 8px 0 0; font-size: 14px; color: #71717a;">
                Logiciel de gestion pour garage automobile
              </p>
            </td>
          </tr>

          <!-- Contenu -->
          <tr>
            <td style="padding: 40px;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 32px 40px; background-color: #fafafa; border-top: 1px solid #f4f4f5;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding-bottom: 16px;">
                    <p style="margin: 0; font-size: 13px; color: #71717a; line-height: 1.6;">
                      Besoin d'aide ? Contactez-nous à 
                      <a href="mailto:contact@logicielpourgarage.fr" style="color: #18181b; text-decoration: none; font-weight: 500;">contact@logicielpourgarage.fr</a>
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 16px; border-top: 1px solid #e4e4e7;">
                    <p style="margin: 0; font-size: 12px; color: #a1a1aa; line-height: 1.5;">
                      © ${new Date().getFullYear()} GaragePro. Tous droits réservés.<br>
                      Logiciel de gestion pour professionnels de l'automobile.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 12px;">
                    <p style="margin: 0; font-size: 11px; color: #a1a1aa;">
                      <a href="#" style="color: #a1a1aa; text-decoration: none; margin-right: 12px;">Mentions légales</a>
                      <a href="#" style="color: #a1a1aa; text-decoration: none; margin-right: 12px;">Confidentialité</a>
                      <a href="#" style="color: #a1a1aa; text-decoration: none;">Se désabonner</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`

// Email de bienvenue
export const welcomeEmail = (data: {
  prenom: string
  nomGarage: string
  email: string
}) => {
  const content = `
    <h2 style="margin: 0 0 16px; font-size: 24px; font-weight: 700; color: #18181b; line-height: 1.3;">
      Bienvenue ${data.prenom} ! 🎉
    </h2>
    
    <p style="margin: 0 0 24px; font-size: 15px; color: #52525b; line-height: 1.6;">
      Nous sommes ravis de vous accueillir sur <strong>GaragePro</strong>. Votre compte <strong>${data.nomGarage}</strong> a été créé avec succès.
    </p>

    <!-- Carte d'information -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 24px; background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px;">
      <tr>
        <td style="padding: 20px;">
          <p style="margin: 0 0 8px; font-size: 14px; font-weight: 600; color: #166534;">
            ✓ Version gratuite activée
          </p>
          <p style="margin: 0; font-size: 14px; color: #15803d; line-height: 1.5;">
            Vous pouvez gérer jusqu'à <strong>5 clients</strong> et <strong>5 véhicules</strong> gratuitement. Passez au plan Pro à tout moment pour débloquer toutes les fonctionnalités.
          </p>
        </td>
      </tr>
    </table>

    <h3 style="margin: 0 0 16px; font-size: 18px; font-weight: 600; color: #18181b;">
      Prochaines étapes
    </h3>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 32px;">
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #f4f4f5;">
          <p style="margin: 0; font-size: 15px; color: #18181b; font-weight: 500;">
            1. Configurez votre garage
          </p>
          <p style="margin: 4px 0 0; font-size: 14px; color: #71717a;">
            Personnalisez vos paramètres de facturation et vos tarifs
          </p>
        </td>
      </tr>
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #f4f4f5;">
          <p style="margin: 0; font-size: 15px; color: #18181b; font-weight: 500;">
            2. Ajoutez vos premiers clients
          </p>
          <p style="margin: 4px 0 0; font-size: 14px; color: #71717a;">
            Centralisez toutes les informations de vos clients
          </p>
        </td>
      </tr>
      <tr>
        <td style="padding: 12px 0;">
          <p style="margin: 0; font-size: 15px; color: #18181b; font-weight: 500;">
            3. Créez votre premier devis
          </p>
          <p style="margin: 4px 0 0; font-size: 14px; color: #71717a;">
            Documents professionnels en quelques clics
          </p>
        </td>
      </tr>
    </table>

    <!-- Bouton CTA -->
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" style="padding: 8px 0 24px;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard" 
             style="display: inline-block; padding: 14px 32px; background-color: #18181b; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 600; border-radius: 8px;">
            Accéder à mon espace
          </a>
        </td>
      </tr>
    </table>

    <p style="margin: 0; font-size: 14px; color: #71717a; line-height: 1.6;">
      Si vous avez des questions, notre équipe est là pour vous aider. N'hésitez pas à nous contacter.
    </p>

    <p style="margin: 24px 0 0; font-size: 14px; color: #71717a;">
      À bientôt,<br>
      <strong style="color: #18181b;">L'équipe GaragePro</strong>
    </p>
  `

  return {
    subject: `Bienvenue sur GaragePro, ${data.prenom} !`,
    html: baseTemplate(content),
  }
}

// Email de vérification
export const verificationEmail = (data: {
  prenom: string
  verificationUrl: string
}) => {
  const content = `
    <h2 style="margin: 0 0 16px; font-size: 24px; font-weight: 700; color: #18181b; line-height: 1.3;">
      Vérifiez votre adresse email
    </h2>
    
    <p style="margin: 0 0 24px; font-size: 15px; color: #52525b; line-height: 1.6;">
      Bonjour ${data.prenom},
    </p>

    <p style="margin: 0 0 24px; font-size: 15px; color: #52525b; line-height: 1.6;">
      Merci de vous être inscrit sur GaragePro. Pour activer votre compte, veuillez cliquer sur le bouton ci-dessous :
    </p>

    <!-- Bouton CTA -->
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" style="padding: 8px 0 24px;">
          <a href="${data.verificationUrl}" 
             style="display: inline-block; padding: 14px 32px; background-color: #18181b; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 600; border-radius: 8px;">
            Vérifier mon email
          </a>
        </td>
      </tr>
    </table>

    <p style="margin: 0 0 24px; font-size: 14px; color: #71717a; line-height: 1.6;">
      Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :<br>
      <a href="${data.verificationUrl}" style="color: #18181b; word-break: break-all;">${data.verificationUrl}</a>
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 24px 0; background-color: #fef3c7; border: 1px solid #fde68a; border-radius: 8px;">
      <tr>
        <td style="padding: 16px;">
          <p style="margin: 0; font-size: 13px; color: #92400e; line-height: 1.5;">
            ⚠️ Ce lien expire dans 24 heures. Si vous n'avez pas demandé cette vérification, vous pouvez ignorer cet email.
          </p>
        </td>
      </tr>
    </table>
  `

  return {
    subject: 'Vérifiez votre adresse email - GaragePro',
    html: baseTemplate(content),
  }
}

// Email avec facture
export const invoiceEmail = (data: {
  prenom: string
  invoiceNumber: string
  amountTTC: number
  invoiceUrl: string
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount)
  }

  const content = `
    <h2 style="margin: 0 0 16px; font-size: 24px; font-weight: 700; color: #18181b; line-height: 1.3;">
      Votre facture est disponible
    </h2>
    
    <p style="margin: 0 0 24px; font-size: 15px; color: #52525b; line-height: 1.6;">
      Bonjour ${data.prenom},
    </p>

    <p style="margin: 0 0 24px; font-size: 15px; color: #52525b; line-height: 1.6;">
      Merci pour votre paiement ! Votre abonnement GaragePro a bien été activé.
    </p>

    <!-- Carte facture -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 24px; background-color: #fafafa; border: 1px solid #e4e4e7; border-radius: 8px;">
      <tr>
        <td style="padding: 24px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding-bottom: 12px; border-bottom: 1px solid #e4e4e7;">
                <p style="margin: 0; font-size: 13px; color: #71717a;">Numéro de facture</p>
                <p style="margin: 4px 0 0; font-size: 16px; font-weight: 600; color: #18181b;">${data.invoiceNumber}</p>
              </td>
            </tr>
            <tr>
              <td style="padding-top: 12px;">
                <p style="margin: 0; font-size: 13px; color: #71717a;">Montant TTC</p>
                <p style="margin: 4px 0 0; font-size: 20px; font-weight: 700; color: #18181b;">${formatCurrency(data.amountTTC)}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- Bouton CTA -->
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" style="padding: 8px 0 24px;">
          <a href="${data.invoiceUrl}" 
             style="display: inline-block; padding: 14px 32px; background-color: #18181b; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 600; border-radius: 8px;">
            Télécharger la facture
          </a>
        </td>
      </tr>
    </table>

    <p style="margin: 0 0 24px; font-size: 14px; color: #71717a; line-height: 1.6;">
      Vous pouvez également retrouver cette facture dans votre espace client, section "Documents".
    </p>

    <p style="margin: 0; font-size: 14px; color: #71717a;">
      Cordialement,<br>
      <strong style="color: #18181b;">L'équipe GaragePro</strong>
    </p>
  `

  return {
    subject: `Votre facture ${data.invoiceNumber} - GaragePro`,
    html: baseTemplate(content),
  }
}

// Email de réinitialisation de mot de passe
export const resetPasswordEmail = (data: {
  prenom: string
  resetUrl: string
}) => {
  const content = `
    <h2 style="margin: 0 0 16px; font-size: 24px; font-weight: 700; color: #18181b; line-height: 1.3;">
      Réinitialisation de votre mot de passe
    </h2>
    
    <p style="margin: 0 0 24px; font-size: 15px; color: #52525b; line-height: 1.6;">
      Bonjour ${data.prenom},
    </p>

    <p style="margin: 0 0 24px; font-size: 15px; color: #52525b; line-height: 1.6;">
      Nous avons reçu une demande de réinitialisation de mot de passe pour votre compte GaragePro. Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :
    </p>

    <!-- Bouton CTA -->
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" style="padding: 8px 0 24px;">
          <a href="${data.resetUrl}" 
             style="display: inline-block; padding: 14px 32px; background-color: #18181b; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 600; border-radius: 8px;">
            Réinitialiser mon mot de passe
          </a>
        </td>
      </tr>
    </table>

    <p style="margin: 0 0 24px; font-size: 14px; color: #71717a; line-height: 1.6;">
      Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :<br>
      <a href="${data.resetUrl}" style="color: #18181b; word-break: break-all;">${data.resetUrl}</a>
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 24px 0; background-color: #fef3c7; border: 1px solid #fde68a; border-radius: 8px;">
      <tr>
        <td style="padding: 16px;">
          <p style="margin: 0; font-size: 13px; color: #92400e; line-height: 1.5;">
            ⚠️ Ce lien expire dans 1 heure. Si vous n'avez pas demandé cette réinitialisation, veuillez ignorer cet email et votre mot de passe restera inchangé.
          </p>
        </td>
      </tr>
    </table>
  `

  return {
    subject: 'Réinitialisation de votre mot de passe - GaragePro',
    html: baseTemplate(content),
  }
}
