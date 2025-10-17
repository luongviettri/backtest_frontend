<template>
  <div class="p-8 view-content">
    <header class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
      <h1 class="text-3xl font-bold text-text-primary mb-4 md:mb-0">
        Chiến lược của tôi
      </h1>
      <button
        @click="goToCreate"
        class="flex items-center justify-center px-5 py-3 text-white font-semibold rounded-lg shadow-md bg-accent-primary hover:bg-accent-hover transition-colors duration-300"
      >
        <i data-feather="plus" class="mr-2 w-5 h-5"></i>
        Tạo chiến lược mới
      </button>
    </header>

    <div v-if="isLoading" class="text-center text-text-secondary">
      Đang tải danh sách chiến lược...
    </div>

    <div v-else-if="strategies.length === 0" class="text-center bg-background-secondary p-12 rounded-lg shadow-sm">
        <h2 class="text-xl font-semibold text-text-primary">Chưa có chiến lược nào</h2>
        <p class="text-text-secondary mt-2">Hãy bắt đầu bằng cách tạo chiến lược đầu tiên của bạn!</p>
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
              <i data-feather="edit-2" class="w-4 h-4 mr-2"></i>Chỉnh sửa
          </button>
          <button @click="handleDelete(strategy.id)" class="flex items-center px-4 py-2 text-sm text-status-danger hover:bg-red-50 rounded-md">
              <i data-feather="trash-2" class="w-4 h-4 mr-2"></i>Xóa
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUpdated, nextTick } from 'vue'; // 1. Thêm onUpdated
import { useRouter } from 'vue-router';
import strategyApi from '@/services/strategyApi';
import feather from 'feather-icons';

const strategies = ref([]);
const isLoading = ref(true);
const router = useRouter();

const fetchStrategies = async () => {
  try {
    const response = await strategyApi.getStrategies();
    strategies.value = response.data;
  } catch (error) {
    console.error('Lỗi khi tải chiến lược:', error);
  } finally {
    isLoading.value = false;
    // nextTick vẫn tốt để đảm bảo DOM đã cập nhật cho lần tải đầu tiên
    await nextTick(); 
    feather.replace();
  }
};

// 2. Sử dụng onUpdated để tự động render lại icon mỗi khi component cập nhật
onUpdated(() => {
  feather.replace();
});

onMounted(() => {
  fetchStrategies();
});

const goToCreate = () => {
  router.push('/strategies/builder');
};

const goToEdit = (id) => {
  router.push(`/strategies/builder/${id}`);
};

const handleDelete = async (id) => {
  if (confirm('Bạn có chắc chắn muốn xóa chiến lược này không?')) {
    try {
      await strategyApi.deleteStrategy(id);
      strategies.value = strategies.value.filter(s => s.id !== id);
      // Giờ đây bạn không cần gọi feather.replace() ở đây nữa
    } catch (error) {
      console.error('Lỗi khi xóa chiến lược:', error);
    }
  }
};
</script>