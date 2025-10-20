<template>
  <div class="p-4">
    <div
      class="h-full bg-white rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400"
    >
      <p>Giao diện cho Builder "Giao dịch theo Xu hướng" sẽ ở đây.</p>
    </div>
  </div>
</template>

<script setup>
// This component will have its own layout for trend-following strategies.
// For now, it's a placeholder.
defineProps({
  strategyStore: Object,
  activeDropZone: String,
})
defineEmits(['dragover', 'dragleave', 'drop', 'select-condition', 'delete-condition'])
</script>