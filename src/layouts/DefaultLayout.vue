<template>
  <div class="app-layout">
    
    <div class="main-content-area">
      <main class="p-8">
        <router-view />
      </main>

    </div>
  </div>
</template>

<script setup>
// File layout này có thể không cần logic, hoặc chỉ import các component chung
// như Sidebar, Header.
</script>

<style scoped>
/* CSS cho layout chính, ví dụ */
.app-layout {
  display: flex;
  height: 100vh;
}
.main-content-area {
  flex-grow: 1;
  overflow-y: auto;
}
</style>