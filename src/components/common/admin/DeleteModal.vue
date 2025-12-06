<template>
  <AlertDialog :open="showModal" @update:open="handleOpenChange">
    <AlertDialogContent
      ref="modalRef"
      class="w-96 max-w-[90vw]"
      :style="{ transform: `translate(${position.x}px, ${position.y}px)` }"
    >
      <AlertDialogHeader @mousedown="handleMouseDown">
        <AlertDialogTitle :class="titleClass">
          {{ computedTitle }}
        </AlertDialogTitle>
      </AlertDialogHeader>

      <!-- Confirm Mode -->
      <template v-if="mode === 'confirm'">
        <AlertDialogDescription class="mb-6">
          {{ message || "Bạn có chắc chắn muốn xóa không?" }}
        </AlertDialogDescription>
        <AlertDialogFooter>
          <AlertDialogCancel @click="handleCancel">Hủy</AlertDialogCancel>
          <AlertDialogAction @click="handleConfirm" class="bg-red-500 hover:bg-red-600 text-white">
            <Trash />
            Xóa
          </AlertDialogAction>
        </AlertDialogFooter>
      </template>

      <!-- Success Modes -->
      <template v-else>
        <div class="mb-6">
          <div class="flex items-center justify-center mb-4">
            <div :class="iconContainerClass" class="rounded-full p-3">
              <component :is="iconComponent" :size="48" :class="iconClass" />
            </div>
          </div>
          <AlertDialogDescription class="text-center">
            {{ message || defaultMessage }}
          </AlertDialogDescription>
        </div>
        <AlertDialogFooter>
          <Button @click="handleClose" :class="buttonClass" class="text-white"> Đóng </Button>
        </AlertDialogFooter>
      </template>
    </AlertDialogContent>
  </AlertDialog>
</template>

<script setup lang="ts">
import { computed, ref } from "vue"
import { CheckCircle2, XCircle, Info, AlertCircle, X, Trash } from "lucide-vue-next"
import { useDragModal } from "@/composables/useDragModal"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"

type ModalMode =
  | "confirm"
  | "success"
  | "add-success"
  | "update-success"
  | "delete-success"
  | "restore-success"
  | "error"
  | "info"

const props = withDefaults(
  defineProps<{
    showModal: boolean
    mode?: ModalMode
    title?: string
    message?: string
  }>(),
  {
    mode: "confirm",
    title: "",
    message: "",
  }
)

const emit = defineEmits<{
  confirm: []
  cancel: []
  close: []
  "update:showModal": [value: boolean]
}>()

// Drag functionality
const modalRef = ref<HTMLElement | null>(null)
const dragModalProps = {
  get showModal() {
    return props.showModal
  },
}
const { position, handleMouseDown } = useDragModal(dragModalProps)

const handleOpenChange = (open: boolean): void => {
  if (!open) {
    handleClose()
  }
}

// Computed properties cho từng mode
const computedTitle = computed(() => {
  if (props.title) return props.title

  switch (props.mode) {
    case "confirm":
      return "Xác nhận xóa"
    case "add-success":
      return "Thêm thành công"
    case "update-success":
      return "Cập nhật thành công"
    case "delete-success":
      return "Xóa thành công"
    case "restore-success":
      return "Khôi phục thành công"
    case "success":
      return "Xóa thành công" // Giữ tương thích với code cũ
    case "error":
      return "Lỗi"
    case "info":
      return "Thông báo"
    default:
      return "Thông báo"
  }
})

const defaultMessage = computed(() => {
  switch (props.mode) {
    case "add-success":
      return "Đã thêm thành công!"
    case "update-success":
      return "Đã cập nhật thành công!"
    case "delete-success":
    case "success":
      return "Mục đã được xóa thành công." // Giữ tương thích với code cũ
    case "restore-success":
      return "Đã khôi phục thành công!"
    case "error":
      return "Đã xảy ra lỗi!"
    case "info":
      return "Thông báo"
    default:
      return ""
  }
})

const titleClass = computed(() => {
  switch (props.mode) {
    case "add-success":
    case "update-success":
    case "delete-success":
    case "restore-success":
    case "success":
      return "text-green-600"
    case "error":
      return "text-red-600"
    case "info":
      return "text-blue-600"
    default:
      return "text-gray-900"
  }
})

const iconComponent = computed(() => {
  switch (props.mode) {
    case "add-success":
    case "update-success":
    case "delete-success":
    case "restore-success":
    case "success":
      return CheckCircle2
    case "error":
      return XCircle
    case "info":
      return Info
    default:
      return AlertCircle
  }
})

const iconClass = computed(() => {
  switch (props.mode) {
    case "add-success":
    case "update-success":
    case "delete-success":
    case "restore-success":
    case "success":
      return "text-green-500"
    case "error":
      return "text-red-500"
    case "info":
      return "text-blue-500"
    default:
      return "text-gray-500"
  }
})

const iconContainerClass = computed(() => {
  switch (props.mode) {
    case "add-success":
    case "update-success":
    case "delete-success":
    case "restore-success":
    case "success":
      return "bg-green-100"
    case "error":
      return "bg-red-100"
    case "info":
      return "bg-blue-100"
    default:
      return "bg-gray-100"
  }
})

const buttonClass = computed(() => {
  switch (props.mode) {
    case "add-success":
    case "update-success":
    case "delete-success":
    case "restore-success":
    case "success":
      return "bg-green-500 hover:bg-green-600"
    case "error":
      return "bg-red-500 hover:bg-red-600"
    case "info":
      return "bg-blue-500 hover:bg-blue-600"
    default:
      return "bg-gray-500 hover:bg-gray-600"
  }
})

const handleClose = (): void => {
  emit("close")
  emit("update:showModal", false)
}

const handleCancel = (): void => {
  emit("cancel")
  emit("update:showModal", false)
}

const handleConfirm = (): void => {
  emit("confirm")
}
</script>
