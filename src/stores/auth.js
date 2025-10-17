// src/stores/auth.js

import { defineStore } from 'pinia'
import apiClient from '@/api/axios'
import router from '@/router' // QUAN TRỌNG: Import router để có thể điều hướng

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    isInitialized: false, // Để biết đã check auth lần đầu chưa
  }),

  getters: {
    // Getter này rất tiện lợi, không cần thay đổi
    isAuthenticated: (state) => !!state.user,
  },

  actions: {
    setUser(userData) {
      this.user = userData
    },

    async checkAuthStatus() {
      console.log('🕵️‍♂️ AUTH STORE: Bắt đầu kiểm tra trạng thái đăng nhập...')
      try {
        const response = await apiClient.get('/users/me')
        this.setUser(response.data)
        console.log('🕵️‍♂️ AUTH STORE: Kiểm tra thành công, người dùng đã xác thực.')
      } catch (error) {
        // Nếu API trả về lỗi (ví dụ: 401), set user về null
        this.setUser(null)
        console.log('🕵️‍♂️ AUTH STORE: Kiểm tra thất bại, người dùng chưa xác thực.')
      } finally {
        // SỬA LỖI QUAN TRỌNG: Gán giá trị đúng và log riêng
        this.isInitialized = true
        console.log('🕵️‍♂️ AUTH STORE: Hoàn tất kiểm tra, isInitialized giờ là TRUE.')
      }
    },

    // ***** BẮT ĐẦU NÂNG CẤP *****
    // Hoàn thiện chức năng đăng xuất
    async logout() {
      console.log('🕵️‍♂️ AUTH STORE: Bắt đầu quá trình đăng xuất...')
      try {
        // Bước 1: Gọi API để backend xóa cookie session
        await apiClient.post('/auth/logout')
        console.log('🕵️‍♂️ AUTH STORE: Backend đã xử lý logout thành công.')
      } catch (error) {
        // Ngay cả khi API thất bại, chúng ta vẫn phải đăng xuất ở client
        console.error('Lỗi khi gọi API logout, nhưng vẫn tiến hành logout ở client:', error)
      } finally {
        // Bước 2: Dọn dẹp state ở client
        this.setUser(null)

        // Bước 3: Đưa người dùng về trang đăng nhập
        // Dùng replace để người dùng không thể bấm "Back" quay lại trang cũ
        router.replace({ name: 'Login' })
      }
    },
    // ***** KẾT THÚC NÂNG CẤP *****
  },
})
