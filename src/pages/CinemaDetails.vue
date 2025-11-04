<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { fetchCinemaSessions } from '../api/cinemas'
import type { MovieSession } from '../api/types'

const route = useRoute()
const router = useRouter()
const sessions = ref<MovieSession[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

onMounted(async () => {
  const id = String(route.params.id)
  loading.value = true
  try {
    sessions.value = await fetchCinemaSessions(id)
  } catch (e) {
    error.value = 'Не удалось загрузить сеансы'
  } finally {
    loading.value = false
  }
})

function goToBooking(session: MovieSession) {
  router.push({ name: 'booking', params: { sessionId: session.id } })
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<template>
  <div class="details">
    <h1 class="details__title">🎭 Ближайшие сеансы</h1>
    
    <div v-if="loading" class="details__loading">Загрузка…</div>
    <div v-else-if="error" class="details__error">{{ error }}</div>
    
    <div v-else-if="sessions.length === 0" class="details__empty">
      Сеансы не найдены
    </div>
    
    <div v-else class="details__sessions">
      <div 
        v-for="s in sessions" 
        :key="s.id" 
        class="session-card"
      >
        <div class="session-card__info">
          <div class="session-card__time">
            <span class="session-card__time-icon">🕐</span>
            <span>{{ formatDate(s.startTime) }}</span>
          </div>
          <div v-if="s.price" class="session-card__price">{{ s.price }} ₽</div>
        </div>
        <button class="session-card__button" @click="goToBooking(s)">
          Выбрать места
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.details {
  animation: fadeIn 0.3s ease-in;
}

.details__title {
  font-size: 2.5em;
  margin: 0 0 32px;
  color: #333;
  text-align: center;
  font-weight: bold;
}

.details__loading, .details__error, .details__empty {
  text-align: center;
  padding: 40px;
  font-size: 1.2em;
  color: #666;
}

.details__error {
  color: #f44336;
  background: #ffebee;
  border-radius: 8px;
}

.details__empty {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.details__sessions {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.session-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
  transition: all 0.3s ease;
}

.session-card:hover {
  transform: translateX(4px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

.session-card__info {
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
}

.session-card__time {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.1em;
  color: #333;
  font-weight: 500;
}

.session-card__time-icon {
  font-size: 1.2em;
}

.session-card__price {
  font-size: 1.3em;
  font-weight: bold;
  color: #2196f3;
}

.session-card__button {
  padding: 12px 32px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 1em;
  white-space: nowrap;
}

.session-card__button:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

@media (max-width: 768px) {
  .session-card {
    flex-direction: column;
    align-items: stretch;
  }
  
  .session-card__button {
    width: 100%;
  }
}
</style>


