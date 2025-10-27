<template>
  <div class="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg space-y-6">
    <div class="flex justify-center">
      <svg
        class="h-12 w-auto text-accent-primary"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z"
        />
      </svg>
    </div>
    <h1 class="text-center text-3xl font-bold text-gray-900">Tạo tài khoản</h1>

    <div
      v-if="apiError"
      class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
      role="alert"
    >
      <span class="block sm:inline">{{ apiError }}</span>
    </div>

    <div class="space-y-4">
      <div id="google-register-button" class="flex justify-center"></div>

      <div class="relative">
        <div class="absolute inset-0 flex items-center">
          <div class="w-full border-t border-gray-300"></div>
        </div>
        <div class="relative flex justify-center text-sm">
          <span class="px-2 bg-white text-gray-500">Hoặc đăng ký bằng email</span>
        </div>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label for="fullName" class="sr-only">Họ và tên</label>
          <input
            v-model="form.fullName"
            @blur="v$.fullName.$touch"
            id="fullName"
            name="fullName"
            type="text"
            autocomplete="name"
            class="appearance-none rounded-lg relative block w-full px-3 py-3 border placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-accent-primary focus:border-accent-primary focus:z-10 sm:text-sm"
            :class="{ 'border-red-500': v$.fullName.$error }"
            placeholder="Họ và tên"
          />
          <p v-if="v$.fullName.$error" class="text-red-500 text-xs mt-1">
            {{ v$.fullName.$errors[0].$message }}
          </p>
        </div>
        <div>
          <label for="email" class="sr-only">Email</label>
          <input
            v-model="form.email"
            @blur="v$.email.$touch"
            id="email"
            name="email"
            type="email"
            autocomplete="email"
            class="appearance-none rounded-lg relative block w-full px-3 py-3 border placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-accent-primary focus:border-accent-primary focus:z-10 sm:text-sm"
            :class="{ 'border-red-500': v$.email.$error }"
            placeholder="Địa chỉ email"
          />
          <p v-if="v$.email.$error" class="text-red-500 text-xs mt-1">
            {{ v$.email.$errors[0].$message }}
          </p>
        </div>
        <div>
          <label for="password" class="sr-only">Mật khẩu</label>
          <input
            v-model="form.password"
            @blur="v$.password.$touch"
            id="password"
            name="password"
            type="password"
            autocomplete="new-password"
            class="appearance-none rounded-lg relative block w-full px-3 py-3 border placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-accent-primary focus:border-accent-primary focus:z-10 sm:text-sm"
            :class="{ 'border-red-500': v$.password.$error }"
            placeholder="Mật khẩu"
          />
          <p v-if="v$.password.$error" class="text-red-500 text-xs mt-1">
            {{ v$.password.$errors[0].$message }}
          </p>
          <div v-if="form.password" class="mt-2">
            <div class="h-1 w-full bg-gray-200 rounded">
              <div
                class="h-1 rounded"
                :class="passwordStrength.class"
                :style="{ width: passwordStrength.width }"
              ></div>
            </div>
            <p class="text-xs mt-1" :class="passwordStrength.colorClass">
              {{ passwordStrength.text }}
            </p>
          </div>
        </div>
        <div>
          <label for="confirmPassword" class="sr-only">Xác nhận mật khẩu</label>
          <input
            v-model="form.confirmPassword"
            @blur="v$.confirmPassword.$touch"
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autocomplete="new-password"
            class="appearance-none rounded-lg relative block w-full px-3 py-3 border placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-accent-primary focus:border-accent-primary focus:z-10 sm:text-sm"
            :class="{ 'border-red-500': v$.confirmPassword.$error }"
            placeholder="Xác nhận mật khẩu"
          />
          <p v-if="v$.confirmPassword.$error" class="text-red-500 text-xs mt-1">
            {{ v$.confirmPassword.$errors[0].$message }}
          </p>
        </div>
        <div>
          <button
            type="submit"
            class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-accent-primary hover:bg-accent-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-primary"
          >
            Đăng ký
          </button>
        </div>
      </form>
    </div>
    <p class="text-center text-sm text-gray-600">
      Đã có tài khoản?
      <router-link
        :to="{ name: 'Login' }"
        class="font-medium text-accent-primary hover:text-accent-secondary"
      >
        Đăng nhập
      </router-link>
    </p>
  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted } from 'vue'
import useVuelidate from '@vuelidate/core'
import { required, email, minLength, sameAs, helpers } from '@vuelidate/validators'
import { useRouter } from 'vue-router'
import apiClient from '@/api/axios'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const apiError = ref(null)
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID

const form = reactive({
  fullName: '',
  email: '',
  password: '',
  confirmPassword: '',
})

// --- BẮT ĐẦU NÂNG CẤP LOGIC GOOGLE ---

// Hàm callback xử lý sau khi đăng ký Google thành công
window.handleGoogleRegisterResponse = async (response) => {
  apiError.value = null
  console.log('✅ [GOOGLE REGISTER] Nhận được credential từ Google:', response)
  try {
    const res = await apiClient.post('/auth/google-jwt', { credential: response.credential })
    console.log('✅ [BACKEND] Xác thực Google JWT thành công, dữ liệu người dùng:', res.data)
    authStore.setUser(res.data)
    router.push({ name: 'Dashboard' })
  } catch (error) {
    console.error('❌ [FRONTEND] Lỗi xác thực token với backend:', error)
    apiError.value =
      error.response?.data?.detail || 'Đăng ký với Google thất bại. Vui lòng thử lại.'
  }
}

// Hàm mới: "Kiên nhẫn" khởi tạo Google Sign-In để chống lỗi Race Condition
const initializeGsi = (retryCount = 0) => {
  if (typeof google !== 'undefined') {
    console.log('✅ Google Script đã sẵn sàng. Bắt đầu khởi tạo...')
    google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: window.handleGoogleRegisterResponse,
    })
    google.accounts.id.renderButton(document.getElementById('google-register-button'), {
      theme: 'outline',
      size: 'large',
      type: 'standard',
      text: 'signup_with',
      width: '334',
    })
    return
  }

  if (retryCount >= 10) {
    const errorMsg =
      'Không thể tải dịch vụ đăng ký Google. Vui lòng kiểm tra kết nối mạng và thử lại.'
    console.error(`❌ [FRONTEND] ${errorMsg}`)
    apiError.value = errorMsg
    return
  }

  console.log('⏳ Script Google chưa sẵn sàng, thử lại sau 100ms...')
  setTimeout(() => {
    initializeGsi(retryCount + 1)
  }, 100)
}

onMounted(() => {
  // Bắt đầu quá trình khởi tạo "kiên nhẫn"
  initializeGsi()
})

// --- KẾT THÚC NÂNG CẤP ---

// --- LOGIC FORM EMAIL / PASSWORD (KHÔNG THAY ĐỔI) ---
const rules = computed(() => ({
  fullName: { required: helpers.withMessage('Vui lòng nhập họ tên.', required) },
  email: {
    required: helpers.withMessage('Vui lòng nhập email.', required),
    email: helpers.withMessage('Email không đúng định dạng.', email),
  },
  password: {
    required: helpers.withMessage('Vui lòng nhập mật khẩu.', required),
    minLength: helpers.withMessage('Mật khẩu phải có ít nhất 8 ký tự.', minLength(8)),
  },
  confirmPassword: {
    required: helpers.withMessage('Vui lòng xác nhận mật khẩu.', required),
    sameAs: helpers.withMessage('Mật khẩu xác nhận không khớp.', sameAs(form.password)),
  },
}))

const v$ = useVuelidate(rules, form)

const passwordStrength = computed(() => {
  const p = form.password
  if (!p) return { width: '0%', class: '', text: '', colorClass: '' }
  let strength = 0
  if (p.length > 7) strength++
  if (p.match(/[a-z]/) && p.match(/[A-Z]/)) strength++
  if (p.match(/\d/)) strength++
  if (p.match(/[^a-zA-Z\d]/)) strength++

  switch (strength) {
    case 0:
    case 1:
      return { width: '25%', class: 'bg-red-500', text: 'Mật khẩu yếu', colorClass: 'text-red-500' }
    case 2:
      return {
        width: '50%',
        class: 'bg-orange-500',
        text: 'Mật khẩu trung bình',
        colorClass: 'text-orange-500',
      }
    case 3:
      return {
        width: '75%',
        class: 'bg-yellow-500',
        text: 'Mật khẩu khá',
        colorClass: 'text-yellow-500',
      }
    case 4:
      return {
        width: '100%',
        class: 'bg-green-500',
        text: 'Mật khẩu mạnh',
        colorClass: 'text-green-500',
      }
    default:
      return { width: '0%', class: '', text: '', colorClass: '' }
  }
})

const handleSubmit = async () => {
  apiError.value = null
  const isFormCorrect = await v$.value.$validate()
  if (!isFormCorrect) return

  try {
    const response = await apiClient.post('/users/register', {
      name: form.fullName,
      email: form.email,
      password: form.password,
    })

    const userData = response.data
    authStore.setUser(userData)
    router.push({ name: 'Dashboard' })
  } catch (error) {
    if (error.response && error.response.data) {
      apiError.value = error.response.data.detail
    } else {
      apiError.value = 'Đã xảy ra lỗi không xác định. Vui lòng thử lại.'
    }
  }
}
</script>
