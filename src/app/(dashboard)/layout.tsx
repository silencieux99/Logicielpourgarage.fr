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
    const { isCollapsed } = useSidebar()

    // Protéger toutes les routes du dashboard
    useEffect(() => {
        if (!loading && !user) {
            router.push('/login')
        }
    }, [user, loading, router])

    // Afficher un loader pendant la vérification
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-50">
                <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
            </div>
        )
    }

    // Ne rien afficher si pas connecté (redirection en cours)
    if (!user) {
        return null
    }

    return (
        <div className="min-h-screen bg-zinc-50/50">
            <Sidebar />

            <main className={cn(
                "pb-24 md:pb-0 min-h-screen transition-all duration-300",
                "md:pl-[56px]",
                isCollapsed ? "lg:pl-[64px]" : "lg:pl-[240px]"
            )}>
                <div className="p-3 sm:p-4 lg:p-6 max-w-6xl">
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
