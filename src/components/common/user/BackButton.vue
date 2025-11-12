<template>
    <button @click="handleBack"
        class="mb-6 text-gray-600 hover:text-gray-800 flex items-center gap-2 transition-all duration-200 hover:gap-3 cursor-pointer">
        <ArrowLeft :size="20" />
        <span>Quay lại</span>
    </button>
</template>

<script setup>
import { ArrowLeft } from 'lucide-vue-next'
import { useRouter } from 'vue-router'

const router = useRouter()

const handleBack = () => {
    router.back()
}
</script>
