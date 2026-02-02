"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"
// import { ThemeToggleButton } from "@/components/ui/theme-toggle-button" // Ensure this path is correct, logic was in page.tsx

// Assuming ThemeToggleButton is available at existing path
import { ThemeToggleButton } from "@/components/ui/theme-toggle-button"

export function LandingHeader() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)

    // Add scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20)
        }
        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    return (
        <header
            className={cn(
                "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b",
                scrolled
                    ? "bg-[var(--bg-primary)]/95 backdrop-blur-md border-[var(--border-light)] shadow-sm"
                    : "bg-transparent border-transparent"
            )}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">

                    {/* Logo Area */}
                    <div className="flex-shrink-0 flex items-center">
                        <Link href="/" className="flex items-center gap-2">
                            <img
                                src="/GaragePROlogo.png"
                                alt="GaragePro"
                                width="180"
                                height="45"
                                className="h-10 w-auto logo-invert object-contain"
                            />
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-8 ml-auto mr-8">
                        <Link href="/#features" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors">
                            Fonctionnalités
                        </Link>
                        <Link href="/#pricing" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors">
                            Tarifs
                        </Link>
                        <Link href="/#faq" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors">
                            FAQ
                        </Link>
                    </div>

                    {/* Desktop Actions */}
                    <div className="hidden md:flex items-center gap-4">
                        <ThemeToggleButton />
                        <div className="h-6 w-px bg-zinc-200 mx-1"></div>
                        <Link
                            href="/login"
                            className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
                        >
                            Connexion
                        </Link>
                        <Link
                            href="/inscription"
                            className="inline-flex items-center justify-center h-10 px-5 text-sm font-semibold text-white transition-colors bg-zinc-900 rounded-lg hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2"
                        >
                            Essai gratuit
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="flex md:hidden items-center gap-4">
                        <ThemeToggleButton />
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="p-2 -mr-2 text-zinc-600 hover:text-zinc-900 transition-colors"
                            aria-label="Menu"
                        >
                            {mobileMenuOpen ? (
                                <X className="h-6 w-6" />
                            ) : (
                                <Menu className="h-6 w-6" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <div className="md:hidden absolute top-full left-0 right-0 bg-[var(--bg-primary)] border-b border-[var(--border-light)] shadow-lg animate-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-6 space-y-4">
                        <nav className="flex flex-col space-y-4">
                            <Link
                                href="/#features"
                                className="block text-base font-medium text-zinc-600 hover:text-zinc-900 py-2"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Fonctionnalités
                            </Link>
                            <Link
                                href="/#pricing"
                                className="block text-base font-medium text-zinc-600 hover:text-zinc-900 py-2"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Tarifs
                            </Link>
                            <Link
                                href="/#faq"
                                className="block text-base font-medium text-zinc-600 hover:text-zinc-900 py-2"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                FAQ
                            </Link>
                        </nav>

                        <div className="pt-4 mt-4 border-t border-zinc-100 flex flex-col gap-3">
                            <Link
                                href="/login"
                                className="w-full h-11 flex items-center justify-center text-base font-medium text-zinc-900 bg-zinc-100 rounded-lg hover:bg-zinc-200 transition-colors"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Connexion
                            </Link>
                            <Link
                                href="/inscription"
                                className="w-full h-11 flex items-center justify-center text-base font-medium text-white bg-zinc-900 rounded-lg hover:bg-zinc-800 transition-colors"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Essai gratuit
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </header>
    )
}
