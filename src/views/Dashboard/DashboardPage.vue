<template>
  <div class="p-8">
    <h1 class="text-3xl font-bold text-text-primary mb-6">Dashboard</h1>
    
    <div v-if="loading" class="text-center text-gray-500">
      <p>Đang xác thực và tải dữ liệu...</p>
    </div>

    <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
      <p>Lỗi: {{ error }}</p>
    </div>

    <div v-else-if="userData" class="bg-white p-6 rounded-lg shadow">
      <h2 class="text-xl font-semibold">Chào mừng trở lại, {{ userData.email }}!</h2>
      <p class="text-gray-600 mt-2">Đây là trang quản trị của bạn.</p>
      </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
// SỬA ĐỔI QUAN TRỌNG: Sử dụng apiClient đã cấu hình, không dùng axios gốc
import apiClient from '@/api/axios'; // Dùng alias '@' cho an toàn

const userData = ref(null);
const loading = ref(true);
const error = ref(null);

// onMounted là một hook sẽ chạy ngay khi component được hiển thị
onMounted(async () => {
  try {
    // ĐÂY CHÍNH LÀ "CẢM BIẾN":
    // Cố gắng gọi đến một endpoint được bảo vệ.
    // Nếu thành công, hiển thị dữ liệu.
    // Nếu thất bại với lỗi 401, interceptor sẽ tự động chuyển hướng.
    const response = await apiClient.get('/users/me'); 
    userData.value = response.data;
  } catch (err) {
    // Interceptor sẽ xử lý lỗi 401. 
    // Chúng ta chỉ cần xử lý các lỗi khác ở đây (ví dụ: 500 Server Error)
    if (err.response?.status !== 401) {
       error.value = 'Không thể tải dữ liệu dashboard. Vui lòng thử lại sau.';
    }
    console.error('Lỗi khi fetch dữ liệu người dùng:', err);
  } finally {
    loading.value = false;
  }
});
</script>