<template>
  <div id="app">
    <nav class="navbar" v-if="user">
      <div class="nav-container">
        <h1 class="logo">ENSA Safi - Vote</h1>
        <div class="nav-user">
          <span class="user-email">{{ user.email }}</span>
          <button @click="handleLogout" class="btn-logout">Déconnexion</button>
        </div>
      </div>
    </nav>
    <router-view />
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'
import { auth } from './firebase/config'
import { signOut } from 'firebase/auth'
import { useRouter } from 'vue-router'

export default {
  name: 'App',
  setup() {
    const user = ref(null)
    const router = useRouter()

    const handleLogout = async () => {
      try {
        await signOut(auth)
        router.push('/login')
      } catch (error) {
        console.error('Erreur lors de la déconnexion:', error)
      }
    }

    onMounted(() => {
      auth.onAuthStateChanged((u) => {
        user.value = u
      })
    })

    return {
      user,
      handleLogout
    }
  }
}
</script>

<style scoped>
.navbar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1rem 2rem;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.nav-user {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-email {
  font-size: 0.9rem;
  opacity: 0.9;
}

.btn-logout {
  background: rgba(255,255,255,0.2);
  border: 1px solid rgba(255,255,255,0.3);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-logout:hover {
  background: rgba(255,255,255,0.3);
}

@media (max-width: 768px) {
  .nav-container {
    flex-direction: column;
    gap: 1rem;
  }
  
  .nav-user {
    flex-direction: column;
    width: 100%;
  }
  
  .btn-logout {
    width: 100%;
  }
}
</style>

