<!--
  DiscussionList.vue - Liste des discussions avec recherche et filtres
  
  Affiche la liste des discussions avec:
  - Barre de recherche
  - Filtres par catégorie, date, popularité
  - Pagination
-->

<template>
  <div class="discussion-list">
    <!-- Barre de recherche et filtres -->
    <div class="filters-section mb-4">
      <div class="row g-3">
        <!-- Recherche -->
        <div class="col-md-6">
          <div class="search-wrapper">
            <i class="bi bi-search search-icon"></i>
            <input
              type="text"
              v-model="searchQuery"
              class="form-control form-control-custom search-input"
              placeholder="Rechercher une discussion..."
              @input="handleSearch"
            >
            <button 
              v-if="searchQuery" 
              class="clear-search"
              @click="clearSearch"
            >
              <i class="bi bi-x"></i>
            </button>
          </div>
        </div>
        
        <!-- Filtres -->
        <div class="col-md-6">
          <div class="row g-2">
            <!-- Catégorie -->
            <div class="col-6">
              <select 
                v-model="selectedCategory" 
                class="form-select form-control-custom"
                @change="applyFilters"
              >
                <option value="all">Toutes les catégories</option>
                <option v-for="cat in categories" :key="cat" :value="cat">
                  {{ cat }}
                </option>
              </select>
            </div>
            
            <!-- Tri -->
            <div class="col-6">
              <select 
                v-model="sortBy" 
                class="form-select form-control-custom"
                @change="applyFilters"
              >
                <option value="createdAt">Plus récent</option>
                <option value="popularity">Plus populaire</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- État de chargement -->
    <div v-if="isLoading" class="loading-state">
      <div v-for="n in 3" :key="n" class="skeleton-card mb-3">
        <div class="skeleton skeleton-badge mb-2"></div>
        <div class="skeleton skeleton-title mb-2"></div>
        <div class="skeleton skeleton-text mb-2"></div>
        <div class="skeleton skeleton-meta"></div>
      </div>
    </div>
    
    <!-- Liste des discussions -->
    <div v-else-if="discussions.length > 0" class="discussions-container">
      <TransitionGroup name="list">
        <DiscussionItem
          v-for="discussion in discussions"
          :key="discussion.id"
          :discussion="discussion"
        />
      </TransitionGroup>
      
      <!-- Bouton charger plus -->
      <div v-if="hasMore" class="text-center mt-4">
        <button 
          class="btn btn-secondary-custom"
          @click="loadMore"
          :disabled="isLoadingMore"
        >
          <span v-if="isLoadingMore" class="spinner-border spinner-border-sm me-2"></span>
          <i v-else class="bi bi-arrow-down me-2"></i>
          Charger plus de discussions
        </button>
      </div>
    </div>
    
    <!-- État vide -->
    <div v-else class="empty-state text-center py-5">
      <i class="bi bi-chat-left-text empty-icon"></i>
      <h3 class="mt-3">Aucune discussion trouvée</h3>
      <p class="text-muted" v-if="searchQuery || selectedCategory !== 'all'">
        Essayez de modifier vos critères de recherche
      </p>
      <p class="text-muted" v-else>
        Soyez le premier à créer une discussion !
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import DiscussionItem from './DiscussionItem.vue'
import useFirestore from '@/composables/useFirestore'

// Props
const props = defineProps({
  limit: {
    type: Number,
    default: 10
  }
})

// Emits
const emit = defineEmits(['discussions-loaded'])

const { getDiscussions, isLoading: firestoreLoading } = useFirestore()

// État
const discussions = ref([])
const isLoading = ref(true)
const isLoadingMore = ref(false)
const hasMore = ref(true)
const lastDoc = ref(null)

// Filtres
const searchQuery = ref('')
const selectedCategory = ref('all')
const sortBy = ref('createdAt')
let searchTimeout = null

// Catégories disponibles
const categories = ['Général', 'Technique', 'Aide', 'Annonces', 'Discussions']

// Charger les discussions
const loadDiscussions = async (reset = true) => {
  if (reset) {
    isLoading.value = true
    discussions.value = []
    lastDoc.value = null
    hasMore.value = true
  } else {
    isLoadingMore.value = true
  }
  
  try {
    const options = {
      category: selectedCategory.value,
      sortBy: sortBy.value,
      limitCount: props.limit,
      lastDoc: lastDoc.value,
      searchTerm: searchQuery.value || null
    }
    
    const results = await getDiscussions(options)
    
    if (reset) {
      discussions.value = results
    } else {
      discussions.value = [...discussions.value, ...results]
    }
    
    // Mettre à jour la pagination
    if (results.length < props.limit) {
      hasMore.value = false
    } else {
      lastDoc.value = results[results.length - 1]?._doc || null
    }
    
    emit('discussions-loaded', discussions.value.length)
  } catch (error) {
    console.error('Erreur lors du chargement des discussions:', error)
  } finally {
    isLoading.value = false
    isLoadingMore.value = false
  }
}

// Charger plus
const loadMore = () => {
  if (!isLoadingMore.value && hasMore.value) {
    loadDiscussions(false)
  }
}

// Recherche avec debounce
const handleSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    loadDiscussions(true)
  }, 300)
}

// Effacer la recherche
const clearSearch = () => {
  searchQuery.value = ''
  loadDiscussions(true)
}

// Appliquer les filtres
const applyFilters = () => {
  loadDiscussions(true)
}

// Chargement initial
onMounted(() => {
  loadDiscussions()
})

// Exposer la méthode de rechargement
defineExpose({
  reload: () => loadDiscussions(true)
})
</script>

<style scoped>
.filters-section {
  background: var(--bg-secondary);
  padding: 1.25rem;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-sm);
}

.search-wrapper {
  position: relative;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--gray-400);
  font-size: 1rem;
}

.search-input {
  padding-left: 2.75rem;
  padding-right: 2.5rem;
}

.clear-search {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: var(--gray-300);
  border: none;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--gray-600);
  transition: all var(--transition-fast);
}

.clear-search:hover {
  background: var(--gray-400);
  color: white;
}

.loading-state {
  padding: 1rem 0;
}

.skeleton-card {
  background: var(--bg-secondary);
  padding: 1.25rem;
  border-radius: var(--border-radius-lg);
}

.skeleton-badge {
  height: 24px;
  width: 80px;
  border-radius: 12px;
}

.skeleton-title {
  height: 24px;
  width: 70%;
}

.skeleton-text {
  height: 16px;
  width: 100%;
}

.skeleton-meta {
  height: 14px;
  width: 50%;
}

.empty-state {
  padding: 3rem 1rem;
}

.empty-icon {
  font-size: 4rem;
  color: var(--gray-300);
}

/* Animations de liste */
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

.list-move {
  transition: transform 0.3s ease;
}
</style>
