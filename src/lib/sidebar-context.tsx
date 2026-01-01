"use client"

import { createContext, useContext, useState, ReactNode } from 'react'

interface SidebarContextType {
    isCollapsed: boolean
    setIsCollapsed: (value: boolean) => void
    toggleSidebar: () => void
    tabletExpanded: boolean
    setTabletExpanded: (value: boolean) => void
    toggleTabletSidebar: () => void
}

const SidebarContext = createContext<SidebarContextType>({
    isCollapsed: false,
    setIsCollapsed: () => { },
    toggleSidebar: () => { },
    tabletExpanded: false,
    setTabletExpanded: () => { },
    toggleTabletSidebar: () => { },
})

export function SidebarProvider({ children }: { children: ReactNode }) {
    const [isCollapsed, setIsCollapsed] = useState(false)
    const [tabletExpanded, setTabletExpanded] = useState(false)

    const toggleSidebar = () => setIsCollapsed(!isCollapsed)
    const toggleTabletSidebar = () => setTabletExpanded(!tabletExpanded)

    return (
        <SidebarContext.Provider value={{ isCollapsed, setIsCollapsed, toggleSidebar, tabletExpanded, setTabletExpanded, toggleTabletSidebar }}>
            {children}
        </SidebarContext.Provider>
    )
}

export const useSidebar = () => useContext(SidebarContext)
