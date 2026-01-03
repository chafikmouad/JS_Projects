<!--
  Navbar.vue - Barre de navigation principale
  
  Affiche la navigation avec les liens adaptés selon l'état d'authentification.
  Inclut le nom de l'utilisateur et le lien admin pour les modérateurs/admins.
-->

<template>
  <nav class="navbar navbar-expand-lg navbar-custom">
    <div class="container">
      <!-- Logo / Brand -->
      <router-link to="/" class="navbar-brand navbar-brand-custom">
        <i class="bi bi-chat-dots-fill me-2"></i>
        Forum
      </router-link>
      
      <!-- Toggle mobile -->
      <button 
        class="navbar-toggler" 
        type="button" 
        data-bs-toggle="collapse" 
        data-bs-target="#navbarNav"
        aria-controls="navbarNav"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>
      
      <!-- Navigation links -->
      <div class="collapse navbar-collapse" id="navbarNav">
        <!-- Liens à gauche -->
        <ul class="navbar-nav me-auto">
          <li class="nav-item">
            <router-link 
              to="/" 
              class="nav-link nav-link-custom"
              :class="{ 'active': $route.name === 'Home' }"
            >
              <i class="bi bi-house me-1"></i>
              Accueil
            </router-link>
          </li>
        </ul>
        
        <!-- Liens à droite -->
        <ul class="navbar-nav">
          <!-- Utilisateur non connecté -->
          <template v-if="!isAuthenticated">
            <li class="nav-item">
              <router-link 
                to="/login" 
                class="nav-link nav-link-custom"
                :class="{ 'active': $route.name === 'Login' }"
              >
                <i class="bi bi-box-arrow-in-right me-1"></i>
                Connexion
              </router-link>
            </li>
            <li class="nav-item">
              <router-link 
                to="/register" 
                class="nav-link nav-link-custom btn-register"
              >
                <i class="bi bi-person-plus me-1"></i>
                Inscription
              </router-link>
            </li>
          </template>
          
          <!-- Utilisateur connecté -->
          <template v-else>
            <!-- Lien Admin (pour modérateurs/admins) -->
            <li class="nav-item" v-if="isModerator">
              <router-link 
                to="/admin" 
                class="nav-link nav-link-custom"
                :class="{ 'active': $route.name === 'Admin' }"
              >
                <i class="bi bi-shield-lock me-1"></i>
                Admin
              </router-link>
            </li>
            
            <!-- Menu utilisateur -->
            <li class="nav-item dropdown">
              <a 
                class="nav-link nav-link-custom dropdown-toggle d-flex align-items-center"
                href="#"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <div class="user-avatar me-2">
                  <img 
                    v-if="userProfile?.photoURL" 
                    :src="userProfile.photoURL" 
                    :alt="displayName"
                    class="avatar-img"
                  >
                  <i v-else class="bi bi-person-circle"></i>
                </div>
                <span class="user-name">{{ displayName }}</span>
                <span class="badge-role ms-2" :class="roleClass">
                  {{ roleLabel }}
                </span>
              </a>
              <ul class="dropdown-menu dropdown-menu-end">
                <li>
                  <router-link to="/profile" class="dropdown-item">
                    <i class="bi bi-person me-2"></i>
                    Mon Profil
                  </router-link>
                </li>
                <li><hr class="dropdown-divider"></li>
                <li>
                  <button class="dropdown-item text-danger" @click="handleLogout">
                    <i class="bi bi-box-arrow-right me-2"></i>
                    Déconnexion
                  </button>
                </li>
              </ul>
            </li>
          </template>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import useAuth from '@/composables/useAuth'
import useNotification from '@/composables/useNotification'

const router = useRouter()
const { user, userProfile, isAuthenticated, isModerator, logout } = useAuth()
const { success, error } = useNotification()

// Nom d'affichage de l'utilisateur
const displayName = computed(() => {
  return userProfile.value?.name || user.value?.displayName || 'Utilisateur'
})

// Rôle de l'utilisateur
const roleLabel = computed(() => {
  const role = userProfile.value?.role
  const labels = {
    admin: 'Admin',
    moderator: 'Modo',
    user: 'Membre'
  }
  return labels[role] || 'Membre'
})

// Classe CSS pour le badge de rôle
const roleClass = computed(() => {
  const role = userProfile.value?.role
  const classes = {
    admin: 'role-admin',
    moderator: 'role-moderator',
    user: 'role-user'
  }
  return classes[role] || 'role-user'
})

// Déconnexion
const handleLogout = async () => {
  try {
    await logout()
    success('Déconnexion réussie')
    router.push({ name: 'Home' })
  } catch (err) {
    error('Erreur lors de la déconnexion')
  }
}
</script>

<style scoped>
.navbar-custom {
  position: sticky;
  top: 0;
  z-index: 1000;
}

.navbar-toggler {
  border: none;
  padding: 0.5rem;
}

.navbar-toggler:focus {
  box-shadow: none;
}

.navbar-toggler-icon {
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 30 30'%3e%3cpath stroke='rgba%28255, 255, 255, 0.7%29' stroke-linecap='round' stroke-miterlimit='10' stroke-width='2' d='M4 7h22M4 15h22M4 23h22'/%3e%3c/svg%3e");
}

.btn-register {
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%) !important;
  color: white !important;
  margin-left: 0.5rem;
}

.user-avatar {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: var(--gray-300);
}

.avatar-img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.user-name {
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.badge-role {
  font-size: 0.65rem;
  padding: 0.2rem 0.5rem;
  border-radius: 20px;
  font-weight: 600;
  text-transform: uppercase;
}

.role-admin {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
}

.role-moderator {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
}

.role-user {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: #f8fafc;
}

.dropdown-menu {
  border: none;
  box-shadow: var(--shadow-lg);
  border-radius: var(--border-radius-md);
  padding: 0.5rem;
  margin-top: 0.5rem;
}

.dropdown-item {
  border-radius: var(--border-radius-sm);
  padding: 0.625rem 1rem;
  font-weight: 500;
  transition: all var(--transition-fast);
}

.dropdown-item:hover {
  background: var(--gray-100);
}

.dropdown-item.text-danger:hover {
  background: #fef2f2;
}

@media (max-width: 991px) {
  .navbar-nav {
    padding: 1rem 0;
  }
  
  .nav-link-custom {
    padding: 0.75rem 1rem !important;
  }
  
  .btn-register {
    margin-left: 0;
    margin-top: 0.5rem;
  }
  
  .dropdown-menu {
    position: static;
    box-shadow: none;
    background: transparent;
    padding: 0;
    margin-top: 0;
  }
  
  .dropdown-item {
    color: var(--gray-300);
  }
  
  .dropdown-item:hover {
    background: rgba(255, 255, 255, 0.1);
    color: white;
  }
}
</style>
