<!--
  Notification.vue - Système de notifications toast
  
  Affiche les notifications toast en haut à droite de l'écran.
  Supporte les types: success, error, warning, info
-->

<template>
  <div class="notification-container" v-if="notifications.length > 0">
    <TransitionGroup name="notification">
      <div 
        v-for="notification in notifications" 
        :key="notification.id"
        class="notification-toast"
        :class="notification.type"
      >
        <!-- Icône selon le type -->
        <span class="notification-icon">
          <i v-if="notification.type === 'success'" class="bi bi-check-circle-fill"></i>
          <i v-else-if="notification.type === 'error'" class="bi bi-x-circle-fill"></i>
          <i v-else-if="notification.type === 'warning'" class="bi bi-exclamation-triangle-fill"></i>
          <i v-else class="bi bi-info-circle-fill"></i>
        </span>
        
        <!-- Message -->
        <span class="notification-message">{{ notification.message }}</span>
        
        <!-- Bouton fermer -->
        <button 
          class="notification-close" 
          @click="removeNotification(notification.id)"
          aria-label="Fermer"
        >
          <i class="bi bi-x"></i>
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup>
import useNotification from '@/composables/useNotification'

const { notifications, removeNotification } = useNotification()
</script>

<style scoped>
.notification-container {
  position: fixed;
  top: 80px;
  right: 20px;
  z-index: 1060;
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 400px;
  pointer-events: none;
}

.notification-toast {
  pointer-events: auto;
  padding: 1rem 1.25rem;
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-lg);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 300px;
}

.notification-toast.success {
  background: linear-gradient(135deg, var(--success-color) 0%, #059669 100%);
  color: white;
}

.notification-toast.error {
  background: linear-gradient(135deg, var(--danger-color) 0%, #dc2626 100%);
  color: white;
}

.notification-toast.warning {
  background: linear-gradient(135deg, var(--warning-color) 0%, #d97706 100%);
  color: white;
}

.notification-toast.info {
  background: linear-gradient(135deg, var(--info-color) 0%, #2563eb 100%);
  color: white;
}

.notification-icon {
  font-size: 1.25rem;
  flex-shrink: 0;
}

.notification-message {
  flex: 1;
  font-weight: 500;
  font-size: 0.9375rem;
}

.notification-close {
  background: none;
  border: none;
  color: inherit;
  opacity: 0.8;
  cursor: pointer;
  padding: 0.25rem;
  margin-left: auto;
  font-size: 1.25rem;
  line-height: 1;
  flex-shrink: 0;
  transition: opacity var(--transition-fast);
}

.notification-close:hover {
  opacity: 1;
}

/* Animations */
.notification-enter-active {
  animation: slideInRight 0.3s ease forwards;
}

.notification-leave-active {
  animation: slideOutRight 0.3s ease forwards;
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(100px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideOutRight {
  from {
    opacity: 1;
    transform: translateX(0);
  }
  to {
    opacity: 0;
    transform: translateX(100px);
  }
}

@media (max-width: 480px) {
  .notification-container {
    left: 20px;
    right: 20px;
    max-width: none;
  }
  
  .notification-toast {
    min-width: auto;
  }
}
</style>
