// src/api/axios.js

import axios from 'axios'
import router from '../router' // Import router để có thể điều hướng

// Tạo một instance axios với cấu hình cơ bản
const apiClient = axios.create({
  // SỬA ĐỔI QUAN TRỌNG: Đổi 127.0.0.1 thành localhost
  baseURL: 'http://localhost:8000/api/v1',

  // Cài đặt này vẫn cực kỳ quan trọng
  withCredentials: true,
})

// Cấu hình Interceptor giữ nguyên, nó đang hoạt động rất tốt
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      console.log('Chưa xác thực hoặc token hết hạn. Đang chuyển về trang Login...')
      router.push({ name: 'Login' })
    }
    return Promise.reject(error)
  },
)

export default apiClient
