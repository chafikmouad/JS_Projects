<template>
  <div class="login-container">
    <div class="login-card">
      <h1 class="login-title">ENSA Safi</h1>
      <h2 class="login-subtitle">Application de Vote</h2>
      
      <div class="tabs">
        <button 
          @click="isLogin = true" 
          :class="['tab', { active: isLogin }]"
        >
          Connexion
        </button>
        <button 
          @click="isLogin = false" 
          :class="['tab', { active: !isLogin }]"
        >
          Inscription
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="login-form">
        <div class="form-group">
          <label for="email">Email universitaire</label>
          <input
            id="email"
            v-model="email"
            type="email"
            placeholder="exemple@ensas.uca.ma"
            required
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label for="password">Mot de passe</label>
          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="••••••••"
            required
            minlength="6"
            class="form-input"
          />
        </div>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <button 
          type="submit" 
          :disabled="loading"
          class="btn-submit"
        >
          {{ loading ? 'Chargement...' : (isLogin ? 'Se connecter' : "S'inscrire") }}
        </button>
      </form>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { auth } from '../firebase/config'
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword 
} from 'firebase/auth'

export default {
  name: 'Login',
  setup() {
    const router = useRouter()
    const email = ref('')
    const password = ref('')
    const isLogin = ref(true)
    const loading = ref(false)
    const error = ref('')

    const handleSubmit = async () => {
      error.value = ''
      loading.value = true

      try {
        if (isLogin.value) {
          await signInWithEmailAndPassword(auth, email.value, password.value)
        } else {
          await createUserWithEmailAndPassword(auth, email.value, password.value)
        }
        router.push('/events')
      } catch (err) {
        error.value = err.message || 'Une erreur est survenue'
        if (err.code === 'auth/email-already-in-use') {
          error.value = 'Cet email est déjà utilisé'
        } else if (err.code === 'auth/invalid-email') {
          error.value = 'Email invalide'
        } else if (err.code === 'auth/weak-password') {
          error.value = 'Le mot de passe doit contenir au moins 6 caractères'
        } else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
          error.value = 'Email ou mot de passe incorrect'
        }
      } finally {
        loading.value = false
      }
    }

    return {
      email,
      password,
      isLogin,
      loading,
      error,
      handleSubmit
    }
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 2rem;
}

.login-card {
  background: white;
  border-radius: 15px;
  padding: 3rem;
  box-shadow: 0 10px 40px rgba(0,0,0,0.1);
  width: 100%;
  max-width: 450px;
}

.login-title {
  text-align: center;
  color: #667eea;
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.login-subtitle {
  text-align: center;
  color: #666;
  font-size: 1.2rem;
  font-weight: 400;
  margin-bottom: 2rem;
}

.tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  border-bottom: 2px solid #eee;
}

.tab {
  flex: 1;
  padding: 0.75rem;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  color: #666;
  border-bottom: 3px solid transparent;
  transition: all 0.3s;
}

.tab.active {
  color: #667eea;
  border-bottom-color: #667eea;
  font-weight: 600;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 500;
  color: #333;
}

.form-input {
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
}

.error-message {
  background: #fee;
  color: #c33;
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid #fcc;
  font-size: 0.9rem;
}

.btn-submit {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0.875rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 480px) {
  .login-card {
    padding: 2rem 1.5rem;
  }
  
  .login-title {
    font-size: 1.5rem;
  }
}
</style>

