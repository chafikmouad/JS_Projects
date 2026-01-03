<!--
  Profile.vue - Page de profil utilisateur
  
  Affiche le profil de l'utilisateur connecté avec ses discussions.
-->

<template>
  <div class="profile-page">
    <div class="container py-4">
      <!-- Chargement -->
      <div v-if="isLoading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Chargement...</span>
        </div>
      </div>
      
      <!-- Contenu -->
      <template v-else-if="userProfile">
        <div class="row">
          <!-- Profil -->
          <div class="col-lg-4 mb-4">
            <div class="custom-card">
              <UserProfile 
                :profile="userProfile" 
                :isOwnProfile="true"
                @profile-updated="loadProfile"
              />
            </div>
          </div>
          
          <!-- Discussions de l'utilisateur -->
          <div class="col-lg-8">
            <div class="custom-card">
              <div class="custom-card-body">
                <h3 class="section-title mb-4">
                  <i class="bi bi-chat-square-text me-2"></i>
                  Mes discussions
                </h3>
                
                <!-- Chargement des discussions -->
                <div v-if="isLoadingDiscussions" class="text-center py-4">
                  <div class="spinner-border spinner-border-sm text-primary" role="status"></div>
                </div>
                
                <!-- Liste des discussions -->
                <div v-else-if="userDiscussions.length > 0">
                  <div 
                    v-for="discussion in userDiscussions" 
                    :key="discussion.id"
                    class="user-discussion-item"
                    @click="goToDiscussion(discussion.id)"
                  >
                    <div class="d-flex justify-content-between align-items-start">
                      <div>
                        <span class="category-badge" :class="getCategoryClass(discussion.category)">
                          {{ discussion.category }}
                        </span>
                        <h5 class="discussion-title mt-2 mb-1">{{ discussion.title }}</h5>
                        <p class="discussion-date text-muted mb-0">
                          <i class="bi bi-clock me-1"></i>
                          {{ formatDate(discussion.createdAt) }}
                        </p>
                      </div>
                      <span class="response-badge">
                        <i class="bi bi-chat-dots me-1"></i>
                        {{ discussion.responseCount || 0 }}
                      </span>
                    </div>
                  </div>
                </div>
                
                <!-- État vide -->
                <div v-else class="text-center py-4">
                  <i class="bi bi-chat-left-text empty-icon"></i>
                  <p class="text-muted mt-2 mb-2">Vous n'avez pas encore créé de discussion</p>
                  <router-link to="/" class="btn btn-primary-custom btn-sm">
                    <i class="bi bi-plus me-1"></i>
                    Créer une discussion
                  </router-link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
      
      <!-- Erreur -->
      <div v-else class="text-center py-5">
        <i class="bi bi-exclamation-circle fs-1 text-danger mb-3 d-block"></i>
        <p class="text-muted">Impossible de charger le profil</p>
        <router-link to="/" class="btn btn-primary-custom">
          Retour à l'accueil
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import UserProfile from '@/components/UserProfile.vue'
import useAuth from '@/composables/useAuth'
import useFirestore from '@/composables/useFirestore'

const router = useRouter()
const { userProfile, fetchUserProfile, user } = useAuth()
const { getUserDiscussions } = useFirestore()

// État
const isLoading = ref(true)
const isLoadingDiscussions = ref(true)
const userDiscussions = ref([])

// Charger le profil
const loadProfile = async () => {
  isLoading.value = true
  try {
    if (user.value) {
      await fetchUserProfile(user.value.uid)
    }
  } catch (error) {
    console.error('Erreur chargement profil:', error)
  } finally {
    isLoading.value = false
  }
}

// Charger les discussions de l'utilisateur
const loadUserDiscussions = async () => {
  if (!user.value) return
  
  isLoadingDiscussions.value = true
  try {
    userDiscussions.value = await getUserDiscussions(user.value.uid)
  } catch (error) {
    console.error('Erreur chargement discussions:', error)
  } finally {
    isLoadingDiscussions.value = false
  }
}

// Navigation vers une discussion
const goToDiscussion = (id) => {
  router.push({ name: 'Discussion', params: { id } })
}

// Formater la date
const formatDate = (timestamp) => {
  if (!timestamp) return ''
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date)
}

// Classe CSS pour la catégorie
const getCategoryClass = (category) => {
  const classes = {
    'Général': 'cat-general',
    'Technique': 'cat-tech',
    'Aide': 'cat-help',
    'Annonces': 'cat-announce',
    'Discussions': 'cat-discuss'
  }
  return classes[category] || 'cat-general'
}

onMounted(async () => {
  await loadProfile()
  await loadUserDiscussions()
})
</script>

<style scoped>
.profile-page {
  min-height: calc(100vh - 200px);
}

.section-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--dark-color);
}

.user-discussion-item {
  padding: 1rem;
  border-radius: var(--border-radius-md);
  background: var(--gray-50);
  margin-bottom: 0.75rem;
  cursor: pointer;
  transition: all var(--transition-fast);
  border: 1px solid var(--gray-200);
}

.user-discussion-item:hover {
  background: var(--gray-100);
  border-color: var(--primary-color);
  transform: translateX(4px);
}

.category-badge {
  display: inline-block;
  font-size: 0.65rem;
  padding: 0.2rem 0.5rem;
  border-radius: 12px;
  font-weight: 600;
  text-transform: uppercase;
  color: white;
}

.cat-general { background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); }
.cat-tech { background: linear-gradient(135deg, #10b981 0%, #059669 100%); }
.cat-help { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); }
.cat-announce { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); }
.cat-discuss { background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%); }

.discussion-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--dark-color);
}

.discussion-date {
  font-size: 0.75rem;
}

.response-badge {
  background: var(--primary-color);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.empty-icon {
  font-size: 3rem;
  color: var(--gray-300);
}
</style>
