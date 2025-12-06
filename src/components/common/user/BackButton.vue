<template>
  <Button
    variant="ghost"
    @click="handleBack"
    class="mb-6 flex items-center gap-2"
  >
    <ArrowLeft :size="20" />
    <span>Quay lại</span>
  </Button>
</template>

<script setup lang="ts">
import { ArrowLeft } from "lucide-vue-next"
import { useRouter } from "vue-router"
import { Button } from "@/components/ui/button"

const router = useRouter()

const handleBack = (): void => {
  router.back()
}
</script>
