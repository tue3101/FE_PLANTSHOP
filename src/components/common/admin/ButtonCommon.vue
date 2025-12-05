<template>
  <div class="space-x-2">
    <button
      class="text-purple-500 hover:text-purple-700 hover:cursor-pointer"
      title="Xem chi tiết"
      @click="$emit('view', item)"
    >
      <Eye :size="20" />
    </button>
    <button
      v-if="selectedActive !== 'deactive'"
      class="text-blue-500 hover:text-blue-700 hover:cursor-pointer"
      title="Cập nhật"
      @click="$emit('update', item)"
    >
      <Pencil :size="20" />
    </button>
    <button
      v-if="selectedActive === 'deactive'"
      class="text-green-500 hover:text-green-700 hover:cursor-pointer"
      title="Khôi phục"
      @click="$emit('restore', item)"
    >
      <RotateCcw :size="20" />
    </button>
    <button
      v-if="selectedActive !== 'deactive'"
      class="text-red-500 hover:text-red-700 hover:cursor-pointer"
      title="Xóa"
      @click="$emit('delete', item)"
    >
      <Trash2 :size="20" />
    </button>
  </div>
</template>

<script setup>
import { Eye, Pencil, RotateCcw, Trash2 } from "lucide-vue-next"

defineProps({
  selectedActive: {
    type: String,
    default: "",
  },
  item: {
    type: Object,
    required: true,
  },
})

defineEmits(["view", "update", "restore", "delete"])
</script>
