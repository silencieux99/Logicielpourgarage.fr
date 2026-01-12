"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import {
    LayoutDashboard,
    Users,
    UserCog,
    Car,
    Wrench,
    FileText,
    Calendar,
    Package,
    TrendingUp,
    MessageSquare,
    Settings,
    HelpCircle,
    LogOut,
    Menu,
    X,
    ChevronLeft,
    ChevronRight,
    Hammer,
    GraduationCap,
    Crown,
    Sparkles
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useSidebar } from "@/lib/sidebar-context"
import { signOut } from "@/lib/auth"
import { useAuth } from "@/lib/auth-context"

const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Clients", href: "/clients", icon: Users },
    { name: "Personnel", href: "/personnel", icon: UserCog },
    { name: "Véhicules", href: "/vehicles", icon: Car },
    { name: "Réparations", href: "/repairs", icon: Wrench },
    { name: "Factures", href: "/invoices", icon: FileText },
    { name: "Agenda", href: "/schedule", icon: Calendar },
    { name: "Stock", href: "/inventory", icon: Package },
    { name: "Analytiques", href: "/analytics", icon: TrendingUp },
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
    const router = useRouter()
    const { isCollapsed, toggleSidebar, tabletExpanded, toggleTabletSidebar } = useSidebar()
    const { garage } = useAuth()
    const [showMoreMenu, setShowMoreMenu] = useState(false)

    const isPro = garage?.plan === 'pro' && garage?.subscriptionStatus === 'active'

    const handleLogout = async () => {
        try {
            await signOut()
            router.push('/login')
        } catch (error) {
            console.error('Erreur déconnexion:', error)
        }
    }

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
            {/* Desktop Sidebar - Premium */}
            <aside
                className={cn(
                    "hidden lg:flex flex-col fixed left-0 top-0 h-screen bg-white z-40",
                    "transition-all duration-300 ease-out",
                    "border-r border-[var(--border-light)]",
                    isCollapsed ? "w-[64px]" : "w-[240px]"
                )}
                style={{ boxShadow: 'var(--shadow-xs)' }}
            >
                {/* Logo */}
                <div className={cn(
                    "h-14 flex items-center border-b border-[var(--border-light)]",
                    isCollapsed ? "justify-center px-0" : "px-4"
                )}>
                    <Link href="/dashboard" className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-[var(--accent-primary)] flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-bold text-sm">G</span>
                        </div>
                        <span className={cn(
                            "font-semibold text-[15px] text-[var(--text-primary)] tracking-tight transition-all duration-300",
                            isCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"
                        )}>
                            GaragePro
                        </span>
                    </Link>
                </div>

                {/* Nav */}
                <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto custom-scrollbar">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "group flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-medium transition-all duration-150",
                                    isActive
                                        ? "bg-[var(--accent-soft)] text-[var(--text-primary)]"
                                        : "text-[var(--text-tertiary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]",
                                    isCollapsed && "justify-center px-0"
                                )}
                                title={isCollapsed ? item.name : undefined}
                            >
                                <item.icon className={cn(
                                    "h-[18px] w-[18px] flex-shrink-0 transition-colors",
                                    isActive ? "text-[var(--text-primary)]" : "text-[var(--text-muted)] group-hover:text-[var(--text-secondary)]"
                                )} strokeWidth={1.75} />
                                <span className={cn(
                                    "transition-all duration-300 whitespace-nowrap",
                                    isCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"
                                )}>
                                    {item.name}
                                </span>
                                {isActive && !isCollapsed && (
                                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)]" />
                                )}
                            </Link>
                        )
                    })}
                </nav>

                {/* Secondary Nav */}
                <div className="px-2 py-2 border-t border-[var(--border-light)] space-y-0.5">
                    {secondaryNav.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "group flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-medium transition-all duration-150",
                                    isActive
                                        ? "bg-[var(--accent-soft)] text-[var(--text-primary)]"
                                        : "text-[var(--text-tertiary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]",
                                    isCollapsed && "justify-center px-0"
                                )}
                                title={isCollapsed ? item.name : undefined}
                            >
                                <item.icon className={cn(
                                    "h-[18px] w-[18px] flex-shrink-0",
                                    isActive ? "text-[var(--text-primary)]" : "text-[var(--text-muted)]"
                                )} strokeWidth={1.75} />
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

                {/* Subscription Badge */}
                {!isCollapsed && (
                    <div className="px-2 py-2 border-t border-[var(--border-light)]">
                        {isPro ? (
                            <div className="flex items-center gap-2.5 px-3 py-2.5 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-100/50">
                                <div className="w-6 h-6 rounded-md bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                                    <Crown className="h-3.5 w-3.5 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <span className="text-[13px] font-medium text-amber-900">Pro</span>
                                </div>
                            </div>
                        ) : (
                            <Link
                                href="/upgrade"
                                className="group flex items-center gap-2.5 px-3 py-2.5 bg-[var(--bg-tertiary)] rounded-lg hover:bg-[var(--border-default)] transition-all border border-transparent hover:border-[var(--border-default)]"
                            >
                                <div className="w-6 h-6 rounded-md bg-[var(--text-muted)] group-hover:bg-[var(--text-tertiary)] flex items-center justify-center transition-colors">
                                    <Sparkles className="h-3.5 w-3.5 text-white" />
                                </div>
                                <div className="flex-1">
                                    <span className="text-[13px] font-medium text-[var(--text-secondary)]">Passer au Pro</span>
                                </div>
                                <ChevronRight className="h-4 w-4 text-[var(--text-muted)] group-hover:translate-x-0.5 transition-transform" />
                            </Link>
                        )}
                    </div>
                )}

                {isCollapsed && (
                    <div className="px-2 py-2 border-t border-[var(--border-light)] flex justify-center">
                        {isPro ? (
                            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center" title="Plan Pro">
                                <Crown className="h-4 w-4 text-white" />
                            </div>
                        ) : (
                            <Link href="/upgrade" className="w-9 h-9 rounded-lg bg-[var(--bg-tertiary)] hover:bg-[var(--border-default)] flex items-center justify-center transition-colors" title="Passer au Pro">
                                <Sparkles className="h-4 w-4 text-[var(--text-muted)]" />
                            </Link>
                        )}
                    </div>
                )}

                {/* Toggle & Logout */}
                <div className="px-2 py-2 border-t border-[var(--border-light)] space-y-0.5">
                    <button
                        onClick={toggleSidebar}
                        className={cn(
                            "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-medium transition-all duration-150",
                            "text-[var(--text-tertiary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]",
                            isCollapsed && "justify-center px-0"
                        )}
                    >
                        {isCollapsed ? (
                            <ChevronRight className="h-[18px] w-[18px]" strokeWidth={1.75} />
                        ) : (
                            <>
                                <ChevronLeft className="h-[18px] w-[18px]" strokeWidth={1.75} />
                                <span>Réduire</span>
                            </>
                        )}
                    </button>
                    <button
                        onClick={handleLogout}
                        className={cn(
                            "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-medium transition-all duration-150",
                            "text-[var(--text-tertiary)] hover:bg-red-50 hover:text-red-600",
                            isCollapsed && "justify-center px-0"
                        )}
                        title={isCollapsed ? "Déconnexion" : undefined}
                    >
                        <LogOut className="h-[18px] w-[18px]" strokeWidth={1.75} />
                        <span className={cn(
                            "transition-all duration-300 whitespace-nowrap",
                            isCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"
                        )}>
                            Déconnexion
                        </span>
                    </button>
                </div>
            </aside>

            {/* Tablet Sidebar - Premium */}
            <aside className={cn(
                "hidden md:flex lg:hidden flex-col fixed left-0 top-0 h-screen bg-white z-40 transition-all duration-300",
                "border-r border-[var(--border-light)]",
                tabletExpanded ? "w-[200px]" : "w-[64px]"
            )} style={{ boxShadow: 'var(--shadow-xs)' }}>
                <div className={cn(
                    "h-14 flex items-center justify-center border-b border-[var(--border-light)]",
                    tabletExpanded ? "px-3" : "px-0"
                )}>
                    <Link href="/dashboard" className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-[var(--accent-primary)] flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-bold text-sm">G</span>
                        </div>
                        {tabletExpanded && (
                            <span className="font-semibold text-[15px] text-[var(--text-primary)] tracking-tight">
                                GaragePro
                            </span>
                        )}
                    </Link>
                </div>

                <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center py-2 rounded-lg transition-all duration-150",
                                    tabletExpanded ? "gap-2.5 px-2.5" : "justify-center px-0",
                                    isActive
                                        ? "bg-[var(--accent-soft)] text-[var(--text-primary)]"
                                        : "text-[var(--text-tertiary)] hover:bg-[var(--bg-tertiary)]"
                                )}
                                title={tabletExpanded ? undefined : item.name}
                            >
                                <item.icon className={cn(
                                    "h-[18px] w-[18px] flex-shrink-0",
                                    isActive ? "text-[var(--text-primary)]" : "text-[var(--text-muted)]"
                                )} strokeWidth={1.75} />
                                {tabletExpanded && (
                                    <span className="text-[13px] font-medium">{item.name}</span>
                                )}
                            </Link>
                        )
                    })}
                </nav>

                <div className="px-2 py-2 border-t border-[var(--border-light)] space-y-0.5">
                    <button
                        onClick={toggleTabletSidebar}
                        className={cn(
                            "w-full flex items-center py-2 rounded-lg transition-all duration-150",
                            tabletExpanded ? "gap-2.5 px-2.5" : "justify-center",
                            "text-[var(--text-tertiary)] hover:bg-[var(--bg-tertiary)]"
                        )}
                    >
                        {tabletExpanded ? (
                            <>
                                <ChevronLeft className="h-[18px] w-[18px]" strokeWidth={1.75} />
                                <span className="text-[13px] font-medium">Réduire</span>
                            </>
                        ) : (
                            <ChevronRight className="h-[18px] w-[18px]" strokeWidth={1.75} />
                        )}
                    </button>
                    {secondaryNav.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center py-2 rounded-lg transition-all duration-150",
                                tabletExpanded ? "gap-2.5 px-2.5" : "justify-center",
                                pathname === item.href
                                    ? "bg-[var(--accent-soft)] text-[var(--text-primary)]"
                                    : "text-[var(--text-tertiary)] hover:bg-[var(--bg-tertiary)]"
                            )}
                            title={tabletExpanded ? undefined : item.name}
                        >
                            <item.icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
                            {tabletExpanded && (
                                <span className="text-[13px] font-medium">{item.name}</span>
                            )}
                        </Link>
                    ))}
                    <button
                        onClick={handleLogout}
                        className={cn(
                            "w-full flex items-center py-2 rounded-lg transition-all duration-150 text-[var(--text-tertiary)] hover:bg-red-50 hover:text-red-600",
                            tabletExpanded ? "gap-2.5 px-2.5" : "justify-center"
                        )}
                    >
                        <LogOut className="h-[18px] w-[18px]" strokeWidth={1.75} />
                        {tabletExpanded && (
                            <span className="text-[13px] font-medium">Déconnexion</span>
                        )}
                    </button>
                </div>
            </aside>

            {/* Mobile Bottom Navigation - Ultra Clean */}
            {(() => {
                const isMainPage = navigation.some(item => item.href === pathname) || pathname === '/dashboard' || pathname === '/'
                if (!isMainPage) return null

                return (
                    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white z-50 safe-area-bottom">
                        <div className="flex items-center h-16 px-6">
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
                                        className="flex-1 flex flex-col items-center justify-center py-2"
                                    >
                                        <div className={cn(
                                            "w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-200",
                                            isActive && !isMore
                                                ? "bg-[var(--accent-primary)]"
                                                : "bg-transparent"
                                        )}>
                                            <item.icon
                                                className={cn(
                                                    "h-[22px] w-[22px] transition-colors",
                                                    isActive && !isMore
                                                        ? "text-white"
                                                        : "text-[var(--text-muted)]"
                                                )}
                                                strokeWidth={isActive ? 2 : 1.5}
                                            />
                                        </div>
                                        <span className={cn(
                                            "text-[10px] font-medium mt-0.5 transition-colors",
                                            isActive && !isMore
                                                ? "text-[var(--text-primary)]"
                                                : "text-[var(--text-muted)]"
                                        )}>
                                            {item.name}
                                        </span>
                                    </button>
                                )
                            })}
                        </div>
                    </nav>
                )
            })()}

            {/* Mobile "More" Menu - Ultra Clean Grid */}
            {showMoreMenu && (
                <>
                    <div
                        className="md:hidden fixed inset-0 bg-black/30 z-50"
                        onClick={() => setShowMoreMenu(false)}
                    />
                    <div className="md:hidden fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl animate-slide-in-bottom safe-area-bottom" style={{ boxShadow: '0 -4px 30px rgba(0,0,0,0.1)' }}>
                        {/* Handle bar */}
                        <div className="flex justify-center pt-3 pb-2">
                            <div className="w-10 h-1 bg-zinc-200 rounded-full" />
                        </div>

                        {/* Grid of menu items */}
                        <nav className="px-4 pb-6 max-h-[70vh] overflow-y-auto">
                            <div className="grid grid-cols-4 gap-2 mb-4">
                                {navigation.map((item) => {
                                    const isActive = pathname === item.href
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={() => setShowMoreMenu(false)}
                                            className="flex flex-col items-center justify-center py-4 rounded-2xl transition-all active:scale-95"
                                        >
                                            <div className={cn(
                                                "w-12 h-12 rounded-2xl flex items-center justify-center mb-2 transition-colors",
                                                isActive
                                                    ? "bg-[var(--accent-primary)]"
                                                    : "bg-zinc-100"
                                            )}>
                                                <item.icon className={cn(
                                                    "h-5 w-5",
                                                    isActive ? "text-white" : "text-[var(--text-secondary)]"
                                                )} strokeWidth={1.75} />
                                            </div>
                                            <span className={cn(
                                                "text-[11px] font-medium text-center",
                                                isActive ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)]"
                                            )}>
                                                {item.name}
                                            </span>
                                        </Link>
                                    )
                                })}
                            </div>

                            {/* Secondary actions */}
                            <div className="flex gap-2 pt-4 border-t border-zinc-100">
                                {secondaryNav.map((item) => {
                                    const isActive = pathname === item.href
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={() => setShowMoreMenu(false)}
                                            className={cn(
                                                "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all",
                                                isActive
                                                    ? "bg-[var(--accent-soft)] text-[var(--text-primary)]"
                                                    : "bg-zinc-50 text-[var(--text-secondary)]"
                                            )}
                                        >
                                            <item.icon className="h-4 w-4" strokeWidth={1.75} />
                                            <span className="text-[13px] font-medium">{item.name}</span>
                                        </Link>
                                    )
                                })}
                                <button
                                    onClick={handleLogout}
                                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-red-50 text-red-600 transition-all active:bg-red-100"
                                >
                                    <LogOut className="h-4 w-4" strokeWidth={1.75} />
                                    <span className="text-[13px] font-medium">Déco.</span>
                                </button>
                            </div>
                        </nav>
                    </div>
                </>
            )}
        </>
    )
}
