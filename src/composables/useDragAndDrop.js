import { ref } from 'vue'
import { CONDITION_ZONES } from '@/utils/constants'

/**
 * Composable để quản lý logic kéo và thả các chỉ báo.
 * @param {object} strategyStore - Instance của Pinia store để thực hiện action.
 * @returns {object} Các state và hàm xử lý cho việc kéo-thả.
 */
export function useDragAndDrop(strategyStore) {
  const draggingIndicator = ref(null)
  // [THAY ĐỔI] Sử dụng một state duy nhất để quản lý vùng đang được kéo qua
  const activeDropZone = ref(null)

  function handleDragStart(indicatorName) {
    draggingIndicator.value = indicatorName
  }

  function handleDragEnd() {
    draggingIndicator.value = null
    activeDropZone.value = null // Reset vùng active khi kết thúc kéo
  }

  function handleDragOver(zoneType) {
    // [THAY ĐỔI] Cập nhật vùng đang active
    activeDropZone.value = zoneType
  }

  function handleDragLeave(zoneType) {
    // [THAY ĐỔI] Chỉ reset nếu rời khỏi đúng vùng đang active
    if (activeDropZone.value === zoneType) {
      activeDropZone.value = null
    }
  }

  function handleDrop(zoneType) {
    if (draggingIndicator.value) {
      // Action `addCondition` đã được cập nhật để xử lý 4 zoneType mới
      strategyStore.addCondition(zoneType, draggingIndicator.value)
    }
    handleDragEnd()
  }

  return {
    // [THAY ĐỔI] Export state mới
    activeDropZone,
    // Các hàm xử lý không đổi tên
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragLeave,
    handleDrop,
  }
}
