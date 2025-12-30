"use client"

import { Sidebar } from "@/components/layout/sidebar"
import { SidebarProvider, useSidebar } from "@/lib/sidebar-context"
import { cn } from "@/lib/utils"

function DashboardContent({ children }: { children: React.ReactNode }) {
    const { isCollapsed } = useSidebar()

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
