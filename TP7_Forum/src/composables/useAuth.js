/**
 * Composable useAuth
 * 
 * Gestion centralisée de l'authentification Firebase.
 * Fournit les fonctions de connexion, inscription, déconnexion,
 * réinitialisation de mot de passe et gestion de l'état utilisateur.
 */

import { ref, computed, onMounted } from 'vue'
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    sendPasswordResetEmail,
    updateProfile,
    onAuthStateChanged
} from 'firebase/auth'
import { doc, setDoc, getDoc, serverTimestamp, onSnapshot } from 'firebase/firestore'
import { auth, db } from '@/firebase/firebaseConfig'

// État global de l'utilisateur (partagé entre tous les composants)
const user = ref(null)
const userProfile = ref(null)
const isLoading = ref(true)
const error = ref(null)

// Écoute des changements d'état d'authentification
let authInitialized = false

// Listener variable to unsubscribe when needed
let profileUnsubscribe = null

const initAuthListener = () => {
    if (authInitialized) return
    authInitialized = true

    onAuthStateChanged(auth, async (firebaseUser) => {
        console.log('Auth state changed:', firebaseUser?.email || 'No user')
        user.value = firebaseUser

        // Nettoyer l'ancien listener si existant
        if (profileUnsubscribe) {
            profileUnsubscribe()
            profileUnsubscribe = null
        }

        if (firebaseUser) {
            // Écouter les changements du profil en temps réel
            profileUnsubscribe = onSnapshot(doc(db, 'users', firebaseUser.uid), (doc) => {
                if (doc.exists()) {
                    userProfile.value = { id: doc.id, ...doc.data() }
                    console.log('Profil mis à jour:', userProfile.value.role)
                } else {
                    userProfile.value = null
                }
            }, (error) => {
                console.error('Erreur écoute profil:', error)
            })
        } else {
            userProfile.value = null
        }

        isLoading.value = false
    })
}

/**
 * Récupère le profil utilisateur (méthode manuelle si besoin)
 */
const fetchUserProfile = async (uid) => {
    // Cette fonction est gardée pour compatibilité mais l'écouteur principal est dans initAuthListener
    try {
        const userDoc = await getDoc(doc(db, 'users', uid))
        if (userDoc.exists()) {
            userProfile.value = { id: userDoc.id, ...userDoc.data() }
        }
    } catch (err) {
        console.error('Erreur fetch profil:', err)
    }
}

/**
 * Composable principal d'authentification
 */
const useAuth = () => {
    // Initialiser le listener au premier usage
    onMounted(() => {
        initAuthListener()
    })

    // Propriétés calculées pour les rôles
    const isAuthenticated = computed(() => !!user.value)
    const isAdmin = computed(() => userProfile.value?.role === 'admin')
    const isModerator = computed(() =>
        userProfile.value?.role === 'moderator' || userProfile.value?.role === 'admin'
    )
    const userRole = computed(() => userProfile.value?.role || 'user')

    /**
     * Connexion avec email et mot de passe
     */
    const login = async (email, password) => {
        error.value = null
        try {
            const result = await signInWithEmailAndPassword(auth, email, password)
            console.log('Connexion réussie:', result.user.email)
            return result.user
        } catch (err) {
            console.error('Erreur de connexion:', err)
            error.value = getErrorMessage(err.code)
            throw err
        }
    }

    /**
     * Inscription avec email, mot de passe et nom d'affichage
     * Crée également le document utilisateur dans Firestore
     */
    const signup = async (email, password, displayName) => {
        error.value = null
        try {
            // Créer l'utilisateur dans Firebase Auth
            const result = await createUserWithEmailAndPassword(auth, email, password)

            // Mettre à jour le profil avec le nom d'affichage
            await updateProfile(result.user, { displayName })

            // Créer le document utilisateur dans Firestore
            await setDoc(doc(db, 'users', result.user.uid), {
                uid: result.user.uid,
                name: displayName,
                email: email,
                photoURL: '',
                role: 'user',
                createdAt: serverTimestamp()
            })

            // Recharger le profil
            await fetchUserProfile(result.user.uid)

            console.log('Inscription réussie:', result.user.email)
            return result.user
        } catch (err) {
            console.error('Erreur d\'inscription:', err)
            error.value = getErrorMessage(err.code)
            throw err
        }
    }

    /**
     * Déconnexion
     */
    const logout = async () => {
        error.value = null
        try {
            await signOut(auth)
            userProfile.value = null
            console.log('Déconnexion réussie')
        } catch (err) {
            console.error('Erreur de déconnexion:', err)
            error.value = getErrorMessage(err.code)
            throw err
        }
    }

    /**
     * Réinitialisation du mot de passe
     */
    const resetPassword = async (email) => {
        error.value = null
        try {
            await sendPasswordResetEmail(auth, email)
            console.log('Email de réinitialisation envoyé à:', email)
            return true
        } catch (err) {
            console.error('Erreur de réinitialisation:', err)
            error.value = getErrorMessage(err.code)
            throw err
        }
    }

    /**
     * Traduit les codes d'erreur Firebase en messages français
     */
    const getErrorMessage = (code) => {
        const messages = {
            'auth/email-already-in-use': 'Cette adresse email est déjà utilisée.',
            'auth/invalid-email': 'Adresse email invalide.',
            'auth/operation-not-allowed': 'Opération non autorisée.',
            'auth/weak-password': 'Le mot de passe doit contenir au moins 6 caractères.',
            'auth/user-disabled': 'Ce compte a été désactivé.',
            'auth/user-not-found': 'Aucun compte trouvé avec cette adresse email.',
            'auth/wrong-password': 'Mot de passe incorrect.',
            'auth/invalid-credential': 'Email ou mot de passe incorrect.',
            'auth/too-many-requests': 'Trop de tentatives. Veuillez réessayer plus tard.',
            'auth/network-request-failed': 'Erreur de connexion réseau.'
        }
        return messages[code] || 'Une erreur est survenue. Veuillez réessayer.'
    }

    return {
        // État
        user,
        userProfile,
        isLoading,
        error,
        // Propriétés calculées
        isAuthenticated,
        isAdmin,
        isModerator,
        userRole,
        // Méthodes
        login,
        signup,
        logout,
        resetPassword,
        fetchUserProfile,
        initAuthListener
    }
}

export default useAuth
