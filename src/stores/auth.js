// src/stores/auth.js
import { defineStore } from 'pinia'
import apiClient from '@/api/axios'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    isInitialized: false,
  }),
  getters: {
    isAuthenticated: (state) => !!state.user,
  },
  actions: {
    setUser(userData) {
      this.user = userData
      // Thêm log để biết store đã được cập nhật
      console.log('✅ AUTH STORE: User state updated.', { user: this.user })
    },
    async checkAuthStatus() {
      // Thêm log để biết hàm bắt đầu chạy
      console.log('🕵️‍♂️ AUTH STORE: Checking auth status...')
      try {
        const response = await apiClient.get('/users/me')
        this.setUser(response.data)
        console.log('🕵️‍♂️ AUTH STORE: Check successful, user is authenticated.')
      } catch (error) {
        this.user = null
        console.log('🕵️‍♂️ AUTH STORE: Check failed, user is NOT authenticated.')
      } finally {
        // SỬA LỖI QUAN TRỌNG: Đảm bảo isInitialized luôn được set thành true
        // sau khi quá trình kiểm tra hoàn tất, dù thành công hay thất bại.
        this.isInitialized = true
        console.log('🕵️‍♂️ AUTH STORE: Check finished, isInitialized is now TRUE.')
      }
    },
    logout() {
      this.user = null
      console.log('✅ AUTH STORE: User logged out.')
    },
  },
})
