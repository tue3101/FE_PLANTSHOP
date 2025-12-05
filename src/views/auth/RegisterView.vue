<template>
  <div
    class="flex min-h-screen items-center justify-center"
    :style="{
      backgroundImage: 'url(/img/background_navbar.png)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }"
  >
    <div class="flex w-[600px] h-auto shadow-lg rounded-2xl overflow-hidden">
      <div class="flex-1 bg-white p-6 relative item">
        <h2 class="text-black text-xl font-bold mb-4 text-center">ĐĂNG KÝ</h2>

        <RegisterForm
          :isLoading="isLoading"
          :errorMessage="errorMessage"
          @register="handleRegister"
          @error="handleError"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from "@/stores/auth"
import { useRouter } from "vue-router"
import { useAsyncOperation } from "@/composables/useAsyncOperation"
import RegisterForm from "@/components/auth/RegisterForm.vue"

const router = useRouter()
const authStore = useAuthStore()

const { isLoading, errorMessage, executeAsync } = useAsyncOperation()

const handleError = (errorMsg) => {
  errorMessage.value = errorMsg
}

const handleRegister = async (credentials) => {
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
      onError: (error) => {
        // Xử lý các lỗi cụ thể
        if (error.response?.status === 403) {
          errorMessage.value =
            error.response?.data?.message ||
            "Mã OTP không hợp lệ hoặc đã hết hạn. Vui lòng gửi lại mã OTP."
        } else if (error.response?.status === 1003) {
          errorMessage.value = error.response?.data?.message || "Email đã được đăng ký"
        } else {
          errorMessage.value = error.response?.data?.message || error.message || "Đăng ký thất bại!"
        }
      },
    }
  )
}
</script>
