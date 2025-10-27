// src/api/axios.js

import axios from 'axios'
import router from '../router'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
})

// "Gián điệp" Request Interceptor được nâng cấp
apiClient.interceptors.request.use(
  (config) => {
    // --- BẮT ĐẦU SỬA LỖI ---
    // Chỉ thực hiện kiểm tra CSRF nếu request KHÔNG phải là request đăng nhập/đăng ký
    const authRoutes = ['/auth/login', '/auth/google-jwt', '/users/register']
    if (authRoutes.includes(config.url)) {
      // Nếu là request xác thực, bỏ qua và gửi đi luôn
      return config
    }
    // --- KẾT THÚC SỬA LỖI ---

    // Hàm tiện ích để đọc giá trị từ cookie
    function getCookie(name) {
      const value = `; ${document.cookie}`
      const parts = value.split(`; ${name}=`)
      if (parts.length === 2) return parts.pop().split(';').shift()
    }

    if (!['GET', 'HEAD', 'OPTIONS', 'TRACE'].includes(config.method.toUpperCase())) {
      // ▼▼▼ SỬA TÊN COOKIE Ở ĐÂY ▼▼▼
      const csrfToken = getCookie('fastapi_csrf_token') // Đọc đúng tên cookie

      if (csrfToken) {
        // ▼▼▼ ĐẢM BẢO TÊN HEADER LÀ ĐÚNG NHƯ DƯỚI ĐÂY ▼▼▼
        config.headers['X-CSRF-Token'] = csrfToken // <-- Sử dụng tên backend yêu cầu
        console.log('[AXIOS INTERCEPTOR] Đã đính kèm CSRF token vào header X-CSRF-Token.')
      } else {
        // Log này không nên xuất hiện nữa sau khi sửa tên cookie
        console.warn(
          '[AXIOS INTERCEPTOR] Không tìm thấy CSRF cookie "fastapi_csrf_token" để đính kèm.',
        )
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Interceptor xử lý lỗi 401 (giữ nguyên)
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      console.log('[AXIOS INTERCEPTOR] Nhận lỗi 401, đang chuyển hướng về trang Login...')
      router.push({ name: 'Login' })
    }
    return Promise.reject(error)
  },
)

export default apiClient
