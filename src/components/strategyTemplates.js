// src/utils/strategyTemplates.js
import { INDICATOR_TYPES } from '@/utils/constants.js'

export const STRATEGY_TEMPLATES = [
  {
    id: 'trend', // <-- THAY ĐỔI
    name: 'Giao dịch theo xu hướng (Trend Following)',
    description: 'Sử dụng MA để lọc xu hướng và MACD để tìm điểm vào lệnh.',
    payload: {
      name: 'Chiến lược Theo xu hướng (Mẫu)',
      logic_structure: {
        filters: [
          {
            type: INDICATOR_TYPES.MA,
            params: { period: 50, type: 'SMA' },
            timeframe: '1d',
            name: 'Lọc theo xu hướng MA',
            longCondition: { operator: '>', value: 'price', enabled: true },
            shortCondition: { operator: '<', value: 'price', enabled: true },
          },
        ],
        signals: [
          {
            type: INDICATOR_TYPES.MACD,
            params: { fast: 12, slow: 26, signal: 9 },
            timeframe: '4h', // Timeframe chính thấp hơn timeframe lọc
            longCondition: { operator: 'cross_above', value: 'signal' },
            shortCondition: { operator: 'cross_below', value: 'signal' },
            role: 'reversal',
          },
        ],
        exits: [], // Ban đầu có thể để trống
      },
      // Có thể thêm cả risk management mặc định nếu muốn
      // risk_management: { ... }
    },
  },
  {
    id: 'range', // <-- THAY ĐỔI
    name: 'Giao dịch trong biên độ (Range Trading)',
    description: 'Sử dụng RSI để tìm các điểm quá mua/quá bán.',
    payload: {
      name: 'Chiến lược Giao dịch trong biên độ (Mẫu)',
      logic_structure: {
        filters: [],
        signals: [
          {
            type: INDICATOR_TYPES.RSI,
            params: { period: 14 },
            timeframe: '1h',
            longCondition: { operator: '<', value: 30 },
            shortCondition: { operator: '>', value: 70 },
            role: 'reversal',
          },
        ],
        exits: [
          // Ví dụ: Thoát lệnh mua khi RSI chạm 50
          {
            type: INDICATOR_TYPES.RSI,
            params: { period: 14 },
            timeframe: '1h',
            longCondition: { operator: '>', value: 50 },
            shortCondition: { operator: '<', value: 50 }, // Thoát lệnh bán khi RSI chạm 50
          },
        ],
      },
    },
  },
  // Thêm các mẫu khác ở đây trong tương lai
]
