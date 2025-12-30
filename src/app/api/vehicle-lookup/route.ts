import { NextRequest, NextResponse } from 'next/server'

/**
 * Vehicle Lookup API
 * 
 * This endpoint accepts a plate or VIN and returns vehicle information.
 * 
 * TODO: Replace the mock implementation with your actual API integration.
 * 
 * Example usage:
 *   GET /api/vehicle-lookup?type=plate&value=AB-123-CD
 *   GET /api/vehicle-lookup?type=vin&value=VF7NCBHY6JY123456
 * 
 * Expected response format:
 * {
 *   success: boolean,
 *   data?: {
 *     plate: string,
 *     vin: string,
 *     make: string,
 *     model: string,
 *     year: number,
 *     color: string,
 *     fuel: string,
 *     power: string,
 *     firstRegistration: string,
 *   },
 *   error?: string
 * }
 */

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get('type') // 'plate' or 'vin'
    const value = searchParams.get('value')

    if (!type || !value) {
        return NextResponse.json(
            { success: false, error: 'Missing type or value parameter' },
            { status: 400 }
        )
    }

    if (type !== 'plate' && type !== 'vin') {
        return NextResponse.json(
            { success: false, error: 'Type must be "plate" or "vin"' },
            { status: 400 }
        )
    }

    try {
        // ============================================
        // TODO: Replace this section with your actual API call
        // ============================================
        // 
        // Example with external API:
        // const response = await fetch(`https://your-api.com/vehicle?${type}=${value}`, {
        //   headers: {
        //     'Authorization': `Bearer ${process.env.VEHICLE_API_KEY}`,
        //   },
        // })
        // const data = await response.json()
        // 
        // Then transform and return the data:
        // return NextResponse.json({
        //   success: true,
        //   data: {
        //     plate: data.immatriculation,
        //     vin: data.numero_vin,
        //     make: data.marque,
        //     model: data.modele,
        //     year: data.annee,
        //     color: data.couleur,
        //     fuel: data.energie,
        //     power: data.puissance,
        //     firstRegistration: data.date_premiere_immat,
        //   }
        // })
        // ============================================

        // Mock implementation for demonstration
        // Simulates API latency
        await new Promise(resolve => setTimeout(resolve, 500))

        // Mock data - replace with actual API response
        const mockVehicle = {
            plate: type === 'plate' ? value.toUpperCase() : 'XX-999-XX',
            vin: type === 'vin' ? value.toUpperCase() : 'VF7MOCK123456789',
            make: 'Peugeot',
            model: '3008',
            year: 2021,
            color: 'Gris Platinium',
            fuel: 'Diesel',
            power: '130 ch',
            firstRegistration: '15/03/2021',
        }

        // Simulate "not found" for short inputs
        if (value.length < 7) {
            return NextResponse.json({
                success: false,
                error: 'Véhicule non trouvé'
            }, { status: 404 })
        }

        return NextResponse.json({
            success: true,
            data: mockVehicle
        })

    } catch (error) {
        console.error('Vehicle lookup error:', error)
        return NextResponse.json(
            { success: false, error: 'Erreur lors de la recherche du véhicule' },
            { status: 500 }
        )
    }
}
