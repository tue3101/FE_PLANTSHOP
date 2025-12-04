<template>
    <Teleport to="body">
        <div v-if="showModal" class="fixed inset-0 flex items-center justify-center z-50 "
            @click.self="handleCancel">
            <div ref="modalRef" class="bg-white rounded-lg shadow-xl p-6 w-96 max-w-[90vw]"
                :style="{ transform: `translate(${position.x}px, ${position.y}px)` }">
                <!-- Header có thể kéo -->
                <div class="flex justify-between items-center mb-4 cursor-move select-none"
                    @mousedown="handleMouseDown">
                    <h3 class="text-lg font-semibold" :class="titleClass">
                        {{ computedTitle }}
                    </h3>
                    <button @click="handleClose" class="text-gray-500 hover:text-gray-700 cursor-pointer no-drag">
                        <X :size="24" />
                    </button>
                </div>

                <!-- Confirm Mode -->
                <template v-if="mode === 'confirm'">
                    <div class="mb-6">
                        <p class="text-gray-700">{{ message || 'Bạn có chắc chắn muốn xóa không?' }}</p>
                    </div>
                    <div class="flex justify-end space-x-4">
                        <button @click="handleCancel"
                            class="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition-colors cursor-pointer">
                            Hủy
                        </button>
                        <button @click="handleConfirm"
                            class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors cursor-pointer">
                            Xóa
                        </button>
                    </div>
                </template>

                <!-- Success Modes -->
                <template v-else>
                    <div class="mb-6">
                        <div class="flex items-center justify-center mb-4">
                            <div :class="iconContainerClass" class="rounded-full p-3">
                                <component :is="iconComponent" :size="48" :class="iconClass" />
                            </div>
                        </div>
                        <p class="text-center text-gray-700">{{ message || defaultMessage }}</p>
                    </div>
                    <div class="flex justify-end">
                        <button @click="handleClose" :class="buttonClass"
                            class="px-4 py-2 text-white rounded transition-colors cursor-pointer">
                            Đóng
                        </button>
                    </div>
                </template>
            </div>
        </div>
    </Teleport>
</template>

<script setup>
import { computed, ref } from 'vue'
import { CheckCircle2, XCircle, Info, AlertCircle, X } from 'lucide-vue-next'
import { useDragModal } from '@/composables/useDragModal'

const props = defineProps({
    showModal: {
        type: Boolean,
        required: true
    },
    mode: {
        type: String,
        default: 'confirm',
        validator: (value) => [
            'confirm',
            'success',
            'add-success',
            'update-success',
            'delete-success',
            'restore-success',
            'error',
            'info'
        ].includes(value)
    },
    title: {
        type: String,
        default: ''
    },
    message: {
        type: String,
        default: ''
    }
})

const emit = defineEmits(['confirm', 'cancel', 'close', 'update:showModal'])

// Drag functionality
const modalRef = ref(null)
const dragModalProps = {
    get showModal() {
        return props.showModal
    }
}
const { position, handleMouseDown } = useDragModal(dragModalProps)

// Computed properties cho từng mode
const computedTitle = computed(() => {
    if (props.title) return props.title

    switch (props.mode) {
        case 'confirm':
            return 'Xác nhận xóa'
        case 'add-success':
            return 'Thêm thành công'
        case 'update-success':
            return 'Cập nhật thành công'
        case 'delete-success':
            return 'Xóa thành công'
        case 'restore-success':
            return 'Khôi phục thành công'
        case 'success':
            return 'Xóa thành công' // Giữ tương thích với code cũ
        case 'error':
            return 'Lỗi'
        case 'info':
            return 'Thông báo'
        default:
            return 'Thông báo'
    }
})

const defaultMessage = computed(() => {
    switch (props.mode) {
        case 'add-success':
            return 'Đã thêm thành công!'
        case 'update-success':
            return 'Đã cập nhật thành công!'
        case 'delete-success':
        case 'success':
            return 'Mục đã được xóa thành công.' // Giữ tương thích với code cũ
        case 'restore-success':
            return 'Đã khôi phục thành công!'
        case 'error':
            return 'Đã xảy ra lỗi!'
        case 'info':
            return 'Thông báo'
        default:
            return ''
    }
})

const titleClass = computed(() => {
    switch (props.mode) {
        case 'add-success':
        case 'update-success':
        case 'delete-success':
        case 'restore-success':
        case 'success':
            return 'text-green-600'
        case 'error':
            return 'text-red-600'
        case 'info':
            return 'text-blue-600'
        default:
            return 'text-gray-900'
    }
})

const iconComponent = computed(() => {
    switch (props.mode) {
        case 'add-success':
        case 'update-success':
        case 'delete-success':
        case 'restore-success':
        case 'success':
            return CheckCircle2
        case 'error':
            return XCircle
        case 'info':
            return Info
        default:
            return AlertCircle
    }
})

const iconClass = computed(() => {
    switch (props.mode) {
        case 'add-success':
        case 'update-success':
        case 'delete-success':
        case 'restore-success':
        case 'success':
            return 'text-green-500'
        case 'error':
            return 'text-red-500'
        case 'info':
            return 'text-blue-500'
        default:
            return 'text-gray-500'
    }
})

const iconContainerClass = computed(() => {
    switch (props.mode) {
        case 'add-success':
        case 'update-success':
        case 'delete-success':
        case 'restore-success':
        case 'success':
            return 'bg-green-100'
        case 'error':
            return 'bg-red-100'
        case 'info':
            return 'bg-blue-100'
        default:
            return 'bg-gray-100'
    }
})

const buttonClass = computed(() => {
    switch (props.mode) {
        case 'add-success':
        case 'update-success':
        case 'delete-success':
        case 'restore-success':
        case 'success':
            return 'bg-green-500 hover:bg-green-600'
        case 'error':
            return 'bg-red-500 hover:bg-red-600'
        case 'info':
            return 'bg-blue-500 hover:bg-blue-600'
        default:
            return 'bg-gray-500 hover:bg-gray-600'
    }
})

const handleClose = () => {
    emit('close')
    emit('update:showModal', false)
}

const handleCancel = () => {
    emit('cancel')
    emit('update:showModal', false)
}

const handleConfirm = () => {
    emit('confirm')
}
</script>
