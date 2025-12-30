import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut as firebaseSignOut,
    sendPasswordResetEmail,
    sendEmailVerification,
    onAuthStateChanged,
    User
} from 'firebase/auth'
import { auth } from './firebase'

// Inscription
export const signUp = async (email: string, password: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    // Envoyer email de vérification
    await sendEmailVerification(userCredential.user)
    return userCredential.user
}

// Connexion
export const signIn = async (email: string, password: string) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    return userCredential.user
}

// Déconnexion
export const signOut = async () => {
    await firebaseSignOut(auth)
}

// Mot de passe oublié
export const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email)
}

// Observer les changements d'authentification
export const onAuthChange = (callback: (user: User | null) => void) => {
    return onAuthStateChanged(auth, callback)
}

// Obtenir l'utilisateur actuel
export const getCurrentUser = (): User | null => {
    return auth.currentUser
}
