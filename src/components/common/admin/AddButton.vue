<template>
  <Button @click="$emit('click')" :title="title">
    <Plus :size="24" />
    <span>Thêm mới</span>
  </Button>
</template>

<script setup lang="ts">
import { Plus } from "lucide-vue-next"
import { Button } from "@/components/ui/button"

defineProps<{
  title?: string
}>()

defineEmits<{
  click: []
}>()
</script>
