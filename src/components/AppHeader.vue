<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const isAuthed = computed(() => auth.isAuthenticated)
const router = useRouter()

function onLogout() {
  auth.logout()
  router.push({ name: 'movies' })
}
</script>

<template>
  <nav class="nav">
    <div class="nav__brand">🎬 Cinema</div>
    <div class="nav__links">
      <RouterLink to="/movies" class="nav__link">Фильмы</RouterLink>
      <RouterLink to="/cinemas" class="nav__link">Кинотеатры</RouterLink>
      <RouterLink to="/tickets" class="nav__link">Мои билеты</RouterLink>
    </div>
    <div class="nav__auth">
      <template v-if="!isAuthed">
        <RouterLink to="/register" class="nav__link">Регистрация</RouterLink>
        <RouterLink to="/login" class="nav__link nav__link--primary">Вход</RouterLink>
      </template>
      <button v-else @click="onLogout" class="nav__link nav__link--secondary">Выход</button>
    </div>
  </nav>
  
</template>

<style scoped>
.nav {
  max-width: 1200px;
  margin: 0 auto;
  padding: 16px 24px;
  display: flex;
  gap: 24px;
  align-items: center;
}

.nav__brand {
  font-size: 1.5em;
  font-weight: bold;
  color: #2196f3;
  margin-right: auto;
}

.nav__links {
  display: flex;
  gap: 16px;
  flex: 1;
  justify-content: center;
}

.nav__auth {
  display: flex;
  gap: 12px;
  align-items: center;
}

.nav__link {
  text-decoration: none;
  color: #333;
  font-weight: 500;
  padding: 8px 16px;
  border-radius: 8px;
  transition: all 0.2s;
  cursor: pointer;
  border: none;
  background: none;
  font-size: 1em;
}

.nav__link:hover {
  background: rgba(33, 150, 243, 0.1);
  color: #2196f3;
}

.nav__link.router-link-active {
  color: #2196f3;
  background: rgba(33, 150, 243, 0.15);
}

.nav__link--primary {
  background: #2196f3;
  color: white !important;
}

.nav__link--primary:hover {
  background: #1976d2;
}

.nav__link--secondary {
  background: #f44336;
  color: white !important;
}

.nav__link--secondary:hover {
  background: #d32f2f;
}

@media (max-width: 768px) {
  .nav {
    flex-direction: column;
    gap: 12px;
  }
  
  .nav__brand {
    margin-right: 0;
  }
  
  .nav__links {
    flex-wrap: wrap;
    justify-content: center;
  }
}
</style>


