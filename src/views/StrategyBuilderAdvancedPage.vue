<template>
  <StrategyTester builder-type="custom" />
</template>

<script setup>
// Chỉ cần import một component duy nhất.
import StrategyTester from '@/components/StrategyTester.vue';

// Tất cả logic như onMounted, useRouter, useRoute, isEditMode...
// đã được xử lý bên trong component StrategyTester.vue,
// vì vậy file này không cần chứa bất kỳ logic nào nữa.
</script>

<style scoped>
/* File View này thường không cần style riêng, vì component con đã tự quản lý style của nó. */
</style>