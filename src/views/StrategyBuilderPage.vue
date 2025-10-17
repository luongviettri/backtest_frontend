<template>
  <div class="p-8 view-content max-w-4xl mx-auto">
    <header class="mb-8">
      <h1 class="text-3xl font-bold text-text-primary">
        {{ isEditMode ? 'Chỉnh sửa Chiến lược' : 'Tạo Chiến lược Mới' }}
      </h1>
      <p class="text-text-secondary mt-1">
        Điền các thông tin chi tiết cho chiến lược của bạn.
      </p>
    </header>

    <form @submit.prevent="handleSubmit" class="bg-background-primary p-8 rounded-lg shadow-sm">
      <div class="mb-6">
        <label for="name" class="block text-sm font-semibold text-text-primary mb-2">Tên chiến lược</label>
        <input
          v-model="strategy.name"
          type="text"
          id="name"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-primary focus:border-accent-primary"
          placeholder="Ví dụ: Giao cắt MA trên H4"
          required
        />
      </div>

      <div class="mb-6">
        <label for="description" class="block text-sm font-semibold text-text-primary mb-2">Mô tả</label>
        <textarea
          v-model="strategy.description"
          id="description"
          rows="4"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-primary focus:border-accent-primary"
          placeholder="Mô tả ngắn gọn về cách hoạt động của chiến lược..."
        ></textarea>
      </div>

      <div class="mb-8">
        <label for="rules" class="block text-sm font-semibold text-text-primary mb-2">Các quy tắc (JSON)</label>
        <textarea
          v-model="rulesAsJson"
          id="rules"
          rows="8"
          class="w-full px-4 py-2 font-mono text-sm bg-background-secondary border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-primary focus:border-accent-primary"
          placeholder='{ "condition": "and", "rules": [ ... ] }'
        ></textarea>
        <p v-if="jsonError" class="text-status-danger text-xs mt-1">{{ jsonError }}</p>
      </div>
      
      <div class="flex justify-end space-x-4 border-t border-gray-200 pt-6">
         <button
            type="button"
            @click="cancel"
            class="px-6 py-2.5 bg-background-secondary text-text-secondary font-semibold rounded-lg hover:bg-gray-200 transition-colors"
          >
            Hủy bỏ
          </button>
          <button
            type="submit"
            class="px-6 py-2.5 text-white font-semibold rounded-lg shadow-md bg-accent-primary hover:bg-accent-hover transition-colors"
            :disabled="isSubmitting"
          >
            {{ isSubmitting ? 'Đang lưu...' : (isEditMode ? 'Lưu thay đổi' : 'Tạo chiến lược') }}
          </button>
      </div>
    </form>
  </div>
</template>


<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import strategyApi from '@/services/strategyApi';

const router = useRouter();
const route = useRoute();

const strategy = ref({
  name: '',
  description: '',
  rules: {},
});
const rulesAsJson = ref('{}');
const jsonError = ref('');
const isSubmitting = ref(false);

const strategyId = route.params.id;
const isEditMode = computed(() => !!strategyId);

watch(rulesAsJson, (newJson) => {
  try {
    strategy.value.rules = JSON.parse(newJson);
    jsonError.value = '';
  } catch (e) {
    jsonError.value = 'Định dạng JSON không hợp lệ.';
  }
});

onMounted(async () => {
  if (isEditMode.value) {
    try {
      const response = await strategyApi.getStrategyById(strategyId);
      strategy.value = response.data;
      rulesAsJson.value = JSON.stringify(response.data.rules, null, 2); 
    } catch (error) {
      console.error('Lỗi khi tải chi tiết chiến lược:', error);
      router.push('/strategies');
    }
  }
});

const handleSubmit = async () => {
  if (jsonError.value) {
      alert('Vui lòng sửa lỗi trong định dạng JSON của các quy tắc.');
      return;
  }
  
  isSubmitting.value = true;
  
  try {
    if (isEditMode.value) {
      await strategyApi.updateStrategy(strategyId, strategy.value);
    } else {
      await strategyApi.createStrategy(strategy.value);
    }
    router.push('/strategies');
  } catch (error) {
    console.error('Lỗi khi lưu chiến lược:', error);
  } finally {
    isSubmitting.value = false;
  }
};

const cancel = () => {
  router.push('/strategies');
};
</script>