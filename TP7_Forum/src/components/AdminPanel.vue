<!--
  AdminPanel.vue - Panneau d'administration
  
  Permet aux modérateurs et admins de:
  - Gérer les rôles des utilisateurs
  - Voir et traiter les signalements
-->

<template>
  <div class="admin-panel">
    <!-- Onglets -->
    <ul class="nav nav-tabs mb-4" role="tablist">
      <li class="nav-item" role="presentation">
        <button 
          class="nav-link" 
          :class="{ active: activeTab === 'users' }"
          @click="activeTab = 'users'"
        >
          <i class="bi bi-people me-2"></i>
          Utilisateurs
        </button>
      </li>
      <li class="nav-item" role="presentation">
        <button 
          class="nav-link" 
          :class="{ active: activeTab === 'reports' }"
          @click="activeTab = 'reports'"
        >
          <i class="bi bi-flag me-2"></i>
          Signalements
          <span v-if="pendingReportsCount > 0" class="badge bg-danger ms-2">
            {{ pendingReportsCount }}
          </span>
        </button>
      </li>
    </ul>
    
    <!-- Contenu des onglets -->
    <div class="tab-content">
      <!-- Onglet Utilisateurs -->
      <div v-show="activeTab === 'users'" class="tab-pane">
        <div class="card custom-card">
          <div class="custom-card-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0">
              <i class="bi bi-people me-2"></i>
              Gestion des utilisateurs
            </h5>
            <span class="badge bg-light text-dark">{{ users.length }} utilisateurs</span>
          </div>
          <div class="custom-card-body">
            <!-- Chargement -->
            <div v-if="isLoadingUsers" class="text-center py-4">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Chargement...</span>
              </div>
            </div>
            
            <!-- Table des utilisateurs -->
            <div v-else class="table-responsive">
              <table class="table table-hover align-middle">
                <thead>
                  <tr>
                    <th>Utilisateur</th>
                    <th>Email</th>
                    <th>Rôle actuel</th>
                    <th>Inscrit le</th>
                    <th v-if="isAdmin">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="u in users" :key="u.id">
                    <td>
                      <div class="d-flex align-items-center gap-2">
                        <i class="bi bi-person-circle fs-4 text-muted"></i>
                        <span class="fw-medium">{{ u.name }}</span>
                      </div>
                    </td>
                    <td class="text-muted">{{ u.email }}</td>
                    <td>
                      <span class="badge" :class="getRoleBadgeClass(u.role)">
                        {{ getRoleLabel(u.role) }}
                      </span>
                    </td>
                    <td class="text-muted small">{{ formatDate(u.createdAt) }}</td>
                    <td v-if="isAdmin">
                      <select 
                        v-if="u.id !== user?.uid"
                        :value="u.role"
                        @change="changeUserRole(u.id, $event.target.value)"
                        class="form-select form-select-sm"
                        style="width: auto;"
                        :disabled="isUpdatingRole === u.id"
                      >
                        <option value="user">Utilisateur</option>
                        <option value="moderator">Modérateur</option>
                        <option value="admin">Admin</option>
                      </select>
                      <span v-else class="text-muted small">Vous</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Onglet Signalements -->
      <div v-show="activeTab === 'reports'" class="tab-pane">
        <div class="card custom-card">
          <div class="custom-card-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0">
              <i class="bi bi-flag me-2"></i>
              Signalements
            </h5>
            <span class="badge bg-light text-dark">{{ reports.length }} signalements</span>
          </div>
          <div class="custom-card-body">
            <!-- Chargement -->
            <div v-if="isLoadingReports" class="text-center py-4">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Chargement...</span>
              </div>
            </div>
            
            <!-- Liste des signalements -->
            <div v-else-if="reports.length > 0">
              <div 
                v-for="report in reports" 
                :key="report.id" 
                class="report-item mb-3"
                :class="{ 'report-resolved': report.status === 'resolved' }"
              >
                <div class="report-header">
                  <span class="report-type">
                    <i :class="report.targetType === 'discussion' ? 'bi bi-chat-square-text' : 'bi bi-reply'"></i>
                    {{ report.targetType === 'discussion' ? 'Discussion' : 'Réponse' }}
                  </span>
                  <span class="report-date">{{ formatDate(report.createdAt) }}</span>
                </div>
                
                <div class="report-body">
                  <p class="report-reason mb-2">
                    <strong>Raison :</strong> {{ report.reason }}
                  </p>
                  <p class="report-status mb-2">
                    <strong>Statut :</strong>
                    <span class="badge" :class="getStatusBadgeClass(report.status)">
                      {{ getStatusLabel(report.status) }}
                    </span>
                  </p>
                </div>
                
                <div class="report-actions">
                  <button 
                    v-if="report.targetType === 'discussion'"
                    class="btn btn-sm btn-outline-primary"
                    @click="viewTarget(report)"
                  >
                    <i class="bi bi-eye me-1"></i>
                    Voir
                  </button>
                  
                  <button 
                    v-if="report.status === 'pending'"
                    class="btn btn-sm btn-outline-success"
                    @click="resolveReport(report.id)"
                    :disabled="isResolvingReport === report.id"
                  >
                    <i class="bi bi-check me-1"></i>
                    Résolu
                  </button>
                  
                  <button 
                    class="btn btn-sm btn-outline-danger"
                    @click="deleteReportItem(report.id)"
                    :disabled="isDeletingReport === report.id"
                  >
                    <i class="bi bi-trash me-1"></i>
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
            
            <!-- État vide -->
            <div v-else class="text-center py-4">
              <i class="bi bi-shield-check fs-1 text-success mb-3 d-block"></i>
              <p class="text-muted mb-0">Aucun signalement à traiter</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import useAuth from '@/composables/useAuth'
import useFirestore from '@/composables/useFirestore'
import useNotification from '@/composables/useNotification'

const router = useRouter()
const { user, isAdmin } = useAuth()
const { getAllUsers, updateUserRole, getReports, updateReportStatus, deleteReport } = useFirestore()
const { success, error } = useNotification()

// État
const activeTab = ref('users')
const users = ref([])
const reports = ref([])
const isLoadingUsers = ref(true)
const isLoadingReports = ref(true)
const isUpdatingRole = ref(null)
const isResolvingReport = ref(null)
const isDeletingReport = ref(null)

// Nombre de signalements en attente
const pendingReportsCount = computed(() => {
  return reports.value.filter(r => r.status === 'pending').length
})

// Charger les données
const loadUsers = async () => {
  isLoadingUsers.value = true
  try {
    users.value = await getAllUsers()
  } catch (err) {
    console.error('Erreur chargement utilisateurs:', err)
  } finally {
    isLoadingUsers.value = false
  }
}

const loadReports = async () => {
  isLoadingReports.value = true
  try {
    reports.value = await getReports()
  } catch (err) {
    console.error('Erreur chargement signalements:', err)
  } finally {
    isLoadingReports.value = false
  }
}

// Formater la date
const formatDate = (timestamp) => {
  if (!timestamp) return 'N/A'
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(date)
}

// Labels et classes CSS
const getRoleLabel = (role) => {
  const labels = { admin: 'Admin', moderator: 'Modérateur', user: 'Utilisateur' }
  return labels[role] || 'Utilisateur'
}

const getRoleBadgeClass = (role) => {
  const classes = {
    admin: 'bg-danger',
    moderator: 'bg-warning',
    user: 'bg-secondary'
  }
  return classes[role] || 'bg-secondary'
}

const getStatusLabel = (status) => {
  const labels = { pending: 'En attente', resolved: 'Résolu' }
  return labels[status] || 'En attente'
}

const getStatusBadgeClass = (status) => {
  return status === 'resolved' ? 'bg-success' : 'bg-warning'
}

// Actions
const changeUserRole = async (userId, newRole) => {
  isUpdatingRole.value = userId
  try {
    await updateUserRole(userId, newRole)
    const userIndex = users.value.findIndex(u => u.id === userId)
    if (userIndex !== -1) {
      users.value[userIndex].role = newRole
    }
    success('Rôle mis à jour')
  } catch (err) {
    error('Erreur lors de la mise à jour du rôle')
  } finally {
    isUpdatingRole.value = null
  }
}

const viewTarget = (report) => {
  if (report.targetType === 'discussion') {
    router.push({ name: 'Discussion', params: { id: report.targetId } })
  }
}

const resolveReport = async (reportId) => {
  isResolvingReport.value = reportId
  try {
    await updateReportStatus(reportId, 'resolved')
    const reportIndex = reports.value.findIndex(r => r.id === reportId)
    if (reportIndex !== -1) {
      reports.value[reportIndex].status = 'resolved'
    }
    success('Signalement marqué comme résolu')
  } catch (err) {
    error('Erreur lors de la résolution')
  } finally {
    isResolvingReport.value = null
  }
}

const deleteReportItem = async (reportId) => {
  isDeletingReport.value = reportId
  try {
    await deleteReport(reportId)
    reports.value = reports.value.filter(r => r.id !== reportId)
    success('Signalement supprimé')
  } catch (err) {
    error('Erreur lors de la suppression')
  } finally {
    isDeletingReport.value = null
  }
}

// Chargement initial
onMounted(() => {
  loadUsers()
  loadReports()
})
</script>

<style scoped>
.nav-tabs {
  border-bottom: 2px solid var(--gray-200);
}

.nav-tabs .nav-link {
  border: none;
  color: var(--gray-600);
  font-weight: 500;
  padding: 0.75rem 1.25rem;
  border-radius: 0;
  transition: all var(--transition-fast);
}

.nav-tabs .nav-link:hover {
  color: var(--primary-color);
  background: transparent;
}

.nav-tabs .nav-link.active {
  color: var(--primary-color);
  background: transparent;
  border-bottom: 2px solid var(--primary-color);
  margin-bottom: -2px;
}

.table th {
  font-weight: 600;
  color: var(--gray-600);
  font-size: 0.8125rem;
  text-transform: uppercase;
  letter-spacing: 0.025em;
  border-bottom: 2px solid var(--gray-200);
}

.table td {
  vertical-align: middle;
  padding: 1rem 0.75rem;
}

.report-item {
  background: var(--gray-100);
  border-radius: var(--border-radius-md);
  padding: 1rem;
  border-left: 4px solid var(--warning-color);
}

.report-item.report-resolved {
  border-left-color: var(--success-color);
  opacity: 0.7;
}

.report-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.report-type {
  font-weight: 600;
  color: var(--dark-color);
}

.report-date {
  font-size: 0.75rem;
  color: var(--gray-500);
}

.report-body {
  margin-bottom: 0.75rem;
}

.report-reason {
  font-size: 0.875rem;
  color: var(--gray-700);
}

.report-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}
</style>
