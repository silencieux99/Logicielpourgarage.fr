// Template de facture professionnel
export interface InvoiceData {
  invoiceNumber: string
  invoiceDate: string
  customerName: string
  customerEmail: string
  customerAddress?: string
  amountHT: number // 59.99
  vatRate: number // 20%
  amountTVA: number
  amountTTC: number
  description: string
  period: string
}

export const generateInvoiceHTML = (data: InvoiceData): string => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount)
  }

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Facture ${data.invoiceNumber}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #1a1a1a;
      background: #ffffff;
    }
    .container { max-width: 800px; margin: 0 auto; padding: 40px 20px; }
    .header { margin-bottom: 50px; }
    .header-top { display: flex; justify-content: space-between; align-items: start; margin-bottom: 30px; }
    .company-info h1 { font-size: 24px; font-weight: 700; color: #000; margin-bottom: 8px; }
    .company-info p { font-size: 13px; color: #666; line-height: 1.8; }
    .invoice-badge { 
      background: #000; 
      color: #fff; 
      padding: 8px 20px; 
      border-radius: 4px;
      font-size: 14px;
      font-weight: 600;
      text-align: right;
    }
    .invoice-details { 
      background: #f8f8f8; 
      padding: 20px; 
      border-radius: 8px;
      margin-bottom: 40px;
    }
    .invoice-details-grid { 
      display: grid; 
      grid-template-columns: repeat(2, 1fr); 
      gap: 20px;
    }
    .detail-item label { 
      display: block; 
      font-size: 11px; 
      text-transform: uppercase; 
      letter-spacing: 0.5px;
      color: #666; 
      margin-bottom: 4px;
      font-weight: 600;
    }
    .detail-item value { 
      display: block; 
      font-size: 14px; 
      color: #000;
      font-weight: 500;
    }
    .billing-section { margin-bottom: 40px; }
    .billing-section h2 { 
      font-size: 12px; 
      text-transform: uppercase; 
      letter-spacing: 0.5px;
      color: #666; 
      margin-bottom: 12px;
      font-weight: 600;
    }
    .billing-section p { font-size: 14px; color: #000; line-height: 1.8; }
    .items-table { 
      width: 100%; 
      border-collapse: collapse; 
      margin-bottom: 30px;
      border: 1px solid #e5e5e5;
    }
    .items-table thead { background: #fafafa; }
    .items-table th { 
      padding: 14px 16px; 
      text-align: left; 
      font-size: 11px; 
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #666;
      font-weight: 600;
      border-bottom: 2px solid #e5e5e5;
    }
    .items-table th:last-child,
    .items-table td:last-child { text-align: right; }
    .items-table td { 
      padding: 16px; 
      border-bottom: 1px solid #f0f0f0;
      font-size: 14px;
      color: #1a1a1a;
    }
    .items-table tbody tr:last-child td { border-bottom: none; }
    .totals { 
      margin-left: auto; 
      width: 300px;
      background: #fafafa;
      padding: 20px;
      border-radius: 8px;
    }
    .total-row { 
      display: flex; 
      justify-content: space-between; 
      padding: 10px 0;
      font-size: 14px;
    }
    .total-row.subtotal { 
      border-bottom: 1px solid #e5e5e5;
      margin-bottom: 10px;
      padding-bottom: 12px;
    }
    .total-row.final { 
      border-top: 2px solid #000;
      margin-top: 10px;
      padding-top: 16px;
      font-size: 18px;
      font-weight: 700;
    }
    .total-row label { color: #666; }
    .total-row.final label { color: #000; }
    .total-row value { font-weight: 600; color: #000; }
    .footer { 
      margin-top: 60px; 
      padding-top: 30px; 
      border-top: 1px solid #e5e5e5;
      text-align: center;
    }
    .footer p { 
      font-size: 12px; 
      color: #999; 
      line-height: 1.8;
    }
    .footer-legal { 
      margin-top: 20px; 
      padding-top: 20px; 
      border-top: 1px solid #f0f0f0;
    }
    @media print {
      body { background: white; }
      .container { padding: 0; }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <div class="header-top">
        <div class="company-info">
          <h1>MG COMPANY DAYA LTD</h1>
          <p>
            71-75 Shelton Street, Covent Garden<br>
            London WC2H 9JQ<br>
            United Kingdom
          </p>
          <p style="margin-top: 12px;">
            <strong>N° Société:</strong> 16707902<br>
            <strong>N° TVA:</strong> GB123456789
          </p>
        </div>
        <div class="invoice-badge">
          FACTURE
        </div>
      </div>

      <!-- Invoice Details -->
      <div class="invoice-details">
        <div class="invoice-details-grid">
          <div class="detail-item">
            <label>Numéro de facture</label>
            <value>${data.invoiceNumber}</value>
          </div>
          <div class="detail-item">
            <label>Date d'émission</label>
            <value>${data.invoiceDate}</value>
          </div>
          <div class="detail-item">
            <label>Période de facturation</label>
            <value>${data.period}</value>
          </div>
          <div class="detail-item">
            <label>Statut</label>
            <value>Payée</value>
          </div>
        </div>
      </div>
    </div>

    <!-- Billing Information -->
    <div class="billing-section">
      <h2>Facturé à</h2>
      <p>
        <strong>${data.customerName}</strong><br>
        ${data.customerEmail}
        ${data.customerAddress ? `<br>${data.customerAddress}` : ''}
      </p>
    </div>

    <!-- Items Table -->
    <table class="items-table">
      <thead>
        <tr>
          <th>Description</th>
          <th style="width: 100px;">Quantité</th>
          <th style="width: 120px;">Prix unitaire HT</th>
          <th style="width: 120px;">Total HT</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <strong>${data.description}</strong><br>
            <span style="font-size: 13px; color: #666;">Abonnement mensuel - ${data.period}</span>
          </td>
          <td>1</td>
          <td>${formatCurrency(data.amountHT)}</td>
          <td>${formatCurrency(data.amountHT)}</td>
        </tr>
      </tbody>
    </table>

    <!-- Totals -->
    <div class="totals">
      <div class="total-row subtotal">
        <label>Sous-total HT</label>
        <value>${formatCurrency(data.amountHT)}</value>
      </div>
      <div class="total-row">
        <label>TVA (${data.vatRate}%)</label>
        <value>${formatCurrency(data.amountTVA)}</value>
      </div>
      <div class="total-row final">
        <label>Total TTC</label>
        <value>${formatCurrency(data.amountTTC)}</value>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p>
        <strong>Merci pour votre confiance !</strong><br>
        Cette facture a été générée automatiquement et est valable sans signature.
      </p>
      
      <div class="footer-legal">
        <p>
          MG COMPANY DAYA LTD - Société privée à responsabilité limitée<br>
          Enregistrée en Angleterre et au Pays de Galles sous le numéro 16707902<br>
          Siège social: 71-75 Shelton Street, Covent Garden, London WC2H 9JQ, United Kingdom
        </p>
      </div>
    </div>
  </div>
</body>
</html>
`
}

// Générer le numéro de facture
export const generateInvoiceNumber = (): string => {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const timestamp = Date.now().toString().slice(-6)
  return `INV-${year}${month}-${timestamp}`
}

// Calculer les montants avec TVA
export const calculateInvoiceAmounts = (amountHT: number, vatRate: number = 20) => {
  const amountTVA = Number((amountHT * (vatRate / 100)).toFixed(2))
  const amountTTC = Number((amountHT + amountTVA).toFixed(2))
  
  return {
    amountHT,
    vatRate,
    amountTVA,
    amountTTC,
  }
}
