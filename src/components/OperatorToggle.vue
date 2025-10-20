<template>
  <div class="operator-toggle flex items-center justify-center my-1">
    <button
      @click="$emit('toggle')"
      class="text-xs font-bold uppercase tracking-wider rounded-full px-3 py-1 transition-colors duration-200"
      :class="{
        'bg-slate-200 text-slate-600 hover:bg-slate-300': operator.value === 'AND',
        'bg-amber-200 text-amber-800 hover:bg-amber-300': operator.value === 'OR'
      }"
      :title="`Nhấn để chuyển sang '${operator.value === 'AND' ? 'HOẶC' : 'VÀ'}'`"
    >
      {{ operator.value === 'AND' ? 'Và' : 'Hoặc' }}
    </button>
  </div>
</template>

<script setup>
defineProps({
  operator: {
    type: Object,
    required: true,
    validator: (op) => op.type === 'operator' && ['AND', 'OR'].includes(op.value)
  }
});

defineEmits(['toggle']);
</script>