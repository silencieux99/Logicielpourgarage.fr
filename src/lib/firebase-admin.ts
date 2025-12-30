import { initializeApp, getApps, cert, App } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'

// Path to service account key
const serviceAccount = require('../../firebase-admin-key.json')

let adminApp: App

if (getApps().length === 0) {
    adminApp = initializeApp({
        credential: cert(serviceAccount),
        projectId: 'logicielpourgarage'
    })
} else {
    adminApp = getApps()[0]
}

export const adminAuth = getAuth(adminApp)
export const adminDb = getFirestore(adminApp)

export default adminApp
