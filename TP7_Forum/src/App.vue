<!--
  App.vue - Composant racine de l'application
  
  Contient la barre de navigation, le système de notifications
  et le router-view pour l'affichage des vues.
-->

<template>
  <div id="app-container">
    <!-- Barre de navigation -->
    <Navbar />
    
    <!-- Notifications globales -->
    <Notification />
    
    <!-- Contenu principal -->
    <main class="main-container">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
    
    <!-- Footer -->
    <footer class="footer">
      <div class="container text-center">
        <p class="mb-0">
          © {{ currentYear }} Forum Communautaire. 
          <span class="text-muted">Développé avec Vue.js 3 & Firebase</span>
        </p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import Navbar from '@/components/Navbar.vue'
import Notification from '@/components/Notification.vue'
import useAuth from '@/composables/useAuth'

// Initialiser le listener d'authentification
const { initAuthListener } = useAuth()

onMounted(() => {
  initAuthListener()
})

// Année courante pour le footer
const currentYear = computed(() => new Date().getFullYear())
</script>

<style scoped>
#app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-container {
  flex: 1;
}

.footer {
  background: linear-gradient(135deg, var(--dark-color) 0%, var(--dark-lighter) 100%);
  color: var(--gray-300);
  padding: 1.5rem 0;
  margin-top: auto;
}

.footer p {
  font-size: 0.875rem;
}

/* Transitions entre les vues */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
