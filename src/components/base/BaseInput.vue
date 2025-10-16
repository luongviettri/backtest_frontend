<template>
  <div class="input-wrapper">
    <label :for="id" class="input-label">{{ label }}</label>
    <input
      :id="id"
      :type="type"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      class="base-input"
      :placeholder="placeholder"
    />
  </div>
</template>

<script>
export default {
  name: 'BaseInput',
  props: {
    id: { type: String, required: true },
    label: { type: String, required: true },
    modelValue: { type: String, default: '' }, // Hỗ trợ v-model
    type: { type: String, default: 'text' },
    placeholder: { type: String, default: '' }
  },
  emits: ['update:modelValue']
}
</script>

<style scoped>
.input-wrapper {
  width: 100%;
  margin-bottom: 20px;
}

.input-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: var(--text-primary);
}

.base-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-md);
  box-sizing: border-box; /* Quan trọng để padding không làm tăng kích thước */
}

.base-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.2);
}
</style>