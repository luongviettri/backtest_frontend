// src/stores/strategy.js

import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { INDICATOR_TYPES, CONDITION_ZONES } from '@/utils/constants'
// --- THÊM MỚI: Import các hàm API ---
import strategyApi from '@/api/strategyApi'
import router from '@/router'
// --- THÊM MỚI: Import toast ---
import { useToast } from 'vue-toastification'

export const useStrategyStore = defineStore('strategy', () => {
  const toast = useToast() // Khởi tạo toast
  // --- STATE ---
  const strategyId = ref(null) // <-- THÊM MỚI: ID của chiến lược đang chỉnh sửa
  const strategyName = ref('Chiến lược Mới')
  const strategyType = ref('custom') // 'custom', 'trend', 'range'
  // [THAY ĐỔI] Cấu trúc state mới: Bộ lọc, Tín hiệu, Thoát lệnh
  const filters = ref([])
  const signals = ref([])
  const exits = ref([])

  const selectedCondition = ref(null)
  const pair = ref('BTC/USDT')
  const timeframe = ref('1d')
  const MAX_CONDITIONS_FREE = 3
  const backtestResults = ref(null)
  const isShowingResults = ref(false)
  // [THAY ĐỔI] Cập nhật giá trị mặc định và thêm state cho đơn vị
  const stopLoss = ref(5)
  const takeProfit = ref(10)
  const stopLossUnit = ref('pnl') // 'pnl' hoặc 'percentage'
  const takeProfitUnit = ref('pnl') // 'pnl' hoặc 'percentage'

  const isSaving = ref(false)
  const lastSavedAt = ref(null)
  const saveError = ref(null)

  /**
   * Getter này tạo ra một đối tượng "sạch" chứa định nghĩa chiến lược hiện tại,
   * sẵn sàng để gửi đến API. Nó loại bỏ các thuộc tính chỉ dùng ở frontend như 'id'.
   */
  const strategyPayload = computed(() => {
    const payload = {
      name: strategyName.value,
      pair: pair.value,
      type: strategyType.value, // <-- THÊM MỚI: Lưu loại builder
      // Cấu trúc payload mới
      logic_structure: {
        filters: filters.value.map(({ id, ...rest }) => rest),
        signals: signals.value.map(({ id, ...rest }) => rest),
        exits: exits.value.map(({ id, ...rest }) => rest),
      },
    }

    const riskManagement = {}
    if (stopLoss.value !== null && stopLoss.value !== '') {
      riskManagement.stop_loss = {
        type: stopLossUnit.value,
        value: parseFloat(stopLoss.value),
      }
    }
    if (takeProfit.value !== null && takeProfit.value !== '') {
      riskManagement.take_profit = {
        type: takeProfitUnit.value,
        value: parseFloat(takeProfit.value),
      }
    }

    if (Object.keys(riskManagement).length > 0) {
      payload.risk_management = riskManagement
    }

    return payload
  })

  // --- ACTIONS ---

  // --- BẮT ĐẦU NÂNG CẤP LỚN ---

  /**
   * Action chính cho việc tự động lưu.
   * Nó sẽ tự quyết định gọi API tạo mới hay cập nhật.
   */
  async function autoSaveStrategy() {
    if (isSaving.value) return

    isSaving.value = true
    saveError.value = null
    console.log('[AUTO-SAVE] Bắt đầu lưu chiến lược...')

    try {
      const payload = strategyPayload.value

      // --- YÊU CẦU: Log payload trước khi gửi ---
      console.log('[AUTO-SAVE] Payload chuẩn bị gửi đi:', JSON.stringify(payload, null, 2))

      let response

      if (strategyId.value) {
        // --- TRƯỜNG HỢP 1: CẬP NHẬT chiến lược đã có ---
        console.log(`[AUTO-SAVE] Đang cập nhật chiến lược ID: ${strategyId.value}`)
        response = await strategyApi.updateStrategy(strategyId.value, payload)
      } else {
        // --- TRƯỜNG HỢP 2: TẠO MỚI chiến lược ---
        console.log('[AUTO-SAVE] Đang tạo chiến lược mới...')
        response = await strategyApi.createStrategy(payload)

        // QUAN TRỌNG: Sau khi tạo thành công, lấy ID trả về từ backend
        const newId = response.data.id // Giả sử backend trả về { id: '...', ... }
        if (newId) {
          strategyId.value = newId
          console.log(`[AUTO-SAVE] Tạo thành công, ID mới là: ${newId}`)
          // Cập nhật URL trình duyệt mà không reload trang, để lần lưu tiếp theo là UPDATE
          router.replace({ name: 'StrategyBuilder', params: { id: newId } })
        }
      }

      lastSavedAt.value = new Date()
      console.log('[AUTO-SAVE] Lưu thành công lúc:', lastSavedAt.value.toLocaleTimeString())
    } catch (error) {
      console.error('[AUTO-SAVE] Lỗi khi lưu chiến lược:', error)
      saveError.value = 'Không thể lưu chiến lược. Vui lòng thử lại.'
    } finally {
      isSaving.value = false
    }
  }

  /**
   * Action dành riêng cho nút bấm thủ công, sẽ hiển thị thông báo.
   */
  async function manualSaveStrategy() {
    // Gọi hàm lưu chính
    await autoSaveStrategy()

    // Sau khi lưu xong, kiểm tra xem có lỗi không và hiển thị thông báo tương ứng
    if (saveError.value) {
      toast.error(saveError.value)
    } else {
      toast.success('Lưu chiến lược thành công!')
    }
  }
  /**
   * Tải chiến lược từ API hoặc reset về trạng thái tạo mới.
   * @param {string | null} id - ID chiến lược từ URL
   */
  async function loadStrategy(id) {
    if (id) {
      console.log(`PINIA STORE: Đang tải dữ liệu chiến lược ID: ${id}...`)
      // TODO: Thêm logic hiển thị loading
      try {
        const response = await strategyApi.getStrategyById(id)
        const loadedStrategy = response.data

        strategyId.value = loadedStrategy.id
        strategyName.value = loadedStrategy.name || 'Chiến lược chưa đặt tên'
        strategyType.value = loadedStrategy.type || 'custom' // <-- THÊM MỚI: Tải loại builder
        pair.value = loadedStrategy.pair || 'BTC/USDT' // Giữ lại pair
        // Timeframe chính giờ sẽ được suy ra từ tín hiệu, không cần tải ở đây

        // [SỬA ĐỔI] Tải dữ liệu SL/TP nếu có
        // Giờ đây chúng ta cần đọc giá trị từ object lồng nhau
        stopLoss.value = loadedStrategy.risk_management?.stop_loss?.value ?? 5
        stopLossUnit.value = loadedStrategy.risk_management?.stop_loss?.type ?? 'pnl'
        takeProfit.value = loadedStrategy.risk_management?.take_profit?.value ?? 10
        takeProfitUnit.value = loadedStrategy.risk_management?.take_profit?.type ?? 'pnl'

        if (loadedStrategy.rules && typeof loadedStrategy.rules === 'object') {
          // [THAY ĐỔI] Tải dữ liệu từ cấu trúc logic_structure mới
          const logic = loadedStrategy.logic_structure || {}
          const mapWithId = (items) =>
            (items || []).map((item) => ({ ...item, id: Date.now() + Math.random() }))

          filters.value = mapWithId(logic.filters)
          signals.value = mapWithId(logic.signals)
          exits.value = mapWithId(logic.exits)

          // [THAY ĐỔI] Cập nhật timeframe chính dựa trên tín hiệu đầu tiên
          if (signals.value.length > 0 && signals.value[0].timeframe) {
            timeframe.value = signals.value[0].timeframe
          }
        } else if (loadedStrategy.rules) {
          // TODO: Thêm logic chuyển đổi từ cấu trúc cũ sang mới nếu cần
          console.warn('Đang tải chiến lược có cấu trúc cũ. Cần logic chuyển đổi.')
        }
        // Reset các trạng thái khác
        selectedCondition.value = null
        clearBacktestResults()
        lastSavedAt.value = new Date() // Coi như vừa được "lưu" khi tải xong
      } catch (error) {
        console.error('Lỗi khi tải chiến lược:', error)
        // Có thể chuyển hướng về trang danh sách hoặc trang lỗi 404
        router.replace({ name: 'StrategyList' })
      }
    } else {
      // Nếu không có ID, reset mọi thứ để tạo chiến lược mới
      resetStrategy()
    }
  }

  /**
   * Lưu kết quả backtest thành công vào store và ra lệnh cho UI hiển thị.
   * @param {object} results - Dữ liệu kết quả từ API.
   */
  function setBacktestResults(results) {
    if (!results || typeof results !== 'object' || Object.keys(results).length === 0) {
      console.error(
        'PINIA STORE: Nhận được kết quả backtest không hợp lệ (rỗng hoặc không phải object):',
        results,
      )
      backtestResults.value = null
      isShowingResults.value = false
      return
    }

    let standardizedResults = {}

    if (results.overview) {
      // Trường hợp 1: Dữ liệu có cấu trúc lồng nhau { overview: {...} }
      console.log('PINIA STORE: Nhận được kết quả dạng lồng nhau, sử dụng trực tiếp.', results)
      standardizedResults = results
    } else {
      // Trường hợp 2: Dữ liệu phẳng -> Tự chuẩn hóa về dạng lồng nhau
      console.log('PINIA STORE: Nhận được kết quả dạng phẳng, đang chuẩn hóa...', results)
      standardizedResults = {
        overview: results, // Toàn bộ object phẳng trở thành 'overview'
        trade_history: results.trades || [], // Lấy 'trades' từ object phẳng
      }
    }

    backtestResults.value = standardizedResults
    isShowingResults.value = true
  }

  /**
   * Dọn dẹp kết quả backtest cũ và ẩn panel kết quả.
   * Được gọi trước khi bắt đầu một lần chạy backtest mới.
   */
  function clearBacktestResults() {
    console.log('PINIA STORE: Đang dọn dẹp kết quả backtest cũ.')
    backtestResults.value = null
    isShowingResults.value = false
  }

  function resetStrategy() {
    console.log('PINIA STORE: Đang reset state về mặc định.')
    strategyId.value = null // <-- Quan trọng
    strategyType.value = 'custom' // <-- THÊM MỚI: Reset về mặc định
    strategyName.value = 'Chiến lược Mới'
    filters.value = []
    signals.value = []
    exits.value = []

    selectedCondition.value = null
    pair.value = 'BTC/USDT'
    timeframe.value = '1d'

    // [SỬA ĐỔI] Reset cả SL/TP
    stopLoss.value = 5
    takeProfit.value = 10
    stopLossUnit.value = 'pnl'
    takeProfitUnit.value = 'pnl'

    clearBacktestResults() // Cũng dọn dẹp kết quả backtest khi reset
    isSaving.value = false
    lastSavedAt.value = null
    saveError.value = null
  }

  function addCondition(zoneType, indicatorType) {
    // [THAY ĐỔI] Xác định đúng danh sách cần thêm vào
    let list
    if (zoneType === CONDITION_ZONES.FILTERS) {
      list = filters.value
    } else if (zoneType === CONDITION_ZONES.SIGNALS) {
      list = signals.value
    } else if (zoneType === CONDITION_ZONES.EXITS) {
      list = exits.value
    } else {
      return // Không xác định được khu vực
    }

    // --- BẮT ĐẦU GIẢI PHÁP CHO VẤN ĐỀ 1 ---
    // Kiểm tra xem chỉ báo này đã tồn tại trong danh sách hay chưa
    const isDuplicate = list.some((condition) => condition.type === indicatorType)
    if (isDuplicate) {
      toast.warning(`Chỉ báo '${indicatorType}' đã được thêm vào điều kiện này rồi.`)
      return // Dừng hàm, không cho phép thêm
    }
    // --- KẾT THÚC GIẢI PHÁP ---

    if (list.length >= MAX_CONDITIONS_FREE) {
      toast.warning(
        `Bạn chỉ có thể thêm tối đa ${MAX_CONDITIONS_FREE} điều kiện ở phiên bản miễn phí.`,
      )
      return
    }

    const newCondition = createDefaultCondition(indicatorType, zoneType)
    list.push(newCondition)
    selectCondition(newCondition)
  }

  function deleteCondition(zoneType, conditionId) {
    // [THAY ĐỔI] Xác định đúng danh sách để xóa
    const filterOut = (list) => list.filter((c) => c.id !== conditionId)

    if (zoneType === CONDITION_ZONES.FILTERS) {
      filters.value = filterOut(filters.value)
    } else if (zoneType === CONDITION_ZONES.SIGNALS) {
      signals.value = filterOut(signals.value)
    } else if (zoneType === CONDITION_ZONES.EXITS) {
      exits.value = filterOut(exits.value)
    }

    if (selectedCondition.value?.id === conditionId) {
      selectedCondition.value = null
    }
  }

  function selectCondition(condition) {
    selectedCondition.value = condition
  }

  function updateStrategyName(name) {
    strategyName.value = name
  }

  // --- HELPER FUNCTION ---
  function createDefaultCondition(indicatorType, zoneType) {
    // Cấu trúc mặc định chung
    const newBlock = {
      id: Date.now() + Math.random(),
      type: indicatorType,
      params: {},
    }

    // [THAY ĐỔI] Gán timeframe chính cho tín hiệu và thoát lệnh
    newBlock.timeframe = timeframe.value

    switch (indicatorType) {
      case INDICATOR_TYPES.RSI:
        newBlock.params = { period: 14 }
        if (zoneType === CONDITION_ZONES.SIGNALS) {
          newBlock.longCondition = { operator: '<', value: 30 }
          newBlock.shortCondition = { operator: '>', value: 70 }
          newBlock.role = 'reversal' // Mặc định
        } else if (zoneType === CONDITION_ZONES.EXITS) {
          // Điều kiện thoát lệnh mặc định cho RSI
          // Thoát Long khi RSI > 70, Thoát Short khi RSI < 30
          newBlock.longCondition = { operator: '>', value: 70 }
          newBlock.shortCondition = { operator: '<', value: 30 }
        }
        break
      case INDICATOR_TYPES.MA:
        newBlock.params = { period: 50, type: 'SMA' }
        // Áp dụng cho cả Bộ lọc và Tín hiệu
        if (zoneType === CONDITION_ZONES.FILTERS) {
          // [THAY ĐỔI] Tạo một khối điều kiện kép cho bộ lọc xu hướng
          newBlock.name = 'Lọc theo xu hướng MA' // Thêm tên để dễ nhận biết
          newBlock.longCondition = { operator: '>', value: 'price', enabled: true } // Mặc định bật lọc cho lệnh Mua
          newBlock.shortCondition = { operator: '<', value: 'price', enabled: true } // Mặc định bật lọc cho lệnh Bán
          newBlock.timeframe = '1d'
        } else if (zoneType === CONDITION_ZONES.SIGNALS) {
          newBlock.longCondition = { operator: 'cross_above', value: 'price' }
          newBlock.shortCondition = { operator: 'cross_below', value: 'price' }
          newBlock.role = 'reversal'
        } else if (zoneType === CONDITION_ZONES.EXITS) {
          // Thoát Long khi giá cắt xuống dưới MA, và ngược lại
          newBlock.longCondition = { operator: 'cross_below', value: 'price' }
          newBlock.shortCondition = { operator: 'cross_above', value: 'price' }
        }
        break
      case INDICATOR_TYPES.MACD:
        newBlock.params = { fast: 12, slow: 26, signal: 9 }
        if (zoneType === CONDITION_ZONES.SIGNALS) {
          newBlock.longCondition = { operator: 'cross_above', value: 'signal' }
          newBlock.shortCondition = { operator: 'cross_below', value: 'signal' }
          newBlock.role = 'reversal'
        } else if (zoneType === CONDITION_ZONES.EXITS) {
          // Thoát Long khi MACD cắt xuống dưới Signal, và ngược lại
          newBlock.longCondition = { operator: 'cross_below', value: 'signal' }
          newBlock.shortCondition = { operator: 'cross_above', value: 'signal' }
        }
        break
      default:
        break
    }

    return newBlock
  }

  // --- THÊM MỚI ACTION NÀY ---
  /**
   * Áp dụng một mẫu chiến lược vào state hiện tại.
   * Thao tác này sẽ ghi đè lên chiến lược đang có.
   * @param {object} template - The full template object.
   */
  function applyTemplate(template) {
    console.log(`PINIA STORE: Đang áp dụng mẫu '${template.name}'...`)

    // 1. Reset lại state hiện tại về trạng thái sạch
    // Chúng ta không gọi resetStrategy() hoàn toàn vì không muốn mất ID nếu đang sửa
    filters.value = []
    signals.value = []
    exits.value = []
    selectedCondition.value = null

    // 2. Cập nhật các thông tin cơ bản từ mẫu
    strategyName.value = template.payload.name
    strategyType.value = template.id // <-- THÊM MỚI: Gán loại builder từ ID của mẫu
    const logic = template.payload.logic_structure || {}

    // 3. Hàm tiện ích để thêm ID duy nhất cho các khối logic
    const mapWithId = (items) =>
      (items || []).map((item) => ({ ...item, id: Date.now() + Math.random() }))

    // 4. Điền các khối logic từ mẫu vào state
    filters.value = mapWithId(logic.filters)
    signals.value = mapWithId(logic.signals)
    exits.value = mapWithId(logic.exits)

    // 5. Cập nhật timeframe chính dựa trên tín hiệu đầu tiên của mẫu
    if (signals.value.length > 0 && signals.value[0].timeframe) {
      timeframe.value = signals.value[0].timeframe
    }

    toast.success(`Đã áp dụng mẫu: ${template.name}`)
  }

  /**
   * Action để các component builder chuyên biệt có thể đặt loại chiến lược.
   * @param {string} type - Loại chiến lược ('trend', 'range', etc.)
   */
  function setStrategyType(type) {
    strategyType.value = type
  }

  // --- EXPORTS ---
  return {
    // State
    strategyId,
    strategyName,
    strategyType, // <-- THÊM MỚI
    filters,
    signals,
    exits,
    selectedCondition,
    pair,
    timeframe,
    backtestResults,
    isShowingResults,
    isSaving, // <-- Thêm
    lastSavedAt, // <-- Thêm
    saveError, // <-- Thêm
    // [SỬA ĐỔI] export state mới
    stopLoss,
    stopLossUnit,
    takeProfit,
    takeProfitUnit,

    // Getters
    strategyPayload,

    // Actions
    addCondition,
    deleteCondition,
    selectCondition,
    updateStrategyName,
    loadStrategy, // <-- Thay đổi
    resetStrategy, // <-- Thay đổi
    setBacktestResults,
    clearBacktestResults,
    autoSaveStrategy,
    manualSaveStrategy, // <-- Thay đổi
    applyTemplate, // <-- THÊM EXPORT CHO ACTION MỚI
    setStrategyType, // <-- THÊM MỚI
  }
})
