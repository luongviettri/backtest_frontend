<template>
  <div class="p-8 view-content">
    <header class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
      <h1 class="text-3xl font-bold text-text-primary mb-4 md:mb-0">
        Chiến lược của tôi
      </h1>
      <button
        @click="isModalOpen = true"
        class="flex items-center justify-center px-5 py-3 text-white font-semibold rounded-lg shadow-md bg-accent-primary hover:bg-accent-hover transition-colors duration-300"
      >
        <vue-feather type="plus" class="mr-2 w-5 h-5"></vue-feather>
        Tạo chiến lược mới
      </button>
    </header>

    <div v-if="isLoading" class="text-center text-text-secondary">
      Đang tải danh sách chiến lược...
    </div>

    <div v-else-if="strategies.length === 0" class="text-center bg-white p-12 rounded-lg border-2 border-dashed border-slate-300">
        <vue-feather type="archive" size="48" class="mx-auto text-slate-400 mb-4"></vue-feather>
        <h2 class="text-xl font-semibold text-text-primary">Tủ chiến lược của bạn còn trống</h2>
        <p class="text-text-secondary mt-2 mb-6">Hãy bắt đầu hành trình bằng cách tạo chiến lược đầu tiên!</p>
        <button @click="isModalOpen = true" class="flex items-center justify-center mx-auto px-5 py-3 text-white font-semibold rounded-lg shadow-md bg-accent-primary hover:bg-accent-hover transition-colors duration-300">
            <vue-feather type="plus" class="mr-2 w-5 h-5"></vue-feather>
            Tạo chiến lược mới
        </button>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      <div
        v-for="strategy in strategies"
        :key="strategy.id"
        class="bg-background-secondary rounded-lg p-6 shadow-sm hover:shadow-lg transition-all duration-300"
      >
        <div class="flex justify-between items-start mb-4">
          <h2 class="text-xl font-semibold text-text-primary">{{ strategy.name }}</h2>
        </div>
        
        <p class="text-sm text-text-secondary mb-6 min-h-[40px]">
          {{ strategy.description || 'Chưa có mô tả.' }}
        </p>
        
        <div class="flex justify-end items-center border-t border-gray-200 pt-4">
          <button @click="goToEdit(strategy.id)" class="flex items-center px-4 py-2 text-sm text-text-secondary hover:bg-gray-200 rounded-md mr-2">
              <vue-feather type="edit-2" class="w-4 h-4 mr-2"></vue-feather>Chỉnh sửa
          </button>
          <button @click="handleDelete(strategy.id)" class="flex items-center px-4 py-2 text-sm text-status-danger hover:bg-red-50 rounded-md">
              <vue-feather type="trash-2" class="w-4 h-4 mr-2"></vue-feather>Xóa
          </button>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="isModalOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl p-8 max-w-lg w-full">
        <h2 class="text-2xl font-bold mb-6">Bạn muốn xây dựng loại chiến lược nào?</h2>
        <div class="space-y-4">
          <button @click="createFromTemplate('trend_following')" class="w-full text-left p-4 rounded-lg border hover:bg-gray-100">
            <h3 class="font-semibold text-lg">Giao dịch theo Xu hướng (Trend Following)</h3>
            <p class="text-sm text-gray-600">Sử dụng các chỉ báo như MA, MACD để xác định và đi theo xu hướng thị trường.</p>
          </button>
          <button @click="createFromTemplate('range_trading')" class="w-full text-left p-4 rounded-lg border hover:bg-gray-100">
            <h3 class="font-semibold text-lg">Giao dịch trong Biên độ (Range Trading)</h3>
            <p class="text-sm text-gray-600">Tận dụng các vùng quá mua, quá bán với các chỉ báo như RSI, Stochastic.</p>
          </button>
          <button @click="goToCreate" class="w-full text-left p-4 rounded-lg border hover:bg-gray-100">
            <h3 class="font-semibold text-lg">Tùy chỉnh Nâng cao</h3>
            <p class="text-sm text-gray-600">Xây dựng một chiến lược hoàn toàn mới từ đầu.</p>
          </button>
        </div>
        <div class="text-right mt-6">
          <button @click="isModalOpen = false" class="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg">Hủy</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import strategyApi from '@/api/strategyApi';
import VueFeather from 'vue-feather';

const strategies = ref([]);
const isLoading = ref(true);
const isModalOpen = ref(false);
const router = useRouter();

const fetchStrategies = async () => {
  try {
    const response = await strategyApi.getStrategies();
    strategies.value = response.data;
  } catch (error) {
    console.error('Lỗi khi tải chiến lược:', error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchStrategies();
});

const goToCreate = () => {
  // [SỬA ĐỔI] Chuyển hướng nút "Tùy chỉnh Nâng cao" đến builder nâng cao
  router.push({ name: 'StrategyBuilderAdvanced' });
  isModalOpen.value = false;
};

const createFromTemplate = (templateId) => {
  let routeName;
  if (templateId === 'trend_following') {
    // [SỬA ĐỔI] Chuyển hướng nút "Giao dịch theo Xu hướng" đến builder xu hướng
    routeName = 'StrategyBuilderTrend';
  } else if (templateId === 'range_trading') {
    routeName = 'StrategyBuilderRange';
  }
  
  if (routeName) {
    // Thêm query param để StrategyTester có thể áp dụng mẫu tương ứng nếu cần
    router.push({ name: routeName, query: { template: 'trend' } });
  }
  isModalOpen.value = false;
};

const goToEdit = (id) => {
  // Assume all edits go to the advanced builder for now
  router.push({ name: 'StrategyBuilderAdvanced', params: { id } });
};

const handleDelete = async (id) => {
  if (confirm('Bạn có chắc chắn muốn xóa chiến lược này không?')) {
    try {
      await strategyApi.deleteStrategy(id);
      strategies.value = strategies.value.filter(s => s.id !== id);
    } catch (error) {
      console.error('Lỗi khi xóa chiến lược:', error);
    }
  }
};
</script>