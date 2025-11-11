<template>
  <div>
    <div>
      <h1>Administrator interface</h1>
      <h2>Jobs</h2>
    </div>
    <div class="card-container" v-for="value in jobs" :key="value.id">
      <div>
        <router-link :to="`/job/${value.id}`">{{ value.titre }} - {{ value.entreprise }}</router-link>
        <br><br><button @click="import('../views/EditJob.vue')">Modifier Job</button><span>&ThinSpace;</span>
        <button @click="deleteJob">Supprimer Job</button>
      </div>
    </div>
  </div>
</template>

<script>
import jobsData from './jobs.json';

export default {
  name: 'Administrator',
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
  },
  methods : {
    modifyJob(){

    }
  }
}
</script>

<style scoped>
/* Administrator / About page styles */
div {
  background: #fff;
  padding: 1rem 1.2rem;
  border-radius: 8px;
  box-shadow: 0 6px 20px rgba(15, 23, 42, 0.04);
  max-width: 760px;
}

h1 {
  color: #0b5fff;
  margin-bottom: 0.5rem;
}

p {
  color: #334155;
  line-height: 1.5;
}
</style>
