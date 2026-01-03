<!--
  DiscussionItem.vue - Carte d'une discussion
  
  Affiche un aperçu d'une discussion avec titre, auteur, 
  catégorie, date et nombre de réponses.
-->

<template>
  <div class="discussion-item custom-card hover-lift" @click="goToDiscussion">
    <div class="discussion-content">
      <!-- Catégorie -->
      <span class="category-badge" :class="categoryClass">
        {{ discussion.category }}
      </span>
      
      <!-- Titre -->
      <h3 class="discussion-title">{{ discussion.title }}</h3>
      
      <!-- Extrait du contenu -->
      <p class="discussion-excerpt">{{ excerpt }}</p>
      
      <!-- Métadonnées -->
      <div class="discussion-meta">
        <div class="meta-left">
          <span class="author">
            <i class="bi bi-person-circle me-1"></i>
            {{ discussion.authorName }}
          </span>
          <span class="date">
            <i class="bi bi-clock me-1"></i>
            {{ formattedDate }}
          </span>
        </div>
        <div class="meta-right">
          <span class="responses-count">
            <i class="bi bi-chat-dots me-1"></i>
            {{ discussion.responseCount || 0 }} réponse{{ (discussion.responseCount || 0) !== 1 ? 's' : '' }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  discussion: {
    type: Object,
    required: true
  }
})

const router = useRouter()

// Navigation vers le détail
const goToDiscussion = () => {
  router.push({ name: 'Discussion', params: { id: props.discussion.id } })
}

// Extrait du contenu (max 150 caractères)
const excerpt = computed(() => {
  const content = props.discussion.content || ''
  if (content.length <= 150) return content
  return content.substring(0, 150).trim() + '...'
})

// Formater la date
const formattedDate = computed(() => {
  if (!props.discussion.createdAt) return ''
  
  const date = props.discussion.createdAt.toDate ? 
    props.discussion.createdAt.toDate() : 
    new Date(props.discussion.createdAt)
  
  const now = new Date()
  const diff = now - date
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  
  if (days > 7) {
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(date)
  } else if (days > 0) {
    return `Il y a ${days} jour${days > 1 ? 's' : ''}`
  } else if (hours > 0) {
    return `Il y a ${hours} heure${hours > 1 ? 's' : ''}`
  } else if (minutes > 0) {
    return `Il y a ${minutes} minute${minutes > 1 ? 's' : ''}`
  } else {
    return 'À l\'instant'
  }
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
</script>

<style scoped>
.discussion-item {
  cursor: pointer;
  margin-bottom: 1rem;
  transition: all var(--transition-normal);
}

.discussion-content {
  padding: 1.25rem 1.5rem;
}

.category-badge {
  display: inline-block;
  font-size: 0.7rem;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.025em;
  margin-bottom: 0.75rem;
}

.category-general {
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  color: white;
}

.category-tech {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.category-help {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
}

.category-announce {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
}

.category-discuss {
  background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
  color: white;
}

.discussion-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--dark-color);
  margin-bottom: 0.5rem;
  line-height: 1.4;
  transition: color var(--transition-fast);
}

.discussion-item:hover .discussion-title {
  color: var(--primary-color);
}

.discussion-excerpt {
  color: var(--gray-500);
  font-size: 0.9375rem;
  margin-bottom: 1rem;
  line-height: 1.5;
}

.discussion-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.meta-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.author,
.date {
  font-size: 0.8125rem;
  color: var(--gray-500);
  display: flex;
  align-items: center;
}

.author {
  font-weight: 500;
  color: var(--gray-600);
}

.responses-count {
  font-size: 0.8125rem;
  color: var(--primary-color);
  font-weight: 600;
  display: flex;
  align-items: center;
}

@media (max-width: 576px) {
  .discussion-content {
    padding: 1rem;
  }
  
  .discussion-meta {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .meta-left {
    flex-wrap: wrap;
    gap: 0.5rem;
  }
}
</style>
