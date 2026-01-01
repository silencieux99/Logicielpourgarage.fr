
"use client"

import Link from "next/link"
import {
    Clock,
    AlertTriangle,
    Car
} from "lucide-react"
import { cn } from "@/lib/utils"
import { BrandLogo } from "@/components/ui/brand-logo"
import { Reparation, Client, Vehicule } from "@/lib/database"

interface ReparationWithDetails extends Reparation {
    client?: Client
    vehicule?: Vehicule
}

const statusConfig: Record<string, { label: string, color: string, icon?: any }> = {
    en_attente: { label: "En attente", color: "bg-amber-100 text-amber-700", icon: Clock },
    en_cours: { label: "En cours", color: "bg-blue-100 text-blue-700" }, // Icon not used in simple card?
    termine: { label: "Terminé", color: "bg-emerald-100 text-emerald-700" },
    facture: { label: "Facturé", color: "bg-violet-100 text-violet-700" },
}

const prioriteConfig: Record<string, { label: string, color: string }> = {
    normal: { label: "Normal", color: "text-zinc-500" },
    prioritaire: { label: "Prioritaire", color: "text-amber-600" },
    urgent: { label: "Urgent", color: "text-red-600" },
}

export function RepairCard({ repair }: { repair: ReparationWithDetails }) {
    const status = statusConfig[repair.statut]
    const priorite = prioriteConfig[repair.priorite]

    return (
        <Link
            href={`/repairs/${repair.id}`}
            className="block bg-white rounded-xl border border-zinc-200 p-4 hover:border-zinc-300 hover:shadow-sm transition-all active:bg-zinc-50 group"
        >
            {/* Header: N° + Priority + Amount */}
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-zinc-400 group-hover:text-zinc-600 transition-colors">
                    {repair.numero}
                </span>

                {repair.montantTTC > 0 && (
                    <span className="text-xs font-bold text-zinc-900 bg-zinc-100 px-2 py-0.5 rounded-full">
                        {repair.montantTTC.toLocaleString()} €
                    </span>
                )}
            </div>

            {/* Description */}
            <h4 className="text-sm font-semibold text-zinc-900 mb-3 line-clamp-2">
                {repair.description}
            </h4>

            {/* Infos Vehicle */}
            <div className="flex items-center gap-2 mb-3">
                {repair.vehicule ? (
                    <div className="flex items-center gap-2 text-xs text-zinc-600 bg-zinc-50 px-2 py-1.5 rounded-lg w-full">
                        <BrandLogo brand={repair.vehicule.marque} size={14} />
                        <span className="font-medium truncate">
                            {repair.vehicule.marque} {repair.vehicule.modele}
                        </span>
                        <span className="font-mono text-zinc-400 ml-auto">
                            {repair.vehicule.plaque}
                        </span>
                    </div>
                ) : (
                    <div className="flex items-center gap-2 text-xs text-zinc-400 bg-zinc-50 px-2 py-1.5 rounded-lg w-full">
                        <Car className="h-3.5 w-3.5" />
                        <span>Véhicule inconnu</span>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-zinc-50">
                {/* Client */}
                <div className="flex items-center gap-1.5 min-w-0">
                    <div className="w-5 h-5 rounded-full bg-indigo-50 flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-indigo-600">
                        {repair.client?.prenom?.[0] || '?'}{repair.client?.nom?.[0] || '?'}
                    </div>
                    <span className="text-xs text-zinc-500 truncate">
                        {repair.client?.prenom} {repair.client?.nom}
                    </span>
                </div>

                {/* Priority Badge */}
                {repair.priorite !== 'normal' && (
                    <div className={cn(
                        "flex items-center gap-1 text-[10px] font-bold uppercase px-1.5 py-0.5 rounded",
                        repair.priorite === 'urgent' ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-600"
                    )}>
                        {repair.priorite === 'urgent' && <AlertTriangle className="h-3 w-3" />}
                        {repair.priorite}
                    </div>
                )}
            </div>

            {/* Date line (bottom right if needed, or simplified) */}
            <div className="mt-2 flex items-center justify-end text-[10px] text-zinc-400 gap-1">
                <Clock className="h-3 w-3" />
                {repair.dateEntree.toDate().toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
            </div>
        </Link>
    )
}
