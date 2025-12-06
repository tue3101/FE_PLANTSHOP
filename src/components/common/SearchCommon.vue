<template>
  <div ref="searchContainer" class="relative w-full">
    <div class="relative">
      <Search
        class="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5"
      />
      <Input
        type="text"
        :model-value="modelValue"
        :placeholder="placeholder"
        :class="computedInputClass"
        @update:model-value="handleInput"
        @keyup.enter="handleEnter"
        @focus="handleFocus"
      />
    </div>

    <!-- Search Suggestions  -->
    <div
      v-if="
        showSuggestions &&
        mode === 'user' &&
        suggestions.length > 0 &&
        modelValue.trim() &&
        isSuggestionsVisible
      "
      class="absolute top-full left-0 right-0 mt-1 bg-background border rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto"
    >
      <div
        v-for="suggestion in suggestions"
        :key="suggestion.product_id"
        @click.stop="selectSuggestion(suggestion)"
        class="px-4 py-2 hover:bg-muted cursor-pointer flex items-center gap-3"
      >
        <img
          :src="getProductImage(suggestion)"
          :alt="getProductName(suggestion)"
          class="w-10 h-10 object-contain rounded"
          @error="handleImageError($event)"
        />
        <div class="flex-1">
          <p class="text-sm font-medium">{{ getProductName(suggestion) }}</p>
          <p class="text-xs text-muted-foreground">{{ formatPrice(suggestion.price) }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from "vue"
import { useRouter } from "vue-router"
import { Search } from "lucide-vue-next"
import { useProductStore } from "@/stores/products"
import { Input } from "@/components/ui/input"
import type { Product } from "@/types/api.types"

type Props = {
  modelValue?: string
  mode?: "user" | "admin"
  placeholder?: string
  inputClass?: string
  useHeaderStyle?: boolean
  showCategoryFilter?: boolean
  showSuggestions?: boolean
  initialCategory?: string | number
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: "",
  mode: "user",
  placeholder: "Nhập từ khóa tìm kiếm...",
  inputClass:
    "w-full pl-10 pr-4 py-2 rounded-full",
  useHeaderStyle: false,
  showCategoryFilter: false,
  showSuggestions: false,
  initialCategory: "",
})

const emit = defineEmits<{
  "update:modelValue": [value: string]
  search: [query: string]
  "category-change": [category: string | number]
}>()

const router = useRouter()
const productStore = useProductStore()

const selectedCategory = ref<string | number>(props.initialCategory || "")
const suggestions = ref<Product[]>([])
const isSuggestionsVisible = ref<boolean>(true)
const searchContainer = ref<HTMLElement | null>(null)

// Computed input class
const computedInputClass = computed(() => {
  if (props.useHeaderStyle) {
    return "w-full pl-10 pr-4 py-2 rounded-full"
  }
  return props.inputClass
})

// Load categories
const loadCategories = async (): Promise<void> => {
  try {
    if (!productStore.categories || productStore.categories.length === 0) {
      await productStore.getCategories()
    }
  } catch (error) {
    console.error("Error loading categories:", error)
  }
}

// Computed products for suggestions
const products = computed(() => {
  return productStore.products || []
})

// Handle input change
const handleInput = (value: string): void => {
  emit("update:modelValue", value)

  if (props.mode === "user" && props.showSuggestions && value.trim()) {
    isSuggestionsVisible.value = true
    updateSuggestions()
  } else {
    suggestions.value = []
    isSuggestionsVisible.value = false
  }
}

// Handle focus
const handleFocus = (): void => {
  if (
    props.mode === "user" &&
    props.showSuggestions &&
    props.modelValue?.trim() &&
    suggestions.value.length > 0
  ) {
    isSuggestionsVisible.value = true
  }
}

// Handle Enter key
const handleEnter = (): void => {
  if (props.mode === "user") {
    handleSearch()
  } else {
    emit("search", props.modelValue || "")
  }
}

// Update suggestions based on search query
const updateSuggestions = (): void => {
  const query = (props.modelValue || "").toLowerCase().trim()
  if (!query) {
    suggestions.value = []
    return
  }

  // Filter products by name
  const filtered = products.value.filter((product) => {
    const productName = getProductName(product).toLowerCase()
    return productName.includes(query)
  })

  // Limit to 5 suggestions
  suggestions.value = filtered.slice(0, 8)
}

// Handle search (chỉ cho user mode)
const handleSearch = (): void => {
  if (props.mode !== "user") return

  const query = (props.modelValue || "").trim()
  const category = selectedCategory.value

  // Build query params
  const queryParams: Record<string, string> = {}
  if (query) {
    queryParams.search = query
  }
  if (category) {
    queryParams.category = String(category)
  }

  // Navigate to product page with search params
  router.push({
    path: "/product",
    query: queryParams,
  })

  // Clear suggestions và ẩn dropdown
  suggestions.value = []
  isSuggestionsVisible.value = false
}

// Select suggestion
const selectSuggestion = (product: Product): void => {
  const productId = product.product_id
  if (!productId) {
    console.error("Product ID not found:", product)
    return
  }
  console.log("Navigating to product detail:", productId, product)
  router.push(`/product-detail/${productId}`)
  suggestions.value = []
  isSuggestionsVisible.value = false
  emit("update:modelValue", getProductName(product))
}

// Handle click outside
const handleClickOutside = (event: MouseEvent): void => {
  if (searchContainer.value && !searchContainer.value.contains(event.target as Node)) {
    isSuggestionsVisible.value = false
  }
}

// Helper functions
const getProductImage = (product: Product): string => {
  if (!product) return "/img/footer.png"
  if (product.img_url) return product.img_url
  if (product.images && product.images.length > 0) return product.images[0]
  return "/img/footer.png"
}

const getProductName = (product: Product): string => {
  if (!product) return "Sản phẩm không xác định"
  return product.product_name || "Sản phẩm"
}

const formatPrice = (price: number | string | undefined): string => {
  const numPrice = typeof price === "string" ? parseFloat(price) || 0 : price || 0
  if (!price) return "0 ₫"
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(numPrice)
}

const handleImageError = (event: Event): void => {
  const target = event.target as HTMLImageElement
  if (!target.src.includes("footer.png")) {
    target.src = "/img/footer.png"
  }
}

// Watch for route changes to update search query (chỉ cho user mode)
watch(
  () => router.currentRoute.value.query,
  (newQuery) => {
    if (props.mode === "user") {
      if (newQuery.search) {
        emit("update:modelValue", String(newQuery.search))
      }
      if (newQuery.category) {
        selectedCategory.value = String(newQuery.category)
      }
    }
  },
  { immediate: true }
)

// Load products for suggestions if needed (chỉ cho user mode)
onMounted(async () => {
  if (props.mode === "user") {
    await loadCategories()

    if (props.showSuggestions) {
      try {
        if (!productStore.products || productStore.products.length === 0) {
          await productStore.getProducts()
        }
      } catch (error) {
        console.error("Error loading products for suggestions:", error)
      }
    }
  }

  // Thêm event listener để detect click outside
  document.addEventListener("click", handleClickOutside)
})

// Cleanup event listener khi component unmount
onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside)
})
</script>
