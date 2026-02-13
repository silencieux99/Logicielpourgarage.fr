"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Menu, X, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

export function LandingHeader() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 10)
        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    return (
        <header
            className={cn(
                "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
                scrolled
                    ? "bg-[var(--bg-primary)]/80 backdrop-blur-2xl border-b border-[var(--border-light)]"
                    : "bg-transparent border-b border-transparent"
            )}
        >
            <div className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-12">
                <div className="flex items-center justify-between h-20 sm:h-[88px] lg:h-24">

                    {/* ── Logo ── */}
                    <Link href="/" className="flex items-center flex-shrink-0">
                        <img
                            src="/logo.png"
                            alt="GaragePro"
                            width="128"
                            height="128"
                            className="h-24 w-24 sm:h-28 sm:w-28 lg:h-32 lg:w-32 object-contain"
                        />
                    </Link>

                    {/* ── Desktop Nav ── */}
                    <nav className="hidden lg:flex items-center gap-10 xl:gap-12">
                        {[
                            { label: "Fonctionnalités", href: "/#features" },
                            { label: "Tarifs", href: "/#pricing" },
                            { label: "FAQ", href: "/#faq" },
                        ].map(link => (
                            <Link
                                key={link.label}
                                href={link.href}
                                className="text-[15px] xl:text-base font-medium text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors duration-200 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-[var(--text-primary)] hover:after:w-full after:transition-all after:duration-300"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>

                    {/* ── Desktop Actions ── */}
                    <div className="hidden lg:flex items-center gap-2">
                        <Link
                            href="/login"
                            className="h-11 xl:h-12 px-5 xl:px-6 text-[15px] xl:text-base font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors rounded-xl flex items-center justify-center hover:bg-[var(--bg-secondary)]"
                        >
                            Connexion
                        </Link>
                        <Link
                            href="/inscription"
                            className="h-11 xl:h-12 px-6 xl:px-8 text-[15px] xl:text-base font-semibold text-white bg-zinc-900 rounded-xl flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all duration-200 hover:shadow-lg active:scale-[0.97]"
                        >
                            Essai gratuit
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>

                    {/* ── Mobile Actions ── */}
                    <div className="flex lg:hidden items-center gap-2">
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="p-2.5 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-all"
                            aria-label="Menu"
                        >
                            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Mobile Menu ── */}
            {mobileMenuOpen && (
                <div className="lg:hidden bg-[var(--bg-primary)]/95 backdrop-blur-2xl border-b border-[var(--border-light)]">
                    <div className="px-5 sm:px-8 py-8">
                        <nav className="space-y-1 mb-8">
                            {[
                                { label: "Fonctionnalités", href: "/#features" },
                                { label: "Tarifs", href: "/#pricing" },
                                { label: "FAQ", href: "/#faq" },
                            ].map(link => (
                                <Link
                                    key={link.label}
                                    href={link.href}
                                    className="block py-4 text-lg font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </nav>

                        <div className="border-t border-[var(--border-light)] pt-6 flex flex-col gap-3">
                            <Link
                                href="/login"
                                className="w-full h-13 flex items-center justify-center text-base font-medium text-[var(--text-primary)] bg-[var(--bg-secondary)] rounded-2xl transition-colors active:scale-[0.98]"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Connexion
                            </Link>
                            <Link
                                href="/inscription"
                                className="w-full h-13 flex items-center justify-center text-base font-semibold text-white bg-zinc-900 rounded-2xl hover:bg-zinc-800 transition-all gap-2 active:scale-[0.98]"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Essai gratuit
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </header>
    )
}
