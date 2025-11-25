<template>
    <div class="min-h-screen bg-gray-50 py-8">
        <div class="container mx-auto px-4 max-w-2xl">
            <div class="bg-white rounded-lg shadow-lg p-8 text-center">
                <!-- Loading State -->
                <div v-if="status === 'loading'" class="py-12">
                    <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4">
                    </div>
                    <h3 class="text-xl font-semibold text-gray-800 mb-2">Đang xử lý...</h3>
                    <p class="text-gray-600">Vui lòng đợi trong giây lát</p>
                </div>

                <!-- Success State -->
                <div v-else-if="status === 'success'" class="py-12">
                    <div class="mb-6">
                        <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                            <CheckCircle :size="48" class="text-green-600" />
                        </div>
                        <h3 class="text-2xl font-bold text-green-600 mb-2">Thanh toán thành công!</h3>
                        <p class="text-gray-700 mb-1">Đơn hàng #{{ orderId }} của bạn đã được xác nhận</p>
                        <p class="text-sm text-gray-500">Bạn sẽ được chuyển về trang đơn hàng sau {{ countdown }}
                            giây...</p>
                    </div>
                    <div class="flex gap-4 justify-center">
                        <button @click="goToOrders"
                            class="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
                            Xem đơn hàng ngay
                        </button>
                        <button @click="goToHome"
                            class="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-semibold transition-colors">
                            Về trang chủ
                        </button>
                    </div>
                </div>

                <!-- Failed State -->
                <div v-else-if="status === 'failed'" class="py-12">
                    <div class="mb-6">
                        <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
                            <XCircle :size="48" class="text-red-600" />
                        </div>
                        <h3 class="text-2xl font-bold text-red-600 mb-2">Thanh toán thất bại</h3>
                        <p class="text-gray-700 mb-4">
                            {{ errorMessage || 'Vui lòng thử lại hoặc chọn phương thức thanh toán khác' }}</p>
                    </div>
                    <div class="flex gap-4 justify-center">
                        <button @click="goToCart"
                            class="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
                            Quay lại giỏ hàng
                        </button>
                        <button @click="goToHome"
                            class="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-semibold transition-colors">
                            Về trang chủ
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { CheckCircle, XCircle } from 'lucide-vue-next'
import { usePaymentMethodStore } from '@/stores/payment-methods'
import { usePaymentStore } from '@/stores/payments'
import { useOrderStore } from '@/stores/orders'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const paymentMethodStore = usePaymentMethodStore()
const paymentStore = usePaymentStore()
const orderStore = useOrderStore()
const authStore = useAuthStore()

const status = ref('loading')
const orderId = ref(null)
const errorMessage = ref('')
const countdown = ref(5)
let countdownTimer = null

// Cập nhật payment status thành SUCCESS sau khi thanh toán thành công
const updatePaymentStatus = async () => {
    try {
        if (!orderId.value) return

        // Load payment methods trước
        await paymentMethodStore.getAllPaymentMethods()

        // Lấy amount từ query hoặc từ order
        let amount = route.query.amount ? parseFloat(route.query.amount) : null

        // Nếu không có amount trong query, lấy từ order
        if (!amount) {
            try {
                const orderResponse = await orderStore.getOrderByIdStore(orderId.value)
                if (orderResponse.data.success && orderResponse.data.data) {
                    amount = orderResponse.data.data.final_total || orderResponse.data.data.total
                }
            } catch (orderError) {
                console.error('Error getting order:', orderError)
            }
        }

        if (!amount) {
            console.warn('Không thể lấy amount, không thể cập nhật payment')
            return
        }

        // Cập nhật payment với status SUCCESS (chỉ update, không tạo mới)
        // Payment đã được tạo khi tạo đơn, chỉ cần update status
        try {
            const paymentResponse = await paymentStore.getPaymentByOrderIdStore(orderId.value)
            if (paymentResponse.data.success && paymentResponse.data.data) {
                const payment = paymentResponse.data.data
                console.log('Payment object structure:', payment)

                // Thử nhiều cách để lấy payment_id
                const paymentId = payment.payment_id ||
                    payment.id ||
                    payment.paymentId ||
                    payment.paymentId ||
                    (typeof payment === 'number' ? payment : null)

                if (paymentId) {
                    console.log('Updating existing payment status to SUCCESS:', paymentId)
                    await paymentStore.updatePaymentStatusStore(paymentId, 'SUCCESS')
                } else {
                    console.warn('Payment exists but no payment_id found. Payment object:', payment)
                }
            } else {
                console.warn('Payment not found for order, cannot update')
            }
        } catch (paymentError) {
            console.error('Error updating payment status:', paymentError)
            // Không throw error vì thanh toán đã thành công
        }
    } catch (error) {
        console.error('Error updating payment status:', error)
        // Không throw error vì đây chỉ là cập nhật, thanh toán đã thành công
    }
}

// Cập nhật trạng thái đơn hàng thành CONFIRMED sau khi thanh toán thành công
const confirmOrderStatus = async () => {
    try {
        if (!orderId.value) return

        const orderResponse = await orderStore.getOrderByIdStore(orderId.value)
        if (orderResponse?.data?.success && orderResponse?.data?.data) {
            const currentStatus = orderResponse.data.data.status
            if (currentStatus !== 'CONFIRMED') {
                await orderStore.updateOrderStatusStore(orderId.value, 'CONFIRMED')
            }
        }
    } catch (error) {
        console.error('Error confirming order status after payment:', error)
    }
}

onMounted(async () => {
    // Lấy query params từ URL (MoMo sẽ redirect về với các params này)
    const orderIdParam = route.query.orderId
    const resultCodeParam = route.query.resultCode
    const messageParam = route.query.message

    // Parse orderId
    orderId.value = orderIdParam ? parseInt(orderIdParam) : null

    // Parse resultCode (có thể là string hoặc number)
    let resultCode = resultCodeParam ? (typeof resultCodeParam === 'string' ? parseInt(resultCodeParam) : resultCodeParam) : null

    // Decode message nếu có
    let message = messageParam || null
    if (message) {
        try {
            message = decodeURIComponent(message)
        } catch (e) {
            // Nếu không decode được, giữ nguyên
            console.warn('Could not decode message:', e)
        }
    }

    // Nếu không có thông tin, redirect về trang chủ sau 3 giây
    if (!orderId.value) {
        status.value = 'failed'
        errorMessage.value = 'Không tìm thấy thông tin đơn hàng'
        setTimeout(() => {
            goToHome()
        }, 3000)
        return
    }

    // Xử lý kết quả thanh toán
    // resultCode === 0 hoặc '0' nghĩa là thanh toán thành công
    // Nếu resultCode là null/undefined hoặc khác 0, nghĩa là thanh toán thất bại hoặc bị hủy
    console.log('PaymentReturnPage - orderId:', orderId.value, 'resultCode:', resultCode, 'message:', message)
    console.log('🔍 Kiểm tra: resultCode === 0?', resultCode === 0, 'resultCode === "0"?', resultCode === '0')

    // Nếu không có resultCode, có thể user quay về trực tiếp từ web payment (hủy thanh toán)
    if (resultCode === null || resultCode === undefined) {
        console.log('⚠️ Không có resultCode - User có thể đã hủy thanh toán trên web MoMo')
        // Xử lý như thanh toán thất bại - set resultCode = -1 để trigger logic xóa đơn hàng
        resultCode = -1
    }

    if (resultCode === 0 || resultCode === '0') {
        // Thanh toán thành công - cập nhật payment status
        if (orderId.value) {
            await updatePaymentStatus()
            await confirmOrderStatus()
        }

        // Xóa flags MoMo payment sau khi thanh toán thành công
        sessionStorage.removeItem('momo_payment_order_id')
        sessionStorage.removeItem('momo_payment_timestamp')

        // Lưu flag để ngăn user back về trang thanh toán
        sessionStorage.setItem('order_completed', 'true')
        sessionStorage.setItem('completed_order_id', orderId.value.toString())

        status.value = 'success'

        // Bắt đầu countdown
        countdownTimer = setInterval(() => {
            countdown.value--
            if (countdown.value <= 0) {
                clearInterval(countdownTimer)
                goToOrders()
            }
        }, 1000)
    } else {
        // Thanh toán thất bại hoặc bị hủy - cập nhật trạng thái CANCELLED và payment status FAILED
        // Xử lý cả trường hợp resultCode là null/undefined (user quay lại mà không có callback)
        console.log('Thanh toán thất bại hoặc bị hủy, bắt đầu cập nhật trạng thái CANCELLED và payment FAILED:', orderId.value)

        if (orderId.value) {
            // Bước 1: Cập nhật trạng thái đơn hàng thành CANCELLED
            try {
                console.log('🔄 Đang cập nhật trạng thái đơn hàng thành CANCELLED:', orderId.value)
                const cancelResponse = await orderStore.cancelOrderStore(orderId.value)
                console.log('Response từ cancelOrderStore:', cancelResponse)

                if (cancelResponse?.data?.success) {
                    console.log('✅ Đã cập nhật trạng thái đơn hàng thành CANCELLED:', orderId.value)
                } else {
                    console.warn('⚠️ Cập nhật trạng thái CANCELLED không thành công:', cancelResponse?.data)
                }
            } catch (cancelError) {
                console.error('❌ Lỗi khi cập nhật trạng thái CANCELLED:', cancelError)
                console.log('Chi tiết lỗi:', cancelError.response?.data || cancelError.message)
            }

            // Bước 2: Cập nhật payment status thành FAILED
            try {
                console.log('💳 Đang lấy payment để cập nhật status thành FAILED:', orderId.value)
                const paymentResponse = await paymentStore.getPaymentByOrderIdStore(orderId.value)
                if (paymentResponse?.data?.success && paymentResponse?.data?.data) {
                    const payment = paymentResponse.data.data
                    const paymentId = payment.payment_id || payment.id || payment.paymentId

                    if (paymentId) {
                        console.log('💳 Đang cập nhật payment status thành FAILED:', paymentId)
                        await paymentStore.updatePaymentStatusStore(paymentId, 'FAILED')
                        console.log('✅ Đã cập nhật payment status thành FAILED')
                    } else {
                        console.warn('⚠️ Không tìm thấy payment_id trong payment object')
                    }
                } else {
                    console.warn('⚠️ Không tìm thấy payment cho order:', orderId.value)
                }
            } catch (paymentError) {
                console.error('❌ Lỗi khi cập nhật payment status:', paymentError)
            }

            console.log('✅ Đã xử lý xong: cập nhật trạng thái CANCELLED và payment FAILED')
        } else {
            console.warn('⚠️ Không có orderId để xử lý')
        }

        // Xóa flags MoMo payment sau khi xử lý
        sessionStorage.removeItem('momo_payment_order_id')
        sessionStorage.removeItem('momo_payment_timestamp')

        status.value = 'failed'
        errorMessage.value = message || 'Thanh toán không thành công. Đơn hàng đã được hủy.'
    }
})

onUnmounted(() => {
    if (countdownTimer) {
        clearInterval(countdownTimer)
    }
})

const goToOrders = () => {
    router.push('/orders-page')
}

const goToCart = () => {
    router.push('/cart')
}

const goToHome = () => {
    router.push('/home')
}
</script>
