<template>
  <div class="space-x-2">
    <Button
      variant="ghost"
      size="icon"
      class="text-purple-500 hover:text-purple-700"
      title="Xem chi tiết"
      @click="$emit('view', item)"
    >
      <Eye :size="20" />
    </Button>
    <Button
      v-if="selectedActive !== 'deactive'"
      variant="ghost"
      size="icon"
      class="text-blue-500 hover:text-blue-700"
      title="Cập nhật"
      @click="$emit('update', item)"
    >
      <Pencil :size="20" />
    </Button>
    <Button
      v-if="selectedActive === 'deactive'"
      variant="ghost"
      size="icon"
      class="text-green-500 hover:text-green-700"
      title="Khôi phục"
      @click="$emit('restore', item)"
    >
      <RotateCcw :size="20" />
    </Button>
    <Button
      v-if="selectedActive !== 'deactive'"
      variant="ghost"
      size="icon"
      class="text-red-500 hover:text-red-700"
      title="Xóa"
      @click="$emit('delete', item)"
    >
      <Trash2 :size="20" />
    </Button>
  </div>
</template>

<script setup lang="ts">
import { Eye, Pencil, RotateCcw, Trash2 } from "lucide-vue-next"
import { Button } from "@/components/ui/button"

defineProps<{
  selectedActive?: string
  item: Record<string, unknown>
}>()

defineEmits<{
  view: [item: Record<string, unknown>]
  update: [item: Record<string, unknown>]
  restore: [item: Record<string, unknown>]
  delete: [item: Record<string, unknown>]
}>()
</script>
