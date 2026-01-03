<!--
  Discussion.vue - Page de détail d'une discussion
  
  Affiche une discussion complète avec ses réponses.
-->

<template>
  <div class="discussion-page">
    <div class="container py-4">
      <!-- Bouton retour -->
      <router-link to="/" class="back-link mb-4 d-inline-flex align-items-center">
        <i class="bi bi-arrow-left me-2"></i>
        Retour aux discussions
      </router-link>
      
      <!-- Chargement -->
      <div v-if="isLoading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Chargement...</span>
        </div>
        <p class="text-muted mt-3">Chargement de la discussion...</p>
      </div>
      
      <!-- Discussion -->
      <DiscussionDetail 
        v-else-if="discussion"
        :discussion="discussion"
        @discussion-updated="loadDiscussion"
        @discussion-deleted="handleDeleted"
      />
      
      <!-- Erreur -->
      <div v-else class="text-center py-5">
        <i class="bi bi-exclamation-circle fs-1 text-danger mb-3 d-block"></i>
        <h3>Discussion introuvable</h3>
        <p class="text-muted">Cette discussion n'existe pas ou a été supprimée.</p>
        <router-link to="/" class="btn btn-primary-custom">
          <i class="bi bi-house me-2"></i>
          Retour à l'accueil
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import DiscussionDetail from '@/components/DiscussionDetail.vue'
import useFirestore from '@/composables/useFirestore'

// Props
const props = defineProps({
  id: {
    type: String,
    required: true
  }
})

const route = useRoute()
const router = useRouter()
const { getDiscussion } = useFirestore()

// État
const discussion = ref(null)
const isLoading = ref(true)

// Charger la discussion
const loadDiscussion = async () => {
  isLoading.value = true
  try {
    discussion.value = await getDiscussion(props.id)
    
    // Mettre à jour le titre de la page
    if (discussion.value) {
      document.title = `${discussion.value.title} - Forum Communautaire`
    }
  } catch (error) {
    console.error('Erreur lors du chargement:', error)
    discussion.value = null
  } finally {
    isLoading.value = false
  }
}

// Gérer la suppression
const handleDeleted = () => {
  router.push({ name: 'Home' })
}

// Chargement initial
onMounted(() => {
  loadDiscussion()
})

// Recharger si l'ID change
watch(() => props.id, () => {
  loadDiscussion()
})
</script>

<style scoped>
.discussion-page {
  min-height: calc(100vh - 200px);
}

.back-link {
  color: var(--gray-600);
  font-weight: 500;
  text-decoration: none;
  transition: color var(--transition-fast);
}

.back-link:hover {
  color: var(--primary-color);
}
</style>
