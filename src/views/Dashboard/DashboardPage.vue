<template>
  <div v-if="!loading">
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

    <div v-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
      <p>Lỗi: {{ error }}</p>
    </div>

    <div v-else-if="userData" class="bg-background-primary p-6 rounded-lg shadow">
      <h2 class="text-xl font-semibold">
        Chào mừng trở lại, {{ userData.full_name || userData.email }}!
      </h2>
      <p class="text-text-secondary mt-2">Đây là trang quản trị của bạn.</p>
    </div>
  </div>
  <div v-else class="text-center text-gray-500">
    <p>Đang tải dữ liệu...</p>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const loading = ref(false) // Không cần loading phức tạp nữa
const error = ref(null)

// Lấy dữ liệu người dùng trực tiếp từ store
const userData = computed(() => authStore.user)

const handleLogout = async () => {
  await authStore.logout()
}

// onMounted không cần làm gì nữa vì auth guard đã xử lý việc lấy dữ liệu người dùng.
// Nếu người dùng vào được trang này, authStore.user đã phải có dữ liệu.
onMounted(() => {
  // Có thể thêm logic khác ở đây nếu cần khi component được mount
})
</script>
