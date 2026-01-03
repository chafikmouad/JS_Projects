<!--
  Home.vue - Page d'accueil
  
  Affiche le hero section, le bouton de création de discussion
  et la liste des discussions.
-->

<template>
  <div class="home-page">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="container">
        <h1 class="hero-title animate-slideInUp">
          Bienvenue sur le Forum
        </h1>
        <p class="hero-subtitle animate-slideInUp" style="animation-delay: 0.1s;">
          Rejoignez notre communauté, partagez vos idées et participez aux discussions
        </p>
        
        <!-- Bouton nouvelle discussion -->
        <div class="mt-4 animate-slideInUp" style="animation-delay: 0.2s;">
          <NewDiscussionForm @discussion-created="handleDiscussionCreated" />
        </div>
      </div>
    </section>
    
    <!-- Contenu principal -->
    <div class="container py-4">
      <div class="row">
        <!-- Colonne principale - Liste des discussions -->
        <div class="col-lg-8">
          <div class="section-header d-flex justify-content-between align-items-center mb-4">
            <h2 class="section-title mb-0">
              <i class="bi bi-chat-left-text me-2"></i>
              Discussions récentes
            </h2>
          </div>
          
          <DiscussionList ref="discussionListRef" :limit="10" />
        </div>
        
        <!-- Sidebar -->
        <div class="col-lg-4">
          <!-- Stats -->
          <div class="sidebar-card custom-card mb-4">
            <div class="custom-card-body">
              <h5 class="sidebar-title">
                <i class="bi bi-graph-up me-2"></i>
                Statistiques
              </h5>
              <div class="stats-list">
                <div class="stat-item">
                  <span class="stat-label">Discussions</span>
                  <span class="stat-value">{{ stats.discussions }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Membres</span>
                  <span class="stat-value">{{ stats.members }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Catégories -->
          <div class="sidebar-card custom-card mb-4">
            <div class="custom-card-body">
              <h5 class="sidebar-title">
                <i class="bi bi-tag me-2"></i>
                Catégories
              </h5>
              <div class="categories-list">
                <span 
                  v-for="cat in categories" 
                  :key="cat.name"
                  class="category-pill"
                  :class="cat.class"
                >
                  {{ cat.name }}
                </span>
              </div>
            </div>
          </div>
          
          <!-- Guide rapide -->
          <div class="sidebar-card custom-card">
            <div class="custom-card-body">
              <h5 class="sidebar-title">
                <i class="bi bi-lightbulb me-2"></i>
                Guide rapide
              </h5>
              <ul class="guide-list">
                <li>
                  <i class="bi bi-check-circle text-success me-2"></i>
                  Créez un compte pour participer
                </li>
                <li>
                  <i class="bi bi-check-circle text-success me-2"></i>
                  Posez vos questions à la communauté
                </li>
                <li>
                  <i class="bi bi-check-circle text-success me-2"></i>
                  Aidez les autres avec vos réponses
                </li>
                <li>
                  <i class="bi bi-check-circle text-success me-2"></i>
                  Signalez les contenus inappropriés
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import DiscussionList from '@/components/DiscussionList.vue'
import NewDiscussionForm from '@/components/NewDiscussionForm.vue'
import { collection, getCountFromServer } from 'firebase/firestore'
import { db } from '@/firebase/firebaseConfig'

// Refs
const discussionListRef = ref(null)

// Stats
const stats = ref({
  discussions: 0,
  members: 0
})

// Catégories
const categories = [
  { name: 'Général', class: 'cat-general' },
  { name: 'Technique', class: 'cat-tech' },
  { name: 'Aide', class: 'cat-help' },
  { name: 'Annonces', class: 'cat-announce' },
  { name: 'Discussions', class: 'cat-discuss' }
]

// Charger les stats
const loadStats = async () => {
  try {
    const discussionsSnap = await getCountFromServer(collection(db, 'discussions'))
    stats.value.discussions = discussionsSnap.data().count
    
    const usersSnap = await getCountFromServer(collection(db, 'users'))
    stats.value.members = usersSnap.data().count
  } catch (error) {
    console.error('Erreur lors du chargement des stats:', error)
  }
}

// Gérer la création d'une discussion
const handleDiscussionCreated = () => {
  if (discussionListRef.value) {
    discussionListRef.value.reload()
  }
  stats.value.discussions++
}

onMounted(() => {
  loadStats()
})
</script>

<style scoped>
.home-page {
  animation: fadeIn 0.3s ease;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--dark-color);
}

.sidebar-card {
  margin-bottom: 1rem;
}

.sidebar-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--dark-color);
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid var(--gray-200);
}

.stats-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-label {
  color: var(--gray-600);
  font-size: 0.875rem;
}

.stat-value {
  font-weight: 700;
  color: var(--primary-color);
  font-size: 1.125rem;
}

.categories-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.category-pill {
  padding: 0.35rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  color: white;
}

.cat-general { background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); }
.cat-tech { background: linear-gradient(135deg, #10b981 0%, #059669 100%); }
.cat-help { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); }
.cat-announce { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); }
.cat-discuss { background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%); }

.guide-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.guide-list li {
  padding: 0.5rem 0;
  font-size: 0.875rem;
  color: var(--gray-700);
  display: flex;
  align-items: flex-start;
}

.guide-list li i {
  margin-top: 0.125rem;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@media (max-width: 991px) {
  .sidebar-card:first-of-type {
    margin-top: 2rem;
  }
}
</style>
