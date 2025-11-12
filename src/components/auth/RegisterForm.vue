<template>
  <form @submit.prevent="handleSubmit" class="flex flex-col gap-2">
    <input v-model="username" type="text" placeholder="Username" class="border px-3 py-2 rounded" required />
    <input v-model="email" type="email" placeholder="Email" class="border px-3 py-2 rounded" required />
    <input v-model="password" type="password" placeholder="Mật khẩu" class="border px-3 py-2 rounded" required />

    <!-- Button đăng ký -->
    <button type="submit" :disabled="isLoading || isSendingOtp"
      class="bg-green-700 text-white py-2 rounded mt-2 hover:bg-green-600 hover:cursor-pointer transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed">
      {{ isLoading ? 'ĐANG XỬ LÝ...' : isSendingOtp ? 'ĐANG GỬI MÃ OTP...' : 'ĐĂNG KÝ' }}
    </button>

    <div v-if="errorMessage" class="text-red-600 text-sm text-center mt-2">
      {{ errorMessage }}
    </div>

    <div class="flex items-center justify-center gap-2 w-full">
      <span class="text-black">Đã có tài khoản?</span>
      <router-link to="/login" class="text-blue-700 hover:text-blue-700/80 text font-bold"> ĐĂNG NHẬP</router-link>
    </div>
  </form>
</template>

<script setup>
import { ref } from "vue"
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

defineProps({
  isLoading: {
    type: Boolean,
    default: false,
  },
  errorMessage: {
    type: String,
    default: "",
  },
})

const emit = defineEmits(['register', 'send-otp', 'error'])

const router = useRouter()
const authStore = useAuthStore()

const email = ref("")
const username = ref("")
const password = ref("")
const isSendingOtp = ref(false)

// Validate email
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}


// Gửi OTP
const handleSendOtp = async () => {
  if (!email.value) {
    emit('error', 'Vui lòng nhập email')
    return false
  }

  if (!validateEmail(email.value)) {
    emit('error', 'Email không hợp lệ')
    return false
  }

  isSendingOtp.value = true

  try {
    const response = await authStore.sendOtpToEmail(username.value, email.value, password.value)

    if (response?.data?.success) {
      // Lưu thông tin đăng ký vào sessionStorage
      sessionStorage.setItem('register_email', email.value)
      sessionStorage.setItem('register_username', username.value)
      sessionStorage.setItem('register_password', password.value)
      sessionStorage.setItem('otp_countdown', '60')

      // Redirect đến trang nhập OTP
      router.push({
        name: 'verify-otp',
        query: {
          email: email.value,
          username: username.value,
          password: password.value
        }
      })
      return true
    }
    return false
  } catch (error) {
    const errorMsg = error.response?.data?.message || 'Lỗi khi gửi OTP'
    emit('error', errorMsg)
    return false
  } finally {
    isSendingOtp.value = false
  }
}


// Submit form - Chỉ gửi OTP và redirect
const handleSubmit = async () => {
  // Validate form trước khi gửi OTP
  if (!username.value) {
    emit('error', 'Vui lòng nhập username')
    return
  }

  if (!email.value) {
    emit('error', 'Vui lòng nhập email')
    return
  }

  if (!validateEmail(email.value)) {
    emit('error', 'Email không hợp lệ')
    return
  }

  if (!password.value) {
    emit('error', 'Vui lòng nhập mật khẩu')
    return
  }

  // Gửi OTP và redirect đến trang nhập OTP
  await handleSendOtp()
}
</script>
