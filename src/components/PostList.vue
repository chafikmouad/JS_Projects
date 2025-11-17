<template>
    <div>
        <SinglePost v-for="post in filteredPosts" :key="post.id" :post="post" />
    </div>
</template>


<script setup>
/* global defineProps */
import { computed } from 'vue'
import getPosts from '../composables/getPosts'
import SinglePost from './SinglePost.vue'

const props = defineProps({
  tag: String
})

const { posts } = getPosts()

const filteredPosts = computed(() => {
  if (!props.tag) return posts.value
  return posts.value.filter(p => p.tags.includes(props.tag))
})
</script>