<template>
  <div class="space-y-4">
    <!-- Thành phố (Dropdown) -->
    <div>
      <div class="flex gap-2 items-center flex-wrap mb-2">
        <label :for="`city-${_uid}`" class="block text-gray-700 font-semibold">
          Tỉnh/Thành phố <span v-if="required" class="text-red-500">*</span>
        </label>
        <p v-if="showShippingNotice" class="text-sm font-normal text-red-500">
          Hiện tại cửa hàng chỉ hỗ trợ ship trong khu vực thành phố Hồ Chí Minh và tỉnh Bà Rịa -
          Vũng Tàu để đảm bảo chất lượng sản phẩm đến tay khách hàng.
        </p>
      </div>

      <select
        :id="`city-${_uid}`"
        v-model="cityId"
        :required="required"
        @change="handleCityChange"
        :class="[
          'w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2',
          focusRingClass,
        ]"
      >
        <option :value="null">Chọn thành phố</option>
        <option v-for="city in cities" :key="city.id" :value="city.id">
          {{ city.name }}
        </option>
      </select>
    </div>

    <!-- Quận/Huyện (Dropdown) -->
    <div>
      <label :for="`district-${_uid}`" class="block text-gray-700 font-semibold mb-2">
        Quận/Huyện <span v-if="required" class="text-red-500">*</span>
      </label>
      <select
        :id="`district-${_uid}`"
        v-model="selectedDistrictId"
        :required="required"
        :disabled="!cityId"
        @change="handleDistrictChange"
        :class="[
          'w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2',
          focusRingClass,
          !cityId ? 'bg-gray-100 cursor-not-allowed' : '',
        ]"
      >
        <option :value="null">Chọn quận/huyện</option>
        <option v-for="district in districts" :key="district.id" :value="district.id">
          {{ district.name }}
        </option>
      </select>
      <p v-if="errorMessage" class="mt-1 text-xs text-red-600">{{ errorMessage }}</p>
    </div>

    <!-- Địa chỉ chi tiết (Input) -->
    <div>
      <label :for="`address-detail-${_uid}`" class="block text-gray-700 font-semibold mb-2">
        Địa chỉ chi tiết <span v-if="required" class="text-red-500">*</span>
        <span class="text-sm font-normal text-gray-500">(Số nhà, tên đường, phường/xã)</span>
      </label>
      <textarea
        :id="`address-detail-${_uid}`"
        v-model="addressDetail"
        :required="required"
        rows="3"
        :placeholder="addressPlaceholder || 'Ví dụ: 123 Đường ABC, Phường XYZ'"
        @input="handleAddressChange"
        :class="[
          'w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2',
          focusRingClass,
        ]"
      ></textarea>
    </div>

    <!-- Địa chỉ hoàn chỉnh (Preview, chỉ hiển thị khi mode là shipping) -->
    <div
      v-if="mode === 'shipping' && fullAddress"
      class="p-3 bg-gray-50 rounded-lg border border-gray-200"
    >
      <p class="text-sm text-gray-600 mb-1">Địa chỉ giao hàng:</p>
      <p class="text-sm font-semibold text-gray-800">{{ fullAddress }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue"
import {
  CITIES,
  DISTRICTS_BY_CITY,
  getCityById,
  getDistrictsByCityId,
  getDistrictById,
} from "@/constants/locations"

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({
      address: "",
      district_id: null,
      city_id: null,
      fullAddress: "",
    }),
  },
  mode: {
    type: String,
    default: "user", // 'user' hoặc 'shipping'
    validator: (value) => ["user", "shipping"].includes(value),
  },
  required: {
    type: Boolean,
    default: false,
  },
  inputClass: {
    type: String,
    default: "",
  },
  focusRingClass: {
    type: String,
    default: "focus:ring-green-500",
  },
  addressPlaceholder: {
    type: String,
    default: "",
  },
  showShippingNotice: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(["update:modelValue", "change"])

// State
const cityId = ref(null)
const selectedDistrictId = ref(null)
const addressDetail = ref("")
const errorMessage = ref("")

// Computed để lấy danh sách thành phố (từ constants)
const cities = computed(() => CITIES)

// Computed để lấy danh sách quận/huyện theo thành phố đã chọn
const districts = computed(() => {
  if (!cityId.value) return []
  return getDistrictsByCityId(cityId.value)
})

// Computed để lấy tên thành phố hiện tại
const cityName = computed(() => {
  if (!cityId.value) return ""
  const city = getCityById(cityId.value)
  return city ? city.name : ""
})

// Computed
const fullAddress = computed(() => {
  if (!addressDetail.value || !selectedDistrictId.value || !cityId.value) return ""

  const selectedDistrict = getDistrictById(selectedDistrictId.value)
  const districtName = selectedDistrict ? selectedDistrict.name : ""

  if (!districtName || !cityName.value) return ""

  return `${addressDetail.value.trim()}, ${districtName}, ${cityName.value}`.trim()
})

// Không cần load cities/districts nữa vì dùng dữ liệu cố định
// Chỉ cần reset districts khi đổi thành phố
const loadDistricts = (cityIdParam) => {
  if (!cityIdParam) {
    // Reset districts khi không có thành phố
    selectedDistrictId.value = null
    return
  }

  // Reset district selection khi load quận/huyện mới
  selectedDistrictId.value = null
}

// Xử lý khi thay đổi thành phố
const handleCityChange = () => {
  // Reset district về "Chọn quận/huyện" khi đổi thành phố
  selectedDistrictId.value = null

  // Emit thay đổi
  emitChange()
}

// Xử lý khi thay đổi quận
const handleDistrictChange = () => {
  emitChange()
}

// Xử lý khi thay đổi địa chỉ chi tiết
const handleAddressChange = () => {
  emitChange()
}

// Emit thay đổi
const emitChange = () => {
  const selectedDistrict = getDistrictById(selectedDistrictId.value)

  if (props.mode === "shipping") {
    // Mode shipping: emit fullAddress
    const newValue = {
      fullAddress: fullAddress.value,
      address: addressDetail.value,
      district_id: selectedDistrictId.value,
      city_id: cityId.value,
      district_name: selectedDistrict ? selectedDistrict.name : null,
    }
    emit("update:modelValue", newValue)
    emit("change", newValue)
  } else {
    // Mode user: emit address, district_id, city_id riêng lẻ
    const newValue = {
      address: addressDetail.value,
      district_id: selectedDistrictId.value,
      city_id: cityId.value,
    }
    emit("update:modelValue", newValue)
    emit("change", newValue)
  }
}

// Watch modelValue để đồng bộ từ bên ngoài
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue) {
      // Đồng bộ city_id
      if (newValue.city_id && newValue.city_id !== cityId.value) {
        cityId.value = newValue.city_id
      }

      // Parse địa chỉ nếu là fullAddress (mode shipping)
      if (props.mode === "shipping" && newValue.fullAddress) {
        // Có thể cần parse fullAddress để tách thành address detail và district
        // Tạm thời giữ nguyên, user sẽ tự nhập lại
        addressDetail.value = newValue.address || ""
        selectedDistrictId.value = newValue.district_id || null
      } else {
        addressDetail.value = newValue.address || ""
        selectedDistrictId.value = newValue.district_id || null
      }
    }
  },
  { deep: true, immediate: true }
)

// Khởi tạo
onMounted(() => {
  // Không cần load cities/districts nữa vì dùng dữ liệu cố định

  // Nếu đã có city_id trong modelValue, sử dụng nó
  if (props.modelValue?.city_id) {
    cityId.value = props.modelValue.city_id
    // Set district_id nếu có
    if (props.modelValue.district_id) {
      const exists = districts.value.some((d) => d.id === props.modelValue.district_id)
      if (exists) {
        selectedDistrictId.value = props.modelValue.district_id
      }
    }
  }

  // Đồng bộ địa chỉ chi tiết
  if (props.modelValue?.address) {
    addressDetail.value = props.modelValue.address
  }

  // Mặc định: cityId và selectedDistrictId là null để hiển thị placeholder
})
</script>
