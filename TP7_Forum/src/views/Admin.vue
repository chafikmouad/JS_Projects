<!--
  Admin.vue - Page d'administration
  
  Accessible uniquement aux modérateurs et admins.
  Affiche le panneau d'administration.
-->

<template>
  <div class="admin-page">
    <div class="container py-4">
      <!-- En-tête -->
      <div class="page-header mb-4">
        <h1 class="page-title">
          <i class="bi bi-shield-lock me-2"></i>
          Administration
        </h1>
        <p class="page-subtitle text-muted">
          Gérez les utilisateurs et les signalements
        </p>
      </div>
      
      <!-- Panneau admin -->
      <AdminPanel />
    </div>
  </div>
</template>

<script setup>
import AdminPanel from '@/components/AdminPanel.vue'
</script>

<style scoped>
.admin-page {
  min-height: calc(100vh - 200px);
}

.page-header {
  padding-bottom: 1rem;
  border-bottom: 2px solid var(--gray-200);
}

.page-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--dark-color);
  margin-bottom: 0.25rem;
}

.page-subtitle {
  font-size: 1rem;
  margin-bottom: 0;
}
</style>
