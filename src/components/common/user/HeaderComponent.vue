<template>
  <header class="bg-white shadow-md sticky top-0 z-50">
    <div class="bg-green-800 text-white px-20 py-2 flex items-center justify-between">
      <div class="flex items-center space-x-4">
        <div class="flex items-center space-x-2">
          <Clock class="w-5 h-5" />
          <span>08:30 - 22:00</span>
        </div>
        <div class="h-5 w-px bg-white"></div>

        <div class="flex items-center space-x-2">
          <Phone class="w-5 h-5" />
          <span>0937 3979 86</span>
        </div>
      </div>

      <div class="flex items-center space-x-4 relative">
        <!-- Not Logged In -->
        <!-- <router-link v-if="!authStore.isAuthenticated" to="/login"
          class="cursor-pointer hover:opacity-80 flex items-center gap-2">
          <User class="w-5 h-5" />
          <span>Login</span>
        </router-link> -->

        <!-- Logged In - User Menu -->
        <div class="relative z-100">
          <button
            @click="toggleUserMenu"
            class="cursor-pointer hover:opacity-80 flex items-center gap-2"
          >
            <User class="w-5 h-5" />
            <span>{{ getUsername() }}</span>
          </button>

          <!-- Dropdown Menu -->
          <div
            v-if="showUserMenu"
            class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-100"
            @click.stop
          >
            <button
              @click="handleViewProfile"
              class="w-full text-left px-4 py-2 text-sm text-black hover:bg-gray-100 transition-colors cursor-pointer"
            >
              Xem thông tin
            </button>
            <Button
              variant="destructive"
              @click="handleLogout"
              class="w-full"
            >
              Đăng xuất
            </Button>
          </div>
        </div>
      </div>

      <!-- Overlay để đóng dropdown khi click bên ngoài -->
      <div v-if="showUserMenu" @click="closeUserMenu" class="fixed inset-0 z-90"></div>
    </div>

    <!-- Bottom Navigation -->
    <div class="px-10 bg-white h-20 border-b relative z-50">
      <div class="flex justify-between items-center h-20">
        <div class="flex items-center h-full">
          <div class="w-50 h-15 cursor-pointer">
            <RouterLink to="/"
              ><img src="/img/logo.png" alt="Cỏ ba lá" class="w-full h-full"
            /></RouterLink>
          </div>
        </div>
        <div class="flex items-center flex-nowrap relative z-50">
          <template v-for="item in headerItems" :key="item.name">
            <!-- Danh mục Menu (Multi-level) -->
            <div
              v-if="item.name === 'Danh Mục'"
              class="relative z-100"
              @mouseenter="handleCategoryMenuEnter"
              @mouseleave="handleCategoryMenuLeave"
            >
              <button
                @click.stop="toggleCategoryMenu"
                class="p-4 h-20 text-xl font-bold text-green-700 hover:text-green-500 flex items-center transition-all duration-200 cursor-pointer"
                :class="route.path === item.to ? 'text-green-500!' : ''"
              >
                <Menu class="w-6 h-6 mr-2" :class="{ 'rotate-180': showCategoryMenu }" />
                <span>{{ item.name }}</span>
              </button>

              <!-- Dropdown Menu -->
              <div
                v-if="showCategoryMenu && categories.length > 0"
                @mouseenter="handleCategoryMenuEnter"
                @mouseleave="handleCategoryMenuLeave"
                class="absolute top-full left-0 mt-0 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-100"
              >
                <div
                  v-for="category in categories"
                  :key="category.category_id"
                  class="relative group"
                >
                  <router-link
                    :to="`/product?category=${category.category_id}`"
                    class="flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    @click="showCategoryMenu = false"
                  >
                    <span>{{ category.category_name }}</span>
                    <!-- <ChevronRight v-if="category.subcategories && category.subcategories.length > 0"
                      class="w-4 h-4 text-gray-400" /> -->
                  </router-link>

                  <!-- Submenu  -->
                  <!-- <div v-if="category.subcategories && category.subcategories.length > 0"
                    class="absolute left-full top-0 ml-1 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[100]">
                    <router-link v-for="sub in category.subcategories" :key="sub.category_id || sub.id"
                      :to="`/product?category=${sub.category_id || sub.id}`"
                      class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                      {{ sub.category_name || sub.name }}
                    </router-link>
                  </div> -->
                </div>
              </div>
              <!-- Empty state nếu chưa có categories -->
              <div
                v-else-if="showCategoryMenu && categories.length === 0"
                class="absolute top-full left-0 mt-0 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-100"
              >
                <div class="px-4 py-2 text-sm text-gray-500">Đang tải danh mục...</div>
              </div>
            </div>

            <!-- Các items thông thường -->
            <router-link
              v-else
              :to="item.to"
              class="p-4 h-20 text-xl font-bold text-green-700 hover:text-green-500 flex items-center transition-all duration-200"
              :class="route.path === item.to ? 'text-green-500!' : ''"
            >
              {{ item.name }}
            </router-link>
          </template>
        </div>

        <div class="flex-1 max-w-md mx-8">
          <SearchCommon
            v-model="searchQuery"
            mode="user"
            :show-category-filter="false"
            :show-suggestions="true"
          />
        </div>

        <!-- Cart -->
        <div class="relative cart-icon-container" @click="handleCartClick">
          <ShoppingCart class="w-10 h-10 text-green-700 hover:text-green-500 cursor-pointer" />
          <span
            v-if="cartItemsCount > 0"
            class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-semibold"
          >
            {{ cartItemsCount > 99 ? "99+" : cartItemsCount }}
          </span>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { Phone, ShoppingCart, Clock, Menu, User } from "lucide-vue-next"
import SearchCommon from "../SearchCommon.vue"
import { useRouter, useRoute } from "vue-router"
import { computed, ref, onMounted, watch } from "vue"
import { useAuthStore } from "@/stores/auth"
import { useUserStore } from "@/stores/user"
import { useCartStore } from "@/stores/cart"
import { useProductStore } from "@/stores/products"
import type { Category } from "@/types/store.types"
import { Button } from "@/components/ui/button"
import { toastSuccess, toastError } from "@/utils/toast"

interface HeaderItem {
  name: string
  to: string
}

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const userStore = useUserStore()
const cartStore = useCartStore()
const productStore = useProductStore()
const showUserMenu = ref<boolean>(false)
const showCategoryMenu = ref<boolean>(false)
const searchQuery = ref<string>("")

let leaveTimeout: ReturnType<typeof setTimeout> | null = null

const loadUserInfo = async (): Promise<void> => {
  if (authStore.isAuthenticated && !userStore.userInfo) {
    try {
      await userStore.getInfo()
    } catch (error) {
      console.error(error)
    }
  }
}

const loadCategories = async (): Promise<void> => {
  try {
    await productStore.getCategories()
  } catch (error) {
    console.error("Error loading categories:", error)
  }
}

const categories = computed<Category[]>(() => {
  return productStore.categories || []
})

const loadCart = async (): Promise<void> => {
  if (authStore.isAuthenticated && authStore.userId) {
    try {
      await cartStore.loadCartFromBackend(authStore.userId)
    } catch (error) {
      console.log("Cart loaded (may be empty):", error)
    }
  }
}

onMounted(() => {
  loadUserInfo()
  loadCategories()
  loadCart()
})

watch(
  () => authStore.isAuthenticated,
  (isAuthenticated: boolean) => {
    loadUserInfo()
    if (isAuthenticated) {
      loadCart()
    }
  }
)

const toggleUserMenu = (): void => {
  showUserMenu.value = !showUserMenu.value
}

const toggleCategoryMenu = (): void => {
  showCategoryMenu.value = !showCategoryMenu.value
  if (showCategoryMenu.value && categories.value.length === 0) {
    loadCategories()
  }
}

const handleCategoryMenuEnter = (): void => {
  if (leaveTimeout) {
    clearTimeout(leaveTimeout)
    leaveTimeout = null
  }
  showCategoryMenu.value = true
}

const handleCategoryMenuLeave = (): void => {
  leaveTimeout = setTimeout(() => {
    showCategoryMenu.value = false
  }, 200)
}

const closeUserMenu = (): void => {
  showUserMenu.value = false
}

const getUsername = (): string => {
  if (userStore.userInfo?.username) {
    return userStore.userInfo.username
  }
  if (userStore.userInfo?.email) {
    return userStore.userInfo.email.split("@")[0]
  }
  return "User"
}

const handleViewProfile = (): void => {
  closeUserMenu()
  router.push("/userinfo")
}

const handleLogout = async (): Promise<void> => {
  try {
    await authStore.logout()
    toastSuccess("Đăng xuất thành công!")
    userStore.userInfo = null
    closeUserMenu()
    router.push("/login")
  } catch (error) {
    toastError("Đăng xuất thất bại!")
    console.error(error)
  }
}

const cartItemsCount = computed<number>(() => {
  return cartStore.totalItems || 0
})

const handleCartClick = (): void => {
  router.push("/cart")
}

const headerItems = computed<HeaderItem[]>(() => {
  const homePageRoute = router.options.routes.find((r) => r.name === "homepage")
  if (homePageRoute && homePageRoute.children) {
    return homePageRoute.children
      .filter((child) => child.meta?.isShow)
      .map((child) => ({
        name: child.meta?.title as string,
        to: "/" + child.path,
      }))
  }
  return []
})
</script>
