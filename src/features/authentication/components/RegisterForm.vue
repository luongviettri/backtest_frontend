<template>
  <div class="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg space-y-6">
    <div class="flex justify-center">
      <svg class="h-12 w-auto text-accent-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" /></svg>
    </div>
    <h1 class="text-center text-3xl font-bold text-gray-900">Tạo tài khoản</h1>
    <div class="space-y-4">
      <button class="w-full inline-flex items-center justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-base font-medium text-gray-700 hover:bg-gray-50"><svg class="h-6 w-6 mr-3" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C42.022,35.244,44,30.036,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path></svg>
        Tiếp tục với Google
      </button>
    </div>
    <div class="relative">
      <div class="absolute inset-0 flex items-center"><div class="w-full border-t border-gray-300"></div></div>
      <div class="relative flex justify-center text-sm"><span class="px-2 bg-white text-gray-500">HOẶC</span></div>
    </div>
    <form @submit.prevent="handleSubmit" class="space-y-5" novalidate>
       <div v-if="apiError" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <span class="block sm:inline">{{ apiError }}</span>
      </div>
      <div>
        <label for="fullName" class="text-sm font-medium text-text-secondary">Họ và Tên</label>
        <div class="mt-1">
          <input id="fullName" v-model="form.fullName" @blur="v$.fullName.$touch()" type="text" placeholder="Nhập họ và tên của bạn" :class="['appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-accent-primary focus:border-accent-primary sm:text-sm', v$.fullName.$error ? 'border-status-danger' : 'border-gray-300']"/>
          <p v-if="v$.fullName.$error" class="mt-2 text-sm text-status-danger">{{ v$.fullName.$errors[0].$message }}</p>
        </div>
      </div>
      <div>
        <label for="email" class="text-sm font-medium text-text-secondary">Email</label>
        <div class="mt-1">
           <input id="email" v-model="form.email" @blur="v$.email.$touch()" type="email" placeholder="vidu@email.com" :class="['appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-accent-primary focus:border-accent-primary sm:text-sm', v$.email.$error ? 'border-status-danger' : 'border-gray-300']"/>
          <p v-if="v$.email.$error" class="mt-2 text-sm text-status-danger">{{ v$.email.$errors[0].$message }}</p>
        </div>
      </div>
      <div>
        <label for="password" class="text-sm font-medium text-text-secondary">Mật khẩu</label>
        <div class="mt-1 relative">
          <input id="password" v-model="form.password" @blur="v$.password.$touch()" :type="passwordFieldType" placeholder="Nhập mật khẩu của bạn" :class="['appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-accent-primary focus:border-accent-primary sm:text-sm', v$.password.$error ? 'border-status-danger' : 'border-gray-300']"/>
        </div>
        <div class="mt-2" v-if="form.password">
            <div class="w-full bg-gray-200 rounded-full h-1">
                <div class="strength-bar rounded-full" :class="passwordStrength.class"></div>
            </div>
            <p class="text-xs mt-1" :class="passwordStrength.colorClass">{{ passwordStrength.text }}</p>
        </div>
        <p v-if="v$.password.$error" class="mt-2 text-sm text-status-danger">{{ v$.password.$errors[0].$message }}</p>
      </div>
      <div>
        <label for="confirmPassword" class="text-sm font-medium text-text-secondary">Xác nhận Mật khẩu</label>
        <div class="mt-1">
          <input id="confirmPassword" v-model="form.confirmPassword" @blur="v$.confirmPassword.$touch()" :type="passwordFieldType" placeholder="Nhập lại mật khẩu" :class="['appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-accent-primary focus:border-accent-primary sm:text-sm', v$.confirmPassword.$error ? 'border-status-danger' : 'border-gray-300']"/>
          <p v-if="v$.confirmPassword.$error" class="mt-2 text-sm text-status-danger">{{ v$.confirmPassword.$errors[0].$message }}</p>
        </div>
      </div>
      <div class="flex items-start">
        <div class="flex items-center h-5">
          <input id="terms" v-model="form.terms" type="checkbox" class="focus:ring-accent-primary h-4 w-4 text-accent-primary border-gray-300 rounded" />
        </div>
        <div class="ml-3 text-sm">
          <label for="terms" class="text-gray-500">Tôi đã đọc và đồng ý với
            <a href="#" class="font-medium text-accent-primary hover:text-accent-hover">Điều khoản Dịch vụ</a>.
          </label>
           <p v-if="v$.terms.$error" class="mt-1 text-sm text-status-danger">{{ v$.terms.$errors[0].$message }}</p>
        </div>
      </div>
      <div>
        <button type="submit" class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-accent-primary hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-primary disabled:opacity-50" :disabled="v$.$invalid">
          Đăng Ký
        </button>
      </div>
    </form>
    <p class="text-center text-sm text-gray-600">
      Đã có tài khoản?
      <router-link :to="{ name: 'Login' }" class="font-medium text-accent-primary hover:text-accent-hover">
        Đăng nhập ngay
      </router-link>
    </p>
  </div>
</template>

<script setup>
import { reactive, computed, ref } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { required, email, sameAs, helpers } from '@vuelidate/validators';
import { useRouter } from 'vue-router';
import apiClient from '@/api/axios';
// SỬA ĐỔI 1: Import store vào
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
// SỬA ĐỔI 2: Khởi tạo store
const authStore = useAuthStore();
const apiError = ref(null);
const passwordFieldType = ref('password');

const form = reactive({
  fullName: '',
  email: '',
  password: '',
  confirmPassword: '',
  terms: false,
});

const strongPassword = helpers.withMessage(
  'Mật khẩu phải có ít nhất 8 ký tự, gồm chữ hoa, chữ thường và số.',
  (value) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(value)
);

const rules = computed(() => ({
  fullName: { required: helpers.withMessage('Vui lòng nhập họ và tên.', required) },
  email: {
    required: helpers.withMessage('Vui lòng nhập email.', required),
    email: helpers.withMessage('Email không đúng định dạng.', email),
  },
  password: { required: helpers.withMessage('Vui lòng nhập mật khẩu.', required), strongPassword },
  confirmPassword: {
    required: helpers.withMessage('Vui lòng xác nhận mật khẩu.', required),
    sameAs: helpers.withMessage('Mật khẩu xác nhận không trùng khớp.', sameAs(form.password)),
  },
  terms: {
    sameAs: helpers.withMessage('Bạn phải đồng ý với Điều khoản Dịch vụ.', sameAs(true)),
  },
}));

const v$ = useVuelidate(rules, form);

const passwordStrength = computed(() => {
    const password = form.password;
    if (!password) return { class: '', text: '', colorClass: ''};
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++;
    if (password.match(/\d/)) strength++;
    if (password.match(/[^a-zA-Z\d]/)) strength++;
    if (strength < 2) return { class: 'strength-weak', text: 'Mật khẩu yếu', colorClass: 'text-red-500' };
    if (strength < 4) return { class: 'strength-medium', text: 'Mật khẩu trung bình', colorClass: 'text-orange-500' };
    return { class: 'strength-strong', text: 'Mật khẩu mạnh', colorClass: 'text-green-500' };
});

const handleSubmit = async () => {
  apiError.value = null;
  const isFormCorrect = await v$.value.$validate();
  if (!isFormCorrect) return;

  try {
    const response = await apiClient.post('/users/register', {
      name: form.fullName,
      email: form.email,
      password: form.password,
    });

    const userData = response.data;
    console.log('Đăng ký thành công, nhận được dữ liệu user:', userData);

    // SỬA ĐỔI 3 (QUAN TRỌNG): Cập nhật state trước khi chuyển trang
    authStore.setUser(userData);

    router.push({ name: 'Dashboard' });

  } catch (error) {
    if (error.response && error.response.data) {
      apiError.value = error.response.data.detail;
    } else {
      apiError.value = 'Đã có lỗi xảy ra. Vui lòng thử lại.';
    }
    console.error('Lỗi đăng ký:', error);
  }
};
</script>

<style scoped>
.strength-bar { height: 4px; transition: all 0.3s ease-in-out; }
.strength-weak { background-color: #ef4444; width: 33.3%; }
.strength-medium { background-color: #f97316; width: 66.6%; }
.strength-strong { background-color: #22c55e; width: 100%; }
</style>