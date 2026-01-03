<template>
  <div>
    <h1>User interface</h1>
    <h2>Jobs</h2>
  </div>
  <div v-for="value in jobs" :key="value.id">
    <router-link :to="`/job/${value.id}`">{{ value.titre }} - {{ value.entreprise }}</router-link>
  </div>
</template>

<script>
import jobsData from './jobs.json';

export default {
  name: 'User',
  data() {
    return {
      jobs: []
    }
  },
  created() {
    // Importer le JSON à la compilation est plus fiable avec Vite
    // (évite les problèmes de chemin relatif et CORS quand le fichier est dans `src/`).
    try {
      this.jobs = jobsData;
      console.log('Jobs chargés (import):', this.jobs.length);
    } catch (error) {
      console.error('Erreur lors du chargement des jobs importés :', error);
    }
  }
}
</script>

<style scoped>
/* Styles for the User (jobs list) view */
h1 {
  font-size: 1.6rem;
  color: #0f172a;
  margin-bottom: 0.8rem;
}

a {
  display: inline-block;
  padding: 0.5rem 0.6rem;
  margin: 0.25rem 0;
  color: #0b5fff;
  text-decoration: none;
  border-bottom: 1px dashed rgba(11,95,255,0.12);
}

a:hover {
  background: rgba(11,95,255,0.06);
}

router-link {
  font-weight: 600;
}
</style>
