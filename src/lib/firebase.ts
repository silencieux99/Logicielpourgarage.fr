import { initializeApp, getApps } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
    apiKey: "AIzaSyA4fGDyWhLlZtxyn6FULzrkTAfzQE1nF4k",
    authDomain: "logicielpourgarage.firebaseapp.com",
    projectId: "logicielpourgarage",
    storageBucket: "logicielpourgarage.firebasestorage.app",
    messagingSenderId: "812168375232",
    appId: "1:812168375232:web:c316cc16a0247325a17625",
    measurementId: "G-EYGF7FCM10"
}

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]

export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)

export default app
