/**
 * Composable useFirestore
 * 
 * Gestion centralisée des opérations Firestore.
 * Fournit les fonctions CRUD pour les discussions, réponses, utilisateurs et signalements.
 */

import { ref } from 'vue'
import {
    collection,
    doc,
    addDoc,
    getDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    startAfter,
    serverTimestamp,
    increment
} from 'firebase/firestore'
import { db } from '@/firebase/firebaseConfig'

/**
 * Composable principal Firestore
 */
const useFirestore = () => {
    const error = ref(null)
    const isLoading = ref(false)

    // ==========================================
    // DISCUSSIONS
    // ==========================================

    /**
     * Crée une nouvelle discussion
     */
    const addDiscussion = async (discussionData) => {
        error.value = null
        isLoading.value = true
        try {
            const docRef = await addDoc(collection(db, 'discussions'), {
                ...discussionData,
                responseCount: 0,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            })
            isLoading.value = false
            return docRef.id
        } catch (err) {
            console.error('Erreur lors de la création de la discussion:', err)
            error.value = 'Impossible de créer la discussion.'
            isLoading.value = false
            throw err
        }
    }

    /**
     * Récupère les discussions avec filtres et pagination
     */
    const getDiscussions = async (options = {}) => {
        const {
            category = null,
            sortBy = 'createdAt',
            sortOrder = 'desc',
            limitCount = 10,
            lastDoc = null,
            searchTerm = null
        } = options

        error.value = null
        isLoading.value = true

        try {
            let q = collection(db, 'discussions')
            const constraints = []
            let isFiltered = false

            // Filtre par catégorie
            if (category && category !== 'all') {
                constraints.push(where('category', '==', category))
                isFiltered = true
            }

            // Tri (seulement si pas de filtre catégorie pour éviter l'index composite obligatoire)
            if (!isFiltered) {
                if (sortBy === 'popularity') {
                    constraints.push(orderBy('responseCount', 'desc'))
                } else {
                    constraints.push(orderBy(sortBy, sortOrder))
                }

                // Pagination et limite seulement pour le flux principal
                constraints.push(limit(limitCount))

                if (lastDoc) {
                    constraints.push(startAfter(lastDoc))
                }
            } else {
                // Si filtré par catégorie, on récupère un peu plus de résultats et on trie en JS
                // On met une limite plus haute pour compenser l'absence de pagination réelle dans ce mode
                constraints.push(limit(50))
            }

            q = query(q, ...constraints)
            const snapshot = await getDocs(q)

            let discussions = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                _doc: doc // Pour la pagination
            }))

            // Si filtré par catégorie, on doit trier côté client
            if (isFiltered) {
                discussions.sort((a, b) => {
                    if (sortBy === 'popularity') {
                        return (b.responseCount || 0) - (a.responseCount || 0)
                    }

                    const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0)
                    const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0)
                    return sortOrder === 'desc' ? dateB - dateA : dateA - dateB
                })
            }

            // Filtrage par mot-clé (côté client car Firestore ne supporte pas la recherche full-text)
            if (searchTerm) {
                const lowerSearchTerm = searchTerm.toLowerCase()
                discussions = discussions.filter(d =>
                    d.title.toLowerCase().includes(lowerSearchTerm) ||
                    d.content.toLowerCase().includes(lowerSearchTerm)
                )
            }

            isLoading.value = false
            return discussions
        } catch (err) {
            console.error('Erreur lors de la récupération des discussions:', err)
            error.value = 'Impossible de charger les discussions.'
            isLoading.value = false
            throw err
        }
    }

    /**
     * Récupère une discussion par son ID
     */
    const getDiscussion = async (discussionId) => {
        error.value = null
        isLoading.value = true
        try {
            const docRef = doc(db, 'discussions', discussionId)
            const docSnap = await getDoc(docRef)

            isLoading.value = false

            if (docSnap.exists()) {
                return { id: docSnap.id, ...docSnap.data() }
            } else {
                error.value = 'Discussion non trouvée.'
                return null
            }
        } catch (err) {
            console.error('Erreur lors de la récupération de la discussion:', err)
            error.value = 'Impossible de charger la discussion.'
            isLoading.value = false
            throw err
        }
    }

    /**
     * Met à jour une discussion
     */
    const updateDiscussion = async (discussionId, updateData) => {
        error.value = null
        isLoading.value = true
        try {
            const docRef = doc(db, 'discussions', discussionId)
            await updateDoc(docRef, {
                ...updateData,
                updatedAt: serverTimestamp()
            })
            isLoading.value = false
            return true
        } catch (err) {
            console.error('Erreur lors de la mise à jour de la discussion:', err)
            error.value = 'Impossible de modifier la discussion.'
            isLoading.value = false
            throw err
        }
    }

    /**
     * Supprime une discussion et toutes ses réponses
     */
    const deleteDiscussion = async (discussionId) => {
        error.value = null
        isLoading.value = true
        try {
            // Supprimer toutes les réponses associées
            const responsesQuery = query(
                collection(db, 'responses'),
                where('discussionId', '==', discussionId)
            )
            const responsesSnapshot = await getDocs(responsesQuery)

            const deletePromises = responsesSnapshot.docs.map(doc => deleteDoc(doc.ref))
            await Promise.all(deletePromises)

            // Supprimer la discussion
            await deleteDoc(doc(db, 'discussions', discussionId))

            isLoading.value = false
            return true
        } catch (err) {
            console.error('Erreur lors de la suppression de la discussion:', err)
            error.value = 'Impossible de supprimer la discussion.'
            isLoading.value = false
            throw err
        }
    }

    // ==========================================
    // RESPONSES
    // ==========================================

    /**
     * Ajoute une réponse à une discussion
     */
    const addResponse = async (responseData) => {
        error.value = null
        isLoading.value = true
        try {
            // Ajouter la réponse
            const docRef = await addDoc(collection(db, 'responses'), {
                ...responseData,
                createdAt: serverTimestamp()
            })

            // Incrémenter le compteur de réponses de la discussion
            const discussionRef = doc(db, 'discussions', responseData.discussionId)
            await updateDoc(discussionRef, {
                responseCount: increment(1)
            })

            isLoading.value = false
            return docRef.id
        } catch (err) {
            console.error('Erreur lors de l\'ajout de la réponse:', err)
            error.value = 'Impossible d\'ajouter la réponse.'
            isLoading.value = false
            throw err
        }
    }

    /**
     * Récupère les réponses d'une discussion
     */
    const getResponses = async (discussionId) => {
        error.value = null
        isLoading.value = true
        try {
            // Requête simple sans tri pour éviter l'index composite obligatoire
            const q = query(
                collection(db, 'responses'),
                where('discussionId', '==', discussionId)
            )
            const snapshot = await getDocs(q)

            const responses = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }))

            // Tri côté client (plus simple pour démarrer sans créer d'index)
            responses.sort((a, b) => {
                const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0)
                const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0)
                return dateA - dateB
            })

            isLoading.value = false
            return responses
        } catch (err) {
            console.error('Erreur lors de la récupération des réponses:', err)
            error.value = 'Impossible de charger les réponses.'
            isLoading.value = false
            throw err
        }
    }

    /**
     * Met à jour une réponse
     */
    const updateResponse = async (responseId, updateData) => {
        error.value = null
        isLoading.value = true
        try {
            const docRef = doc(db, 'responses', responseId)
            await updateDoc(docRef, {
                ...updateData,
                updatedAt: serverTimestamp()
            })
            isLoading.value = false
            return true
        } catch (err) {
            console.error('Erreur lors de la mise à jour de la réponse:', err)
            error.value = 'Impossible de modifier la réponse.'
            isLoading.value = false
            throw err
        }
    }

    /**
     * Supprime une réponse
     */
    const deleteResponse = async (responseId, discussionId) => {
        error.value = null
        isLoading.value = true
        try {
            await deleteDoc(doc(db, 'responses', responseId))

            // Décrémenter le compteur de réponses de la discussion
            const discussionRef = doc(db, 'discussions', discussionId)
            await updateDoc(discussionRef, {
                responseCount: increment(-1)
            })

            isLoading.value = false
            return true
        } catch (err) {
            console.error('Erreur lors de la suppression de la réponse:', err)
            error.value = 'Impossible de supprimer la réponse.'
            isLoading.value = false
            throw err
        }
    }

    // ==========================================
    // USERS
    // ==========================================

    /**
     * Récupère le profil d'un utilisateur
     */
    const getUserProfile = async (userId) => {
        error.value = null
        isLoading.value = true
        try {
            const docRef = doc(db, 'users', userId)
            const docSnap = await getDoc(docRef)

            isLoading.value = false

            if (docSnap.exists()) {
                return { id: docSnap.id, ...docSnap.data() }
            } else {
                return null
            }
        } catch (err) {
            console.error('Erreur lors de la récupération du profil:', err)
            error.value = 'Impossible de charger le profil.'
            isLoading.value = false
            throw err
        }
    }

    /**
     * Met à jour le profil d'un utilisateur
     */
    const updateUserProfile = async (userId, updateData) => {
        error.value = null
        isLoading.value = true
        try {
            const docRef = doc(db, 'users', userId)
            await updateDoc(docRef, updateData)
            isLoading.value = false
            return true
        } catch (err) {
            console.error('Erreur lors de la mise à jour du profil:', err)
            error.value = 'Impossible de modifier le profil.'
            isLoading.value = false
            throw err
        }
    }

    /**
     * Récupère tous les utilisateurs (admin seulement)
     */
    const getAllUsers = async () => {
        error.value = null
        isLoading.value = true
        try {
            const snapshot = await getDocs(collection(db, 'users'))
            const users = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }))
            isLoading.value = false
            return users
        } catch (err) {
            console.error('Erreur lors de la récupération des utilisateurs:', err)
            error.value = 'Impossible de charger les utilisateurs.'
            isLoading.value = false
            throw err
        }
    }

    /**
     * Met à jour le rôle d'un utilisateur (admin seulement)
     */
    const updateUserRole = async (userId, newRole) => {
        error.value = null
        isLoading.value = true
        try {
            const docRef = doc(db, 'users', userId)
            await updateDoc(docRef, { role: newRole })
            isLoading.value = false
            return true
        } catch (err) {
            console.error('Erreur lors de la mise à jour du rôle:', err)
            error.value = 'Impossible de modifier le rôle.'
            isLoading.value = false
            throw err
        }
    }

    // ==========================================
    // REPORTS
    // ==========================================

    /**
     * Crée un signalement
     */
    const createReport = async (reportData) => {
        error.value = null
        isLoading.value = true
        try {
            const docRef = await addDoc(collection(db, 'reports'), {
                ...reportData,
                status: 'pending',
                createdAt: serverTimestamp()
            })
            isLoading.value = false
            return docRef.id
        } catch (err) {
            console.error('Erreur lors du signalement:', err)
            error.value = 'Impossible de créer le signalement.'
            isLoading.value = false
            throw err
        }
    }

    /**
     * Récupère tous les signalements (modérateurs/admins)
     */
    const getReports = async () => {
        error.value = null
        isLoading.value = true
        try {
            const q = query(
                collection(db, 'reports'),
                orderBy('createdAt', 'desc')
            )
            const snapshot = await getDocs(q)

            const reports = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }))

            isLoading.value = false
            return reports
        } catch (err) {
            console.error('Erreur lors de la récupération des signalements:', err)
            error.value = 'Impossible de charger les signalements.'
            isLoading.value = false
            throw err
        }
    }

    /**
     * Supprime un signalement
     */
    const deleteReport = async (reportId) => {
        error.value = null
        isLoading.value = true
        try {
            await deleteDoc(doc(db, 'reports', reportId))
            isLoading.value = false
            return true
        } catch (err) {
            console.error('Erreur lors de la suppression du signalement:', err)
            error.value = 'Impossible de supprimer le signalement.'
            isLoading.value = false
            throw err
        }
    }

    /**
     * Met à jour le statut d'un signalement
     */
    const updateReportStatus = async (reportId, status) => {
        error.value = null
        isLoading.value = true
        try {
            const docRef = doc(db, 'reports', reportId)
            await updateDoc(docRef, { status })
            isLoading.value = false
            return true
        } catch (err) {
            console.error('Erreur lors de la mise à jour du signalement:', err)
            error.value = 'Impossible de mettre à jour le signalement.'
            isLoading.value = false
            throw err
        }
    }

    /**
     * Récupère les discussions d'un utilisateur
     */
    const getUserDiscussions = async (userId) => {
        error.value = null
        isLoading.value = true
        try {
            const q = query(
                collection(db, 'discussions'),
                where('authorId', '==', userId)
            )
            const snapshot = await getDocs(q)

            const discussions = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }))

            // Tri par date décroissante (côté client)
            discussions.sort((a, b) => {
                const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0)
                const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0)
                return dateB - dateA
            })

            isLoading.value = false
            return discussions
        } catch (err) {
            console.error('Erreur lors de la récupération des discussions:', err)
            error.value = 'Impossible de charger les discussions.'
            isLoading.value = false
            throw err
        }
    }

    return {
        // État
        error,
        isLoading,
        // Discussions
        addDiscussion,
        getDiscussions,
        getDiscussion,
        updateDiscussion,
        deleteDiscussion,
        getUserDiscussions,
        // Responses
        addResponse,
        getResponses,
        updateResponse,
        deleteResponse,
        // Users
        getUserProfile,
        updateUserProfile,
        getAllUsers,
        updateUserRole,
        // Reports
        createReport,
        getReports,
        deleteReport,
        updateReportStatus
    }
}

export default useFirestore
