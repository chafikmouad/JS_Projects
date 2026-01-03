<template>
  <div v-if="post">
    <h1>{{ post.title }}</h1>
    <p>{{ post.body }}</p>

    <TagCloud />
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
import TagCloud from '../components/TagCloud.vue'
import getPost from '../composables/getPost'
const route = useRoute()
const { post } = getPost(route.params.id)
</script>