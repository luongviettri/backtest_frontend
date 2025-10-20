<template>
  <div v-if="condition" class="space-y-4">
    <div v-if="condition.type === 'MA'">
      <h3 class="font-bold text-lg">Moving Average Filter</h3>
      <p class="text-sm text-gray-600">Lọc các tín hiệu chỉ khi giá nằm trên hoặc dưới đường MA.</p>
      <div class="mt-4 space-y-2">
        <label class="flex items-center">
          <input type="radio" :name="`ma_condition_${condition.id}`" value="above" @change="updateMaCondition('long')" :checked="condition.longCondition.operator === '>'" />
          <span class="ml-2">Chỉ Mua khi Giá > MA</span>
        </label>
        <label class="flex items-center">
          <input type="radio" :name="`ma_condition_${condition.id}`" value="below" @change="updateMaCondition('short')" :checked="condition.shortCondition.operator === '<'" />
          <span class="ml-2">Chỉ Bán khi Giá < MA</span>
        </label>
      </div>
    </div>

    <div v-else-if="condition.type === 'RSI'">
        <h3 class="font-bold text-lg">RSI Signal</h3>
        <!-- Simplified RSI inspector here -->
    </div>

    <!-- Default inspector for other types -->
    <div v-else>
        <p>No simplified inspector for this type yet.</p>
    </div>

  </div>
</template>

<script setup>
import { defineProps, toRefs } from 'vue';

const props = defineProps({
  condition: {
    type: Object,
    required: true,
  },
});

const { condition } = toRefs(props);

function updateMaCondition(direction) {
    if (direction === 'long') {
        condition.value.longCondition.operator = '>';
        condition.value.longCondition.value = 'price';
        condition.value.shortCondition.operator = '>'; // Or some other default
        condition.value.shortCondition.value = 'price';
    } else {
        condition.value.shortCondition.operator = '<';
        condition.value.shortCondition.value = 'price';
        condition.value.longCondition.operator = '<';
        condition.value.longCondition.value = 'price';
    }
}

</script>
