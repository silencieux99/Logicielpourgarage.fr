"use client"

import { Building2 } from "lucide-react"

export interface InvoiceLine {
    id?: string
    designation: string
    description?: string
    quantite: number | string
    prixUnitaireHT: number
    totalHT?: number
}

export interface InvoiceTemplateData {
    type: "facture" | "devis"
    numero: string
    dateEmission: Date | string
    dateEcheance?: Date | string
    garage: {
        nom: string
        adresse: string
        codePostal: string
        ville: string
        telephone?: string
        email?: string
        siret?: string
        tva?: string
        logo?: string
    }
    client: {
        nom: string
        adresse?: string
        codePostal?: string
        ville?: string
        email?: string
    }
    vehicule?: {
        plaque?: string
        marque?: string
        modele?: string
    }
    lignes: InvoiceLine[]
    totalHT: number
    tauxTVA: number
    totalTVA: number
    totalTTC: number
    mentionsLegales?: string
    notes?: string
    modePaiement?: string
    datePaiement?: Date | string
    estPaye?: boolean
}

interface InvoiceTemplateProps {
    data: InvoiceTemplateData
    scale?: number
    className?: string
}

export function InvoiceTemplate({ data, scale = 1, className = "" }: InvoiceTemplateProps) {
    const formatDate = (d: Date | string) => {
        if (!d) return "-"
        const date = typeof d === 'string' ? new Date(d) : d
        return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 2
        }).format(amount)
    }

    const isDevis = data.type === 'devis'
    const docTitle = isDevis ? 'DEVIS' : 'FACTURE'

    // Design tokens - "Hyper Pro" aesthetic
    const colors = {
        black: '#111827',     // gray-900 (Text principal)
        darkGray: '#374151',  // gray-700 (Labels importants)
        gray: '#6B7280',      // gray-500 (Labels secondaires)
        lightGray: '#E5E7EB', // gray-200 (Bordures)
        ultraLight: '#F9FAFB',// gray-50 (Fonds alternés)
        accent: '#111827'     // Noir profond pour l'accentuation premium
    }

    return (
        <div
            className={`bg-white ${className}`}
            style={{
                width: '210mm',
                minHeight: '297mm',
                fontSize: `${11 * scale}px`, // Increased font size
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                color: colors.black,
                overflow: 'hidden',
                boxSizing: 'border-box',
                position: 'relative',
                lineHeight: '1.5'
            }}
        >
            {/* Page Padding - Compact for single page */}
            <div style={{ padding: `${20 * scale}px ${30 * scale}px` }}>

                {/* 1. HEADER: Logo & Document ID */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: `${30 * scale}px`
                }}>
                    {/* Logo Area */}
                    <div>
                        {data.garage.logo ? (
                            <img
                                src={data.garage.logo}
                                alt="Logo"
                                style={{
                                    height: `${70 * scale}px`, // Compact Logo
                                    width: 'auto',
                                    objectFit: 'contain',
                                    display: 'block'
                                }}
                            />
                        ) : (
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: `${16 * scale}px`
                            }}>
                                <div style={{
                                    width: `${50 * scale}px`,
                                    height: `${50 * scale}px`,
                                    background: colors.black,
                                    borderRadius: `${10 * scale}px`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white'
                                }}>
                                    <Building2 size={25 * scale} />
                                </div>
                                <span style={{ fontWeight: 700, fontSize: `${20 * scale}px`, letterSpacing: '-0.02em' }}>
                                    {data.garage.nom}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Document ID Block - Right Aligned */}
                    <div style={{ textAlign: 'right' }}>
                        <h1 style={{
                            fontSize: `${28 * scale}px`,  // Compact Title
                            fontWeight: 800,
                            letterSpacing: '-0.03em',
                            margin: 0,
                            lineHeight: 1,
                            color: colors.black,
                            marginBottom: `${8 * scale}px`
                        }}>
                            {docTitle}
                        </h1>
                        <p style={{
                            fontSize: `${15 * scale}px`,
                            color: colors.gray,
                            fontWeight: 500,
                            fontFamily: "'JetBrains Mono', monospace"
                        }}>
                            #{data.numero}
                        </p>
                    </div>
                </div>

                {/* 2. CONTEXT GRID: From, To, Details */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1.2fr 1.2fr 1fr',
                    gap: `${25 * scale}px`,
                    marginBottom: `${30 * scale}px`,
                    borderBottom: `1px solid ${colors.lightGray}`,
                    paddingBottom: `${25 * scale}px`
                }}>

                    {/* FROM (Garage) */}
                    <div>
                        <p style={{
                            fontSize: `${11 * scale}px`,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            color: colors.gray,
                            fontWeight: 600,
                            marginBottom: `${12 * scale}px`
                        }}>
                            Émetteur
                        </p>
                        <p style={{ fontWeight: 700, fontSize: `${12 * scale}px`, marginBottom: `${4 * scale}px` }}>
                            {data.garage.nom}
                        </p>
                        <div style={{ color: colors.darkGray, fontSize: `${11 * scale}px` }}>
                            <p>{data.garage.adresse}</p>
                            <p>{data.garage.codePostal} {data.garage.ville}</p>
                            <div style={{ marginTop: `${8 * scale}px`, display: 'flex', flexDirection: 'column', gap: `${2 * scale}px` }}>
                                {data.garage.email && <p>{data.garage.email}</p>}
                                {data.garage.telephone && <p>{data.garage.telephone}</p>}
                            </div>
                        </div>
                    </div>

                    {/* TO (Client) */}
                    <div>
                        <p style={{
                            fontSize: `${11 * scale}px`,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            color: colors.gray,
                            fontWeight: 600,
                            marginBottom: `${12 * scale}px`
                        }}>
                            Adressé à
                        </p>
                        <p style={{ fontWeight: 700, fontSize: `${12 * scale}px`, marginBottom: `${4 * scale}px` }}>
                            {data.client.nom}
                        </p>
                        <div style={{ color: colors.darkGray, fontSize: `${11 * scale}px` }}>
                            {data.client.adresse && <p>{data.client.adresse}</p>}
                            {(data.client.codePostal || data.client.ville) && (
                                <p>{data.client.codePostal} {data.client.ville}</p>
                            )}
                            {data.client.email && (
                                <p style={{ marginTop: `${8 * scale}px` }}>{data.client.email}</p>
                            )}
                        </div>
                    </div>

                    {/* DETAILS (Dates & Car) */}
                    <div style={{ textAlign: 'right' }}>
                        <p style={{
                            fontSize: `${11 * scale}px`,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            color: colors.gray,
                            fontWeight: 600,
                            marginBottom: `${12 * scale}px`
                        }}>
                            Détails
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: `${8 * scale}px` }}>
                            <div>
                                <span style={{ color: colors.gray, fontSize: `${11 * scale}px` }}>Date d'émission</span>
                                <p style={{ fontWeight: 600, fontSize: `${12 * scale}px` }}>{formatDate(data.dateEmission)}</p>
                            </div>
                            {data.dateEcheance && (
                                <div>
                                    <span style={{ color: colors.gray, fontSize: `${11 * scale}px` }}>{isDevis ? 'Validité' : 'Échéance'}</span>
                                    <p style={{ fontWeight: 600, fontSize: `${12 * scale}px` }}>{formatDate(data.dateEcheance)}</p>
                                </div>
                            )}
                            {data.vehicule?.plaque && (
                                <div style={{ marginTop: `${8 * scale}px` }}>
                                    <span style={{ color: colors.gray, fontSize: `${11 * scale}px` }}>Véhicule</span>
                                    <div style={{
                                        display: 'inline-block',
                                        background: colors.ultraLight,
                                        border: `1px solid ${colors.lightGray}`,
                                        padding: `${4 * scale}px ${8 * scale}px`,
                                        borderRadius: `${4 * scale}px`,
                                        marginTop: `${4 * scale}px`
                                    }}>
                                        <p style={{ fontWeight: 700, fontSize: `${11 * scale}px`, fontFamily: "'JetBrains Mono', monospace" }}>
                                            {data.vehicule.plaque}
                                        </p>
                                        <p style={{ fontSize: `${10 * scale}px`, color: colors.gray }}>
                                            {data.vehicule.marque} {data.vehicule.modele}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 3. ITEMS TABLE */}
                <div style={{ marginBottom: `${20 * scale}px` }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: `1px solid ${colors.black}` }}>
                                <th style={{ textAlign: 'left', padding: `${12 * scale}px 0`, textTransform: 'uppercase', fontSize: `${10 * scale}px`, fontWeight: 700, letterSpacing: '0.05em', color: colors.black }}>Description</th>
                                <th style={{ textAlign: 'center', padding: `${12 * scale}px`, textTransform: 'uppercase', fontSize: `${10 * scale}px`, fontWeight: 700, letterSpacing: '0.05em', color: colors.black, width: '10%' }}>Qté</th>
                                <th style={{ textAlign: 'right', padding: `${12 * scale}px`, textTransform: 'uppercase', fontSize: `${10 * scale}px`, fontWeight: 700, letterSpacing: '0.05em', color: colors.black, width: '15%' }}>Prix Unit.</th>
                                <th style={{ textAlign: 'right', padding: `${12 * scale}px 0`, textTransform: 'uppercase', fontSize: `${10 * scale}px`, fontWeight: 700, letterSpacing: '0.05em', color: colors.black, width: '15%' }}>Total HT</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.lignes.map((ligne, i) => {
                                const qte = typeof ligne.quantite === 'string' ? parseFloat(ligne.quantite) || 0 : ligne.quantite
                                const totalLigne = ligne.totalHT ?? (qte * ligne.prixUnitaireHT)
                                return (
                                    <tr key={i} style={{ borderBottom: `1px solid ${colors.lightGray}` }}>
                                        <td style={{ padding: `${16 * scale}px 0` }}>
                                            <p style={{ fontWeight: 600, fontSize: `${12 * scale}px`, color: colors.black }}>{ligne.designation}</p>
                                            {ligne.description && <p style={{ fontSize: `${11 * scale}px`, color: colors.gray, marginTop: `${4 * scale}px` }}>{ligne.description}</p>}
                                        </td>
                                        <td style={{ textAlign: 'center', padding: `${16 * scale}px`, fontSize: `${12 * scale}px`, color: colors.darkGray }}>{ligne.quantite}</td>
                                        <td style={{ textAlign: 'right', padding: `${16 * scale}px`, fontSize: `${12 * scale}px`, color: colors.darkGray, fontFamily: "'JetBrains Mono', monospace" }}>{formatCurrency(ligne.prixUnitaireHT)}</td>
                                        <td style={{ textAlign: 'right', padding: `${16 * scale}px 0`, fontSize: `${12 * scale}px`, fontWeight: 600, color: colors.black, fontFamily: "'JetBrains Mono', monospace" }}>{formatCurrency(totalLigne)}</td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>

                {/* 4. TOTALS */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: `${30 * scale}px` }}>
                    <div style={{ width: '40%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: `${8 * scale}px 0`, borderBottom: `1px solid ${colors.lightGray}` }}>
                            <span style={{ fontSize: `${12 * scale}px`, color: colors.gray }}>Total HT</span>
                            <span style={{ fontSize: `${12 * scale}px`, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>{formatCurrency(data.totalHT)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: `${8 * scale}px 0`, borderBottom: `1px solid ${colors.lightGray}` }}>
                            <span style={{ fontSize: `${12 * scale}px`, color: colors.gray }}>TVA ({data.tauxTVA}%)</span>
                            <span style={{ fontSize: `${12 * scale}px`, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>{formatCurrency(data.totalTVA)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: `${16 * scale}px 0`, alignItems: 'baseline' }}>
                            <span style={{ fontSize: `${15 * scale}px`, fontWeight: 700, color: colors.black }}>Total TTC</span>
                            <span style={{ fontSize: `${22 * scale}px`, fontWeight: 800, color: colors.black, fontFamily: "'JetBrains Mono', monospace" }}>{formatCurrency(data.totalTTC)}</span>
                        </div>

                        {(data.modePaiement || data.estPaye) && (
                            <div style={{ marginTop: `${15 * scale}px`, textAlign: 'right', borderTop: `1px solid ${colors.lightGray}`, paddingTop: `${10 * scale}px` }}>
                                {data.estPaye && (
                                    <div style={{
                                        display: 'inline-block',
                                        padding: `${4 * scale}px ${8 * scale}px`,
                                        border: `2px solid #059669`,
                                        color: '#059669',
                                        fontWeight: 800,
                                        fontSize: `${14 * scale}px`,
                                        borderRadius: `${4 * scale}px`,
                                        transform: 'rotate(-5deg)',
                                        marginBottom: `${8 * scale}px`,
                                        textTransform: 'uppercase'
                                    }}>
                                        PAYÉE
                                    </div>
                                )}
                                {data.modePaiement && (
                                    <p style={{ fontSize: `${12 * scale}px`, color: colors.darkGray, marginTop: `${4 * scale}px` }}>
                                        Règlement par : <strong>{data.modePaiement}</strong>
                                    </p>
                                )}
                                {data.datePaiement && (
                                    <p style={{ fontSize: `${11 * scale}px`, color: colors.gray, marginTop: `${2 * scale}px` }}>
                                        Le {formatDate(data.datePaiement)}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* 5. NOTES & FOOTER */}
                <div style={{ marginTop: 'auto' }}>
                    {data.notes && (
                        <div style={{ marginBottom: `${25 * scale}px` }}>
                            <p style={{ fontSize: `${11 * scale}px`, color: colors.gray, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: `${8 * scale}px` }}>Notes</p>
                            <p style={{ fontSize: `${12 * scale}px`, color: colors.darkGray, lineHeight: 1.6 }}>{data.notes}</p>
                        </div>
                    )}

                    <div style={{ borderTop: `1px solid ${colors.lightGray}`, paddingTop: `${24 * scale}px` }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: `${20 * scale}px` }}>
                            {/* Mentions légales */}
                            <div style={{ flex: 1 }}>
                                {data.mentionsLegales ? (
                                    <p style={{ fontSize: `${10 * scale}px`, color: colors.gray, lineHeight: 1.5 }}>
                                        {data.mentionsLegales}
                                    </p>
                                ) : (
                                    <p style={{ fontSize: `${10 * scale}px`, color: colors.gray }}>
                                        Document généré par GaragePro.
                                    </p>
                                )}
                            </div>

                            {/* Garage Legal Info */}
                            <div style={{ textAlign: 'right', fontSize: `${10 * scale}px`, color: colors.gray }}>
                                <p style={{ marginBottom: `${2 * scale}px` }}>{data.garage.nom}</p>
                                {data.garage.siret && <p>SIRET : {data.garage.siret}</p>}
                                {data.garage.tva && <p>TVA : {data.garage.tva}</p>}
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}

export default InvoiceTemplate
