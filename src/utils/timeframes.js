// src/utils/timeframes.js

// Định nghĩa tất cả các timeframe có sẵn và gán một "cấp bậc" (rank) để so sánh
// Rank càng cao, timeframe càng lớn.
export const TIME_FRAMES = [
  { value: '1w', label: '1 tuần', rank: 6, isFilterable: true },
  { value: '1d', label: '1 ngày', rank: 5, isFilterable: true },
  { value: '4h', label: '4 giờ', rank: 4, isFilterable: true },
  { value: '1h', label: '1 giờ', rank: 3, isFilterable: true },
  { value: '15m', label: '15 phút', rank: 2, isFilterable: false },
  { value: '1m', label: '1 phút', rank: 1, isFilterable: false },
]

/**
 * Hàm tiện ích để lấy thông tin của một timeframe bằng giá trị của nó
 * @param {string} value - Ví dụ: '4h', '1d'
 * @returns {object | undefined}
 */
export const getTimeframeByValue = (value) => TIME_FRAMES.find((tf) => tf.value === value)
