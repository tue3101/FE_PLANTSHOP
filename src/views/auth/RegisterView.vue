<template>
  <div
    class="flex min-h-screen items-center justify-center"
    :style="{
      backgroundImage: 'url(/img/background_navbar.png)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }"
  >
    <Card class="w-[600px] shadow-lg">
      <CardHeader>
        <CardTitle class="text-center">ĐĂNG KÝ</CardTitle>
      </CardHeader>
      <CardContent>
        <RegisterForm
          :isLoading="isLoading"
          :errorMessage="errorMessage"
          @register="handleRegister"
          @error="handleError"
        />
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from "@/stores/auth"
import { useRouter } from "vue-router"
import { useAsyncOperation } from "@/composables/useAsyncOperation"
import RegisterForm from "@/components/auth/RegisterForm.vue"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { AxiosError } from "axios"

interface RegisterCredentials {
  email: string
  username: string
  password: string
  otpCode: string
}

interface ApiError extends AxiosError {
  response?: {
    status?: number
    data?: {
      message?: string
    }
  }
}

const router = useRouter()
const authStore = useAuthStore()

const { isLoading, errorMessage, executeAsync } = useAsyncOperation()

const handleError = (errorMsg: string): void => {
  errorMessage.value = errorMsg
}

const handleRegister = async (credentials: RegisterCredentials): Promise<void> => {
  await executeAsync(
    async () => {
      const response = await authStore.registerUsers(
        credentials.email,
        credentials.username,
        credentials.password,
        credentials.otpCode
      )
      console.log(response)

      if (response && response.data?.success !== false) {
        router.push("/login")
      }
    },
    {
      defaultErrorMessage: "Đăng ký thất bại!",
      onError: (error: unknown) => {
        const apiError = error as ApiError
        if (apiError.response?.status === 403) {
          errorMessage.value =
            apiError.response?.data?.message ||
            "Mã OTP không hợp lệ hoặc đã hết hạn. Vui lòng gửi lại mã OTP."
        } else if (apiError.response?.status === 1003) {
          errorMessage.value = apiError.response?.data?.message || "Email đã được đăng ký"
        } else {
          errorMessage.value =
            apiError.response?.data?.message ||
            (apiError instanceof Error ? apiError.message : "Đăng ký thất bại!")
        }
      },
    }
  )
}
</script>
