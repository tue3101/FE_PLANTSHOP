<template>
    <div class="flex min-h-screen items-center justify-center" :style="{
        backgroundImage: 'url(/img/background_navbar.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
    }">
        <div class="flex w-[500px] h-auto shadow-lg rounded-2xl overflow-hidden">
            <div class="flex-1 bg-white p-6 relative">
                <h2 class="text-black text-xl font-bold mb-4 text-center">QUÊN MẬT KHẨU</h2>

                <!-- Nhập email và gửi OTP -->
                <div v-if="!otpSent" class="flex flex-col gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <input v-model="email" type="email" placeholder="Nhập email của bạn"
                            class="border px-3 py-2 rounded w-full" :disabled="isSendingOtp" required />
                    </div>

                    <button type="button" @click="handleSendOtp" :disabled="!email || isSendingOtp"
                        class="bg-green-700 text-white py-2 rounded mt-2 hover:bg-green-600 hover:cursor-pointer transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed">
                        {{ isSendingOtp ? 'ĐANG GỬI MÃ OTP...' : 'GỬI MÃ OTP' }}
                    </button>

                    <div class="flex items-center justify-center">
                        <router-link to="/login" class="text-blue-600 hover:text-blue-800 text-sm">
                            Quay lại đăng nhập
                        </router-link>
                    </div>
                </div>

                <!-- Nhập OTP để xác nhận -->
                <div v-else-if="!otpVerified" class="flex flex-col gap-4">
                    <div>
                        <p class="text-sm text-gray-600 mb-4">
                            Mã OTP đã được gửi đến <span class="font-semibold">{{ email }}</span>
                        </p>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Mã OTP</label>
                        <input v-model="otpCode" type="text" placeholder="Nhập mã OTP (6 chữ số)"
                            class="border px-3 py-2 rounded w-full" maxlength="6" pattern="[0-9]{6}"
                            @input="handleOtpInput" @keyup.enter="handleConfirmOtp" ref="otpInputRef" required />
                    </div>

                    <div class="flex items-center justify-between text-sm">
                        <button type="button" @click="handleResendOtp" :disabled="countdown > 0"
                            class="text-blue-600 hover:text-blue-800 underline disabled:text-gray-400 disabled:no-underline">
                            {{ countdown > 0 ? `Gửi lại sau ${countdown}s` : 'Gửi lại mã OTP' }}
                        </button>
                        <button type="button" @click="handleBack" class="text-gray-600 hover:text-gray-800">
                            Quay lại
                        </button>
                    </div>

                    <button type="button" @click="handleConfirmOtp" :disabled="!otpCode || otpCode.length !== 6"
                        class="bg-green-700 text-white py-2 rounded mt-2 hover:bg-green-600 hover:cursor-pointer transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed">
                        XÁC NHẬN OTP
                    </button>
                </div>

                <!-- Đặt lại mật khẩu mới -->
                <div v-else class="flex flex-col gap-4">
                    <div>
                        <p class="text-sm text-gray-600 mb-4">
                            OTP đã được xác nhận. Vui lòng nhập mật khẩu mới.
                        </p>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Mật khẩu mới</label>
                        <input v-model="newPassword" type="password" placeholder="Nhập mật khẩu mới"
                            class="border px-3 py-2 rounded w-full" @keyup.enter="handleResetPassword"
                            ref="passwordInputRef" required />
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Xác nhận mật khẩu mới</label>
                        <input v-model="confirmPassword" type="password" placeholder="Nhập lại mật khẩu mới"
                            class="border px-3 py-2 rounded w-full" @keyup.enter="handleResetPassword" required />
                    </div>

                    <button type="button" @click="handleResetPassword"
                        :disabled="!newPassword || !confirmPassword || isLoading"
                        class="bg-green-700 text-white py-2 rounded mt-2 hover:bg-green-600 hover:cursor-pointer transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed">
                        {{ isLoading ? 'ĐANG XỬ LÝ...' : 'ĐẶT LẠI MẬT KHẨU' }}
                    </button>
                </div>

                <div v-if="successMessage" class="text-green-600 text-sm text-center mt-4">
                    {{ successMessage }}
                </div>

                <div v-if="errorMessage" class="text-red-600 text-sm text-center mt-2">
                    {{ errorMessage }}
                </div>

                <div v-if="isLoading" class="text-center py-4">
                    <div class="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const otpCode = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const otpSent = ref(false)
const otpVerified = ref(false)
const isSendingOtp = ref(false)
const isLoading = ref(false)
const countdown = ref(0)
const successMessage = ref('')
const errorMessage = ref('')
const otpInputRef = ref(null)
const passwordInputRef = ref(null)
let countdownTimer = null

// Validate email
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
}

// Validate OTP (6 chữ số)
const validateOtp = (otp) => {
    return /^\d{6}$/.test(otp)
}

// Xử lý input OTP - chỉ cho phép số
const handleOtpInput = (event) => {
    const value = event.target.value.replace(/\D/g, '') // Chỉ giữ lại số
    otpCode.value = value.slice(0, 6) // Giới hạn 6 chữ số
}

// Gửi OTP
const handleSendOtp = async () => {
    if (!email.value) {
        errorMessage.value = 'Vui lòng nhập email'
        return
    }

    if (!validateEmail(email.value)) {
        errorMessage.value = 'Email không hợp lệ'
        return
    }

    isSendingOtp.value = true
    errorMessage.value = ''
    successMessage.value = ''

    try {
        const response = await authStore.sendOtpForForgotPasswordStore(email.value)

        if (response?.data?.success) {
            otpSent.value = true
            successMessage.value = 'Đã gửi mã OTP đến email của bạn!'
            countdown.value = 30
            startCountdown()

            // Focus vào input OTP
            await nextTick()
            if (otpInputRef.value) {
                otpInputRef.value.focus()
            }
        }
    } catch (error) {
        const errorMsg = error.response?.data?.message || 'Lỗi khi gửi OTP'
        errorMessage.value = errorMsg
    } finally {
        isSendingOtp.value = false
    }
}

// Gửi lại OTP
const handleResendOtp = async () => {
    if (countdown.value > 0) return

    errorMessage.value = ''
    await handleSendOtp()
}

// Countdown timer
const startCountdown = () => {
    if (countdownTimer) {
        clearInterval(countdownTimer)
    }

    countdownTimer = setInterval(() => {
        if (countdown.value > 0) {
            countdown.value--
        } else {
            clearInterval(countdownTimer)
            countdownTimer = null
        }
    }, 1000)
}

// Cleanup timer khi component unmount
onUnmounted(() => {
    if (countdownTimer) {
        clearInterval(countdownTimer)
    }
})

// Xác nhận OTP (chỉ validate format, không gọi API)
const handleConfirmOtp = () => {
    if (!otpCode.value) {
        errorMessage.value = 'Vui lòng nhập mã OTP'
        return
    }

    if (!validateOtp(otpCode.value)) {
        errorMessage.value = 'Mã OTP phải là 6 chữ số'
        return
    }

    // Chỉ validate format, không gọi API verify
    // OTP sẽ được verify khi reset password
    otpVerified.value = true
    errorMessage.value = ''
    successMessage.value = ''

    // Focus vào input mật khẩu mới
    nextTick(() => {
        if (passwordInputRef.value) {
            passwordInputRef.value.focus()
        }
    })
}

// Reset password
const handleResetPassword = async () => {
    // Validate
    if (!newPassword.value) {
        errorMessage.value = 'Vui lòng nhập mật khẩu mới'
        return
    }

    if (newPassword.value.length < 6) {
        errorMessage.value = 'Mật khẩu phải có ít nhất 6 ký tự'
        return
    }

    if (newPassword.value !== confirmPassword.value) {
        errorMessage.value = 'Mật khẩu xác nhận không khớp'
        return
    }

    isLoading.value = true
    errorMessage.value = ''
    successMessage.value = ''

    try {
        const response = await authStore.resetPasswordWithOtpStore(
            email.value,
            otpCode.value,
            newPassword.value
        )

        if (response?.data?.success) {
            successMessage.value = 'Đặt lại mật khẩu thành công!....'

            // Redirect về login sau 2 giây
            setTimeout(() => {
                router.push('/login')
            }, 2000)
        }
    } catch (error) {
        const errorMsg = error.response?.data?.message || 'Đặt lại mật khẩu thất bại!'
        errorMessage.value = errorMsg
    } finally {
        isLoading.value = false
    }
}

// Quay lại bước trước
const handleBack = () => {
    if (otpVerified.value) {
        // Quay lại bước nhập OTP
        otpVerified.value = false
        otpCode.value = ''
        newPassword.value = ''
        confirmPassword.value = ''
    } else if (otpSent.value) {
        // Quay lại bước nhập email
        otpSent.value = false
        otpCode.value = ''
    }
    errorMessage.value = ''
    successMessage.value = ''
    if (countdownTimer) {
        clearInterval(countdownTimer)
        countdownTimer = null
    }
    countdown.value = 0
}

onMounted(() => {
    // Focus vào input email
    nextTick(() => {
        const emailInput = document.querySelector('input[type="email"]')
        if (emailInput) {
            emailInput.focus()
        }
    })
})
</script>
