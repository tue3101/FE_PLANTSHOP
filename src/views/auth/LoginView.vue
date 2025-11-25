<template>
  <div class="flex min-h-screen items-center justify-center bg-gray-100" :style="{
    backgroundImage: 'url(/img/background_navbar.png)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  }">
    <div class="flex w-[700px] h-[350px] shadow-lg rounded-2xl overflow-hidden">

      <div class="flex-1 bg-green-500 flex flex-col items-center justify-center p-6">
        <h2 class="text-white text-xl font-bold mb-2">ĐĂNG KÝ TÀI KHOẢN</h2>
        <p class="text-white text-sm mb-4">BẠN CHƯA CÓ TÀI KHOẢN ? TẠO MỚI!</p>
        <router-link to="/register"
          class="border border-white text-white px-6 py-1 rounded mb-2 hover:bg-green-700 hover:cursor-pointer transition-colors block text-center">ĐĂNG
          KÝ</router-link>
      </div>

      <div class="flex-1 bg-white p-6 relative">
        <h2 class="text-black text-xl font-bold mb-4 text-center">ĐĂNG NHẬP</h2>

        <LoginForm :isLoading="isLoading" :errorMessage="errorMessage" @login="handleLogin"
          @google-login="handleGoogleLogin" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useAsyncOperation } from '@/composables/useAsyncOperation'
import LoginForm from '@/components/auth/LoginForm.vue'

const router = useRouter()
const authStore = useAuthStore()


const { isLoading, errorMessage, executeAsync } = useAsyncOperation()

const handleLogin = async (credentials) => {
  await executeAsync(
    async () => {
      await authStore.loginUsers(credentials.email, credentials.password)

      const role = authStore.userRole
      console.log('User role after login:', role)

      if (role === 'ADMIN') {
        router.push('/dashboard')
      } else {
        router.push('/')
      }
    },
    {
      defaultErrorMessage: 'Đăng nhập thất bại!'
    }
  )
}

// Xử lý Google login gửi code cho GoogleCallbackView 
const handleGoogleLogin = async () => {
  try {
    const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID

    // Kiểm tra Client ID
    if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID === 'YOUR_GOOGLE_CLIENT_ID' || GOOGLE_CLIENT_ID === 'YOUR_GOOGLE_CLIENT_ID_HERE') {
      console.error('Google Client ID chưa được cấu hình hoặc chưa được load')
      console.log('Current GOOGLE_CLIENT_ID:', GOOGLE_CLIENT_ID)
      console.log('import.meta.env:', import.meta.env)
      return
    }

    // `${window.location.origin} => tự động lấy domain hiện tại
    //URI gg gửi code về BE để xử lý
    const REDIRECT_URI = `${window.location.origin}/auth/google/callback`
    // const REDIRECT_URI = router.push('/auth/google/callback')

    // Tạo URL cho Google OAuth với các tham số đúng format
    const params = new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline', //be lấy refesh khi fe offline
      prompt: 'consent' //hộp thoại xác nhận lại khi từng login
    })

    //url chọn email login
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`

    // Lưu return URL vào sessionStorage để redirect sau khi login
    // sessionStorage.setItem('returnUrl', router.currentRoute.value.fullPath)

    // Redirect đến Google OAuth chọn email xác nhận
    window.location.href = authUrl
  } catch (error) {
    console.error('Google login error:', error)
    alert('Có lỗi xảy ra khi đăng nhập Google: ' + error.message)
  }
}
</script>
