<!--
  DiscussionDetail.vue - Détail complet d'une discussion
  
  Affiche le contenu complet d'une discussion avec:
  - Titre, contenu, auteur, date
  - Boutons modifier/supprimer (auteur, modérateur, admin)
  - Bouton signaler
  - Liste des réponses
-->

<template>
  <div class="discussion-detail" v-if="discussion">
    <!-- En-tête -->
    <div class="discussion-header custom-card mb-4">
      <div class="custom-card-body">
        <!-- Catégorie et actions -->
        <div class="d-flex justify-content-between align-items-start mb-3">
          <span class="category-badge" :class="categoryClass">
            {{ discussion.category }}
          </span>
          
          <!-- Menu actions -->
          <div class="dropdown" v-if="canModify || isAuthenticated">
            <button 
              class="btn btn-sm btn-outline-secondary dropdown-toggle"
              type="button"
              data-bs-toggle="dropdown"
            >
              <i class="bi bi-three-dots"></i>
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
        
        <!-- Mode affichage -->
        <template v-if="!isEditing">
          <h1 class="discussion-title">{{ discussion.title }}</h1>
          
          <div class="discussion-meta mb-4">
            <span class="author">
              <i class="bi bi-person-circle me-1"></i>
              {{ discussion.authorName }}
            </span>
            <span class="separator">•</span>
            <span class="date">
              <i class="bi bi-clock me-1"></i>
              {{ formattedDate }}
            </span>
            <span v-if="discussion.updatedAt && isUpdated" class="separator">•</span>
            <span v-if="discussion.updatedAt && isUpdated" class="updated">
              <i class="bi bi-pencil me-1"></i>
              Modifié
            </span>
          </div>
          
          <div class="discussion-content">
            {{ discussion.content }}
          </div>
        </template>
        
        <!-- Mode édition -->
        <template v-else>
          <form @submit.prevent="saveEdits">
            <div class="mb-3">
              <label class="form-label form-label-custom">Titre</label>
              <input
                type="text"
                v-model="editData.title"
                class="form-control form-control-custom"
                required
                minlength="5"
              >
            </div>
            
            <div class="mb-3">
              <label class="form-label form-label-custom">Catégorie</label>
              <select v-model="editData.category" class="form-select form-control-custom" required>
                <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
              </select>
            </div>
            
            <div class="mb-3">
              <label class="form-label form-label-custom">Contenu</label>
              <textarea
                v-model="editData.content"
                class="form-control form-control-custom"
                rows="8"
                required
                minlength="20"
              ></textarea>
            </div>
            
            <div class="d-flex gap-2">
              <button type="button" class="btn btn-secondary-custom" @click="cancelEditing">
                Annuler
              </button>
              <button type="submit" class="btn btn-primary-custom" :disabled="isSaving">
                <span v-if="isSaving" class="spinner-border spinner-border-sm me-2"></span>
                Enregistrer
              </button>
            </div>
          </form>
        </template>
      </div>
    </div>
    
    <!-- Réponses -->
    <div class="responses-section">
      <h3 class="responses-title mb-3">
        <i class="bi bi-chat-dots me-2"></i>
        Réponses ({{ discussion.responseCount || 0 }})
      </h3>
      
      <ResponseList 
        :discussionId="discussion.id"
        @response-added="handleResponseAdded"
        @response-deleted="handleResponseDeleted"
      />
    </div>
    
    <!-- Modal de signalement -->
    <BModal
      v-model="showReportModal"
      title="Signaler cette discussion"
      hide-footer
      centered
    >
      <form @submit.prevent="submitReport">
        <div class="mb-3">
          <label class="form-label form-label-custom">Raison du signalement</label>
          <select v-model="reportReason" class="form-select form-control-custom" required>
            <option value="" disabled>Choisir une raison</option>
            <option value="spam">Spam</option>
            <option value="offensive">Contenu offensant</option>
            <option value="inappropriate">Contenu inapproprié</option>
            <option value="other">Autre</option>
          </select>
        </div>
        
        <div class="mb-3" v-if="reportReason === 'other'">
          <label class="form-label form-label-custom">Précisez</label>
          <textarea
            v-model="reportDetails"
            class="form-control form-control-custom"
            rows="3"
            required
          ></textarea>
        </div>
        
        <div class="d-flex gap-2 justify-content-end">
          <button type="button" class="btn btn-secondary-custom" @click="showReportModal = false">
            Annuler
          </button>
          <button type="submit" class="btn btn-warning" :disabled="isReporting">
            <span v-if="isReporting" class="spinner-border spinner-border-sm me-2"></span>
            Signaler
          </button>
        </div>
      </form>
    </BModal>
    
    <!-- Modal de confirmation de suppression -->
    <BModal
      v-model="showDeleteModal"
      title="Confirmer la suppression"
      hide-footer
      centered
    >
      <p>Êtes-vous sûr de vouloir supprimer cette discussion ?</p>
      <p class="text-danger"><strong>Cette action est irréversible.</strong> Toutes les réponses seront également supprimées.</p>
      
      <div class="d-flex gap-2 justify-content-end mt-4">
        <button class="btn btn-secondary-custom" @click="showDeleteModal = false">
          Annuler
        </button>
        <button class="btn btn-danger-custom" @click="deleteDiscussion" :disabled="isDeleting">
          <span v-if="isDeleting" class="spinner-border spinner-border-sm me-2"></span>
          Supprimer
        </button>
      </div>
    </BModal>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { BModal } from 'bootstrap-vue-next'
import ResponseList from './ResponseList.vue'
import useAuth from '@/composables/useAuth'
import useFirestore from '@/composables/useFirestore'
import useNotification from '@/composables/useNotification'

// Props
const props = defineProps({
  discussion: {
    type: Object,
    required: true
  }
})

// Emits
const emit = defineEmits(['discussion-updated', 'discussion-deleted'])

const router = useRouter()
const { user, isAuthenticated, isModerator } = useAuth()
const { updateDiscussion, deleteDiscussion: removeDiscussion, createReport } = useFirestore()
const { success, error } = useNotification()

// État
const isEditing = ref(false)
const isSaving = ref(false)
const isDeleting = ref(false)
const isReporting = ref(false)
const showDeleteModal = ref(false)
const showReportModal = ref(false)
const reportReason = ref('')
const reportDetails = ref('')

const editData = ref({
  title: '',
  category: '',
  content: ''
})

// Catégories
const categories = ['Général', 'Technique', 'Aide', 'Annonces', 'Discussions']

// Permissions
const isOwner = computed(() => user.value?.uid === props.discussion.authorId)
const canModify = computed(() => isOwner.value || isModerator.value)

// Date formatée
const formattedDate = computed(() => {
  if (!props.discussion.createdAt) return ''
  
  const date = props.discussion.createdAt.toDate ? 
    props.discussion.createdAt.toDate() : 
    new Date(props.discussion.createdAt)
  
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
})

// Vérifier si modifié
const isUpdated = computed(() => {
  if (!props.discussion.updatedAt || !props.discussion.createdAt) return false
  const created = props.discussion.createdAt.toDate ? props.discussion.createdAt.toDate() : new Date(props.discussion.createdAt)
  const updated = props.discussion.updatedAt.toDate ? props.discussion.updatedAt.toDate() : new Date(props.discussion.updatedAt)
  return updated.getTime() - created.getTime() > 60000 // Plus d'une minute de différence
})

// Classe CSS pour la catégorie
const categoryClass = computed(() => {
  const categories = {
    'Général': 'category-general',
    'Technique': 'category-tech',
    'Aide': 'category-help',
    'Annonces': 'category-announce',
    'Discussions': 'category-discuss'
  }
  return categories[props.discussion.category] || 'category-general'
})

// Édition
const startEditing = () => {
  editData.value = {
    title: props.discussion.title,
    category: props.discussion.category,
    content: props.discussion.content
  }
  isEditing.value = true
}

const cancelEditing = () => {
  isEditing.value = false
}

const saveEdits = async () => {
  isSaving.value = true
  try {
    await updateDiscussion(props.discussion.id, {
      title: editData.value.title.trim(),
      category: editData.value.category,
      content: editData.value.content.trim()
    })
    success('Discussion modifiée avec succès')
    isEditing.value = false
    emit('discussion-updated')
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

const deleteDiscussion = async () => {
  isDeleting.value = true
  try {
    await removeDiscussion(props.discussion.id)
    success('Discussion supprimée')
    showDeleteModal.value = false
    emit('discussion-deleted')
    router.push({ name: 'Home' })
  } catch (err) {
    error('Erreur lors de la suppression')
  } finally {
    isDeleting.value = false
  }
}

// Signalement
const submitReport = async () => {
  isReporting.value = true
  try {
    await createReport({
      targetType: 'discussion',
      targetId: props.discussion.id,
      reportedBy: user.value.uid,
      reason: reportReason.value === 'other' ? reportDetails.value : reportReason.value
    })
    success('Signalement envoyé')
    showReportModal.value = false
    reportReason.value = ''
    reportDetails.value = ''
  } catch (err) {
    error('Erreur lors du signalement')
  } finally {
    isReporting.value = false
  }
}

// Gestionnaires de réponses
const handleResponseAdded = () => {
  emit('discussion-updated')
}

const handleResponseDeleted = () => {
  emit('discussion-updated')
}
</script>

<style scoped>
.discussion-header {
  animation: fadeIn 0.3s ease;
}

.category-badge {
  display: inline-block;
  font-size: 0.7rem;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-weight: 600;
  text-transform: uppercase;
}

.category-general { background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); color: white; }
.category-tech { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; }
.category-help { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; }
.category-announce { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; }
.category-discuss { background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%); color: white; }

.discussion-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--dark-color);
  margin-bottom: 1rem;
  line-height: 1.3;
}

.discussion-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  color: var(--gray-500);
  font-size: 0.875rem;
}

.separator {
  color: var(--gray-300);
}

.author {
  font-weight: 500;
  color: var(--gray-600);
}

.updated {
  color: var(--primary-color);
  font-style: italic;
}

.discussion-content {
  font-size: 1.0625rem;
  line-height: 1.8;
  color: var(--dark-color);
  white-space: pre-wrap;
}

.responses-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--dark-color);
}

.dropdown-menu {
  border: none;
  box-shadow: var(--shadow-lg);
  border-radius: var(--border-radius-md);
}

.dropdown-item {
  padding: 0.625rem 1rem;
  font-weight: 500;
}

textarea.form-control-custom {
  resize: vertical;
  min-height: 150px;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
