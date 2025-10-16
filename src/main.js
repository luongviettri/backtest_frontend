import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './assets/styles/main.css'
import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/auth' // Import store
const app = createApp(App)

app.use(createPinia())
app.use(router) // Cứ dùng router ngay lập tức

app.mount('#app')
