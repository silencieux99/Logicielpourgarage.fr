"use client"

import { Sidebar } from "@/components/layout/sidebar"
import { SidebarProvider, useSidebar } from "@/lib/sidebar-context"
import { cn } from "@/lib/utils"

function DashboardContent({ children }: { children: React.ReactNode }) {
    const { isCollapsed } = useSidebar()

    return (
        <div className="min-h-screen bg-zinc-50">
            <Sidebar />

            <main className={cn(
                "pt-14 pb-20 md:pt-0 md:pb-0 min-h-screen transition-all duration-300",
                "md:pl-[72px]",
                isCollapsed ? "lg:pl-[72px]" : "lg:pl-[260px]"
            )}>
                <div className="p-4 sm:p-6 lg:p-8 max-w-7xl">
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
