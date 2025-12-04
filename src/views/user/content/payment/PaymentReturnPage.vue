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
                        <h3 class="text-2xl font-bold text-green-600 mb-2">
                            {{ isDepositPayment ? 'Đặt cọc thành công!' : 'Thanh toán thành công!' }}
                        </h3>
                        <p class="text-gray-700 mb-1">
                            <span v-if="isDepositPayment">
                                Đơn hàng #{{ orderId }} đã được đặt cọc thành công. Đơn hàng sẽ được xử lý trong thời
                                gian sớm nhất.
                            </span>
                            <span v-else>
                                Đơn hàng #{{ orderId }} của bạn đã được xác nhận
                            </span>
                        </p>
                        <p class="text-sm text-gray-500">Bạn sẽ được chuyển về trang đơn hàng trong giây lát...</p>
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
                        <h3 class="text-2xl font-bold text-red-600 mb-2">
                            {{ isDepositPayment ? 'Đặt cọc thất bại' : 'Thanh toán thất bại' }}
                        </h3>
                        <p class="text-gray-700 mb-4">
                            {{ errorMessage || (isDepositPayment ? 'Vui lòng thử lại đặt cọc hoặc liên hệ với cửa hàng'
                                : 'Vui lòng thử lại hoặc chọn phương thức thanh toán khác') }}
                        </p>
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
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { CheckCircle, XCircle } from 'lucide-vue-next'
import { usePaymentMethodStore } from '@/stores/payment-methods'
import { usePaymentStore } from '@/stores/payments'
import { useOrderStore } from '@/stores/orders'

const router = useRouter()
const route = useRoute()
const paymentMethodStore = usePaymentMethodStore()
const paymentStore = usePaymentStore()
const orderStore = useOrderStore()

const status = ref('loading')
const orderId = ref(null)
const errorMessage = ref('')
const isDepositPayment = ref(false)

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

    // Kiểm tra nếu là deposit payment (orderId dạng DEPOSIT_xxx)
    isDepositPayment.value = typeof orderIdParam === 'string' && orderIdParam.startsWith('DEPOSIT_')
    let actualOrderId = null

    if (isDepositPayment.value) {
        // Lấy orderId thực từ DEPOSIT_orderId
        const match = orderIdParam.match(/DEPOSIT_(\d+)/)
        actualOrderId = match ? parseInt(match[1]) : null

        // Lấy orderId thực từ sessionStorage nếu có
        const depositOrderId = sessionStorage.getItem('deposit_order_id')
        if (depositOrderId) {
            actualOrderId = parseInt(depositOrderId)
        }

        console.log('🔔 Deposit payment detected. DEPOSIT ID:', orderIdParam, 'Actual order ID:', actualOrderId)
    } else {
        // Parse orderId bình thường
        actualOrderId = orderIdParam ? parseInt(orderIdParam) : null
    }

    // Parse orderId
    orderId.value = actualOrderId

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
        // Thanh toán thành công - cập nhật payment/deposit status
        if (orderId.value) {
            if (isDepositPayment.value) {
                // Xử lý deposit payment - reload order để cập nhật deposit status
                try {
                    await orderStore.getOrderByIdStore(orderId.value)
                    console.log('✅ Deposit payment successful, order reloaded')

                    // Cập nhật trạng thái đơn hàng thành CONFIRMED sau khi đặt cọc thành công
                    await confirmOrderStatus()
                    console.log('✅ Order status updated to CONFIRMED after successful deposit payment')
                } catch (error) {
                    console.error('Error reloading order after deposit payment:', error)
                }
            } else {
                // Xử lý payment thông thường
                await updatePaymentStatus()
                await confirmOrderStatus()
            }
        }

        // Xóa flags MoMo payment và deposit payment sau khi thanh toán thành công
        sessionStorage.removeItem('momo_payment_order_id')
        sessionStorage.removeItem('momo_payment_timestamp')
        sessionStorage.removeItem('deposit_order_id')

        // Lưu flag để ngăn user back về trang thanh toán
        sessionStorage.setItem('order_completed', 'true')
        sessionStorage.setItem('completed_order_id', orderId.value.toString())

        status.value = 'success'

        // Redirect về trang đơn hàng sau 2 giây (để user có thể thấy thông báo thành công)
        setTimeout(() => {
            router.push('/orders-page')
        }, 2000)
    } else {
        // Thanh toán thất bại hoặc bị hủy - ĐẢM BẢO đơn hàng bị hủy và payment status FAILED
        // Xử lý cả trường hợp resultCode là null/undefined (user quay lại mà không có callback)
        // Áp dụng cho cả deposit payment và payment thông thường
        const paymentType = isDepositPayment.value ? 'ĐẶT CỌC' : 'THANH TOÁN'
        console.log(`⚠️ ${paymentType} thất bại hoặc bị hủy, bắt đầu hủy đơn hàng:`, orderId.value)

        if (orderId.value) {
            let orderCancelled = false
            let paymentUpdated = false

            // Bước 1: Cập nhật trạng thái đơn hàng thành CANCELLED (QUAN TRỌNG NHẤT)
            // Áp dụng cho cả deposit payment và payment thông thường
            try {
                console.log(`🔄 [BẮT BUỘC] Đang hủy đơn hàng do ${paymentType} thất bại (CANCELLED):`, orderId.value)
                const cancelResponse = await orderStore.cancelOrderStore(orderId.value)
                console.log('Response từ cancelOrderStore:', cancelResponse)

                if (cancelResponse?.data?.success) {
                    orderCancelled = true
                    console.log('✅ Đã hủy đơn hàng thành công:', orderId.value)
                } else {
                    console.warn('⚠️ Hủy đơn hàng không thành công, thử lại với updateOrderStatusStore:', cancelResponse?.data)
                    // Thử lại với updateOrderStatusStore nếu cancelOrderStore không thành công
                    try {
                        await orderStore.updateOrderStatusStore(orderId.value, 'CANCELLED')
                        orderCancelled = true
                        console.log('✅ Đã hủy đơn hàng thành công (lần thử 2):', orderId.value)
                    } catch (retryError) {
                        console.error('❌ Thử lại hủy đơn hàng cũng thất bại:', retryError)
                    }
                }
            } catch (cancelError) {
                console.error('❌ Lỗi khi hủy đơn hàng, thử lại với updateOrderStatusStore:', cancelError)
                // Thử lại với updateOrderStatusStore nếu có lỗi
                try {
                    await orderStore.updateOrderStatusStore(orderId.value, 'CANCELLED')
                    orderCancelled = true
                    console.log('✅ Đã hủy đơn hàng thành công (retry):', orderId.value)
                } catch (retryError) {
                    console.error('❌ Không thể hủy đơn hàng sau nhiều lần thử:', retryError)
                    console.error('Chi tiết lỗi:', retryError.response?.data || retryError.message)
                }
            }

            // Bước 2: Cập nhật payment status thành FAILED (quan trọng nhưng không block)
            try {
                console.log('💳 Đang cập nhật payment status thành FAILED:', orderId.value)
                const paymentResponse = await paymentStore.getPaymentByOrderIdStore(orderId.value)
                if (paymentResponse?.data?.success && paymentResponse?.data?.data) {
                    const payment = paymentResponse.data.data
                    // Xử lý cả trường hợp array và object
                    const paymentData = Array.isArray(payment) ? payment[0] : payment
                    const paymentId = paymentData?.payment_id || paymentData?.id || paymentData?.paymentId

                    if (paymentId) {
                        console.log('💳 Đang cập nhật payment status thành FAILED:', paymentId)
                        await paymentStore.updatePaymentStatusStore(paymentId, 'FAILED')
                        paymentUpdated = true
                        console.log('✅ Đã cập nhật payment status thành FAILED')
                    } else {
                        console.warn('⚠️ Không tìm thấy payment_id trong payment object:', paymentData)
                    }
                } else {
                    console.warn('⚠️ Không tìm thấy payment cho order:', orderId.value)
                }
            } catch (paymentError) {
                console.error('❌ Lỗi khi cập nhật payment status (không block):', paymentError)
                // Không throw error vì payment status không quan trọng bằng order status
            }

            // Log kết quả cuối cùng
            if (orderCancelled) {
                console.log('✅ Đã xử lý xong: Đơn hàng đã được hủy (CANCELLED)')
                if (paymentUpdated) {
                    console.log('✅ Payment status cũng đã được cập nhật thành FAILED')
                }
            } else {
                console.error('❌ CẢNH BÁO: Không thể hủy đơn hàng sau nhiều lần thử. Đơn hàng có thể vẫn còn tồn tại.')
            }
        } else {
            console.warn('⚠️ Không có orderId để xử lý hủy đơn hàng')
        }

        // Xóa flags MoMo payment sau khi xử lý
        sessionStorage.removeItem('momo_payment_order_id')
        sessionStorage.removeItem('momo_payment_timestamp')
        sessionStorage.removeItem('deposit_order_id')

        status.value = 'failed'
        errorMessage.value = message || 'Thanh toán không thành công. Đơn hàng đã được hủy.'
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
