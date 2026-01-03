/**
 * Point d'entrée principal de l'application
 * 
 * Initialise Vue 3 avec Vue Router et Bootstrap-Vue-Next
 */

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// Import Bootstrap et Bootstrap-Vue-Next
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap'
import { BootstrapVueNext } from 'bootstrap-vue-next'
import 'bootstrap-vue-next/dist/bootstrap-vue-next.css'

// Import des styles personnalisés
import './assets/styles/main.css'

// Création de l'application Vue
const app = createApp(App)

// Plugins
app.use(router)
app.use(BootstrapVueNext)

// Montage de l'application
app.mount('#app')

