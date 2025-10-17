<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-text-primary">Dashboard</h1>
      <button 
        v-if="userData" 
        @click="handleLogout" 
        class="bg-status-danger hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
      >
        Đăng xuất
      </button>
    </div>
    
    <div v-if="loading" class="text-center text-gray-500">
      <p>Đang xác thực và tải dữ liệu...</p>
    </div>

    <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
      <p>Lỗi: {{ error }}</p>
    </div>

    <div v-else-if="userData" class="bg-background-primary p-6 rounded-lg shadow">
      <h2 class="text-xl font-semibold">Chào mừng trở lại, {{ userData.full_name || userData.email }}!</h2>
      <p class="text-text-secondary mt-2">Đây là trang quản trị của bạn.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import apiClient from '@/api/axios';
import { useAuthStore } from '@/stores/auth';

const userData = ref(null);
const loading = ref(true);
const error = ref(null);
const authStore = useAuthStore();

const handleLogout = async () => {
  await authStore.logout(); 
};

onMounted(async () => {
  try {
    const response = await apiClient.get('/users/me'); 
    userData.value = response.data;
  } catch (err) {
    if (err.response?.status !== 401) {
       error.value = 'Không thể tải dữ liệu dashboard. Vui lòng thử lại sau.';
    }
    console.error('Lỗi khi fetch dữ liệu người dùng:', err);
  } finally {
    loading.value = false;
  }
});
</script>