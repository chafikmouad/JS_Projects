<template>
  <div>
    <h1>Ajouter un article</h1>

    <form @submit.prevent="addPost" class="form">
      <input v-model="title" placeholder="Titre" required />
      <textarea v-model="body" placeholder="Contenu" required></textarea>

      <input v-model="tagInput" placeholder="Tags séparés par des virgules" />

      <button>Ajouter</button>
    </form>
  </div>
</template>

<script setup>
    import { ref } from 'vue'
    import getPosts from '../composables/getPosts'
    const { posts } = getPosts()
    const title = ref('')
    const body = ref('')
    const tagInput = ref('')

    const addPost = () => {
    posts.value.push({
        id: Date.now(),
        title: title.value,
        body: body.value,
        tags: tagInput.value.split(',').map(t => t.trim())
    })

    title.value = ''
    body.value = ''
    tagInput.value = ''
    }
</script>