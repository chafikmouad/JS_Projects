<template>
  <div class="container">
    <div class="add-post">
      <h2>Ajouter un job</h2>
      <form @submit.prevent="addJob">
        <div class="form-row">
          <label for="titre">Titre</label>
          <input id="titre" v-model="form.titre" required />
        </div>

        <div class="form-row">
          <label for="entreprise">Entreprise</label>
          <input id="entreprise" v-model="form.entreprise" required />
        </div>

        <div class="form-row">
          <label for="description">Description</label>
          <textarea id="description" v-model="form.description" required></textarea>
        </div>

        <div class="form-row">
          <label for="lieu">Lieu</label>
          <input id="lieu" v-model="form.lieu" />
        </div>

        <div class="form-row">
          <label for="type">Type (ex: CDI, CDD)</label>
          <input id="type" v-model="form.type" />
        </div>

        <div class="form-row">
          <label for="salaire">Salaire</label>
          <input id="salaire" v-model="form.salaire" />
        </div>

        <div class="form-row">
          <label for="contact">Contact</label>
          <input id="contact" v-model="form.contact" />
        </div>

        <div class="form-actions">
          <button type="button" class="btn ghost" @click="reset">Annuler</button>
          <button type="submit" class="btn primary">Ajouter</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import jobsData from './jobs.json'

export default {
  name: 'AddJob',
  data() {
    return {
      jobs: [],
      form: {
        titre: '',
        entreprise: '',
        description: '',
        lieu: '',
        type: '',
        salaire: '',
        contact: ''
      }
    }
  },
  created() {
    const stored = localStorage.getItem('jobs')
    this.jobs = stored ? JSON.parse(stored) : (Array.isArray(jobsData) ? jobsData.slice() : [])
  },
  methods: {
    addJob() {
      const newJob = {
        id: Date.now(),
        ...this.form
      }
      this.jobs.push(newJob)
      localStorage.setItem('jobs', JSON.stringify(this.jobs))
      this.$router.push({ name: 'Administrator' })
    },
    reset() {
      this.form = {
        titre: '',
        entreprise: '',
        description: '',
        lieu: '',
        type: '',
        salaire: '',
        contact: ''
      }
    }
  }
}
</script>

<style scoped>
.container {
  max-width: 820px;
  margin: 24px auto;
  padding: 0 16px;
}

.add-post {
  background: #ffffff;
  padding: 18px;
  border-radius: 10px;
  box-shadow: 0 6px 18px rgba(2,6,23,0.04);
  border: 1px solid rgba(2,6,23,0.03);
}

.add-post h2 {
  margin: 0 0 14px 0;
  font-size: 1.25rem;
  color: #0b5fff;
}

/* form */
.form-row {
  display: flex;
  flex-direction: column;
  margin-bottom: 12px;
}
.form-row label {
  font-size: 0.95rem;
  color: #374151;
  margin-bottom: 6px;
}
.form-row input,
.form-row textarea {
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid rgba(2,6,23,0.06);
  font-size: 0.95rem;
  background: #fff;
  outline: none;
}
.form-row input:focus,
.form-row textarea:focus {
  border-color: rgba(11,95,255,0.22);
  box-shadow: 0 6px 18px rgba(11,95,255,0.06);
}
.form-row textarea {
  min-height: 120px;
  resize: vertical;
}

/* actions */
.form-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 8px;
}
.btn {
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid rgba(2,6,23,0.06);
  background: transparent;
  cursor: pointer;
  font-weight: 600;
}
.btn.primary {
  background: #0b5fff;
  color: #fff;
  border-color: transparent;
}
.btn.ghost {
  background: transparent;
  color: #374151;
}


@media (max-width: 700px) {
  .add-post { padding: 14px; }
  .form-actions { flex-direction: column-reverse; }
  .form-actions .btn { width: 100%; }
}
</style>