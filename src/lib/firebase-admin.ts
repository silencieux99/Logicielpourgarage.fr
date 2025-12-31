import { initializeApp, getApps, cert, App } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'

let adminApp: App

if (getApps().length === 0) {
    // Vérifier que les variables d'environnement sont présentes
    if (!process.env.FIREBASE_ADMIN_PRIVATE_KEY ||
        !process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
        !process.env.FIREBASE_ADMIN_CLIENT_EMAIL) {
        console.error('Firebase Admin: Variables d\'environnement manquantes')
        throw new Error('Firebase Admin configuration manquante. Veuillez configurer FIREBASE_ADMIN_PRIVATE_KEY, FIREBASE_ADMIN_CLIENT_EMAIL et NEXT_PUBLIC_FIREBASE_PROJECT_ID')
    }

    adminApp = initializeApp({
        credential: cert({
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    })
} else {
    adminApp = getApps()[0]
}

export const adminAuth = getAuth(adminApp)
export const adminDb = getFirestore(adminApp)

export default adminApp
