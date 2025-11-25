<template>
    <div v-if="show" class="fixed inset-0 flex items-center justify-center z-50 "
        @click.self="handleCancel">
        <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4" @click.stop>
            <h3 class="text-lg font-semibold text-gray-800 mb-4">{{ title }}</h3>
            <p class="text-gray-700 mb-6">{{ message }}</p>
            <div class="flex justify-end gap-3">
                <button @click="handleCancel"
                    class="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-semibold transition-colors cursor-pointer">
                    Huỷ
                </button>
                <button @click="handleConfirm"
                    class="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors cursor-pointer">
                    {{ confirmText }}
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { defineProps} from 'vue'

defineProps({
    show: {
        type: Boolean,
        default: false
    },
    title: {
        type: String,
        default: 'Rời khỏi trang này?'
    },
    message: {
        type: String,
        default: 'Bạn có chắc muốn rời khỏi trang này? Các thay đổi của bạn có thể không được lưu.'
    },
    confirmText: {
        type: String,
        default: 'Đồng ý'
    }
})

const emit = defineEmits(['confirm', 'cancel'])

const handleConfirm = () => {
    emit('confirm')
}

const handleCancel = () => {
    emit('cancel')
}
</script>
