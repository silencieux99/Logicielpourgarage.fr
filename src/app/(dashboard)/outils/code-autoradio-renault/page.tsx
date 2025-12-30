"use client"

import { useState } from "react"
import Link from "next/link"
import {
    ArrowLeft,
    Radio,
    Search,
    Copy,
    Check,
    AlertCircle,
    Info,
    HelpCircle,
    ImageIcon,
    CheckCircle2
} from "lucide-react"
import { cn } from "@/lib/utils"
import { findRadioCode, isValidPrecodeFormat } from "@/lib/renault-radio-codes"

export default function CodeAutoradioRenaultPage() {
    const [precode, setPrecode] = useState("")
    const [result, setResult] = useState<{ code: string | null; searched: string } | null>(null)
    const [copied, setCopied] = useState(false)
    const [showHelp, setShowHelp] = useState(false)

    const handleSearch = () => {
        if (!precode.trim()) return

        const code = findRadioCode(precode)
        setResult({ code, searched: precode.toUpperCase().trim() })
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleSearch()
        }
    }

    const handleCopy = () => {
        if (result?.code) {
            navigator.clipboard.writeText(result.code)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    const isValidFormat = precode.trim() === "" || isValidPrecodeFormat(precode)

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link
                    href="/outils"
                    className="w-10 h-10 flex items-center justify-center rounded-lg bg-zinc-100 hover:bg-zinc-200 transition-colors"
                >
                    <ArrowLeft className="h-5 w-5 text-zinc-600" />
                </Link>
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 flex items-center gap-2">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center">
                            <Radio className="h-5 w-5 text-white" />
                        </div>
                        Code Autoradio Renault
                    </h1>
                    <p className="text-sm text-zinc-500 mt-1">
                        Retrouvez le code de déblocage de votre autoradio Renault
                    </p>
                </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                {/* Formulaire */}
                <div className="space-y-6">
                    <div className="bg-white rounded-xl border border-zinc-200 p-6">
                        <h2 className="text-lg font-semibold text-zinc-900 mb-4 flex items-center gap-2">
                            <Search className="h-5 w-5 text-zinc-500" />
                            Rechercher le code
                        </h2>

                        <div className="space-y-4">
                            {/* Input précode */}
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                                    Précode de l'autoradio
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={precode}
                                        onChange={(e) => {
                                            setPrecode(e.target.value.toUpperCase())
                                            setResult(null)
                                        }}
                                        onKeyPress={handleKeyPress}
                                        placeholder="Ex: A123, B456, Z789..."
                                        maxLength={4}
                                        className={cn(
                                            "w-full h-14 px-4 bg-white border rounded-lg text-xl font-mono font-bold tracking-widest text-center uppercase focus:outline-none focus:ring-2 transition-all",
                                            !isValidFormat
                                                ? "border-red-300 focus:ring-red-500/20 focus:border-red-500"
                                                : "border-zinc-200 focus:ring-yellow-500/20 focus:border-yellow-500"
                                        )}
                                    />
                                </div>
                                {!isValidFormat && (
                                    <p className="text-sm text-red-500 mt-1.5 flex items-center gap-1">
                                        <AlertCircle className="h-4 w-4" />
                                        Format invalide. Utilisez 1 lettre + 3 chiffres (ex: A123)
                                    </p>
                                )}
                                <p className="text-xs text-zinc-500 mt-1.5">
                                    Le précode est composé d'une lettre suivie de 3 chiffres
                                </p>
                            </div>

                            {/* Bouton recherche */}
                            <button
                                onClick={handleSearch}
                                disabled={!precode.trim() || !isValidFormat}
                                className="w-full h-12 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-sm font-semibold rounded-lg flex items-center justify-center gap-2 hover:from-yellow-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                <Search className="h-4 w-4" />
                                Trouver le code
                            </button>
                        </div>

                        {/* Résultat */}
                        {result && (
                            <div className="mt-6">
                                {result.code ? (
                                    <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-6 border border-emerald-200">
                                        <div className="flex items-center gap-2 mb-2">
                                            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                            <p className="text-sm font-medium text-emerald-700">Code trouvé !</p>
                                        </div>
                                        <p className="text-xs text-emerald-600 mb-3">
                                            Précode: <span className="font-mono font-bold">{result.searched}</span>
                                        </p>
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="flex-1">
                                                <p className="text-xs text-emerald-600 mb-1">Code de déblocage</p>
                                                <p className="text-4xl font-mono font-bold text-emerald-700 tracking-[0.3em]">
                                                    {result.code}
                                                </p>
                                            </div>
                                            <button
                                                onClick={handleCopy}
                                                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors"
                                            >
                                                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                                {copied ? "Copié !" : "Copier"}
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-red-50 rounded-xl p-6 border border-red-200">
                                        <div className="flex items-center gap-2 mb-2">
                                            <AlertCircle className="h-5 w-5 text-red-500" />
                                            <p className="text-sm font-medium text-red-700">Code non trouvé</p>
                                        </div>
                                        <p className="text-sm text-red-600">
                                            Le précode <span className="font-mono font-bold">{result.searched}</span> n'est pas dans notre base de données.
                                        </p>
                                        <p className="text-xs text-red-500 mt-2">
                                            Vérifiez que vous avez bien lu le précode à l'arrière de l'autoradio.
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Instructions pour entrer le code */}
                    <div className="bg-white rounded-xl border border-zinc-200 p-6">
                        <h3 className="text-sm font-semibold text-zinc-900 mb-3">
                            📻 Comment entrer le code dans l'autoradio ?
                        </h3>
                        <ol className="space-y-2 text-sm text-zinc-600">
                            <li className="flex items-start gap-2">
                                <span className="w-5 h-5 rounded-full bg-zinc-100 flex items-center justify-center text-xs font-bold text-zinc-600 flex-shrink-0">1</span>
                                <span>Allumez l'autoradio, il affiche "CODE" ou "0000"</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="w-5 h-5 rounded-full bg-zinc-100 flex items-center justify-center text-xs font-bold text-zinc-600 flex-shrink-0">2</span>
                                <span>Utilisez les touches <strong>1, 2, 3, 4</strong> pour entrer chaque chiffre</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="w-5 h-5 rounded-full bg-zinc-100 flex items-center justify-center text-xs font-bold text-zinc-600 flex-shrink-0">3</span>
                                <span>Maintenez la touche <strong>6</strong> ou appuyez sur <strong>►</strong> pour valider</span>
                            </li>
                        </ol>
                    </div>
                </div>

                {/* Guide pour trouver le précode */}
                <div className="space-y-6">
                    <div className="bg-white rounded-xl border border-zinc-200 p-6">
                        <h2 className="text-lg font-semibold text-zinc-900 mb-4 flex items-center gap-2">
                            <HelpCircle className="h-5 w-5 text-zinc-500" />
                            Où trouver le précode ?
                        </h2>

                        <div className="space-y-4">
                            <p className="text-sm text-zinc-600">
                                Le <strong>précode</strong> (aussi appelé "security code" ou "pre-code") se trouve sur une étiquette à <strong>l'arrière de l'autoradio</strong>. Il faut donc démonter l'autoradio pour le voir.
                            </p>

                            {/* Placeholder image */}
                            <div className="relative aspect-video bg-gradient-to-br from-zinc-100 to-zinc-200 rounded-lg border-2 border-dashed border-zinc-300 flex flex-col items-center justify-center">
                                <ImageIcon className="h-12 w-12 text-zinc-400 mb-2" />
                                <p className="text-sm text-zinc-500 font-medium">Photo de l'emplacement du précode</p>
                                <p className="text-xs text-zinc-400 mt-1">Image à ajouter</p>
                            </div>

                            <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                                <h4 className="text-sm font-semibold text-amber-800 mb-2 flex items-center gap-2">
                                    <Info className="h-4 w-4" />
                                    Comment identifier le précode ?
                                </h4>
                                <ul className="space-y-1.5 text-sm text-amber-700">
                                    <li>• Il commence par une <strong>lettre</strong> (A, B, C, D, etc.)</li>
                                    <li>• Suivi de <strong>3 chiffres</strong> (100 à 999)</li>
                                    <li>• Exemples: <span className="font-mono bg-amber-100 px-1 rounded">A123</span>, <span className="font-mono bg-amber-100 px-1 rounded">B456</span>, <span className="font-mono bg-amber-100 px-1 rounded">Z789</span></li>
                                    <li>• Il est souvent précédé de "PRE CODE" ou "SECURITY"</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Étapes pour démonter */}
                    <div className="bg-white rounded-xl border border-zinc-200 p-6">
                        <h3 className="text-sm font-semibold text-zinc-900 mb-3">
                            🔧 Comment démonter l'autoradio ?
                        </h3>
                        <ol className="space-y-3 text-sm text-zinc-600">
                            <li className="flex items-start gap-3">
                                <span className="w-6 h-6 rounded-full bg-yellow-100 flex items-center justify-center text-xs font-bold text-yellow-700 flex-shrink-0">1</span>
                                <div>
                                    <p className="font-medium text-zinc-900">Procurez-vous les clés d'extraction</p>
                                    <p className="text-xs text-zinc-500">Clés spéciales en forme de U ou de lame, disponibles pour quelques euros</p>
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="w-6 h-6 rounded-full bg-yellow-100 flex items-center justify-center text-xs font-bold text-yellow-700 flex-shrink-0">2</span>
                                <div>
                                    <p className="font-medium text-zinc-900">Insérez les clés dans les trous</p>
                                    <p className="text-xs text-zinc-500">Sur les côtés de la façade de l'autoradio (2 ou 4 trous selon le modèle)</p>
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="w-6 h-6 rounded-full bg-yellow-100 flex items-center justify-center text-xs font-bold text-yellow-700 flex-shrink-0">3</span>
                                <div>
                                    <p className="font-medium text-zinc-900">Tirez l'autoradio vers vous</p>
                                    <p className="text-xs text-zinc-500">Les clés débloquent les clips de maintien</p>
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="w-6 h-6 rounded-full bg-yellow-100 flex items-center justify-center text-xs font-bold text-yellow-700 flex-shrink-0">4</span>
                                <div>
                                    <p className="font-medium text-zinc-900">Retournez l'autoradio</p>
                                    <p className="text-xs text-zinc-500">L'étiquette avec le précode est visible à l'arrière</p>
                                </div>
                            </li>
                        </ol>
                    </div>

                    {/* Note importante */}
                    <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
                        <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-blue-800">
                            <p className="font-medium mb-1">Compatible avec les autoradios Renault</p>
                            <p className="text-blue-700 text-xs">
                                Clio, Mégane, Scénic, Twingo, Laguna, Kangoo, Trafic, Master, Captur, Kadjar, et autres modèles équipés d'autoradios d'origine Renault.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
