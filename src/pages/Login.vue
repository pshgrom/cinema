<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const username = ref('')
const password = ref('')
const error = ref<string | null>(null)

async function submit() {
  error.value = null
  try {
    await auth.login(username.value, password.value)
    const redirect = (route.query.redirect as string) || '/tickets'
    router.replace(redirect)
  } catch (e) {
    error.value = auth.error
  }
}
</script>

<template>
  <div class="auth">
    <div class="auth__container">
      <div class="auth__header">
        <h1>Вход</h1>
        <p>Добро пожаловать обратно!</p>
      </div>
      
      <div v-if="error" class="auth__error">{{ error }}</div>
      
      <form @submit.prevent="submit" class="auth__form">
        <div class="auth__form-group">
          <label>Логин</label>
          <input 
            v-model="username" 
            type="text"
            minlength="8" 
            required 
            placeholder="Введите логин"
            class="auth__input"
          />
        </div>
        
        <div class="auth__form-group">
          <label>Пароль</label>
          <input 
            v-model="password" 
            type="password" 
            minlength="8" 
            required 
            placeholder="Введите пароль"
            class="auth__input"
          />
        </div>
        
        <button type="submit" :disabled="auth.loading" class="auth__submit-button">
          {{ auth.loading ? 'Вход...' : 'Войти' }}
        </button>
      </form>
      
      <div class="auth__footer">
        <p>Нет аккаунта? 
          <RouterLink to="/register" class="auth__link">Зарегистрироваться</RouterLink>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 200px);
  padding: 40px 20px;
}

.auth__container {
  background: white;
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 420px;
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.auth__header {
  text-align: center;
  margin-bottom: 32px;
}

.auth__header h1 {
  font-size: 2em;
  margin: 0 0 8px;
  color: #333;
  font-weight: bold;
}

.auth__header p {
  color: #666;
  margin: 0;
  font-size: 1em;
}

.auth__error {
  background: #ffebee;
  color: #c62828;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 24px;
  font-size: 0.95em;
  border-left: 4px solid #f44336;
}

.auth__form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.auth__form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.auth__form-group label {
  font-weight: 500;
  color: #333;
  font-size: 0.95em;
}

.auth__input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1em;
  transition: all 0.2s;
  box-sizing: border-box;
}

.auth__input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.auth__submit-button {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.1em;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 8px;
}

.auth__submit-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.auth__submit-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.auth__footer {
  text-align: center;
  margin-top: 24px;
  color: #666;
  font-size: 0.95em;
}

.auth__link {
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
}

.auth__link:hover {
  color: #764ba2;
  text-decoration: underline;
}
</style>


