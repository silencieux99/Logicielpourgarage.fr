import { initializeApp, getApps, cert, App } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'

let adminApp: App

if (getApps().length === 0) {
    // Utiliser les variables d'environnement pour la production
    if (process.env.FIREBASE_ADMIN_PRIVATE_KEY) {
        adminApp = initializeApp({
            credential: cert({
                projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n'),
            }),
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        })
    } else {
        // Fallback pour le développement local avec fichier JSON
        try {
            const serviceAccount = require('../../firebase-admin-key.json')
            adminApp = initializeApp({
                credential: cert(serviceAccount),
                projectId: 'logicielpourgarage'
            })
        } catch (error) {
            console.error('Firebase Admin: Aucune configuration trouvée')
            throw new Error('Firebase Admin configuration manquante')
        }
    }
} else {
    adminApp = getApps()[0]
}

export const adminAuth = getAuth(adminApp)
export const adminDb = getFirestore(adminApp)

export default adminApp
