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
        return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    }

    const formatCurrency = (amount: number) => amount.toFixed(2) + " €"

    const isDevis = data.type === 'devis'

    return (
        <div
            className={`bg-white ${className}`}
            style={{
                width: '210mm',
                minHeight: '297mm',
                maxHeight: '297mm',
                fontSize: `${10 * scale}px`,
                fontFamily: 'system-ui, -apple-system, sans-serif',
                overflow: 'hidden'
            }}
        >
            {/* Top accent bar */}
            <div
                className="w-full"
                style={{
                    height: '4px',
                    background: isDevis
                        ? 'linear-gradient(90deg, #2563eb, #3b82f6, #2563eb)'
                        : 'linear-gradient(90deg, #18181b, #3f3f46, #18181b)'
                }}
            />

            <div style={{ padding: `${20 * scale}px ${24 * scale}px` }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: `${16 * scale}px` }}>
                    {/* Company */}
                    <div style={{ display: 'flex', gap: `${12 * scale}px`, alignItems: 'flex-start' }}>
                        {data.garage.logo ? (
                            <img
                                src={data.garage.logo}
                                alt="Logo"
                                style={{
                                    width: `${40 * scale}px`,
                                    height: `${40 * scale}px`,
                                    objectFit: 'contain',
                                    borderRadius: `${4 * scale}px`
                                }}
                            />
                        ) : (
                            <div style={{
                                width: `${40 * scale}px`,
                                height: `${40 * scale}px`,
                                background: '#f4f4f5',
                                borderRadius: `${4 * scale}px`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <Building2 style={{ width: `${20 * scale}px`, height: `${20 * scale}px`, color: '#a1a1aa' }} />
                            </div>
                        )}
                        <div>
                            <p style={{ fontWeight: 700, fontSize: `${12 * scale}px`, color: '#18181b', marginBottom: `${2 * scale}px` }}>
                                {data.garage.nom || 'Garage'}
                            </p>
                            <p style={{ color: '#71717a', fontSize: `${9 * scale}px` }}>{data.garage.adresse}</p>
                            <p style={{ color: '#71717a', fontSize: `${9 * scale}px` }}>{data.garage.codePostal} {data.garage.ville}</p>
                            {data.garage.telephone && <p style={{ color: '#71717a', fontSize: `${9 * scale}px` }}>{data.garage.telephone}</p>}
                        </div>
                    </div>

                    {/* Document info */}
                    <div style={{ textAlign: 'right' }}>
                        <div style={{
                            display: 'inline-block',
                            background: isDevis ? '#2563eb' : '#18181b',
                            color: 'white',
                            padding: `${6 * scale}px ${16 * scale}px`,
                            borderRadius: `${4 * scale}px`,
                            marginBottom: `${6 * scale}px`
                        }}>
                            <span style={{ fontWeight: 700, fontSize: `${12 * scale}px`, letterSpacing: '0.05em' }}>
                                {isDevis ? 'DEVIS' : 'FACTURE'}
                            </span>
                        </div>
                        <p style={{ fontFamily: 'monospace', fontWeight: 600, fontSize: `${11 * scale}px`, color: '#18181b' }}>
                            {data.numero}
                        </p>
                        <p style={{ color: '#71717a', fontSize: `${9 * scale}px`, marginTop: `${2 * scale}px` }}>
                            {formatDate(data.dateEmission)}
                        </p>
                        {data.dateEcheance && (
                            <p style={{ color: '#71717a', fontSize: `${9 * scale}px` }}>
                                {isDevis ? 'Valide jusqu\'au' : 'Échéance'} {formatDate(data.dateEcheance)}
                            </p>
                        )}
                    </div>
                </div>

                {/* Client & Vehicle Row */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: data.vehicule?.plaque ? '1fr 1fr' : '1fr',
                    gap: `${12 * scale}px`,
                    marginBottom: `${16 * scale}px`
                }}>
                    <div style={{
                        background: '#fafafa',
                        padding: `${10 * scale}px ${12 * scale}px`,
                        borderRadius: `${6 * scale}px`,
                        border: '1px solid #e4e4e7'
                    }}>
                        <p style={{
                            fontSize: `${8 * scale}px`,
                            color: '#a1a1aa',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            marginBottom: `${4 * scale}px`
                        }}>
                            {isDevis ? 'Devis pour' : 'Facturé à'}
                        </p>
                        <p style={{ fontWeight: 600, color: '#18181b', fontSize: `${10 * scale}px` }}>{data.client.nom}</p>
                        {data.client.adresse && <p style={{ color: '#52525b', fontSize: `${9 * scale}px` }}>{data.client.adresse}</p>}
                        {(data.client.codePostal || data.client.ville) && (
                            <p style={{ color: '#52525b', fontSize: `${9 * scale}px` }}>{data.client.codePostal} {data.client.ville}</p>
                        )}
                    </div>

                    {data.vehicule?.plaque && (
                        <div style={{
                            background: '#fafafa',
                            padding: `${10 * scale}px ${12 * scale}px`,
                            borderRadius: `${6 * scale}px`,
                            border: '1px solid #e4e4e7'
                        }}>
                            <p style={{
                                fontSize: `${8 * scale}px`,
                                color: '#a1a1aa',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                marginBottom: `${4 * scale}px`
                            }}>
                                Véhicule
                            </p>
                            <p style={{
                                fontFamily: 'monospace',
                                fontWeight: 700,
                                color: '#18181b',
                                fontSize: `${11 * scale}px`,
                                background: '#e4e4e7',
                                padding: `${2 * scale}px ${6 * scale}px`,
                                borderRadius: `${3 * scale}px`,
                                display: 'inline-block'
                            }}>
                                {data.vehicule.plaque}
                            </p>
                            <p style={{ color: '#52525b', fontSize: `${9 * scale}px`, marginTop: `${2 * scale}px` }}>
                                {data.vehicule.marque} {data.vehicule.modele}
                            </p>
                        </div>
                    )}
                </div>

                {/* Table */}
                <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    marginBottom: `${12 * scale}px`
                }}>
                    <thead>
                        <tr style={{ background: '#18181b' }}>
                            <th style={{
                                textAlign: 'left',
                                padding: `${8 * scale}px ${10 * scale}px`,
                                fontSize: `${8 * scale}px`,
                                fontWeight: 600,
                                color: 'white',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em'
                            }}>
                                Désignation
                            </th>
                            <th style={{
                                textAlign: 'center',
                                padding: `${8 * scale}px`,
                                fontSize: `${8 * scale}px`,
                                fontWeight: 600,
                                color: 'white',
                                textTransform: 'uppercase',
                                width: `${50 * scale}px`
                            }}>
                                Qté
                            </th>
                            <th style={{
                                textAlign: 'right',
                                padding: `${8 * scale}px`,
                                fontSize: `${8 * scale}px`,
                                fontWeight: 600,
                                color: 'white',
                                textTransform: 'uppercase',
                                width: `${70 * scale}px`
                            }}>
                                P.U. HT
                            </th>
                            <th style={{
                                textAlign: 'right',
                                padding: `${8 * scale}px ${10 * scale}px`,
                                fontSize: `${8 * scale}px`,
                                fontWeight: 600,
                                color: 'white',
                                textTransform: 'uppercase',
                                width: `${70 * scale}px`
                            }}>
                                Total HT
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.lignes.map((ligne, index) => {
                            const qte = typeof ligne.quantite === 'string' ? parseFloat(ligne.quantite) || 0 : ligne.quantite
                            const totalLigne = ligne.totalHT ?? (qte * ligne.prixUnitaireHT)
                            const isEven = index % 2 === 0

                            return (
                                <tr key={ligne.id || index} style={{ background: isEven ? '#fafafa' : 'white' }}>
                                    <td style={{
                                        padding: `${6 * scale}px ${10 * scale}px`,
                                        borderBottom: '1px solid #e4e4e7'
                                    }}>
                                        <span style={{ fontWeight: 500, color: '#18181b' }}>{ligne.designation || '-'}</span>
                                        {ligne.description && (
                                            <span style={{
                                                display: 'block',
                                                color: '#71717a',
                                                fontSize: `${8 * scale}px`
                                            }}>
                                                {ligne.description}
                                            </span>
                                        )}
                                    </td>
                                    <td style={{
                                        textAlign: 'center',
                                        padding: `${6 * scale}px`,
                                        color: '#52525b',
                                        borderBottom: '1px solid #e4e4e7'
                                    }}>
                                        {ligne.quantite}
                                    </td>
                                    <td style={{
                                        textAlign: 'right',
                                        padding: `${6 * scale}px`,
                                        color: '#52525b',
                                        fontFamily: 'monospace',
                                        borderBottom: '1px solid #e4e4e7'
                                    }}>
                                        {formatCurrency(ligne.prixUnitaireHT)}
                                    </td>
                                    <td style={{
                                        textAlign: 'right',
                                        padding: `${6 * scale}px ${10 * scale}px`,
                                        fontWeight: 600,
                                        color: '#18181b',
                                        fontFamily: 'monospace',
                                        borderBottom: '1px solid #e4e4e7'
                                    }}>
                                        {formatCurrency(totalLigne)}
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>

                {/* Totals */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: `${12 * scale}px` }}>
                    <div style={{ width: `${160 * scale}px` }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            padding: `${4 * scale}px 0`,
                            color: '#52525b',
                            fontSize: `${9 * scale}px`
                        }}>
                            <span>Total HT</span>
                            <span style={{ fontFamily: 'monospace' }}>{formatCurrency(data.totalHT)}</span>
                        </div>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            padding: `${4 * scale}px 0`,
                            color: '#52525b',
                            fontSize: `${9 * scale}px`
                        }}>
                            <span>TVA {data.tauxTVA}%</span>
                            <span style={{ fontFamily: 'monospace' }}>{formatCurrency(data.totalTVA)}</span>
                        </div>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            padding: `${8 * scale}px 0`,
                            marginTop: `${4 * scale}px`,
                            borderTop: `2px solid #18181b`,
                            fontSize: `${11 * scale}px`
                        }}>
                            <span style={{ fontWeight: 700, color: '#18181b' }}>Total TTC</span>
                            <span style={{ fontWeight: 700, color: '#18181b', fontFamily: 'monospace' }}>
                                {formatCurrency(data.totalTTC)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Notes */}
                {data.notes && (
                    <div style={{
                        background: '#fef3c7',
                        border: '1px solid #fcd34d',
                        padding: `${8 * scale}px ${10 * scale}px`,
                        borderRadius: `${4 * scale}px`,
                        marginBottom: `${12 * scale}px`
                    }}>
                        <p style={{ fontSize: `${9 * scale}px`, color: '#92400e' }}>
                            <strong>Note :</strong> {data.notes}
                        </p>
                    </div>
                )}

                {/* Legal Mentions - Compact */}
                {data.mentionsLegales && (
                    <div style={{
                        borderTop: '1px solid #e4e4e7',
                        paddingTop: `${8 * scale}px`,
                        marginBottom: `${8 * scale}px`
                    }}>
                        <p style={{
                            fontSize: `${7 * scale}px`,
                            color: '#a1a1aa',
                            lineHeight: 1.4
                        }}>
                            {data.mentionsLegales}
                        </p>
                    </div>
                )}

                {/* Footer - Minimal */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingTop: `${6 * scale}px`,
                    borderTop: '1px solid #f4f4f5',
                    fontSize: `${8 * scale}px`,
                    color: '#a1a1aa'
                }}>
                    <span>{data.garage.email}</span>
                    <span>
                        {data.garage.siret && `SIRET: ${data.garage.siret}`}
                        {data.garage.siret && data.garage.tva && ' • '}
                        {data.garage.tva && `TVA: ${data.garage.tva}`}
                    </span>
                </div>
            </div>
        </div>
    )
}

export default InvoiceTemplate
