// src/api/backtestApi.js

import apiClient from './axios' // Import "nhà bếp chính"

const backtestApi = {
  /**
   * Bắt đầu một job backtest cho một chiến lược.
   * @param {string | number} strategyId - ID của chiến lược.
   * @param {object} config - Cấu hình backtest (pair, timeframe).
   */
  startBacktest(strategyId, config) {
    return apiClient.post(`/backtest/${strategyId}`, config)
  },
  // --- THÊM MỚI ---
  /**
   * Bắt đầu một job backtest "trực tiếp" với định nghĩa chiến lược được gửi lên.
   * Không yêu cầu chiến lược phải được lưu trước.
   * @param {object} strategyPayload - Toàn bộ đối tượng chứa định nghĩa chiến lược.
   */
  startLiveBacktest(strategyPayload) {
    // Endpoint mới này cần được tạo ở backend, ví dụ: /backtest/live
    return apiClient.post('/backtest/live', strategyPayload)
  },
  // --- KẾT THÚC THÊM MỚI ---
  /**
   * Lấy kết quả của một job backtest bằng job ID.
   * @param {string} jobId - ID của job được trả về khi bắt đầu.
   */
  getBacktestResult(jobId) {
    return apiClient.get(`/backtest/results/${jobId}`)
  },
}

export default backtestApi
