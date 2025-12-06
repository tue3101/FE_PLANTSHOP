<template>
  <form @submit.prevent="handleSubmit" class="flex flex-col gap-4">
    <div class="space-y-2">
      <Label for="username">Username</Label>
      <Input
        id="username"
        v-model="username"
        type="text"
        placeholder="Username"
        required
        :disabled="isSendingOtp"
      />
    </div>

    <div class="space-y-2">
      <Label for="email">Email</Label>
      <Input
        id="email"
        v-model="email"
        type="email"
        placeholder="Email"
        required
        :disabled="isSendingOtp"
      />
    </div>

    <div class="space-y-2">
      <Label for="password">Mật khẩu</Label>
      <Input
        id="password"
        v-model="password"
        type="password"
        placeholder="Mật khẩu"
        required
        :disabled="isSendingOtp"
      />
    </div>

    <Button type="submit" :disabled="isSendingOtp" class="w-full">
      <Loader v-if="isSendingOtp" :size="16" class="animate-spin" />
      {{ isSendingOtp ? "ĐANG XỬ LÝ..." : "ĐĂNG KÝ" }}
    </Button>

    <Alert v-if="errorMessage" variant="destructive">
      <AlertDescription class="text-sm text-center">
        {{ errorMessage }}
      </AlertDescription>
    </Alert>

    <div class="flex items-center justify-center gap-2 w-full mt-2">
      <span class="text-sm text-muted-foreground">Đã có tài khoản?</span>
      <router-link
        to="/login"
        class="text-sm font-semibold text-primary hover:text-primary/80 hover:underline transition-colors"
      >
        ĐĂNG NHẬP
      </router-link>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref } from "vue"
import { useRouter } from "vue-router"
import { useAuthStore } from "@/stores/auth"
import type { AxiosError } from "axios"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader } from "lucide-vue-next"

interface Props {
  isLoading?: boolean
  errorMessage?: string
}

interface ApiError extends AxiosError {
  response?: {
    data?: {
      message?: string
    }
  }
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: true,
  errorMessage: "",
})

const emit = defineEmits<{
  register: []
  "send-otp": []
  error: [message: string]
}>()

const router = useRouter()
const authStore = useAuthStore()

const email = ref<string>("")
const username = ref<string>("")
const password = ref<string>("")
const isSendingOtp = ref<boolean>(false)

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const handleSendOtp = async (): Promise<boolean> => {
  if (!email.value) {
    emit("error", "Vui lòng nhập email")
    return false
  }

  if (!validateEmail(email.value)) {
    emit("error", "Email không hợp lệ")
    return false
  }

  isSendingOtp.value = true

  try {
    const response = await authStore.sendOtpToEmail(username.value, email.value, password.value)

    if (response?.data?.success) {
      sessionStorage.setItem("register_email", email.value)
      sessionStorage.setItem("register_username", username.value)
      sessionStorage.setItem("register_password", password.value)
      sessionStorage.setItem("otp_countdown", "30")

      router.push({
        name: "verify-otp",
        query: {
          email: email.value,
          username: username.value,
          password: password.value,
        },
      })
      return true
    }
    return false
  } catch (error) {
    const apiError = error as ApiError
    const errorMsg = apiError.response?.data?.message || "Lỗi khi gửi OTP"
    emit("error", errorMsg)
    return false
  } finally {
    isSendingOtp.value = false
  }
}

const handleSubmit = async (): Promise<void> => {
  if (!username.value) {
    emit("error", "Vui lòng nhập username")
    return
  }

  if (!email.value) {
    emit("error", "Vui lòng nhập email")
    return
  }

  if (!validateEmail(email.value)) {
    emit("error", "Email không hợp lệ")
    return
  }

  if (!password.value) {
    emit("error", "Vui lòng nhập mật khẩu")
    return
  }

  await handleSendOtp()
}
</script>
