<template>
  <div>
    <label v-if="label" :for="id" class="sr-only">{{ label }}</label>
    <input
      :id="id"
      :type="type"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      @blur="$emit('blur')"
      :name="name"
      :autocomplete="autocomplete"
      :placeholder="placeholder"
      class="appearance-none rounded-lg relative block w-full px-3 py-3 border placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-accent-primary focus:border-accent-primary focus:z-10 sm:text-sm"
      :class="{ 'border-red-500': error }"
    />
  </div>
</template>

<script setup>
defineProps({
  modelValue: [String, Number],
  label: String,
  id: String,
  name: String,
  type: { type: String, default: 'text' },
  placeholder: String,
  autocomplete: String,
  error: { type: Boolean, default: false },
});

defineEmits(['update:modelValue', 'blur']);
</script>