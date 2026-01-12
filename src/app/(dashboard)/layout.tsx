"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { SidebarProvider, useSidebar } from "@/lib/sidebar-context"
import { useAuth } from "@/lib/auth-context"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

function DashboardContent({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const { user, loading } = useAuth()
    const { isCollapsed, tabletExpanded } = useSidebar()

    // Protéger toutes les routes du dashboard
    useEffect(() => {
        if (!loading && !user) {
            router.push('/login')
        }
    }, [user, loading, router])

    // Afficher un loader pendant la vérification
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[var(--bg-secondary)]">
                <Loader2 className="h-6 w-6 animate-spin text-[var(--text-muted)]" />
            </div>
        )
    }

    // Ne rien afficher si pas connecté (redirection en cours)
    if (!user) {
        return null
    }

    return (
        <div className="min-h-screen bg-[var(--bg-secondary)]">
            <Sidebar />

            <main className={cn(
                "pb-20 md:pb-0 min-h-screen transition-all duration-300",
                tabletExpanded ? "md:pl-[200px]" : "md:pl-[64px]",
                isCollapsed ? "lg:pl-[64px]" : "lg:pl-[240px]"
            )}>
                <div className="p-4 sm:p-5 lg:p-6 max-w-[1200px]">
                    {children}
                </div>
            </main>
        </div>
    )
}

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <SidebarProvider>
            <DashboardContent>{children}</DashboardContent>
        </SidebarProvider>
    )
}
