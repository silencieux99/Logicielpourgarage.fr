"use client"

import { useEffect, useState } from "react"
import { Moon, Sun } from "lucide-react"
import { cn } from "@/lib/utils"

type ThemeToggleButtonProps = {
  className?: string
  showLabel?: boolean
}

export function ThemeToggleButton({ className, showLabel = true }: ThemeToggleButtonProps) {
  const [theme, setTheme] = useState<"light" | "dark">("light")

  useEffect(() => {
    if (typeof window === "undefined") return
    const stored = localStorage.getItem("theme") as "light" | "dark" | null
    const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches
    const initial = stored || (prefersDark ? "dark" : "light")
    setTheme(initial)
  }, [])

  const applyTheme = (nextTheme: "light" | "dark") => {
    if (typeof window === "undefined") return
    document.documentElement.dataset.theme = nextTheme
    document.documentElement.classList.toggle("dark", nextTheme === "dark")
    localStorage.setItem("theme", nextTheme)
    setTheme(nextTheme)
  }

  const isDark = theme === "dark"
  const label = isDark ? "Mode clair" : "Mode sombre"

  return (
    <button
      type="button"
      onClick={() => applyTheme(isDark ? "light" : "dark")}
      title={label}
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] font-medium",
        "bg-[var(--bg-tertiary)] text-[var(--text-secondary)]",
        "hover:bg-[var(--border-default)] transition-colors",
        className
      )}
    >
      {isDark ? (
        <Sun className="h-4 w-4 text-[var(--text-tertiary)]" />
      ) : (
        <Moon className="h-4 w-4 text-[var(--text-tertiary)]" />
      )}
      {showLabel && <span>{label}</span>}
    </button>
  )
}
