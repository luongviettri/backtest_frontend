<template>
  <div class="p-4 grid grid-cols-1 gap-4">
    <!-- Filters Zone -->
    <div
      class="drop-zone bg-white rounded-lg border border-slate-200 p-4"
      :class="{ 'drag-over': activeDropZone === 'filters' }"
      @dragover.prevent="$emit('dragover', 'filters')"
      @dragleave.prevent="$emit('dragleave')"
      @drop="$emit('drop')"
    >
      <div class="flex items-center text-slate-500 mb-3">
        <vue-feather type="filter" size="16" class="mr-2"></vue-feather>
        <h3 class="text-sm font-bold uppercase tracking-wider">
          Bộ lọc Xu hướng (Tùy chọn)
        </h3>
      </div>
      <div class="logic-blocks-container min-h-[80px]">
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
        <div
          v-if="!strategyStore.filters.length"
          class="text-center text-slate-400 py-4"
        >
          Kéo thả chỉ báo vào đây để lọc tín hiệu theo xu hướng.
        </div>
      </div>
    </div>

    <!-- Signals Zone -->
    <div
      class="drop-zone bg-white rounded-lg border border-slate-200 p-4"
      :class="{ 'drag-over': activeDropZone === 'signals' }"
      @dragover.prevent="$emit('dragover', 'signals')"
      @dragleave.prevent="$emit('dragleave')"
      @drop="$emit('drop')"
    >
      <div class="flex items-center text-slate-500 mb-3">
        <vue-feather type="zap" size="16" class="mr-2"></vue-feather>
        <h3 class="text-sm font-bold uppercase tracking-wider">
          Tín hiệu Mua/Bán
        </h3>
      </div>
      <div class="logic-blocks-container min-h-[120px]">
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
        <div
          v-if="!strategyStore.signals.length"
          class="text-center text-slate-400 py-8"
        >
          Kéo thả chỉ báo vào đây để tạo tín hiệu vào lệnh.
        </div>
      </div>
    </div>

    <!-- Exits Zone -->
    <div
      class="drop-zone bg-white rounded-lg border border-slate-200 p-4"
      :class="{ 'drag-over': activeDropZone === 'exits' }"
      @dragover.prevent="$emit('dragover', 'exits')"
      @dragleave.prevent="$emit('dragleave')"
      @drop="$emit('drop')"
    >
      <div class="flex items-center text-slate-500 mb-3">
        <vue-feather type="log-out" size="16" class="mr-2"></vue-feather>
        <h3 class="text-sm font-bold uppercase tracking-wider">
          Điều kiện Thoát lệnh (Tùy chọn)
        </h3>
      </div>
      <div class="logic-blocks-container min-h-[80px]">
        <LogicBlock
          v-for="condition in strategyStore.exits"
          :key="condition.id"
          :condition="condition"
          :is-selected="
            strategyStore.selectedCondition &&
            strategyStore.selectedCondition.id === condition.id
          "
          @select="$emit('select-condition', condition)"
          @delete="$emit('delete-condition', { zoneType: 'exits', conditionId: condition.id })"
        />
        <div
          v-if="!strategyStore.exits.length"
          class="text-center text-slate-400 py-4"
        >
          Kéo thả chỉ báo vào đây để tạo điều kiện thoát lệnh riêng.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import LogicBlock from './LogicBlock.vue'
import VueFeather from 'vue-feather'

defineProps({
  strategyStore: Object,
  activeDropZone: String,
})

defineEmits(['dragover', 'dragleave', 'drop', 'select-condition', 'delete-condition'])
</script>