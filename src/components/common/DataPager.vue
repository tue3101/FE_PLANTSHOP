<template>
  <div>
    <!-- Optional built-in controls: Category filter + Sort -->
    <div v-if="showFilter" :class="['flex flex-col sm:flex-row gap-4 mb-2', controlsClass]">
      <div v-if="showCategoryFilter" class="sm:w-48">
        <Select v-model="selectedCategoryProxy">
          <SelectTrigger>
            <SelectValue placeholder="Tất cả danh mục" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả danh mục</SelectItem>
            <SelectItem
              v-for="category in categoryOptions"
              :key="String((category as Record<string, unknown>)[categoryIdKey])"
              :value="String((category as Record<string, unknown>)[categoryIdKey])"
            >
              {{ (category as Record<string, unknown>)[categoryLabelKey] }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div v-if="showSortOption" class="sm:w-48">
        <Select v-model="sortOptionProxy">
          <SelectTrigger>
            <SelectValue placeholder="Sắp xếp mặc định" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Sắp xếp mặc định</SelectItem>
            <SelectItem value="price-asc">Giá: Tăng dần</SelectItem>
            <SelectItem value="price-desc">Giá: Giảm dần</SelectItem>
            <SelectItem value="name-asc">Tên: A-Z</SelectItem>
            <SelectItem value="name-desc">Tên: Z-A</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div v-if="showActive" class="sm:w-48">
        <Select v-model="selectedActiveProxy">
          <SelectTrigger>
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <template v-if="useProductLabels">
              <SelectItem value="all">Đang bán</SelectItem>
              <SelectItem value="out_of_stock">Tạm hết hàng</SelectItem>
              <SelectItem value="deactive">Ngưng kinh doanh</SelectItem>
            </template>
            <template v-else>
              <SelectItem value="all">Đang hoạt động</SelectItem>
              <SelectItem value="deactive">Không hoạt động</SelectItem>
            </template>
          </SelectContent>
        </Select>
      </div>

      <div v-if="showShippingStatusFilter" class="sm:w-48">
        <Select v-model="selectedShippingStatusProxy">
          <SelectTrigger>
            <SelectValue placeholder="Trạng thái giao hàng" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Trạng thái giao hàng</SelectItem>
            <SelectItem
              v-for="shipping_status in shippingStatusOption"
              :key="String((shipping_status as Record<string, unknown>)[shippingstatusValueKey])"
              :value="String((shipping_status as Record<string, unknown>)[shippingstatusValueKey])"
            >
              {{ (shipping_status as Record<string, unknown>)[statusLabelKey] }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div v-if="showStatusFilter" class="sm:w-48">
        <Select v-model="selectedStatusProxy">
          <SelectTrigger>
            <SelectValue placeholder="Tất cả trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả trạng thái</SelectItem>
            <SelectItem
              v-for="status in statusOptions"
              :key="String((status as Record<string, unknown>)[statusValueKey])"
              :value="String((status as Record<string, unknown>)[statusValueKey])"
            >
              {{ (status as Record<string, unknown>)[statusLabelKey] }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div v-if="showDeletedFilter" class="sm:w-48">
        <Select v-model="selectedDeletedProxy">
          <SelectTrigger>
            <SelectValue placeholder="Trạng thái đánh giá" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Đánh giá hiện</SelectItem>
            <SelectItem value="deleted">Đánh giá ẩn</SelectItem>
          </SelectContent>
        </Select>
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
    <Pagination
      v-if="totalPages > 1 && props.pageSize > 0"
      :key="`pagination-${totalPages}-${currentPageComputed}`"
      :items-per-page="props.pageSize"
      :page="currentPageComputed"
      :total="filteredItems.length"
      class="flex justify-center items-center gap-2 mt-2"
    >
      <PaginationPrevious
        @click="goTo(currentPageComputed - 1)"
        :disabled="currentPageComputed === 1"
      />
      <PaginationContent>
        <PaginationItem
          v-for="page in visiblePages"
          :key="page"
          :value="page"
          @click="goTo(page)"
          :class="currentPageComputed === page ? 'bg-primary text-primary-foreground' : ''"
        >
          {{ page }}
        </PaginationItem>
      </PaginationContent>
      <PaginationNext
        @click="goTo(currentPageComputed + 1)"
        :disabled="currentPageComputed === totalPages"
      />
    </Pagination>
  </div>
</template>

<script setup lang="ts">
import { computed, watch, onMounted } from "vue"
import { useRoute, useRouter } from "vue-router"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

const props = withDefaults(
  defineProps<{
    items?: unknown[]
    items2?: unknown[]
    searchQuery?: string
    selectedCategory?: string | number
    sortOption?: string
    selectedActive?: string
    selectedStatus?: string
    selectedShippingStatus?: string
    selectedDeleted?: string
    getCategoryId?: (p: unknown) => unknown
    getName?: (p: unknown) => string
    getDescription?: (p: unknown) => string
    getPrice?: (p: unknown) => number
    modelValue?: number
    pageSize?: number
    maxVisible?: number
    showSummary?: boolean
    scrollToTop?: boolean
    syncRoute?: boolean
    routeQueryKey?: string
    showActive?: boolean
    showFilter?: boolean
    showCategoryFilter?: boolean
    showSortOption?: boolean
    showStatusFilter?: boolean
    showDeletedFilter?: boolean
    showShippingStatusFilter?: boolean
    categoryOptions?: unknown[]
    categoryIdKey?: string
    categoryLabelKey?: string
    statusOptions?: unknown[]
    shippingStatusOption?: unknown[]
    statusValueKey?: string
    shippingstatusValueKey?: string
    statusLabelKey?: string
    useProductLabels?: boolean
    controlsClass?: string
  }>(),
  {
    items: () => [],
    items2: () => [],
    searchQuery: "",
    selectedCategory: "all",
    sortOption: "all",
    selectedActive: "all",
    selectedStatus: "all",
    selectedShippingStatus: "all",
    selectedDeleted: "all",
    getCategoryId: (p: unknown) => (p as Record<string, unknown>)?.category_id,
    getName: (p: unknown) => ((p as Record<string, unknown>)?.product_name as string) || "",
    getDescription: (p: unknown) => ((p as Record<string, unknown>)?.description as string) || "",
    getPrice: (p: unknown) => ((p as Record<string, unknown>)?.price as number) ?? 0,
    modelValue: 1,
    pageSize: 0,
    maxVisible: 5,
    showSummary: true,
    scrollToTop: true,
    syncRoute: false,
    routeQueryKey: "category",
    showActive: false,
    showFilter: false,
    showCategoryFilter: false,
    showSortOption: false,
    showStatusFilter: false,
    showDeletedFilter: false,
    showShippingStatusFilter: false,
    categoryOptions: () => [],
    categoryIdKey: "category_id",
    categoryLabelKey: "category_name",
    statusOptions: () => [],
    shippingStatusOption: () => [],
    statusValueKey: "value",
    shippingstatusValueKey: "value",
    statusLabelKey: "label",
    useProductLabels: false,
    controlsClass: "",
  }
)

const emit = defineEmits<{
  "update:modelValue": [value: number]
  "update:selectedCategory": [value: string | number]
  "update:sortOption": [value: string]
  "update:selectedActive": [value: string]
  "update:selectedStatus": [value: string]
  "update:selectedShippingStatus": [value: string]
  "update:selectedDeleted": [value: string]
}>()

const route = useRoute()
const router = useRouter()

// Lọc + tìm kiếm
const filteredItems = computed(() => {
  let sourceItems: unknown[]
  // Normalize selectedActive: treat empty string or "all" as active items
  const normalizedActive = !props.selectedActive || props.selectedActive === "" || props.selectedActive === "all" ? null : props.selectedActive
  
  // Ensure we get the actual array values from props
  const itemsArray = Array.isArray(props.items) ? props.items : []
  const items2Array = Array.isArray(props.items2) ? props.items2 : []
  
  if (normalizedActive === "deactive") {
    sourceItems = [...items2Array]
  } else if (normalizedActive === "out_of_stock") {
    // Nếu selectedActive là 'out_of_stock', sử dụng items2 (đã được filter từ ProductView)
    sourceItems = [...items2Array]
  } else {
    // Default: use active items (items)
    sourceItems = [...itemsArray]
  }

  let result = sourceItems

  // Normalize selectedCategory: treat empty string as "all"
  const normalizedCategory = !props.selectedCategory || props.selectedCategory === "" || String(props.selectedCategory) === "all" ? null : props.selectedCategory
  
  if (normalizedCategory) {
    result = result.filter((p) => props.getCategoryId(p) == normalizedCategory)
  }

  if (props.selectedStatus && props.selectedStatus !== "all") {
    result = result.filter((p) => (p as Record<string, unknown>).status === props.selectedStatus)
  }

  if (props.selectedShippingStatus && props.selectedShippingStatus !== "all") {
    if (props.selectedShippingStatus === "NOT_DELIVERED") {
      // Gộp các trạng thái chưa giao: UNDELIVERED, PREPARING_ORDER, SHIPPING
      result = result.filter((p) => {
        const item = p as Record<string, unknown>
        return (
          item.shipping_status === "UNDELIVERED" ||
          item.shipping_status === "PREPARING_ORDER" ||
          item.shipping_status === "SHIPPING"
        )
      })
    } else {
      // Lọc theo trạng thái giao hàng chính xác: DELIVERED, CANCELLED (Giao thất bại), etc.
      result = result.filter(
        (p) => (p as Record<string, unknown>).shipping_status === props.selectedShippingStatus
      )
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

  if (props.sortOption && props.sortOption !== "all") {
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
const totalPages = computed(() => {
  if (props.pageSize <= 0) return 1
  return Math.max(1, Math.ceil(filteredItems.value.length / props.pageSize))
})

//sự kiện emit
const currentPageComputed = computed({
  get: () => Math.min(Math.max(1, props.modelValue || 1), totalPages.value),
  set: (val: number) => emit("update:modelValue", val),
})
//tính item đầu tiên trong ds
computed(() => (currentPageComputed.value - 1) * props.pageSize + 1)
//tính item cuối cùng trong ds
computed(() => Math.min(currentPageComputed.value * props.pageSize, filteredItems.value.length))

//số item mỗi trang
const paginatedItems = computed(() => {
  if (props.pageSize <= 0) return filteredItems.value
  const start = (currentPageComputed.value - 1) * props.pageSize
  const end = start + props.pageSize
  return filteredItems.value.slice(start, end)
})

//hiển thị số trang trên tổng trang
const visiblePages = computed(() => {
  const t = totalPages.value
  const pages: number[] = []
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
function goTo(p: number): void {
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
    const desiredCategory = newCategory && newCategory !== "all" ? String(newCategory) : undefined
    if (route?.query?.[props.routeQueryKey] !== desiredCategory) {
      await router.push({ query: { ...route.query, [props.routeQueryKey]: desiredCategory } })
    }
  }
)

onMounted(() => {
  if (!props.syncRoute) return
  const q = route?.query?.[props.routeQueryKey]
  if (q !== undefined && String(q) !== "all") {
    emit("update:selectedCategory", String(q))
  } else {
    emit("update:selectedCategory", "all")
  }
})

// emit sau chọn category
const selectedCategoryProxy = computed({
  get: () => {
    const val = props.selectedCategory
    // Normalize: convert empty string to "all"
    if (!val || val === "" || String(val) === "all") return "all"
    return String(val)
  },
  set: (v: string) => {
    // Normalize: convert "all" to empty string for backward compatibility with parent components
    emit("update:selectedCategory", v === "all" ? "" : v)
  },
})
//emit sau chọn option
const sortOptionProxy = computed({
  get: () => props.sortOption || "all",
  set: (v: string) => emit("update:sortOption", v),
})

const selectedActiveProxy = computed({
  get: () => props.selectedActive || "all",
  set: (v: string) => emit("update:selectedActive", v),
})

const selectedStatusProxy = computed({
  get: () => props.selectedStatus || "all",
  set: (v: string) => emit("update:selectedStatus", v),
})
const selectedShippingStatusProxy = computed({
  get: () => props.selectedShippingStatus || "all",
  set: (v: string) => emit("update:selectedShippingStatus", v),
})

const selectedDeletedProxy = computed({
  get: () => props.selectedDeleted || "all",
  set: (v: string) => emit("update:selectedDeleted", v),
})
</script>
