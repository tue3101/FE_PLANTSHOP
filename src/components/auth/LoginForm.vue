<template>
  <form @submit.prevent="handleSubmit" class="flex flex-col gap-2">
    <input v-model="email" type="email" placeholder="Email" class="border px-3 py-2 rounded" required />
    <input v-model="password" type="password" placeholder="Mật khẩu" class="border px-3 py-2 rounded" required />
    <div>
      <router-link to="/forgot-password"
        class="text-xs mt-2 inline-block hover:text-green-700 hover:cursor-pointer transition-colors">
        Quên mật khẩu?
      </router-link>
    </div>
    <button type="submit" :disabled="isLoading"
      class="bg-green-700 text-white py-2 rounded mt-2 hover:bg-green-600 hover:cursor-pointer transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed">
      {{ isLoading ? 'ĐANG XỬ LÝ...' : 'ĐĂNG NHẬP' }}
    </button>
    <div v-if="errorMessage" class="text-red-500 text-sm text-center mt-2">
      {{ errorMessage }}
    </div>
    <div class="flex items-center justify-center gap-2 mt-2 w-full">
      <span class="text-black">HOẶC VỚI</span>
      <button type="button" @click="handleGoogleLogin" :disabled="isLoading"
        class="w-10 h-10 bg-white rounded-full hover:cursor-pointer hover:scale-110 transition-transform disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center">
        <img src="/img/google.png" alt="Google" class="w-full h-full rounded-full" />
      </button>
    </div>
  </form>
</template>

<script setup>
import { ref } from 'vue'

// Props từ component cha 
defineProps({
  isLoading: {
    type: Boolean,
    default: false
  },
  errorMessage: {
    type: String,
    default: ''
  }
})

// Emit events cho component cha
const emit = defineEmits(['login', 'google-login'])

// Local state cho form 
const email = ref('')
const password = ref('')

// Xử lý submit form
const handleSubmit = () => {
  emit('login', {
    email: email.value,
    password: password.value
  })
}

// Xử lý Google login
const handleGoogleLogin = () => {
  emit('google-login')
}
</script>
