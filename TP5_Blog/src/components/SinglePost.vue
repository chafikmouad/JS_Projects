<template>
    <article class ="post">
        <h2>{{ post.title }}</h2>
        <p class="snippet">
            {{ post.body.substring(0,50) }}
        </p>
    

    <div class="tags">
        <span v-for="tag in post.tags" :key="tag">#{{ tag }}</span>
    </div>

    <router-link :to="`/post/${post.id}`" class="read-link">Details</router-link>
    </article>
</template>

<script setup>
/* global defineProps */
defineProps({
  post: Object
})
</script>
