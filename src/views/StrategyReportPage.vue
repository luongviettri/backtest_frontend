<template>
  <div class="p-6 md:p-8 bg-slate-50 min-h-full">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <header class="flex flex-col md:flex-row justify-between md:items-center mb-8">
        <div>
          <h1 class="text-2xl md:text-3xl font-bold text-slate-800">Báo cáo Chi tiết Chiến lược</h1>
          <p v-if="!isLoading" class="text-slate-500 mt-1">
            Kết quả backtest cho chiến lược ID: <span class="font-semibold text-slate-600">{{ strategyId }}</span>
          </p>
        </div>
        <button @click="goBack" class="mt-4 md:mt-0 flex items-center space-x-2 font-semibold text-slate-600 hover:text-slate-900 px-4 py-2 rounded-md hover:bg-slate-200 self-start">
          <vue-feather type="arrow-left" size="18"></vue-feather>
          <span>Quay lại Builder</span>
        </button>
      </header>

      <!-- Loading/Error State -->
      <div v-if="isLoading" class="text-center py-20 text-slate-500">
        <vue-feather type="loader" size="32" class="animate-spin mx-auto mb-4"></vue-feather>
        <p>Đang tải dữ liệu báo cáo...</p>
      </div>
      <div v-else-if="error" class="bg-red-100 p-4 rounded-lg text-red-700">
        <p><strong>Lỗi:</strong> {{ error }}</p>
      </div>

      <!-- Main Content -->
      <main v-else-if="reportData" class="space-y-8">
        <!-- Overview Stats Cards -->
        <section class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          <div class="bg-white p-4 rounded-lg shadow-sm text-center">
            <p class="text-sm text-slate-500">Tổng Lợi nhuận</p>
            <p class="text-3xl font-bold text-green-600 mt-1">+{{ reportData.overview.total_profit_percent?.toFixed(2) }}%</p>
          </div>
          <div class="bg-white p-4 rounded-lg shadow-sm text-center">
            <p class="text-sm text-slate-500">Tỷ lệ Thắng</p>
            <p class="text-3xl font-bold text-slate-800 mt-1">{{ reportData.overview.win_rate?.toFixed(2) }}%</p>
          </div>
          <div class="bg-white p-4 rounded-lg shadow-sm text-center">
            <p class="text-sm text-slate-500">Tổng số Lệnh</p>
            <p class="text-3xl font-bold text-slate-800 mt-1">{{ reportData.overview.total_trades }}</p>
          </div>
          <div class="bg-white p-4 rounded-lg shadow-sm text-center">
            <p class="text-sm text-slate-500">Lợi nhuận/Rủi ro</p>
            <p class="text-3xl font-bold text-slate-800 mt-1">{{ reportData.overview.profit_factor?.toFixed(2) || 'N/A' }}</p>
          </div>
          <div class="bg-white p-4 rounded-lg shadow-sm text-center col-span-2 md:col-span-1 lg:col-span-1">
            <p class="text-sm text-slate-500">Max Drawdown</p>
            <p class="text-3xl font-bold text-red-600 mt-1">-12.5%</p>
          </div>
        </section>

        <!-- Charts -->
        <section class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div class="bg-white p-6 rounded-lg shadow-sm h-96 flex items-center justify-center">
            <p class="text-slate-400">Biểu đồ tăng trưởng vốn (Equity Curve) sẽ ở đây</p>
          </div>
          <div class="bg-white p-6 rounded-lg shadow-sm h-96 flex items-center justify-center">
            <p class="text-slate-400">Biểu đồ phân bổ Lợi nhuận/Lỗ sẽ ở đây</p>
          </div>
        </section>

        <!-- Trade History Table -->
        <section class="bg-white p-6 rounded-lg shadow-sm">
           <h2 class="text-xl font-bold text-slate-800 mb-4">Lịch sử Giao dịch</h2>
           <div class="h-96 overflow-y-auto">
              <p class="text-slate-400 text-center pt-10">Bảng lịch sử giao dịch chi tiết sẽ ở đây.</p>
           </div>
        </section>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import VueFeather from 'vue-feather';
// import backtestApi from '@/api/backtestApi'; // Sẽ được sử dụng trong tương lai

const route = useRoute();
const router = useRouter();

const strategyId = ref(route.params.id);
const reportData = ref(null);
const isLoading = ref(true);
const error = ref(null);

onMounted(async () => {
  // TODO: Gọi API thực tế để lấy dữ liệu báo cáo
  // const response = await backtestApi.getLatestReport(strategyId.value);
  // reportData.value = response.data;
  // Hiện tại, chúng ta sẽ giả lập dữ liệu và độ trễ
  setTimeout(() => {
    reportData.value = { overview: { total_profit_percent: 123.45, win_rate: 62.5, total_trades: 88, profit_factor: 2.1 } };
    isLoading.value = false;
  }, 1500);
});

function goBack() {
  router.push({ name: 'StrategyBuilderAdvanced', params: { id: strategyId.value } });
}
</script>