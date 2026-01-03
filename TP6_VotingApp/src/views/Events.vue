<template>
  <div class="events-container">
    <div class="events-header">
      <h1>Événements</h1>
      <p class="subtitle">Votez pour les événements proposés</p>
    </div>

    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Chargement des événements...</p>
    </div>

    <div v-else-if="events.length === 0" class="empty-state">
      <p>Aucun événement disponible pour le moment.</p>
    </div>

    <div v-else class="events-grid">
      <EventCard
        v-for="event in events"
        :key="event.id"
        :event="event"
        :user-vote="getUserVote(event.id)"
        @vote="handleVote"
      />
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'
import { db, auth } from '../firebase/config'
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot,
  where,
  getDocs
} from 'firebase/firestore'
import EventCard from '../components/EventCard.vue'

export default {
  name: 'Events',
  components: {
    EventCard
  },
  setup() {
    const events = ref([])
    const loading = ref(true)
    const userVotes = ref({})

    const loadUserVotes = async () => {
      if (!auth.currentUser) return

      try {
        const votesQuery = query(
          collection(db, 'Votes'),
          where('userId', '==', auth.currentUser.uid)
        )
        const votesSnapshot = await getDocs(votesQuery)
        const votes = {}
        votesSnapshot.forEach((doc) => {
          votes[doc.data().eventId] = doc.data().vote
        })
        userVotes.value = votes
      } catch (error) {
        console.error('Erreur lors du chargement des votes:', error)
      }
    }

    onMounted(() => {
      // Écouter les événements en temps réel
      const eventsQuery = query(
        collection(db, 'Events'),
        orderBy('createdAt', 'desc')
      )

      const unsubscribe = onSnapshot(eventsQuery, (snapshot) => {
        events.value = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        loading.value = false
        loadUserVotes()
      }, (error) => {
        console.error('Erreur lors du chargement des événements:', error)
        loading.value = false
      })

      // Nettoyer l'écouteur lors du démontage
      onUnmounted(() => {
        unsubscribe()
      })
    })

    const getUserVote = (eventId) => {
      return userVotes.value[eventId] || null
    }

    const handleVote = async (eventId, vote) => {
      await loadUserVotes()
    }

    return {
      events,
      loading,
      getUserVote,
      handleVote
    }
  }
}
</script>

<style scoped>
.events-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.events-header {
  text-align: center;
  margin-bottom: 3rem;
}

.events-header h1 {
  font-size: 2.5rem;
  color: #333;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: #666;
  font-size: 1.1rem;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  gap: 1rem;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-state {
  text-align: center;
  padding: 4rem;
  color: #666;
  font-size: 1.2rem;
}

.events-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
}

@media (max-width: 768px) {
  .events-container {
    padding: 1rem;
  }
  
  .events-header h1 {
    font-size: 2rem;
  }
  
  .events-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
}
</style>

