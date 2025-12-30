"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
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
    const [mode, setMode] = useState<Mode>("login")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setSuccess(null)
        setLoading(true)

        try {
            if (mode === "login") {
                await signIn(email, password)
                router.push("/dashboard")
            } else if (mode === "signup") {
                if (password !== confirmPassword) {
                    setError("Les mots de passe ne correspondent pas")
                    setLoading(false)
                    return
                }
                if (password.length < 6) {
                    setError("Le mot de passe doit contenir au moins 6 caractères")
                    setLoading(false)
                    return
                }
                await signUp(email, password)
                router.push("/onboarding")
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
            <div className="flex-1 flex flex-col justify-center px-4 sm:px-8 lg:px-12 py-12">
                <div className="w-full max-w-md mx-auto">
                    {/* Logo */}
                    <Link href="/" className="inline-block mb-8">
                        <img
                            src="/GaragePROlogo.png"
                            alt="GaragePro"
                            className="h-10 sm:h-12"
                        />
                    </Link>

                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-2">
                            {mode === "login" && "Connexion"}
                            {mode === "signup" && "Créer un compte"}
                            {mode === "reset" && "Mot de passe oublié"}
                        </h1>
                        <p className="text-zinc-500">
                            {mode === "login" && "Accédez à votre espace garage"}
                            {mode === "signup" && "Démarrez votre essai gratuit de 14 jours"}
                            {mode === "reset" && "Recevez un lien de réinitialisation"}
                        </p>
                    </div>

                    {/* Error / Success messages */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    )}

                    {success && (
                        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3">
                            <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-emerald-700">{success}</p>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-zinc-700 mb-2">
                                Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="vous@exemple.fr"
                                    required
                                    className="w-full h-12 pl-12 pr-4 border border-zinc-300 rounded-xl text-[15px] focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        {mode !== "reset" && (
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-2">
                                    Mot de passe
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                        minLength={6}
                                        className="w-full h-12 pl-12 pr-12 border border-zinc-300 rounded-xl text-[15px] focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                                    >
                                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Confirm Password (signup only) */}
                        {mode === "signup" && (
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-2">
                                    Confirmer le mot de passe
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                        minLength={6}
                                        className="w-full h-12 pl-12 pr-4 border border-zinc-300 rounded-xl text-[15px] focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Forgot password link */}
                        {mode === "login" && (
                            <div className="text-right">
                                <button
                                    type="button"
                                    onClick={() => setMode("reset")}
                                    className="text-sm text-zinc-600 hover:text-zinc-900"
                                >
                                    Mot de passe oublié ?
                                </button>
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-12 bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-400 text-white text-[15px] font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors"
                        >
                            {loading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <>
                                    {mode === "login" && "Se connecter"}
                                    {mode === "signup" && "Créer mon compte"}
                                    {mode === "reset" && "Envoyer le lien"}
                                </>
                            )}
                        </button>
                    </form>

                    {/* Mode switch */}
                    <div className="mt-6 text-center">
                        {mode === "login" && (
                            <p className="text-sm text-zinc-600">
                                Pas encore de compte ?{" "}
                                <button
                                    onClick={() => { setMode("signup"); setError(null); setSuccess(null) }}
                                    className="font-semibold text-zinc-900 hover:underline"
                                >
                                    Créer un compte
                                </button>
                            </p>
                        )}
                        {mode === "signup" && (
                            <p className="text-sm text-zinc-600">
                                Déjà un compte ?{" "}
                                <button
                                    onClick={() => { setMode("login"); setError(null); setSuccess(null) }}
                                    className="font-semibold text-zinc-900 hover:underline"
                                >
                                    Se connecter
                                </button>
                            </p>
                        )}
                        {mode === "reset" && (
                            <button
                                onClick={() => { setMode("login"); setError(null); setSuccess(null) }}
                                className="text-sm text-zinc-600 hover:text-zinc-900 flex items-center justify-center gap-1"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Retour à la connexion
                            </button>
                        )}
                    </div>

                    {/* Terms (signup only) */}
                    {mode === "signup" && (
                        <p className="mt-6 text-xs text-zinc-400 text-center">
                            En créant un compte, vous acceptez nos{" "}
                            <a href="#" className="underline">conditions d'utilisation</a> et notre{" "}
                            <a href="#" className="underline">politique de confidentialité</a>.
                        </p>
                    )}
                </div>
            </div>

            {/* Right side - Visual (desktop only) */}
            <div className="hidden lg:flex w-1/2 bg-zinc-900 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-900" />
                <div className="relative z-10 flex flex-col justify-center px-16">
                    <h2 className="text-4xl font-bold text-white mb-6">
                        Gérez votre garage en toute simplicité
                    </h2>
                    <p className="text-lg text-zinc-400 mb-8">
                        Clients, véhicules, réparations, factures... Tout au même endroit.
                    </p>
                    <div className="space-y-4">
                        {[
                            "Essai gratuit 14 jours",
                            "Sans carte bancaire",
                            "Configuration en 2 minutes",
                        ].map((item) => (
                            <div key={item} className="flex items-center gap-3">
                                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                                <span className="text-white">{item}</span>
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
