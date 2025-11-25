<template>
    <div class="flex min-h-screen items-center justify-center" :style="{
        backgroundImage: 'url(/img/background_navbar.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
    }">
        <div class="flex w-[500px] h-auto shadow-lg rounded-2xl overflow-hidden">
            <div class="flex-1 bg-white p-6 relative">
                <h2 class="text-black text-xl font-bold mb-4 text-center">NHẬP MÃ OTP</h2>

                <div v-if="!isLoading && !errorMessage" class="flex flex-col gap-4">
                    <div>
                        <p class="text-sm text-gray-600 mb-2">
                            Mã OTP đã được gửi đến <span class="font-semibold">{{ email }}</span>
                        </p>
                        <input v-model="otpCode" type="text" placeholder="Nhập mã OTP (6 chữ số)"
                            class="border px-3 py-2 rounded w-full" maxlength="6" pattern="[0-9]{6}"
                            @input="handleOtpInput" @keyup.enter="handleSubmit" ref="otpInputRef" autofocus />
                    </div>

                    <div class="flex items-center justify-between text-sm">
                        <button type="button" @click="handleResendOtp" :disabled="countdown > 0"
                            class="text-blue-600 hover:text-blue-800 underline disabled:text-gray-400 disabled:no-underline cursor-pointer">
                            {{ countdown > 0 ? `Gửi lại sau ${countdown}s` : 'Gửi lại mã OTP' }}
                        </button>
                        <button type="button" @click="handleBack"
                            class="text-gray-600 hover:text-gray-800 cursor-pointer">
                            Quay lại
                        </button>
                    </div>

                    <button type="button" @click="handleSubmit"
                        :disabled="!otpCode || otpCode.length !== 6 || isLoading"
                        class="bg-green-700 text-white py-2 rounded mt-2 hover:bg-green-600 hover:cursor-pointer transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed">
                        {{ isLoading ? 'ĐANG XỬ LÝ...' : (isAdminMode ? 'XÁC NHẬN' : 'XÁC NHẬN ĐĂNG KÝ')
                        }}
                    </button>
                </div>

                <div v-if="errorMessage" class="text-red-600 text-sm text-center mt-2">
                    {{ errorMessage }}
                    <button type="button" @click="handleBack" class="text-blue-700 hover:text-blue-400 cursor-pointer">
                        Quay lại
                    </button>
                </div>

                <div v-if="isLoading" class="text-center py-8">
                    <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                    <p class="mt-4 text-gray-600">Đang xử lý...</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useAsyncOperation } from '@/composables/useAsyncOperation'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const { isLoading, errorMessage, executeAsync, resetError } = useAsyncOperation()

const email = ref('')
const username = ref('')
const password = ref('')
const role = ref('')
const isAdminMode = ref(false)
const otpCode = ref('')
const countdown = ref(0)
const otpInputRef = ref(null)
let countdownTimer = null

// Validate OTP (6 chữ số)
const validateOtp = (otp) => {
    return /^\d{6}$/.test(otp)
}

// Xử lý input OTP - chỉ cho phép số
const handleOtpInput = (event) => {
    const value = event.target.value.replace(/\D/g, '') // Chỉ giữ lại số
    otpCode.value = value.slice(0, 6) // Giới hạn 6 chữ số
}

// Đảm bảo luôn có đủ thông tin đăng ký trước khi gửi OTP
const ensureRegisterInfo = () => {
    if (email.value && username.value && password.value) {
        return true
    }

    const storedEmail = sessionStorage.getItem('register_email')
    const storedUsername = sessionStorage.getItem('register_username')
    const storedPassword = sessionStorage.getItem('register_password')

    if (storedEmail && storedUsername && storedPassword) {
        email.value = storedEmail
        username.value = storedUsername
        password.value = storedPassword
        return true
    }

    return false
}

// Gửi lại OTP
const handleResendOtp = async () => {
    if (countdown.value > 0) return

    resetError()

    if (!ensureRegisterInfo()) {
        errorMessage.value = 'Không tìm thấy thông tin đăng ký, vui lòng đăng ký lại.'
        router.push('/register')
        return
    }

    const resendUsername = username.value
    const resendEmail = email.value
    const resendPassword = password.value

    await executeAsync(
        async () => {
            const response = await authStore.sendOtpToEmail(resendUsername, resendEmail, resendPassword)
            if (response?.data?.success) {
                countdown.value = 30
                startCountdown()
            }
        },
        {
            defaultErrorMessage: 'Không thể gửi lại mã OTP!'
        }
    )
}

// bắt đầu đếm ngược
const startCountdown = () => {
    if (countdownTimer) {
        clearInterval(countdownTimer) //dừng timer cũ
    }

    countdownTimer = setInterval(() => {
        if (countdown.value > 0) {
            countdown.value--
        } else {
            clearInterval(countdownTimer)
            countdownTimer = null
        }
    }, 1000) // thực thi mỗi 1 giây
}

// Cleanup timer khi component unmount
onUnmounted(() => {
    if (countdownTimer) {
        clearInterval(countdownTimer)
    }
})

// Submit - Đăng ký với OTP
const handleSubmit = async () => {
    if (!otpCode.value) {
        errorMessage.value = 'Vui lòng nhập mã OTP'
        return
    }

    if (!validateOtp(otpCode.value)) {
        errorMessage.value = 'Mã OTP phải là 6 chữ số'
        return
    }

    await executeAsync(
        async () => {
            // Đăng ký với role nếu có (cho admin mode)
            const response = await authStore.registerUsers(
                email.value,
                username.value,
                password.value,
                otpCode.value,
                role.value || null // Truyền role nếu có
            )

            if (response && response.data?.success !== false) {
                // Xóa thông tin đăng ký khỏi sessionStorage
                sessionStorage.removeItem('register_email')
                sessionStorage.removeItem('register_username')
                sessionStorage.removeItem('register_password')
                sessionStorage.removeItem('register_role')
                sessionStorage.removeItem('admin_add_user')

                // Nếu là admin mode, redirect về trang quản lý users
                if (isAdminMode.value) {
                    router.push('/dashboard/users')
                } else {
                    // Redirect về login cho đăng ký thông thường
                    router.push('/login')
                }
            }
        },
        {
            defaultErrorMessage: 'Đăng ký thất bại!',
            onError: (error) => {
                if (error.response?.status === 403) {
                    errorMessage.value = error.response?.data?.message || 'Mã OTP không hợp lệ hoặc đã hết hạn. Vui lòng gửi lại mã OTP.'
                } else if (error.response?.status === 1003) {
                    errorMessage.value = error.response?.data?.message || 'Email đã được đăng ký'
                } else {
                    errorMessage.value = error.response?.data?.message || error.message || 'Đăng ký thất bại!'
                }
            }
        }
    )
}

// Quay lại trang đăng ký hoặc trang admin
const handleBack = () => {
    // Xóa thông tin đăng ký khỏi sessionStorage
    sessionStorage.removeItem('register_email')
    sessionStorage.removeItem('register_username')
    sessionStorage.removeItem('register_password')
    sessionStorage.removeItem('register_role')
    sessionStorage.removeItem('admin_add_user')

    // Nếu là admin mode, quay lại trang quản lý users
    if (isAdminMode.value) {
        router.push('/dashboard/users')
    } else {
        router.push('/register')
    }
}

// Load thông tin từ query params hoặc sessionStorage
onMounted(() => {
    // Kiểm tra mode admin
    isAdminMode.value = route.query.mode === 'admin' || sessionStorage.getItem('admin_add_user') === 'true'

    // Lấy từ query params (nếu có)
    if (route.query.email) {
        email.value = route.query.email
        username.value = route.query.username || ''
        password.value = route.query.password || ''
        role.value = route.query.role || ''
    } else {
        // Lấy từ sessionStorage
        email.value = sessionStorage.getItem('register_email') || ''
        username.value = sessionStorage.getItem('register_username') || ''
        password.value = sessionStorage.getItem('register_password') || ''
        role.value = sessionStorage.getItem('register_role') || ''
    }

    // Nếu không có thông tin, redirect
    if (!email.value) {
        if (isAdminMode.value) {
            router.push('/dashboard/users')
        } else {
            router.push('/register')
        }
        return
    }

    // đợi UI render xong mới focus
    nextTick(() => {
        if (otpInputRef.value) {
            otpInputRef.value.focus() //đưa trỏ chuột vào ô
        }
    })

    // Bắt đầu countdown 
    const savedCountdown = sessionStorage.getItem('otp_countdown')
    if (savedCountdown && parseInt(savedCountdown) > 0) {
        countdown.value = parseInt(savedCountdown)
        startCountdown()
    }
})
</script>
