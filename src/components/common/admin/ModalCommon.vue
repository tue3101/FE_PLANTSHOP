<template>
    <div v-if="showModal" class="fixed inset-0 flex items-center justify-center  bg-opacity-50 z-50">
        <div ref="modalRef" class="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            :style="{ transform: `translate(${position.x}px, ${position.y}px)` }">
            <div class="flex justify-between items-center mb-6 cursor-move select-none" @mousedown="handleMouseDown">
                <h3 class="text-xl font-bold">{{ title }}</h3>
                <button @click="handleCancel" class="text-gray-500 hover:text-gray-700 cursor-pointer">
                    <X :size="24" />
                </button>
            </div>

            <form @submit.prevent="handleSubmit" class="space-y-4">
                <template v-for="field in fields" :key="field.key">
                    <!-- Text Input -->
                    <div v-if="field.type === 'text'">
                        <label class="block text-sm font-medium text-gray-700 mb-1">
                            {{ field.label }}
                            <span v-if="field.required" class="text-red-600 text-sm"> *</span>
                        </label>
                        <input v-model="formData[field.key]" type="text" :required="field.required"
                            class="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            :placeholder="field.placeholder || `Nhập ${field.label.toLowerCase()}`" />
                    </div>

                    <!-- Email Input -->
                    <div v-else-if="field.type === 'email'">
                        <label class="block text-sm font-medium text-gray-700 mb-1">
                            {{ field.label }}<span v-if="field.required" class="text-red-600 text-sm"> *</span>
                        </label>
                        <input v-model="formData[field.key]" type="email" :required="field.required"
                            class="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            :placeholder="field.placeholder || `Nhập ${field.label.toLowerCase()}`" />
                        <p class="mt-1 text-xs text-gray-500">
                            (ví dụ: example@email.com)
                        </p>
                    </div>

                    <!-- Password Input -->
                    <div v-else-if="field.type === 'password'">
                        <label class="block text-sm font-medium text-gray-700 mb-1">
                            {{ field.label }}<span v-if="field.required" class="text-red-600 text-sm"> *</span>
                        </label>
                        <input v-model="formData[field.key]" type="password" :required="field.required"
                            :minlength="field.minLength"
                            class="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            :placeholder="field.placeholder || `Nhập ${field.label.toLowerCase()}`" />
                        <p v-if="field.minLength" class="mt-1 text-xs text-gray-500">
                            Mật khẩu tối thiểu {{ field.minLength }} ký tự
                        </p>
                    </div>

                    <!-- Number Input -->
                    <div v-else-if="field.type === 'number'">
                        <label class="block text-sm font-medium text-gray-700 mb-1">
                            {{ field.label }}<span v-if="field.required" class="text-red-600 text-sm"> *</span>
                        </label>
                        <input v-model.number="formData[field.key]" type="number" :required="field.required"
                            class="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            :placeholder="field.placeholder || `Nhập ${field.label.toLowerCase()}`" />
                    </div>

                    <!-- Select Dropdown -->
                    <div v-else-if="field.type === 'select'">
                        <label class="block text-sm font-medium text-gray-700 mb-1">
                            {{ field.label }}<span v-if="field.required" class="text-red-600 text-sm"> *</span>
                        </label>
                        <select v-model="formData[field.key]" :required="field.required"
                            class="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="">{{ field.placeholder || `Chọn ${field.label.toLowerCase()}` }}</option>
                            <option v-for="option in getOptions(field.optionsKey)" :key="option[field.optionValue]"
                                :value="option[field.optionValue]">
                                {{ option[field.optionLabel] }}
                            </option>
                        </select>
                    </div>

                    <!-- Textarea -->
                    <div v-else-if="field.type === 'textarea'">
                        <label class="block text-sm font-medium text-gray-700 mb-1">
                            {{ field.label }}<span v-if="field.required" class="text-red-600 text-sm"> *</span>
                        </label>
                        <textarea v-model="formData[field.key]" :rows="field.rows || 4"
                            class="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            :placeholder="field.placeholder || `Nhập ${field.label.toLowerCase()}`"></textarea>
                    </div>

                    <!-- File Upload -->
                    <div v-else-if="field.type === 'file'">
                        <label class="block text-sm font-medium text-gray-700 mb-1">
                            {{ field.label }}<span v-if="field.required" class="text-red-600 text-sm"> *</span>
                        </label>
                        <div class="relative">
                            <input :ref="el => fileInput = el" type="file" :accept="field.accept"
                                @change="handleFileChange" class="hidden" />
                            <label @click.prevent="handleFileLabelClick" :class="[
                                'flex items-center justify-between w-full border rounded px-4 py-2 cursor-pointer transition-colors',
                                fileError && field.required ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:bg-gray-50'
                            ]">
                                <span :class="fileError && field.required ? 'text-red-700' : 'text-gray-700'">
                                    {{ selectedFile ? selectedFile.name : ('Chọn file') }}
                                </span>
                                <Upload class="h-5 w-5 text-gray-500" />
                            </label>
                        </div>
                        <!-- Error message for file -->
                        <p v-if="fileError && field.required" class="mt-1 text-sm text-red-600">
                            {{ fileError }}
                        </p>
                        <!-- Image Preview -->
                        <div v-if="imagePreview" class="mt-4">
                            <img :src="imagePreview" alt="Preview"
                                class="max-w-full h-48 object-contain rounded border border-gray-300" />
                            <button type="button" @click="removeImage"
                                class="mt-2 text-sm text-red-600 hover:text-red-800">
                                Xóa ảnh
                            </button>
                        </div>
                    </div>

                    <!-- Image Display (for update mode) -->
                    <div v-else-if="field.type === 'image'">
                        <label class="block text-sm font-medium text-gray-700 mb-1">
                            {{ field.label }}<span v-if="field.required" class="text-red-600 text-sm"> *</span>
                        </label>
                        <div class="relative">
                            <input :ref="el => fileInput = el" type="file" accept="image/*" @change="handleFileChange"
                                class="hidden" />
                            <label @click.prevent="handleFileLabelClick" :class="[
                                'flex items-center justify-between w-full border rounded px-4 py-2 cursor-pointer transition-colors',
                                fileError && field.required ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:bg-gray-50'
                            ]">
                                <span :class="fileError && field.required ? 'text-red-700' : 'text-gray-700'">
                                    {{ selectedFile ? selectedFile.name : (initialData?.[field.key] ? 'Upload File' :
                                        'Chọn ảnh mới') }}
                                </span>
                                <Upload class="h-5 w-5 text-gray-500" />
                            </label>
                        </div>
                        <!-- Error message for file -->
                        <p v-if="fileError && field.required" class="mt-1 text-sm text-red-600">
                            {{ fileError }}
                        </p>
                        <!-- Image Preview -->
                        <div v-if="imagePreview" class="mt-4">
                            <img :src="imagePreview" alt="Preview"
                                class="max-w-full h-48 object-contain rounded border border-gray-300" />
                            <button type="button" @click="removeImage"
                                class="mt-2 text-sm text-red-600 hover:text-red-800">
                                Xóa ảnh
                            </button>
                        </div>
                    </div>

                    <!-- Address Selector -->
                    <div v-else-if="field.type === 'address'">
                        <AddressSelector :model-value="addressFieldData[field.key] || {}" mode="user"
                            :required="field.required" focus-ring-class="focus:ring-blue-500"
                            @update:model-value="handleAddressChange(field.key, $event)"
                            @change="handleAddressChange(field.key, $event)" />
                    </div>
                </template>

                <!-- Error Message -->
                <LoadingErrorState :isLoading="false" :errorMessage="errorMessage"
                    @reset-error="$emit('clear-error')" />

                <!-- Custom Content Slot -->
                <slot name="custom-content"></slot>

                <!-- Buttons -->
                <div class="flex justify-end space-x-4 pt-4">
                    <button type="button" @click="handleCancel"
                        class="px-6 py-2 bg-gray-300 rounded hover:bg-gray-400 transition-colors cursor-pointer">
                        Hủy
                    </button>
                    <button type="submit" :disabled="isLoading"
                        class="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer">
                        <span v-if="isLoading">{{ initialData ? 'Đang cập nhật...' : 'Đang thêm...' }}</span>
                        <span v-else>{{ submitLabel }}</span>
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>

<script setup>
import { ref, watch, reactive } from 'vue'
import LoadingErrorState from '../LoadingErrorState.vue'
import { useDragModal } from '@/composables/useDragModal'
import { X, Upload } from 'lucide-vue-next'
import AddressSelector from '@/components/common/AddressSelector.vue'

const props = defineProps({
    showModal: {
        type: Boolean,
        required: true
    },
    title: {
        type: String,
        default: 'Thêm mới'
    },
    submitLabel: {
        type: String,
        default: 'Thêm'
    },
    fields: {
        type: Array,
        required: true,
    },
    options: {
        type: Object,
        default: () => ({})
    },
    isLoading: {
        type: Boolean,
        default: false
    },
    errorMessage: {
        type: String,
        default: ''
    },
    initialData: {
        type: Object,
        default: null
    }
})

const emit = defineEmits(['submit', 'cancel', 'update:showModal', 'clear-error'])


const fileInput = ref(null)
const selectedFile = ref(null)
const imagePreview = ref('')
const fileError = ref('')

// Address field data
const addressFieldData = reactive({})

// Handle address change
const handleAddressChange = (fieldKey, addressData) => {
    addressFieldData[fieldKey] = { ...addressData }
    // Cập nhật vào formData
    formData.value[fieldKey] = addressData.address || ''
    formData.value[`${fieldKey}_district_id`] = addressData.district_id || null
    formData.value[`${fieldKey}_city_id`] = addressData.city_id || null
}

// Drag functionality để di chuyển modal
const modalRef = ref(null)
const { position, handleMouseDown } = useDragModal(props)

// khởi tạo giá trị ban đầu cho modal update
const initializeFormData = () => {
    const data = {}
    props.fields.forEach(field => {
        // Xử lý address field đặc biệt
        if (field.type === 'address') {
            // Khởi tạo addressFieldData
            addressFieldData[field.key] = {
                address: props.initialData?.[field.key] || '',
                district_id: props.initialData?.[`${field.key}_district_id`] || props.initialData?.district_id || null,
                city_id: props.initialData?.[`${field.key}_city_id`] || props.initialData?.city_id || null
            }
            data[field.key] = props.initialData?.[field.key] || ''
            data[`${field.key}_district_id`] = props.initialData?.[`${field.key}_district_id`] || props.initialData?.district_id || null
            data[`${field.key}_city_id`] = props.initialData?.[`${field.key}_city_id`] || props.initialData?.city_id || null
        }
        // Nếu có initialData (update mode), sử dụng giá trị từ đó
        else if (props.initialData && props.initialData[field.key] !== undefined) {
            data[field.key] = props.initialData[field.key]
        } else if (field.type === 'number') {
            data[field.key] = field.defaultValue !== undefined ? field.defaultValue : 0
        } else if (field.type === 'file') {
            // Không set giá trị cho file input
        } else if ((field.type === 'image' || field.type === 'file') && props.initialData && props.initialData[field.key]) {
            // Nếu là image/file field và có initialData, set imagePreview
            imagePreview.value = props.initialData[field.key]
        } else if (field.type === 'email' || field.type === 'password' || field.type === 'text') {
            data[field.key] = field.defaultValue !== undefined ? field.defaultValue : ''
        } else {
            data[field.key] = field.defaultValue !== undefined ? field.defaultValue : ''
        }
    })
    return data
}

const formData = ref(initializeFormData())

// Get options for select field
const getOptions = (optionsKey) => {
    return props.options[optionsKey] || []
}

// trình duyệt mở hộp thoại chọn file
const handleFileLabelClick = () => {
    if (fileInput.value) {
        fileError.value = '' // Xóa lỗi khi click chọn file
        fileInput.value.click()
    }
}


const handleFileChange = (event) => {
    const file = event.target.files[0]
    if (file) {
        // chỉ up hình
        const accept = props.fields.find(f => f.type === 'file')?.accept
        if (accept && accept.startsWith('image/') && file.type && !file.type.startsWith('image/')) {
            alert('Vui lòng chọn file hình ảnh!')
            if (fileInput.value) {
                fileInput.value.value = ''
            }
            return
        }
        // size hình (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('Kích thước file không được vượt quá 5MB!')
            if (fileInput.value) {
                fileInput.value.value = ''
            }
            return
        }
        selectedFile.value = file
        fileError.value = '' // Xóa lỗi khi chọn file thành công
        // coi trước khi up
        if (file.type && file.type.startsWith('image/')) {
            const reader = new FileReader()
            reader.onload = (e) => {
                imagePreview.value = e.target.result
            }
            reader.readAsDataURL(file)
        }
    }
}

// Remove selected file
const removeImage = () => {
    selectedFile.value = null
    imagePreview.value = ''
    fileError.value = ''
    if (fileInput.value) {
        fileInput.value.value = ''
    }
}

// Reset khi đóng modal hoặc khi initialData thay đổi
watch(() => props.showModal, (newVal) => {
    if (newVal) {
        // Khi mở modal, khởi tạo lại form data với initialData mới
        formData.value = initializeFormData()

        // Reset và khởi tạo addressFieldData
        Object.keys(addressFieldData).forEach(key => {
            delete addressFieldData[key]
        })
        props.fields.forEach(field => {
            if (field.type === 'address') {
                addressFieldData[field.key] = {
                    address: props.initialData?.[field.key] || '',
                    district_id: props.initialData?.district_id || null,
                    city_id: props.initialData?.city_id || null
                }
            }
        })

        if (props.initialData) {
            // Nếu có image trong initialData, set preview
            const imageField = props.fields.find(f => f.type === 'image' || f.type === 'file')
            if (imageField && props.initialData[imageField.key]) {
                imagePreview.value = props.initialData[imageField.key]
            }
        }
    } else {
        // Khi đóng modal, reset form
        formData.value = initializeFormData()
        removeImage()
        fileError.value = ''

        // Reset addressFieldData
        Object.keys(addressFieldData).forEach(key => {
            delete addressFieldData[key]
        })
    }
})

watch(() => props.initialData, () => {
    if (props.showModal) {
        formData.value = initializeFormData()
        const imageField = props.fields.find(f => f.type === 'image' || f.type === 'file')
        if (imageField && props.initialData?.[imageField.key]) {
            imagePreview.value = props.initialData[imageField.key]
        }
    }
}, { deep: true })

watch(() => props.fields, () => {
    if (!props.showModal) {
        formData.value = initializeFormData()
    }
}, { deep: true })

const handleSubmit = () => {

    fileError.value = ''

    // Kiểm tra file/image required: chỉ required nếu không có initialData (add mode) hoặc không có imagePreview (update mode nhưng chưa có ảnh)
    const fileField = props.fields.find(f => (f.type === 'file' || f.type === 'image') && f.required)
    if (fileField && !selectedFile.value) {
        // Nếu là add mode (không có initialData) hoặc update mode nhưng không có ảnh cũ
        if (!props.initialData || !imagePreview.value) {
            fileError.value = `Vui lòng chọn ${fileField.label.toLowerCase()}!`
            if (fileInput.value) {
                fileInput.value.closest('.relative')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
            }
            return
        }
    }
    const submitData = { ...formData.value }
    if (selectedFile.value) {
        submitData.imageFile = selectedFile.value
    }

    // Xử lý address fields: gộp lại thành address, district_id, city_id
    props.fields.forEach(field => {
        if (field.type === 'address') {
            const addressData = addressFieldData[field.key]
            if (addressData) {
                submitData[field.key] = addressData.address || ''
                submitData['district_id'] = addressData.district_id || null
                submitData['city_id'] = addressData.city_id || null
                // Xóa các field phụ
                delete submitData[`${field.key}_district_id`]
                delete submitData[`${field.key}_city_id`]
            }
        }
    })

    emit('submit', submitData)
}

const handleCancel = () => {
    emit('cancel')
    emit('update:showModal', false)
}
</script>
