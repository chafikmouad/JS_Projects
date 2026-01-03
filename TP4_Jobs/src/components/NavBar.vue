<template>
  <nav class="navbar">
    <div class="container navbar-inner">
      <router-link to="/" class="brand">Jobs</router-link>
      <div class="nav">
        <router-link to="/" class="nav-item">Home</router-link>
        <router-link to="/administrator" class="nav-item">Administrator</router-link>
        <!-- n’affiche que pour les admins -->
        <router-link v-if="isAdmin" to="/add-job" class="nav-item">Add Job</router-link>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref } from 'vue'
// exemple très simple : remplacer par store/auth réel
const isAdmin = ref(localStorage.getItem('isAdmin') === '1')
</script>