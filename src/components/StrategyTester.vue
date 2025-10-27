<template>
  <!-- [THAY ĐỔI] Bọc toàn bộ component trong một div với position relative -->
  <div class="relative w-full h-screen overflow-hidden">
    <main
      id="main-app"
      class="main-app-grid"
      :class="{ 'is-loading': isLoading, 'results-open': strategyStore.isShowingResults }"
    >
      <header
        id="app-header"
        class="bg-white border-b border-slate-200 flex items-center justify-between px-6"
      >
        <div class="flex items-center space-x-4">
          <div class="flex items-center space-x-2">
            <vue-feather type="sliders" size="20" class="text-slate-500"></vue-feather>
            <h1 class="text-xl font-bold text-slate-800">
              {{ isEditMode ? 'Chỉnh Sửa Chiến Lược' : 'Bộ Xây Dựng Chiến Lược' }}
            </h1>
          </div>
          <div class="h-6 border-l border-slate-300"></div>
          <input
            type="text"
            :value="strategyStore.strategyName"
            @input="strategyStore.updateStrategyName($event.target.value)"
            class="text-base font-semibold text-slate-700 bg-transparent focus:outline-none focus:ring-0 border-0 p-0"
            placeholder="Nhập tên chiến lược..."
          />

          <!-- ===== BẮT ĐẦU THÊM MỚI ===== -->
          <div class="h-6 border-l border-slate-300"></div>
          <div class="flex items-center space-x-2">
            <div class="relative">
              <select
                v-model="selectedTemplateId"
                class="text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md pl-3 pr-8 py-1.5 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="" disabled>Dùng mẫu chiến lược...</option>
                <option
                  v-for="template in availableTemplates"
                  :key="template.id"
                  :value="template.id"
                >
                  {{ template.name }}
                </option>
              </select>
              <vue-feather
                type="chevron-down"
                size="16"
                class="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500"
              ></vue-feather>
            </div>
            <button
              @click="handleTemplateChange"
              :disabled="!selectedTemplateId"
              class="text-sm font-semibold text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-md disabled:text-slate-400 disabled:bg-transparent disabled:cursor-not-allowed"
            >
              Áp dụng
            </button>
          </div>
          <!-- ===== KẾT THÚC THÊM MỚI ===== -->
        </div>
        <div class="flex items-center space-x-4">
          <!-- [THAY ĐỔI] Bọc nút lưu và trạng thái đã lưu -->
          <div class="flex items-center space-x-3">
            <button
              @click="strategyStore.manualSaveStrategy()"
              :disabled="strategyStore.isSaving"
              class="font-semibold text-slate-600 hover:text-slate-900 px-4 py-2 rounded-md hover:bg-slate-100 disabled:text-slate-400 disabled:bg-transparent whitespace-nowrap"
            >
              <span v-if="strategyStore.isSaving">Đang lưu...</span>
              <span v-else>Lưu Chiến Lược</span>
            </button>
            <!-- Hiển thị trạng thái đã lưu -->
            <span
              v-if="strategyStore.lastSavedAt && !strategyStore.isSaving"
              class="text-xs text-slate-500 whitespace-nowrap"
            >
              Đã lưu lúc {{ new Date(strategyStore.lastSavedAt).toLocaleTimeString() }}
            </span>
          </div>

          <!-- [THÊM MỚI] Nút Chạy Mô phỏng -->
          <button
            id="run-simulation-btn"
            @click="openSimulationModal"
            :disabled="!strategyStore.strategyId"
            class="font-semibold text-blue-600 px-4 py-2 rounded-md hover:bg-blue-100 disabled:text-slate-400 disabled:bg-transparent disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <vue-feather type="fast-forward" size="18"></vue-feather>
            <span>Mô phỏng</span>
          </button>
          <button
            id="run-test-btn"
            class="bg-emerald-500 text-white font-bold px-5 py-2 rounded-lg shadow-sm hover:bg-emerald-600 transition-colors flex items-center space-x-2 disabled:bg-slate-400 disabled:cursor-wait"
            @click="runBacktest"
            :disabled="isLoading || !canRunBacktest"
          >
            <vue-feather
              v-if="isLoading"
              type="loader"
              size="20"
              class="animate-spin"
            ></vue-feather>
            <vue-feather v-else type="play" size="20"></vue-feather>
            <span id="run-test-btn-text">{{ isLoading ? 'Đang xử lý...' : 'Chạy Kiểm Tra' }}</span>
          </button>
        </div>
      </header>
      <!-- ===== KẾT THÚC NÂNG CẤP HEADER ===== -->

      <aside id="indicator-toolbox" class="bg-white border-r border-slate-200 p-4 flex flex-col">
        <!-- ===== THAY ĐỔI TIÊU ĐỀ ===== -->
        <h2 class="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">
          THƯ VIỆN CHỈ BÁO
        </h2>
        <!-- ===== BẮT ĐẦU PHẦN LOGIC MỚI ===== -->
        <div
          v-if="!focusedZone"
          class="flex-grow flex items-center justify-center text-center text-slate-400 p-4 bg-slate-50 rounded-lg"
        >
          <div>
            <vue-feather type="mouse-pointer" size="32" class="mx-auto mb-2"></vue-feather>
            <p class="font-semibold">Chọn một khu vực</p>
            <p class="text-xs">
              Nhấp vào một khu vực bên phải (Xác định xu hướng, Đo lường sức mạnh...) để xem các chỉ
              báo phù hợp.
            </p>
          </div>
        </div>
        <div v-else class="relative flex-grow overflow-y-auto pr-2 space-y-3">
          <!-- THAY ĐỔI: Sử dụng contextualIndicators thay vì availableIndicators -->
          <IndicatorCard
            v-for="indicator in contextualIndicators"
            :key="indicator.type"
            :indicator="indicator"
            @dragstart="handleDragStart(indicator.type)"
            @dragend="handleDragEnd"
          />

          <!-- Hiển thị Ichimoku bị khóa -->
          <div
            v-if="focusedZone === 'filters'"
            class="relative opacity-60 cursor-not-allowed bg-slate-50 border border-slate-200 rounded-lg p-3 flex items-center space-x-3"
          >
            <vue-feather
              type="zap"
              size="20"
              class="w-8 h-8 p-1.5 bg-amber-100 text-amber-600 rounded-md"
            ></vue-feather>
            <div>
              <p class="font-semibold text-slate-800">Ichimoku Cloud</p>
              <p class="text-xs text-slate-500">Mây Ichimoku</p>
            </div>
            <div class="absolute inset-0 flex items-center justify-center">
              <vue-feather
                type="lock"
                size="16"
                class="w-5 h-5 text-amber-700 bg-amber-200 p-1 rounded-full"
              ></vue-feather>
            </div>
          </div>
        </div>
        <!-- ===== KẾT THÚC PHẦN LOGIC MỚI ===== -->
        <div class="mt-4 pt-4 border-t border-slate-200 text-center">
          <a href="#" class="text-sm font-semibold text-blue-600 hover:underline">
            Mở khóa 40+ chỉ báo Premium
          </a>
        </div>
      </aside>

      <!-- ===== BẮT ĐẦU REFACTOR CANVAS ĐỘNG ===== -->
      <component
        :is="activeCanvasComponent"
        :strategyStore="strategyStore"
        :activeDropZone="activeDropZone"
        :focusedZone="focusedZone"
        @dragover="handleDragOver"
        @dragleave="handleDragLeave"
        @drop="handleDrop"
        @focus-zone="handleZoneFocus"
        @select-condition="strategyStore.selectCondition"
        @delete-condition="strategyStore.deleteCondition($event.zoneType, $event.conditionId)"
        class="bg-slate-50"
        style="grid-area: canvas"
      >
      </component>
      <!-- ===== KẾT THÚC REFACTOR CANVAS ĐỘNG ===== -->

      <!-- ===== BẮT ĐẦU KHU VỰC ĐƯỢC CHỈNH SỬA THEO YÊU CẦU ===== -->
      <div
        id="config-inspector-wrapper"
        class="bg-slate-50 border-l border-slate-200 p-4 space-y-4 overflow-y-auto min-h-0"
      >
        <!-- Placeholder when no condition is selected -->
        <div v-if="!strategyStore.selectedCondition" class="text-center text-slate-400 pt-16">
          <vue-feather type="edit-3" size="40" class="mb-2 mx-auto"></vue-feather>
          <p class="font-semibold">Chọn một khối logic</p>
          <p class="text-sm">để bắt đầu cấu hình.</p>
        </div>

        <!-- Dynamic Inspector Panels -->
        <div v-else class="space-y-4">
          <!-- ===== BẮT ĐẦU TÁI CẤU TRÚC INSPECTOR ===== -->

          <!-- 1. Inspector cho KHỐI TÍN HIỆU (Signal) -->
          <div
            v-if="strategyStore.selectedCondition.role"
            class="bg-white border border-blue-300 rounded-lg p-4 space-y-4 shadow-sm"
          >
            <div class="flex items-center space-x-2 pb-3 border-b">
              <vue-feather type="zap" class="text-blue-600" size="18"></vue-feather>
              <h3 class="font-bold text-slate-800 text-base">
                Cấu hình Tín hiệu: {{ strategyStore.selectedCondition.type }}
              </h3>
            </div>

            <!-- Tham số chung -->
            <div class="space-y-3 text-sm">
              <h4 class="font-semibold text-slate-600">Tham số chung</h4>
              <div v-if="strategyStore.selectedCondition.params.period !== undefined">
                <label class="block font-medium text-slate-700 mb-1">Chu kỳ (Period)</label>
                <input
                  type="number"
                  v-model.number="strategyStore.selectedCondition.params.period"
                  class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <!-- [THAY ĐỔI] Luôn hiển thị Timeframe nếu có -->
              <div v-if="strategyStore.selectedCondition.timeframe">
                <label class="block font-medium text-slate-700 mb-1">Khung thời gian</label>
                <select
                  v-model="strategyStore.selectedCondition.timeframe"
                  class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  <option v-for="tf in availableFilterTimeframes" :key="tf.value" :value="tf.value">
                    {{ tf.label }}
                  </option>
                </select>
              </div>
              <!-- Thêm các tham số chung khác ở đây nếu cần -->
            </div>

            <!-- Điều kiện MUA -->
            <div class="space-y-3 text-sm pt-3 border-t">
              <h4 class="font-semibold text-emerald-700">Kích hoạt Lệnh MUA (Long) khi</h4>
              <div class="flex items-center space-x-2">
                <span class="font-mono text-slate-800">{{
                  strategyStore.selectedCondition.type
                }}</span>
                <select
                  v-model="strategyStore.selectedCondition.longCondition.operator"
                  class="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="<">Nhỏ hơn (&lt;)</option>
                  <option value=">">Lớn hơn (&gt;)</option>
                  <option value="cross_above">Cắt lên trên</option>
                </select>
                <input
                  type="number"
                  v-model.number="strategyStore.selectedCondition.longCondition.value"
                  class="w-24 px-3 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <!-- Điều kiện BÁN -->
            <div class="space-y-3 text-sm pt-3 border-t">
              <h4 class="font-semibold text-red-700">Kích hoạt Lệnh BÁN (Short) khi</h4>
              <div class="flex items-center space-x-2">
                <span class="font-mono text-slate-800">{{
                  strategyStore.selectedCondition.type
                }}</span>
                <select
                  v-model="strategyStore.selectedCondition.shortCondition.operator"
                  class="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="<">Nhỏ hơn (&lt;)</option>
                  <option value=">">Lớn hơn (&gt;)</option>
                  <option value="cross_below">Cắt xuống dưới</option>
                </select>
                <input
                  type="number"
                  v-model.number="strategyStore.selectedCondition.shortCondition.value"
                  class="w-24 px-3 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <!-- Vai trò -->
            <div class="space-y-3 text-sm pt-3 border-t">
              <h4 class="font-semibold text-slate-600">Vai trò của Tín hiệu</h4>
              <div>
                <select
                  v-model="strategyStore.selectedCondition.role"
                  class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="entry">Chỉ Mở lệnh (Entry Only)</option>
                  <option value="reversal">Mở lệnh và Đảo chiều (Entry & Reversal)</option>
                  <option value="exit">Chỉ Đóng lệnh (Exit Only)</option>
                </select>
              </div>
            </div>
          </div>

          <!-- 2. Inspector cho KHỐI BỘ LỌC KÉP (ví dụ: MA Filter) -->
          <div
            v-else-if="
              strategyStore.selectedCondition.longCondition &&
              strategyStore.selectedCondition.shortCondition &&
              !strategyStore.selectedCondition.role
            "
            class="bg-white border border-purple-300 rounded-lg p-4 space-y-4 shadow-sm"
          >
            <div class="flex items-center space-x-2 pb-3 border-b">
              <vue-feather type="filter" class="text-purple-600" size="18"></vue-feather>
              <h3 class="font-bold text-slate-800 text-base">
                Cấu hình Bộ lọc: {{ strategyStore.selectedCondition.type }}
              </h3>
            </div>

            <!-- Tham số chung -->
            <div class="space-y-3 text-sm">
              <h4 class="font-semibold text-slate-600">Tham số chung</h4>
              <div v-if="strategyStore.selectedCondition.params.period !== undefined">
                <label class="block font-medium text-slate-700 mb-1">Chu kỳ (Period)</label>
                <input
                  type="number"
                  v-model.number="strategyStore.selectedCondition.params.period"
                  class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div v-if="strategyStore.selectedCondition.timeframe">
                <label class="block font-medium text-slate-700 mb-1">Khung thời gian Lọc</label>
                <select
                  v-model="strategyStore.selectedCondition.timeframe"
                  class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  <option v-for="tf in availableFilterTimeframes" :key="tf.value" :value="tf.value">
                    {{ tf.label }}
                  </option>
                </select>
              </div>
            </div>

            <!-- Điều kiện lọc cho Lệnh MUA -->
            <div class="space-y-3 text-sm pt-3 border-t">
              <h4 class="font-semibold text-emerald-700">Áp dụng cho Lệnh MUA khi</h4>
              <div class="flex items-center space-x-2">
                <span class="font-mono text-slate-800">Giá</span>
                <select
                  v-model="strategyStore.selectedCondition.longCondition.operator"
                  class="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value=">">Lớn hơn (&gt;)</option>
                  <option value="<">Nhỏ hơn (&lt;)</option>
                </select>
                <span class="font-mono text-slate-800"
                  >{{ strategyStore.selectedCondition.type }}({{
                    strategyStore.selectedCondition.params.period
                  }})</span
                >
              </div>
            </div>

            <!-- Điều kiện lọc cho Lệnh BÁN -->
            <div class="space-y-3 text-sm pt-3 border-t">
              <h4 class="font-semibold text-red-700">Áp dụng cho Lệnh BÁN khi</h4>
              <div class="flex items-center space-x-2">
                <span class="font-mono text-slate-800">Giá</span>
                <select
                  v-model="strategyStore.selectedCondition.shortCondition.operator"
                  class="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value=">">Lớn hơn (&gt;)</option>
                  <option value="<">Nhỏ hơn (&lt;)</option>
                </select>
                <span class="font-mono text-slate-800"
                  >{{ strategyStore.selectedCondition.type }}({{
                    strategyStore.selectedCondition.params.period
                  }})</span
                >
              </div>
            </div>
          </div>

          <!-- 3. Inspector cho KHỐI THOÁT LỆNH (Exit) -->
          <div
            v-else-if="
              strategyStore.selectedCondition.longCondition && !strategyStore.selectedCondition.role
            "
            class="bg-white border border-orange-300 rounded-lg p-4 space-y-4 shadow-sm"
          >
            <div class="flex items-center space-x-2 pb-3 border-b">
              <vue-feather type="log-out" class="text-orange-600" size="18"></vue-feather>
              <h3 class="font-bold text-slate-800 text-base">
                Cấu hình Thoát lệnh: {{ strategyStore.selectedCondition.type }}
              </h3>
            </div>

            <!-- Tham số chung -->
            <div class="space-y-3 text-sm">
              <h4 class="font-semibold text-slate-600">Tham số chung</h4>
              <div v-if="strategyStore.selectedCondition.params.period !== undefined">
                <label class="block font-medium text-slate-700 mb-1">Chu kỳ (Period)</label>
                <input
                  type="number"
                  v-model.number="strategyStore.selectedCondition.params.period"
                  class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div v-if="strategyStore.selectedCondition.timeframe">
                <label class="block font-medium text-slate-700 mb-1">Khung thời gian</label>
                <select
                  v-model="strategyStore.selectedCondition.timeframe"
                  class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  <option v-for="tf in availableMainTimeframes" :key="tf.value" :value="tf.value">
                    {{ tf.label }}
                  </option>
                </select>
              </div>
            </div>

            <!-- Điều kiện Thoát Lệnh MUA -->
            <div class="space-y-3 text-sm pt-3 border-t">
              <h4 class="font-semibold text-emerald-700">Đóng lệnh MUA (Long) khi</h4>
              <div class="flex items-center space-x-2">
                <span class="font-mono text-slate-800">{{
                  strategyStore.selectedCondition.type
                }}</span>
                <select
                  v-model="strategyStore.selectedCondition.longCondition.operator"
                  class="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value=">">Lớn hơn (&gt;)</option>
                  <option value="<">Nhỏ hơn (&lt;)</option>
                  <option value="cross_below">Cắt xuống dưới</option>
                </select>
                <input
                  type="number"
                  v-model.number="strategyStore.selectedCondition.longCondition.value"
                  class="w-24 px-3 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          <!-- 4. Inspector cho KHỐI BỘ LỌC ĐƠN (Filter) -->
          <div
            v-else-if="strategyStore.selectedCondition.condition"
            class="bg-white border border-purple-300 rounded-lg p-4 space-y-4 shadow-sm"
          >
            <div class="flex items-center space-x-2 pb-3 border-b">
              <vue-feather type="filter" class="text-purple-600" size="18"></vue-feather>
              <h3 class="font-bold text-slate-800 text-base">
                Cấu hình Bộ lọc: {{ strategyStore.selectedCondition.type }}
              </h3>
            </div>
            <div class="space-y-3 text-sm">
              <!-- Tham số chung -->
              <div v-if="strategyStore.selectedCondition.params.period !== undefined">
                <label class="block font-medium text-slate-700 mb-1">Chu kỳ (Period)</label>
                <input
                  type="number"
                  v-model.number="strategyStore.selectedCondition.params.period"
                  class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <!-- [THAY ĐỔI] Luôn hiển thị Timeframe nếu có -->
              <div v-if="strategyStore.selectedCondition.timeframe">
                <label class="block font-medium text-slate-700 mb-1">Khung thời gian</label>
                <select
                  v-model="strategyStore.selectedCondition.timeframe"
                  class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  <option v-for="tf in availableFilterTimeframes" :key="tf.value" :value="tf.value">
                    {{ tf.label }}
                  </option>
                </select>
              </div>

              <!-- Điều kiện lọc -->
              <div>
                <label class="block font-medium text-slate-700 mb-1">Điều kiện</label>
                <div class="flex items-center space-x-2">
                  <span class="font-mono text-slate-800">{{
                    strategyStore.selectedCondition.type
                  }}</span>
                  <select
                    v-model="strategyStore.selectedCondition.condition.operator"
                    class="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value=">">Lớn hơn (&gt;)</option>
                    <option value="<">Nhỏ hơn (&lt;)</option>
                  </select>
                  <!-- Giá trị có thể là số hoặc một chuỗi như 'price' -->
                  <input
                    :type="
                      typeof strategyStore.selectedCondition.condition.value === 'number'
                        ? 'number'
                        : 'text'
                    "
                    v-model="strategyStore.selectedCondition.condition.value"
                    class="w-24 px-3 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- CÁC PHẦN CÀI ĐẶT CHUNG VẪN NẰM TRONG VÙNG CUỘN -->
        <!-- 1. THIẾT LẬP CHUNG -->
        <div class="bg-white border border-slate-200 rounded-lg p-4 space-y-4">
          <h3 class="font-bold text-slate-800 text-base">Thiết lập Chung</h3>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label for="pair" class="block text-sm font-medium text-slate-700 mb-1"
                >Cặp Giao dịch</label
              >
              <select
                id="pair"
                v-model="strategyStore.pair"
                class="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                <option>BTC/USDT</option>
                <option>ETH/USDT</option>
              </select>
            </div>
            <div>
              <label for="timeframe" class="block text-sm font-medium text-slate-700 mb-1"
                >Khung Thời gian</label
              >
              <select
                id="timeframe"
                v-model="strategyStore.timeframe"
                class="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                <!-- ▼▼▼ THAY ĐỔI DÒNG DƯỚI ĐÂY ▼▼▼ -->
                <option v-for="tf in availableMainTimeframes" :key="tf.value" :value="tf.value">
                  {{ tf.label }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <!-- ===== BẮT ĐẦU KHU VỰC ĐỀ XUẤT MỚI ===== -->
        <!-- 1.5. THIẾT LẬP BACKTEST -->
        <div class="bg-white border border-slate-200 rounded-lg p-4 space-y-4">
          <h3 class="font-bold text-slate-800 text-base">Thiết lập Kiểm tra (Backtest)</h3>

          <!-- Vốn ban đầu -->
          <div>
            <label for="initial-capital" class="block text-sm font-medium text-slate-700 mb-1"
              >Vốn ban đầu</label
            >
            <div class="relative">
              <span
                class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-500 text-sm"
                >USDT</span
              >
              <input
                type="number"
                id="initial-capital"
                v-model.number="strategyStore.initialCapital"
                class="w-full pl-12 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="10000"
              />
            </div>
          </div>

          <!-- Khoảng thời gian backtest -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label for="start-date" class="block text-sm font-medium text-slate-700 mb-1"
                >Ngày bắt đầu</label
              >
              <input
                type="date"
                id="start-date"
                v-model="strategyStore.backtestStartDate"
                class="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label for="end-date" class="block text-sm font-medium text-slate-700 mb-1"
                >Ngày kết thúc</label
              >
              <input
                type="date"
                id="end-date"
                v-model="strategyStore.backtestEndDate"
                class="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <!-- Hiển thị lỗi validation -->
          <p v-if="dateError" class="text-sm text-red-600">{{ dateError }}</p>
        </div>

        <!-- ===== BẮT ĐẦU KHU VỰC ĐƯỢC CẬP NHẬT THEO YÊU CẦU UX/UI ===== -->
        <!-- 2. THIẾT LẬP RỦI RO & ĐIỂM DỪNG LỖ -->
        <!-- [SỬA LỖI] Di chuyển khối này vào đúng vị trí -->
        <div class="bg-white border border-slate-200 rounded-lg p-4 space-y-4">
          <div class="flex items-center space-x-2">
            <h3 class="font-bold text-slate-800 text-base">Thiết lập Rủi ro & Dừng lỗ</h3>
            <div class="relative group">
              <vue-feather
                type="help-circle"
                size="16"
                class="text-slate-400 cursor-help"
              ></vue-feather>
              <div
                class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 bg-slate-800 text-white text-xs rounded-lg p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10"
              >
                Cài đặt này giúp hệ thống tự động tính toán khối lượng vào lệnh để đảm bảo bạn không
                bao giờ mất nhiều hơn số tiền đã định.
                <div
                  class="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-slate-800"
                ></div>
              </div>
            </div>
          </div>

          <!-- Phần 1: Thiết lập Giới hạn Rủi ro (Ngân sách của bạn) -->
          <div class="space-y-2 pt-2">
            <label class="block text-sm font-medium text-slate-800"
              >1. Nếu lệnh này thua, bạn chấp nhận mất tối đa bao nhiêu?</label
            >

            <!-- Lựa chọn 1: Rủi ro theo % vốn -->
            <div
              class="flex items-center p-2 rounded-md transition-colors"
              :class="{ 'bg-blue-50': strategyStore.riskPerTradeType === 'percentage_of_capital' }"
            >
              <input
                type="radio"
                id="risk-percentage"
                value="percentage_of_capital"
                v-model="strategyStore.riskPerTradeType"
                class="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <label for="risk-percentage" class="ml-3 flex-grow text-sm font-medium text-slate-700"
                >Theo % của tổng vốn</label
              >
              <div class="relative w-24">
                <input
                  type="number"
                  v-model.number="strategyStore.riskPerTradeValuePercentage"
                  :disabled="strategyStore.riskPerTradeType !== 'percentage_of_capital'"
                  class="w-full pl-2 pr-6 py-1 border rounded-md text-sm text-right focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-100"
                  :class="
                    riskValueError && strategyStore.riskPerTradeType === 'percentage_of_capital'
                      ? 'border-red-500'
                      : 'border-slate-300'
                  "
                />
                <span
                  class="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none text-slate-500 text-sm"
                  >%</span
                >
              </div>
            </div>
            <p
              v-if="riskValueError && strategyStore.riskPerTradeType === 'percentage_of_capital'"
              class="text-xs text-red-600 pl-5"
            >
              {{ riskValueError }}
            </p>

            <!-- Lựa chọn 2: Rủi ro theo số tiền cố định -->
            <div
              class="flex items-center p-2 rounded-md transition-colors"
              :class="{ 'bg-blue-50': strategyStore.riskPerTradeType === 'fixed_amount' }"
            >
              <input
                type="radio"
                id="risk-fixed"
                value="fixed_amount"
                v-model="strategyStore.riskPerTradeType"
                class="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <label for="risk-fixed" class="ml-3 flex-grow text-sm font-medium text-slate-700"
                >Một số tiền cố định</label
              >
              <div class="relative w-24">
                <input
                  type="number"
                  v-model.number="strategyStore.riskPerTradeValueFixed"
                  :disabled="strategyStore.riskPerTradeType !== 'fixed_amount'"
                  class="w-full pl-2 pr-10 py-1 border rounded-md text-sm text-right focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-100"
                  :class="
                    riskValueError && strategyStore.riskPerTradeType === 'fixed_amount'
                      ? 'border-red-500'
                      : 'border-slate-300'
                  "
                />
                <span
                  class="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none text-slate-500 text-sm"
                  >USDT</span
                >
              </div>
            </div>
            <p
              v-if="riskValueError && strategyStore.riskPerTradeType === 'fixed_amount'"
              class="text-xs text-red-600 pl-5"
            >
              {{ riskValueError }}
            </p>
          </div>

          <!-- Phần 2: Thiết lập Điểm Thoát Lệnh (Giá của rủi ro) -->
          <div class="space-y-2 pt-3 border-t border-slate-200">
            <label for="stop-loss-value" class="block text-sm font-medium text-slate-800"
              >2. Bạn sẽ cắt lỗ khi giá đi ngược lại bao nhiêu?</label
            >
            <div class="grid grid-cols-2 gap-3">
              <!-- Cắt lỗ -->
              <div>
                <div class="flex justify-between items-center mb-1">
                  <label for="stop-loss" class="block text-xs font-semibold text-slate-700"
                    >Cắt lỗ</label
                  >
                  <div class="flex text-xs font-semibold bg-slate-200 rounded-md p-0.5">
                    <button
                      @click="strategyStore.stopLossUnit = 'percentage'"
                      :class="
                        strategyStore.stopLossUnit === 'percentage'
                          ? 'bg-white text-slate-800 shadow-sm rounded'
                          : 'text-slate-500'
                      "
                      class="px-2 py-0.5"
                    >
                      %
                    </button>
                    <button
                      @click="strategyStore.stopLossUnit = 'pnl'"
                      :class="
                        strategyStore.stopLossUnit === 'pnl'
                          ? 'bg-white text-slate-800 shadow-sm rounded'
                          : 'text-slate-500'
                      "
                      class="px-2 py-0.5"
                    >
                      USDT
                    </button>
                  </div>
                </div>
                <div class="relative">
                  <input
                    v-model.number="strategyStore.stopLoss"
                    type="number"
                    id="stop-loss"
                    placeholder="Bắt buộc"
                    class="w-full pl-3 pr-12 py-2 border rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                    :class="stopLossError ? 'border-red-500' : 'border-slate-300'"
                  />
                  <span
                    class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-500 text-sm"
                    >{{ strategyStore.stopLossUnit === 'percentage' ? '%' : 'USDT' }}</span
                  >
                </div>
                <p v-if="stopLossError" class="text-xs text-red-600 mt-1">{{ stopLossError }}</p>
              </div>
              <!-- Chốt lời -->
              <div>
                <div class="flex justify-between items-center mb-1">
                  <label for="take-profit" class="block text-xs font-semibold text-slate-700"
                    >Chốt lời</label
                  >
                  <div class="flex text-xs font-semibold bg-slate-200 rounded-md p-0.5">
                    <button
                      @click="strategyStore.takeProfitUnit = 'percentage'"
                      :class="
                        strategyStore.takeProfitUnit === 'percentage'
                          ? 'bg-white text-slate-800 shadow-sm rounded'
                          : 'text-slate-500'
                      "
                      class="px-2 py-0.5"
                    >
                      %
                    </button>
                    <button
                      @click="strategyStore.takeProfitUnit = 'pnl'"
                      :class="
                        strategyStore.takeProfitUnit === 'pnl'
                          ? 'bg-white text-slate-800 shadow-sm rounded'
                          : 'text-slate-500'
                      "
                      class="px-2 py-0.5"
                    >
                      USDT
                    </button>
                  </div>
                </div>
                <div class="relative">
                  <input
                    v-model.number="strategyStore.takeProfit"
                    type="number"
                    id="take-profit"
                    placeholder="Tùy chọn"
                    class="w-full pl-3 pr-12 py-2 border border-slate-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                  <span
                    class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-500 text-sm"
                    >{{ strategyStore.takeProfitUnit === 'percentage' ? '%' : 'USDT' }}</span
                  >
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Phần 3: Dòng Giải thích Động -->
        <div class="bg-blue-50 text-blue-800 text-sm rounded-lg p-3 flex items-start space-x-2.5">
          <vue-feather type="info" size="16" class="mt-0.5 flex-shrink-0"></vue-feather>
          <p><b class="font-semibold">Giải thích:</b> {{ explanationText }}</p>
        </div>

        <!-- 3. QUẢN LÝ RỦI RO (NÂNG CAO) - Dạng bị khóa -->
        <div
          class="relative opacity-60 cursor-not-allowed bg-white border border-slate-200 rounded-lg p-4 space-y-3"
        >
          <div class="flex items-center justify-between">
            <h3 class="font-bold text-slate-800 text-base">Quản lý Rủi ro (Nâng cao)</h3>
            <vue-feather type="lock" size="20" class="text-amber-600"></vue-feather>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div class="relative">
              <label class="block text-xs font-semibold text-slate-700 mb-1"
                >Trailing Stop (%)</label
              >
              <input
                type="number"
                disabled
                class="w-full pl-3 pr-4 py-2 border border-slate-300 rounded-md text-sm bg-slate-100"
              />
            </div>
            <div class="relative">
              <label class="block text-xs font-semibold text-slate-700 mb-1">Khối lượng lệnh</label>
              <input
                type="text"
                value="100% vốn"
                disabled
                class="w-full pl-3 pr-4 py-2 border border-slate-300 rounded-md text-sm bg-slate-100"
              />
            </div>
          </div>
          <p class="text-xs text-slate-500 mt-1 text-center">
            <a href="#" class="text-blue-600 font-semibold">Nâng cấp Premium</a> để sử dụng.
          </p>
        </div>
      </div>

      <!-- [THAY ĐỔI] Khu vực kết quả được chuyển ra ngoài và style lại thành drawer -->
      <div
        id="results-drawer-wrapper"
        class="absolute bottom-0 left-0 right-0 h-1/3 transform translate-y-full transition-transform duration-300 ease-in-out"
        :class="{ 'translate-y-0': strategyStore.isShowingResults || isLoading }"
      >
        <div
          v-if="!strategyStore.isShowingResults && !isLoading && !error"
          id="results-placeholder"
          class="h-full bg-white rounded-t-lg border-t border-x border-slate-200 flex items-center justify-center"
        >
          <p class="text-slate-400 text-center">
            <vue-feather type="bar-chart-2" size="40" class="mx-auto mb-2"></vue-feather>
            Kết quả chi tiết sẽ xuất hiện ở đây sau khi chạy kiểm tra.
          </p>
        </div>

        <div
          v-if="strategyStore.isShowingResults && strategyStore.backtestResults"
          id="results-container"
          class="h-full bg-white rounded-t-lg border-t border-x border-slate-200 flex flex-col"
        >
          <!-- [THAY ĐỔI] Tái cấu trúc header của drawer -->
          <div class="flex justify-between items-center border-b border-slate-200 pr-2">
            <!-- Các Tab điều hướng -->
            <div class="flex">
              <button
                @click="activeTab = 'overview'"
                class="tab-button font-semibold px-4 py-3 border-b-2"
                :class="{ active: activeTab === 'overview' }"
              >
                Tổng quan
              </button>
              <button
                @click="activeTab = 'stats'"
                class="tab-button font-semibold px-4 py-3 border-b-2 border-transparent text-slate-500 hover:text-blue-600"
                :class="{ active: activeTab === 'stats' }"
              >
                Thống kê
              </button>
              <button
                @click="activeTab = 'history'"
                class="tab-button font-semibold px-4 py-3 border-b-2 border-transparent text-slate-500 hover:text-blue-600"
                :class="{ active: activeTab === 'history' }"
              >
                Lịch sử Lệnh
              </button>
            </div>
            <!-- Các nút hành động -->
            <div class="flex items-center space-x-2">
              <button
                id="view-full-report-btn"
                @click="viewFullReport"
                class="text-sm font-semibold text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-md flex items-center space-x-1.5"
              >
                <vue-feather type="external-link" size="14"></vue-feather>
                <span>Xem Báo cáo</span>
              </button>
              <button
                id="reset-view-btn"
                @click="strategyStore.clearBacktestResults()"
                class="text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full p-1"
                title="Đóng kết quả"
              >
                <vue-feather type="x" size="20"></vue-feather>
              </button>
            </div>
          </div>
          <div class="flex-grow p-4 overflow-y-auto">
            <!-- Overview Tab -->
            <div
              v-if="activeTab === 'overview'"
              class="tab-content grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <div
                class="col-span-1 md:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4 text-center"
              >
                <div class="bg-slate-50 p-3 rounded-lg">
                  <p class="text-sm text-slate-500">Tổng Lợi nhuận</p>
                  <p class="text-2xl font-bold text-green-600">
                    +{{ strategyStore.backtestResults.overview.total_profit_percent?.toFixed(2) }}%
                  </p>
                </div>
                <div class="bg-slate-50 p-3 rounded-lg">
                  <p class="text-sm text-slate-500">Tỷ lệ Thắng</p>
                  <p class="text-2xl font-bold text-slate-800">
                    {{ strategyStore.backtestResults.overview.win_rate?.toFixed(2) }}%
                  </p>
                </div>
                <div class="bg-slate-50 p-3 rounded-lg">
                  <p class="text-sm text-slate-500">Tổng số Lệnh</p>
                  <p class="text-2xl font-bold text-slate-800">
                    {{ strategyStore.backtestResults.overview.total_trades }}
                  </p>
                </div>
                <div class="bg-slate-50 p-3 rounded-lg">
                  <p class="text-sm text-slate-500">Lợi nhuận/Rủi ro</p>
                  <p class="text-2xl font-bold text-slate-800">
                    {{ strategyStore.backtestResults.overview.profit_factor?.toFixed(2) || 'N/A' }}
                  </p>
                </div>
              </div>
              <!-- NOTE: Equity curve chart is complex, using a placeholder for now -->
              <div
                class="col-span-1 md:col-span-2 h-32 bg-slate-50 rounded-lg p-2 flex items-center justify-center"
              >
                <p class="text-slate-400 text-sm">
                  Biểu đồ tăng trưởng vốn (Equity Curve) sẽ ở đây
                </p>
              </div>
            </div>
            <!-- Detailed Stats Tab -->
            <div v-if="activeTab === 'stats'" class="tab-content">
              <div class="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
                <div class="flex justify-between border-b pb-1">
                  <span class="text-slate-500">Lợi nhuận ròng</span
                  ><span class="font-semibold text-green-600"
                    >+{{
                      strategyStore.backtestResults.overview.net_profit?.toFixed(2) || '0.00'
                    }}
                    USDT</span
                  >
                </div>
                <div class="flex justify-between border-b pb-1">
                  <span class="text-slate-500">Lợi nhuận trung bình / lệnh</span
                  ><span class="font-semibold text-green-600"
                    >+{{
                      strategyStore.backtestResults.overview.avg_profit_per_trade?.toFixed(2) ||
                      '0.00'
                    }}
                    USDT</span
                  >
                </div>
                <div class="flex justify-between border-b pb-1">
                  <span class="text-slate-500">Chuỗi thắng dài nhất</span
                  ><span class="font-semibold text-slate-800">{{
                    strategyStore.backtestResults.overview.longest_win_streak || 0
                  }}</span>
                </div>
                <div class="flex justify-between border-b pb-1">
                  <span class="text-slate-500">Lỗ trung bình / lệnh</span
                  ><span class="font-semibold text-red-600"
                    >{{
                      strategyStore.backtestResults.overview.avg_loss_per_trade?.toFixed(2) ||
                      '0.00'
                    }}
                    USDT</span
                  >
                </div>
                <div class="flex justify-between border-b pb-1">
                  <span class="text-slate-500">Chuỗi thua dài nhất</span
                  ><span class="font-semibold text-slate-800">{{
                    strategyStore.backtestResults.overview.longest_loss_streak || 0
                  }}</span>
                </div>
                <div class="flex justify-between border-b pb-1 text-slate-400">
                  <span class="flex items-center"
                    ><vue-feather type="lock" size="12" class="mr-2"></vue-feather>Mức sụt giảm vốn
                    tối đa</span
                  ><span class="font-semibold">-12.5%</span>
                </div>
                <div class="flex justify-between border-b pb-1 text-slate-400">
                  <span class="flex items-center"
                    ><vue-feather type="lock" size="12" class="mr-2"></vue-feather>Tỷ lệ
                    Sharpe</span
                  ><span class="font-semibold">1.8</span>
                </div>
                <div class="col-span-2 text-center mt-2">
                  <a href="#" class="text-blue-600 font-semibold text-xs"
                    >Nâng cấp để xem tất cả chỉ số rủi ro</a
                  >
                </div>
              </div>
            </div>
            <!-- History Tab -->
            <div v-if="activeTab === 'history'" class="tab-content">
              <div class="overflow-auto h-full">
                <p
                  v-if="
                    !strategyStore.backtestResults.trade_history ||
                    strategyStore.backtestResults.trade_history.length === 0
                  "
                  class="text-center text-slate-400 text-sm pt-4"
                >
                  Không có giao dịch nào được thực hiện.
                </p>
                <table class="w-full text-sm text-left">
                  <thead class="text-xs text-slate-500 uppercase bg-slate-50 sticky top-0">
                    <tr>
                      <th scope="col" class="px-4 py-2">Ngày vào lệnh</th>
                      <th scope="col" class="px-4 py-2">Loại lệnh</th>
                      <th scope="col" class="px-4 py-2">Giá vào</th>
                      <th scope="col" class="px-4 py-2">Giá ra</th>
                      <th scope="col" class="px-4 py-2">Lợi nhuận/Lỗ</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="(trade, index) in strategyStore.backtestResults.trade_history"
                      :key="index"
                      class="border-b"
                      :class="index % 2 === 0 ? 'bg-white' : 'bg-slate-50'"
                    >
                      <td class="px-4 py-2">{{ new Date(trade.entry_date).toLocaleString() }}</td>
                      <td class="px-4 py-2">
                        <span
                          class="font-semibold"
                          :class="trade.type === 'MUA' ? 'text-green-600' : 'text-red-600'"
                          >{{ trade.type }}</span
                        >
                      </td>
                      <td class="px-4 py-2">{{ trade.entry_price?.toFixed(2) }}</td>
                      <td class="px-4 py-2">{{ trade.exit_price?.toFixed(2) }}</td>
                      <td
                        class="px-4 py-2 font-semibold"
                        :class="trade.pnl >= 0 ? 'text-green-600' : 'text-red-600'"
                      >
                        {{ trade.pnl?.toFixed(2) }}%
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- [THÊM MỚI] Tích hợp Modal Mô phỏng -->
      <SimulationModal
        :is-visible="isSimulationModalOpen"
        :strategy-id="strategyStore.strategyId"
        @close="isSimulationModalOpen = false"
      />
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, watchEffect } from 'vue'
import VueFeather from 'vue-feather'
import { useRoute, useRouter } from 'vue-router'
import { useStrategyStore } from '@/stores/strategy'
import IndicatorCard from './IndicatorCard.vue'
// --- BẮT ĐẦU REFACTOR ---
import StrategyCanvas from './StrategyCanvas.vue'
import RangeStrategyCanvas from './RangeStrategyCanvas.vue'
import TrendStrategyCanvas from './TrendStrategyCanvas.vue'
// --- KẾT THÚC REFACTOR ---
import SimulationModal from './SimulationModal.vue' // <-- [THÊM MỚI] Import modal
import { STRATEGY_TEMPLATES } from './strategyTemplates.js' // <-- THÊM DÒNG NÀY
import { INDICATOR_TYPES, CONDITION_ZONES } from '@/utils/constants'
import { TIME_FRAMES, getTimeframeByValue } from '@/utils/timeframes.js' // <-- THÊM MỚI
import { useDragAndDrop } from '@/composables/useDragAndDrop.js'
import strategyApi from '@/api/strategyApi'
import backtestApi from '@/api/backtestApi'

import { useToast } from 'vue-toastification' // <-- THÊM MỚI
const toast = useToast() // <-- THÊM MỚI
const strategyStore = useStrategyStore()

// --- BẮT ĐẦU REFACTOR ---
const props = defineProps({
  builderType: {
    type: String,
    default: 'custom', // 'custom', 'range', 'trend'
  },
})
const route = useRoute()
const router = useRouter()

// --- THÊM MỚI STATE NÀY ---
const selectedTemplateId = ref('') // Dùng để v-model cho dropdown
const availableTemplates = ref(STRATEGY_TEMPLATES)
// --- KẾT THÚC THÊM MỚI ---

// --- THÊM STATE CỤC BỘ MỚI ---
const focusedZone = ref(null) // 'filters', 'signals', 'exits', hoặc null
const dateError = ref(null) // State mới để lưu lỗi ngày tháng
const riskValueError = ref(null) // State mới cho lỗi giá trị rủi ro
const stopLossError = ref(null) // State mới cho lỗi cắt lỗ

// --- STATE CỤC BỘ ---

// ===== BẮT ĐẦU NÂNG CẤP DANH SÁCH CHỈ BÁO =====
const availableIndicators = ref([
  {
    type: INDICATOR_TYPES.RSI,
    name: 'RSI',
    description: 'Relative Strength Index',
    icon: 'bar-chart-2',
    color: 'blue',
  },
  {
    type: INDICATOR_TYPES.MA,
    name: 'Moving Average',
    description: 'Đường trung bình động',
    icon: 'trending-up',
    color: 'purple',
  },
  {
    type: INDICATOR_TYPES.MACD,
    name: 'MACD',
    description: 'Moving Average Convergence',
    icon: 'git-merge',
    color: 'indigo',
  },
  {
    type: INDICATOR_TYPES.BB,
    name: 'Bollinger Bands',
    description: 'Dải bollinger',
    icon: 'minimize-2',
    color: 'cyan',
  },
  {
    type: INDICATOR_TYPES.STOCHASTIC,
    name: 'Stochastic',
    description: 'Chỉ báo dao động',
    icon: 'shuffle',
    color: 'pink',
  },
  {
    type: INDICATOR_TYPES.ATR,
    name: 'ATR',
    description: 'Average True Range',
    icon: 'activity',
    color: 'orange',
  },
  {
    type: INDICATOR_TYPES.VOLUME,
    name: 'Volume',
    description: 'Khối lượng giao dịch',
    icon: 'bar-chart',
    color: 'green',
  },
  {
    type: INDICATOR_TYPES.AO,
    name: 'Awesome Oscillator',
    description: 'Chỉ báo AO',
    icon: 'hash',
    color: 'red',
  },
  {
    type: INDICATOR_TYPES.WILLIAMS_R,
    name: 'Williams %R',
    description: 'Phần trăm Williams',
    icon: 'percent',
    color: 'teal',
  },
  {
    type: INDICATOR_TYPES.OBV,
    name: 'On-Balance Volume',
    description: 'Chỉ báo OBV',
    icon: 'arrow-up-circle',
    color: 'gray',
  },
  {
    type: INDICATOR_TYPES.ADX,
    name: 'ADX',
    description: 'Average Directional Index',
    icon: 'compass',
    color: 'yellow',
  },
  {
    type: INDICATOR_TYPES.PARABOLIC_SAR,
    name: 'Parabolic SAR',
    description: 'Điểm dừng và đảo chiều',
    icon: 'disc',
    color: 'lime',
  },
])
// ===== KẾT THÚC NÂNG CẤP DANH SÁCH CHỈ BÁO =====

const MAX_CONDITIONS_FREE = 3
const isLoading = ref(false)
const error = ref(null)
const jobId = ref(null)
const pollInterval = ref(null)
const activeTab = ref('overview') // <-- State mới cho việc quản lý tab kết quả

const isSimulationModalOpen = ref(false) // <-- State mới cho modal mô phỏng
const justSaved = ref(false) // <-- State mới cho nút Lưu

// --- BẮT ĐẦU REFACTOR ---
const canvasComponents = {
  custom: StrategyCanvas,
  range: RangeStrategyCanvas,
  trend: TrendStrategyCanvas,
}
const activeCanvasComponent = computed(() => {
  return canvasComponents[props.builderType] || StrategyCanvas
})

// ===== ĐÂY LÀ PHẦN LOGIC CỐT LÕI MỚI =====
const contextualIndicators = computed(() => {
  const all = availableIndicators.value
  switch (focusedZone.value) {
    case 'filters':
      // Giờ đây khu vực LỌC sẽ chứa cả MA (xác định hướng) và ADX (đo sức mạnh)
      return all.filter((i) => [INDICATOR_TYPES.MA, INDICATOR_TYPES.ADX].includes(i.type))

    case 'signals':
      // Khu vực TÍN HIỆU sẽ chứa RSI và MACD để tìm điểm vào lệnh
      return all.filter((i) => [INDICATOR_TYPES.RSI, INDICATOR_TYPES.MACD].includes(i.type))

    case 'exits':
      // Khu vực THOÁT LỆNH có thể dùng các chỉ báo như Parabolic SAR
      return all.filter((i) => [INDICATOR_TYPES.PARABOLIC_SAR].includes(i.type))

    default:
      // Khi chưa chọn khu vực nào, không hiển thị gì cả
      // (Template sẽ hiển thị thông báo hướng dẫn)
      return []
  }
})

// --- THÊM HÀM XỬ LÝ SỰ KIỆN MỚI ---
function handleZoneFocus(zoneType) {
  console.log(`Zone focused: ${zoneType}`)
  focusedZone.value = zoneType
}
// [SỬA ĐỔI] Thêm watchEffect để log payload mỗi khi có thay đổi
watchEffect((onInvalidate) => {
  // Bỏ qua log ban đầu khi component mới được tạo
  console.log('--- PAYLOAD ĐÃ CẬP NHẬT ---')
  console.log(JSON.stringify(strategyStore.strategyPayload, null, 2))
})

// [THÊM MỚI] Watch riêng cho stopLoss và takeProfit để log ra console
watch(
  () => strategyStore.stopLoss,
  (newValue) => {
    console.log(`[UI] Giá trị Cắt lỗ (Stop Loss) đã thay đổi thành: ${newValue}`)
  },
)

watch(
  () => strategyStore.takeProfit,
  (newValue) => {
    console.log(`[UI] Giá trị Chốt lời (Take Profit) đã thay đổi thành: ${newValue}`)
  },
)

// --- BẮT ĐẦU BỔ SUNG LOGIC VALIDATION ---

// 1. Theo dõi sự thay đổi của ngày tháng để validate
watch(
  [() => strategyStore.backtestStartDate, () => strategyStore.backtestEndDate],
  ([start, end]) => {
    if (start && end && new Date(start) > new Date(end)) {
      dateError.value = 'Ngày kết thúc phải sau ngày bắt đầu.'
    } else {
      dateError.value = null
    }
  },
)

// 2. Nâng cấp computed property `canRunBacktest`
const canRunBacktest = computed(() => {
  // Điều kiện cũ: Phải có ít nhất một tín hiệu
  const hasSignals = strategyStore.signals.children.length > 0

  // Điều kiện mới: Các trường backtest phải hợp lệ
  const hasValidCapital = strategyStore.initialCapital > 0
  const hasValidDates =
    strategyStore.backtestStartDate && strategyStore.backtestEndDate && !dateError.value

  // Điều kiện mới: Không có lỗi validation nào khác
  const hasValidRisk = !riskValueError.value
  const hasValidStopLoss = !stopLossError.value && strategyStore.stopLoss > 0

  return hasSignals && hasValidCapital && hasValidDates && hasValidRisk && hasValidStopLoss
})

// Watcher cho các giá trị rủi ro
watch(
  [
    () => strategyStore.riskPerTradeType,
    () => strategyStore.riskPerTradeValuePercentage,
    () => strategyStore.riskPerTradeValueFixed,
  ],
  ([type, percentage, fixed]) => {
    riskValueError.value = null // Reset lỗi mỗi khi có thay đổi
    if (type === 'percentage_of_capital' && (!percentage || percentage <= 0)) {
      riskValueError.value = 'Tỷ lệ % phải lớn hơn 0.'
    }
    if (type === 'fixed_amount' && (!fixed || fixed <= 0)) {
      riskValueError.value = 'Số tiền phải lớn hơn 0.'
    }
  },
  { deep: true },
)

// Watcher cho giá trị cắt lỗ
watch(
  () => strategyStore.stopLoss,
  (newValue) => {
    stopLossError.value = !newValue || newValue <= 0 ? 'Cắt lỗ phải là một giá trị dương.' : null
  },
)

// --- BẮT ĐẦU THÊM MỚI: LOGIC CHO DÒNG GIẢI THÍCH ĐỘNG ---
const explanationText = computed(() => {
  // Lấy các giá trị cần thiết từ store
  const {
    riskPerTradeType,
    riskPerTradeValuePercentage,
    riskPerTradeValueFixed,
    stopLoss,
    stopLossUnit,
    initialCapital,
  } = strategyStore

  // Kiểm tra điều kiện đầu vào
  if (!stopLoss || stopLoss <= 0) {
    return 'Vui lòng nhập một giá trị Cắt lỗ hợp lệ (lớn hơn 0) để xem giải thích.'
  }

  // Tính toán số tiền rủi ro tuyệt đối
  let riskAmount = 0
  let riskAmountDescription = ''

  if (riskPerTradeType === 'percentage_of_capital') {
    riskAmount = (initialCapital * riskPerTradeValuePercentage) / 100
    riskAmountDescription = `${riskPerTradeValuePercentage}% vốn của bạn, tức là ${riskAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD' }).replace('$', '')} USDT`
  } else {
    riskAmount = riskPerTradeValueFixed
    riskAmountDescription = `${riskAmount.toLocaleString('en-US')} USDT`
  }

  // Tạo câu giải thích
  return `Với các cài đặt trên, hệ thống sẽ tự động tính toán khối lượng vào lệnh sao cho nếu giá chạm mức cắt lỗ ${stopLoss}${stopLossUnit === 'percentage' ? '%' : ' USDT'}, khoản lỗ của bạn sẽ đúng bằng ${riskAmountDescription}.`
})
// --- KẾT THÚC THÊM MỚI ---
// --- KẾT THÚC BỔ SUNG LOGIC ---

// [THÊM MỚI] Hàm helper để lấy tất cả các điều kiện từ cây logic
function getAllConditionsFromTree(node) {
  if (!node || !node.children) return []
  let conditions = []
  for (const child of node.children) {
    if (child.children) {
      // Nếu là group, duyệt đệ quy
      conditions = conditions.concat(getAllConditionsFromTree(child))
    } else {
      // Nếu là điều kiện, thêm vào danh sách
      conditions.push(child)
    }
  }
  return conditions
}

// ===== BẮT ĐẦU LOGIC TIME FRAME ĐỘNG =====

// 1. Danh sách các timeframe được phép dùng cho Bộ lọc Xu hướng
const availableFilterTimeframes = computed(() => {
  return TIME_FRAMES.filter((tf) => tf.isFilterable)
})

// 2. Tìm ra rank của timeframe CAO NHẤT đang được sử dụng trong TẤT CẢ các bộ lọc
const highestFilterTimeframeRank = computed(() => {
  const allFilters = getAllConditionsFromTree(strategyStore.filters) // [SỬA LỖI]

  if (allFilters.length === 0) {
    return -1 // Không có bộ lọc nào, không giới hạn gì cả
  }

  // Tìm rank cao nhất trong số các bộ lọc
  const maxRank = Math.max(
    ...allFilters.map((condition) => {
      // Giờ allFilters đã là một mảng, .map() sẽ hoạt động
      const tf = getTimeframeByValue(condition.timeframe)
      return tf ? tf.rank : -1
    }),
  )

  return maxRank
})

// 3. Danh sách các timeframe hợp lệ cho Tín hiệu vào lệnh (Khung thời gian chính)
// Timeframe này phải <= timeframe cao nhất của bộ lọc
const availableMainTimeframes = computed(() => {
  if (highestFilterTimeframeRank.value === -1) {
    return TIME_FRAMES // Nếu không có bộ lọc, hiển thị tất cả
  }
  return TIME_FRAMES.filter((tf) => tf.rank <= highestFilterTimeframeRank.value)
})

// 4. Watcher: Tự động điều chỉnh nếu người dùng thay đổi Timeframe chính
// thành một giá trị thấp hơn timeframe của một bộ lọc nào đó.
watch(
  () => strategyStore.timeframe,
  (newMainTimeframeValue) => {
    const mainTimeframe = getTimeframeByValue(newMainTimeframeValue)
    if (!mainTimeframe) return

    const mainRank = mainTimeframe.rank

    // Hàm để kiểm tra và cập nhật các bộ lọc
    const allFilters = getAllConditionsFromTree(strategyStore.filters) // [SỬA LỖI]
    allFilters.forEach((condition) => {
      const filterTimeframe = getTimeframeByValue(condition.timeframe)
      if (filterTimeframe && filterTimeframe.rank < mainRank) {
        // Nếu bộ lọc có rank thấp hơn (không hợp lệ) -> tự động nâng cấp nó lên bằng timeframe chính
        console.warn(
          `[LOGIC] Timeframe bộ lọc '${condition.type}' (${filterTimeframe.label}) không hợp lệ. Tự động cập nhật thành ${mainTimeframe.label}.`,
        )
        condition.timeframe = newMainTimeframeValue
        toast.info(
          `Timeframe của bộ lọc ${condition.type} đã được cập nhật thành ${mainTimeframe.label} để đảm bảo tính hợp lệ.`,
        )
      }
    })
  },
)

// ===== KẾT THÚC LOGIC TIME FRAME ĐỘNG =====

// --- LOGIC TỰ ĐỘNG LƯU (đã được thay bằng nút thủ công trên UI nhưng logic vẫn giữ) ---
const debouncedSave = (() => {
  let timeoutId
  return () => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => {
      strategyStore.autoSaveStrategy()
    }, 2000)
  }
})()

const stopWatching = watch(
  () => strategyStore.strategyPayload,
  (newValue, oldValue) => {
    // Chỉ trigger khi component đã được mount và có sự thay đổi thực sự
    // Điều này tránh việc trigger ngay khi tải trang (khi oldValue là undefined)
    if (oldValue !== undefined) {
      debouncedSave()
    }
  },
  { deep: true },
)

// --- LOGIC TẢI/RESET DỮ LIỆU ---
const strategyId = computed(() => route.params.id)
const isEditMode = computed(() => !!strategyId.value)

onMounted(async () => {
  window.addEventListener('keydown', handleKeyDown)

  // THAY THẾ BẰNG LOGIC ĐƠN GIẢN HƠN
  if (isEditMode.value) {
    await strategyStore.loadStrategy(strategyId.value)
  } else {
    await strategyStore.loadStrategy(null) // Luôn bắt đầu với chiến lược trống
  }

  // [REFACTOR] Set strategy type based on prop
  strategyStore.setStrategyType(props.builderType)
})

// --- BẮT ĐẦU GIẢI PHÁP: HÀM XỬ LÝ PHÍM TẮT ---
function handleKeyDown(event) {
  // Ctrl+S hoặc Cmd+S để lưu
  if ((event.ctrlKey || event.metaKey) && event.key === 's') {
    event.preventDefault() // Ngăn trình duyệt lưu trang
    console.log('Phím tắt Lưu được kích hoạt!')
    // Gọi action lưu thủ công để có thông báo
    strategyStore.manualSaveStrategy()
  }
}
// --- KẾT THÚC GIẢI PHÁP ---

onBeforeUnmount(() => {
  if (pollInterval.value) clearInterval(pollInterval.value)
  stopWatching()
  // --- BẮT ĐẦU GIẢI PHÁP: GỠ BỎ PHÍM TẮT ---
  window.removeEventListener('keydown', handleKeyDown)
  // --- KẾT THÚC GIẢI PHÁP ---
})

// --- LOGIC BACKTEST ---
async function runBacktest() {
  error.value = null
  strategyStore.clearBacktestResults()
  if (pollInterval.value) clearInterval(pollInterval.value)

  if (!canRunBacktest.value) {
    toast.error('Vui lòng thêm ít nhất một điều kiện Mua hoặc Bán.')
    return
  }

  // Reset tab về 'overview' mỗi khi chạy lại
  activeTab.value = 'overview'

  await strategyStore.autoSaveStrategy()
  if (!strategyStore.strategyId) {
    toast.error('Không thể lưu chiến lược, vui lòng thử lại.')
    return
  }

  isLoading.value = true
  try {
    // [SỬA LỖI] Bổ sung các thiết lập backtest vào payload gửi đi
    const config = {
      pair: strategyStore.pair,
      timeframe: strategyStore.timeframe,
      initial_capital: strategyStore.initialCapital,
      start_date: strategyStore.backtestStartDate,
      end_date: strategyStore.backtestEndDate,
    }
    const response = await backtestApi.startBacktest(strategyStore.strategyId, config)
    jobId.value = response.data.job_id
    startPolling()
  } catch (err) {
    error.value = err.response?.data?.detail || 'Lỗi khi bắt đầu job.'
    isLoading.value = false
  }
}

function openSimulationModal() {
  // Có thể thêm logic kiểm tra khác ở đây nếu cần
  isSimulationModalOpen.value = true
}

function viewFullReport() {
  if (strategyStore.strategyId) {
    // Giả sử có một route tên là 'StrategyReport'
    router.push({ name: 'StrategyReport', params: { id: strategyStore.strategyId } })
  }
}

function startPolling() {
  pollInterval.value = setInterval(() => checkJobStatus(), 2000)
}

async function checkJobStatus() {
  if (!jobId.value) return
  try {
    const response = await backtestApi.getBacktestResult(jobId.value)
    const job = response.data
    if (job.status === 'COMPLETED' || job.status === 'FAILED') {
      clearInterval(pollInterval.value)
      isLoading.value = false
      if (job.status === 'COMPLETED') {
        strategyStore.setBacktestResults(job.results)
      } else {
        error.value = job.results?.error || 'Job backtest thất bại.'
      }
    }
  } catch (err) {
    error.value = 'Lỗi khi lấy kết quả job.'
    isLoading.value = false
    clearInterval(pollInterval.value)
  }
}

function handleTemplateChange() {
  if (!selectedTemplateId.value) return

  const selectedTemplate = availableTemplates.value.find((t) => t.id === selectedTemplateId.value)
  if (!selectedTemplate) {
    // Reset dropdown nếu không tìm thấy mẫu
    selectedTemplateId.value = ''
    return
  }

  // --- BẮT ĐẦU NÂNG CẤP UX ---
  const isCanvasEmpty =
    strategyStore.filters.length === 0 &&
    strategyStore.signals.length === 0 &&
    strategyStore.exits.length === 0

  // Nếu canvas không rỗng, hỏi người dùng trước khi tiếp tục
  if (!isCanvasEmpty) {
    const userConfirmed = window.confirm(
      'Việc áp dụng mẫu sẽ xóa toàn bộ chiến lược hiện tại trên canvas. Bạn có chắc chắn muốn tiếp tục không?',
    )

    if (!userConfirmed) {
      // Nếu người dùng hủy, reset dropdown và không làm gì cả
      selectedTemplateId.value = ''
      return
    }
  }
  // --- KẾT THÚC NÂNG CẤP UX ---

  // Gọi action từ Pinia store nếu canvas rỗng hoặc người dùng đã xác nhận
  strategyStore.applyTemplate(selectedTemplate)

  // Reset dropdown về giá trị mặc định
  selectedTemplateId.value = ''
}

// --- TÁCH LOGIC: SỬ DỤNG COMPOSABLE CHO DRAG & DROP ---
const {
  activeDropZone,
  handleDragStart,
  handleDragEnd,
  handleDragOver,
  handleDragLeave,
  handleDrop,
} = useDragAndDrop(strategyStore)
</script>

<style scoped>
/* Các style cho layout chính không thay đổi */
.main-app-grid {
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-columns: 280px 1fr 350px;
  grid-template-rows: 64px 1fr;
  grid-template-areas:
    'header header header'
    'toolbox canvas inspector';
  /* [THAY ĐỔI] Thêm transition và padding-bottom */
  transition: padding-bottom 0.3s ease-in-out;
  padding-bottom: 0;
}
.main-app-grid.results-open {
  padding-bottom: calc(33.3333% - 24px); /* Chiều cao của drawer trừ đi padding của canvas */
}

/* Thêm một lớp để làm mờ toàn bộ UI khi tải dữ liệu ban đầu */
.is-loading {
  pointer-events: none;
  opacity: 0.7;
}
#app-header {
  grid-area: header;
}

#indicator-toolbox {
  grid-area: toolbox;
  min-height: 0; /* <-- THÊM DÒNG NÀY */
}
#strategy-canvas {
  grid-area: canvas;
  min-height: 0; /* <-- THÊM DÒNG NÀY */
}
#config-inspector-wrapper {
  grid-area: inspector;
  min-height: 0; /* <-- THÊM DÒNG NÀY */
}

.drop-zone.drag-over {
  background-color: #f0fdf4;
  border-style: dashed;
  border-color: #22c55e;
}
.drop-zone.drag-over-sell {
  background-color: #fef2f2;
  border-color: #ef4444;
}

/* ===== THÊM STYLE MỚI CHO TAB KẾT QUẢ ===== */
.tab-button.active {
  border-color: #2563eb; /* border-blue-600 */
  color: #2563eb; /* text-blue-600 */
  background-color: #eff6ff; /* bg-blue-50 */
}
.tab-content {
  animation: fadeIn 0.3s ease-in-out;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
