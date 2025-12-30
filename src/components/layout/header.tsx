"use client"

import { Bell, Plus, Search, Command } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface HeaderProps {
    title: string
    subtitle?: string
    action?: {
        label: string
        onClick?: () => void
    }
}

export function Header({ title, subtitle, action }: HeaderProps) {
    const [showSearch, setShowSearch] = useState(false)

    return (
        <header className="h-16 bg-white/80 backdrop-blur-xl border-b border-zinc-100 flex items-center justify-between px-8 sticky top-0 z-40">
            <div>
                <h1 className="text-lg font-semibold text-zinc-900 tracking-tight">{title}</h1>
                {subtitle && <p className="text-[13px] text-zinc-500 -mt-0.5">{subtitle}</p>}
            </div>

            <div className="flex items-center gap-3">
                {/* Quick Search */}
                <button
                    onClick={() => setShowSearch(true)}
                    className="hidden lg:flex items-center gap-3 h-9 px-4 bg-zinc-50 hover:bg-zinc-100 rounded-xl text-[13px] text-zinc-500 transition-colors"
                >
                    <Search className="h-4 w-4" />
                    <span>Recherche rapide...</span>
                    <kbd className="flex items-center gap-0.5 text-[10px] text-zinc-400 bg-white px-1.5 py-0.5 rounded border border-zinc-200 font-mono">
                        <Command className="h-2.5 w-2.5" />K
                    </kbd>
                </button>

                {/* Notifications */}
                <button className="relative h-9 w-9 flex items-center justify-center hover:bg-zinc-100 rounded-xl transition-colors">
                    <Bell className="h-[18px] w-[18px] text-zinc-600" strokeWidth={1.75} />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                </button>

                {/* Action Button */}
                {action && (
                    <Button
                        onClick={action.onClick}
                        className="h-9 px-4 bg-zinc-900 hover:bg-zinc-800 text-white text-[13px] font-medium rounded-xl shadow-lg shadow-zinc-900/20 transition-all hover:shadow-xl hover:shadow-zinc-900/25"
                    >
                        <Plus className="h-4 w-4 mr-1.5" strokeWidth={2.5} />
                        {action.label}
                    </Button>
                )}
            </div>

            {/* Search Modal */}
            {showSearch && (
                <div className="fixed inset-0 z-50 flex items-start justify-center pt-24">
                    <div
                        className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm"
                        onClick={() => setShowSearch(false)}
                    ></div>
                    <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-fade-in">
                        <div className="flex items-center gap-3 px-5 border-b border-zinc-100">
                            <Search className="h-5 w-5 text-zinc-400" />
                            <input
                                autoFocus
                                type="text"
                                placeholder="Rechercher clients, véhicules, réparations..."
                                className="flex-1 h-14 text-[15px] placeholder:text-zinc-400 focus:outline-none"
                            />
                            <kbd className="text-[11px] text-zinc-400 bg-zinc-100 px-2 py-1 rounded font-mono">ESC</kbd>
                        </div>
                        <div className="p-4">
                            <p className="text-[12px] text-zinc-500 uppercase tracking-wider mb-3">Recherches récentes</p>
                            <div className="space-y-1">
                                {["Peugeot 308 AB-123-CD", "Martin Dubois", "Facture FAC-2024-0156"].map((item, i) => (
                                    <button
                                        key={i}
                                        className="w-full flex items-center gap-3 p-3 hover:bg-zinc-50 rounded-xl text-left transition-colors"
                                    >
                                        <Search className="h-4 w-4 text-zinc-400" />
                                        <span className="text-[13px] text-zinc-700">{item}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </header>
    )
}
