<template>
    <!-- Loading State -->
    <div v-if="isLoading" class="flex justify-center items-center py-12">
        <div class="text-center">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p class="mt-4 text-gray-600">{{ loadingMessage }}</p>
        </div>
    </div>

    <!-- Error State -->
    <div v-else-if="errorMessage" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        <div class="flex items-center justify-between">
            <span>{{ errorMessage }}</span>
            <button @click="handleResetError" class="text-red-700 hover:text-red-900 cursor-pointer">
                <X :size="24" />
            </button>
        </div>
    </div>
</template>

<script setup>
import { X } from 'lucide-vue-next'

defineProps({
    isLoading: {
        type: Boolean,
        default: false
    },
    errorMessage: {
        type: String,
        default: ''
    },
    loadingMessage: {
        type: String,
        default: 'Đang tải...'
    }
})

const emit = defineEmits(['reset-error'])

const handleResetError = () => {
    emit('reset-error')
}
</script>
