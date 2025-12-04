<template>
    <div class="mb-6">
        <label class="block text-sm font-semibold text-gray-700 mb-2">
            {{ label }}
        </label>
        <div class="flex items-center gap-4">
            <button @click="handleDecrease" :disabled="disabled || modelValue <= min" :class="[
                'w-10 h-10 rounded-lg border-2 flex items-center justify-center transition-colors',
                (disabled || modelValue <= min)
                    ? 'border-gray-300 text-gray-400 cursor-not-allowed opacity-50'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-100 cursor-pointer'
            ]">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
                </svg>
            </button>
            <input :value="modelValue" type="number" :min="min" :max="max" :disabled="disabled" :class="[
                'w-20 text-center border-2 border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500',
                disabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed opacity-50' : ''
            ]" @input="handleInputChange" @blur="handleBlur" />
            <button @click="handleIncrease" :disabled="disabled || modelValue >= max" :class="[
                'w-10 h-10 rounded-lg border-2 flex items-center justify-center transition-colors',
                (disabled || modelValue >= max)
                    ? 'border-gray-300 text-gray-400 cursor-not-allowed opacity-50'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-100 cursor-pointer'
            ]">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
            </button>
        </div>
        <p v-if="showError && modelValue > max" class="mt-2 text-sm text-red-600">
            Số lượng tối đa: {{ max }}
        </p>
    </div>
</template>

<script setup>


const props = defineProps({
    modelValue: {
        type: Number,
        required: true,
        default: 1
    },
    min: {
        type: Number,
        default: 1
    },
    max: {
        type: Number,
        default: 999
    },
    label: {
        type: String,
        default: 'Số lượng:'
    },
    showError: {
        type: Boolean,
        default: true
    },
    disabled: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits(['update:modelValue', 'increase', 'decrease', 'exceedMax'])

// Xử lý tăng số lượng
const handleIncrease = () => {
    if (props.disabled) return
    if (props.modelValue < props.max) {
        const newValue = props.modelValue + 1
        emit('update:modelValue', newValue)
        emit('increase', newValue)
    }
}

// Xử lý giảm số lượng
const handleDecrease = () => {
    if (props.disabled) return
    if (props.modelValue > props.min) {
        const newValue = props.modelValue - 1
        emit('update:modelValue', newValue)
        emit('decrease', newValue)
    }
}

// Xử lý input thay đổi - cho phép xóa và nhập giá trị
const handleInputChange = (event) => {
    if (props.disabled) return

    const inputValue = event.target.value.trim()

    // Cho phép input rỗng tạm thời (để có thể xóa) - không emit, giữ giá trị hiện tại
    if (inputValue === '' || inputValue === null || inputValue === undefined) {
        // Cho phép input rỗng để người dùng có thể xóa, nhưng không emit
        // Sẽ được xử lý trong handleBlur
        return
    }

    // Parse giá trị
    let value = parseInt(inputValue)

    // Nếu không phải số hợp lệ, không làm gì cả để người dùng tiếp tục nhập
    if (isNaN(value)) {
        return
    }

    // Nếu nhập 0, set về min (mặc định là 1) ngay lập tức
    if (value === 0) {
        value = props.min
        event.target.value = value
        emit('update:modelValue', value)
        return
    }

    // Kiểm tra nếu vượt quá max, emit event để parent xử lý
    if (value > props.max) {
        emit('exceedMax', value)
        // Vẫn emit để parent có thể xử lý, nhưng giữ giá trị max trong input
        event.target.value = props.max
        emit('update:modelValue', props.max)
        return
    }

    // Validate: không được nhỏ hơn min
    if (value < props.min) {
        value = props.min
        event.target.value = value
    }

    emit('update:modelValue', value)
}

// Xử lý khi blur (mất focus) - đảm bảo giá trị hợp lệ
const handleBlur = (event) => {
    if (props.disabled) return

    let value = parseInt(event.target.value)

    // Nếu rỗng hoặc không hợp lệ, set về min (mặc định là 1)
    if (isNaN(value) || value === '' || value === null || value === undefined || value < props.min) {
        value = props.min
        event.target.value = value
        emit('update:modelValue', value)
    } else if (value > props.max) {
        // Nếu vượt quá max, emit event và set về max
        emit('exceedMax', value)
        event.target.value = props.max
        emit('update:modelValue', props.max)
    }
}
</script>
