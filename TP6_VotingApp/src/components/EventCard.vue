<template>
  <div class="event-card">
    <div v-if="event.img" class="event-image">
      <img :src="event.img" :alt="event.title" />
    </div>
    
    <div class="event-content">
      <div class="event-header">
        <h2 class="event-title">{{ event.title }}</h2>
        <div class="event-price">
          <span v-if="event.isFree" class="free-badge">Gratuit</span>
          <span v-else class="price">{{ event.price }} MAD</span>
        </div>
      </div>

      <p class="event-description">{{ event.description }}</p>

      <div class="event-date">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
        {{ formatDate(event.date) }}
      </div>

      <div class="votes-section">
        <div class="votes-display">
          <div class="vote-count yes">
            <span class="vote-label">Oui</span>
            <span class="vote-number">{{ event.yesVotes || 0 }}</span>
          </div>
          <div class="vote-count no">
            <span class="vote-label">Non</span>
            <span class="vote-number">{{ event.noVotes || 0 }}</span>
          </div>
        </div>

        <div v-if="userVote" class="user-vote-indicator">
          <span>Vous avez voté: <strong>{{ userVote === 'yes' ? 'Oui' : 'Non' }}</strong></span>
        </div>

        <div v-else class="vote-buttons">
          <button 
            @click="submitVote('yes')" 
            :disabled="voting"
            class="btn-vote btn-yes"
          >
            {{ voting ? '...' : 'Voter Oui' }}
          </button>
          <button 
            @click="submitVote('no')" 
            :disabled="voting"
            class="btn-vote btn-no"
          >
            {{ voting ? '...' : 'Voter Non' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { db, auth } from '../firebase/config'
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs,
  doc,
  updateDoc,
  increment,
  serverTimestamp
} from 'firebase/firestore'

export default {
  name: 'EventCard',
  props: {
    event: {
      type: Object,
      required: true
    },
    userVote: {
      type: String,
      default: null
    }
  },
  emits: ['vote'],
  setup(props, { emit }) {
    const voting = ref(false)

    const formatDate = (dateString) => {
      if (!dateString) return 'Date non spécifiée'
      const date = dateString.toDate ? dateString.toDate() : new Date(dateString)
      return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    const submitVote = async (vote) => {
      if (!auth.currentUser) {
        alert('Vous devez être connecté pour voter')
        return
      }

      if (props.userVote) {
        alert('Vous avez déjà voté pour cet événement')
        return
      }

      voting.value = true

      try {
        // Vérifier si l'utilisateur a déjà voté
        const votesQuery = query(
          collection(db, 'Votes'),
          where('eventId', '==', props.event.id),
          where('userId', '==', auth.currentUser.uid)
        )
        const existingVotes = await getDocs(votesQuery)

        if (!existingVotes.empty) {
          alert('Vous avez déjà voté pour cet événement')
          voting.value = false
          return
        }

        // Ajouter le vote
        await addDoc(collection(db, 'Votes'), {
          eventId: props.event.id,
          userId: auth.currentUser.uid,
          vote: vote,
          createdAt: serverTimestamp()
        })

        // Mettre à jour le compteur de votes
        const voteField = vote === 'yes' ? 'yesVotes' : 'noVotes'
        const eventRef = doc(db, 'Events', props.event.id)
        await updateDoc(eventRef, {
          [voteField]: increment(1),
          updatedAt: serverTimestamp()
        })

        emit('vote', props.event.id, vote)
      } catch (error) {
        console.error('Erreur lors du vote:', error)
        alert('Une erreur est survenue lors du vote')
      } finally {
        voting.value = false
      }
    }

    return {
      voting,
      formatDate,
      submitVote
    }
  }
}
</script>

<style scoped>
.event-card {
  background: white;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  transition: transform 0.3s, box-shadow 0.3s;
}

.event-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
}

.event-image {
  width: 100%;
  height: 200px;
  overflow: hidden;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.event-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.event-content {
  padding: 1.5rem;
}

.event-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  gap: 1rem;
}

.event-title {
  font-size: 1.5rem;
  color: #333;
  margin: 0;
  flex: 1;
}

.event-price {
  flex-shrink: 0;
}

.free-badge {
  background: #4caf50;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
}

.price {
  color: #667eea;
  font-weight: 600;
  font-size: 1.1rem;
}

.event-description {
  color: #666;
  line-height: 1.6;
  margin-bottom: 1rem;
}

.event-date {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #888;
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
}

.votes-section {
  border-top: 2px solid #f0f0f0;
  padding-top: 1.5rem;
}

.votes-display {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.vote-count {
  flex: 1;
  padding: 1rem;
  border-radius: 10px;
  text-align: center;
}

.vote-count.yes {
  background: #e8f5e9;
  color: #2e7d32;
}

.vote-count.no {
  background: #ffebee;
  color: #c62828;
}

.vote-label {
  display: block;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.vote-number {
  display: block;
  font-size: 2rem;
  font-weight: 700;
}

.user-vote-indicator {
  background: #e3f2fd;
  color: #1976d2;
  padding: 0.75rem;
  border-radius: 8px;
  text-align: center;
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

.vote-buttons {
  display: flex;
  gap: 0.75rem;
}

.btn-vote {
  flex: 1;
  padding: 0.875rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-yes {
  background: #4caf50;
  color: white;
}

.btn-yes:hover:not(:disabled) {
  background: #45a049;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.4);
}

.btn-no {
  background: #f44336;
  color: white;
}

.btn-no:hover:not(:disabled) {
  background: #da190b;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(244, 67, 54, 0.4);
}

.btn-vote:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 480px) {
  .event-header {
    flex-direction: column;
  }
  
  .vote-buttons {
    flex-direction: column;
  }
}
</style>

