"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import {
    Mail,
    Lock,
    Eye,
    EyeOff,
    Loader2,
    ArrowLeft,
    CheckCircle2,
    AlertCircle
} from "lucide-react"
import { cn } from "@/lib/utils"
import { signIn, signUp, resetPassword } from "@/lib/auth"

type Mode = "login" | "signup" | "reset"

export default function LoginPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [mode, setMode] = useState<Mode>("login")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)

    // Détecter si on vient de la page d'accueil pour l'inscription
    useEffect(() => {
        const emailParam = searchParams.get('email')
        const subscribeParam = searchParams.get('subscribe')
        
        // Si intention d'abonnement, rediriger vers la page d'inscription complète
        if (subscribeParam === 'true') {
            router.push('/inscription')
            return
        }
        
        if (emailParam) {
            setEmail(emailParam)
        }
    }, [searchParams, router])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setSuccess(null)
        setLoading(true)

        try {
            if (mode === "login") {
                await signIn(email, password)
                router.push("/dashboard")
            } else if (mode === "reset") {
                await resetPassword(email)
                setSuccess("Email de réinitialisation envoyé ! Vérifiez votre boîte mail.")
            }
        } catch (err: any) {
            console.error("Auth error:", err)
            // Traduire les erreurs Firebase
            if (err.code === "auth/user-not-found") {
                setError("Aucun compte associé à cet email")
            } else if (err.code === "auth/wrong-password") {
                setError("Mot de passe incorrect")
            } else if (err.code === "auth/email-already-in-use") {
                setError("Un compte existe déjà avec cet email")
            } else if (err.code === "auth/invalid-email") {
                setError("Email invalide")
            } else if (err.code === "auth/weak-password") {
                setError("Mot de passe trop faible")
            } else {
                setError("Une erreur est survenue. Réessayez.")
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-zinc-50 flex">
            {/* Left side - Form */}
            <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                <div className="w-full max-w-md mx-auto">
                    {/* Back link */}
                    <Link href="/" className="inline-block mb-6 sm:mb-8 text-[15px] sm:text-[16px] font-bold text-zinc-900 hover:text-zinc-700 transition-colors">
                        <span className="hidden sm:inline">← Retour à l'accueil</span>
                        <span className="sm:hidden">← Accueil</span>
                    </Link>

                    {/* Header */}
                    <div className="mb-6 sm:mb-8">
                        <h1 className="text-[24px] sm:text-[28px] lg:text-[32px] font-bold text-zinc-900 mb-2">
                            {mode === "login" && "Connexion"}
                            {mode === "reset" && "Mot de passe oublié"}
                        </h1>
                        <p className="text-[14px] sm:text-[15px] text-zinc-600">
                            {mode === "login" && "Accédez à votre espace garage"}
                            {mode === "reset" && "Recevez un lien de réinitialisation"}
                        </p>
                    </div>

                    {/* Error / Success messages */}
                    {error && (
                        <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg sm:rounded-xl flex items-start gap-2 sm:gap-3">
                            <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-500 flex-shrink-0 mt-0.5" />
                            <p className="text-[13px] sm:text-sm text-red-700">{error}</p>
                        </div>
                    )}

                    {success && (
                        <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-emerald-50 border border-emerald-200 rounded-lg sm:rounded-xl flex items-start gap-2 sm:gap-3">
                            <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                            <p className="text-[13px] sm:text-sm text-emerald-700">{success}</p>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                        {/* Email */}
                        <div>
                            <label className="block text-[13px] sm:text-sm font-medium text-zinc-700 mb-2">
                                Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-zinc-400" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="vous@exemple.fr"
                                    required
                                    className="w-full h-11 sm:h-12 pl-10 sm:pl-12 pr-3 sm:pr-4 border border-zinc-300 rounded-lg sm:rounded-xl text-[14px] sm:text-[15px] focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        {mode !== "reset" && (
                            <div>
                                <label className="block text-[13px] sm:text-sm font-medium text-zinc-700 mb-2">
                                    Mot de passe
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-zinc-400" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                        minLength={6}
                                        className="w-full h-11 sm:h-12 pl-10 sm:pl-12 pr-10 sm:pr-12 border border-zinc-300 rounded-lg sm:rounded-xl text-[14px] sm:text-[15px] focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" /> : <Eye className="h-4 w-4 sm:h-5 sm:w-5" />}
                                    </button>
                                </div>
                            </div>
                        )}


                        {/* Forgot password link */}
                        {mode === "login" && (
                            <div className="text-right">
                                <button
                                    type="button"
                                    onClick={() => setMode("reset")}
                                    className="text-[13px] sm:text-sm text-zinc-600 hover:text-zinc-900 transition-colors"
                                >
                                    Mot de passe oublié ?
                                </button>
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-11 sm:h-12 bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-400 text-white text-[14px] sm:text-[15px] font-semibold rounded-lg sm:rounded-xl flex items-center justify-center gap-2 transition-colors"
                        >
                            {loading ? (
                                <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                            ) : (
                                <>
                                    {mode === "login" && "Se connecter"}
                                    {mode === "reset" && "Envoyer le lien"}
                                </>
                            )}
                        </button>
                    </form>

                    {/* Mode switch */}
                    <div className="mt-5 sm:mt-6 text-center">
                        {mode === "login" && (
                            <p className="text-[13px] sm:text-sm text-zinc-600">
                                Pas encore de compte ?{" "}
                                <Link
                                    href="/inscription"
                                    className="font-semibold text-zinc-900 hover:underline transition-colors"
                                >
                                    Créer un compte
                                </Link>
                            </p>
                        )}
                        {mode === "reset" && (
                            <button
                                onClick={() => { setMode("login"); setError(null); setSuccess(null) }}
                                className="text-[13px] sm:text-sm text-zinc-600 hover:text-zinc-900 flex items-center justify-center gap-1 transition-colors mx-auto"
                            >
                                <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                Retour à la connexion
                            </button>
                        )}
                    </div>

                </div>
            </div>

            {/* Right side - Visual (desktop only) */}
            <div className="hidden lg:flex w-1/2 bg-zinc-900 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-900" />
                <div className="relative z-10 flex flex-col justify-center px-12 xl:px-16">
                    <h2 className="text-3xl xl:text-4xl font-bold text-white mb-4 xl:mb-6">
                        Gérez votre garage en toute simplicité
                    </h2>
                    <p className="text-base xl:text-lg text-zinc-400 mb-6 xl:mb-8">
                        Clients, véhicules, réparations, factures... Tout au même endroit.
                    </p>
                    <div className="space-y-3 xl:space-y-4">
                        {[
                            "Version gratuite disponible",
                            "5 clients & 5 véhicules",
                            "Configuration en 2 minutes",
                        ].map((item) => (
                            <div key={item} className="flex items-center gap-3">
                                <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                                <span className="text-white text-[15px] xl:text-base">{item}</span>
                            </div>
                        ))}
                    </div>
                </div>
                {/* Decorative elements */}
                <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-zinc-800/50" />
                <div className="absolute -top-32 -left-32 w-64 h-64 rounded-full bg-zinc-800/30" />
            </div>
        </div>
    )
}
