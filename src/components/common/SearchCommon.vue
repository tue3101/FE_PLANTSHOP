<template>
  <div ref="searchContainer" class="relative w-full">
    <div class="relative">
      <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
      <input
        type="text"
        :value="modelValue"
        :placeholder="placeholder"
        :class="computedInputClass"
        @input="handleInput"
        @keyup.enter="handleEnter"
        @focus="handleFocus"
      />
    </div>

    <!-- Category Dropdown -->
    <!-- <div v-if="showCategoryFilter && mode === 'user'" class="mt-2">
            <select v-model="selectedCategory"
                class="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 cursor-pointer text-sm"
                @change="handleCategoryChange">
                <option value="">Tất cả danh mục</option>
                <option v-for="category in categories" :key="category.category_id || category.id"
                    :value="category.category_id || category.id">
                    {{ category.category_name || category.name }}
                </option>
            </select>
        </div> -->

    <!-- Search Suggestions  -->
    <div
      v-if="
        showSuggestions &&
        mode === 'user' &&
        suggestions.length > 0 &&
        modelValue.trim() &&
        isSuggestionsVisible
      "
      class="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto"
    >
      <div
        v-for="suggestion in suggestions"
        :key="suggestion.product_id"
        @click.stop="selectSuggestion(suggestion)"
        class="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-3"
      >
        <img
          :src="getProductImage(suggestion)"
          :alt="getProductName(suggestion)"
          class="w-10 h-10 object-contain rounded"
          @error="handleImageError($event)"
        />
        <div class="flex-1">
          <p class="text-sm font-medium text-gray-800">{{ getProductName(suggestion) }}</p>
          <p class="text-xs text-gray-500">{{ formatPrice(suggestion.price) }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from "vue"
import { useRouter } from "vue-router"
import { Search } from "lucide-vue-next"
import { useProductStore } from "@/stores/products"

const props = defineProps({
  modelValue: {
    type: String,
    default: "",
  },
  mode: {
    type: String,
    default: "user", // 'user' hoặc 'admin'
    validator: (value) => ["user", "admin"].includes(value),
  },
  placeholder: {
    type: String,
    default: "Nhập từ khóa tìm kiếm...",
  },
  inputClass: {
    type: String,
    default:
      "w-full pl-10 pr-4 py-2 bg-amber-50 border border-black rounded-full focus:outline-none focus:ring-1 focus:ring-white",
  },
  useHeaderStyle: {
    type: Boolean,
    default: false,
  },
  showCategoryFilter: {
    type: Boolean,
    default: false,
  },
  showSuggestions: {
    type: Boolean,
    default: false,
  },
  initialCategory: {
    type: [String, Number],
    default: "",
  },
})

const emit = defineEmits(["update:modelValue", "search", "category-change"])

const router = useRouter()
const productStore = useProductStore()

const selectedCategory = ref(props.initialCategory || "")
const suggestions = ref([])
const isSuggestionsVisible = ref(true)
const searchContainer = ref(null)

// Computed input class
const computedInputClass = computed(() => {
  if (props.useHeaderStyle) {
    return "w-full pl-10 pr-4 py-2 bg-amber-50 border border-black rounded-full focus:outline-none focus:ring-1 focus:ring-white"
  }
  return props.inputClass
})

// Load categories
const loadCategories = async () => {
  try {
    if (!productStore.categories || productStore.categories.length === 0) {
      await productStore.getCategories()
    }
  } catch (error) {
    console.error("Error loading categories:", error)
  }
}

// Computed categories
// const categories = computed(() => {
//     return productStore.categories || []
// })

// Computed products for suggestions
const products = computed(() => {
  return productStore.products || []
})

// Handle input change
const handleInput = (event) => {
  const value = event.target.value
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
const handleFocus = () => {
  if (
    props.mode === "user" &&
    props.showSuggestions &&
    props.modelValue.trim() &&
    suggestions.value.length > 0
  ) {
    isSuggestionsVisible.value = true
  }
}

// Handle Enter key
const handleEnter = () => {
  if (props.mode === "user") {
    handleSearch()
  } else {
    emit("search", props.modelValue)
  }
}

// Update suggestions based on search query
const updateSuggestions = () => {
  const query = props.modelValue.toLowerCase().trim()
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
const handleSearch = () => {
  if (props.mode !== "user") return

  const query = props.modelValue.trim()
  const category = selectedCategory.value

  // Build query params
  const queryParams = {}
  if (query) {
    queryParams.search = query
  }
  if (category) {
    queryParams.category = category
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

// Handle category change
// const handleCategoryChange = () => {
//     emit('category-change', selectedCategory.value)
//     // If category is selected, navigate immediately (chỉ cho user mode)
//     if (props.mode === 'user' && selectedCategory.value) {
//         handleSearch()
//     }
// }

// Select suggestion
const selectSuggestion = (product) => {
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
const handleClickOutside = (event) => {
  if (searchContainer.value && !searchContainer.value.contains(event.target)) {
    isSuggestionsVisible.value = false
  }
}

// Helper functions
const getProductImage = (product) => {
  if (!product) return "/img/footer.png"
  if (product.img_url) return product.img_url
  if (product.images && product.images.length > 0) return product.images[0]
  return "/img/footer.png"
}

const getProductName = (product) => {
  if (!product) return "Sản phẩm không xác định"
  return product.product_name || product.name || "Sản phẩm"
}

const formatPrice = (price) => {
  if (!price) return "0 ₫"
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price)
}

const handleImageError = (event) => {
  if (!event.target.src.includes("footer.png")) {
    event.target.src = "/img/footer.png"
  }
}

// Watch for route changes to update search query (chỉ cho user mode)
watch(
  () => router.currentRoute.value.query,
  (newQuery) => {
    if (props.mode === "user") {
      if (newQuery.search) {
        emit("update:modelValue", newQuery.search)
      }
      if (newQuery.category) {
        selectedCategory.value = newQuery.category
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
