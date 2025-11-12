<template>
  <div class="flex min-h-screen items-center justify-center bg-gray-100">
    <div class="text-center">
      <div v-if="isLoading" class="mb-4">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        <p class="mt-4 text-gray-600">Đang xử lý đăng nhập Google...</p>
      </div>
      <div v-if="errorMessage" class="text-red-600">
        <p class="text-lg font-semibold mb-2">Có lỗi xảy ra!</p>
        <p>{{ errorMessage }}</p>
        <router-link to="/login" class="mt-4 inline-block text-blue-600 hover:underline">
          Quay lại trang đăng nhập
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useAsyncOperation } from '@/composables/useAsyncOperation'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const { isLoading, errorMessage, executeAsync } = useAsyncOperation()

onMounted(async () => {
  const code = route.query.code
  const error = route.query.error

  // Nếu có lỗi từ Google
  if (error) {
    const errorDescription = route.query.error_description || ''
    errorMessage.value = `Đăng nhập Google bị từ chối: ${error}${errorDescription ? ' - ' + errorDescription : ''}`
    console.error('Google OAuth error:', error, route.query)
    setTimeout(() => {
      router.push('/login')
    }, 5000)
    return
  }

  // Nếu không có code
  if (!code) {
    errorMessage.value = 'Không nhận được mã xác thực từ Google.'
    setTimeout(() => {
      router.push('/login')
    }, 3000)
    return
  }

  // Gửi code lên backend để exchange lấy token
  await executeAsync(
    async () => {
      console.log('Google callback - Code received:', code)
      
      // Backend sẽ exchange code lấy Google access token và tạo JWT
      const response = await authStore.loginWithGoogle(code)
      
      console.log('Google login successful, response:', response.data)
      
      const role = authStore.userRole
      const returnUrl = sessionStorage.getItem('returnUrl') || '/'
      sessionStorage.removeItem('returnUrl')

      // Redirect theo role
      if (role === 'ADMIN') {
        router.push('/dashboard')
      } else {
        router.push(returnUrl)
      }
    },
    {
      defaultErrorMessage: 'Đăng nhập Google thất bại!'
    }
  )
})
</script>

