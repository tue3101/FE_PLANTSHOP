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

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const orderStore = useOrderStore()
const paymentStore = usePaymentStore()
const { isLoading, errorMessage, executeAsync, resetError } = useAsyncOperation()

const orders = ref([])
const showCancelModal = ref(false)
const selectedOrderForCancel = ref(null)
const cancelError = ref('')
const isCancelling = ref(false)

// Đếm số đơn hàng sẽ được hiển thị (sau khi OrderCard filter)
// Tính toán dựa trên logic tương tự OrderCard.vue
const displayedOrdersCount = computed(() => {
    return orders.value.filter(order => {
        const status = (order.status || '').toUpperCase()
        const shippingStatus = (order.shipping_status || '').toUpperCase()
        // Chỉ KHÔNG hiển thị khi ĐỒNG THỜI status = CONFIRMED VÀ shipping_status = DELIVERED
        // Hoặc khi status = CANCELLED
        const isConfirmedAndDelivered = status === 'CONFIRMED' && shippingStatus === 'DELIVERED'
        const isCancelled = status === 'CANCELLED'
        return !isConfirmedAndDelivered && !isCancelled
    }).length
})

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
            shipping_status: o.shipping_status
        })))
    }, {
        defaultErrorMessage: 'Không thể tải danh sách đơn hàng!',
        onError: (error) => {
            errorMessage.value = error.response?.data?.message || error.message
        }
    })
}

onMounted(async () => {
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
