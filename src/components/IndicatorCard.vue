<template>
  <div
    class="indicator-card"
    draggable="true"
    @dragstart="$emit('dragstart', indicator.type)"
    @dragend="$emit('dragend')"
  >
    <div class="bg-white border border-slate-200 rounded-lg p-3 flex items-center space-x-3 pointer-events-none">
      <vue-feather
        :type="indicator.icon"
        size="20"
        class="w-8 h-8 p-1.5 rounded-md"
        :class="iconClasses"
      ></vue-feather>
      <div>
        <p class="font-semibold text-slate-800">{{ indicator.name }}</p>
        <p class="text-xs text-slate-500">{{ indicator.description }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import VueFeather from 'vue-feather';

// Nhận vào một object 'indicator' từ component cha
const props = defineProps({
  indicator: {
    type: Object,
    required: true,
  },
});

// Định nghĩa các event mà component này có thể phát ra
defineEmits(['dragstart', 'dragend']);

// Dùng computed để tạo class động cho icon dựa trên màu sắc
const iconClasses = computed(() => {
  const color = props.indicator.color || 'slate';
  return `bg-${color}-100 text-${color}-600`;
});
</script>

<style scoped>
.indicator-card {
  cursor: grab;
  transition: all 0.2s ease-in-out;
}
/* THÊM MỚI */
.indicator-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
}
.indicator-card:active {
  cursor: grabbing;
}
</style>