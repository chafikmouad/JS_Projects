<!--
  NewDiscussionForm.vue - Formulaire de création de discussion
  
  Permet aux utilisateurs connectés de créer une nouvelle discussion
  avec titre, contenu et catégorie.
-->

<template>
  <div class="new-discussion-form">
    <!-- Bouton pour ouvrir le modal -->
    <button 
      class="btn btn-primary-custom d-flex align-items-center"
      @click="openModal"
    >
      <i class="bi bi-plus-lg me-2"></i>
      Nouvelle discussion
    </button>
    
    <!-- Modal de création -->
    <BModal
      v-model="showModal"
      title="Créer une nouvelle discussion"
      size="lg"
      hide-footer
      centered
      @hidden="resetForm"
    >
      <form @submit.prevent="handleSubmit">
        <!-- Titre -->
        <div class="mb-3">
          <label for="title" class="form-label form-label-custom">
            Titre de la discussion *
          </label>
          <input
            type="text"
            id="title"
            v-model="formData.title"
            class="form-control form-control-custom"
            placeholder="Ex: Comment optimiser les performances de Vue.js ?"
            required
            minlength="5"
            maxlength="150"
          >
          <small class="text-muted">
            {{ formData.title.length }}/150 caractères
          </small>
        </div>
        
        <!-- Catégorie -->
        <div class="mb-3">
          <label for="category" class="form-label form-label-custom">
            Catégorie *
          </label>
          <select
            id="category"
            v-model="formData.category"
            class="form-select form-control-custom"
            required
          >
            <option value="" disabled>Choisir une catégorie</option>
            <option v-for="cat in categories" :key="cat" :value="cat">
              {{ cat }}
            </option>
          </select>
        </div>
        
        <!-- Contenu -->
        <div class="mb-3">
          <label for="content" class="form-label form-label-custom">
            Contenu *
          </label>
          <textarea
            id="content"
            v-model="formData.content"
            class="form-control form-control-custom"
            rows="8"
            placeholder="Décrivez votre sujet de discussion en détail..."
            required
            minlength="20"
          ></textarea>
          <small class="text-muted">
            Minimum 20 caractères. {{ formData.content.length }} caractères actuellement.
          </small>
        </div>
        
        <!-- Message d'erreur -->
        <div v-if="errorMessage" class="alert alert-danger">
          <i class="bi bi-exclamation-triangle me-2"></i>
          {{ errorMessage }}
        </div>
        
        <!-- Actions -->
        <div class="d-flex gap-2 justify-content-end mt-4">
          <button 
            type="button" 
            class="btn btn-secondary-custom"
            @click="showModal = false"
          >
            Annuler
          </button>
          <button 
            type="submit" 
            class="btn btn-primary-custom"
            :disabled="isSubmitting"
          >
            <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2"></span>
            <i v-else class="bi bi-send me-2"></i>
            Publier
          </button>
        </div>
      </form>
    </BModal>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { BModal } from 'bootstrap-vue-next'
import useAuth from '@/composables/useAuth'
import useFirestore from '@/composables/useFirestore'
import useNotification from '@/composables/useNotification'

// Emits
const emit = defineEmits(['discussion-created'])

const router = useRouter()
const { user, userProfile } = useAuth()
const { addDiscussion } = useFirestore()
const { success, error } = useNotification()

// État
const showModal = ref(false)
const isSubmitting = ref(false)
const errorMessage = ref('')

// Données du formulaire
const formData = ref({
  title: '',
  category: '',
  content: ''
})

// Catégories disponibles
const categories = ['Général', 'Technique', 'Aide', 'Annonces', 'Discussions']

// Ouvrir le modal
const openModal = () => {
  if (!user.value) {
    router.push({ name: 'Login', query: { redirect: '/' } })
    return
  }
  showModal.value = true
}

// Réinitialiser le formulaire
const resetForm = () => {
  formData.value = {
    title: '',
    category: '',
    content: ''
  }
  errorMessage.value = ''
}

// Soumettre le formulaire
const handleSubmit = async () => {
  errorMessage.value = ''
  
  // Validation
  if (formData.value.title.trim().length < 5) {
    errorMessage.value = 'Le titre doit contenir au moins 5 caractères.'
    return
  }
  
  if (!formData.value.category) {
    errorMessage.value = 'Veuillez choisir une catégorie.'
    return
  }
  
  if (formData.value.content.trim().length < 20) {
    errorMessage.value = 'Le contenu doit contenir au moins 20 caractères.'
    return
  }
  
  isSubmitting.value = true
  
  try {
    const discussionId = await addDiscussion({
      title: formData.value.title.trim(),
      category: formData.value.category,
      content: formData.value.content.trim(),
      authorId: user.value.uid,
      authorName: userProfile.value?.name || user.value.displayName || 'Anonyme'
    })
    
    success('Discussion créée avec succès !')
    showModal.value = false
    resetForm()
    
    // Émettre l'événement et naviguer vers la discussion
    emit('discussion-created', discussionId)
    router.push({ name: 'Discussion', params: { id: discussionId } })
  } catch (err) {
    console.error('Erreur lors de la création:', err)
    errorMessage.value = 'Impossible de créer la discussion. Veuillez réessayer.'
    error('Erreur lors de la création de la discussion')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.new-discussion-form {
  display: inline-block;
}

textarea.form-control-custom {
  resize: vertical;
  min-height: 150px;
}
</style>
