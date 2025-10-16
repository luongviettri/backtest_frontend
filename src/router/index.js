// src/router/index.js

import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth' // Import store của bạn
import RegisterPage from '../views/Auth/RegisterPage.vue'
import LoginPage from '../views/Auth/LoginPage.vue'
import DashboardPage from '../views/Dashboard/DashboardPage.vue'
import DefaultLayout from '../layouts/DefaultLayout.vue'

const routes = [
  {
    path: '/',
    redirect: '/login',
  },
  {
    path: '/register',
    name: 'Register',
    component: RegisterPage,
    meta: { requiresAuth: false }, // Đánh dấu các trang không cần đăng nhập
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginPage,
    meta: { requiresAuth: false }, // Đánh dấu các trang không cần đăng nhập
  },
  // Các route cần layout và cần được bảo vệ
  {
    path: '/',
    component: DefaultLayout,
    meta: { requiresAuth: true }, // Đánh dấu các trang cần đăng nhập
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: DashboardPage,
      },
      // Các trang khác cần bảo vệ
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// <<< "NGƯỜI GÁC CỔNG" THÔNG MINH HƠN >>>
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // THAY ĐỔI QUAN TRỌNG NHẤT:
  // Chỉ gọi API checkAuthStatus một lần duy nhất khi ứng dụng vừa tải.
  if (!authStore.isInitialized) {
    // Đợi cho việc kiểm tra ban đầu hoàn tất.
    await authStore.checkAuthStatus()
  }

  // Từ đây, isInitialized đã là true, và chúng ta có thể tin tưởng vào
  // trạng thái isAuthenticated trong store mà không cần gọi lại API.
  const requiresAuth = to.meta.requiresAuth
  const isAuthenticated = authStore.isAuthenticated

  if (requiresAuth && !isAuthenticated) {
    // Nếu route yêu cầu xác thực mà người dùng chưa đăng nhập -> về Login.
    next({ name: 'Login' })
  } else if ((to.name === 'Login' || to.name === 'Register') && isAuthenticated) {
    // Nếu đã đăng nhập mà cố vào trang Login/Register -> về Dashboard.
    next({ name: 'Dashboard' })
  } else {
    // Các trường hợp còn lại -> cho phép đi tiếp.
    next()
  }
})

export default router
