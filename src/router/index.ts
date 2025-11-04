import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import Movies from '../pages/Movies.vue'
import MovieDetails from '../pages/MovieDetails.vue'
import Cinemas from '../pages/Cinemas.vue'
import CinemaDetails from '../pages/CinemaDetails.vue'
import Booking from '../pages/Booking.vue'
import MyTickets from '../pages/MyTickets.vue'
import Login from '../pages/Login.vue'
import Register from '../pages/Register.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/movies' },
    { path: '/movies', name: 'movies', component: Movies },
    { path: '/movies/:id', name: 'movie-details', component: MovieDetails, props: true },
    { path: '/cinemas', name: 'cinemas', component: Cinemas },
    { path: '/cinemas/:id', name: 'cinema-details', component: CinemaDetails, props: true },
    { path: '/booking/:sessionId', name: 'booking', component: Booking, props: true },
    { path: '/tickets', name: 'tickets', component: MyTickets, meta: { requiresAuth: true } },
    { path: '/login', name: 'login', component: Login },
    { path: '/register', name: 'register', component: Register },
  ],
})

router.beforeEach((to) => {
  const auth = useAuthStore()
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
  return true
})

export default router
