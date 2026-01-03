<!--
  UserProfile.vue - Composant de profil utilisateur
  
  Affiche et permet de modifier le profil de l'utilisateur connecté.
  Inclut: nom, email, photo de profil, et statistiques.
-->

<template>
  <div class="user-profile-container">
    <!-- Mode affichage -->
    <div v-if="!isEditing" class="profile-display">
      <div class="profile-header">
        <div class="profile-avatar">
          <img 
            v-if="profile?.photoURL" 
            :src="profile.photoURL" 
            :alt="profile.name"
            class="avatar-large"
          >
          <div v-else class="avatar-placeholder">
            <i class="bi bi-person-fill"></i>
          </div>
        </div>
        
        <div class="profile-info">
          <h2 class="profile-name">{{ profile?.name || 'Utilisateur' }}</h2>
          <p class="profile-email">
            <i class="bi bi-envelope me-2"></i>
            {{ profile?.email }}
          </p>
          <div class="profile-meta">
            <span class="badge-role" :class="roleClass">
              {{ roleLabel }}
            </span>
            <span class="profile-date">
              <i class="bi bi-calendar3 me-1"></i>
              Membre depuis {{ memberSince }}
            </span>
          </div>
        </div>
      </div>
      
      <div class="profile-actions" v-if="isOwnProfile">
        <button class="btn btn-primary-custom" @click="startEditing">
          <i class="bi bi-pencil me-2"></i>
          Modifier le profil
        </button>
      </div>
    </div>
    
    <!-- Mode édition -->
    <div v-else class="profile-edit">
      <form @submit.prevent="saveProfile">
        <div class="edit-avatar-section mb-4">
          <div class="profile-avatar">
            <img 
              v-if="editData.photoURL" 
              :src="editData.photoURL" 
              alt="Photo de profil"
              class="avatar-large"
            >
            <div v-else class="avatar-placeholder">
              <i class="bi bi-person-fill"></i>
            </div>
          </div>
        </div>
        
        <div class="mb-3">
          <label for="editName" class="form-label form-label-custom">
            Nom d'affichage
          </label>
          <input
            type="text"
            id="editName"
            v-model="editData.name"
            class="form-control form-control-custom"
            required
            minlength="2"
            maxlength="50"
          >
        </div>
        
        <div class="mb-3">
          <label for="editPhotoURL" class="form-label form-label-custom">
            URL de la photo de profil
          </label>
          <input
            type="url"
            id="editPhotoURL"
            v-model="editData.photoURL"
            class="form-control form-control-custom"
            placeholder="https://example.com/photo.jpg"
          >
          <small class="text-muted">
            Laissez vide pour utiliser l'avatar par défaut
          </small>
        </div>
        
        <div class="d-flex gap-2">
          <button type="button" class="btn btn-secondary-custom" @click="cancelEditing">
            <i class="bi bi-x me-1"></i>
            Annuler
          </button>
          <button type="submit" class="btn btn-primary-custom" :disabled="isSaving">
            <span v-if="isSaving" class="spinner-border spinner-border-sm me-2"></span>
            <i v-else class="bi bi-check me-1"></i>
            Enregistrer
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import useAuth from '@/composables/useAuth'
import useFirestore from '@/composables/useFirestore'
import useNotification from '@/composables/useNotification'

// Props
const props = defineProps({
  profile: {
    type: Object,
    required: true
  },
  isOwnProfile: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['profile-updated'])

const { userProfile, fetchUserProfile } = useAuth()
const { updateUserProfile } = useFirestore()
const { success, error } = useNotification()

// État
const isEditing = ref(false)
const isSaving = ref(false)
const editData = ref({
  name: '',
  photoURL: ''
})

// Rôle de l'utilisateur
const roleLabel = computed(() => {
  const role = props.profile?.role
  const labels = {
    admin: 'Administrateur',
    moderator: 'Modérateur',
    user: 'Membre'
  }
  return labels[role] || 'Membre'
})

const roleClass = computed(() => {
  const role = props.profile?.role
  const classes = {
    admin: 'role-admin',
    moderator: 'role-moderator',
    user: 'role-user'
  }
  return classes[role] || 'role-user'
})

// Date d'inscription formatée
const memberSince = computed(() => {
  if (!props.profile?.createdAt) return 'Date inconnue'
  
  const date = props.profile.createdAt.toDate ? 
    props.profile.createdAt.toDate() : 
    new Date(props.profile.createdAt)
  
  return new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: 'long'
  }).format(date)
})

// Démarrer l'édition
const startEditing = () => {
  editData.value = {
    name: props.profile.name || '',
    photoURL: props.profile.photoURL || ''
  }
  isEditing.value = true
}

// Annuler l'édition
const cancelEditing = () => {
  isEditing.value = false
  editData.value = {
    name: '',
    photoURL: ''
  }
}

// Sauvegarder le profil
const saveProfile = async () => {
  if (!editData.value.name.trim()) {
    error('Le nom d\'affichage est requis')
    return
  }
  
  isSaving.value = true
  
  try {
    await updateUserProfile(props.profile.id, {
      name: editData.value.name.trim(),
      photoURL: editData.value.photoURL.trim()
    })
    
    // Recharger le profil
    await fetchUserProfile(props.profile.id)
    
    success('Profil mis à jour avec succès')
    isEditing.value = false
    emit('profile-updated')
  } catch (err) {
    error('Erreur lors de la mise à jour du profil')
    console.error(err)
  } finally {
    isSaving.value = false
  }
}
</script>

<style scoped>
.user-profile-container {
  padding: 1.5rem;
}

.profile-header {
  display: flex;
  align-items: flex-start;
  gap: 1.5rem;
}

.profile-avatar {
  flex-shrink: 0;
}

.avatar-large {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid var(--primary-color);
}

.avatar-placeholder {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  color: white;
}

.profile-info {
  flex: 1;
}

.profile-name {
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: var(--dark-color);
}

.profile-email {
  color: var(--gray-500);
  font-size: 1rem;
  margin-bottom: 1rem;
}

.profile-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.badge-role {
  font-size: 0.75rem;
  padding: 0.35rem 0.75rem;
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
  background: var(--gray-200);
  color: var(--gray-600);
}

.profile-date {
  font-size: 0.875rem;
  color: var(--gray-500);
}

.profile-actions {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--gray-200);
}

.edit-avatar-section {
  text-align: center;
}

@media (max-width: 576px) {
  .profile-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .profile-meta {
    justify-content: center;
  }
  
  .avatar-large,
  .avatar-placeholder {
    width: 100px;
    height: 100px;
  }
  
  .avatar-placeholder {
    font-size: 2.5rem;
  }
}
</style>
