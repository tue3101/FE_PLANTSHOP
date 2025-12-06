<template>
  <AlertDialog :open="show" @update:open="handleOpenChange">
    <AlertDialogContent class="w-full max-w-md mx-4">
      <AlertDialogHeader>
        <AlertDialogTitle>{{ title }}</AlertDialogTitle>
        <AlertDialogDescription>{{ message }}</AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel @click="handleCancel">Huỷ</AlertDialogCancel>
        <AlertDialogAction @click="handleConfirm" class="bg-destructive hover:bg-destructive/90">
          {{ confirmText }}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>

<script setup lang="ts">
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

withDefaults(defineProps<{
  show?: boolean
  title?: string
  message?: string
  confirmText?: string
}>(), {
  show: false,
  title: "Rời khỏi trang này?",
  message:
    "Bạn có chắc muốn rời khỏi trang này? Các thay đổi của bạn có thể không được lưu.",
  confirmText: "Đồng ý",
})

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()

const handleOpenChange = (open: boolean): void => {
  if (!open) {
    handleCancel()
  }
}

const handleConfirm = (): void => {
  emit("confirm")
}

const handleCancel = (): void => {
  emit("cancel")
}
</script>
