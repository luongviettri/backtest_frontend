<template>
  <div
    class="logic-group bg-slate-100 border border-slate-200 rounded-lg p-3 space-y-3"
    :class="{ 'ml-6': !isRoot }"
  >
    <!-- Header của Group: Chứa nút AND/OR và các nút hành động -->
    <div class="flex items-center justify-between">
      <!-- Nút chuyển đổi AND/OR -->
      <div class="flex text-xs font-semibold bg-slate-200 rounded-md p-0.5">
        <button
          @click="toggleOperator('AND')"
          :class="
            group.type === 'AND' ? 'bg-white text-slate-800 shadow-sm rounded' : 'text-slate-500'
          "
          class="px-3 py-1"
        >
          VÀ (AND)
        </button>
        <button
          @click="toggleOperator('OR')"
          :class="
            group.type === 'OR' ? 'bg-white text-slate-800 shadow-sm rounded' : 'text-slate-500'
          "
          class="px-3 py-1"
        >
          HOẶC (OR)
        </button>
      </div>

      <!-- Các nút hành động -->
      <div class="flex items-center space-x-2">
        <button
          @click="handleAddCondition"
          class="text-xs font-semibold text-blue-600 hover:bg-blue-100 px-2 py-1 rounded-md flex items-center space-x-1"
        >
          <vue-feather type="plus" size="14"></vue-feather>
          <span>Thêm Điều kiện</span>
        </button>
        <button
          @click="handleAddGroup"
          class="text-xs font-semibold text-purple-600 hover:bg-purple-100 px-2 py-1 rounded-md flex items-center space-x-1"
        >
          <vue-feather type="folder-plus" size="14"></vue-feather>
          <span>Thêm Nhóm</span>
        </button>
        <!-- Chỉ hiển thị nút xóa cho các nhóm con, không phải nhóm gốc -->
        <button
          v-if="!isRoot"
          @click="handleDeleteNode"
          class="text-slate-400 hover:text-red-500"
          title="Xóa nhóm này"
        >
          <vue-feather type="trash-2" size="16"></vue-feather>
        </button>
      </div>
    </div>

    <!-- Vùng chứa các phần tử con (children) -->
    <div class="group-children space-y-2 pt-2 border-t border-slate-200/80">
      <p v-if="group.children.length === 0" class="text-center text-xs text-slate-400 py-4">
        Nhóm này đang trống.
      </p>

      <!-- Dùng v-for để lặp qua các children -->
      <div v-for="child in group.children" :key="child.id">
        <!-- Nếu child là một group khác, gọi đệ quy chính component này -->
        <LogicGroup v-if="child.children" :group="child" :zone-type="zoneType" :is-root="false" />

        <!-- Nếu child là một điều kiện, render LogicBlock -->
        <LogicBlock
          v-else
          :condition="child"
          :is-selected="strategyStore.selectedCondition?.id === child.id"
          @select="handleSelectBlock(child)"
          @delete="strategyStore.deleteNode(zoneType, child.id)"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineAsyncComponent } from 'vue'
import VueFeather from 'vue-feather'
import { useStrategyStore } from '@/stores/strategy'
import LogicBlock from './LogicBlock.vue'

// Sử dụng defineAsyncComponent để tránh lỗi lặp vô hạn khi component tự gọi chính nó
const LogicGroup = defineAsyncComponent(() => import('./LogicGroup.vue'))

const props = defineProps({
  group: {
    type: Object,
    required: true,
  },
  zoneType: {
    type: String,
    required: true,
  },
  isRoot: {
    type: Boolean,
    default: false,
  },
})

const strategyStore = useStrategyStore()

// ▼▼▼ THÊM HÀM NÀY ▼▼▼
function handleSelectBlock(child) {
  console.log(
    `[LogicGroup] Passing condition to LogicBlock (ID: ${child?.id}):`,
    JSON.stringify(child, null, 2),
  )
  strategyStore.selectCondition(child) // Gọi action gốc
}

function toggleOperator(newType) {
  // Đây là một ví dụ về cách cập nhật trực tiếp state.
  // Trong một ứng dụng lớn hơn, bạn có thể muốn tạo một action trong store.
  props.group.type = newType
}

function handleAddCondition() {
  // Mở một popup/menu để người dùng chọn loại chỉ báo
  // Tạm thời, chúng ta sẽ thêm một RSI mặc định
  // Quan trọng: truyền vào ID của group cha
  strategyStore.addCondition(props.zoneType, 'RSI', props.group.id)
}

function handleAddGroup() {
  // Gọi action trong store để thêm một group con mới
  strategyStore.addGroup(props.zoneType, props.group.id)
}

function handleDeleteNode() {
  if (confirm('Bạn có chắc chắn muốn xóa nhóm này và tất cả các điều kiện bên trong không?')) {
    strategyStore.deleteNode(props.zoneType, props.group.id)
  }
}
</script>

<style scoped>
/* Thêm một đường nối trực quan cho cấu trúc cây */
.logic-group {
  border-left: 2px solid #e2e8f0; /* border-slate-200 */
}
</style>
