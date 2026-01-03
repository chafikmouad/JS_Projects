<template>
  <div>
    <div>
      <h1>Administrator interface</h1>
      <h2>Jobs</h2>
      <router-link to="/add-job" class="btn primary">Ajouter un job</router-link>
    </div>
    <div class="card-container" v-for="value in jobs" :key="value.id">
      <div>
        <router-link :to="`/job/${value.id}`">{{ value.titre }} - {{ value.entreprise }}</router-link>
        <br><br>
        <button @click="modifyJob(value.id)">Modifier Job</button><span>&ThinSpace;</span>
        <button @click="deleteJob(value.id)">Supprimer Job</button>
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
    try {
      this.jobs = jobsData;
    } catch (error) {
      console.error('Erreur lors du chargement des jobs importés :', error);
    }
  },
  methods: {
    modifyJob(id) {
      // navigate to edit route (route must exist and pass props)
      this.$router.push({ name: 'EditJob', params: { id } })
    },
    deleteJob(id) {
      if (!confirm('Supprimer ce job ?')) return
      this.jobs = this.jobs.filter(j => j.id !== id)
      // if using an API/store, call delete there
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
