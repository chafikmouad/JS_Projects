<!--
  ResponseItem.vue - Élément de réponse individuel
  
  Affiche une réponse avec contenu, auteur, date
  et boutons de modification/suppression/signalement.
-->

<template>
  <div class="response-item" :class="{ 'is-editing': isEditing }">
    <!-- Mode affichage -->
    <template v-if="!isEditing">
      <div class="response-header">
        <div class="author-info">
          <div class="author-avatar">
            <i class="bi bi-person-circle"></i>
          </div>
          <div>
            <span class="author-name">{{ response.authorName }}</span>
            <span class="response-date">{{ formattedDate }}</span>
          </div>
        </div>
        
        <!-- Actions -->
        <div class="dropdown" v-if="canModify || isAuthenticated">
          <button 
            class="btn btn-sm btn-link text-muted"
            type="button"
            data-bs-toggle="dropdown"
          >
            <i class="bi bi-three-dots-vertical"></i>
          </button>
          <ul class="dropdown-menu dropdown-menu-end">
            <li v-if="canModify">
              <button class="dropdown-item" @click="startEditing">
                <i class="bi bi-pencil me-2"></i>
                Modifier
              </button>
            </li>
            <li v-if="canModify">
              <button class="dropdown-item text-danger" @click="confirmDelete">
                <i class="bi bi-trash me-2"></i>
                Supprimer
              </button>
            </li>
            <li v-if="isAuthenticated && !isOwner">
              <button class="dropdown-item text-warning" @click="showReportModal = true">
                <i class="bi bi-flag me-2"></i>
                Signaler
              </button>
            </li>
          </ul>
        </div>
      </div>
      
      <div class="response-content">
        {{ response.content }}
      </div>
      
      <div v-if="response.updatedAt && isUpdated" class="response-edited">
        <i class="bi bi-pencil me-1"></i>
        Modifié
      </div>
    </template>
    
    <!-- Mode édition -->
    <template v-else>
      <form @submit.prevent="saveEdits">
        <textarea
          v-model="editContent"
          class="form-control form-control-custom"
          rows="4"
          required
          minlength="1"
        ></textarea>
        
        <div class="d-flex gap-2 mt-2">
          <button type="button" class="btn btn-sm btn-secondary-custom" @click="cancelEditing">
            Annuler
          </button>
          <button type="submit" class="btn btn-sm btn-primary-custom" :disabled="isSaving">
            <span v-if="isSaving" class="spinner-border spinner-border-sm me-1"></span>
            Enregistrer
          </button>
        </div>
      </form>
    </template>
    
    <!-- Modal de signalement -->
    <BModal
      v-model="showReportModal"
      title="Signaler cette réponse"
      hide-footer
      centered
      size="sm"
    >
      <form @submit.prevent="submitReport">
        <div class="mb-3">
          <label class="form-label form-label-custom">Raison</label>
          <select v-model="reportReason" class="form-select form-control-custom" required>
            <option value="" disabled>Choisir</option>
            <option value="spam">Spam</option>
            <option value="offensive">Contenu offensant</option>
            <option value="inappropriate">Inapproprié</option>
            <option value="other">Autre</option>
          </select>
        </div>
        
        <div class="d-flex gap-2 justify-content-end">
          <button type="button" class="btn btn-sm btn-secondary-custom" @click="showReportModal = false">
            Annuler
          </button>
          <button type="submit" class="btn btn-sm btn-warning" :disabled="isReporting">
            Signaler
          </button>
        </div>
      </form>
    </BModal>
    
    <!-- Modal de confirmation de suppression -->
    <BModal
      v-model="showDeleteModal"
      title="Supprimer la réponse"
      hide-footer
      centered
      size="sm"
    >
      <p>Voulez-vous vraiment supprimer cette réponse ?</p>
      
      <div class="d-flex gap-2 justify-content-end">
        <button class="btn btn-sm btn-secondary-custom" @click="showDeleteModal = false">
          Annuler
        </button>
        <button class="btn btn-sm btn-danger-custom" @click="deleteResponse" :disabled="isDeleting">
          <span v-if="isDeleting" class="spinner-border spinner-border-sm me-1"></span>
          Supprimer
        </button>
      </div>
    </BModal>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { BModal } from 'bootstrap-vue-next'
import useAuth from '@/composables/useAuth'
import useFirestore from '@/composables/useFirestore'
import useNotification from '@/composables/useNotification'

// Props
const props = defineProps({
  response: {
    type: Object,
    required: true
  },
  discussionId: {
    type: String,
    required: true
  }
})

// Emits
const emit = defineEmits(['response-updated', 'response-deleted'])

const { user, isAuthenticated, isModerator } = useAuth()
const { updateResponse, deleteResponse: removeResponse, createReport } = useFirestore()
const { success, error } = useNotification()

// État
const isEditing = ref(false)
const isSaving = ref(false)
const isDeleting = ref(false)
const isReporting = ref(false)
const showDeleteModal = ref(false)
const showReportModal = ref(false)
const editContent = ref('')
const reportReason = ref('')

// Permissions
const isOwner = computed(() => user.value?.uid === props.response.authorId)
const canModify = computed(() => isOwner.value || isModerator.value)

// Date formatée
const formattedDate = computed(() => {
  if (!props.response.createdAt) return ''
  
  const date = props.response.createdAt.toDate ? 
    props.response.createdAt.toDate() : 
    new Date(props.response.createdAt)
  
  const now = new Date()
  const diff = now - date
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  
  if (days > 7) {
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(date)
  } else if (days > 0) {
    return `Il y a ${days}j`
  } else if (hours > 0) {
    return `Il y a ${hours}h`
  } else if (minutes > 0) {
    return `Il y a ${minutes}min`
  } else {
    return 'À l\'instant'
  }
})

// Vérifier si modifié
const isUpdated = computed(() => {
  if (!props.response.updatedAt || !props.response.createdAt) return false
  const created = props.response.createdAt.toDate ? props.response.createdAt.toDate() : new Date(props.response.createdAt)
  const updated = props.response.updatedAt.toDate ? props.response.updatedAt.toDate() : new Date(props.response.updatedAt)
  return updated.getTime() - created.getTime() > 60000
})

// Édition
const startEditing = () => {
  editContent.value = props.response.content
  isEditing.value = true
}

const cancelEditing = () => {
  isEditing.value = false
  editContent.value = ''
}

const saveEdits = async () => {
  if (!editContent.value.trim()) return
  
  isSaving.value = true
  try {
    await updateResponse(props.response.id, {
      content: editContent.value.trim()
    })
    success('Réponse modifiée')
    isEditing.value = false
    emit('response-updated')
  } catch (err) {
    error('Erreur lors de la modification')
  } finally {
    isSaving.value = false
  }
}

// Suppression
const confirmDelete = () => {
  showDeleteModal.value = true
}

const deleteResponse = async () => {
  isDeleting.value = true
  try {
    await removeResponse(props.response.id, props.discussionId)
    success('Réponse supprimée')
    showDeleteModal.value = false
    emit('response-deleted')
  } catch (err) {
    error('Erreur lors de la suppression')
  } finally {
    isDeleting.value = false
  }
}

// Signalement
const submitReport = async () => {
  if (!reportReason.value) return
  
  isReporting.value = true
  try {
    await createReport({
      targetType: 'response',
      targetId: props.response.id,
      reportedBy: user.value.uid,
      reason: reportReason.value
    })
    success('Signalement envoyé')
    showReportModal.value = false
    reportReason.value = ''
  } catch (err) {
    error('Erreur lors du signalement')
  } finally {
    isReporting.value = false
  }
}
</script>

<style scoped>
.response-item {
  background: var(--bg-secondary);
  border-radius: var(--border-radius-md);
  padding: 1rem 1.25rem;
  margin-bottom: 0.75rem;
  border-left: 3px solid transparent;
  transition: all var(--transition-fast);
}

.response-item:hover {
  border-left-color: var(--primary-color);
}

.response-item.is-editing {
  border-left-color: var(--warning-color);
  background: #fffbeb;
}

.response-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.author-avatar {
  font-size: 1.75rem;
  color: var(--gray-400);
}

.author-name {
  font-weight: 600;
  color: var(--dark-color);
  display: block;
  font-size: 0.9375rem;
}

.response-date {
  font-size: 0.75rem;
  color: var(--gray-500);
}

.response-content {
  font-size: 0.9375rem;
  line-height: 1.6;
  color: var(--gray-700);
  white-space: pre-wrap;
}

.response-edited {
  margin-top: 0.5rem;
  font-size: 0.75rem;
  color: var(--gray-500);
  font-style: italic;
}

.btn-link {
  text-decoration: none;
}

.dropdown-menu {
  border: none;
  box-shadow: var(--shadow-lg);
  border-radius: var(--border-radius-md);
}

.dropdown-item {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

textarea.form-control-custom {
  resize: vertical;
}
</style>
