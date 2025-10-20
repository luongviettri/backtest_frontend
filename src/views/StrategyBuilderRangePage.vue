<template>
  <!-- 
    [REFACTOR] File view này giờ chỉ cần gọi StrategyTester
    và truyền vào loại builder tương ứng.
  -->
  <StrategyTester builder-type="range" />
</template>

<script setup>
import StrategyTester from '@/components/StrategyTester.vue'
</script>