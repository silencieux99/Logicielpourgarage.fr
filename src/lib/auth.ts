import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut as firebaseSignOut,
    sendPasswordResetEmail,
    sendEmailVerification,
    onAuthStateChanged,
    updatePassword,
    reauthenticateWithCredential,
    EmailAuthProvider,
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

// Changer le mot de passe (nécessite réauthentification)
export const updateUserPassword = async (currentPassword: string, newPassword: string) => {
    const user = auth.currentUser
    if (!user || !user.email) {
        throw new Error('Utilisateur non connecté')
    }

    // Réauthentifier l'utilisateur avec son mot de passe actuel
    const credential = EmailAuthProvider.credential(user.email, currentPassword)
    await reauthenticateWithCredential(user, credential)

    // Mettre à jour le mot de passe
    await updatePassword(user, newPassword)
}

// Observer les changements d'authentification
export const onAuthChange = (callback: (user: User | null) => void) => {
    return onAuthStateChanged(auth, callback)
}

// Obtenir l'utilisateur actuel
export const getCurrentUser = (): User | null => {
    return auth.currentUser
}
