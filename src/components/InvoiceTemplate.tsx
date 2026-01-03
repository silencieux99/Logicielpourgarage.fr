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
    // Type de document
    type: "facture" | "devis"

    // Numéro du document
    numero: string

    // Dates
    dateEmission: Date | string
    dateEcheance?: Date | string

    // Garage info
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

    // Client info
    client: {
        nom: string
        adresse?: string
        codePostal?: string
        ville?: string
        email?: string
    }

    // Véhicule (optionnel)
    vehicule?: {
        plaque?: string
        marque?: string
        modele?: string
    }

    // Lignes
    lignes: InvoiceLine[]

    // Totaux
    totalHT: number
    tauxTVA: number
    totalTVA: number
    totalTTC: number

    // Mentions
    mentionsLegales?: string
    notes?: string
}

interface InvoiceTemplateProps {
    data: InvoiceTemplateData
    scale?: number // Pour réduire la taille dans les aperçus
    className?: string
}

export function InvoiceTemplate({ data, scale = 1, className = "" }: InvoiceTemplateProps) {
    const formatDate = (d: Date | string) => {
        if (!d) return "-"
        const date = typeof d === 'string' ? new Date(d) : d
        return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    }

    const formatCurrency = (amount: number) => {
        return amount.toFixed(2) + "€"
    }

    return (
        <div className={`relative group ${className}`}>
            {/* Shadow layers for depth effect */}
            <div className="absolute inset-0 bg-zinc-200 rounded-lg transform rotate-1 translate-y-1" />
            <div className="absolute inset-0 bg-zinc-100 rounded-lg transform -rotate-0.5 translate-y-0.5" />

            {/* Main document */}
            <div className="relative bg-white rounded-lg shadow-xl border border-zinc-200 overflow-hidden transform transition-transform duration-300 group-hover:scale-[1.005]">
                {/* Colored header bar */}
                <div className="h-2 bg-gradient-to-r from-zinc-900 via-zinc-700 to-zinc-900" />

                <div className="p-6 space-y-5" style={{ fontSize: `${11 * scale}px` }}>
                    {/* Header */}
                    <div className="flex justify-between items-start">
                        {/* Company Info */}
                        <div className="flex gap-4 items-start">
                            {data.garage.logo ? (
                                <img
                                    src={data.garage.logo}
                                    alt="Logo"
                                    className="w-14 h-14 object-contain rounded-lg border border-zinc-100"
                                />
                            ) : (
                                <div className="w-14 h-14 bg-gradient-to-br from-zinc-100 to-zinc-200 rounded-lg flex items-center justify-center">
                                    <Building2 className="w-7 h-7 text-zinc-400" />
                                </div>
                            )}
                            <div>
                                <p className="font-bold text-zinc-900" style={{ fontSize: `${14 * scale}px` }}>
                                    {data.garage.nom || 'Votre Garage'}
                                </p>
                                <p className="text-zinc-500">{data.garage.adresse || '-'}</p>
                                <p className="text-zinc-500">
                                    {data.garage.codePostal || '-'} {data.garage.ville || ''}
                                </p>
                                {data.garage.telephone && <p className="text-zinc-500">Tél: {data.garage.telephone}</p>}
                                {data.garage.siret && (
                                    <p className="text-zinc-400 mt-1" style={{ fontSize: `${9 * scale}px` }}>
                                        SIRET: {data.garage.siret}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Invoice Info */}
                        <div className="text-right">
                            <div className={`inline-block text-white px-4 py-2 rounded-lg mb-2 ${data.type === 'facture' ? 'bg-zinc-900' : 'bg-blue-600'
                                }`}>
                                <p className="font-bold tracking-wide" style={{ fontSize: `${14 * scale}px` }}>
                                    {data.type === 'facture' ? 'FACTURE' : 'DEVIS'}
                                </p>
                            </div>
                            <p className="font-mono text-zinc-900 font-semibold" style={{ fontSize: `${13 * scale}px` }}>
                                N° {data.numero}
                            </p>
                            <p className="text-zinc-500 mt-1">Date : {formatDate(data.dateEmission)}</p>
                            {data.dateEcheance && (
                                <p className="text-zinc-500">
                                    {data.type === 'facture' ? 'Échéance' : 'Validité'} : {formatDate(data.dateEcheance)}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Client & Vehicule */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-zinc-50 rounded-lg p-4">
                            <p className="text-zinc-400 uppercase tracking-wide mb-1" style={{ fontSize: `${9 * scale}px` }}>
                                {data.type === 'facture' ? 'Facturé à' : 'Devis pour'}
                            </p>
                            <p className="font-semibold text-zinc-900">{data.client.nom || 'Client'}</p>
                            {data.client.adresse && <p className="text-zinc-600">{data.client.adresse}</p>}
                            {(data.client.codePostal || data.client.ville) && (
                                <p className="text-zinc-600">
                                    {data.client.codePostal} {data.client.ville}
                                </p>
                            )}
                            {data.client.email && (
                                <p className="text-zinc-500 mt-1" style={{ fontSize: `${9 * scale}px` }}>
                                    {data.client.email}
                                </p>
                            )}
                        </div>

                        {data.vehicule && (data.vehicule.plaque || data.vehicule.marque) && (
                            <div className="bg-zinc-50 rounded-lg p-4">
                                <p className="text-zinc-400 uppercase tracking-wide mb-1" style={{ fontSize: `${9 * scale}px` }}>
                                    Véhicule
                                </p>
                                {data.vehicule.plaque && (
                                    <p className="font-mono font-bold text-zinc-900">{data.vehicule.plaque}</p>
                                )}
                                {(data.vehicule.marque || data.vehicule.modele) && (
                                    <p className="text-zinc-600">
                                        {data.vehicule.marque} {data.vehicule.modele}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Items Table */}
                    <div className="border border-zinc-200 rounded-lg overflow-hidden">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-zinc-50">
                                    <th
                                        className="text-left py-2.5 px-3 font-semibold text-zinc-600 uppercase"
                                        style={{ fontSize: `${9 * scale}px` }}
                                    >
                                        Désignation
                                    </th>
                                    <th
                                        className="text-center py-2.5 px-2 font-semibold text-zinc-600 uppercase w-16"
                                        style={{ fontSize: `${9 * scale}px` }}
                                    >
                                        Qté
                                    </th>
                                    <th
                                        className="text-right py-2.5 px-2 font-semibold text-zinc-600 uppercase w-20"
                                        style={{ fontSize: `${9 * scale}px` }}
                                    >
                                        PU HT
                                    </th>
                                    <th
                                        className="text-right py-2.5 px-3 font-semibold text-zinc-600 uppercase w-20"
                                        style={{ fontSize: `${9 * scale}px` }}
                                    >
                                        Total HT
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100">
                                {data.lignes.map((ligne, index) => {
                                    const qte = typeof ligne.quantite === 'string' ? parseFloat(ligne.quantite) || 0 : ligne.quantite
                                    const totalLigne = ligne.totalHT ?? (qte * ligne.prixUnitaireHT)

                                    return (
                                        <tr key={ligne.id || index}>
                                            <td className="py-2.5 px-3">
                                                <p className="font-medium text-zinc-900">{ligne.designation || '-'}</p>
                                                {ligne.description && (
                                                    <p className="text-zinc-500" style={{ fontSize: `${9 * scale}px` }}>
                                                        {ligne.description}
                                                    </p>
                                                )}
                                            </td>
                                            <td className="text-center py-2.5 px-2 text-zinc-700">
                                                {ligne.quantite}
                                            </td>
                                            <td className="text-right py-2.5 px-2 text-zinc-700 font-mono">
                                                {formatCurrency(ligne.prixUnitaireHT)}
                                            </td>
                                            <td className="text-right py-2.5 px-3 text-zinc-900 font-semibold font-mono">
                                                {formatCurrency(totalLigne)}
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Totals */}
                    <div className="flex justify-end">
                        <div className="w-56 space-y-1.5">
                            <div className="flex justify-between text-zinc-600">
                                <span>Total HT</span>
                                <span className="font-mono font-medium">{formatCurrency(data.totalHT)}</span>
                            </div>
                            <div className="flex justify-between text-zinc-600">
                                <span>TVA ({data.tauxTVA}%)</span>
                                <span className="font-mono font-medium">{formatCurrency(data.totalTVA)}</span>
                            </div>
                            <div className="flex justify-between pt-2 border-t-2 border-zinc-900">
                                <span className="font-bold text-zinc-900" style={{ fontSize: `${13 * scale}px` }}>
                                    Total TTC
                                </span>
                                <span className="font-bold text-zinc-900 font-mono" style={{ fontSize: `${13 * scale}px` }}>
                                    {formatCurrency(data.totalTTC)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Notes */}
                    {data.notes && (
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                            <p className="text-amber-800" style={{ fontSize: `${10 * scale}px` }}>
                                <span className="font-semibold">Note :</span> {data.notes}
                            </p>
                        </div>
                    )}

                    {/* Legal Mentions */}
                    {data.mentionsLegales && (
                        <div className="pt-4 border-t border-zinc-100">
                            <p className="text-zinc-400 leading-relaxed" style={{ fontSize: `${8 * scale}px` }}>
                                {data.mentionsLegales}
                            </p>
                        </div>
                    )}

                    {/* Footer */}
                    <div className="pt-3 flex items-center justify-between text-zinc-400" style={{ fontSize: `${9 * scale}px` }}>
                        <span>{data.garage.email || ''}</span>
                        {data.garage.tva && <span>N° TVA: {data.garage.tva}</span>}
                    </div>
                </div>
            </div>
        </div>
    )
}

// Version pour l'impression/PDF
export function InvoiceTemplatePrint({ data }: { data: InvoiceTemplateData }) {
    const formatDate = (d: Date | string) => {
        if (!d) return "-"
        const date = typeof d === 'string' ? new Date(d) : d
        return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount)
    }

    return (
        <div className="bg-white p-10 max-w-[800px] mx-auto" style={{ fontFamily: 'system-ui, sans-serif' }}>
            {/* Header bar */}
            <div className="h-1.5 bg-gradient-to-r from-zinc-900 via-zinc-700 to-zinc-900 rounded-full mb-8" />

            {/* Header */}
            <div className="flex justify-between items-start mb-8">
                <div className="flex gap-4">
                    {data.garage.logo ? (
                        <img src={data.garage.logo} alt="Logo" className="w-16 h-16 object-contain" />
                    ) : (
                        <div className="w-16 h-16 bg-zinc-100 rounded-lg flex items-center justify-center">
                            <span className="text-2xl font-bold text-zinc-400">
                                {data.garage.nom?.charAt(0) || 'G'}
                            </span>
                        </div>
                    )}
                    <div>
                        <h1 className="text-xl font-bold text-zinc-900">{data.garage.nom}</h1>
                        <p className="text-sm text-zinc-600">{data.garage.adresse}</p>
                        <p className="text-sm text-zinc-600">{data.garage.codePostal} {data.garage.ville}</p>
                        {data.garage.telephone && <p className="text-sm text-zinc-600">Tél: {data.garage.telephone}</p>}
                        {data.garage.siret && <p className="text-xs text-zinc-500 mt-1">SIRET: {data.garage.siret}</p>}
                    </div>
                </div>

                <div className="text-right">
                    <div className={`inline-block text-white px-5 py-2 rounded-md mb-2 ${data.type === 'facture' ? 'bg-zinc-900' : 'bg-blue-600'
                        }`}>
                        <span className="text-lg font-bold tracking-wide">
                            {data.type === 'facture' ? 'FACTURE' : 'DEVIS'}
                        </span>
                    </div>
                    <p className="font-mono text-base font-semibold text-zinc-900">N° {data.numero}</p>
                    <p className="text-sm text-zinc-600 mt-1">Date : {formatDate(data.dateEmission)}</p>
                    {data.dateEcheance && (
                        <p className="text-sm text-zinc-600">
                            {data.type === 'facture' ? 'Échéance' : 'Validité'} : {formatDate(data.dateEcheance)}
                        </p>
                    )}
                </div>
            </div>

            {/* Client */}
            <div className="bg-zinc-50 p-4 rounded-lg mb-6">
                <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">
                    {data.type === 'facture' ? 'Facturé à' : 'Devis pour'}
                </p>
                <p className="font-semibold text-zinc-900">{data.client.nom}</p>
                {data.client.adresse && <p className="text-sm text-zinc-600">{data.client.adresse}</p>}
                {(data.client.codePostal || data.client.ville) && (
                    <p className="text-sm text-zinc-600">{data.client.codePostal} {data.client.ville}</p>
                )}
            </div>

            {/* Table */}
            <table className="w-full border-collapse mb-6">
                <thead>
                    <tr className="bg-zinc-100">
                        <th className="text-left py-3 px-4 text-xs font-semibold text-zinc-600 uppercase border border-zinc-200">
                            Désignation
                        </th>
                        <th className="text-center py-3 px-3 text-xs font-semibold text-zinc-600 uppercase w-20 border border-zinc-200">
                            Qté
                        </th>
                        <th className="text-right py-3 px-3 text-xs font-semibold text-zinc-600 uppercase w-24 border border-zinc-200">
                            PU HT
                        </th>
                        <th className="text-right py-3 px-4 text-xs font-semibold text-zinc-600 uppercase w-24 border border-zinc-200">
                            Total HT
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {data.lignes.map((ligne, index) => {
                        const qte = typeof ligne.quantite === 'string' ? parseFloat(ligne.quantite) || 0 : ligne.quantite
                        const totalLigne = ligne.totalHT ?? (qte * ligne.prixUnitaireHT)

                        return (
                            <tr key={ligne.id || index}>
                                <td className="py-3 px-4 border border-zinc-200">
                                    <p className="font-medium text-zinc-900">{ligne.designation}</p>
                                    {ligne.description && (
                                        <p className="text-sm text-zinc-500">{ligne.description}</p>
                                    )}
                                </td>
                                <td className="text-center py-3 px-3 text-zinc-700 border border-zinc-200">
                                    {ligne.quantite}
                                </td>
                                <td className="text-right py-3 px-3 text-zinc-700 font-mono border border-zinc-200">
                                    {formatCurrency(ligne.prixUnitaireHT)}
                                </td>
                                <td className="text-right py-3 px-4 text-zinc-900 font-semibold font-mono border border-zinc-200">
                                    {formatCurrency(totalLigne)}
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>

            {/* Totals */}
            <div className="flex justify-end mb-8">
                <div className="w-64 bg-zinc-50 p-4 rounded-lg">
                    <div className="flex justify-between py-1 text-zinc-600">
                        <span>Total HT</span>
                        <span className="font-mono">{formatCurrency(data.totalHT)}</span>
                    </div>
                    <div className="flex justify-between py-1 text-zinc-600">
                        <span>TVA ({data.tauxTVA}%)</span>
                        <span className="font-mono">{formatCurrency(data.totalTVA)}</span>
                    </div>
                    <div className="flex justify-between py-2 mt-2 border-t-2 border-zinc-900">
                        <span className="text-lg font-bold text-zinc-900">Total TTC</span>
                        <span className="text-lg font-bold text-zinc-900 font-mono">{formatCurrency(data.totalTTC)}</span>
                    </div>
                </div>
            </div>

            {/* Notes */}
            {data.notes && (
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg mb-6">
                    <p className="text-sm text-amber-800">
                        <span className="font-semibold">Note :</span> {data.notes}
                    </p>
                </div>
            )}

            {/* Legal Mentions */}
            {data.mentionsLegales && (
                <div className="border-t border-zinc-200 pt-6 mt-8">
                    <p className="text-xs text-zinc-500 leading-relaxed">{data.mentionsLegales}</p>
                </div>
            )}

            {/* Footer */}
            <div className="mt-8 pt-4 border-t border-zinc-100 flex justify-between text-xs text-zinc-400">
                <span>{data.garage.email}</span>
                {data.garage.tva && <span>N° TVA: {data.garage.tva}</span>}
            </div>
        </div>
    )
}

export default InvoiceTemplate
