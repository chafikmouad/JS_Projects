<template>
  <div>
    <div v-if="job">
      <div v-for="(value, key) in job" :key="key">
        <div v-if="key !== 'id'">
          <p v-if="key">{{ key }}: {{ value }}</p>
        </div>
      </div>
    </div>
    <div v-else>
      <p>Job introuvable.</p>
    </div>
  </div>
</template>

<script>
import jobs from './jobs.json';

export default {
  // Le routeur transmet le param `id` en prop (router: props: true)
  props: ['id'],
  computed: {
    job() {
      const id = Number(this.id);
      return jobs.find(item => item.id === id) || null;
    }
  }
}
</script>

<style scoped>
/* Job detail presentation */
.job-detail {
  background: #ffffff;
  padding: 1rem 1.2rem;
  border-radius: 8px;
  box-shadow: 0 4px 14px rgba(2,6,23,0.06);
  max-width: 800px;
}

p {
  margin: 0.45rem 0;
  color: #0f172a;
}

p strong, p b {
  color: #0b5fff;
}

/* key label formatting */
div > p::before {
  content: '';
}
</style>

