<!--
  Login.vue - Page de connexion
  
  Affiche le formulaire de connexion.
-->

<template>
  <div class="login-page">
    <AuthForm mode="login" />
  </div>
</template>

<script setup>
import AuthForm from '@/components/AuthForm.vue'
</script>

<style scoped>
.login-page {
  background: linear-gradient(135deg, var(--bg-primary) 0%, var(--gray-100) 100%);
}
</style>
