<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { fetchMyBookings, payBooking } from '../api/bookings'
import { fetchSettings } from '../api/settings'
import { fetchSession } from '../api/sessions'
import type { Booking } from '../api/types'

const bookings = ref<Booking[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const paymentWindowSeconds = ref<number>(600)
const now = ref<number>(Date.now())
const sessionById = ref<Record<number | string, { startTime: string }>>({})
let timer: number | undefined

async function loadSessionsFor(bookingsList: Booking[]) {
  try {
    const ids = Array.from(new Set(bookingsList.map(b => b.movieSessionId)))
    if (ids.length === 0) return

    const sessions = await Promise.all(ids.map(id => fetchSession(String(id))))
    sessionById.value = Object.fromEntries(sessions.map(s => [s.id, s]))
  } catch (e) {
    console.error('Ошибка загрузки сеансов:', e)
  }
}

async function refreshBookings() {
  try {
    const b = await fetchMyBookings()
    bookings.value = b
    await loadSessionsFor(b)
  } catch (e) {
    console.error('Ошибка обновления билетов:', e)
  }
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

function remainingSeconds(b: Booking): number {
  if (!b.bookedAt) return 0
  const bookedAt = new Date(b.bookedAt).getTime()
  if (isNaN(bookedAt)) return 0
  const deadline = bookedAt + paymentWindowSeconds.value * 1000
  const remaining = Math.floor((deadline - now.value) / 1000)
  return Math.max(0, remaining)
}

function isExpired(b: Booking): boolean {
  if (b.isPaid || !b.bookedAt) return false
  const bookedAt = new Date(b.bookedAt).getTime()
  if (isNaN(bookedAt)) return false
  const deadline = bookedAt + paymentWindowSeconds.value * 1000
  return deadline < now.value
}

onMounted(async () => {
  loading.value = true
  error.value = null

  try {
    const [b, settings] = await Promise.all([
      fetchMyBookings(),
      fetchSettings()
    ])

    bookings.value = b
    paymentWindowSeconds.value = settings.paymentWindowSeconds || 600
    await loadSessionsFor(b)
    now.value = Date.now()
    timer = window.setInterval(() => {
      now.value = Date.now()
      bookings.value = bookings.value.filter(b => !isExpired(b))
    }, 1000)
  } catch (e) {
    error.value = 'Не удалось загрузить билеты'
    console.error('Ошибка загрузки:', e)
  } finally {
    loading.value = false
  }
})

onBeforeUnmount(() => {
  if (timer) {
    window.clearInterval(timer)
    timer = undefined
  }
})

const unpaid = computed(() =>
    bookings.value.filter(b => !b.isPaid && !isExpired(b))
)

const future = computed(() =>
    bookings.value.filter(b => {
      if (!b.isPaid) return false
      const s = sessionById.value[b.movieSessionId]
      if (!s) return false
      return new Date(s.startTime).getTime() > now.value
    })
)

const past = computed(() =>
    bookings.value.filter(b => {
      if (!b.isPaid) return false
      const s = sessionById.value[b.movieSessionId]
      if (!s) return false
      return new Date(s.startTime).getTime() <= now.value
    })
)

async function pay(b: Booking) {
  try {
    await payBooking(b.id)
    await refreshBookings()
  } catch (e) {
    console.error('Ошибка оплаты:', e)
    error.value = 'Не удалось оплатить билет'
  }
}

function getSessionTime(movieSessionId: number | string): string {
  const s = sessionById.value[movieSessionId]
  if (!s?.startTime) return '—'
  return new Date(s.startTime).toLocaleString('ru-RU')
}
</script>

<template>
  <div class="tickets">
    <h1 class="tickets__title">🎫 Мои билеты</h1>

    <div v-if="loading" class="tickets__loading">Загрузка…</div>
    <div v-else-if="error" class="tickets__error">{{ error }}</div>

    <div v-else class="tickets__columns">
      <section>
        <h3>Неоплаченные</h3>
        <div v-if="!unpaid.length" class="tickets__empty">Нет неоплаченных билетов</div>
        <div v-for="ticket in unpaid" :key="ticket.id" class="ticket ticket--unpaid">
          <div class="ticket__id">Билет #{{ ticket.id.slice(0, 8) }}</div>
          <div class="ticket__session">Сеанс: {{ ticket.movieSessionId }}</div>
          <div class="ticket__time">Начало: {{ getSessionTime(ticket.movieSessionId) }}</div>
          <div class="ticket__seats">
            Места: {{ ticket.seats.map(s => `Ряд ${s.rowNumber}, Место ${s.seatNumber}`).join(', ') }}
          </div>
          <div class="ticket__timer" :class="{ 'ticket__timer--warning': remainingSeconds(ticket) < 60 }">
            Осталось: {{ formatTime(remainingSeconds(ticket)) }}
          </div>
          <button class="ticket__pay-button" @click="pay(ticket)">Оплатить</button>
        </div>
      </section>

      <section>
        <h3>Будущие</h3>
        <div v-if="!future.length" class="tickets__empty">Нет будущих билетов</div>
        <div v-for="ticket in future" :key="ticket.id" class="ticket ticket--paid">
          <div class="ticket__id">Билет #{{ ticket.id.slice(0, 8) }}</div>
          <div class="ticket__session">Сеанс: {{ ticket.movieSessionId }}</div>
          <div class="ticket__time">Начало: {{ getSessionTime(ticket.movieSessionId) }}</div>
          <div class="ticket__seats">
            Места: {{ ticket.seats.map(s => `Ряд ${s.rowNumber}, Место ${s.seatNumber}`).join(', ') }}
          </div>
        </div>
      </section>

      <section>
        <h3>Прошедшие</h3>
        <div v-if="!past.length" class="tickets__empty">Нет прошедших билетов</div>
        <div v-for="ticket in past" :key="ticket.id" class="ticket ticket--past">
          <div class="ticket__id">Билет #{{ ticket.id.slice(0, 8) }}</div>
          <div class="ticket__session">Сеанс: {{ ticket.movieSessionId }}</div>
          <div class="ticket__time">Начало: {{ getSessionTime(ticket.movieSessionId) }}</div>
          <div class="ticket__seats">
            Места: {{ ticket.seats.map(s => `Ряд ${s.rowNumber}, Место ${s.seatNumber}`).join(', ') }}
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.tickets {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.tickets__title {
  font-size: 2.5em;
  margin: 0 0 32px;
  color: #333;
  text-align: center;
  font-weight: bold;
}

.tickets__columns {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

section {
  display: flex;
  flex-direction: column;
}

section h3 {
  margin: 0 0 12px;
  font-size: 1.2em;
}

.tickets__empty {
  padding: 16px;
  text-align: center;
  color: #666;
  font-style: italic;
}

.ticket {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.ticket.ticket--unpaid {
  border-color: #ff9800;
  background-color: #fff3e0;
}

.ticket.ticket--paid {
  border-color: #4caf50;
  background-color: #f1f8f4;
}

.ticket.ticket--past {
  border-color: #9e9e9e;
  background-color: #f5f5f5;
  opacity: 0.8;
}

.ticket__id {
  font-weight: bold;
  font-size: 0.9em;
  color: #333;
}

.ticket__session,
.ticket__time {
  font-size: 0.9em;
  color: #666;
}

.ticket__seats {
  font-size: 0.9em;
  color: #444;
  margin: 4px 0;
}

.ticket__timer {
  font-weight: bold;
  font-size: 1.1em;
  color: #2196f3;
}

.ticket__timer.ticket__timer--warning {
  color: #f44336;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

.ticket__pay-button {
  margin-top: 8px;
  padding: 8px 16px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.2s;
}

.ticket__pay-button:hover {
  background-color: #45a049;
}

.ticket__pay-button:active {
  background-color: #3e8e41;
}

.tickets__error {
  color: #f44336;
  padding: 12px;
  background-color: #ffebee;
  border-radius: 4px;
  margin-bottom: 16px;
}

@media (max-width: 768px) {
  .tickets__columns {
    grid-template-columns: 1fr;
  }
}
</style>


