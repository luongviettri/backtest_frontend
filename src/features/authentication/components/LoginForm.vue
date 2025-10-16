<template>
  <div class="max-w-md w-full bg-background-primary p-8 rounded-2xl shadow-lg space-y-6">
    <div class="flex justify-center">
      <svg class="h-12 w-auto text-accent-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" /></svg>
    </div>
    <h1 class="text-center text-3xl font-bold text-text-primary">Chào mừng trở lại!</h1>
    <div class="space-y-4">
      <button class="w-full inline-flex items-center justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-base font-medium text-gray-700 hover:bg-gray-50"><svg class="h-6 w-6 mr-3" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C42.022,35.244,44,30.036,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path></svg>
        Tiếp tục với Google
      </button>
    </div>
    <div class="relative">
      <div class="absolute inset-0 flex items-center"><div class="w-full border-t border-gray-300"></div></div>
      <div class="relative flex justify-center text-sm"><span class="px-2 bg-background-primary text-gray-500">HOẶC</span></div>
    </div>
    <form @submit.prevent="handleSubmit" class="space-y-5" novalidate>
      <div v-if="apiError" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert"><span class="block sm:inline">{{ apiError }}</span></div>
      <div>
        <label for="email" class="text-sm font-medium text-text-secondary">Email</label>
        <div class="mt-1">
          <input id="email" v-model="form.email" @blur="v$.email.$touch()" type="email" autocomplete="email" placeholder="vidu@email.com" :class="['appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-accent-primary focus:border-accent-primary sm:text-sm', v$.email.$error ? 'border-status-danger' : 'border-gray-300']"/>
          <p v-if="v$.email.$error" class="mt-2 text-sm text-status-danger">{{ v$.email.$errors[0].$message }}</p>
        </div>
      </div>
      <div>
        <label for="password" class="text-sm font-medium text-text-secondary">Mật khẩu</label>
        <div class="mt-1">
          <input id="password" v-model="form.password" @blur="v$.password.$touch()" type="password" autocomplete="current-password" placeholder="••••••••" :class="['appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-accent-primary focus:border-accent-primary sm:text-sm', v$.password.$error ? 'border-status-danger' : 'border-gray-300']"/>
           <p v-if="v$.password.$error" class="mt-2 text-sm text-status-danger">{{ v$.password.$errors[0].$message }}</p>
        </div>
      </div>
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <input id="remember-me" v-model="form.rememberMe" type="checkbox" class="h-4 w-4 text-accent-primary focus:ring-accent-primary border-gray-300 rounded" />
          <label for="remember-me" class="ml-2 block text-sm text-gray-900">Ghi nhớ tôi</label>
        </div>
        <div class="text-sm"><a href="#" class="font-medium text-accent-primary hover:text-accent-hover">Quên mật khẩu?</a></div>
      </div>
      <div><button type="submit" class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-accent-primary hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-primary disabled:opacity-50" :disabled="v$.$invalid">Đăng Nhập</button></div>
    </form>
    <p class="text-center text-sm text-gray-600">
      Chưa có tài khoản?
      <router-link :to="{ name: 'Register' }" class="font-medium text-accent-primary hover:text-accent-hover">Tạo tài khoản mới</router-link>
    </p>
  </div>
</template>

<script setup>
import { reactive, computed, ref } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { required, email, helpers } from '@vuelidate/validators';
import { useRouter } from 'vue-router';
import apiClient from '@/api/axios';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();
const apiError = ref(null);

const form = reactive({ email: '', password: '', rememberMe: false });

const rules = computed(() => ({
  email: {
    required: helpers.withMessage('Vui lòng nhập email.', required),
    email: helpers.withMessage('Email không đúng định dạng.', email),
  },
  password: { required: helpers.withMessage('Vui lòng nhập mật khẩu.', required) },
}));

const v$ = useVuelidate(rules, form);

const handleSubmit = async () => {
  apiError.value = null;
  const isFormCorrect = await v$.value.$validate();
  if (!isFormCorrect) return;

  // SỬA ĐỔI QUAN TRỌNG: Gửi object JSON thay vì URLSearchParams
  try {
    const response = await apiClient.post('/auth/login', {
      username: form.email,
      password: form.password,
      remember_me: form.rememberMe // Gửi trạng thái của checkbox
    });

    const userData = response.data;
    authStore.setUser(userData);
    router.push({ name: 'Dashboard' });

  } catch (error) {
    if (error.response && error.response.data) {
      apiError.value = error.response.data.detail;
    } else {
      apiError.value = 'Đã có lỗi xảy ra. Vui lòng thử lại.';
    }
    console.error('Lỗi đăng nhập:', error);
  }
};
</script>