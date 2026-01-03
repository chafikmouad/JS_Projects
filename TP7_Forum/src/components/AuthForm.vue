<!--
  AuthForm.vue - Formulaire d'authentification réutilisable
  
  Utilisé pour la connexion et l'inscription.
  Props: mode ('login' | 'register')
-->

<template>
  <div class="auth-form-container">
    <div class="auth-card custom-card animate-fadeIn">
      <div class="custom-card-header text-center">
        <h2 class="mb-0">
          <i :class="headerIcon" class="me-2"></i>
          {{ headerTitle }}
        </h2>
      </div>
      
      <div class="custom-card-body">
        <form @submit.prevent="handleSubmit">
          <!-- Nom d'affichage (inscription uniquement) -->
          <div class="mb-3" v-if="mode === 'register'">
            <label for="displayName" class="form-label form-label-custom">
              Nom d'affichage
            </label>
            <input
              type="text"
              id="displayName"
              v-model="formData.displayName"
              class="form-control form-control-custom"
              placeholder="Votre nom d'affichage"
              required
              minlength="2"
              maxlength="50"
            >
          </div>
          
          <!-- Email -->
          <div class="mb-3">
            <label for="email" class="form-label form-label-custom">
              Adresse email
            </label>
            <input
              type="email"
              id="email"
              v-model="formData.email"
              class="form-control form-control-custom"
              placeholder="votre@email.com"
              required
            >
          </div>
          
          <!-- Mot de passe -->
          <div class="mb-3">
            <label for="password" class="form-label form-label-custom">
              Mot de passe
            </label>
            <div class="password-input-wrapper">
              <input
                :type="showPassword ? 'text' : 'password'"
                id="password"
                v-model="formData.password"
                class="form-control form-control-custom"
                placeholder="••••••••"
                required
                minlength="6"
              >
              <button 
                type="button" 
                class="password-toggle"
                @click="showPassword = !showPassword"
                :aria-label="showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'"
              >
                <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
              </button>
            </div>
            <small v-if="mode === 'register'" class="text-muted">
              Au moins 6 caractères
            </small>
          </div>
          
          <!-- Confirmation mot de passe (inscription uniquement) -->
          <div class="mb-3" v-if="mode === 'register'">
            <label for="passwordConfirm" class="form-label form-label-custom">
              Confirmer le mot de passe
            </label>
            <input
              type="password"
              id="passwordConfirm"
              v-model="formData.passwordConfirm"
              class="form-control form-control-custom"
              placeholder="••••••••"
              required
              minlength="6"
            >
          </div>
          
          <!-- Lien mot de passe oublié (connexion uniquement) -->
          <div class="mb-3" v-if="mode === 'login'">
            <a href="#" class="forgot-password-link" @click.prevent="handleForgotPassword">
              Mot de passe oublié ?
            </a>
          </div>
          
          <!-- Message d'erreur -->
          <div v-if="errorMessage" class="alert alert-danger d-flex align-items-center" role="alert">
            <i class="bi bi-exclamation-triangle-fill me-2"></i>
            {{ errorMessage }}
          </div>
          
          <!-- Bouton de soumission -->
          <button 
            type="submit" 
            class="btn btn-primary-custom w-100 py-3"
            :disabled="isLoading"
          >
            <span v-if="isLoading" class="spinner-border spinner-border-sm me-2" role="status">
              <span class="visually-hidden">Chargement...</span>
            </span>
            <i v-else :class="submitIcon" class="me-2"></i>
            {{ submitText }}
          </button>
        </form>
        
        <!-- Lien vers l'autre formulaire -->
        <div class="text-center mt-4">
          <p class="text-muted mb-0">
            {{ switchText }}
            <router-link :to="switchRoute" class="fw-bold">
              {{ switchLinkText }}
            </router-link>
          </p>
        </div>
      </div>
    </div>
    
    <!-- Modal réinitialisation mot de passe -->
    <BModal
      v-model="showResetModal"
      title="Réinitialiser le mot de passe"
      hide-footer
      centered
    >
      <form @submit.prevent="submitPasswordReset">
        <div class="mb-3">
          <label for="resetEmail" class="form-label form-label-custom">
            Adresse email
          </label>
          <input
            type="email"
            id="resetEmail"
            v-model="resetEmail"
            class="form-control form-control-custom"
            placeholder="votre@email.com"
            required
          >
        </div>
        
        <div v-if="resetMessage" class="alert" :class="resetSuccess ? 'alert-success' : 'alert-danger'">
          {{ resetMessage }}
        </div>
        
        <div class="d-flex gap-2 justify-content-end">
          <button type="button" class="btn btn-secondary-custom" @click="showResetModal = false">
            Annuler
          </button>
          <button type="submit" class="btn btn-primary-custom" :disabled="isResetting">
            <span v-if="isResetting" class="spinner-border spinner-border-sm me-2"></span>
            Envoyer
          </button>
        </div>
      </form>
    </BModal>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { BModal } from 'bootstrap-vue-next'
import useAuth from '@/composables/useAuth'
import useNotification from '@/composables/useNotification'

// Props
const props = defineProps({
  mode: {
    type: String,
    required: true,
    validator: (value) => ['login', 'register'].includes(value)
  }
})

const router = useRouter()
const route = useRoute()
const { login, signup, resetPassword, error: authError } = useAuth()
const { success, error } = useNotification()

// État du formulaire
const formData = ref({
  email: '',
  password: '',
  passwordConfirm: '',
  displayName: ''
})

const isLoading = ref(false)
const showPassword = ref(false)
const errorMessage = ref('')

// Modal réinitialisation
const showResetModal = ref(false)
const resetEmail = ref('')
const resetMessage = ref('')
const resetSuccess = ref(false)
const isResetting = ref(false)

// Textes dynamiques selon le mode
const headerTitle = computed(() => props.mode === 'login' ? 'Connexion' : 'Inscription')
const headerIcon = computed(() => props.mode === 'login' ? 'bi bi-box-arrow-in-right' : 'bi bi-person-plus')
const submitText = computed(() => props.mode === 'login' ? 'Se connecter' : 'S\'inscrire')
const submitIcon = computed(() => props.mode === 'login' ? 'bi bi-box-arrow-in-right' : 'bi bi-person-plus')
const switchText = computed(() => props.mode === 'login' ? 'Pas encore de compte ?' : 'Déjà inscrit ?')
const switchLinkText = computed(() => props.mode === 'login' ? 'Inscrivez-vous' : 'Connectez-vous')
const switchRoute = computed(() => props.mode === 'login' ? '/register' : '/login')

// Soumission du formulaire
const handleSubmit = async () => {
  errorMessage.value = ''
  
  // Validation pour l'inscription
  if (props.mode === 'register') {
    if (formData.value.password !== formData.value.passwordConfirm) {
      errorMessage.value = 'Les mots de passe ne correspondent pas.'
      return
    }
    if (formData.value.displayName.trim().length < 2) {
      errorMessage.value = 'Le nom d\'affichage doit contenir au moins 2 caractères.'
      return
    }
  }
  
  isLoading.value = true
  
  try {
    if (props.mode === 'login') {
      await login(formData.value.email, formData.value.password)
      success('Connexion réussie !')
    } else {
      await signup(formData.value.email, formData.value.password, formData.value.displayName.trim())
      success('Inscription réussie ! Bienvenue sur le forum.')
    }
    
    // Redirection
    const redirectPath = route.query.redirect || '/'
    router.push(redirectPath)
  } catch (err) {
    errorMessage.value = authError.value || 'Une erreur est survenue.'
  } finally {
    isLoading.value = false
  }
}

// Ouverture du modal de réinitialisation
const handleForgotPassword = () => {
  resetEmail.value = formData.value.email
  resetMessage.value = ''
  resetSuccess.value = false
  showResetModal.value = true
}

// Soumission de la réinitialisation
const submitPasswordReset = async () => {
  if (!resetEmail.value) return
  
  isResetting.value = true
  resetMessage.value = ''
  
  try {
    await resetPassword(resetEmail.value)
    resetSuccess.value = true
    resetMessage.value = 'Un email de réinitialisation a été envoyé.'
    success('Email de réinitialisation envoyé !')
    
    setTimeout(() => {
      showResetModal.value = false
    }, 3000)
  } catch (err) {
    resetSuccess.value = false
    resetMessage.value = authError.value || 'Erreur lors de l\'envoi de l\'email.'
  } finally {
    isResetting.value = false
  }
}
</script>

<style scoped>
.auth-form-container {
  min-height: calc(100vh - 200px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
}

.auth-card {
  width: 100%;
  max-width: 440px;
}

.password-input-wrapper {
  position: relative;
}

.password-toggle {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--gray-500);
  cursor: pointer;
  padding: 0.25rem;
  transition: color var(--transition-fast);
}

.password-toggle:hover {
  color: var(--primary-color);
}

.forgot-password-link {
  font-size: 0.875rem;
  color: var(--primary-color);
}

.forgot-password-link:hover {
  color: var(--primary-dark);
  text-decoration: underline;
}

.alert {
  font-size: 0.875rem;
  border-radius: var(--border-radius-md);
}

@media (max-width: 480px) {
  .auth-form-container {
    padding: 1rem;
  }
  
  .custom-card-body {
    padding: 1.25rem;
  }
}
</style>
