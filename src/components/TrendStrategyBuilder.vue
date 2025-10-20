<template>
  <div class="relative w-full h-screen overflow-hidden">
    <main id="main-app" class="main-app-grid" :class="{ 'is-loading': isLoading, 'results-open': strategyStore.isShowingResults }">
      <header id="app-header" class="bg-white border-b border-slate-200 flex items-center justify-between px-6">
        <div class="flex items-center space-x-4">
          <div class="flex items-center space-x-2">
            <vue-feather type="sliders" size="20" class="text-slate-500"></vue-feather>
            <h1 class="text-xl font-bold text-slate-800">Builder theo Xu hướng</h1>
          </div>
          <div class="h-6 border-l border-slate-300"></div>
          <input
            type="text"
            :value="strategyStore.strategyName"
            @input="strategyStore.updateStrategyName($event.target.value)"
            class="text-base font-semibold text-slate-700 bg-transparent focus:outline-none focus:ring-0 border-0 p-0"
            placeholder="Nhập tên chiến lược..."
          />
        </div>
        <div class="flex items-center space-x-4">
          <div class="flex items-center space-x-3">
            <button
              @click="strategyStore.manualSaveStrategy()"
              :disabled="strategyStore.isSaving"
              class="font-semibold text-slate-600 hover:text-slate-900 px-4 py-2 rounded-md hover:bg-slate-100 disabled:text-slate-400 disabled:bg-transparent whitespace-nowrap"
            >
              <span v-if="strategyStore.isSaving">Đang lưu...</span>
              <span v-else>Lưu Chiến Lược</span>
            </button>
            <span v-if="strategyStore.lastSavedAt && !strategyStore.isSaving" class="text-xs text-slate-500 whitespace-nowrap">
              Đã lưu lúc {{ new Date(strategyStore.lastSavedAt).toLocaleTimeString() }}
            </span>
          </div>
          <button
            id="run-test-btn"
            class="bg-emerald-500 text-white font-bold px-5 py-2 rounded-lg shadow-sm hover:bg-emerald-600 transition-colors flex items-center space-x-2 disabled:bg-slate-400 disabled:cursor-wait"
            @click="runBacktest"
            :disabled="isLoading || !canRunBacktest"
          >
            <vue-feather v-if="isLoading" type="loader" size="20" class="animate-spin"></vue-feather>
            <vue-feather v-else type="play" size="20"></vue-feather>
            <span id="run-test-btn-text">{{ isLoading ? 'Đang xử lý...' : 'Chạy Kiểm Tra' }}</span>
          </button>
        </div>
      </header>

      <aside id="indicator-toolbox" class="bg-white border-r border-slate-200 p-4 flex flex-col">
        <h2 class="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">
          Chỉ báo Xu hướng
        </h2>
        <div class="relative flex-grow overflow-y-auto pr-2 space-y-3">
          <IndicatorCard
            v-for="indicator in availableIndicators"
            :key="indicator.type"
            :indicator="indicator"
            @dragstart="handleDragStart"
            @dragend="handleDragEnd"
          />
        </div>
      </aside>

      <div id="strategy-canvas" class="grid grid-cols-2 gap-4 p-4 bg-slate-50">
        <div class="col-span-1 bg-white rounded-lg border border-slate-200 p-4">
            <h3 class="text-lg font-semibold text-slate-700 mb-4 text-center">Khu vực 1: Bộ lọc Xu hướng dài hạn</h3>
            <div
                class="drop-zone h-full"
                :class="{ 'drag-over': activeDropZone === 'filters' }"
                @dragover.prevent="handleDragOver('filters')"
                @dragleave.prevent="handleDragLeave"
                @drop="handleDrop"
            >
                <LogicBlock
                    v-for="condition in strategyStore.filters"
                    :key="condition.id"
                    :condition="condition"
                    :is-selected="strategyStore.selectedCondition && strategyStore.selectedCondition.id === condition.id"
                    @select="strategyStore.selectCondition(condition)"
                    @delete="strategyStore.deleteCondition('filters', condition.id)"
                />
            </div>
        </div>
        <div class="col-span-1 bg-white rounded-lg border border-slate-200 p-4">
            <h3 class="text-lg font-semibold text-slate-700 mb-4 text-center">Khu vực 2: Tín hiệu Vào/Ra lệnh</h3>
            <div
                class="drop-zone h-full"
                :class="{ 'drag-over': activeDropZone === 'signals' }"
                @dragover.prevent="handleDragOver('signals')"
                @dragleave.prevent="handleDragLeave"
                @drop="handleDrop"
            >
                <LogicBlock
                    v-for="condition in strategyStore.signals"
                    :key="condition.id"
                    :condition="condition"
                    :is-selected="strategyStore.selectedCondition && strategyStore.selectedCondition.id === condition.id"
                    @select="strategyStore.selectCondition(condition)"
                    @delete="strategyStore.deleteCondition('signals', condition.id)"
                />
            </div>
        </div>
      </div>

      <div id="config-inspector-wrapper" class="bg-slate-50 border-l border-slate-200 p-4 space-y-4 overflow-y-auto min-h-0">
        <!-- Inspector will be simplified later -->
        <div v-if="!strategyStore.selectedCondition" class="text-center text-slate-400 pt-16">
            <vue-feather type="edit-3" size="40" class="mb-2 mx-auto"></vue-feather>
            <p class="font-semibold">Chọn một khối logic</p>
            <p class="text-sm">để bắt đầu cấu hình.</p>
        </div>
        <div v-else>
            <!-- Simplified Inspector to be implemented here -->
            <p>Inspector for {{ strategyStore.selectedCondition.type }}</p>
        </div>
      </div>

    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, watchEffect } from 'vue';
import VueFeather from 'vue-feather';
import { useRoute, useRouter } from 'vue-router';
import { useStrategyStore } from '@/stores/strategy';
import IndicatorCard from './IndicatorCard.vue';
import LogicBlock from './LogicBlock.vue';
import { INDICATOR_TYPES } from '@/utils/constants';
import { useDragAndDrop } from '@/composables/useDragAndDrop.js';
import { useToast } from 'vue-toastification';

const toast = useToast();
const strategyStore = useStrategyStore();
const route = useRoute();
const router = useRouter();

const availableIndicators = ref([
    { type: INDICATOR_TYPES.MA, name: 'Moving Average', description: 'Đường trung bình động', icon: 'trending-up', color: 'purple' },
    { type: INDICATOR_TYPES.MACD, name: 'MACD', description: 'Moving Average Convergence', icon: 'git-merge', color: 'indigo' },
    // Add other trend indicators like Parabolic SAR, ADX here later
]);

const isLoading = ref(false);
const error = ref(null);

const strategyId = computed(() => route.params.id);
const isEditMode = computed(() => !!strategyId.value);

const canRunBacktest = computed(() => {
  return strategyStore.signals.length > 0;
});

onMounted(async () => {
  if (isEditMode.value) {
    await strategyStore.loadStrategy(strategyId.value);
  } else {
    await strategyStore.loadStrategy(null); // Resets the store for a new strategy
  }
});

const { 
  activeDropZone, 
  handleDragStart, 
  handleDragEnd, 
  handleDragOver, 
  handleDragLeave, 
  handleDrop 
} = useDragAndDrop(strategyStore);

// Other methods like runBacktest, etc. would be here

</script>

<style scoped>
.main-app-grid {
  display: grid;
  grid-template-columns: 280px 1fr 350px;
  grid-template-rows: 64px 1fr;
  grid-template-areas:
    "header header header"
    "toolbox canvas inspector";
}

#strategy-canvas {
    grid-area: canvas;
}

.drop-zone {
    min-height: 100px;
    border: 2px dashed #ccc;
    border-radius: 8px;
    padding: 1rem;
    transition: background-color 0.2s ease;
}

.drop-zone.drag-over {
  background-color: #f0fdf4;
  border-color: #22c55e;
}

/* Other styles from StrategyTester.vue */
</style>