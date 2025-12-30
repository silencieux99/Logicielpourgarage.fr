"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface BrandLogoProps {
    brand: string
    className?: string
    size?: number
}

export function BrandLogo({ brand, className, size = 32 }: BrandLogoProps) {
    const [error, setError] = useState(false)
    const [logoPath, setLogoPath] = useState<string | null>(null)

    useEffect(() => {
        if (!brand) return

        // Normalize brand name for file path
        // Lowercase, replace spaces and special chars with dashes
        const normalized = brand
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "")

        setLogoPath(`/brand-logos/${normalized}.png`)
        setError(false)
    }, [brand])

    if (!brand || error || !logoPath) {
        return (
            <div
                className={cn(
                    "bg-zinc-100 rounded-lg flex items-center justify-center font-bold text-zinc-400 uppercase",
                    className
                )}
                style={{ width: size, height: size, fontSize: Math.max(8, size / 3) }}
            >
                {brand ? brand.charAt(0) : "?"}
            </div>
        )
    }

    return (
        <div className={cn("relative flex-shrink-0", className)} style={{ width: size, height: size }}>
            <img
                src={logoPath}
                alt={brand}
                className="w-full h-full object-contain"
                onError={() => setError(true)}
            />
        </div>
    )
}
