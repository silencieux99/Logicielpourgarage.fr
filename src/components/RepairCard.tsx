
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
    brouillon: { label: "Brouillon", color: "bg-zinc-100 text-zinc-600" },
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
            className="group relative block bg-white rounded-2xl border border-zinc-100 p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all duration-300"
        >
            {/* Status Line - Left Border Indicator */}
            <div className={cn("absolute left-0 top-4 bottom-4 w-1 rounded-r-full opactiy-50", status?.color.replace('bg-', 'bg-opacity-50 '))} />

            {/* Header: Vehicle + N° */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                    {/* Vehicle Icon/Logo Box */}
                    <div className="w-10 h-10 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-400">
                        {repair.vehicule ? (
                            <BrandLogo brand={repair.vehicule.marque} size={20} />
                        ) : (
                            <Car className="h-5 w-5" />
                        )}
                    </div>
                    <div>
                        <h3 className="font-semibold text-zinc-900 leading-tight">
                            {repair.vehicule ? `${repair.vehicule.marque} ${repair.vehicule.modele}` : "Véhicule inconnu"}
                        </h3>
                        <p className="text-xs text-zinc-400 font-mono mt-0.5 flex items-center gap-2">
                            <span>{repair.vehicule?.plaque || "---"}</span>
                            <span className="w-1 h-1 rounded-full bg-zinc-300" />
                            <span>{repair.numero}</span>
                        </p>
                    </div>
                </div>

                {/* Priority Badge (if urgent) */}
                {repair.priorite !== 'normal' && (
                    <div className={cn(
                        "flex items-center justify-center w-6 h-6 rounded-full",
                        repair.priorite === 'urgent' ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-600"
                    )} title={priorite?.label}>
                        <AlertTriangle className="h-3.5 w-3.5" />
                    </div>
                )}
            </div>

            {/* Description - Main Content */}
            <div className="mb-4 pl-[52px]">
                <p className="text-sm text-zinc-600 font-medium line-clamp-2 leading-relaxed">
                    {repair.description}
                </p>
            </div>

            {/* Footer: Client + Status/Amount */}
            <div className="flex items-center justify-between pl-[52px] pt-3 border-t border-zinc-50">
                {/* Client info */}
                <div className="flex items-center gap-2 min-w-0 max-w-[50%]">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center flex-shrink-0 text-[9px] font-bold text-indigo-700">
                        {repair.client?.prenom?.[0] || '?'}{repair.client?.nom?.[0] || '?'}
                    </div>
                    <span className="text-xs text-zinc-500 truncate font-medium">
                        {repair.client?.nom}
                    </span>
                </div>

                {/* Status or Amount */}
                <div className="flex items-center gap-3">
                    {/* Status Badge */}
                    <span className={cn(
                        "text-[10px] font-semibold px-2 py-1 rounded-md uppercase tracking-wide",
                        status?.color
                    )}>
                        {status?.label}
                    </span>

                    {/* Amount */}
                    {repair.montantTTC > 0 && (
                        <span className="text-xs font-bold text-zinc-900 tabular-nums">
                            {Math.round(repair.montantTTC)}€
                        </span>
                    )}
                </div>
            </div>

            {/* Time Indicator - Absolute positioning or subtle */}
            <div className="absolute top-5 right-4 flex items-center gap-1 text-[10px] font-medium text-zinc-300">
                {repair.dateEntree.toDate().toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
            </div>
        </Link>
    )
}
