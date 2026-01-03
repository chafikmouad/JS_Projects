/**
 * Vue Router Configuration
 * 
 * Configuration des routes de l'application avec navigation guards.
 */

import { createRouter, createWebHistory } from 'vue-router'
import { auth } from '@/firebase/firebaseConfig'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/firebase/firebaseConfig'

// Import des vues
import Home from '@/views/Home.vue'
import Login from '@/views/Login.vue'
import Register from '@/views/Register.vue'
import Profile from '@/views/Profile.vue'
import Discussion from '@/views/Discussion.vue'
import Admin from '@/views/Admin.vue'

// Définition des routes
const routes = [
    {
        path: '/',
        name: 'Home',
        component: Home,
        meta: { title: 'Accueil - Forum Communautaire' }
    },
    {
        path: '/login',
        name: 'Login',
        component: Login,
        meta: {
            title: 'Connexion - Forum Communautaire',
            requiresGuest: true
        }
    },
    {
        path: '/register',
        name: 'Register',
        component: Register,
        meta: {
            title: 'Inscription - Forum Communautaire',
            requiresGuest: true
        }
    },
    {
        path: '/profile',
        name: 'Profile',
        component: Profile,
        meta: {
            title: 'Mon Profil - Forum Communautaire',
            requiresAuth: true
        }
    },
    {
        path: '/discussion/:id',
        name: 'Discussion',
        component: Discussion,
        props: true,
        meta: { title: 'Discussion - Forum Communautaire' }
    },
    {
        path: '/admin',
        name: 'Admin',
        component: Admin,
        meta: {
            title: 'Administration - Forum Communautaire',
            requiresAuth: true,
            requiresModerator: true
        }
    },
    {
        // Route 404
        path: '/:pathMatch(.*)*',
        redirect: '/'
    }
]

// Création du router
const router = createRouter({
    history: createWebHistory(),
    routes,
    scrollBehavior(to, from, savedPosition) {
        if (savedPosition) {
            return savedPosition
        } else {
            return { top: 0 }
        }
    }
})

// Helper pour attendre l'état d'authentification
const getCurrentUser = () => {
    return new Promise((resolve, reject) => {
        const unsubscribe = onAuthStateChanged(auth,
            (user) => {
                unsubscribe()
                resolve(user)
            },
            (error) => {
                unsubscribe()
                reject(error)
            }
        )
    })
}

// Helper pour vérifier le rôle de l'utilisateur
const getUserRole = async (userId) => {
    try {
        const userDoc = await getDoc(doc(db, 'users', userId))
        if (userDoc.exists()) {
            return userDoc.data().role
        }
        return 'user'
    } catch (error) {
        console.error('Erreur lors de la vérification du rôle:', error)
        return 'user'
    }
}

// Navigation Guard
router.beforeEach(async (to, from, next) => {
    // Mettre à jour le titre de la page
    document.title = to.meta.title || 'Forum Communautaire'

    const user = await getCurrentUser()

    // Route nécessite une authentification
    if (to.meta.requiresAuth && !user) {
        console.log('Accès refusé: authentification requise')
        next({ name: 'Login', query: { redirect: to.fullPath } })
        return
    }

    // Route réservée aux invités (login, register)
    if (to.meta.requiresGuest && user) {
        console.log('Redirection: utilisateur déjà connecté')
        next({ name: 'Home' })
        return
    }

    // Route nécessite un rôle modérateur ou admin
    if (to.meta.requiresModerator && user) {
        const role = await getUserRole(user.uid)
        if (role !== 'moderator' && role !== 'admin') {
            console.log('Accès refusé: rôle modérateur requis')
            next({ name: 'Home' })
            return
        }
    }

    next()
})

export default router
