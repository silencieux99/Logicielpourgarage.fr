"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import {
    LayoutDashboard,
    Users,
    Car,
    Wrench,
    FileText,
    Calendar,
    Package,
    BarChart3,
    MessageSquare,
    Settings,
    HelpCircle,
    LogOut,
    Menu,
    X,
    ChevronLeft,
    ChevronRight,
    Search,
    Hammer,
    GraduationCap
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useSidebar } from "@/lib/sidebar-context"

const navigation = [
    { name: "Tableau de bord", href: "/dashboard", icon: LayoutDashboard },
    { name: "Clients", href: "/clients", icon: Users },
    { name: "Véhicules", href: "/vehicles", icon: Car },
    { name: "Réparations", href: "/repairs", icon: Wrench },
    { name: "Factures", href: "/invoices", icon: FileText },
    { name: "Agenda", href: "/schedule", icon: Calendar },
    { name: "Stock", href: "/inventory", icon: Package },
    { name: "Analytiques", href: "/analytics", icon: BarChart3 },
    { name: "Messages", href: "/messages", icon: MessageSquare },
    { name: "Outils", href: "/outils", icon: Hammer },
    { name: "Tutoriaux", href: "/tutoriaux", icon: GraduationCap },
]

const secondaryNav = [
    { name: "Paramètres", href: "/settings", icon: Settings },
    { name: "Aide", href: "/help", icon: HelpCircle },
]

const mobileNavItems = [
    { name: "Accueil", href: "/dashboard", icon: LayoutDashboard },
    { name: "Clients", href: "/clients", icon: Users },
    { name: "Réparations", href: "/repairs", icon: Wrench },
    { name: "Agenda", href: "/schedule", icon: Calendar },
    { name: "Plus", href: "#more", icon: Menu },
]

export function Sidebar() {
    const pathname = usePathname()
    const { isCollapsed, toggleSidebar } = useSidebar()
    const [showMoreMenu, setShowMoreMenu] = useState(false)

    useEffect(() => {
        setShowMoreMenu(false)
    }, [pathname])

    useEffect(() => {
        if (showMoreMenu) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
        return () => {
            document.body.style.overflow = ''
        }
    }, [showMoreMenu])

    return (
        <>
            {/* Desktop Sidebar */}
            <aside
                className={cn(
                    "hidden lg:flex flex-col fixed left-0 top-0 h-screen bg-white border-r border-zinc-100 z-40",
                    "transition-all duration-300 ease-in-out",
                    isCollapsed ? "w-[64px]" : "w-[240px]"
                )}
            >
                {/* Logo */}
                <div className={cn(
                    "h-28 flex items-center border-b border-zinc-50 transition-all duration-300",
                    isCollapsed ? "justify-center px-0" : "px-3"
                )}>
                    <Link href="/dashboard" className="flex items-center">
                        <img
                            src="/GaragePROlogo.png"
                            alt="GaragePro"
                            className={cn(
                                "w-auto transition-all duration-300",
                                isCollapsed ? "h-20" : "h-24"
                            )}
                        />
                    </Link>
                </div>

                {/* Toggle Button */}
                <button
                    onClick={toggleSidebar}
                    className="absolute -right-2.5 top-16 w-5 h-5 bg-white border border-zinc-200 rounded-full flex items-center justify-center shadow-sm hover:bg-zinc-50 transition-all z-50"
                >
                    {isCollapsed ? (
                        <ChevronRight className="h-3 w-3 text-zinc-500" />
                    ) : (
                        <ChevronLeft className="h-3 w-3 text-zinc-500" />
                    )}
                </button>

                {/* Nav */}
                <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto custom-scrollbar">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-medium transition-all",
                                    isActive
                                        ? "bg-zinc-900 text-white"
                                        : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900",
                                    isCollapsed && "justify-center px-0"
                                )}
                                title={isCollapsed ? item.name : undefined}
                            >
                                <item.icon className="h-4 w-4 flex-shrink-0" />
                                <span className={cn(
                                    "transition-all duration-300 whitespace-nowrap",
                                    isCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"
                                )}>
                                    {item.name}
                                </span>
                            </Link>
                        )
                    })}
                </nav>

                {/* Secondary Nav */}
                <div className="p-2 border-t border-zinc-50 space-y-0.5">
                    {secondaryNav.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-medium transition-all",
                                    isActive
                                        ? "bg-zinc-100 text-zinc-900"
                                        : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900",
                                    isCollapsed && "justify-center px-0"
                                )}
                                title={isCollapsed ? item.name : undefined}
                            >
                                <item.icon className="h-4 w-4 flex-shrink-0" />
                                <span className={cn(
                                    "transition-all duration-300 whitespace-nowrap",
                                    isCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"
                                )}>
                                    {item.name}
                                </span>
                            </Link>
                        )
                    })}
                </div>

                {/* User */}
                <div className={cn(
                    "p-2 border-t border-zinc-50 transition-all duration-300",
                    isCollapsed && "flex justify-center"
                )}>
                    {isCollapsed ? (
                        <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-xs font-medium text-zinc-600">
                            U
                        </div>
                    ) : (
                        <div className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-zinc-50 cursor-pointer transition-colors">
                            <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-xs font-medium text-zinc-600 flex-shrink-0">
                                U
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-zinc-900 truncate">Utilisateur</p>
                                <p className="text-[10px] text-zinc-500 truncate">Démo gratuite</p>
                            </div>
                            <LogOut className="h-3.5 w-3.5 text-zinc-400 flex-shrink-0" />
                        </div>
                    )}
                </div>
            </aside>

            {/* Tablet Sidebar */}
            <aside className="hidden md:flex lg:hidden flex-col fixed left-0 top-0 h-screen w-[64px] bg-white border-r border-zinc-100 z-40">
                <div className="h-20 flex items-center justify-center border-b border-zinc-50">
                    <Link href="/dashboard" className="relative w-14 h-14">
                        <Image
                            src="/GaragePROlogo.png"
                            alt="GaragePro"
                            fill
                            className="object-contain"
                            priority
                        />
                    </Link>
                </div>
                <nav className="flex-1 p-1.5 space-y-0.5 overflow-y-auto">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center justify-center p-2.5 rounded-lg transition-all",
                                    isActive
                                        ? "bg-zinc-900 text-white"
                                        : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"
                                )}
                                title={item.name}
                            >
                                <item.icon className="h-4 w-4" />
                            </Link>
                        )
                    })}
                </nav>
                <div className="p-1.5 border-t border-zinc-50 space-y-0.5">
                    {secondaryNav.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center justify-center p-2.5 rounded-lg transition-all",
                                pathname === item.href
                                    ? "bg-zinc-100 text-zinc-900"
                                    : "text-zinc-400 hover:bg-zinc-50 hover:text-zinc-900"
                            )}
                            title={item.name}
                        >
                            <item.icon className="h-4 w-4" />
                        </Link>
                    ))}
                </div>
            </aside>

            {/* Mobile Bottom Navigation */}
            {/* Find if we are on a main page (not a detail/new page) */}
            {(() => {
                const isMainPage = navigation.some(item => item.href === pathname) || pathname === '/dashboard' || pathname === '/'
                if (!isMainPage) return null

                return (
                    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-zinc-100 z-50 safe-area-bottom">
                        <div className="flex items-center justify-around h-14 px-1">
                            {mobileNavItems.map((item) => {
                                const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                                const isMore = item.href === "#more"

                                return (
                                    <button
                                        key={item.href}
                                        onClick={() => {
                                            if (isMore) {
                                                setShowMoreMenu(true)
                                            } else {
                                                window.location.href = item.href
                                            }
                                        }}
                                        className={cn(
                                            "flex-1 flex flex-col items-center justify-center gap-0.5 py-1.5 rounded-lg transition-all",
                                            isActive && !isMore ? "text-zinc-900" : "text-zinc-400"
                                        )}
                                    >
                                        <item.icon className={cn("h-5 w-5", isActive && !isMore && "text-zinc-900")} />
                                        <span className="text-[9px] font-medium">{item.name}</span>
                                    </button>
                                )
                            })}
                        </div>
                    </nav>
                )
            })()}


            {/* Mobile "More" Menu */}
            {
                showMoreMenu && (
                    <>
                        <div className="overlay md:hidden" onClick={() => setShowMoreMenu(false)} />
                        <div className="bottom-sheet md:hidden animate-slide-up">
                            <div className="bottom-sheet-handle" />
                            <div className="px-4 py-2.5 border-b border-zinc-100 flex items-center justify-between">
                                <h3 className="text-sm font-semibold text-zinc-900">Menu</h3>
                                <button onClick={() => setShowMoreMenu(false)} className="p-1.5 hover:bg-zinc-100 rounded-lg">
                                    <X className="h-4 w-4 text-zinc-500" />
                                </button>
                            </div>
                            <nav className="p-3 space-y-0.5 max-h-[60vh] overflow-y-auto">
                                {[...navigation, ...secondaryNav].map((item) => {
                                    const isActive = pathname === item.href
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={() => setShowMoreMenu(false)}
                                            className={cn(
                                                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                                                isActive ? "bg-zinc-900 text-white" : "text-zinc-700 hover:bg-zinc-50"
                                            )}
                                        >
                                            <item.icon className="h-4 w-4" />
                                            <span>{item.name}</span>
                                        </Link>
                                    )
                                })}
                                <div className="pt-3 mt-3 border-t border-zinc-100">
                                    <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">
                                        <LogOut className="h-4 w-4" />
                                        <span>Déconnexion</span>
                                    </button>
                                </div>
                            </nav>
                        </div>
                    </>
                )
            }

            {/* Mobile Header - Removed to avoid masking content */}
        </>
    )
}
