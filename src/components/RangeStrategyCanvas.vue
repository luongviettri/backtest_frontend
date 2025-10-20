<template>
  <div class="grid grid-cols-2 gap-4 p-4">
    <div class="col-span-1 bg-white rounded-lg border border-slate-200 p-4">
      <h3 class="text-lg font-semibold text-slate-700 mb-4 text-center">
        Khu vực 1: Xác định Vùng giá
      </h3>
      <div
        class="drop-zone h-full"
        :class="{ 'drag-over': activeDropZone === 'filters' }"
        @dragover.prevent="$emit('dragover', 'filters')"
        @dragleave.prevent="$emit('dragleave')"
        @drop="$emit('drop', 'filters')"
      >
        <LogicBlock
          v-for="condition in strategyStore.filters"
          :key="condition.id"
          :condition="condition"
          :is-selected="
            strategyStore.selectedCondition &&
            strategyStore.selectedCondition.id === condition.id
          "
          @select="$emit('select-condition', condition)"
          @delete="$emit('delete-condition', { zoneType: 'filters', conditionId: condition.id })"
        />
      </div>
    </div>
    <div class="col-span-1 bg-white rounded-lg border border-slate-200 p-4">
      <h3 class="text-lg font-semibold text-slate-700 mb-4 text-center">
        Khu vực 2: Tín hiệu Mua/Bán
      </h3>
      <div
        class="drop-zone h-full"
        :class="{ 'drag-over': activeDropZone === 'signals' }"
        @dragover.prevent="$emit('dragover', 'signals')"
        @dragleave.prevent="$emit('dragleave')"
        @drop="$emit('drop', 'signals')"
      >
        <LogicBlock
          v-for="condition in strategyStore.signals"
          :key="condition.id"
          :condition="condition"
          :is-selected="
            strategyStore.selectedCondition &&
            strategyStore.selectedCondition.id === condition.id
          "
          @select="$emit('select-condition', condition)"
          @delete="$emit('delete-condition', { zoneType: 'signals', conditionId: condition.id })"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import LogicBlock from './LogicBlock.vue'

defineProps({
  strategyStore: Object,
  activeDropZone: String,
})

defineEmits(['dragover', 'dragleave', 'drop', 'select-condition', 'delete-condition'])
</script>

<style scoped>
.drop-zone {
  min-height: 100px;
  border: 2px dashed #ccc;
  border-radius: 8px;
  padding: 1rem;
  transition: background-color 0.2s ease;
}

.drop-zone.drag-over {
  background-color: #f0fdf4;
  border-color: #22c55e;
}
</style>