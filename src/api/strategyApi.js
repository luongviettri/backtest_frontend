// src/api/strategyApi.js

import apiClient from './axios' // Import "nhà bếp chính"

const strategyApi = {
  /**
   * Lấy danh sách tất cả chiến lược.
   */
  getStrategies() {
    return apiClient.get('/strategies')
  },

  /**
   * Lấy chi tiết một chiến lược bằng ID.
   * @param {string | number} id - ID của chiến lược.
   */
  getStrategyById(id) {
    return apiClient.get(`/strategies/${id}`)
  },

  /**
   * Tạo một chiến lược mới.
   * @param {object} strategyData - Dữ liệu của chiến lược mới.
   */
  createStrategy(strategyData) {
    return apiClient.post('/strategies', strategyData)
  },

  /**
   * Cập nhật một chiến lược đã có.
   * @param {string | number} id - ID của chiến lược cần cập nhật.
   * @param {object} strategyData - Dữ liệu cập nhật.
   */
  updateStrategy(id, strategyData) {
    return apiClient.put(`/strategies/${id}`, strategyData)
  },

  /**
   * Xóa một chiến lược.
   * @param {string | number} id - ID của chiến lược cần xóa.
   */
  deleteStrategy(id) {
    return apiClient.delete(`/strategies/${id}`)
  },
}

export default strategyApi
