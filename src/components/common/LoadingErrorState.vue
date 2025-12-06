<template>
  <!-- Loading State -->
  <div v-if="isLoading" class="flex justify-center items-center py-12">
    <div class="text-center">
      <Skeleton class="h-8 w-8 rounded-full" />
      <p class="mt-4 text-muted-foreground">{{ loadingMessage }}</p>
    </div>
  </div>

  <!-- Error State -->
  <Alert v-else-if="errorMessage" variant="destructive" class="mb-4">
    <AlertCircle class="h-4 w-4" />
    <AlertTitle>Lỗi</AlertTitle>
    <AlertDescription class="flex items-center justify-between">
      <span>{{ errorMessage }}</span>
    </AlertDescription>
  </Alert>
</template>

<script setup lang="ts">
import { AlertCircle } from "lucide-vue-next"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

withDefaults(
  defineProps<{
    isLoading?: boolean
    errorMessage?: string
    loadingMessage?: string
  }>(),
  {
    isLoading: false,
    errorMessage: "",
    loadingMessage: "Đang tải...",
  }
)

const emit = defineEmits<{
  "reset-error": []
}>()
</script>
