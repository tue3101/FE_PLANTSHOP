<template>
    <div v-if="showModal" class="fixed inset-0  flex items-center justify-center z-50" @click.self="handleClose">
        <div ref="modalRef" class="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
            :style="{ transform: `translate(${position.x}px, ${position.y}px)` }">
            <!-- Header -->
            <div class="flex items-center justify-between p-6 border-b cursor-move select-none"
                @mousedown="handleMouseDown">
                <h2 class="text-2xl font-bold text-gray-800">{{ title }}</h2>
                <button @click="handleClose" class="text-gray-500 hover:text-gray-700 transition-colors cursor-pointer">
                    <X :size="24" />
                </button>
            </div>

            <!-- Content -->
            <div class="p-6">
                <div v-if="item">
                    <!-- Layout 2 cột: Ảnh bên trái, thông tin bên phải -->
                    <div class="flex flex-col md:flex-row gap-6">
                        <!-- Cột trái: Hình ảnh -->
                        <div v-if="imageField" class="md:w-1/3 flex-shrink-0">
                            <div>
                                <img :src="getImageUrl(item[imageField.key])" :alt="imageField.label"
                                    class="w-full h-auto rounded-lg shadow-md object-contain border border-gray-200"
                                    @error="handleImageError" />
                            </div>
                        </div>

                        <!-- Cột phải: Thông tin chi tiết -->
                        <div class="flex-1 space-y-4">
                            <div v-for="field in textFields" :key="field.key" class="border-b pb-3 last:border-b-0">
                                <div class="flex flex-col sm:flex-row sm:items-start">
                                    <div class="font-semibold text-gray-700 mb-1 sm:mb-0 sm:w-1/3">
                                        {{ field.label }}:
                                    </div>
                                    <div class="flex-1 text-gray-900">
                                        <span v-if="field.type === 'address'">{{ formatAddress(item, field) }}</span>
                                        <span v-else>{{ formatValue(item[field.key], field) }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div v-else class="text-center text-gray-500 py-8">
                    Không có dữ liệu để hiển thị
                </div>
            </div>

            <!-- Footer -->
            <div class="flex justify-end p-6 border-t">
                <button @click="handleClose"
                    class="px-6 py-2 bg-gray-300 rounded hover:bg-gray-400 transition-colors cursor-pointer">
                    Đóng
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useDragModal } from '@/composables/useDragModal'
import { X } from 'lucide-vue-next'
import { getCityById, getDistrictById } from '@/constants/locations'

const props = defineProps({
    showModal: {
        type: Boolean,
        default: false
    },
    title: {
        type: String,
        default: 'Chi tiết'
    },
    item: {
        type: Object,
        default: null
    },
    fields: {
        type: Array,
        required: true,
        default: () => []
    },
    options: {
        type: Object,
        default: () => ({})
    }
})

const emit = defineEmits(['close', 'update:showModal'])

// Drag functionality
const modalRef = ref(null)
const { position, handleMouseDown } = useDragModal(props)

// Không cần location store nữa, sử dụng dữ liệu cố định từ constants

const displayFields = computed(() => {
    return props.fields.filter(field => {
        if (field.type === 'password' || field.type === 'file') {
            return false
        }
        return true
    })
})

const imageField = computed(() => {
    return displayFields.value.find(field => field.type === 'image' && props.item?.[field.key])
})

const textFields = computed(() => {
    return displayFields.value.filter(field => {

        if (field.type === 'image') {
            return false
        }
        return true
    })
})

const handleClose = () => {
    emit('close')
    emit('update:showModal', false)
}

const formatValue = (value, field) => {
    if (value === null || value === undefined || value === '') {
        return 'Không có dữ liệu'
    }

    // Format price
    if (field.type === 'price' || field.format === 'price') {
        // Xử lý các trường hợp null, undefined, hoặc không phải số
        let numValue = 0
        if (typeof value === 'string') {
            const cleaned = value.replace(/[^\d.]/g, '')
            numValue = parseFloat(cleaned) || 0
        } else if (typeof value === 'number') {
            numValue = isNaN(value) ? 0 : value
        } else {
            numValue = 0
        }

        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(numValue)
    }

    // Format select options
    if (field.type === 'select' && field.optionsKey && props.options[field.optionsKey]) {
        const option = props.options[field.optionsKey].find(
            opt => opt[field.optionValue] === value
        )
        return option ? option[field.optionLabel] : value
    }

    // Format discount value (nếu có type từ item)
    if (field.key === 'value' && props.item?.type) {
        const numValue = Number(value)
        if (props.item.type === 'PERCENT') {
            return `${numValue}%`
        } else if (props.item.type === 'CASH') {
            return new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND'
            }).format(numValue)
        }
    }

    // Format boolean
    if (typeof value === 'boolean') {
        return value ? 'Có' : 'Không'
    }

    return value
}

// Format địa chỉ hoàn chỉnh (ghép address + district + city)
const formatAddress = (item, field) => {
    if (!item) return 'Không có dữ liệu'

    const address = item.address || item[field.key] || ''
    const districtId = item.district_id
    const cityId = item.city_id || 1

    // Nếu địa chỉ rỗng và không có district_id
    if (!address && !districtId) {
        return 'Không có dữ liệu'
    }

    // Nếu địa chỉ đã là địa chỉ hoàn chỉnh, hiển thị trực tiếp
    if (address && (address.includes('Hồ Chí Minh') || address.includes('Bà Rịa') || address.includes('Vũng Tàu'))) {
        return address
    }

    // Nếu có district_id, tìm tên quận và thành phố để ghép lại thành địa chỉ hoàn chỉnh
    if (districtId) {
        const district = getDistrictById(districtId)
        const districtName = district ? district.name : ''
        const city = getCityById(cityId)
        const cityName = city ? city.name : ''

        if (districtName && cityName) {
            // Ghép địa chỉ hoàn chỉnh: "Địa chỉ, Quận, Thành phố"
            const parts = []
            if (address && address.trim()) {
                parts.push(address.trim())
            }
            parts.push(districtName)
            parts.push(cityName)

            return parts.filter(p => p).join(', ')
        }
    }

    // Nếu không tìm được quận hoặc không có district_id, chỉ hiển thị địa chỉ hiện có
    return address || 'Không có dữ liệu'
}

const getImageUrl = (url) => {
    if (!url) return '/img/footer.png'
    if (url.includes('cloudinary')) {
        return url
    }
    return url
}

const handleImageError = (event) => {
    if (!event.target.src.includes('footer.png')) {
        event.target.src = '/img/footer.png'
    }
}
</script>
