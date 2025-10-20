<template>
  <div
    :id="`${zoneType}-drop-zone`"
    class="drop-zone bg-slate-50/80 p-3 rounded-lg border border-slate-200 min-h-[80px]"
    :class="{ 'drag-over': activeDropZone === zoneType, 'drag-over-sell': isSellZone }"
    @dragover.prevent="$emit('dragover', zoneType)"
    @dragleave="$emit('dragleave', zoneType)"
    @drop="$emit('drop', zoneType)"
  >
    <div class="flex justify-between items-center mb-2">
      <h4 class="text-xs font-bold text-slate-500 uppercase">{{ title }}</h4>
      <span class="text-xs font-semibold text-slate-500">({{ conditions.length }}/{{ maxConditions }})</span>
    </div>

    <!-- Dropdown logic cho tín hiệu vào lệnh -->
    <div v-if="logic !== undefined && conditions.length > 1" class="mb-2">
      <select :value="logic" @input="$emit('update:logic', $event.target.value)" class="w-full text-xs font-semibold text-slate-600 bg-white border-slate-200 rounded-md focus:ring-blue-500 focus:border-blue-500 py-1">
        <option value="AND">Khớp TẤT CẢ các điều kiện (VÀ)</option>
        <option value="OR">Khớp BẤT KỲ điều kiện nào (HOẶC)</option>
      </select>
    </div>

    <div class="space-y-1">
      <template v-for="(condition, index) in conditions" :key="condition.id">
        <LogicBlock
          :condition="condition"
          :is-selected="selectedCondition?.id === condition.id"
          @select="$emit('select-condition', condition)"
          @delete="$emit('delete-condition', { zoneType, conditionId: $event })"
        />
        <div v-if="index < conditions.length - 1" class="text-center text-xs font-bold text-slate-400 py-1">
          {{ logic === 'OR' ? 'HOẶC' : 'VÀ' }}
        </div>
      </template>
      <p v-if="conditions.length === 0 && activeDropZone !== zoneType" class="text-center text-slate-400 text-xs py-2">
        Kéo chỉ báo vào đây...
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import LogicBlock from './LogicBlock.vue';

const props = defineProps({
  title: String,
  zoneType: String,
  conditions: Array,
  selectedCondition: Object,
  logic: String, // Chỉ truyền cho entry zones
  activeDropZone: String,
  maxConditions: { type: Number, default: 3 },
});

defineEmits(['dragover', 'dragleave', 'drop', 'select-condition', 'delete-condition', 'update:logic']);

const isSellZone = computed(() => props.zoneType.startsWith('sell'));
</script>