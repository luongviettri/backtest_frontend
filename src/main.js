import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './assets/styles/main.css'
import App from './App.vue'
import router from './router'
import apiClient from './api/axios'

// --- BẮT ĐẦU TÍCH HỢP VUE-TOASTIFICATION ---
import Toast from 'vue-toastification'
// Import CSS của thư viện
import 'vue-toastification/dist/index.css'
// --- KẾT THÚC TÍCH HỢP ---

const app = createApp(App)

// Giữ nguyên việc cài đặt Pinia và Vue Router
app.use(createPinia())
app.use(router)

// --- BẮT ĐẦU TÍCH HỢP VUE-TOASTIFICATION ---
// Cấu hình các tùy chọn chung cho toast (tùy chọn)
const options = {
  position: 'top-right',
  timeout: 4000,
  closeOnClick: true,
  pauseOnFocusLoss: true,
  pauseOnHover: true,
  draggable: true,
  draggablePercent: 0.6,
  showCloseButtonOnHover: false,
  hideProgressBar: false,
  closeButton: 'button',
  icon: true,
  rtl: false,
}

app.use(Toast, options)
// --- KẾT THÚC TÍCH HỢP ---

// Giữ nguyên việc thiết lập Axios global
app.config.globalProperties.$axios = apiClient

app.mount('#app')
