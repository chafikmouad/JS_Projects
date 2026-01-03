<!--
  NewResponseForm.vue - Formulaire d'ajout de réponse
  
  Permet aux utilisateurs connectés d'ajouter une réponse
  à une discussion.
-->

<template>
  <div class="new-response-form">
    <!-- Utilisateur connecté -->
    <div v-if="isAuthenticated" class="response-form-container">
      <div class="form-header">
        <div class="avatar">
          <i class="bi bi-person-circle"></i>
        </div>
        <span class="responding-as">
          Répondre en tant que <strong>{{ userName }}</strong>
        </span>
      </div>
      
      <form @submit.prevent="handleSubmit">
        <textarea
          v-model="content"
          class="form-control form-control-custom"
          rows="4"
          placeholder="Écrivez votre réponse..."
          required
          :disabled="isSubmitting"
        ></textarea>
        
        <div class="form-actions">
          <span class="character-count" :class="{ 'text-danger': content.length > 2000 }">
            {{ content.length }}/2000
          </span>
          <button 
            type="submit" 
            class="btn btn-primary-custom"
            :disabled="isSubmitting || !content.trim() || content.length > 2000"
          >
            <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2"></span>
            <i v-else class="bi bi-send me-2"></i>
            Répondre
          </button>
        </div>
      </form>
    </div>
    
    <!-- Utilisateur non connecté -->
    <div v-else class="login-prompt">
      <i class="bi bi-chat-left-dots prompt-icon"></i>
      <p class="mb-2">Connectez-vous pour participer à la discussion</p>
      <router-link 
        :to="{ name: 'Login', query: { redirect: $route.fullPath } }" 
        class="btn btn-primary-custom"
      >
        <i class="bi bi-box-arrow-in-right me-2"></i>
        Se connecter
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import useAuth from '@/composables/useAuth'
import useFirestore from '@/composables/useFirestore'
import useNotification from '@/composables/useNotification'

// Props
const props = defineProps({
  discussionId: {
    type: String,
    required: true
  }
})

// Emits
const emit = defineEmits(['response-added'])

const { user, userProfile, isAuthenticated } = useAuth()
const { addResponse } = useFirestore()
const { success, error } = useNotification()

// État
const content = ref('')
const isSubmitting = ref(false)

// Nom de l'utilisateur
const userName = computed(() => {
  return userProfile.value?.name || user.value?.displayName || 'Utilisateur'
})

// Soumettre la réponse
const handleSubmit = async () => {
  if (!content.value.trim() || content.value.length > 2000) return
  
  isSubmitting.value = true
  
  try {
    const responseData = {
      content: content.value.trim(),
      discussionId: props.discussionId,
      authorId: user.value.uid,
      authorName: userName.value
    }
    
    const responseId = await addResponse(responseData)
    
    // Émettre l'événement avec les données de la réponse
    emit('response-added', {
      id: responseId,
      ...responseData,
      createdAt: new Date()
    })
    
    content.value = ''
    success('Réponse ajoutée avec succès')
  } catch (err) {
    console.error('Erreur lors de l\'ajout de la réponse:', err)
    error('Impossible d\'ajouter la réponse')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.new-response-form {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--gray-200);
}

.response-form-container {
  background: var(--bg-secondary);
  border-radius: var(--border-radius-lg);
  padding: 1.25rem;
  box-shadow: var(--shadow-sm);
}

.form-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.avatar {
  font-size: 2rem;
  color: var(--gray-400);
}

.responding-as {
  font-size: 0.875rem;
  color: var(--gray-600);
}

textarea.form-control-custom {
  resize: vertical;
  min-height: 100px;
}

.form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.75rem;
}

.character-count {
  font-size: 0.75rem;
  color: var(--gray-500);
}

.login-prompt {
  text-align: center;
  padding: 2rem;
  background: var(--gray-100);
  border-radius: var(--border-radius-lg);
}

.prompt-icon {
  font-size: 2.5rem;
  color: var(--gray-400);
  margin-bottom: 0.5rem;
}

.login-prompt p {
  color: var(--gray-600);
}
</style>
