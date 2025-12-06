<template>
  <div class="space-y-4">
    <!-- Thành phố (Dropdown) -->
    <div>
      <div class="flex gap-2 items-center flex-wrap mb-2">
        <Label :for="`city-${_uid}`">
          Tỉnh/Thành phố <span v-if="required" class="text-destructive">*</span>
        </Label>
        <p v-if="showShippingNotice" class="text-sm font-normal text-destructive">
          Hiện tại cửa hàng chỉ hỗ trợ ship trong khu vực thành phố Hồ Chí Minh và tỉnh Bà Rịa -
          Vũng Tàu để đảm bảo chất lượng sản phẩm đến tay khách hàng.
        </p>
      </div>

      <Select
        :id="`city-${_uid}`"
        :model-value="String(cityId || '')"
        :required="required"
        @update:model-value="handleCityChange"
      >
        <SelectTrigger>
          <SelectValue placeholder="Chọn thành phố" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">Chọn thành phố</SelectItem>
          <SelectItem v-for="city in cities" :key="city.id" :value="String(city.id)">
            {{ city.name }}
          </SelectItem>
        </SelectContent>
      </Select>
    </div>

    <!-- Quận/Huyện (Dropdown) -->
    <div>
      <Label :for="`district-${_uid}`">
        Quận/Huyện <span v-if="required" class="text-destructive">*</span>
      </Label>
      <Select
        :id="`district-${_uid}`"
        :model-value="String(selectedDistrictId || '')"
        :required="required"
        :disabled="!cityId"
        @update:model-value="handleDistrictChange"
      >
        <SelectTrigger :disabled="!cityId">
          <SelectValue placeholder="Chọn quận/huyện" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">Chọn quận/huyện</SelectItem>
          <SelectItem v-for="district in districts" :key="district.id" :value="String(district.id)">
            {{ district.name }}
          </SelectItem>
        </SelectContent>
      </Select>
      <p v-if="errorMessage" class="mt-1 text-xs text-destructive">{{ errorMessage }}</p>
    </div>

    <!-- Địa chỉ chi tiết (Input) -->
    <div>
      <Label :for="`address-detail-${_uid}`">
        Địa chỉ chi tiết <span v-if="required" class="text-destructive">*</span>
        <span class="text-sm font-normal text-muted-foreground"
          >(Số nhà, tên đường, phường/xã)</span
        >
      </Label>
      <Textarea
        :id="`address-detail-${_uid}`"
        v-model="addressDetail"
        :required="required"
        rows="3"
        :placeholder="addressPlaceholder || 'Ví dụ: 123 Đường ABC, Phường XYZ'"
        @input="handleAddressChange"
      />
    </div>

    <!-- Địa chỉ hoàn chỉnh (Preview, chỉ hiển thị khi mode là shipping) -->
    <Card v-if="mode === 'shipping' && fullAddress" class="p-3">
      <CardContent class="p-0">
        <p class="text-sm text-muted-foreground mb-1">Địa chỉ giao hàng:</p>
        <p class="text-sm font-semibold">{{ fullAddress }}</p>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue"
import {
  CITIES,
  getCityById,
  getDistrictsByCityId,
  getDistrictById,
} from "@/constants/locations"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"

const props = withDefaults(defineProps<{
  modelValue?: {
    address?: string
    district_id?: number | null
    city_id?: number | null
  }
  mode?: "user" | "shipping"
  required?: boolean
  showShippingNotice?: boolean
  addressPlaceholder?: string
  focusRingClass?: string
  errorMessage?: string
}>(), {
  modelValue: () => ({}),
  mode: "user",
  required: false,
  showShippingNotice: false,
  addressPlaceholder: "",
  focusRingClass: "focus:ring-blue-500",
  errorMessage: "",
})

const emit = defineEmits<{
  "update:modelValue": [value: { address?: string; district_id?: number | null; city_id?: number | null }]
  change: [value: { address?: string; district_id?: number | null; city_id?: number | null }]
}>()

const cityId = ref<number | null>(props.modelValue?.city_id || null)
const selectedDistrictId = ref<number | null>(props.modelValue?.district_id || null)
const addressDetail = ref<string>(props.modelValue?.address || "")

const cities = CITIES
const districts = computed(() => {
  if (!cityId.value) return []
  return getDistrictsByCityId(cityId.value)
})

const fullAddress = computed(() => {
  if (!addressDetail.value && !selectedDistrictId.value) return ""

  const parts: string[] = []
  if (addressDetail.value) {
    parts.push(addressDetail.value.trim())
  }

  if (selectedDistrictId.value) {
    const district = getDistrictById(selectedDistrictId.value)
    if (district) {
      parts.push(district.name)
    }
  }

  if (cityId.value) {
    const city = getCityById(cityId.value)
    if (city) {
      parts.push(city.name)
    }
  }

  return parts.filter((p) => p).join(", ")
})

const handleCityChange = (value: string): void => {
  cityId.value = value ? Number(value) : null
  selectedDistrictId.value = null
  emitAddressChange()
}

const handleDistrictChange = (value: string): void => {
  selectedDistrictId.value = value ? Number(value) : null
  emitAddressChange()
}

const handleAddressChange = (): void => {
  emitAddressChange()
}

const emitAddressChange = (): void => {
  const addressData: { address?: string; district_id?: number | null; city_id?: number | null } = {
    address: addressDetail.value || "",
    district_id: selectedDistrictId.value,
    city_id: cityId.value,
  }
  emit("update:modelValue", addressData)
  emit("change", addressData)
}

// Watch for external changes
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue) {
      cityId.value = newValue.city_id || null
      selectedDistrictId.value = newValue.district_id || null
      addressDetail.value = newValue.address || ""
    }
  },
  { deep: true }
)

onMounted(() => {
  if (props.modelValue) {
    cityId.value = props.modelValue.city_id || null
    selectedDistrictId.value = props.modelValue.district_id || null
    addressDetail.value = props.modelValue.address || ""
  }
})
</script>
