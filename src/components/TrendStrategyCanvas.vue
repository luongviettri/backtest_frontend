<template>
  <div class="p-4 grid grid-cols-1 gap-4">
    <!-- Filters Zone -->
    <!-- [THAY ĐỔI] Bỏ @click ở đây vì LogicGroup sẽ xử lý các sự kiện con -->
    <div class="drop-zone-wrapper" @click="$emit('focus-zone', 'filters')">
      <div
        class="drop-zone bg-white rounded-lg border p-4"
        :class="{
          'drag-over': activeDropZone === 'filters',
          'is-focused': focusedZone === 'filters',
        }"
        @dragover.prevent="$emit('dragover', 'filters')"
        @dragleave.prevent="$emit('dragleave')"
        @drop="$emit('drop', 'filters')"
      >
        <div class="flex items-center text-slate-500 mb-3">
          <vue-feather type="filter" size="16" class="mr-2"></vue-feather>
          <h3 class="text-sm font-bold uppercase tracking-wider">Bộ lọc (Xu hướng & Sức mạnh)</h3>
        </div>
        <div class="logic-blocks-container min-h-[80px]">
          <!-- [THAY ĐỔI] Sử dụng LogicGroup thay vì lặp LogicBlock -->
          <LogicGroup :group="strategyStore.filters" zone-type="filters" :is-root="true" />
        </div>
      </div>
    </div>

    <!-- Signals Zone -->
    <div class="drop-zone-wrapper" @click="$emit('focus-zone', 'signals')">
      <div
        class="drop-zone bg-white rounded-lg border p-4"
        :class="{
          'drag-over': activeDropZone === 'signals',
          'is-focused': focusedZone === 'signals',
        }"
        @dragover.prevent="$emit('dragover', 'signals')"
        @dragleave.prevent="$emit('dragleave')"
        @drop="$emit('drop', 'signals')"
      >
        <div class="flex items-center text-slate-500 mb-3">
          <vue-feather type="zap" size="16" class="mr-2"></vue-feather>
          <h3 class="text-sm font-bold uppercase tracking-wider">Tín hiệu Vào lệnh</h3>
        </div>
        <div class="logic-blocks-container min-h-[120px]">
          <!-- [THAY ĐỔI] Sử dụng LogicGroup thay vì lặp LogicBlock -->
          <LogicGroup :group="strategyStore.signals" zone-type="signals" :is-root="true" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import LogicBlock from './LogicBlock.vue'
import LogicGroup from './LogicGroup.vue' // [THÊM MỚI] Import LogicGroup
import VueFeather from 'vue-feather'

defineProps({
  strategyStore: Object,
  activeDropZone: String,
  focusedZone: String,
})

defineEmits(['dragover', 'dragleave', 'drop', 'select-condition', 'delete-condition', 'focus-zone'])
</script>

<style scoped>
.drop-zone-wrapper {
  cursor: pointer;
  border-radius: 0.5rem; /* rounded-lg */
  transition: all 0.2s ease-in-out;
}
.drop-zone {
  border-color: #e2e8f0; /* border-slate-200 */
  transition: all 0.2s ease-in-out;
}

.drop-zone.is-focused {
  border-color: #3b82f6; /* border-blue-500 */
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
}
</style>
