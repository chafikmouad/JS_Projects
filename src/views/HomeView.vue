<template>
  <div class="home">
    <div class="content">
      <PostList :tag="tag" />
    </div>

    <aside>
      <TagCloud />
    </aside>
  </div>
</template>

<script setup>

import PostList from '@/components/PostList.vue'
import TagCloud from '@/components/TagCloud.vue'



</script>