<template>
  <div
    class="logic-block"
    :class="{ selected: isSelected }"
    :data-indicator-type="condition.type"
    @click="$emit('select', condition)"
  >
    <div class="bg-white p-2.5 rounded-md border text-sm flex justify-between items-center">
      <span class="pointer-events-none text-slate-700">
        <b class="text-slate-900">{{ condition.type }}</b>
        <span>({{ paramsString }})</span>
        <span :class="operatorClasses" class="mx-1">{{ operatorText }}</span>
        <span v-if="prefixText" class="mr-1">{{ prefixText }}</span>
        <b class="text-slate-900">{{ valueText }}</b>
        <!-- [THAY ĐỔI] Hiển thị timeframe nếu có -->
        <span
          v-if="condition.timeframe"
          class="ml-2 text-xs font-semibold text-sky-700 bg-sky-100 px-1.5 py-0.5 rounded"
        >
          trên {{ condition.timeframe }}
        </span>
      </span>
      <button
        class="delete-block-btn text-slate-400 hover:text-red-500 pointer-events-auto"
        @click.stop="$emit('delete', condition.id)"
      >
        <vue-feather type="x" size="16"></vue-feather>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import VueFeather from 'vue-feather'
import { INDICATOR_TYPES } from '@/utils/constants' // Import constants để so sánh

const props = defineProps({
  condition: {
    type: Object,
    required: true,
  },
  isSelected: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['select', 'delete'])

// ----- TOÀN BỘ LOGIC HIỂN THỊ ĐƯỢC CHUYỂN VÀO ĐÂY -----

// Tạo chuỗi tham số, ví dụ: "14, close"
const paramsString = computed(() => Object.values(props.condition.params || {}).join(', '))

// Xác định văn bản cho toán tử, ví dụ: "cắt lên trên"
const operatorText = computed(() => {
  switch (props.condition.operator) {
    case '>':
      return 'lớn hơn'
    case '<':
      return 'nhỏ hơn'
    case 'cross_above':
      return 'cắt lên trên'
    case 'cross_below':
      return 'cắt xuống dưới'
    default:
      return props.condition.operator
  }
})

// Xác định class CSS cho toán tử để có màu sắc khác nhau
const operatorClasses = computed(() => {
  const op = props.condition.operator
  if (op === 'cross_above' || op === 'cross_below') {
    return 'text-blue-600 font-semibold'
  }
  return 'text-slate-500'
})

// Xác định phần văn bản đứng trước giá trị (chỉ dùng cho MA)
const prefixText = computed(() => {
  if (props.condition.type === INDICATOR_TYPES.MA) {
    return 'Giá'
  }
  return ''
})

// Xác định phần văn bản giá trị cuối cùng
const valueText = computed(() => {
  const { type, value, params } = props.condition

  // Trường hợp 1: Chỉ báo là MA, luôn hiển thị MA(period)
  if (type === INDICATOR_TYPES.MA) {
    return `MA(${params.period})`
  }
  // Trường hợp 2: Chỉ báo là MACD, luôn hiển thị 'Đường Signal'
  if (type === INDICATOR_TYPES.MACD) {
    return 'Đường Signal'
  }
  // [THÊM MỚI] Xử lý cho Parabolic SAR
  if (type === INDICATOR_TYPES.PARABOLIC_SAR) {
    // Giá trị của SAR luôn là 'price' (giá)
    return 'Giá'
  }
  // Trường hợp 3 (mặc định): Hiển thị giá trị `value`.
  // Nếu `value` là null hoặc undefined, hiển thị một chuỗi rỗng.
  return value ?? ''
})
</script>

<style scoped>
.logic-block.selected > div {
  background-color: #e0f2fe;
  border-color: #38bdf8;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.4);
}
.logic-block:hover > div {
  border-color: #9ca3af;
}
.delete-block-btn {
  visibility: hidden;
  opacity: 0;
  transition: all 0.2s ease-in-out;
}
.logic-block:hover .delete-block-btn {
  visibility: visible;
  opacity: 1;
}
</style>
