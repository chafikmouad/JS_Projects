import { createRouter, createWebHistory } from 'vue-router'
import User from '../views/User.vue'
import Administrator from '../views/Administrator.vue'

const routes = [
  { path: '/', name: 'User', component: User },
  { path: '/administrator', name: 'Administrator', component: Administrator },
  { path: '/job/:id', name: 'JobDetail', component: () => import('../views/JobDetail.vue'), props: true },
  { path: '/job/:id/edit', name: 'EditJob', component: () => import('../views/EditJob.vue'), props: true },
  { path: '/add-job', name: 'AddJob', component: () => import('../views/AddJob.vue') },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
