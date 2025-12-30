"use client"

import Link from "next/link"
import { useState } from "react"
import { Eye, EyeOff, Loader2 } from "lucide-react"

export default function ConnexionPage() {
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        rememberMe: false
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500))
        setIsLoading(false)
        // Redirect to dashboard
        window.location.href = "/dashboard"
    }

    return (
        <div className="min-h-screen bg-zinc-50 flex">
            {/* Left Panel */}
            <div className="hidden lg:flex lg:w-1/2 bg-zinc-900 p-12 flex-col justify-between">
                <Link href="/" className="flex items-center gap-2.5">
                    <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center">
                        <span className="text-zinc-900 font-bold text-sm">G</span>
                    </div>
                    <span className="text-[17px] font-bold text-white">GaragePro</span>
                </Link>

                <div>
                    <h1 className="text-[36px] font-bold text-white leading-tight mb-4">
                        Bon retour parmi nous
                    </h1>
                    <p className="text-[16px] text-zinc-400 leading-relaxed">
                        Connectez-vous pour accéder à votre tableau de bord et gérer votre garage.
                    </p>
                </div>

                <div className="bg-white/10 backdrop-blur rounded-2xl p-6">
                    <p className="text-[14px] text-white/90 italic mb-4">
                        "GaragePro m'a permis de diviser par 3 le temps passé sur l'administratif."
                    </p>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold">
                            PM
                        </div>
                        <div>
                            <p className="text-[14px] font-medium text-white">Pierre M.</p>
                            <p className="text-[12px] text-zinc-400">Garage Martin Auto, Lyon</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Panel - Form */}
            <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
                <div className="w-full max-w-md">
                    {/* Mobile Logo */}
                    <div className="lg:hidden mb-8">
                        <Link href="/" className="flex items-center gap-2.5">
                            <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-sm">G</span>
                            </div>
                            <span className="text-[16px] font-bold text-zinc-900">GaragePro</span>
                        </Link>
                    </div>

                    <div className="mb-8">
                        <h2 className="text-[28px] font-bold text-zinc-900 mb-2">Se connecter</h2>
                        <p className="text-[15px] text-zinc-600">
                            Pas encore de compte ?{" "}
                            <Link href="/inscription" className="text-zinc-900 font-medium hover:underline">
                                Créer un compte
                            </Link>
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
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="vous@exemple.fr"
                                className="w-full h-12 px-4 bg-white border border-zinc-300 rounded-xl text-[15px] placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all"
                            />
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-[14px] font-medium text-zinc-700">
                                    Mot de passe
                                </label>
                                <Link href="/mot-de-passe-oublie" className="text-[13px] text-zinc-600 hover:text-zinc-900">
                                    Mot de passe oublié ?
                                </Link>
                            </div>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    placeholder="••••••••"
                                    className="w-full h-12 px-4 pr-12 bg-white border border-zinc-300 rounded-xl text-[15px] placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all"
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

                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                id="remember"
                                checked={formData.rememberMe}
                                onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                                className="w-5 h-5 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
                            />
                            <label htmlFor="remember" className="text-[14px] text-zinc-600">
                                Se souvenir de moi
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-12 bg-zinc-900 hover:bg-zinc-800 text-white text-[15px] font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    Connexion...
                                </>
                            ) : (
                                "Se connecter"
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-8 border-t border-zinc-200">
                        <p className="text-[13px] text-zinc-500 text-center">
                            Besoin d'aide ?{" "}
                            <a href="mailto:support@garagepro.fr" className="text-zinc-900 font-medium hover:underline">
                                Contactez-nous
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
