<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { fetchMovies } from '../api/movies'
import type { Movie } from '../api/types'
import { useRouter } from 'vue-router'
import { API_BASE_URL } from '../api/client'

const movies = ref<Movie[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const router = useRouter()

const formatTime = (time: number) => {
  const minutes = Math.floor(time / 60);
  const secs = time % 60;
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

onMounted(async () => {
  loading.value = true
  try {
    movies.value = await fetchMovies()
  } catch (e) {
    error.value = 'Не удалось загрузить фильмы'
  } finally {
    loading.value = false
  }
})

function openMovie(movie: Movie) {
  router.push({ name: 'movie-details', params: { id: movie.id } })
}
</script>

<template>
  <div class="movies">
    <h1 class="movies__title">🎬 Фильмы</h1>
    
    <div v-if="loading" class="movies__loading">Загрузка…</div>
    <div v-else-if="error" class="movies__error">{{ error }}</div>
    
    <div v-else class="movies__grid">
      <div 
        v-for="m in movies" 
        :key="m.id" 
        class="movie-card"
        @click="openMovie(m)"
      >
        <div class="movie-card__poster">
          <img :src="`${API_BASE_URL}${m.posterImage}`" :alt="m.title" />
          <div class="movie-card__rating">{{ m.rating }}</div>
        </div>
        <div class="movie-card__info">
          <h3 class="movie-card__title">{{ m.title }}</h3>
          <div class="movie-card__meta">
            <span class="movie-card__meta-item">⏱ {{ formatTime(m.lengthMinutes) }}</span>
            <span v-if="m.year" class="movie-card__meta-item">📅 {{ m.year }}</span>
          </div>
          <p v-if="m.description" class="movie-card__description">{{ m.description }}</p>
          <button class="movie-card__button">Просмотреть сеансы</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.movies {
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

.movies__title {
  font-size: 2.5em;
  margin: 0 0 32px;
  color: #333;
  text-align: center;
  font-weight: bold;
}

.movies__loading, .movies__error {
  text-align: center;
  padding: 40px;
  font-size: 1.2em;
  color: #666;
}

.movies__error {
  color: #f44336;
  background: #ffebee;
  border-radius: 8px;
  margin: 20px 0;
}

.movies__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}

.movie-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
  display: flex;
  flex-direction: column;
}

.movie-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
}

.movie-card__poster {
  position: relative;
  width: 100%;
  height: 400px;
  overflow: hidden;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.movie-card__poster img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.movie-card:hover .movie-card__poster img {
  transform: scale(1.05);
}

.movie-card__rating {
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(255, 193, 7, 0.95);
  color: #333;
  padding: 6px 12px;
  border-radius: 20px;
  font-weight: bold;
  font-size: 0.9em;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.movie-card__info {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
}

.movie-card__title {
  font-size: 1.3em;
  margin: 0;
  color: #333;
  font-weight: bold;
}

.movie-card__meta {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.movie-card__meta-item {
  font-size: 0.9em;
  color: #666;
  display: flex;
  align-items: center;
  gap: 4px;
}

.movie-card__description {
  font-size: 0.95em;
  color: #555;
  line-height: 1.5;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.movie-card__button {
  margin-top: auto;
  padding: 12px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 1em;
}

.movie-card__button:hover {
  transform: scale(1.02);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

@media (max-width: 768px) {
  .movies__grid {
    grid-template-columns: 1fr;
  }
  
  .movies__title { font-size: 2em; }
}
</style>


