<template>
  <div
    class="flex min-h-screen items-center justify-center bg-gray-100"
    :style="{
      backgroundImage: 'url(/img/background_navbar.png)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }"
  >
    <div class="flex w-[700px] h-auto shadow-lg rounded-2xl overflow-hidden">
      <Card
        class="flex-1 bg-primary flex flex-col items-center justify-center p-6 rounded-none rounded-l-2xl"
      >
        <CardContent class="flex flex-col items-center p-0">
          <h2 class="text-primary-foreground text-xl font-bold mb-2">ĐĂNG KÝ TÀI KHOẢN</h2>
          <p class="text-primary-foreground/90 text-sm mb-4">BẠN CHƯA CÓ TÀI KHOẢN ? TẠO MỚI!</p>
          <Button as-child variant="outline">
            <router-link to="/register">ĐĂNG KÝ</router-link>
          </Button>
        </CardContent>
      </Card>

      <Card class="flex-1 bg-background p-6 rounded-none rounded-r-2xl">
        <CardHeader>
          <CardTitle class="text-center">ĐĂNG NHẬP</CardTitle>
        </CardHeader>
        <CardContent>
          <LoginForm
            :isLoading="isLoading"
            :errorMessage="errorMessage"
            @login="handleLogin"
            @google-login="handleGoogleLogin"
          />
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router"
import { useAuthStore } from "../../stores/auth"
import { useAsyncOperation } from "../../composables/useAsyncOperation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import LoginForm from "../../components/auth/LoginForm.vue"
import { toastSuccess, toastError } from "@/utils/toast"

interface LoginCredentials {
  email: string
  password: string
}

const router = useRouter()
const authStore = useAuthStore()

const { isLoading, errorMessage, executeAsync } = useAsyncOperation()

const handleLogin = async (credentials: LoginCredentials): Promise<void> => {
  await executeAsync(
    async () => {
      await authStore.loginUsers(credentials.email, credentials.password)

      const role = authStore.userRole
      console.log("User role after login:", role)

      toastSuccess("Đăng nhập thành công!")

      if (role === "ADMIN") {
        router.push("/dashboard")
      } else {
        router.push("/")
      }
    },
    {
      defaultErrorMessage: "Đăng nhập thất bại!",
      onError: (error) => {
        const errorMessage = error?.response?.data?.message || "Đăng nhập thất bại!"
        toastError(errorMessage)
      },
    }
  )
}

const handleGoogleLogin = async (): Promise<void> => {
  try {
    const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID

    if (
      !GOOGLE_CLIENT_ID ||
      GOOGLE_CLIENT_ID === "YOUR_GOOGLE_CLIENT_ID" ||
      GOOGLE_CLIENT_ID === "YOUR_GOOGLE_CLIENT_ID_HERE"
    ) {
      console.error("Google Client ID chưa được cấu hình hoặc chưa được load")
      console.log("Current GOOGLE_CLIENT_ID:", GOOGLE_CLIENT_ID)
      console.log("import.meta.env:", import.meta.env)
      return
    }

    const REDIRECT_URI = `${window.location.origin}/auth/google/callback`

    const params = new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      response_type: "code",
      scope: "openid email profile",
      access_type: "offline",
      prompt: "consent",
    })

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`

    window.location.href = authUrl
  } catch (error) {
    console.error("Google login error:", error)
    const errorMessage =
      error instanceof Error ? error.message : "Có lỗi xảy ra khi đăng nhập Google"
    alert(errorMessage)
  }
}
</script>
