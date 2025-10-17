// frontend/src/services/strategyApi.js

// 1. IMPORT instance axios đã được cấu hình chung từ file của bạn
import apiClient from '@/api/axios' // Dùng @ để có đường dẫn tuyệt đối

// ======================================================================================
// 2. ĐỊNH NGHĨA các hàm gọi API cho 'strategies' bằng cách sử dụng apiClient đã import
//    Không cần tạo mới, không cần interceptor ở đây nữa!
// ======================================================================================

export default {
  // GET /strategies/
  getStrategies() {
    return apiClient.get('/strategies/')
  },

  // GET /strategies/{id}
  getStrategyById(id) {
    return apiClient.get(`/strategies/${id}`)
  },

  // POST /strategies/
  createStrategy(strategyData) {
    // apiClient đã tự động xử lý CSRF token cho bạn
    return apiClient.post('/strategies/', strategyData)
  },

  // PUT /strategies/{id}
  updateStrategy(id, strategyData) {
    // apiClient đã tự động xử lý CSRF token cho bạn
    return apiClient.put(`/strategies/${id}`, strategyData)
  },

  // DELETE /strategies/{id}
  deleteStrategy(id) {
    // apiClient đã tự động xử lý CSRF token cho bạn
    return apiClient.delete(`/strategies/${id}`)
  },
}
