<template>
  <Transition name="modal-fade">
    <div v-if="isVisible" id="simulation-modal-overlay" class="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div class="bg-slate-100 w-11/12 h-5/6 rounded-xl shadow-2xl flex flex-col">
        <!-- Header -->
        <header class="flex justify-between items-center p-4 border-b border-slate-200">
          <div class="flex items-center space-x-3">
            <vue-feather type="fast-forward" class="text-blue-600"></vue-feather>
            <h2 class="text-xl font-bold text-slate-800">Mô phỏng Trực quan</h2>
          </div>
          <button @click="closeModal" class="text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-full p-1.5">
            <vue-feather type="x" size="24"></vue-feather>
          </button>
        </header>

        <!-- Main Content -->
        <main class="flex-grow flex min-h-0">
          <!-- Chart Area -->
          <div class="flex-grow p-4 flex items-center justify-center bg-white">
            <div class="text-center text-slate-400">
              <p class="text-lg">Biểu đồ mô phỏng từng nến sẽ được hiển thị ở đây.</p>
              <p class="text-sm">(Đang tải dữ liệu cho chiến lược ID: {{ strategyId }})</p>
              <p class="mt-4">Bước hiện tại: <span class="font-bold text-slate-600">{{ currentStep }} / {{ totalSteps }}</span></p>
            </div>
          </div>

          <!-- Sidebar Stats -->
          <aside class="w-72 bg-white border-l border-slate-200 p-4 flex flex-col space-y-4">
            <h3 class="font-bold text-slate-800 text-base">Thông số Mô phỏng</h3>
            <div class="grid grid-cols-2 gap-4 text-center">
              <div class="bg-slate-50 p-3 rounded-lg">
                <p class="text-sm text-slate-500">Vốn Hiện tại</p>
                <p class="text-xl font-bold text-slate-800">${{ equity.toLocaleString() }}</p>
              </div>
              <div class="bg-slate-50 p-3 rounded-lg">
                <p class="text-sm text-slate-500">Lợi nhuận/Lỗ</p>
                <p class="text-xl font-bold" :class="pnl >= 0 ? 'text-green-600' : 'text-red-600'">{{ pnl >= 0 ? '+' : '' }}{{ pnl.toFixed(2) }}%</p>
              </div>
            </div>
             <div class="grid grid-cols-2 gap-4 text-center">
              <div class="bg-slate-50 p-3 rounded-lg">
                <p class="text-sm text-slate-500">Số lệnh</p>
                <p class="text-xl font-bold text-slate-800">{{ tradeCount }}</p>
              </div>
              <div class="bg-slate-50 p-3 rounded-lg">
                <p class="text-sm text-slate-500">Tỷ lệ thắng</p>
                <p class="text-xl font-bold text-slate-800">{{ winRate.toFixed(1) }}%</p>
              </div>
            </div>
            <div class="flex-grow overflow-y-auto border-t pt-4">
              <h4 class="font-semibold text-slate-700 mb-2">Lịch sử Lệnh</h4>
              <p class="text-xs text-slate-400 text-center">Lịch sử các lệnh đã thực hiện sẽ xuất hiện ở đây.</p>
            </div>
          </aside>
        </main>

        <!-- Footer Controls -->
        <footer class="flex items-center justify-between p-3 bg-white border-t border-slate-200 rounded-b-xl">
          <div class="flex items-center space-x-2">
            <button @click="togglePlay" class="w-10 h-10 flex items-center justify-center rounded-full text-white" :class="isPlaying ? 'bg-amber-500 hover:bg-amber-600' : 'bg-blue-500 hover:bg-blue-600'">
              <vue-feather :type="isPlaying ? 'pause' : 'play'" size="20" fill="white"></vue-feather>
            </button>
            <button @click="nextStep" class="w-10 h-10 flex items-center justify-center rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700">
              <vue-feather type="skip-forward" size="20"></vue-feather>
            </button>
          </div>
          <div class="flex items-center space-x-3 w-1/3">
            <vue-feather type="chevrons-right" size="16" class="text-slate-500"></vue-feather>
            <input type="range" min="1" max="10" v-model.number="speed" class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer">
            <span class="text-sm font-semibold text-slate-600 w-8 text-center">{{ speed }}x</span>
          </div>
        </footer>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, watch, onUnmounted } from 'vue';
import VueFeather from 'vue-feather';

const props = defineProps({
  isVisible: {
    type: Boolean,
    required: true,
  },
  strategyId: {
    type: [String, Number],
    default: null,
  },
});

const emit = defineEmits(['close']);

// --- LOCAL STATE ---
const simulationData = ref([]); // Sẽ chứa dữ liệu từ API
const currentStep = ref(0);
const totalSteps = ref(200); // Giả định có 200 nến
const isPlaying = ref(false);
const speed = ref(1); // Tốc độ 1x -> 10x
const intervalId = ref(null);

// Stats
const equity = ref(10000);
const pnl = ref(0);
const tradeCount = ref(0);
const winRate = ref(0);

// --- METHODS ---
function closeModal() {
  pause(); // Dừng mô phỏng khi đóng
  emit('close');
}

function togglePlay() {
  isPlaying.value = !isPlaying.value;
}

function play() {
  if (intervalId.value) clearInterval(intervalId.value);
  const delay = 1000 / speed.value; // Tính toán độ trễ dựa trên tốc độ
  intervalId.value = setInterval(() => {
    if (currentStep.value < totalSteps.value) {
      currentStep.value++;
    } else {
      pause(); // Tự động dừng khi hết
    }
  }, delay);
}

function pause() {
  isPlaying.value = false;
  if (intervalId.value) {
    clearInterval(intervalId.value);
    intervalId.value = null;
  }
}

function nextStep() {
  if (currentStep.value < totalSteps.value) {
    currentStep.value++;
  }
}

// --- WATCHERS ---
watch(isPlaying, (newVal) => {
  if (newVal) play();
  else pause();
});

watch(speed, () => {
  if (isPlaying.value) play(); // Cập nhật lại interval với tốc độ mới
});

onUnmounted(() => {
  pause(); // Dọn dẹp interval khi component bị hủy
});
</script>

<style scoped>
.modal-fade-enter-active, .modal-fade-leave-active {
  transition: opacity 0.3s ease;
}
.modal-fade-enter-from, .modal-fade-leave-to {
  opacity: 0;
}
</style>