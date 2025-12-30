import { NextRequest, NextResponse } from 'next/server'

/**
 * Vehicle Lookup API
 * 
 * Appelle l'API Railway (Opisto) pour récupérer les infos véhicule par plaque.
 * 
 * Example usage:
 *   GET /api/vehicle-lookup?type=plate&value=AB-123-CD
 *   GET /api/vehicle-lookup?type=vin&value=VF7NCBHY6JY123456
 */

const VEHICLE_API_URL = process.env.VEHICLE_API_URL || 'https://hyperassur-api-production.up.railway.app'

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
        // Format plate: remove spaces and ensure proper format
        const cleanPlate = value.toUpperCase().replace(/\s+/g, '-')

        // Call Railway API (Opisto)
        const apiUrl = `${VEHICLE_API_URL}/api/lookup?plate=${encodeURIComponent(cleanPlate)}`
        console.log(`[Vehicle Lookup] Calling: ${apiUrl}`)

        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
            // 10 second timeout
            signal: AbortSignal.timeout(10000)
        })

        const data = await response.json()
        console.log(`[Vehicle Lookup] Response:`, JSON.stringify(data).substring(0, 300))

        // API returns { success: true, found: true, data: {...}, source: 'opisto' }
        if (data.success && data.found && data.data) {
            const vehicle = data.data

            return NextResponse.json({
                success: true,
                data: {
                    plate: vehicle.plaque || cleanPlate,
                    vin: vehicle.vin || '',
                    make: vehicle.marque || '',
                    model: vehicle.modele || '',
                    year: vehicle.mise_en_circulation
                        ? parseInt(vehicle.mise_en_circulation.split('/').pop() || '0')
                        : 0,
                    color: '', // Not provided by API
                    fuel: vehicle.energie || '',
                    power: vehicle.puissance || '',
                    firstRegistration: vehicle.mise_en_circulation || '',
                    fullName: vehicle.nom_complet || '',
                    engineCode: vehicle.code_moteur || '',
                    gearboxCode: vehicle.code_boite || '',
                }
            })
        }

        // Vehicle not found
        return NextResponse.json({
            success: false,
            error: 'Véhicule non trouvé dans la base de données'
        }, { status: 404 })

    } catch (error) {
        console.error('[Vehicle Lookup] Error:', error)

        // Check if it's a timeout
        if (error instanceof Error && error.name === 'AbortError') {
            return NextResponse.json(
                { success: false, error: 'Délai d\'attente dépassé. Réessayez.' },
                { status: 504 }
            )
        }

        return NextResponse.json(
            { success: false, error: 'Erreur lors de la recherche du véhicule' },
            { status: 500 }
        )
    }
}
