<template>
  <Dialog :open="showModal" @update:open="handleOpenChange">
    <DialogContent
      ref="modalRef"
      class="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
    >
      <DialogHeader
        @mousedown="handleMouseDown"
      >
        <DialogTitle class="text-xl font-bold">{{ title }}</DialogTitle>
      </DialogHeader>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <template v-for="field in fields" :key="field.key">
          <!-- Text Input -->
          <div v-if="field.type === 'text'" class="space-y-2">
            <Label>
              {{ field.label }}
              <span v-if="field.required" class="text-red-600 text-sm"> *</span>
            </Label>
            <Input
              v-model="formData[field.key]"
              type="text"
              :required="field.required"
              :placeholder="field.placeholder || `Nhập ${field.label.toLowerCase()}`"
            />
          </div>

          <!-- Email Input -->
          <div v-else-if="field.type === 'email'" class="space-y-2">
            <Label>
              {{ field.label }}<span v-if="field.required" class="text-red-600 text-sm"> *</span>
            </Label>
            <Input
              v-model="formData[field.key]"
              type="email"
              :required="field.required"
              :placeholder="field.placeholder || `Nhập ${field.label.toLowerCase()}`"
            />
            <p class="text-xs text-muted-foreground">(ví dụ: example@email.com)</p>
          </div>

          <!-- Password Input -->
          <div v-else-if="field.type === 'password'" class="space-y-2">
            <Label>
              {{ field.label }}<span v-if="field.required" class="text-red-600 text-sm"> *</span>
            </Label>
            <Input
              v-model="formData[field.key]"
              type="password"
              :required="field.required"
              :minlength="field.minLength"
              :placeholder="field.placeholder || `Nhập ${field.label.toLowerCase()}`"
            />
            <p v-if="field.minLength" class="text-xs text-muted-foreground">
              Mật khẩu tối thiểu {{ field.minLength }} ký tự
            </p>
          </div>

          <!-- Number Input -->
          <div v-else-if="field.type === 'number'" class="space-y-2">
            <Label>
              {{ field.label }}<span v-if="field.required" class="text-red-600 text-sm"> *</span>
            </Label>
            <Input
              v-model.number="formData[field.key]"
              type="number"
              :required="field.required"
              :placeholder="field.placeholder || `Nhập ${field.label.toLowerCase()}`"
            />
          </div>

          <!-- Select Dropdown -->
          <div v-else-if="field.type === 'select'" class="space-y-2">
            <Label>
              {{ field.label }}<span v-if="field.required" class="text-red-600 text-sm"> *</span>
            </Label>
            <Select v-model="formData[field.key]" :required="field.required">
              <SelectTrigger>
                <SelectValue :placeholder="field.placeholder || `Chọn ${field.label.toLowerCase()}`" />
              </SelectTrigger>
              <SelectContent>
      <SelectItem
        v-for="(option, idx) in getOptions(field.optionsKey)"
        :key="idx"
        :value="String((option as Record<string, unknown>)[field.optionValue || 'value'] || '')"
      >
        {{ String((option as Record<string, unknown>)[field.optionLabel || 'label'] || '') }}
      </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <!-- Textarea -->
          <div v-else-if="field.type === 'textarea'" class="space-y-2">
            <Label>
              {{ field.label }}<span v-if="field.required" class="text-red-600 text-sm"> *</span>
            </Label>
            <Textarea
              v-model="formData[field.key]"
              :rows="field.rows || 4"
              :placeholder="field.placeholder || `Nhập ${field.label.toLowerCase()}`"
            />
          </div>

          <!-- File Upload -->
          <div v-else-if="field.type === 'file'" class="space-y-2">
            <Label>
              {{ field.label }}<span v-if="field.required" class="text-red-600 text-sm"> *</span>
            </Label>
            <div class="relative">
              <input
                :ref="(el) => (fileInput = el)"
                type="file"
                :accept="field.accept"
                @change="handleFileChange"
                class="hidden"
              />
              <Button
                type="button"
                variant="outline"
                @click.prevent="handleFileLabelClick"
                :class="[
                  'w-full justify-between',
                  fileError && field.required
                    ? 'border-red-500 bg-red-50'
                    : '',
                ]"
              >
                <span :class="fileError && field.required ? 'text-red-700' : ''">
                  {{ selectedFile ? selectedFile.name : "Chọn file" }}
                </span>
                <Upload class="h-5 w-5 text-muted-foreground" />
              </Button>
            </div>
            <!-- Error message for file -->
            <p v-if="fileError && field.required" class="text-sm text-destructive">
              {{ fileError }}
            </p>
            <!-- Image Preview -->
            <div v-if="imagePreview" class="mt-4">
              <img
                :src="imagePreview"
                alt="Preview"
                class="max-w-full h-48 object-contain rounded border"
              />
              <Button
                type="button"
                variant="ghost"
                @click="removeImage"
                class="mt-2 text-sm text-destructive hover:text-destructive"
              >
                Xóa ảnh
              </Button>
            </div>
          </div>

          <!-- Image Display (for update mode) -->
          <div v-else-if="field.type === 'image'" class="space-y-2">
            <Label>
              {{ field.label }}<span v-if="field.required" class="text-red-600 text-sm"> *</span>
            </Label>
            <div class="relative">
              <input
                :ref="(el) => (fileInput = el)"
                type="file"
                accept="image/*"
                @change="handleFileChange"
                class="hidden"
              />
              <Button
                type="button"
                variant="outline"
                @click.prevent="handleFileLabelClick"
                :class="[
                  'w-full justify-between',
                  fileError && field.required
                    ? 'border-red-500 bg-red-50'
                    : '',
                ]"
              >
                <span :class="fileError && field.required ? 'text-red-700' : ''">
                  {{
                    selectedFile
                      ? selectedFile.name
                      : initialData?.[field.key]
                        ? "Upload File"
                        : "Chọn ảnh mới"
                  }}
                </span>
                <Upload class="h-5 w-5 text-muted-foreground" />
              </Button>
            </div>
            <!-- Error message for file -->
            <p v-if="fileError && field.required" class="text-sm text-destructive">
              {{ fileError }}
            </p>
            <!-- Image Preview -->
            <div v-if="imagePreview" class="mt-4">
              <img
                :src="imagePreview"
                alt="Preview"
                class="max-w-full h-48 object-contain rounded border"
              />
              <Button
                type="button"
                variant="ghost"
                @click="removeImage"
                class="mt-2 text-sm text-destructive hover:text-destructive"
              >
                Xóa ảnh
              </Button>
            </div>
          </div>

          <!-- Address Selector -->
          <div v-else-if="field.type === 'address'">
            <AddressSelector
              :model-value="addressFieldData[field.key] || {}"
              mode="user"
              :required="field.required"
              focus-ring-class="focus:ring-blue-500"
              @update:model-value="handleAddressChange(field.key, $event)"
              @change="handleAddressChange(field.key, $event)"
            />
          </div>
        </template>

        <!-- Error Message -->
        <LoadingErrorState
          :isLoading="false"
          :errorMessage="errorMessage"
          @reset-error="$emit('clear-error')"
        />

        <!-- Custom Content Slot -->
        <slot name="custom-content"></slot>

        <!-- Buttons -->
        <DialogFooter class="pt-4">
          <Button type="button" variant="outline" @click="handleCancel">
            Hủy
          </Button>
          <Button type="submit" :disabled="isLoading">
            <span v-if="isLoading">{{ initialData ? "Đang cập nhật..." : "Đang thêm..." }}</span>
            <span v-else>{{ submitLabel }}</span>
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, watch, reactive, type Ref } from "vue"
import LoadingErrorState from "../LoadingErrorState.vue"
import { useDragModal } from "@/composables/useDragModal"
import { X, Upload } from "lucide-vue-next"
import AddressSelector from "@/components/common/AddressSelector.vue"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

const props = withDefaults(defineProps<{
  showModal: boolean
  title?: string
  submitLabel?: string
  fields: Array<{
    key: string
    type: string
    label: string
    required?: boolean
    placeholder?: string
    minLength?: number
    rows?: number
    accept?: string
    optionsKey?: string
    optionValue?: string
    optionLabel?: string
    defaultValue?: unknown
  }>
  options?: Record<string, unknown[]>
  isLoading?: boolean
  errorMessage?: string
  initialData?: Record<string, unknown> | null
}>(), {
  title: "Thêm mới",
  submitLabel: "Thêm",
  options: () => ({}),
  isLoading: false,
  errorMessage: "",
  initialData: null,
})

const emit = defineEmits<{
  submit: [data: Record<string, unknown>]
  cancel: []
  "update:showModal": [value: boolean]
  "clear-error": []
}>()

const fileInput: Ref<HTMLInputElement | null> = ref(null)
const selectedFile: Ref<File | null> = ref(null)
const imagePreview: Ref<string> = ref("")
const fileError: Ref<string> = ref("")

// Address field data
const addressFieldData = reactive<Record<string, { address?: string; district_id?: number | null; city_id?: number | null }>>({})

// Handle address change
const handleAddressChange = (fieldKey: string, addressData: { address?: string; district_id?: number | null; city_id?: number | null }): void => {
  addressFieldData[fieldKey] = { ...addressData }
  // Cập nhật vào formData
  formData.value[fieldKey] = addressData.address || ""
  formData.value[`${fieldKey}_district_id`] = addressData.district_id || null
  formData.value[`${fieldKey}_city_id`] = addressData.city_id || null
}

// Drag functionality để di chuyển modal
const modalRef: Ref<HTMLElement | null> = ref(null)
const { position, handleMouseDown } = useDragModal(props)

// khởi tạo giá trị ban đầu cho modal update
const initializeFormData = (): Record<string, unknown> => {
  const data: Record<string, unknown> = {}
  props.fields.forEach((field) => {
    // Xử lý address field đặc biệt
    if (field.type === "address") {
      // Khởi tạo addressFieldData
      addressFieldData[field.key] = {
        address: props.initialData?.[field.key] || "",
        district_id:
          props.initialData?.[`${field.key}_district_id`] ||
          props.initialData?.district_id ||
          null,
        city_id:
          props.initialData?.[`${field.key}_city_id`] || props.initialData?.city_id || null,
      }
      data[field.key] = props.initialData?.[field.key] || ""
      data[`${field.key}_district_id`] =
        props.initialData?.[`${field.key}_district_id`] || props.initialData?.district_id || null
      data[`${field.key}_city_id`] =
        props.initialData?.[`${field.key}_city_id`] || props.initialData?.city_id || null
    }
    // Nếu có initialData (update mode), sử dụng giá trị từ đó
    else if (props.initialData && props.initialData[field.key] !== undefined) {
      data[field.key] = props.initialData[field.key]
    } else if (field.type === "number") {
      data[field.key] = field.defaultValue !== undefined ? field.defaultValue : 0
    } else if (field.type === "file") {
      // Không set giá trị cho file input
    } else if (
      (field.type === "image" || field.type === "file") &&
      props.initialData &&
      props.initialData[field.key]
    ) {
      // Nếu là image/file field và có initialData, set imagePreview
      imagePreview.value = props.initialData[field.key]
    } else if (field.type === "email" || field.type === "password" || field.type === "text") {
      data[field.key] = field.defaultValue !== undefined ? field.defaultValue : ""
    } else {
      data[field.key] = field.defaultValue !== undefined ? field.defaultValue : ""
    }
  })
  return data
}

const formData: Ref<Record<string, unknown>> = ref(initializeFormData())

const handleOpenChange = (open: boolean): void => {
  if (!open) {
    handleCancel()
  }
}

// Get options for select field
const getOptions = (optionsKey?: string): unknown[] => {
  if (!optionsKey) return []
  return props.options[optionsKey] || []
}

// trình duyệt mở hộp thoại chọn file
const handleFileLabelClick = (): void => {
  if (fileInput.value) {
    fileError.value = "" // Xóa lỗi khi click chọn file
    fileInput.value.click()
  }
}

const handleFileChange = (event: Event): void => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    // chỉ up hình
    const fileField = props.fields.find((f) => f.type === "file")
    const accept = fileField?.accept
    if (accept && accept.startsWith("image/") && file.type && !file.type.startsWith("image/")) {
      alert("Vui lòng chọn file hình ảnh!")
      if (fileInput.value) {
        fileInput.value.value = ""
      }
      return
    }
    // size hình (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Kích thước file không được vượt quá 5MB!")
      if (fileInput.value) {
        fileInput.value.value = ""
      }
      return
    }
    selectedFile.value = file
    fileError.value = "" // Xóa lỗi khi chọn file thành công
    // coi trước khi up
    if (file.type && file.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = (e) => {
        imagePreview.value = e.target?.result as string
      }
      reader.readAsDataURL(file)
    }
  }
}

// Remove selected file
const removeImage = (): void => {
  selectedFile.value = null
  imagePreview.value = ""
  fileError.value = ""
  if (fileInput.value) {
    fileInput.value.value = ""
  }
}

// Reset khi đóng modal hoặc khi initialData thay đổi
watch(
  () => props.showModal,
  (newVal: boolean) => {
    if (newVal) {
      // Khi mở modal, khởi tạo lại form data với initialData mới
      formData.value = initializeFormData()

      // Reset và khởi tạo addressFieldData
      Object.keys(addressFieldData).forEach((key) => {
        delete addressFieldData[key]
      })
      props.fields.forEach((field) => {
        if (field.type === "address") {
          addressFieldData[field.key] = {
            address: props.initialData?.[field.key] || "",
            district_id: props.initialData?.district_id || null,
            city_id: props.initialData?.city_id || null,
          }
        }
      })

      if (props.initialData) {
        // Nếu có image trong initialData, set preview
        const imageField = props.fields.find((f) => f.type === "image" || f.type === "file")
        if (imageField && props.initialData[imageField.key]) {
          imagePreview.value = props.initialData[imageField.key]
        }
      }
    } else {
      // Khi đóng modal, reset form
      formData.value = initializeFormData()
      removeImage()
      fileError.value = ""

      // Reset addressFieldData
      Object.keys(addressFieldData).forEach((key) => {
        delete addressFieldData[key]
      })
    }
  }
)

watch(
  () => props.initialData,
  () => {
    if (props.showModal) {
      formData.value = initializeFormData()
      const imageField = props.fields.find((f) => f.type === "image" || f.type === "file")
      if (imageField && props.initialData?.[imageField.key]) {
        imagePreview.value = props.initialData[imageField.key]
      }
    }
  },
  { deep: true }
)

watch(
  () => props.fields,
  () => {
    if (!props.showModal) {
      formData.value = initializeFormData()
    }
  },
  { deep: true }
)

const handleSubmit = (): void => {
  fileError.value = ""

  // Kiểm tra file/image required: chỉ required nếu không có initialData (add mode) hoặc không có imagePreview (update mode nhưng chưa có ảnh)
  const fileField = props.fields.find(
    (f) => (f.type === "file" || f.type === "image") && f.required
  )
  if (fileField && !selectedFile.value) {
    // Nếu là add mode (không có initialData) hoặc update mode nhưng không có ảnh cũ
    if (!props.initialData || !imagePreview.value) {
      fileError.value = `Vui lòng chọn ${fileField.label.toLowerCase()}!`
      if (fileInput.value) {
        fileInput.value
          .closest(".relative")
          ?.scrollIntoView({ behavior: "smooth", block: "center" })
      }
      return
    }
  }
  const submitData: Record<string, unknown> = { ...formData.value }
  if (selectedFile.value) {
    submitData.imageFile = selectedFile.value
  }

  // Xử lý address fields: gộp lại thành address, district_id, city_id
  props.fields.forEach((field) => {
    if (field.type === "address") {
      const addressData = addressFieldData[field.key] as { address?: string; district_id?: number | null; city_id?: number | null } | undefined
      if (addressData) {
        submitData[field.key] = addressData.address || ""
        submitData["district_id"] = addressData.district_id || null
        submitData["city_id"] = addressData.city_id || null
        // Xóa các field phụ
        delete submitData[`${field.key}_district_id`]
        delete submitData[`${field.key}_city_id`]
      }
    }
  })

  emit("submit", submitData)
}

const handleCancel = (): void => {
  emit("cancel")
  emit("update:showModal", false)
}
</script>
