<!--
  Register.vue - Page d'inscription
  
  Affiche le formulaire d'inscription.
-->

<template>
  <div class="register-page">
    <AuthForm mode="register" />
  </div>
</template>

<script setup>
import AuthForm from '@/components/AuthForm.vue'
</script>

<style scoped>
.register-page {
  background: linear-gradient(135deg, var(--bg-primary) 0%, var(--gray-100) 100%);
}
</style>
