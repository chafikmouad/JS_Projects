import { createRouter, createWebHistory } from 'vue-router'
import { auth } from '../firebase/config'
import Login from '../views/Login.vue'
import Events from '../views/Events.vue'

const routes = [
  {
    path: '/',
    redirect: '/events'
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresGuest: true }
  },
  {
    path: '/events',
    name: 'Events',
    component: Events,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Garde de navigation
router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const requiresGuest = to.matched.some(record => record.meta.requiresGuest)
  const user = auth.currentUser

  if (requiresAuth && !user) {
    next('/login')
  } else if (requiresGuest && user) {
    next('/events')
  } else {
    next()
  }
})

export default router

