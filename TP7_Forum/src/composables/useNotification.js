/**
 * Composable useNotification
 * 
 * Gestion centralisée des notifications toast.
 * Fournit un système de notifications global avec auto-dismiss.
 */

import { ref } from 'vue'

// État global des notifications
const notifications = ref([])
let notificationId = 0

/**
 * Composable principal de notifications
 */
const useNotification = () => {

    /**
     * Ajoute une notification
     * @param {string} type - Type de notification: 'success', 'error', 'warning', 'info'
     * @param {string} message - Message à afficher
     * @param {number} duration - Durée d'affichage en ms (défaut: 5000)
     */
    const addNotification = (type, message, duration = 5000) => {
        const id = ++notificationId

        const notification = {
            id,
            type,
            message,
            createdAt: Date.now()
        }

        notifications.value.push(notification)

        // Auto-dismiss après la durée spécifiée
        if (duration > 0) {
            setTimeout(() => {
                removeNotification(id)
            }, duration)
        }

        return id
    }

    /**
     * Supprime une notification par son ID
     */
    const removeNotification = (id) => {
        const index = notifications.value.findIndex(n => n.id === id)
        if (index !== -1) {
            notifications.value.splice(index, 1)
        }
    }

    /**
     * Supprime toutes les notifications
     */
    const clearAllNotifications = () => {
        notifications.value = []
    }

    /**
     * Raccourcis pour les types de notifications courants
     */
    const success = (message, duration) => addNotification('success', message, duration)
    const error = (message, duration) => addNotification('error', message, duration)
    const warning = (message, duration) => addNotification('warning', message, duration)
    const info = (message, duration) => addNotification('info', message, duration)

    return {
        notifications,
        addNotification,
        removeNotification,
        clearAllNotifications,
        success,
        error,
        warning,
        info
    }
}

export default useNotification
