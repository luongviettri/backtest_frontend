<template>
  <div class="flex h-screen bg-background-secondary">
    <aside class="w-64 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col">
      <div class="h-16 flex items-center justify-center border-b border-gray-200">
        <svg class="h-8 w-auto text-accent-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
        </svg>
        <span class="ml-2 text-xl font-bold text-text-primary">Backtest</span>
      </div>
      <nav class="flex-1 p-4 space-y-2">
        <router-link :to="{ name: 'Dashboard' }" class="flex items-center px-4 py-2 text-gray-700 bg-gray-100 rounded-lg font-semibold">Dashboard</router-link>
        <a href="#" class="flex items-center px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg">Chiến lược</a>
        <a href="#" class="flex items-center px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg">Cài đặt</a>
      </nav>
    </aside>

    <div class="flex-1 flex flex-col overflow-hidden">
      <header class="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
        <div></div> <div class="flex items-center">
          <span class="text-sm font-medium text-text-secondary mr-4">Xin chào, {{ authStore.user?.name || 'User' }}!</span>
          <button @click="logout" class="px-4 py-2 text-sm font-medium text-white bg-status-danger rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
            Đăng xuất
          </button>
        </div>
      </header>
      <main class="flex-1 overflow-x-hidden overflow-y-auto bg-background-secondary p-6">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import apiClient from '@/api/axios';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const logout = async () => {
  try {
    await apiClient.post('/auth/logout');
  } catch (error) {
    console.error("Error during logout:", error);
  } finally {
    // Cập nhật state ở frontend
    authStore.logout();
    // Chuyển hướng về trang đăng nhập
    router.push({ name: 'Login' });
  }
};
</script>