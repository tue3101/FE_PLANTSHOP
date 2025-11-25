<template>
  <div class="flex flex-col justify-between  px-2 py-5 border-r border-gray-300 w-[300px]  "
    :style="{ backgroundImage: 'url(/img/background_navbar.png)' }">
    <!-- Phần trên -->
    <div>
      <div class="flex flex-col items-center mt-6 mb-2">
        <router-link to="/dashboard/personal" class="border-4 border-white/0 rounded-full p-1">
          <img src="/img/user.png" alt="avatar" class="w-20 h-20 rounded-full bg-white" />
        </router-link>
        <div class="text-white text-sm mt-2 font-semibold">{{ userEmail }}</div>
      </div>

      <div class="flex flex-col items-center gap-1">
        <router-link v-for="item in sidebarItems" :to="item.to" :key="item.name"
          class="w-full p-2 rounded text-xl bg-gray-100/50 text-black hover:bg-white/70 hover:text-green-700 flex items-center gap-2 transition-all duration-200"
          :class="route.path === item.to ? '!bg-green-700 !text-white' : ''">
          <component :is="item.icon" class="size-5" />
          {{ item.name }}
        </router-link>
      </div>
    </div>

    <div>
      <button @click="handleLogout"
        class="w-full p-2 justify-center rounded text-xl bg-red-600 text-white hover:bg-red-500 hover:text-white flex items-center gap-2 transition-all duration-200 cursor-pointer">
        ĐĂNG XUẤT
      </button>
    </div>
  </div>
</template>


<script setup>
import { useRouter, useRoute } from "vue-router"
import { computed, onMounted, watch } from "vue"
import { useAuthStore } from "@/stores/auth"
import { useUserStore } from "@/stores/user"

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const userStore = useUserStore()


// DRY  - Don't Repeat Yourself
const sidebarItems = computed(() => {
  const dashboardRoute = router.options.routes.find((r) => r.name === "dashboard")
  if (dashboardRoute && dashboardRoute.children) {
    return dashboardRoute.children
      .filter((child) => child.meta?.isShow)
      .map((child) => ({
        name: child.meta.title,
        to: "/dashboard/" + child.path,
        icon: child.meta.icon,
      }))
  }
  return []
})

const handleLogout = async () => {
  try {
    await authStore.logout()
    router.push('/login')
  } catch (error) {
    console.error(error)
  }
}

// Sử dụng computed để tự động cập nhật khi userStore.userInfo thay đổi
const userEmail = computed(() => {
  return userStore.userInfo?.email || ''
})

// Hàm load user info
const loadUserInfo = async () => {
  if (authStore.isAuthenticated && authStore.accessToken) {
    // Load lại user info nếu chưa có
    if (!userStore.userInfo) {
      try {
        await userStore.getInfo(authStore.accessToken)
      } catch (error) {
        console.error(error)
      }
    }
  }
}

// Load user info khi component mount
onMounted(() => {
  loadUserInfo()
})

// Theo dõi khi authentication state thay đổi để load lại user info
watch(() => authStore.isAuthenticated, (isAuthenticated) => {
  if (isAuthenticated) {
    loadUserInfo()
  }
})
</script>
