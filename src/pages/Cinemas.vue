<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { fetchCinemas } from '../api/cinemas'
import type { Cinema } from '../api/types'
import { useRouter } from 'vue-router'

const cinemas = ref<Cinema[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const router = useRouter()

onMounted(async () => {
  loading.value = true
  try {
    cinemas.value = await fetchCinemas()
  } catch (e) {
    error.value = 'Не удалось загрузить кинотеатры'
  } finally {
    loading.value = false
  }
})

function openCinema(cinema: Cinema) {
  router.push({ name: 'cinema-details', params: { id: cinema.id } })
}
</script>

<template>
  <div class="cinemas">
    <h1 class="cinemas__title">🎭 Кинотеатры</h1>
    
    <div v-if="loading" class="cinemas__loading">Загрузка…</div>
    <div v-else-if="error" class="cinemas__error">{{ error }}</div>
    
    <div v-else-if="!cinemas.length" class="cinemas__empty">
      Кинотеатры не найдены
    </div>
    
    <div v-else class="cinemas__grid">
      <div 
        v-for="c in cinemas" 
        :key="c.id" 
        class="cinema-card"
        @click="openCinema(c)"
      >
        <div class="cinema-card__icon">🎬</div>
        <div class="cinema-card__info">
          <h3 class="cinema-card__name">{{ c.name }}</h3>
          <p class="cinema-card__address">📍 {{ c.address }}</p>
        </div>
        <button class="cinema-card__button">Просмотреть сеансы →</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cinemas {
  animation: fadeIn 0.3s ease-in;
}

.cinemas__title {
  font-size: 2.5em;
  margin: 0 0 32px;
  color: #333;
  text-align: center;
  font-weight: bold;
}

.cinemas__loading, .cinemas__error, .cinemas__empty {
  text-align: center;
  padding: 40px;
  font-size: 1.2em;
  color: #666;
}

.cinemas__error {
  color: #f44336;
  background: #ffebee;
  border-radius: 8px;
}

.cinemas__empty {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.cinemas__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
}

.cinema-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.cinema-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
}

.cinema-card__icon {
  font-size: 3em;
  text-align: center;
}

.cinema-card__info {
  flex: 1;
}

.cinema-card__name {
  font-size: 1.4em;
  margin: 0 0 12px;
  color: #333;
  font-weight: bold;
}

.cinema-card__address {
  font-size: 1em;
  color: #666;
  margin: 0;
  line-height: 1.5;
}

.cinema-card__button {
  padding: 12px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 1em;
  width: 100%;
}

.cinema-card__button:hover {
  transform: scale(1.02);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

@media (max-width: 768px) {
  .cinemas__grid {
    grid-template-columns: 1fr;
  }
  
  .cinemas__title { font-size: 2em; }
}
</style>


