<template>
  <button class="base-button">
    <slot></slot> </button>
</template>

<script>
export default {
  name: 'BaseButton'
}
</script>

<style scoped>
.base-button {
  width: 100%;
  padding: 12px 20px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--border-radius-md);
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.base-button:hover {
  background-color: #4338CA; /* Màu đậm hơn một chút khi hover */
}
</style>