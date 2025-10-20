<template>
  <div class="max-w-md w-full bg-background-primary p-8 rounded-2xl shadow-lg space-y-6">
    <div class="flex justify-center">
      <svg class="h-12 w-auto text-accent-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" /></svg>
    </div>
    <h1 class="text-center text-3xl font-bold text-text-primary">Chào mừng trở lại!</h1>
    
    <div v-if="apiError" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
      <span class="block sm:inline">{{ apiError }}</span>
    </div>

    <div class="space-y-4">
      <div id="google-signin-button" class="flex justify-center"></div>
      <div class="relative">
        <div class="absolute inset-0 flex items-center">
          <div class="w-full border-t border-gray-300"></div>
        </div>
        <div class="relative flex justify-center text-sm">
          <span class="px-2 bg-background-primary text-gray-500">Hoặc tiếp tục với</span>
        </div>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <BaseInput v-model="form.email" @blur="v$.email.$touch" id="email" name="email" type="email" autocomplete="email" :error="v$.email.$error" placeholder="Địa chỉ email" />
          <p v-if="v$.email.$error" class="text-red-500 text-xs mt-1">{{ v$.email.$errors[0].$message }}</p>
        </div>
        <div>
          <BaseInput v-model="form.password" @blur="v$.password.$touch" id="password" name="password" type="password" autocomplete="current-password" :error="v$.password.$error" placeholder="Mật khẩu" />
          <p v-if="v$.password.$error" class="text-red-500 text-xs mt-1">{{ v$.password.$errors[0].$message }}</p>
        </div>
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <input v-model="form.rememberMe" id="remember-me" name="remember-me" type="checkbox" class="h-4 w-4 text-accent-primary focus:ring-accent-primary border-gray-300 rounded">
            <label for="remember-me" class="ml-2 block text-sm text-gray-900">Ghi nhớ tôi</label>
          </div>
          <div class="text-sm">
            <a href="#" class="font-medium text-accent-primary hover:text-accent-secondary">Quên mật khẩu?</a>
          </div>
        </div>
        <div>
          <BaseButton type="submit">Đăng nhập</BaseButton>
        </div>
      </form>
    </div>
    <p class="text-center text-sm text-gray-600">
      Chưa có tài khoản?
      <router-link :to="{ name: 'Register' }" class="font-medium text-accent-primary hover:text-accent-secondary">
        Đăng ký
      </router-link>
    </p>
  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted } from 'vue';
import useVuelidate from '@vuelidate/core';
import { required, email, helpers } from '@vuelidate/validators';
import { useRouter } from 'vue-router';
import BaseInput from '@/components/base/BaseInput.vue';
import BaseButton from '@/components/base/BaseButton.vue';
import apiClient from '@/api/axios';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();
const apiError = ref(null);
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const form = reactive({ email: '', password: '', rememberMe: false });

// --- BẮT ĐẦU NÂNG CẤP LOGIC GOOGLE ---

// Hàm callback xử lý sau khi đăng nhập Google thành công (không đổi)
window.handleGoogleCredentialResponse = async (response) => {
  apiError.value = null;
  try {
    const res = await apiClient.post('/auth/google-jwt', { credential: response.credential });
    authStore.setUser(res.data);
    router.push({ name: 'Dashboard' });
  } catch (error) {
    console.error("❌ [FRONTEND] Lỗi khi xác thực token với backend:", error);
    apiError.value = error.response?.data?.detail || 'Xác thực với Google thất bại. Vui lòng thử lại.';
  }
};

// Hàm mới: "Kiên nhẫn" khởi tạo Google Sign-In để chống lỗi Race Condition
const initializeGsi = (retryCount = 0) => {
  // Nếu đối tượng 'google' đã tồn tại, tiến hành khởi tạo
  if (typeof google !== 'undefined') {
    console.log('✅ Google Script đã sẵn sàng. Bắt đầu khởi tạo...');
    google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: window.handleGoogleCredentialResponse,
    });
    google.accounts.id.renderButton(
      document.getElementById('google-signin-button'),
      { theme: 'outline', size: 'large', type: 'standard', text: 'signin_with', width: '334' }
    );
    return; // Kết thúc thành công
  }

  // Nếu đã thử quá 10 lần (khoảng 1 giây) mà vẫn chưa được, báo lỗi và dừng lại
  if (retryCount >= 10) {
    const errorMsg = "Không thể tải dịch vụ đăng nhập Google. Vui lòng kiểm tra kết nối mạng và thử lại.";
    console.error(`❌ [FRONTEND] ${errorMsg}`);
    apiError.value = errorMsg;
    return;
  }

  // Nếu chưa có 'google', đợi 100ms rồi thử lại
  console.log('⏳ Script Google chưa sẵn sàng, thử lại sau 100ms...');
  setTimeout(() => {
    initializeGsi(retryCount + 1);
  }, 100);
};

onMounted(() => {
  // Khi component được mount, bắt đầu quá trình khởi tạo "kiên nhẫn"
  initializeGsi();
});

// --- KẾT THÚC NÂNG CẤP ---

// --- Logic form email/password (không thay đổi) ---
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

  try {
    const response = await apiClient.post('/auth/login', {
      username: form.email,
      password: form.password,
      remember_me: form.rememberMe
    });

    const userData = response.data;
    authStore.setUser(userData);
    router.push({ name: 'Dashboard' });

  } catch (error) {
    if (error.response && error.response.data) {
      apiError.value = error.response.data.detail;
    } else {
      apiError.value = 'Đã xảy ra lỗi không xác định. Vui lòng thử lại.';
    }
  }
};
</script>