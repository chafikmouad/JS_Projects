<template>
  <div class="container">
    <header class="page-header">
      <h1 class="page-title">Blog</h1>
      <!-- vous pouvez ajouter un bouton "Nouveau post" ou un champ de recherche ici -->
    </header>

    <div class="home">
      <main class="content">
        <!-- PostList doit rendre les .post et être enveloppé dans .posts-grid -->
        <PostList :tag="props.tag" />
      </main>

      <aside>
        <div class="sticky">
          <TagCloud />
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup>
/* global defineProps */
import PostList from '@/components/PostList.vue'
import TagCloud from '@/components/TagCloud.vue'

const props = defineProps({
  tag: String
})
</script>