"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User } from 'firebase/auth'
import { onAuthChange } from './auth'
import { getGarageByUserId, Garage, GarageConfig, getGarageConfig } from './database'

interface AuthContextType {
    user: User | null
    garage: Garage | null
    config: GarageConfig | null
    loading: boolean
    refreshGarage: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    garage: null,
    config: null,
    loading: true,
    refreshGarage: async () => { }
})

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [garage, setGarage] = useState<Garage | null>(null)
    const [config, setConfig] = useState<GarageConfig | null>(null)
    const [loading, setLoading] = useState(true)

    const loadGarageData = async (userId: string) => {
        console.log('🔄 AuthContext - Chargement des données pour userId:', userId)
        const garageData = await getGarageByUserId(userId)
        console.log('🏢 AuthContext - Garage chargé:', garageData)
        setGarage(garageData)

        if (garageData?.id) {
            const configData = await getGarageConfig(garageData.id)
            console.log('⚙️ AuthContext - Config chargée:', configData)
            setConfig(configData)
        } else {
            console.log('⚠️ AuthContext - Pas de garage trouvé pour cet utilisateur')
        }
    }

    const refreshGarage = async () => {
        if (user) {
            await loadGarageData(user.uid)
        }
    }

    useEffect(() => {
        const unsubscribe = onAuthChange(async (firebaseUser) => {
            setUser(firebaseUser)

            if (firebaseUser) {
                await loadGarageData(firebaseUser.uid)
            } else {
                setGarage(null)
                setConfig(null)
            }

            setLoading(false)
        })

        return () => unsubscribe()
    }, [])

    return (
        <AuthContext.Provider value={{ user, garage, config, loading, refreshGarage }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)
