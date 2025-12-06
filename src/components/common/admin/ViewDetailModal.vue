<template>
  <Dialog :open="showModal" @update:open="handleOpenChange">
    <DialogContent
      ref="modalRef"
      class="max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
      :style="{ transform: `translate(${position.x}px, ${position.y}px)` }"
    >
      <DialogHeader @mousedown="handleMouseDown">
        <DialogTitle class="text-2xl font-bold">{{ title }}</DialogTitle>
      </DialogHeader>

      <div class="p-6">
        <div v-if="item">
          <!-- Layout 2 cột: Ảnh bên trái, thông tin bên phải -->
          <div class="flex flex-col md:flex-row gap-6">
            <!-- Cột trái: Hình ảnh -->
            <div v-if="imageField" class="md:w-1/3 shrink-0">
              <div>
                <img
                  :src="getImageUrl(item[imageField.key])"
                  :alt="imageField.label"
                  class="w-full h-auto rounded-lg shadow-md object-contain border"
                  @error="handleImageError"
                />
              </div>
            </div>

            <!-- Cột phải: Thông tin chi tiết -->
            <div class="flex-1 space-y-4">
              <div
                v-for="field in textFields"
                :key="field.key"
                class="border-b pb-3 last:border-b-0"
              >
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
        <div v-else class="text-center text-muted-foreground py-8">
          Không có dữ liệu để hiển thị
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" @click="handleClose">Đóng</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, type Ref } from "vue"
import { useDragModal } from "@/composables/useDragModal"
import { X } from "lucide-vue-next"
import { getCityById, getDistrictById } from "@/constants/locations"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

const props = withDefaults(
  defineProps<{
    showModal?: boolean
    title?: string
    item?: Record<string, unknown> | null
    fields: Array<{
      key: string
      type: string
      label: string
      optionsKey?: string
      optionValue?: string
      optionLabel?: string
    }>
    options?: Record<string, unknown[]>
  }>(),
  {
    showModal: false,
    title: "Chi tiết",
    item: null,
    options: () => ({}),
  }
)

const emit = defineEmits<{
  close: []
  "update:showModal": [value: boolean]
}>()

// Drag functionality
const modalRef: Ref<HTMLElement | null> = ref(null)
const dragModalProps = {
  get showModal() {
    return props.showModal || false
  },
}
const { position, handleMouseDown } = useDragModal(dragModalProps)

const handleOpenChange = (open: boolean): void => {
  if (!open) {
    handleClose()
  }
}

// Không cần location store nữa, sử dụng dữ liệu cố định từ constants

const displayFields = computed(() => {
  return props.fields.filter((field) => {
    if (field.type === "password" || field.type === "file") {
      return false
    }
    return true
  })
})

const imageField = computed(() => {
  return displayFields.value.find((field) => field.type === "image" && props.item?.[field.key])
})

const textFields = computed(() => {
  return displayFields.value.filter((field) => {
    if (field.type === "image") {
      return false
    }
    return true
  })
})

const handleClose = (): void => {
  emit("close")
  emit("update:showModal", false)
}

const formatValue = (
  value: unknown,
  field: {
    key: string
    type: string
    label: string
    optionsKey?: string
    optionValue?: string
    optionLabel?: string
  }
): string => {
  if (value === null || value === undefined || value === "") {
    return "Không có dữ liệu"
  }

  // Format price
  if (field.type === "price" || field.format === "price") {
    // Xử lý các trường hợp null, undefined, hoặc không phải số
    let numValue = 0
    if (typeof value === "string") {
      const cleaned = value.replace(/[^\d.]/g, "")
      numValue = parseFloat(cleaned) || 0
    } else if (typeof value === "number") {
      numValue = isNaN(value) ? 0 : value
    } else {
      numValue = 0
    }

    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(numValue)
  }

  // Format select options
  if (field.type === "select" && field.optionsKey && props.options[field.optionsKey]) {
    const option = props.options[field.optionsKey].find(
      (opt) => opt[field.optionValue || "value"] === value
    )
    return option ? option[field.optionLabel || "label"] : String(value)
  }

  // Format discount value (nếu có type từ item)
  if (field.key === "value" && props.item?.type) {
    const numValue = Number(value)
    if (props.item.type === "PERCENT") {
      return `${numValue}%`
    } else if (props.item.type === "CASH") {
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(numValue)
    }
  }

  // Format boolean
  if (typeof value === "boolean") {
    return value ? "Có" : "Không"
  }

  return String(value)
}

// Format địa chỉ hoàn chỉnh (ghép address + district + city)
const formatAddress = (
  item: Record<string, unknown>,
  field: { key: string; type: string; label: string }
): string => {
  if (!item) return "Không có dữ liệu"

  const address = item.address || item[field.key] || ""
  const districtId = item.district_id
  const cityId = item.city_id || 1

  // Nếu địa chỉ rỗng và không có district_id
  if (!address && !districtId) {
    return "Không có dữ liệu"
  }

  // Nếu địa chỉ đã là địa chỉ hoàn chỉnh, hiển thị trực tiếp
  if (
    address &&
    (address.includes("Hồ Chí Minh") || address.includes("Bà Rịa") || address.includes("Vũng Tàu"))
  ) {
    return address
  }

  // Nếu có district_id, tìm tên quận và thành phố để ghép lại thành địa chỉ hoàn chỉnh
  if (districtId) {
    const district = getDistrictById(districtId)
    const districtName = district ? district.name : ""
    const city = getCityById(cityId)
    const cityName = city ? city.name : ""

    if (districtName && cityName) {
      // Ghép địa chỉ hoàn chỉnh: "Địa chỉ, Quận, Thành phố"
      const parts: string[] = []
      if (address && address.trim()) {
        parts.push(address.trim())
      }
      parts.push(districtName)
      parts.push(cityName)

      return parts.filter((p) => p).join(", ")
    }
  }

  // Nếu không tìm được quận hoặc không có district_id, chỉ hiển thị địa chỉ hiện có
  return address || "Không có dữ liệu"
}

const getImageUrl = (url: string | undefined): string => {
  if (!url) return "/img/footer.png"
  if (url.includes("cloudinary")) {
    return url
  }
  return url
}

const handleImageError = (event: Event): void => {
  const target = event.target as HTMLImageElement
  if (!target.src.includes("footer.png")) {
    target.src = "/img/footer.png"
  }
}
</script>
