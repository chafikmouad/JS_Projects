<template>
  <div>
    <form v-if="editableJob" @submit.prevent="save">
      <div v-for="(val, key) in editableJob" :key="key" v-if="key !== 'id'">
        <label :for="key">{{ key }}</label>
        <input :id="key" type="text" v-model="editableJob[key]" />
      </div>
      <div style="margin-top:12px">
        <button type="button" @click="cancel">Annuler</button>
        <button type="submit">Enregistrer</button>
      </div>
    </form>
    <div v-else>
      <p>Job introuvable.</p>
    </div>
  </div>
</template>

<script>
import jobs from './jobs.json';

export default {
  name: 'EditJob',
  props: ['id'],
  data() {
    return {
      editableJob: null
    }
  },
  created() {
    this.loadJob()
  },
  watch: {
    id() { this.loadJob() }
  },
  methods: {
    loadJob() {
      const idNum = Number(this.id)
      const found = jobs.find(item => item.id === idNum) || null
      // create a local editable copy
      this.editableJob = found ? JSON.parse(JSON.stringify(found)) : null
    },
    save() {
      // Persist changes: currently jobs.json is static; here just log and go back.
      console.log('Saved job (local only):', this.editableJob)
      this.$router.push({ name: 'Administrator' })
    },
    cancel() {
      this.$router.back()
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


div > p::before {
  content: '';
}
</style>

