<template>
  <div>
    <!-- Optional built-in controls: Category filter + Sort -->
    <div v-if="showFilter" :class="['flex flex-col sm:flex-row gap-4 mb-2', controlsClass]">
      <div v-if="showCategoryFilter" class="sm:w-48">
        <select
          v-model="selectedCategoryProxy"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent"
        >
          <option value="">Tất cả danh mục</option>
          <option
            v-for="category in categoryOptions"
            :key="category[categoryIdKey]"
            :value="category[categoryIdKey]"
          >
            {{ category[categoryLabelKey] }}
          </option>
        </select>
      </div>

      <div v-if="showSortOption" class="sm:w-48">
        <select
          v-model="sortOptionProxy"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent"
        >
          <option value="">Sắp xếp mặc định</option>
          <option value="price-asc">Giá: Tăng dần</option>
          <option value="price-desc">Giá: Giảm dần</option>
          <option value="name-asc">Tên: A-Z</option>
          <option value="name-desc">Tên: Z-A</option>
        </select>
      </div>

      <div v-if="showActive" class="sm:w-48">
        <select
          v-model="selectedActiveProxy"
          :class="[
            'w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:border-transparent',
            selectedActiveProxy === 'deactive'
              ? 'text-red-500 focus:ring-red-500'
              : selectedActiveProxy === 'out_of_stock'
                ? 'text-yellow-500 focus:ring-yellow-500'
                : 'text-green-500 focus:ring-green-500',
          ]"
        >
          <template v-if="useProductLabels">
            <option value="" class="text-green-500">Đang bán</option>
            <option value="out_of_stock" class="text-yellow-500">Tạm hết hàng</option>
            <option value="deactive" class="text-red-500">Ngưng kinh doanh</option>
          </template>
          <template v-else>
            <option value="" class="text-green-500">đang hoạt động</option>
            <option value="deactive" class="text-red-500">không hoạt động</option>
          </template>
        </select>
      </div>

      <div v-if="showShippingStatusFilter" class="sm:w-48">
        <select
          v-model="selectedShippingStatusProxy"
          class="w-50 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent"
        >
          <option value="">Trạng thái giao hàng</option>
          <option
            v-for="shipping_status in shippingStatusOption"
            :key="shipping_status[shippingstatusValueKey]"
            :value="shipping_status[shippingstatusValueKey]"
          >
            {{ shipping_status[statusLabelKey] }}
          </option>
        </select>
      </div>
      <div v-if="showStatusFilter" class="sm:w-48">
        <select
          v-model="selectedStatusProxy"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent"
        >
          <option value="">Tất cả trạng thái</option>
          <option
            v-for="status in statusOptions"
            :key="status[statusValueKey]"
            :value="status[statusValueKey]"
          >
            {{ status[statusLabelKey] }}
          </option>
        </select>
      </div>

      <div v-if="showDeletedFilter" class="sm:w-48">
        <select
          v-model="selectedDeletedProxy"
          :class="[
            'w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:border-transparent',
            selectedDeletedProxy === 'deleted'
              ? 'text-red-500 focus:ring-red-500'
              : 'text-green-500 focus:ring-green-500',
          ]"
        >
          <option value="" class="text-green-500">Đánh giá hiện</option>
          <option value="deleted" class="text-red-500">Đánh giá ẩn</option>
        </select>
      </div>
    </div>
    <!-- Slot nhận danh sách sau khi lọc + phân trang -->
    <slot
      :items="paginatedItems"
      :total="filteredItems.length"
      :current-page="currentPageComputed"
      :total-pages="totalPages"
    />

    <!-- Điều hướng trang-->
    <div v-if="totalPages > 1" class="flex justify-center items-center gap-2 mt-2 select-none">
      <button
        @click="goTo(currentPageComputed - 1)"
        :disabled="currentPageComputed === 1"
        :class="[
          'px-4 py-2 rounded-lg border transition-colors',
          currentPageComputed === 1
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-white border-gray-300 text-gray-700 hover:bg-green-50 hover:border-green-500 cursor-pointer',
        ]"
      >
        trước
      </button>

      <div class="flex gap-1">
        <button
          v-for="page in visiblePages"
          :key="page"
          @click="goTo(page)"
          :class="[
            'w-10 h-10 rounded-lg border transition-colors font-medium',
            currentPageComputed === page
              ? 'bg-green-600 text-white border-green-600 cursor-pointer'
              : 'bg-white border-gray-300 text-gray-700 hover:bg-green-50 hover:border-green-500 cursor-pointer',
          ]"
        >
          {{ page }}
        </button>
      </div>

      <button
        @click="goTo(currentPageComputed + 1)"
        :disabled="currentPageComputed === totalPages"
        :class="[
          'px-4 py-2 rounded-lg border transition-colors',
          currentPageComputed === totalPages
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-white border-gray-300 text-gray-700 hover:bg-green-50 hover:border-green-500 cursor-pointer',
        ]"
      >
        sau
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, watch, onMounted } from "vue"
import { useRoute, useRouter } from "vue-router"

const props = defineProps({
  // Nguồn dữ liệu thô
  items: { type: Array, default: () => [] },
  items2: { type: Array, default: () => [] },

  // Bộ lọc/ tìm kiếm/ sắp xếp (tùy chọn)
  searchQuery: { type: String, default: "" },
  selectedCategory: { type: [String, Number], default: "" },
  sortOption: { type: String, default: "" },
  selectedActive: { type: String, default: "" },
  selectedStatus: { type: String, default: "" },
  selectedShippingStatus: { type: String, default: "" },
  selectedDeleted: { type: String, default: "" },

  // Accessors cho các trường
  getCategoryId: { type: Function, default: (p) => p?.category_id },
  getName: { type: Function, default: (p) => p?.product_name },
  getDescription: { type: Function, default: (p) => p?.description || "" },
  getPrice: { type: Function, default: (p) => p?.price ?? 0 },

  // Phân trang
  modelValue: { type: Number, default: 1 },
  pageSize: { type: Number, default: 0 },
  maxVisible: { type: Number, default: 5 },
  showSummary: { type: Boolean, default: true },
  scrollToTop: { type: Boolean, default: true },

  // Đồng bộ query URL
  syncRoute: { type: Boolean, default: false },
  routeQueryKey: { type: String, default: "category" },

  // UI controls
  showActive: { type: Boolean, default: false },
  showFilter: { type: Boolean, default: false },
  showCategoryFilter: { type: Boolean, default: false },
  showSortOption: { type: Boolean, default: false },
  showStatusFilter: { type: Boolean, default: false },
  showDeletedFilter: { type: Boolean, default: false },
  showShippingStatusFilter: { type: Boolean, default: false },

  categoryOptions: { type: Array, default: () => [] },
  categoryIdKey: { type: String, default: "category_id" },
  categoryLabelKey: { type: String, default: "category_name" },
  statusOptions: { type: Array, default: () => [] },
  shippingStatusOption: { type: Array, default: () => [] },
  statusValueKey: { type: String, default: "value" },
  shippingstatusValueKey: { type: String, default: "value" },
  statusLabelKey: { type: String, default: "label" },
  useProductLabels: { type: Boolean, default: false },
  controlsClass: { type: String, default: "" },
})

const emit = defineEmits([
  "update:modelValue",
  "update:selectedCategory",
  "update:sortOption",
  "update:selectedActive",
  "update:selectedStatus",
  "update:selectedShippingStatus",
  "update:selectedDeleted",
])
const route = useRoute()
const router = useRouter()

// Lọc + tìm kiếm
const filteredItems = computed(() => {
  let sourceItems
  if (props.selectedActive === "deactive") {
    sourceItems = props.items2 ? [...props.items2] : []
  } else if (props.selectedActive === "out_of_stock") {
    // Nếu selectedActive là 'out_of_stock', sử dụng items2 (đã được filter từ ProductView)
    sourceItems = props.items2 ? [...props.items2] : []
  } else {
    sourceItems = props.items ? [...props.items] : []
  }

  let result = sourceItems

  if (props.selectedCategory) {
    result = result.filter((p) => props.getCategoryId(p) == props.selectedCategory)
  }

  if (props.selectedStatus) {
    result = result.filter((p) => p.status === props.selectedStatus)
  }

  if (props.selectedShippingStatus) {
    if (props.selectedShippingStatus === "NOT_DELIVERED") {
      // Gộp các trạng thái chưa giao: UNDELIVERED, PREPARING_ORDER, SHIPPING
      result = result.filter(
        (p) =>
          p.shipping_status === "UNDELIVERED" ||
          p.shipping_status === "PREPARING_ORDER" ||
          p.shipping_status === "SHIPPING"
      )
    } else {
      // Lọc theo trạng thái giao hàng chính xác: DELIVERED, CANCELLED (Giao thất bại), etc.
      result = result.filter((p) => p.shipping_status === props.selectedShippingStatus)
    }
  }

  const q = String(props.searchQuery || "")
    .toLowerCase()
    .trim()
  if (q) {
    result = result.filter((p) => {
      const name = String(props.getName(p) || "").toLowerCase()
      const description = String(props.getDescription(p) || "").toLowerCase()
      return name.includes(q) || description.includes(q)
    })
  }

  if (props.sortOption) {
    result = [...result].sort((a, b) => {
      switch (props.sortOption) {
        case "price-asc":
          return (props.getPrice(a) || 0) - (props.getPrice(b) || 0)
        case "price-desc":
          return (props.getPrice(b) || 0) - (props.getPrice(a) || 0)
        case "name-asc":
          return String(props.getName(a) || "").localeCompare(String(props.getName(b) || ""), "vi")
        case "name-desc":
          return String(props.getName(b) || "").localeCompare(String(props.getName(a) || ""), "vi")
        default:
          return 0
      }
    })
  }

  return result
})

// tính tổng trang cần hiển thị sau filter
const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredItems.value.length / props.pageSize))
)

//sự kiện emit
const currentPageComputed = computed({
  get: () => Math.min(Math.max(1, props.modelValue || 1), totalPages.value),
  set: (val) => emit("update:modelValue", val),
})
//tính item đầu tiên trong ds
computed(() => (currentPageComputed.value - 1) * props.pageSize + 1)
//tính item cuối cùng trong ds
computed(() => Math.min(currentPageComputed.value * props.pageSize, filteredItems.value.length))

//số item mỗi trang
const paginatedItems = computed(() => {
  const start = (currentPageComputed.value - 1) * props.pageSize
  const end = start + props.pageSize
  return filteredItems.value.slice(start, end)
})

//hiển thị số trang trên tổng trang
const visiblePages = computed(() => {
  const t = totalPages.value
  const pages = []
  const maxVisible = Math.max(1, props.maxVisible)
  let start = Math.max(1, currentPageComputed.value - Math.floor(maxVisible / 2))
  let end = Math.min(t, start + maxVisible - 1)
  if (end - start < maxVisible - 1) {
    start = Math.max(1, end - maxVisible + 1)
  }
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})

//gửi emit cho cha cập nhật lại giá trị và cuộn lên đầu trang sau chuyển
function goTo(p) {
  if (p < 1 || p > totalPages.value) return
  currentPageComputed.value = p
  if (props.scrollToTop) {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }
}

// Reset trang về 1 khi thay đổi bộ lọc/tìm kiếm
watch(
  () => [
    props.sortOption,
    props.selectedActive,
    props.searchQuery,
    props.selectedStatus,
    props.selectedShippingStatus,
    props.selectedDeleted,
  ],
  () => {
    currentPageComputed.value = 1
  }
)

// Đồng bộ selectedCategory với URL (tùy chọn)
watch(
  () => props.selectedCategory,
  async (newCategory) => {
    currentPageComputed.value = 1
    if (!props.syncRoute) return
    const desiredCategory = newCategory ? String(newCategory) : undefined
    if (route?.query?.[props.routeQueryKey] !== desiredCategory) {
      await router.push({ query: { ...route.query, [props.routeQueryKey]: desiredCategory } })
    }
  }
)

onMounted(() => {
  if (!props.syncRoute) return
  const q = route?.query?.[props.routeQueryKey]
  if (q !== undefined) {
    emit("update:selectedCategory", String(q))
  }
})

// emit sau chọn category
const selectedCategoryProxy = computed({
  get: () => props.selectedCategory,
  set: (v) => emit("update:selectedCategory", v),
})
//emit sau chọn option
const sortOptionProxy = computed({
  get: () => props.sortOption,
  set: (v) => emit("update:sortOption", v),
})

const selectedActiveProxy = computed({
  get: () => props.selectedActive,
  set: (v) => emit("update:selectedActive", v),
})

const selectedStatusProxy = computed({
  get: () => props.selectedStatus,
  set: (v) => emit("update:selectedStatus", v),
})
const selectedShippingStatusProxy = computed({
  get: () => props.selectedShippingStatus,
  set: (v) => emit("update:selectedShippingStatus", v),
})

const selectedDeletedProxy = computed({
  get: () => props.selectedDeleted,
  set: (v) => emit("update:selectedDeleted", v),
})
</script>
