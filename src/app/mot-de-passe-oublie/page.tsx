"use client"

import Link from "next/link"
import { useState } from "react"
import { ArrowLeft, Loader2, CheckCircle2, Mail } from "lucide-react"

export default function MotDePasseOubliePage() {
    const [isLoading, setIsLoading] = useState(false)
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [email, setEmail] = useState("")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500))
        setIsLoading(false)
        setIsSubmitted(true)
    }

    return (
        <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="mb-8 text-center">
                    <Link href="/" className="inline-flex items-center gap-2.5">
                        <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center">
                            <span className="text-white font-bold">G</span>
                        </div>
                        <span className="text-[18px] font-bold text-zinc-900">GaragePro</span>
                    </Link>
                </div>

                <div className="bg-white rounded-2xl p-8 shadow-sm border border-zinc-200">
                    {!isSubmitted ? (
                        <>
                            <div className="mb-6">
                                <h1 className="text-[24px] font-bold text-zinc-900 mb-2">
                                    Mot de passe oublié
                                </h1>
                                <p className="text-[15px] text-zinc-600">
                                    Entrez votre email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label className="block text-[14px] font-medium text-zinc-700 mb-2">
                                        Adresse email
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="vous@exemple.fr"
                                        className="w-full h-12 px-4 bg-white border border-zinc-300 rounded-xl text-[15px] placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full h-12 bg-zinc-900 hover:bg-zinc-800 text-white text-[15px] font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                            Envoi en cours...
                                        </>
                                    ) : (
                                        "Envoyer le lien"
                                    )}
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="text-center py-4">
                            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                                <Mail className="h-8 w-8 text-emerald-600" />
                            </div>
                            <h2 className="text-[20px] font-bold text-zinc-900 mb-2">
                                Email envoyé
                            </h2>
                            <p className="text-[15px] text-zinc-600 mb-6">
                                Si un compte existe avec l'adresse <strong>{email}</strong>, vous recevrez un email avec les instructions.
                            </p>
                            <p className="text-[13px] text-zinc-500">
                                Vous n'avez pas reçu l'email ?{" "}
                                <button
                                    onClick={() => setIsSubmitted(false)}
                                    className="text-zinc-900 font-medium hover:underline"
                                >
                                    Réessayer
                                </button>
                            </p>
                        </div>
                    )}
                </div>

                <div className="mt-6 text-center">
                    <Link href="/connexion" className="text-[14px] text-zinc-600 hover:text-zinc-900 inline-flex items-center gap-1">
                        <ArrowLeft className="h-4 w-4" />
                        Retour à la connexion
                    </Link>
                </div>
            </div>
        </div>
    )
}
