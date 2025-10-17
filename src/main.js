import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './assets/styles/main.css'
import App from './App.vue'
import router from './router'
import apiClient from './api/axios'

const app = createApp(App)

// Giữ nguyên việc cài đặt Pinia và Vue Router
app.use(createPinia())
app.use(router)

// Giữ nguyên việc thiết lập Axios global
app.config.globalProperties.$axios = apiClient

app.mount('#app')
