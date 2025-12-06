<template>
  <div
    class="flex flex-col justify-between px-2 py-5 border-r border-border w-[220px]"
    :style="{ backgroundImage: 'url(/img/background_navbar.png)' }"
  >
    <!-- Phần trên -->
    <div>
      <div class="flex flex-col items-center mt-6 mb-2">
        <router-link to="/dashboard/personal" class="border-4 border-white/0 rounded-full p-1">
          <Avatar class="w-20 h-20">
            <AvatarImage src="/img/user.png" alt="avatar" />
            <AvatarFallback class="bg-white">AD</AvatarFallback>
          </Avatar>
        </router-link>
        <div class="text-white text-sm mt-2 font-semibold">{{ userEmail }}</div>
      </div>

      <div class="flex flex-col items-center gap-1">
        <Button
          v-for="item in sidebarItems"
          :key="item.name"
          as-child
          variant="ghost"
          class="w-full flex justify-start p-2 rounded bg-muted hover:text-primary items-center gap-2 transition-all duration-200"
          :class="route.path === item.to ? 'bg-primary! text-white!' : ''"
        >
          <router-link :to="item.to">
            <component :is="item.icon" class="size-5 ml-2" />
            {{ item.name }}
          </router-link>
        </Button>
      </div>
    </div>

    <div>
      <Button @click="handleLogout" variant="destructive" class="w-full text-white">
        <LogOut :size="20" />
        ĐĂNG XUẤT
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter, useRoute } from "vue-router"
import { computed, onMounted, watch } from "vue"
import { useAuthStore } from "@/stores/auth"
import { useUserStore } from "@/stores/user"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LogOut } from "lucide-vue-next"
import { toastSuccess, toastError } from "@/utils/toast"

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
        name: child.meta?.title as string,
        to: "/dashboard/" + child.path,
        icon: child.meta?.icon,
      }))
  }
  return []
})

const handleLogout = async (): Promise<void> => {
  try {
    await authStore.logout()
    toastSuccess("Đăng xuất thành công!")
    router.push("/login")
  } catch (error) {
    toastError("Đăng xuất thất bại!")
    console.error(error)
  }
}

// Sử dụng computed để tự động cập nhật khi userStore.userInfo thay đổi
const userEmail = computed(() => {
  return userStore.userInfo?.email || ""
})

// Hàm load user info
const loadUserInfo = async (): Promise<void> => {
  if (authStore.isAuthenticated && authStore.accessToken) {
    // Load lại user info nếu chưa có
    if (!userStore.userInfo) {
      try {
        await userStore.getInfo()
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
watch(
  () => authStore.isAuthenticated,
  (isAuthenticated: boolean) => {
    if (isAuthenticated) {
      loadUserInfo()
    }
  }
)
</script>
