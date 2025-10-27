// src/stores/strategy.js

import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { INDICATOR_TYPES, CONDITION_ZONES } from '@/utils/constants'
import { useAuthStore } from '@/stores/auth' // <-- THÊM MỚI
// --- THÊM MỚI: Import các hàm API ---
import strategyApi from '@/api/strategyApi'
import router from '@/router'
// --- THÊM MỚI: Import toast ---
import { useToast } from 'vue-toastification'
import { v4 as uuidv4 } from 'uuid'

// ▼▼▼ DI CHUYỂN CÁC HÀM HELPER RA NGOÀI HOẶC LÊN ĐẦU HÀM SETUP ▼▼▼

const mapOperator = (op) => {
  // Hàm này có vẻ ổn, giữ nguyên hoặc bổ sung nếu backend có thêm operator
  switch (op) {
    case 'cross_above':
      return 'crossover'
    case 'cross_below':
      return 'crossunder'
    default:
      return op
  }
}

const mapRiskUnit = (frontendUnit) => {
  if (frontendUnit === 'percentage') return 'percent'
  // Giả sử 'pnl' tương ứng với 'amount' hoặc đơn vị tiền tệ backend dùng
  if (frontendUnit === 'pnl') return 'amount' // Hoặc 'usd', 'usdt' tùy backend
  return 'percent' // Mặc định
}

const mapPositionSizingType = (frontendType) => {
  if (frontendType === 'percentage_of_capital') return 'percent_capital' // Hoặc giá trị backend yêu cầu
  if (frontendType === 'fixed_amount') return 'fixed_amount'
  return 'fixed_amount' // Mặc định
}

// Hàm này phức tạp, nên để gần nơi sử dụng hoặc đảm bảo nó được định nghĩa trước
const extractLeafBlocks = (node) => {
  let leaves = []
  if (!node || !node.children) return []
  for (const child of node.children) {
    if (child.children) {
      // Nếu là group, duyệt tiếp
      leaves = leaves.concat(extractLeafBlocks(child))
    } else {
      // Nếu là lá (khối điều kiện)
      leaves.push(child)
    }
  }
  // ▼▼▼ THÊM LOG Ở ĐÂY (TRƯỚC KHI RETURN) ▼▼▼
  console.log('[extractLeafBlocks] Extracted Leaves:', JSON.stringify(leaves, null, 2))
  return leaves
}

// Hàm tìm kiếm một khối (lá hoặc nhóm) trong cây bằng ID
const findBlockById = (node, id) => {
  if (!node) return null
  if (node.id === id) {
    return node // Tìm thấy
  }
  if (node.children) {
    for (const child of node.children) {
      const found = findBlockById(child, id)
      if (found) return found // Tìm thấy trong cây con
    }
  }
  return null // Không tìm thấy
}

// Hàm tìm toán tử của group cha chứa một child ID
const findParentGroupOperator = (node, childId) => {
  if (!node || !node.children) return null

  // Kiểm tra xem childId có nằm trong các con trực tiếp của node này không
  if (node.children.some((child) => child.id === childId)) {
    return node.type // Trả về 'AND' hoặc 'OR' của group cha
  }

  // Nếu không, tìm kiếm đệ quy trong các group con
  for (const child of node.children) {
    if (child.children) {
      const found = findParentGroupOperator(child, childId)
      if (found) return found
    }
  }
  return null // Không tìm thấy
}

export const useStrategyStore = defineStore('strategy', () => {
  const toast = useToast() // Khởi tạo toast
  // --- STATE ---
  const strategyId = ref(null) // <-- THÊM MỚI: ID của chiến lược đang chỉnh sửa
  const strategyName = ref('Chiến lược Mới')
  // --> THÊM MỚI: Thêm state cho description
  const strategyDescription = ref('')
  const strategyType = ref('custom') // 'custom', 'trend', 'range'

  // ===== BẮT ĐẦU THAY ĐỔI CẤU TRÚC STATE SANG DẠNG CÂY =====
  // Hàm factory để tạo một nhóm điều kiện gốc
  const createRootGroup = (id) => ({
    id: id,
    type: 'AND', // Mặc định là AND
    children: [],
  })

  // Thay vì mảng, giờ đây mỗi khu vực là một object cây logic
  const filters = ref(createRootGroup('root-filters'))
  const signals = ref(createRootGroup('root-signals'))
  // ===== KẾT THÚC THAY ĐỔI CẤU TRÚC STATE =====

  const initialCapital = ref(10000) // Mặc định là 10,000
  const backtestStartDate = ref(
    new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toISOString().split('T')[0],
  ) // Mặc định 1 năm trước
  const backtestEndDate = ref(new Date().toISOString().split('T')[0]) // Mặc định hôm nay
  // --- KẾT THÚC BỔ SUNG ---
  const selectedCondition = ref(null)
  const pair = ref('BTC/USDT')
  const MAX_CONDITIONS_FREE = 3
  const backtestResults = ref(null)
  const isShowingResults = ref(false)
  // [THAY ĐỔI] Cập nhật giá trị mặc định và thêm state cho đơn vị
  const stopLoss = ref(5)
  const takeProfit = ref(10)
  const stopLossUnit = ref('pnl') // 'pnl' hoặc 'percentage'
  // [THAY ĐỔI] Timeframe chính giờ sẽ là một state riêng, không phụ thuộc vào điều kiện
  const timeframe = ref('4h')

  // [SỬA ĐỔI] Đổi đơn vị mặc định cho SL/TP
  const takeProfitUnit = ref('pnl') // 'pnl' hoặc 'percentage'

  // --- BẮT ĐẦU THÊM STATE MỚI CHO RỦI RO MỖI LỆNH ---
  const riskPerTradeType = ref('percentage_of_capital') // 'percentage_of_capital' hoặc 'fixed_amount'
  const riskPerTradeValuePercentage = ref(2) // Giá trị mặc định 2%
  const riskPerTradeValueFixed = ref(20) // Giá trị mặc định 20 USDT
  // --- KẾT THÚC THÊM STATE MỚI ---

  const isSaving = ref(false)
  const lastSavedAt = ref(null)
  const saveError = ref(null)

  // =================================================================
  // ===== CÁC HÀM HELPER BIẾN ĐỔI DỮ LIỆU (Xem xét và tinh chỉnh) =====
  // =================================================================

  /**
   * [QUAN TRỌNG] Hàm này cần được viết lại hoàn toàn để map state frontend
   * sang cấu trúc MẢNG `conditions` mà backend yêu cầu cho signals.
   *
   * @param {object} frontendConditionBlock - Khối điều kiện từ state
   * @returns {Array} Mảng các đối tượng điều kiện cho backend, hoặc null/[] nếu không hợp lệ.
   */
  /**
   * Chuyển đổi MỘT khối điều kiện frontend thành MẢNG các điều kiện backend CHO MỘT PHÍA (long/short).
   * Đặc biệt xử lý kết hợp RSI + EMA Trend Filter.
   * @param {object} block - Khối điều kiện từ state frontend (ví dụ: item trong signals.value.children).
   * @param {'long' | 'short'} side - Chỉ định map cho điều kiện 'long' hay 'short'.
   * @param {object} currentFiltersState - State hiện tại của filters.value (để tìm kiếm MA filter).
   * @returns {Array} Mảng các object điều kiện backend { type, params, timeframe, operator, value }, hoặc [] nếu không map được.
   */
  const mapFrontendBlockToBackendConditions = (block, side, currentFiltersState) => {
    const conditions = []
    const conditionConfig = side === 'long' ? block.longCondition : block.shortCondition

    // Chỉ thực hiện nếu có cấu hình cho 'side' này
    // HOẶC nếu là filter đơn (ADX) dùng block.condition
    if (!conditionConfig && !block.condition) {
      return []
    }

    switch (block.type) {
      case INDICATOR_TYPES.RSI:
        if (conditionConfig) {
          // 1. Tạo điều kiện RSI cơ bản - Sử dụng timeframe '15m' CỐ ĐỊNH
          console.log(`[MAPPER - RSI ${side}] Mapping RSI block:`, JSON.stringify(block))
          conditions.push({
            type: 'rsi',
            params: { length: block.params?.period || 14 },
            timeframe: '15m', // <<< HARDCODE timeframe cho RSI
            operator: mapOperator(conditionConfig.operator),
            value: conditionConfig.value,
          })
          console.log(`[MAPPER - RSI ${side}] Added RSI condition.`)

          // 2. Tìm kiếm MA/EMA Trend Filter trong state `filters`
          const filterBlocks = extractLeafBlocks(currentFiltersState) // Lấy tất cả filter blocks
          const trendFilterBlock = filterBlocks.find(
            (fBlock) =>
              fBlock.type === INDICATOR_TYPES.MA &&
              fBlock.comparisonTarget === 'close' &&
              fBlock.params?.type?.toUpperCase() === 'EMA', // Chỉ tìm EMA
            // Bạn có thể thêm điều kiện kiểm tra length=200, timeframe='1h' nếu muốn chặt chẽ hơn
            // && fBlock.params?.length === 200
            // && fBlock.timeframe === '1h'
          )

          if (trendFilterBlock) {
            console.log(
              `[MAPPER - RSI ${side}] Found linked EMA Trend Filter:`,
              JSON.stringify(trendFilterBlock),
            )
            const filterSideConfig =
              side === 'long' ? trendFilterBlock.longCondition : trendFilterBlock.shortCondition

            if (filterSideConfig && filterSideConfig.operator) {
              // 3. Tạo điều kiện Close vs EMA - Sử dụng timeframe CỐ ĐỊNH
              const emaCondition = {
                type: 'close',
                params: {},
                timeframe: '15m', // <<< HARDCODE timeframe cho close
                operator: mapOperator(filterSideConfig.operator), // '&gt;' hoặc '&lt;' từ filter
                value: {
                  type: 'ema', // Đã kiểm tra là EMA ở trên
                  params: { length: trendFilterBlock.params.length || 200 },
                  timeframe: '1h', // <<< HARDCODE timeframe cho EMA
                },
              }
              // 4. Thêm điều kiện EMA vào mảng
              conditions.push(emaCondition)
              console.log(`[MAPPER - RSI ${side}] Added EMA condition.`)
            } else {
              console.warn(
                `[MAPPER - RSI ${side}] EMA Trend Filter tìm thấy nhưng thiếu config operator cho side '${side}'.`,
              )
            }
          } else {
            console.log(
              `[MAPPER - RSI ${side}] No EMA Trend Filter found in filters state to link.`,
            )
          }
        }
        break // Kết thúc case RSI

      // === CÁC CASE KHÁC (MA, MACD, ADX...) ===
      // Logic map cho các chỉ báo khác đứng một mình (nếu có) giữ nguyên
      // Ví dụ: Nếu bạn kéo thả MACD vào signals, nó sẽ được map ở đây
      case INDICATOR_TYPES.MACD:
        if (conditionConfig) {
          console.log(`[MAPPER - MACD ${side}] Mapping MACD block.`)
          conditions.push({
            /* ... cấu trúc backend cho MACD ... */
          })
        }
        break

      // Quan trọng: Không map MA Filter ở đây nữa vì nó đã được xử lý bên trong case RSI
      // case INDICATOR_TYPES.MA:
      //    // ... có thể để trống hoặc chỉ xử lý MA signal (nếu có) ...
      //    console.log(`[MAPPER - MA ${side}] MA block ignored in signals mapping (handled by RSI).`);
      //    break;

      default:
        console.warn(`[MAPPER] Chưa hỗ trợ map cho type: ${block.type} ở side: ${side}`)
        return []
    }
    return conditions
  }

  // =================================================================
  // ===== GETTER CHÍNH ĐỂ TẠO PAYLOAD LƯU CHIẾN LƯỢC =====
  // =================================================================
  const strategySavePayload = computed(() => {
    // ... (code getter như trước, giờ nó có thể gọi mapFrontendBlockToBackendConditions và các helper khác) ...
    const logic_structure = {
      // ▼▼▼ LUÔN ĐẶT LÀ NULL ▼▼▼
      filters: null,
      signals: [],
      long_exits: null,
      short_exits: null,
    }

    const signalLeafBlocks = extractLeafBlocks(signals.value)

    logic_structure.signals = signalLeafBlocks
      .filter((block) => block.type === INDICATOR_TYPES.RSI) // Chỉ map khối RSI trong signals
      .map((block) => {
        // ▼▼▼ TRUYỀN filters.value vào hàm map ▼▼▼
        const backendLongConditions = mapFrontendBlockToBackendConditions(
          block,
          'long',
          filters.value,
        )
        const backendShortConditions = mapFrontendBlockToBackendConditions(
          block,
          'short',
          filters.value,
        )

        return {
          id: block.id || uuidv4(),
          role: block.role || 'entry',
          type: 'custom_signal', // Theo mẫu backend
          longCondition: {
            logical_operator: 'AND',
            conditions: backendLongConditions,
          },
          shortCondition: {
            logical_operator: 'AND',
            conditions: backendShortConditions,
          },
        }
      })
      .filter(
        (signal) =>
          signal.longCondition.conditions.length > 0 || signal.shortCondition.conditions.length > 0,
      )

    if (logic_structure.signals.length === 0) {
      logic_structure.signals = null
    }

    // Phần map filters bị loại bỏ hoặc comment đi
    /*
    const filterLeafBlocks = extractLeafBlocks(filters.value);
    const mappedFilters = filterLeafBlocks.map(block => { ... });
    if (mappedFilters.length > 0) {
        logic_structure.filters = mappedFilters;
    }
    */

    const risk_management = {
      /* ... */ stop_loss: null,
      take_profit: null,
      position_sizing: null,
    }
    if (stopLoss.value !== null && stopLoss.value > 0) {
      risk_management.stop_loss = {
        unit: mapRiskUnit(stopLossUnit.value), // Gọi helper đã định nghĩa
        value: -Math.abs(parseFloat(stopLoss.value)),
      }
    }
    // ... (map take profit, position sizing tương tự) ...
    if (takeProfit.value !== null && takeProfit.value > 0) {
      risk_management.take_profit = {
        unit: mapRiskUnit(takeProfitUnit.value),
        value: Math.abs(parseFloat(takeProfit.value)),
      }
    }

    risk_management.position_sizing = {
      type: mapPositionSizingType(riskPerTradeType.value), // Gọi helper đã định nghĩa
      value:
        riskPerTradeType.value === 'fixed_amount'
          ? parseFloat(riskPerTradeValueFixed.value)
          : parseFloat(riskPerTradeValuePercentage.value),
    }

    const payload = {
      name: strategyName.value || 'Chưa đặt tên',
      schema_version: 2,
      logic_structure: logic_structure,
      risk_management: risk_management,
      /* ... phần risk management giữ nguyên ... */
    }

    console.log('--- GENERATED SAVE PAYLOAD ---')
    console.log(JSON.stringify(payload, null, 2))
    return payload
  }) // Kết thúc getter

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
      const fullPayload = strategySavePayload.value

      let response

      if (strategyId.value) {
        // --- TRƯỜNG HỢP 1: CẬP NHẬT chiến lược đã có ---
        // [SỬA LỖI] Tạo một payload "sạch" chỉ chứa các trường được phép cập nhật.
        const updatePayload = {
          name: fullPayload.name,
          // description: fullPayload.description, // Thêm nếu có
          logic_structure: fullPayload.logic_structure,
          risk_management: fullPayload.risk_management,
        }

        console.log(`[AUTO-SAVE] Đang cập nhật chiến lược ID: ${strategyId.value}`)
        // Log payload và API sẽ gọi
        console.log('[AUTO-SAVE] Payload cập nhật gửi đi:', JSON.stringify(updatePayload, null, 2))
        console.log(`[AUTO-SAVE] Gọi API: PUT /v1/strategies/${strategyId.value}`)
        response = await strategyApi.updateStrategy(strategyId.value, updatePayload) // <-- Gửi đi payload đã được làm sạch
      } else {
        // --- TRƯỜNG HỢP 2: TẠO MỚI chiến lược ---
        console.log('[AUTO-SAVE] Đang tạo chiến lược mới...')
        // Log payload và API sẽ gọi
        console.log('[AUTO-SAVE] Payload tạo mới gửi đi:', JSON.stringify(fullPayload, null, 2))
        console.log('[AUTO-SAVE] Gọi API: POST /v1/strategies')
        response = await strategyApi.createStrategy(fullPayload)

        // QUAN TRỌNG: Sau khi tạo thành công, lấy ID trả về từ backend
        const newId = response.data.id // Giả sử backend trả về { id: '...', ... }
        if (newId) {
          strategyId.value = newId
          console.log(`[AUTO-SAVE] Tạo thành công, ID mới là: ${newId}`)

          // ▼▼▼ SỬA Ở ĐÂY ▼▼▼
          // Xác định đúng tên route dựa trên strategyType
          let routeName
          switch (
            strategyType.value // strategyType là state lưu loại builder ('trend', 'range', 'custom')
          ) {
            case 'trend':
              routeName = 'StrategyBuilderTrend'
              break
            case 'range':
              routeName = 'StrategyBuilderRange'
              break
            default: // Mặc định hoặc 'custom'
              routeName = 'StrategyBuilderAdvanced' // Giả sử 'custom' dùng Advanced
              break
          }

          // Cập nhật URL trình duyệt bằng tên route ĐÚNG
          console.log(`[AUTO-SAVE] Replacing route to: ${routeName} with ID: ${newId}`)
          router.replace({ name: routeName, params: { id: newId } }) // <-- Sử dụng routeName đã xác định
        }
      }

      lastSavedAt.value = new Date()
      console.log('[AUTO-SAVE] Lưu thành công lúc:', lastSavedAt.value.toLocaleTimeString())
    } catch (error) {
      // ▼▼▼ SỬA LOG LỖI ĐỂ RÕ RÀNG HƠN ▼▼▼
      // Log lỗi gốc từ API hoặc từ router.replace
      console.error('[AUTO-SAVE] Lỗi trong quá trình lưu hoặc cập nhật route:', error)
      saveError.value =
        error.message || 'Không thể lưu chiến lược hoặc cập nhật URL. Vui lòng thử lại.' // Hiển thị lỗi cụ thể hơn nếu có
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
        stopLossUnit.value = loadedStrategy.risk_management?.stop_loss?.unit ?? 'pnl'
        takeProfit.value = loadedStrategy.risk_management?.take_profit?.value ?? 10
        takeProfitUnit.value = loadedStrategy.risk_management?.take_profit?.unit ?? 'pnl'

        // --- BẮT ĐẦU CẬP NHẬT LOGIC LOAD ---
        const posSizing = loadedStrategy.risk_management?.position_sizing
        if (posSizing) {
          riskPerTradeType.value = posSizing.risk_type || 'percentage_of_capital'
          if (posSizing.risk_type === 'percentage_of_capital') {
            riskPerTradeValuePercentage.value = posSizing.risk_value || 2
          } else if (posSizing.risk_type === 'fixed_amount') {
            riskPerTradeValueFixed.value = posSizing.risk_value || 20
          }
        } else {
          resetRiskManagement()
        }
        // --- KẾT THÚC CẬP NHẬT LOGIC LOAD ---

        // [THAY ĐỔI] Logic tải dữ liệu cho cấu trúc cây
        if (loadedStrategy.logic_structure) {
          const logic = loadedStrategy.logic_structure || {}
          filters.value = assignIdsToTree(logic.filters) || createRootGroup('root-filters')
          signals.value = assignIdsToTree(logic.signals) || createRootGroup('root-signals')
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
    strategyName.value = 'Chiến lược Mới'
    selectedCondition.value = null
    filters.value = createRootGroup('root-filters')
    signals.value = createRootGroup('root-signals')
    pair.value = 'BTC/USDT'
    timeframe.value = '1d'

    // [SỬA ĐỔI] Reset cả SL/TP
    stopLoss.value = 5
    takeProfit.value = 10
    stopLossUnit.value = 'pnl'
    takeProfitUnit.value = 'pnl'

    resetRiskManagement()

    clearBacktestResults() // Cũng dọn dẹp kết quả backtest khi reset
    isSaving.value = false
    lastSavedAt.value = null
    saveError.value = null
  }

  function resetRiskManagement() {
    riskPerTradeType.value = 'percentage_of_capital'
    riskPerTradeValuePercentage.value = 2
    riskPerTradeValueFixed.value = 20
  }

  // ===== BẮT ĐẦU CÁC ACTIONS MỚI CHO CẤU TRÚC CÂY =====
  function addCondition(zoneType, indicatorType, parentId) {
    let rootGroup
    if (zoneType === CONDITION_ZONES.FILTERS) {
      rootGroup = filters.value
    } else if (zoneType === CONDITION_ZONES.SIGNALS) {
      rootGroup = signals.value
    } else {
      console.error('Invalid zone type:', zoneType)
      return
    }

    // [SỬA LỖI] Nếu không có parentId (ví dụ: từ kéo-thả), mặc định thêm vào nhóm gốc.
    // Nếu có parentId, tìm nhóm cha tương ứng.
    const parentGroup = parentId ? findGroupById(rootGroup, parentId) : rootGroup

    if (!parentGroup) {
      console.error(`Parent group with id ${parentId} not found in zone ${zoneType}`)
      return
    }

    const newCondition = createDefaultCondition(indicatorType, zoneType)
    parentGroup.children.push(newCondition)
    selectCondition(newCondition)
  }

  function addGroup(zoneType, parentId) {
    let rootGroup
    if (zoneType === CONDITION_ZONES.FILTERS) {
      rootGroup = filters.value
    } else if (zoneType === CONDITION_ZONES.SIGNALS) {
      rootGroup = signals.value
    } else return

    const parentGroup = findGroupById(rootGroup, parentId)
    if (!parentGroup) {
      console.error(`Parent group with id ${parentId} not found in zone ${zoneType}`)
      return
    }

    // Tạo một group con mới và thêm vào
    parentGroup.children.push(createRootGroup(uuidv4()))
  }

  function deleteNode(zoneType, nodeId) {
    let rootGroup
    if (zoneType === CONDITION_ZONES.FILTERS) {
      rootGroup = filters.value
    } else if (zoneType === CONDITION_ZONES.SIGNALS) {
      rootGroup = signals.value
    } else return

    removeNodeFromTree(rootGroup, nodeId)

    if (selectedCondition.value?.id === nodeId) {
      selectedCondition.value = null
    }
  }
  // ===== KẾT THÚC CÁC ACTIONS MỚI CHO CẤU TRÚC CÂY =====

  function selectCondition(condition) {
    selectedCondition.value = condition
  }

  function updateStrategyName(name) {
    strategyName.value = name
  }

  // ===== BẮT ĐẦU CÁC HÀM HELPER CHO CẤU TRÚC CÂY =====
  function findGroupById(node, id) {
    if (node.id === id && node.children) {
      return node
    }
    if (node.children) {
      for (const child of node.children) {
        const found = findGroupById(child, id)
        if (found) return found
      }
    }
    return null
  }

  function removeNodeFromTree(node, idToRemove) {
    if (!node.children) return false

    const index = node.children.findIndex((child) => child.id === idToRemove)
    if (index !== -1) {
      node.children.splice(index, 1)
      return true
    }

    for (const child of node.children) {
      if (child.children) {
        if (removeNodeFromTree(child, idToRemove)) {
          return true
        }
      }
    }
    return false
  }

  function assignIdsToTree(node) {
    if (!node) return null
    const newNode = { ...node, id: node.id || uuidv4() }
    if (newNode.children) {
      newNode.children = newNode.children.map(assignIdsToTree)
    }
    return newNode
  }

  function cleanUpLogicTree(node) {
    if (!node) return null
    const { id, ...rest } = node // Loại bỏ 'id'
    if (rest.children) {
      rest.children = rest.children.map(cleanUpLogicTree)
    }
    return rest
  }
  // ===== KẾT THÚC CÁC HÀM HELPER =====

  // Hàm tạo điều kiện mặc định
  function createDefaultCondition(indicatorType, zoneType) {
    // ... (code hàm này giữ nguyên, đảm bảo nó tạo state đúng) ...
    const newBlock = {
      id: uuidv4(), // Sử dụng UUID
      type: indicatorType, // << QUAN TRỌNG: Đảm bảo gán type
      params: {},
      timeframe: timeframe.value,
    }
    console.log(
      `[createDefaultCondition] Initial block created for ${indicatorType}:`,
      JSON.stringify(newBlock),
    ) // Log ban đầu
    // ... (phần switch case) ...
    switch (indicatorType) {
      case INDICATOR_TYPES.RSI:
        newBlock.params = { period: 14 }
        if (zoneType === CONDITION_ZONES.SIGNALS) {
          // State cho tín hiệu RSI
          newBlock.longCondition = { operator: '<', value: 30 }
          newBlock.shortCondition = { operator: '>', value: 70 }
          newBlock.role = 'entry' // Hoặc 'reversal' tùy bạn muốn
        }
        // ... (xử lý cho zone khác nếu cần) ...
        console.log('[createDefaultCondition] Final MA Block:', JSON.stringify(newBlock, null, 2))
        break
      // Ví dụ cho MA filter
      case INDICATOR_TYPES.MA:
        if (zoneType === CONDITION_ZONES.FILTERS) {
          newBlock.params = { length: 200, type: 'EMA' }
          newBlock.timeframe = '1h' // Timeframe của EMA
          newBlock.comparisonTarget = 'close'
          newBlock.comparisonTimeframe = timeframe.value // Timeframe của giá
          newBlock.longCondition = { operator: '>' }
          newBlock.shortCondition = { operator: '<' }
        } else if (zoneType === CONDITION_ZONES.SIGNALS) {
          newBlock.params = { period: 50, type: 'SMA' }
          newBlock.longCondition = { operator: 'cross_above', value: 'price' }
          newBlock.shortCondition = { operator: 'cross_below', value: 'price' }
          newBlock.role = 'reversal'
        }
        // ▼▼▼ THÊM LOG Ở ĐÂY ▼▼▼
        console.log(
          '[createDefaultCondition] Creating MA Block:',
          JSON.stringify(newBlock, null, 2),
        )
        break
      case INDICATOR_TYPES.MACD:
        newBlock.params = { fast: 12, slow: 26, signal: 9 }
        if (zoneType === CONDITION_ZONES.SIGNALS) {
          newBlock.longCondition = { operator: 'cross_above', value: 'signal' }
          newBlock.shortCondition = { operator: 'cross_below', value: 'signal' }
          newBlock.role = 'reversal'
        }
        break
      // --- BẮT ĐẦU THÊM MỚI ---
      // [SỬA LỖI & NÂNG CẤP] Sửa lại logic cho ADX để nó hoạt động như một bộ lọc
      case INDICATOR_TYPES.ADX:
        newBlock.params = { period: 14 }
        // ADX giờ đây chỉ có thể là một BỘ LỌC (FILTER)
        if (zoneType === CONDITION_ZONES.FILTERS) {
          newBlock.condition = { operator: '>', value: 25 }
        }
        break
      case INDICATOR_TYPES.PARABOLIC_SAR:
        newBlock.params = { acceleration: 0.02, maximum: 0.2 }
        newBlock.timeframe = timeframe.value

        // [NÂNG CẤP] Biến Parabolic SAR thành một khối tín hiệu đầy đủ
        if (zoneType === CONDITION_ZONES.SIGNALS) {
          // Vào lệnh MUA khi giá cắt lên trên SAR
          newBlock.longCondition = { operator: 'cross_above', value: 'price' }
          // Vào lệnh BÁN khi giá cắt xuống dưới SAR
          newBlock.shortCondition = { operator: 'cross_below', value: 'price' }
          // Đánh dấu đây là một khối tín hiệu
          newBlock.role = 'reversal'
        }
        break
      // --- KẾT THÚC THÊM MỚI ---
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
    filters.value = createRootGroup('root-filters')
    signals.value = createRootGroup('root-signals')
    selectedCondition.value = null

    // 2. Cập nhật các thông tin cơ bản từ mẫu
    strategyType.value = template.id // <-- THÊM MỚI: Gán loại builder từ ID của mẫu
    const logic = template.payload.logic_structure || {}

    // 3. Hàm tiện ích để thêm ID duy nhất cho các khối logic
    const mapWithId = (items) => (items || []).map((item) => ({ ...item, id: uuidv4() }))

    // 4. Điền các khối logic từ mẫu vào state
    filters.value = assignIdsToTree(logic.filters) || createRootGroup('root-filters')
    signals.value = assignIdsToTree(logic.signals) || createRootGroup('root-signals')

    // 5. Cập nhật timeframe chính dựa trên tín hiệu đầu tiên của mẫu
    const firstSignal = signals.value.children?.[0]
    if (firstSignal && firstSignal.timeframe) {
      timeframe.value = firstSignal.timeframe
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
    strategyDescription, // <-- Export state mới
    strategyType, // <-- THÊM MỚI
    filters,
    signals,
    selectedCondition,
    pair,
    timeframe,
    backtestResults,
    isShowingResults,
    isSaving, // <-- Thêm
    lastSavedAt, // <-- Thêm
    saveError, // <-- Thêm
    // --- BẮT ĐẦU EXPORT STATE MỚI ---
    initialCapital,
    backtestStartDate,
    backtestEndDate,
    // --- KẾT THÚC EXPORT ---
    // [SỬA ĐỔI] export state mới
    stopLoss,
    stopLossUnit,
    takeProfit,
    takeProfitUnit,
    // --- BẮT ĐẦU EXPORT STATE MỚI ---
    riskPerTradeType,
    riskPerTradeValuePercentage,
    riskPerTradeValueFixed,
    // --- KẾT THÚC EXPORT ---

    // Getters
    strategySavePayload,

    // Actions
    addCondition, // <-- Được cập nhật
    deleteNode, // <-- Action mới
    addGroup, // <-- Action mới
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
