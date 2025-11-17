<template>
    <div class="tagcloud">
        <h3>Tags</h3>
        <div>
            <router-link
                v-for="tag in uniqueTags" :key="tag" :to="`/tags/${tag}`" class="tag">
                #{{ tag }}
            </router-link>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'
import getPosts from '../composables/getPosts'

const { posts } = getPosts()

const uniqueTags = computed(() => {
  const tags = posts.value.flatMap(p => p.tags)
  return [...new Set(tags)]
})
</script>

<style>

</style>
