<!--
  ResponseList.vue - Liste des réponses d'une discussion
  
  Affiche toutes les réponses d'une discussion avec
  le formulaire pour ajouter une nouvelle réponse.
-->

<template>
  <div class="response-list">
    <!-- État de chargement -->
    <div v-if="isLoading" class="loading-state">
      <div v-for="n in 3" :key="n" class="skeleton-response mb-3">
        <div class="d-flex gap-2 mb-2">
          <div class="skeleton skeleton-avatar"></div>
          <div class="flex-grow-1">
            <div class="skeleton skeleton-name mb-1"></div>
            <div class="skeleton skeleton-date"></div>
          </div>
        </div>
        <div class="skeleton skeleton-content"></div>
      </div>
    </div>
    
    <!-- Liste des réponses -->
    <div v-else-if="responses.length > 0" class="responses-container">
      <TransitionGroup name="response">
        <ResponseItem
          v-for="response in responses"
          :key="response.id"
          :response="response"
          :discussionId="discussionId"
          @response-updated="loadResponses"
          @response-deleted="handleResponseDeleted"
        />
      </TransitionGroup>
    </div>
    
    <!-- État vide -->
    <div v-else class="empty-state text-center py-4">
      <i class="bi bi-chat-left empty-icon"></i>
      <p class="text-muted mt-2 mb-0">Aucune réponse pour le moment</p>
      <p class="text-muted small">Soyez le premier à répondre !</p>
    </div>
    
    <!-- Formulaire de nouvelle réponse -->
    <NewResponseForm
      :discussionId="discussionId"
      @response-added="handleResponseAdded"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import ResponseItem from './ResponseItem.vue'
import NewResponseForm from './NewResponseForm.vue'
import useFirestore from '@/composables/useFirestore'

// Props
const props = defineProps({
  discussionId: {
    type: String,
    required: true
  }
})

// Emits
const emit = defineEmits(['response-added', 'response-deleted'])

const { getResponses } = useFirestore()

// État
const responses = ref([])
const isLoading = ref(true)

// Charger les réponses
const loadResponses = async () => {
  isLoading.value = true
  try {
    responses.value = await getResponses(props.discussionId)
  } catch (error) {
    console.error('Erreur lors du chargement des réponses:', error)
  } finally {
    isLoading.value = false
  }
}

// Gérer l'ajout d'une réponse
const handleResponseAdded = (newResponse) => {
  responses.value.push(newResponse)
  emit('response-added')
}

// Gérer la suppression d'une réponse
const handleResponseDeleted = () => {
  loadResponses()
  emit('response-deleted')
}

// Chargement initial
onMounted(() => {
  loadResponses()
})

// Recharger si l'ID de discussion change
watch(() => props.discussionId, () => {
  loadResponses()
})
</script>

<style scoped>
.response-list {
  margin-top: 1rem;
}

.loading-state {
  padding: 1rem 0;
}

.skeleton-response {
  background: var(--bg-secondary);
  padding: 1rem;
  border-radius: var(--border-radius-md);
}

.skeleton-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.skeleton-name {
  height: 16px;
  width: 100px;
}

.skeleton-date {
  height: 12px;
  width: 60px;
}

.skeleton-content {
  height: 40px;
  width: 100%;
}

.empty-state {
  padding: 2rem 1rem;
}

.empty-icon {
  font-size: 2.5rem;
  color: var(--gray-300);
}

/* Animations */
.response-enter-active,
.response-leave-active {
  transition: all 0.3s ease;
}

.response-enter-from {
  opacity: 0;
  transform: translateY(-20px);
}

.response-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

.response-move {
  transition: transform 0.3s ease;
}
</style>
