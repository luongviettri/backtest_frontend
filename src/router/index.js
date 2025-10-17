// src/router/index.js

import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import RegisterPage from '../views/Auth/RegisterPage.vue'
import LoginPage from '../views/Auth/LoginPage.vue'
import DashboardPage from '../views/Dashboard/DashboardPage.vue'
import DefaultLayout from '../layouts/DefaultLayout.vue'

const routes = [
  // --- NHÓM 1: CÁC ROUTE CÔNG KHAI (KHÔNG CẦN ĐĂNG NHẬP) ---
  {
    path: '/login',
    name: 'Login',
    component: LoginPage,
  },
  {
    path: '/register',
    name: 'Register',
    component: RegisterPage,
  },

  // --- NHÓM 2: CÁC ROUTE ĐƯỢC BẢO VỆ (YÊU CẦU ĐĂNG NHẬP) ---
  // Tất cả các route trong nhóm này sẽ sử dụng DefaultLayout
  {
    path: '/', // Sử dụng path gốc cho layout chính
    component: DefaultLayout,
    redirect: '/dashboard', // Nếu người dùng vào trang gốc, tự động chuyển đến dashboard
    meta: { requiresAuth: true }, // Đánh dấu toàn bộ nhóm này cần đăng nhập
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: DashboardPage,
        // Meta ở đây không cần thiết nữa vì đã có ở route cha
      },
      // Thêm các route cần bảo vệ khác vào đây
      // ví dụ: { path: 'profile', name: 'Profile', component: ProfilePage }
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// --- "NGƯỜI GÁC CỔNG" ĐÃ ĐƯỢC NÂNG CẤP ---
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // Logic kiểm tra một lần duy nhất khi tải ứng dụng (giữ nguyên, rất tốt!)
  if (!authStore.isInitialized) {
    await authStore.checkAuthStatus()
  }

  // SỬA LỖI LOGIC: Dùng `to.matched.some` để kiểm tra meta cho cả route cha và con
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)
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
