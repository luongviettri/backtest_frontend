<template>
  <div class="p-4 h-full flex items-center justify-center">
    <div
      class="w-full h-full bg-white rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 text-center"
    >
      <div>
        <vue-feather type="tool" size="40" class="mx-auto mb-4"></vue-feather>
        <p class="font-semibold">Giao diện Builder "Tùy chỉnh Nâng cao"</p>
        <p class="text-sm">Sẽ được xây dựng ở đây.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import VueFeather from "vue-feather";

defineProps({
  strategyStore: Object,
  activeDropZone: String,
  focusedZone: String,
});

defineEmits([
  "dragover",
  "dragleave",
  "drop",
  "select-condition",
  "delete-condition",
  "focus-zone",
]);
</script>

<style scoped></style>