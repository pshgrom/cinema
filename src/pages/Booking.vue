<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { fetchSession, bookSeats } from '../api/sessions'
import type { MovieSession } from '../api/types'
import { useAuthStore } from '../stores/auth'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const session = ref<MovieSession | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)
const selected = ref<Array<{ row: number; col: number }>>([])

const grid = computed(() => {
  if (!session.value) return [] as Array<Array<'free'|'booked'|'selected'>>
  const rows = session.value.seats.rows
  const cols = session.value.seats.cols
  const booked = new Set(session.value.bookedSeats.map(s => `${s.row}:${s.col}`))
  const chosen = new Set(selected.value.map(s => `${s.row}:${s.col}`))
  return Array.from({ length: rows }, (_, r) => (
    Array.from({ length: cols }, (_, c) => {
      const key = `${r}:${c}`
      if (booked.has(key)) return 'booked'
      if (chosen.has(key)) return 'selected'
      return 'free'
    })
  ))
})

onMounted(async () => {
  const sessionId = String(route.params.sessionId ?? route.params.id)
  loading.value = true
  try {
    const data = await fetchSession(sessionId)
    // Преобразуем bookedSeats из API формата (rowNumber/seatNumber, 1-based) в внутренний (row/col, 0-based)
    const bookedSeats = (data.bookedSeats || []).map((seat: any) => ({
      row: (seat.rowNumber || seat.row || 0) - 1,
      col: (seat.seatNumber || seat.seat || 0) - 1,
    })).filter((s: any) => s.row >= 0 && s.col >= 0)
    
    session.value = {
      ...data,
      seats: {
        rows: data.seats.rows,
        cols: data.seats.seatsPerRow,
      },
      bookedSeats,
    } as MovieSession
  } catch (e) {
    error.value = 'Не удалось загрузить данные сеанса'
  } finally {
    loading.value = false
  }
})

function toggleSeat(row: number, col: number) {
  if (!session.value) return
  const isBooked = session.value.bookedSeats.some((s) => s.row === row && s.col === col)
  if (isBooked) return
  const idx = selected.value.findIndex((s) => s.row === row && s.col === col)
  if (idx >= 0) selected.value.splice(idx, 1)
  else selected.value.push({ row, col })
}

async function submitBooking() {
  if (!auth.isAuthenticated) {
    router.push({ name: 'login', query: { redirect: router.currentRoute.value.fullPath } })
    return
  }
  if (!session.value || selected.value.length === 0) return
  loading.value = true
  try {
    const resp  = await bookSeats(session.value.id, selected.value)
    console.warn('resp', resp)
    router.push({ name: 'tickets' })
  } catch (e) {
    console.log('e', e)
    if(e.response?.data?.message) {
      error.value = e.response.data.message
      return
    }
    error.value = 'Не удалось забронировать места'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="booking">
    <h2 class="booking__title">Выбор мест</h2>
    <div v-if="loading" class="booking__loading">Загрузка…</div>
    <div v-else-if="error" class="booking__error">{{ error }}</div>
    <div v-else-if="session" class="booking__hall">
      <div class="booking__screen">ЭКРАН</div>
      <div class="booking__legend">
        <span class="booking__legend-item"><span class="booking__legend-seat booking__legend-seat--free"></span> Свободно</span>
        <span class="booking__legend-item"><span class="booking__legend-seat booking__legend-seat--selected"></span> Выбрано</span>
        <span class="booking__legend-item"><span class="booking__legend-seat booking__legend-seat--booked"></span> Занято</span>
      </div>
      <div v-for="(row, rIdx) in grid" :key="rIdx" class="booking__row">
        <div class="booking__row-number">{{ rIdx + 1 }}</div>
        <button
          v-for="(cell, cIdx) in row"
          :key="cIdx"
          class="booking__seat"
          :data-state="cell"
          @click="toggleSeat(rIdx, cIdx)"
        >
          {{ cIdx + 1 }}
        </button>
      </div>
      <div class="booking__actions">
        <div class="booking__selected-info" v-if="selected.length > 0">
          Выбрано мест: {{ selected.length }}
        </div>
        <button class="booking__button" :disabled="selected.length===0" @click="submitBooking">Забронировать</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.booking__hall {
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: center;
  padding: 20px;
}

.booking__screen {
  width: 80%;
  padding: 12px;
  background: linear-gradient(to bottom, #333, #555);
  color: white;
  text-align: center;
  font-weight: bold;
  border-radius: 8px;
  margin-bottom: 8px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}

.booking__legend {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-bottom: 8px;
}

.booking__legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.9em;
}

.booking__legend-seat {
  width: 24px;
  height: 20px;
  border-radius: 4px;
  border: 1px solid #ccc;
  display: inline-block;
}

.booking__legend-seat--free {
  background: #fff;
}

.booking__legend-seat--selected {
  background: #4caf50;
  border-color: #3e8e41;
}

.booking__legend-seat--booked {
  background: #ccc;
  border-color: #999;
}

.booking__row {
  display: flex;
  gap: 6px;
  align-items: center;
}

.booking__row-number {
  width: 30px;
  text-align: right;
  font-weight: bold;
  color: #666;
  font-size: 0.9em;
}

.booking__seat {
  width: 40px;
  height: 36px;
  border-radius: 6px;
  border: 2px solid #ccc;
  cursor: pointer;
  background: #fff;
  color: #333;
  font-weight: 500;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.booking__seat:hover:not([data-state="booked"]) {
  border-color: #4caf50;
  transform: scale(1.05);
}

.booking__seat[data-state="booked"] {
  background: #ccc;
  color: #666;
  cursor: not-allowed;
  border-color: #999;
  opacity: 0.6;
}

.booking__seat[data-state="selected"] {
  background: #4caf50;
  color: #fff;
  border-color: #3e8e41;
  box-shadow: 0 2px 4px rgba(76, 175, 80, 0.3);
}

.booking__seat[data-state="free"] {
  background: #fff;
  color: #333;
}

.booking__actions {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
  width: 100%;
}

.booking__selected-info {
  font-weight: bold;
  color: #4caf50;
  font-size: 1.1em;
}

.booking__button {
  padding: 12px 32px;
  font-size: 1.1em;
  background: #2196f3;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  transition: background 0.2s;
}

.booking__button:hover:not(:disabled) {
  background: #1976d2;
}

.booking__button:disabled {
  background: #ccc;
  cursor: not-allowed;
  opacity: 0.6;
}
</style>


