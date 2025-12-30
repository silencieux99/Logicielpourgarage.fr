"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import {
    ArrowLeft,
    GraduationCap,
    Construction
} from "lucide-react"

export default function TutorialDetailPage() {
    const params = useParams()
    const slug = params.slug as string

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link
                    href="/tutoriaux"
                    className="w-10 h-10 flex items-center justify-center rounded-lg bg-zinc-100 hover:bg-zinc-200 transition-colors"
                >
                    <ArrowLeft className="h-5 w-5 text-zinc-600" />
                </Link>
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 flex items-center gap-2">
                        <GraduationCap className="h-6 w-6 text-zinc-700" />
                        Tutoriel
                    </h1>
                    <p className="text-sm text-zinc-500 mt-1">
                        ID: {slug}
                    </p>
                </div>
            </div>

            {/* Contenu vide */}
            <div className="bg-white rounded-xl border border-zinc-200 p-12 text-center">
                <Construction className="h-16 w-16 text-zinc-300 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-zinc-900 mb-2">
                    Tutoriel en préparation
                </h2>
                <p className="text-sm text-zinc-500 max-w-md mx-auto mb-6">
                    Ce tutoriel sera bientôt disponible. Revenez prochainement !
                </p>
                <Link
                    href="/tutoriaux"
                    className="inline-flex h-10 px-5 bg-zinc-900 text-white text-sm font-medium rounded-lg items-center hover:bg-zinc-800 transition-colors"
                >
                    Retour aux tutoriaux
                </Link>
            </div>
        </div>
    )
}
