<template>
  <div class="container">
    <div class="add-post">
      <h2>Ajouter un article</h2>

      <form @submit.prevent="addPost">
        <div class="form-row">
          <label for="title">Titre</label>
          <input id="title" v-model="title" placeholder="Titre" required />
        </div>

        <div class="form-row">
          <label for="body">Contenu</label>
          <textarea id="body" v-model="body" placeholder="Contenu" required></textarea>
        </div>

        <div class="form-row">
          <label for="tags">Tags (séparés par des virgules)</label>
          <input id="tags" v-model="tagInput" placeholder="ex: vue, javascript" />
        </div>

        <div class="form-actions">
          <button type="button" class="btn ghost" @click="reset">Annuler</button>
          <button type="submit" class="btn primary">Ajouter</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import getPosts from '../composables/getPosts'

const { posts } = getPosts()
const router = useRouter()

const title = ref('')
const body = ref('')
const tagInput = ref('')

const addPost = () => {
  posts.value.push({
    id: Date.now(),
    title: title.value,
    body: body.value,
    tags: tagInput.value.split(',').map(t => t.trim()).filter(Boolean)
  })

  reset()
  router.push('/')
}

const reset = () => {
  title.value = ''
  body.value = ''
  tagInput.value = ''
}
</script>

<style scoped>
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.add-post {
  background: #f9f9f9;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

h2 {
  margin-bottom: 1.5rem;
}

.form-row {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

input,
textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
}

textarea {
  resize: vertical;
}

.form-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 1rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

.btn.ghost {
  background: transparent;
  color: #333;
}

.btn.primary {
  background: #007bff;
  color: white;
}
</style>