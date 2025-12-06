import { ref, watch, onUnmounted, type Ref } from "vue"

interface DragModalProps {
  showModal: boolean
}

interface Position {
  x: number
  y: number
}

export function useDragModal(props: DragModalProps) {
  //Drag->kéo
  const isDragging: Ref<boolean> = ref(false)
  //tọa độ hiện tại
  const position: Ref<Position> = ref({ x: 0, y: 0 })
  //vị trí chuột ban đầu
  const dragStart: Ref<Position> = ref({ x: 0, y: 0 })

  //client di chuyển chuột
  const handleMouseMove = (e: MouseEvent): void => {
    if (!isDragging.value) return
    position.value = {
      x: e.clientX - dragStart.value.x,
      y: e.clientY - dragStart.value.y,
    }
  }

  //khi client thả chuột
  const handleMouseUp = (): void => {
    isDragging.value = false
    document.removeEventListener("mousemove", handleMouseMove)
    document.removeEventListener("mouseup", handleMouseUp)
  }

  //khi client bắt đầu kéo
  const handleMouseDown = (e: MouseEvent): void => {
    //nếu client click vào vùng ko được phép drag
    if (
      (e.target as HTMLElement).closest("button") ||
      (e.target as HTMLElement).closest(".no-drag")
    ) {
      return
    }
    isDragging.value = true
    dragStart.value = {
      x: e.clientX - position.value.x,
      y: e.clientY - position.value.y,
    }
    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)
    e.preventDefault()
  }

  // Reset position khi mở/đóng modal
  watch(
    () => props.showModal,
    (newVal: boolean) => {
      if (!newVal) {
        // Reset position và cleanup khi đóng modal
        position.value = { x: 0, y: 0 }
        // Đảm bảo cleanup event listeners khi modal đóng
        if (isDragging.value) {
          handleMouseUp()
        }
      } else {
        position.value = { x: 0, y: 0 }
      }
    }
  )

  // Cleanup event listeners khi component unmount
  onUnmounted(() => {
    if (isDragging.value) {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  })

  return {
    isDragging,
    position,
    handleMouseDown,
  }
}

