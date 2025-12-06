<template>
  <section class="relative h-[200px]">
    <img src="/img/footer.png" alt="Mow Garden Banner" class="w-full h-full object-cover" />
    <div class="absolute inset-0 bg-black/30 flex items-center justify-center">
      <div class="text-center text-white px-6">
        <h1 class="text-4xl md:text-6xl font-bold mb-4">Tất Cả Sản Phẩm</h1>
      </div>
    </div>
  </section>

  <div class="py-8">
    <div class="container mx-30 mb-6 px-4">
      <div class="flex flex-col gap-4 items-start"></div>
      <div v-if="!isLoading && !errorMessage" class="text-gray-600"></div>
    </div>
  </div>
  <div v-if="isLoading" class="flex justify-center items-center min-h-[400px]">
    <div class="text-center">
      <Loader class="w-12 h-12 animate-spin text-green-600 mb-4 mx-auto" />
      <p class="text-gray-600">Đang tải sản phẩm...</p>
    </div>
  </div>
  <div v-else-if="errorMessage" class="flex justify-center items-center min-h-[400px]">
    <div class="text-center text-red-600">
      <p class="text-lg font-semibold mb-2">Có lỗi xảy ra!</p>
      <p>{{ errorMessage }}</p>
    </div>
  </div>

  <!-- Products List Component dùng DataPager gom lọc + sắp xếp + phân trang -->
  <div v-else class="container mx-auto px-4">
    <DataPager
      v-model="currentPage"
      v-model:selectedCategory="selectedCategory"
      v-model:sortOption="sortOption"
      :items="products"
      :page-size="itemsPerPage"
      :search-query="searchQuery"
      :selected-category="selectedCategory"
      :sort-option="sortOption"
      :sync-route="true"
      route-query-key="category"
      :show-filter="true"
      :show-category-filter="true"
      :show-sort-option="true"
      :category-options="categories"
      controls-class="mx-30 -mt-15"
    >
      <template #default="{ items, total, currentPage, totalPages }">
        <div class="mx-30 text-gray-600 mb-4">
          Hiển thị {{ items.length }} / {{ total }} sản phẩm (Trang {{ currentPage }} /
          {{ totalPages }})
        </div>
        <template v-if="total > 0">
          <ProductList :products="items" />
        </template>
        <template v-else>
          <div class="text-center py-16">
            <p class="text-gray-600 text-lg">Không có sản phẩm nào</p>
          </div>
        </template>
      </template>
    </DataPager>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue"
import { useRoute, onBeforeRouteUpdate } from "vue-router"
import { useProductStore } from "@/stores/products"
import { useCartStore } from "@/stores/cart"
import { useAuthStore } from "@/stores/auth"
import { useAsyncOperation } from "@/composables/useAsyncOperation"
import DataPager from "@/components/common/DataPager.vue"
import { useRouter } from "vue-router"
import ProductList from "@/components/common/user/product/ProductList.vue"
import { Loader } from "lucide-vue-next"

const route = useRoute()
const router = useRouter()

const productStore = useProductStore()
const cartStore = useCartStore()
const authStore = useAuthStore()

const { isLoading, errorMessage, executeAsync } = useAsyncOperation()

const products = ref([])
const categories = ref([])

const searchQuery = ref("")
const sortOption = ref("")
const selectedCategory = ref("")
const currentPage = ref(1)
const itemsPerPage = 6

// Load products and categories
onMounted(async () => {
  await executeAsync(async () => {
    await productStore.getCategories()
    const storeCategories = productStore.categories
    categories.value = storeCategories || []

    await productStore.getProducts()
    const storeProducts = productStore.products
    products.value = storeProducts || []

    const userId = authStore.userId
    if (userId) {
      // Load cart từ backend (không hiển thị lỗi nếu giỏ hàng trống - đây là trạng thái bình thường)
      try {
        await cartStore.loadCartFromBackend(userId)
      } catch (error) {
        // Không hiển thị lỗi nếu giỏ hàng trống - đây là trạng thái bình thường
        console.log("Cart loaded (may be empty):", error)
      }
    } else {
      router.push("/login")
    }
  })

  // Kiểm tra query parameter category và search từ URL khi mount
  if (route.query.category) {
    selectedCategory.value = route.query.category.toString()
  }
  if (route.query.search) {
    searchQuery.value = route.query.search.toString()
  }
})

// Watch route query để cập nhật selectedCategory và searchQuery khi route thay đổi
watch(
  () => route.query.category,
  (newCategory) => {
    if (newCategory) {
      selectedCategory.value = newCategory.toString()
    } else {
      selectedCategory.value = ""
    }
  },
  { immediate: true }
)

watch(
  () => route.query.search,
  (newSearch) => {
    if (newSearch) {
      searchQuery.value = newSearch.toString()
    } else {
      searchQuery.value = ""
    }
  },
  { immediate: true }
)

// Xử lý khi route update (khi đã ở trang product và click category khác)
onBeforeRouteUpdate((to) => {
  if (to.query.category) {
    selectedCategory.value = to.query.category.toString()
  } else {
    selectedCategory.value = ""
  }
  if (to.query.search) {
    searchQuery.value = to.query.search.toString()
  } else {
    searchQuery.value = ""
  }
})
</script>
