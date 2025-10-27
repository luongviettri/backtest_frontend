import { ref } from 'vue'

/**
 * Composable để quản lý logic kéo và thả các chỉ báo.
 * @param {object} strategyStore - Instance của Pinia store để thực hiện action.
 * @returns {object} Các state và hàm xử lý cho việc kéo-thả.
 */
export function useDragAndDrop(strategyStore) {
  const draggingIndicator = ref(null)
  const activeDropZone = ref(null)

  // Sửa tên tham số cho rõ ràng
  function handleDragStart(indicatorType) {
    console.log('[DragDrop] Start dragging:', indicatorType) // Thêm log
    draggingIndicator.value = indicatorType // Lưu type thay vì name
  }

  function handleDragEnd() {
    console.log('[DragDrop] End dragging') // Thêm log
    draggingIndicator.value = null
    activeDropZone.value = null
  }

  function handleDragOver(zoneType) {
    activeDropZone.value = zoneType
  }

  function handleDragLeave(zoneType) {
    if (activeDropZone.value === zoneType) {
      activeDropZone.value = null
    }
  }

  function handleDrop(zoneType) {
    console.log(`[DragDrop] Dropped on zone: ${zoneType}`) // Thêm log
    if (draggingIndicator.value) {
      console.log(
        `[DragDrop] Adding indicator type: ${draggingIndicator.value} to zone: ${zoneType}`,
      ) // Thêm log chi tiết
      try {
        // Truyền indicatorType vào action
        strategyStore.addCondition(zoneType, draggingIndicator.value)
        console.log('[DragDrop] addCondition called successfully.') // Log thành công
      } catch (error) {
        console.error('[DragDrop] Error calling addCondition:', error) // Log nếu có lỗi từ store action
      }
    } else {
      console.log('[DragDrop] Drop ignored, no indicator was being dragged.') // Log nếu không có gì đang kéo
    }
    // Gọi handleDragEnd() để reset trạng thái kéo thả
    handleDragEnd() // <-- QUAN TRỌNG: Đảm bảo dòng này được gọi để reset
  }

  return {
    activeDropZone,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragLeave,
    handleDrop,
  }
}
