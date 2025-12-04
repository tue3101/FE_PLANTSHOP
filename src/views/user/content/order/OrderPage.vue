<template>
    <div class="min-h-screen bg-gray-50 py-8">
        <div class="container mx-auto px-4 max-w-6xl">
            <BackButton />
            <div class="flex items-center justify-between mb-6">
                <h1 class="text-3xl font-bold text-green-700 flex-1 text-center">Đơn hàng của tôi</h1>
                <router-link to="/order-history" class="text-green-700 hover:text-green-500 transition-colors">
                    <History :size="28" />
                </router-link>
            </div>

            <!-- Loading and Error State -->
            <LoadingErrorState :isLoading="isLoading" :errorMessage="errorMessage" loadingMessage="Đang tải đơn hàng..."
                @reset-error="resetError" />

            <!-- Empty State -->
            <div v-if="!isLoading && !errorMessage && displayedOrdersCount === 0"
                class="text-center py-16 bg-white rounded-lg shadow">
                <div class="mb-4">
                    <History class="mx-auto h-24 w-24 text-gray-400" />
                </div>
                <p class="text-xl text-gray-600 mb-4">Bạn chưa có đơn hàng nào</p>
                <router-link to="/product"
                    class="inline-block bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
                    Tiếp tục mua sắm
                </router-link>
            </div>

            <!-- Orders List -->
            <div v-if="!isLoading && !errorMessage && orders.length > 0" class="space-y-4">
                <OrderCard v-for="order in orders" :key="order.order_id" :order="order" :showCancelButton="true"
                    :applyFilter="true" @cancel-order="openCancelModal" />
            </div>
        </div>

        <!-- Cancel Order Confirmation Modal -->
        <div v-if="showCancelModal" class="fixed inset-0  flex items-center justify-center z-50">
            <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                <h3 class="text-lg font-semibold mb-4 text-red-600">Xác nhận hủy đơn hàng</h3>
                <p class="mb-6 text-gray-700">
                    Bạn có chắc chắn muốn hủy đơn hàng <span class="font-bold">#{{
                        selectedOrderForCancel?.order_id }}</span> không?
                </p>
                <div v-if="cancelError" class="mb-4 text-red-600 text-sm ">
                    {{ cancelError }}
                </div>
                <div class="flex justify-end space-x-4">
                    <button @click="closeCancelModal" :disabled="isCancelling"
                        class="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 text-gray-800 font-semibold transition-colors disabled:bg-gray-200 disabled:cursor-not-allowed cursor-pointer">
                        Hủy
                    </button>
                    <button @click="handleCancelOrder" :disabled="isCancelling"
                        class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 font-semibold transition-colors disabled:bg-red-400 disabled:cursor-not-allowed cursor-pointer">
                        {{ isCancelling ? 'Đang xử lý...' : 'Xác nhận hủy' }}
                    </button>
                </div>
            </div>

        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useOrderStore } from '@/stores/orders'
import { useAsyncOperation } from '@/composables/useAsyncOperation'
import OrderCard from '@/components/common/user/OrderCard.vue'
import LoadingErrorState from '@/components/common/LoadingErrorState.vue'
import BackButton from '@/components/common/user/BackButton.vue'
import { History } from 'lucide-vue-next'
import { usePaymentStore } from '@/stores/payments'
import { useDepositStore } from '@/stores/deposits'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const orderStore = useOrderStore()
const paymentStore = usePaymentStore()
const depositStore = useDepositStore()
const { isLoading, errorMessage, executeAsync, resetError } = useAsyncOperation()

const orders = ref([])
const showCancelModal = ref(false)
const selectedOrderForCancel = ref(null)
const cancelError = ref('')
const isCancelling = ref(false)

// ==================== MoMo Payment Return Handling ====================
const clearMoMoFlags = () => {
    sessionStorage.removeItem('momo_payment_order_id')
    sessionStorage.removeItem('momo_payment_timestamp')
    sessionStorage.removeItem('deposit_order_id')
}

const ensureOrderStatus = async (orderId, desiredStatus) => {
    try {
        const orderResp = await orderStore.getOrderByIdStore(orderId)
        if (orderResp?.data?.success && orderResp.data.data) {
            const currentStatus = orderResp.data.data.status
            if (currentStatus !== desiredStatus) {
                if (desiredStatus === 'CANCELLED') {
                    // Sử dụng cancelOrderStore cho CANCELLED để đảm bảo logic đúng
                    await orderStore.cancelOrderStore(orderId)
                } else {
                    await orderStore.updateOrderStatusStore(orderId, desiredStatus)
                }
            }
        }
    } catch (error) {
        console.error(`❌ OrderPage - Lỗi khi cập nhật trạng thái đơn hàng ${orderId} -> ${desiredStatus}:`, error)
    }
}

const updatePaymentStatusIfNeeded = async (payment, targetStatus) => {
    if (!payment) return
    const paymentData = Array.isArray(payment) ? payment[0] : payment
    const paymentId = paymentData?.payment_id || paymentData?.id || paymentData?.paymentId
    const currentStatus = paymentData?.status || paymentData?.payment_status

    if (paymentId && currentStatus !== targetStatus) {
        try {
            await paymentStore.updatePaymentStatusStore(paymentId, targetStatus)
            console.log(`✅ OrderPage - Đã cập nhật payment status thành ${targetStatus}`)
        } catch (error) {
            console.error(`❌ OrderPage - Lỗi khi cập nhật payment status:`, error)
        }
    }
}

// Hàm xử lý kết quả MoMo dựa trên trạng thái thực tế từ backend
// Xử lý cả payment thông thường và deposit payment (đặt cọc)
const handleMoMoPaymentReturn = async () => {
    const momoOrderId = sessionStorage.getItem('momo_payment_order_id')
    const momoTimestamp = sessionStorage.getItem('momo_payment_timestamp')
    const depositOrderId = sessionStorage.getItem('deposit_order_id')

    // Kiểm tra xem có phải deposit payment không
    const isDepositPayment = depositOrderId !== null || (momoOrderId && typeof momoOrderId === 'string' && momoOrderId.startsWith('DEPOSIT_'))

    if (!momoOrderId || !momoTimestamp) {
        console.log('ℹ️ OrderPage - Không có MoMo payment flags')
        return
    }

    // Parse orderId - xử lý cả trường hợp DEPOSIT_orderId
    let orderIdNum = null
    if (typeof momoOrderId === 'string' && momoOrderId.startsWith('DEPOSIT_')) {
        const match = momoOrderId.match(/DEPOSIT_(\d+)/)
        orderIdNum = match ? parseInt(match[1]) : null
        // Nếu có depositOrderId trong sessionStorage, ưu tiên dùng nó
        if (depositOrderId) {
            orderIdNum = parseInt(depositOrderId)
        }
    } else {
        orderIdNum = parseInt(momoOrderId)
    }

    if (!orderIdNum) {
        console.warn('⚠️ OrderPage - Không thể parse orderId từ MoMo flags')
        clearMoMoFlags()
        return
    }

    try {
        const paymentType = isDepositPayment ? 'ĐẶT CỌC' : 'THANH TOÁN'
        console.log(`🔍 OrderPage - Kiểm tra trạng thái MoMo cho ${paymentType}, order:`, orderIdNum)

        // Kiểm tra order status trước
        const orderResp = await orderStore.getOrderByIdStore(orderIdNum)
        if (!orderResp?.data?.success || !orderResp?.data?.data) {
            console.warn('⚠️ OrderPage - Không tìm thấy order:', orderIdNum)
            clearMoMoFlags()
            return
        }

        const order = orderResp.data.data
        const orderStatus = order.status
        const depositRequired = order.deposit_required || false
        const deposit = order.deposit || null

        // Kiểm tra deposit.paid = 0 cho TẤT CẢ các đơn hàng có deposit_required TRƯỚC khi xử lý payment status
        // Nếu deposit.paid = 0, hủy đơn hàng ngay lập tức
        if (depositRequired &&
            orderStatus !== 'CANCELLED' &&
            orderStatus !== 'CONFIRMED' &&
            orderStatus !== 'DELIVERED') {
            console.log(`💰 OrderPage - Kiểm tra deposit.paid cho đơn hàng #${orderIdNum} (TRƯỚC khi xử lý payment status)...`)
            try {
                const depositResponse = await depositStore.getDepositByOrderIdStore(orderIdNum)
                const depositData = depositResponse?.data || depositResponse?.success ? depositResponse.data : depositResponse

                // Tìm deposit info từ nhiều vị trí có thể
                const depositInfo = depositData?.data || depositData || null

                if (depositInfo) {
                    // Kiểm tra paid status (có thể là 0, false, hoặc số khác)
                    const depositPaid = depositInfo.paid
                    const isPaid = depositPaid === true || depositPaid === 1 || depositPaid === '1' || depositPaid === 'true'

                    console.log(`💰 OrderPage - Deposit paid status:`, {
                        paid: depositPaid,
                        isPaid: isPaid,
                        depositInfo: depositInfo,
                        orderId: orderIdNum
                    })

                    // Nếu paid = 0 (hoặc false), hủy đơn hàng ngay lập tức
                    if (!isPaid) {
                        console.log(`⚠️ OrderPage - Deposit paid = 0 (hoặc false), hủy đơn hàng ngay lập tức...`, {
                            depositPaid,
                            orderId: orderIdNum
                        })

                        let orderCancelled = false
                        try {
                            await ensureOrderStatus(orderIdNum, 'CANCELLED')
                            orderCancelled = true
                            console.log(`✅ OrderPage - Đã hủy đơn hàng #${orderIdNum} do deposit paid = 0`)
                        } catch (cancelError) {
                            console.error(`❌ OrderPage - Lỗi khi hủy đơn hàng #${orderIdNum} do deposit paid = 0:`, cancelError)
                            // Thử lại một lần nữa
                            try {
                                await orderStore.updateOrderStatusStore(orderIdNum, 'CANCELLED')
                                orderCancelled = true
                                console.log(`✅ OrderPage - Đã hủy đơn hàng #${orderIdNum} do deposit paid = 0 (retry)`)
                            } catch (retryError) {
                                console.error(`❌ OrderPage - Không thể hủy đơn hàng #${orderIdNum} sau nhiều lần thử:`, retryError)
                            }
                        }

                        // Cập nhật payment status thành FAILED
                        try {
                            const paymentResponse = await paymentStore.getPaymentByOrderIdStore(orderIdNum)
                            const payment = paymentResponse?.data?.data || null
                            const paymentData = Array.isArray(payment) ? payment[0] : payment
                            if (paymentData && orderCancelled) {
                                await updatePaymentStatusIfNeeded(paymentData, 'FAILED')
                            }
                        } catch (paymentError) {
                            console.error(`❌ OrderPage - Lỗi khi cập nhật payment status:`, paymentError)
                        }

                        if (orderCancelled) {
                            clearMoMoFlags()
                            return
                        }
                    } else {
                        console.log(`✅ OrderPage - Deposit đã được thanh toán (paid = ${depositPaid}) cho đơn hàng #${orderIdNum}`)
                    }
                } else {
                    console.log(`⚠️ OrderPage - Không tìm thấy deposit info cho đơn hàng #${orderIdNum}, có thể deposit chưa được tạo`)
                }
            } catch (depositError) {
                console.error(`❌ OrderPage - Lỗi khi lấy deposit info cho đơn hàng #${orderIdNum}:`, depositError)
                // Nếu lỗi 404 hoặc deposit không tồn tại, không hủy đơn hàng (có thể deposit chưa được tạo)
                // Tiếp tục xử lý logic khác
            }
        }

        // Kiểm tra payment status
        const paymentResponse = await paymentStore.getPaymentByOrderIdStore(orderIdNum)
        const payment = paymentResponse?.data?.data || null
        const paymentData = Array.isArray(payment) ? payment[0] : payment
        const paymentStatus = paymentData?.status || paymentData?.payment_status || payment?.status || payment?.payment_status

        // Xử lý trường hợp SUCCESS
        if (paymentStatus === 'SUCCESS') {
            console.log(`✅ OrderPage - ${paymentType} đã SUCCESS, đảm bảo đơn hàng CONFIRMED`)
            await ensureOrderStatus(orderIdNum, 'CONFIRMED')
            clearMoMoFlags()
            return
        }

        // Xử lý trường hợp FAILED - QUAN TRỌNG: Hủy đơn hàng cho cả payment thông thường và deposit payment
        if (paymentStatus === 'FAILED') {
            console.log(`⚠️ OrderPage - ${paymentType} FAILED, bắt đầu hủy đơn hàng:`, orderIdNum)

            // Kiểm tra lại order status trước khi hủy
            if (orderStatus === 'CONFIRMED' || orderStatus === 'DELIVERED') {
                console.log('ℹ️ OrderPage - Order đã ở trạng thái hoàn tất, không hủy.')
                clearMoMoFlags()
                return
            }

            if (orderStatus === 'CANCELLED') {
                console.log('ℹ️ OrderPage - Order đã bị hủy trước đó.')
                clearMoMoFlags()
                return
            }

            // Hủy đơn hàng khi payment FAILED (cho cả deposit và payment thông thường)
            console.log(`🔄 OrderPage - Đang hủy đơn hàng do ${paymentType} thất bại...`)
            let orderCancelled = false

            try {
                await ensureOrderStatus(orderIdNum, 'CANCELLED')
                orderCancelled = true
                console.log(`✅ OrderPage - Đã hủy đơn hàng do ${paymentType} thất bại`)
            } catch (cancelError) {
                console.error(`❌ OrderPage - Lỗi khi hủy đơn hàng do ${paymentType} thất bại:`, cancelError)
                // Thử lại một lần nữa
                try {
                    await orderStore.updateOrderStatusStore(orderIdNum, 'CANCELLED')
                    orderCancelled = true
                    console.log(`✅ OrderPage - Đã hủy đơn hàng do ${paymentType} thất bại (retry)`)
                } catch (retryError) {
                    console.error(`❌ OrderPage - Không thể hủy đơn hàng sau nhiều lần thử:`, retryError)
                }
            }

            // Cập nhật payment status thành FAILED
            if (payment) {
                await updatePaymentStatusIfNeeded(payment, 'FAILED')
            }

            if (orderCancelled) {
                clearMoMoFlags()
                return
            }
        }

        // Xử lý trường hợp PROCESSING hoặc chưa có status
        if (paymentStatus === 'PROCESSING' || !paymentStatus) {
            console.log(`⏳ OrderPage - ${paymentType} đang PROCESSING hoặc chưa có status, kiểm tra order...`)

            if (orderStatus === 'CONFIRMED' || orderStatus === 'DELIVERED') {
                console.log('ℹ️ OrderPage - Order đã ở trạng thái hoàn tất, không hủy.')
                clearMoMoFlags()
                return
            }

            if (orderStatus === 'CANCELLED') {
                console.log('ℹ️ OrderPage - Order đã bị hủy trước đó.')
                clearMoMoFlags()
                return
            }

            // Kiểm tra deposit.paid = 0 cho deposit payment và hủy đơn hàng ngay lập tức
            if (isDepositPayment && depositRequired) {
                console.log(`💰 OrderPage - Kiểm tra deposit.paid cho ${paymentType}...`)
                try {
                    const depositResponse = await depositStore.getDepositByOrderIdStore(orderIdNum)
                    const depositData = depositResponse?.data || depositResponse
                    const depositInfo = depositData?.data || depositData

                    // Kiểm tra paid status (có thể là 0, false, hoặc số khác)
                    const depositPaid = depositInfo?.paid
                    const isPaid = depositPaid === true || depositPaid === 1 || depositPaid === '1' || depositPaid === 'true'

                    console.log(`💰 OrderPage - Deposit paid status:`, {
                        paid: depositPaid,
                        isPaid: isPaid,
                        depositInfo: depositInfo
                    })

                    // Nếu paid = 0 (hoặc false), hủy đơn hàng ngay lập tức
                    if (!isPaid && (depositPaid === false || depositPaid === 0 || depositPaid === '0' || depositPaid === 'false')) {
                        console.log(`⚠️ OrderPage - Deposit paid = 0, hủy đơn hàng ngay lập tức...`)

                        let orderCancelled = false
                        try {
                            await ensureOrderStatus(orderIdNum, 'CANCELLED')
                            orderCancelled = true
                            console.log(`✅ OrderPage - Đã hủy đơn hàng do deposit paid = 0`)
                        } catch (cancelError) {
                            console.error(`❌ OrderPage - Lỗi khi hủy đơn hàng do deposit paid = 0:`, cancelError)
                            // Thử lại một lần nữa
                            try {
                                await orderStore.updateOrderStatusStore(orderIdNum, 'CANCELLED')
                                orderCancelled = true
                                console.log(`✅ OrderPage - Đã hủy đơn hàng do deposit paid = 0 (retry)`)
                            } catch (retryError) {
                                console.error(`❌ OrderPage - Không thể hủy đơn hàng sau nhiều lần thử:`, retryError)
                            }
                        }

                        // Cập nhật payment status thành FAILED
                        if (payment && orderCancelled) {
                            await updatePaymentStatusIfNeeded(payment, 'FAILED')
                        }

                        if (orderCancelled) {
                            clearMoMoFlags()
                            return
                        }
                    } else if (isPaid) {
                        console.log(`✅ OrderPage - Deposit đã được thanh toán (paid = ${depositPaid})`)
                    }
                } catch (depositError) {
                    console.error(`❌ OrderPage - Lỗi khi lấy deposit info:`, depositError)
                    // Không throw error, tiếp tục xử lý logic khác
                }
            }

            // Kiểm tra timestamp để xem có quá lâu không
            const timestamp = parseInt(momoTimestamp)
            const now = Date.now()
            const timeDiff = now - timestamp
            const tenMinutes = 10 * 60 * 1000 // 10 phút

            if (timeDiff > tenMinutes) {
                // Nếu đã quá 10 phút mà payment vẫn chưa có kết quả và order chưa CANCELLED/CONFIRMED
                // Có thể payment đã thất bại nhưng chưa được cập nhật, hủy đơn hàng để an toàn
                // Áp dụng cho cả deposit payment và payment thông thường
                console.log(`⚠️ OrderPage - Đã quá 10 phút, ${paymentType} chưa có kết quả, hủy đơn hàng để an toàn`)

                let orderCancelled = false
                try {
                    await ensureOrderStatus(orderIdNum, 'CANCELLED')
                    orderCancelled = true
                    console.log(`✅ OrderPage - Đã hủy đơn hàng do ${paymentType} quá thời gian chờ`)
                } catch (cancelError) {
                    console.error(`❌ OrderPage - Lỗi khi hủy đơn hàng do ${paymentType} quá thời gian:`, cancelError)
                }

                // Cố gắng cập nhật payment status thành FAILED nếu có
                if (payment && orderCancelled) {
                    await updatePaymentStatusIfNeeded(payment, 'FAILED')
                }

                if (orderCancelled) {
                    clearMoMoFlags()
                    return
                }
            }

            console.log(`⏳ OrderPage - ${paymentType} chưa có kết quả cuối, giữ nguyên đơn hàng.`)
            // Không xóa flags để lần tải sau tiếp tục xử lý
            return
        }

        // Trường hợp còn lại - kiểm tra order status
        if (orderStatus === 'CONFIRMED' || orderStatus === 'DELIVERED') {
            console.log('ℹ️ OrderPage - Order đã ở trạng thái hoàn tất, không hủy.')
            clearMoMoFlags()
            return
        }

        if (orderStatus === 'CANCELLED') {
            console.log('ℹ️ OrderPage - Order đã bị hủy trước đó.')
            clearMoMoFlags()
            return
        }

        console.log(`⏳ OrderPage - ${paymentType} chưa có kết quả cuối, giữ nguyên đơn hàng.`)
        // Không xóa flags để lần tải sau tiếp tục xử lý
    } catch (error) {
        console.error('❌ OrderPage - Lỗi khi lấy trạng thái MoMo:', error)
        // Nếu có lỗi, không xóa flags để có thể retry lần sau
    }
}
// ==================== End MoMo Payment Return Handling ====================

// Đếm số đơn hàng sẽ được hiển thị (sau khi OrderCard filter)
// Tính toán dựa trên logic tương tự OrderCard.vue
const displayedOrdersCount = computed(() => {
    return orders.value.filter(order => {
        const status = (order.status || '').toUpperCase()
        const shippingStatus = (order.shipping_status || '').toUpperCase()
        // Chỉ KHÔNG hiển thị khi ĐỒNG THỜI status = CONFIRMED VÀ shipping_status = DELIVERED
        // Hoặc khi status = CANCELLED
        // Hoặc khi shipping_status = CANCELLED (Giao thất bại)
        const isConfirmedAndDelivered = status === 'CONFIRMED' && shippingStatus === 'DELIVERED'
        const isCancelled = status === 'CANCELLED'
        const isShippingCancelled = shippingStatus === 'CANCELLED'
        return !isConfirmedAndDelivered && !isCancelled && !isShippingCancelled
    }).length
})

// Kiểm tra và hủy các đơn hàng có deposit.paid = 0
const checkAndCancelDeposits = async () => {
    // Chỉ kiểm tra các đơn hàng có deposit_required và chưa bị hủy
    const ordersToCheck = orders.value.filter(order => {
        const orderStatus = order.status?.toUpperCase()
        return order.deposit_required &&
            orderStatus !== 'CANCELLED' &&
            orderStatus !== 'CONFIRMED' &&
            orderStatus !== 'DELIVERED'
    })

    if (ordersToCheck.length === 0) {
        return
    }

    console.log(`💰 OrderPage - Kiểm tra ${ordersToCheck.length} đơn hàng có deposit_required...`)

    for (const order of ordersToCheck) {
        const orderId = order.order_id
        try {
            const depositResponse = await depositStore.getDepositByOrderIdStore(orderId)
            const depositData = depositResponse?.data || depositResponse?.success ? depositResponse.data : depositResponse
            const depositInfo = depositData?.data || depositData || null

            if (depositInfo) {
                const depositPaid = depositInfo.paid
                const isPaid = depositPaid === true || depositPaid === 1 || depositPaid === '1' || depositPaid === 'true'

                console.log(`💰 OrderPage - Đơn hàng #${orderId} - deposit paid:`, depositPaid, 'isPaid:', isPaid)

                // Nếu paid = 0 (hoặc false), hủy đơn hàng ngay lập tức
                if (!isPaid) {
                    console.log(`⚠️ OrderPage - Đơn hàng #${orderId} có deposit.paid = 0, hủy đơn hàng...`)

                    try {
                        await ensureOrderStatus(orderId, 'CANCELLED')
                        console.log(`✅ OrderPage - Đã hủy đơn hàng #${orderId} do deposit paid = 0`)

                        // Cập nhật payment status thành FAILED
                        try {
                            const paymentResponse = await paymentStore.getPaymentByOrderIdStore(orderId)
                            const payment = paymentResponse?.data?.data || null
                            const paymentData = Array.isArray(payment) ? payment[0] : payment
                            if (paymentData) {
                                await updatePaymentStatusIfNeeded(paymentData, 'FAILED')
                            }
                        } catch (paymentError) {
                            console.error(`❌ OrderPage - Lỗi khi cập nhật payment status cho đơn hàng #${orderId}:`, paymentError)
                        }
                    } catch (cancelError) {
                        console.error(`❌ OrderPage - Lỗi khi hủy đơn hàng #${orderId}:`, cancelError)
                    }
                }
            }
        } catch (depositError) {
            // Nếu không tìm thấy deposit (404), không làm gì (có thể deposit chưa được tạo)
            if (depositError.response?.status !== 404) {
                console.error(`❌ OrderPage - Lỗi khi lấy deposit info cho đơn hàng #${orderId}:`, depositError)
            }
        }
    }
}

const loadOrders = async () => {
    const userId = authStore.userId
    if (!userId) {
        router.push('/login')
        return
    }

    await executeAsync(async () => {
        // Reload orders từ API để đảm bảo có dữ liệu mới nhất
        await orderStore.getOrdersByUserIdStore(userId)

        // Lấy tất cả đơn hàng, không filter ở đây
        // Logic filter sẽ được xử lý bởi OrderCard.vue
        orders.value = orderStore.orders || []

        console.log('📦 All orders loaded:', orders.value.length)
        console.log('📦 All orders details:', orders.value.map(o => ({
            id: o.order_id,
            status: o.status,
            shipping_status: o.shipping_status,
            deposit_required: o.deposit_required
        })))

        // Sau khi load orders, kiểm tra và hủy các đơn hàng có deposit.paid = 0
        await checkAndCancelDeposits()

        // Reload lại orders sau khi hủy (nếu có)
        await orderStore.getOrdersByUserIdStore(userId)
        orders.value = orderStore.orders || []
    }, {
        defaultErrorMessage: 'Không thể tải danh sách đơn hàng!',
        onError: (error) => {
            errorMessage.value = error.response?.data?.message || error.message
        }
    })
}

onMounted(async () => {
    // Xử lý MoMo payment return trước khi load orders
    await handleMoMoPaymentReturn()

    // Sau đó load orders
    loadOrders()
})

// Reload khi route thay đổi (ví dụ quay lại từ OrderHistoryPage)
watch(() => route.path, (newPath, oldPath) => {
    if (newPath.includes('/orders-page') && oldPath && oldPath !== newPath) {
        console.log('🔄 Route changed to orders-page, reloading orders...')
        loadOrders()
    }
}, { immediate: false })


// Cancel order functions
const openCancelModal = (order) => {
    selectedOrderForCancel.value = order
    showCancelModal.value = true
    cancelError.value = ''
}

const closeCancelModal = () => {
    showCancelModal.value = false
    selectedOrderForCancel.value = null
    cancelError.value = ''
}

const handleCancelOrder = async () => {
    if (!selectedOrderForCancel.value) return

    isCancelling.value = true
    cancelError.value = ''

    try {
        const orderId = selectedOrderForCancel.value.order_id

        // Hủy đơn hàng (cập nhật status thành CANCELLED)
        const response = await orderStore.cancelOrderStore(orderId)

        if (response.data.success) {
            // Cập nhật payment status thành FAILED nếu có payment
            try {
                // Thử lấy payment từ order_id
                try {
                    const paymentResponse = await paymentStore.getPaymentByOrderIdStore(orderId)
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
                            console.log('Found payment, updating status to FAILED for paymentId:', paymentId)
                            await paymentStore.updatePaymentStatusStore(paymentId, 'FAILED')
                            console.log('Payment status updated to FAILED successfully')
                        } else {
                            console.warn('Payment object does not have payment_id. Payment object:', payment)
                        }
                    }
                } catch (error) {
                    // Nếu API lấy payment theo order_id không tồn tại, thử lấy từ order object
                    console.log(error)
                    const orderResponse = await orderStore.getOrderByIdStore(orderId)
                    if (orderResponse.data.success && orderResponse.data.data) {
                        const order = orderResponse.data.data
                        // Kiểm tra nhiều cách để lấy payment_id
                        const paymentId = order.payment_id ||
                            order.payment?.payment_id ||
                            order.payment?.id ||
                            order.payments?.[0]?.payment_id ||
                            order.payments?.[0]?.id

                        if (paymentId) {
                            console.log('Found payment_id from order object, updating status to FAILED:', paymentId)
                            await paymentStore.updatePaymentStatusStore(paymentId, 'FAILED')
                            console.log('Payment status updated to FAILED successfully')
                        } else {
                            console.warn('Order does not have payment_id, order object:', order)
                        }
                    }
                }
            } catch (paymentError) {
                console.error('Error updating payment status:', paymentError)
                // Không throw error vì đơn hàng đã được hủy thành công
            }

            // Reload orders
            await loadOrders()
            closeCancelModal()
        } else {
            cancelError.value = response.data.message || 'Hủy đơn hàng thất bại!'
        }
    } catch (error) {
        console.error('Error canceling order:', error)
        cancelError.value = error.response?.data?.message || 'Có lỗi xảy ra khi hủy đơn hàng!'
    } finally {
        isCancelling.value = false
    }
}
</script>
