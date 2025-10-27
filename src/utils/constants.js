// src/utils/constants.js

/**
 * Định nghĩa các loại chỉ báo kỹ thuật.
 * Giúp tránh lỗi gõ sai và dễ dàng quản lý danh sách chỉ báo.
 */
export const INDICATOR_TYPES = {
  RSI: 'RSI',
  MA: 'MA',
  MACD: 'MACD',
  BB: 'BB',
  STOCHASTIC: 'Stochastic',
  ATR: 'ATR',
  VOLUME: 'Volume',
  AO: 'AO',
  WILLIAMS_R: 'WilliamsR',
  OBV: 'OBV',
  ADX: 'ADX',
  PARABOLIC_SAR: 'ParabolicSAR',
}

/**
 * Định nghĩa các vùng điều kiện (Mua/Bán).
 */
export const CONDITION_ZONES = {
  // [THAY ĐỔI] Cấu trúc khu vực mới
  FILTERS: 'filters',
  SIGNALS: 'signals',
  EXITS: 'exits',
}
