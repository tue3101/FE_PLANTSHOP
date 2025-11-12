<template>
    <div class="min-h-screen bg-gray-50 py-8">
        <div class="container mx-auto px-4 max-w-6xl">
            <BackButton />
            <h1 class="text-3xl font-bold text-green-700 mb-6 text-center">Lịch sử đơn hàng</h1>

            <div class="bg-white rounded-lg shadow mb-6">
                <div class="flex border-b border-gray-200">
                    <button @click="activeTab = 'DELIVERED'" :class="[
                        'flex-1 py-4 text-center font-semibold transition-colors relative',
                        activeTab === 'DELIVERED'
                            ? 'text-green-600'
                            : 'text-gray-600 hover:text-gray-800'
                    ]">
                        Đơn đã giao
                        <span v-if="activeTab === 'DELIVERED'"
                            class="absolute bottom-0 left-0 right-0 h-0.5 bg-green-600"></span>
                    </button>
                    <div class="w-px bg-gray-200"></div>
                    <button @click="activeTab = 'CANCELLED'" :class="[
                        'flex-1 py-4 text-center font-semibold transition-colors relative',
                        activeTab === 'CANCELLED'
                            ? 'text-red-600'
                            : 'text-gray-600 hover:text-gray-800'
                    ]">
                        Đơn đã hủy
                        <span v-if="activeTab === 'CANCELLED'"
                            class="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600"></span>
                    </button>
                </div>
            </div>

            <!-- Loading and Error State -->
            <LoadingErrorState :isLoading="isLoading" :errorMessage="errorMessage"
                loadingMessage="Đang tải lịch sử đơn hàng..." @reset-error="resetError" />

            <!-- Empty State -->
            <div v-if="!isLoading && !errorMessage && filteredOrders.length === 0"
                class="text-center py-16 bg-white rounded-lg shadow">
                <div class="mb-4">
                    <History class="mx-auto h-24 w-24 text-gray-400" />
                </div>
                <p class="text-xl text-gray-600 mb-4">Bạn chưa có đơn hàng nào trong lịch sử</p>
                <router-link to="/product"
                    class="inline-block bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
                    Tiếp tục mua sắm
                </router-link>
            </div>

            <!-- Orders List -->
            <div v-if="!isLoading && !errorMessage && filteredOrders.length > 0" class="space-y-4">
                <OrderCard v-for="order in filteredOrders" :key="order.order_id" :order="order"
                    :showCancelButton="false" :applyFilter="false" />
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useOrderStore } from '@/stores/orders'
import { useReviewStore } from '@/stores/reviews'
import { useAsyncOperation } from '@/composables/useAsyncOperation'
import OrderCard from '@/components/common/user/OrderCard.vue'
import LoadingErrorState from '@/components/common/LoadingErrorState.vue'
import BackButton from '@/components/common/user/BackButton.vue'
import { History } from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const orderStore = useOrderStore()
const reviewStore = useReviewStore()
const { isLoading, errorMessage, executeAsync, resetError } = useAsyncOperation()

const orders = ref([])
const activeTab = ref('DELIVERED')

const loadOrders = async () => {
    console.log('🚀 loadOrders called')
    const userId = authStore.userId
    console.log('👤 User ID:', userId)

    if (!userId) {
        console.log('❌ No userId, redirecting to login')
        router.push('/login')
        return
    }

    console.log('⏳ Starting executeAsync...')

    await executeAsync(async () => {
        console.log('✅ Inside executeAsync callback')

        // Load orders từ store (reload để đảm bảo có dữ liệu mới nhất)
        console.log('📦 Loading orders from store...')
        await orderStore.getOrdersByUserIdStore(userId)
        console.log('✅ Orders loaded from store')

        // Lấy danh sách orders từ store
        // Tab "Đơn đã giao": status = CONFIRMED và shipping_status = DELIVERED
        // Tab "Đơn đã hủy": status = CANCELLED
        const allOrders = orderStore.orders || []
        console.log('📋 All orders from store:', allOrders.length)
        console.log('📋 All orders statuses:', allOrders.map(o => ({
            id: o.order_id,
            status: o.status,
            shipping_status: o.shipping_status
        })))

        // Sử dụng toUpperCase() để đảm bảo case-insensitive
        const rawOrders = allOrders.filter(order => {
            const status = (order.status || '').toUpperCase()
            const shippingStatus = (order.shipping_status || '').toUpperCase()

            // Lấy các đơn đã giao (CONFIRMED + DELIVERED) hoặc đã hủy (CANCELLED)
            return (status === 'CONFIRMED' && shippingStatus === 'DELIVERED') || status === 'CANCELLED'
        })

        console.log('📋 Filtered orders (CONFIRMED+DELIVERED and CANCELLED only):', rawOrders.length)
        console.log('📋 Filtered orders details:', rawOrders.map(o => ({
            id: o.order_id,
            status: o.status,
            shipping_status: o.shipping_status
        })))
        console.log('📊 Number of orders:', rawOrders.length)

        if (rawOrders.length === 0) {
            console.log('⚠️ No orders found, setting empty array')
            orders.value = []
            return
        }

        // Load order details cho từng order (load tuần tự để tránh lỗi 400)
        console.log('🔄 Starting to load order details for each order...')
        const ordersWithDetails = []

        for (const order of rawOrders) {
            console.log(`📝 Processing order ${order.order_id}...`)

            // Kiểm tra xem order đã có order_details chưa (từ API getOrdersByUserId)
            if (order.order_details && Array.isArray(order.order_details) && order.order_details.length > 0) {
                console.log(`✅ Order ${order.order_id} already has order_details from initial API call`)
                ordersWithDetails.push({
                    ...order,
                    order_details: order.order_details
                })
                continue
            }

            try {
                // Load order details cho từng order (tuần tự thay vì song song)
                console.log(`🌐 Calling API for order ${order.order_id}...`)
                const detailsResponse = await orderStore.getOrderDetailsByOrderIdStore(order.order_id)
                console.log(`✅ Order ${order.order_id} details response:`, detailsResponse?.data)

                const orderDetails = detailsResponse?.data?.data || orderStore.currentOrderDetails || []
                console.log(`📦 Order ${order.order_id} details:`, orderDetails)
                console.log(`📊 Order ${order.order_id} has ${orderDetails.length} details`)

                ordersWithDetails.push({
                    ...order,
                    order_details: orderDetails
                })
            } catch (error) {
                console.error(`❌ Error loading order details for order ${order.order_id}:`, error)
                console.error(`❌ Error status:`, error.response?.status)
                console.error(`❌ Error data:`, error.response?.data)
                console.error(`❌ Error message:`, error.message)
                // Vẫn thêm order vào danh sách nhưng với order_details rỗng
                ordersWithDetails.push({
                    ...order,
                    order_details: []
                })
            }
        }

        console.log('✅ All orders with details loaded:', ordersWithDetails)

        // Map orders với order details vào local ref (theo cấu trúc CategoryView)
        // Giữ nguyên tất cả fields của order, chỉ đảm bảo có order_details
        orders.value = ordersWithDetails.map((order) => ({
            ...order, // Giữ nguyên tất cả fields
            order_details: order.order_details || []
        }))

        console.log('🎯 Final orders value:', orders.value)
        console.log('📊 Final orders count:', orders.value.length)

        // Load user reviews riêng (có thể lỗi nhưng không ảnh hưởng đến orders)
        try {
            console.log('⭐ Loading user reviews...')
            await reviewStore.getReviewsByUserIdStore(userId)
            console.log('✅ User reviews loaded')
        } catch (error) {
            console.error('❌ Error loading user reviews:', error)
        }
    }, {
        defaultErrorMessage: 'Không thể tải lịch sử đơn hàng!',
        onError: (error) => {
            console.error('❌ executeAsync onError:', error)
            errorMessage.value = error.response?.data?.message || error.message
        }
    })

    console.log('🏁 loadOrders completed')
}

// Filter theo tab đang chọn
const filteredOrders = computed(() => {
    if (activeTab.value === 'DELIVERED') {
        // Tab "Đơn đã giao": hiển thị các đơn có status = CONFIRMED và shipping_status = DELIVERED
        return orders.value.filter(order => {
            const status = (order.status || '').toUpperCase()
            const shippingStatus = (order.shipping_status || '').toUpperCase()
            return status === 'CONFIRMED' && shippingStatus === 'DELIVERED'
        })
    } else if (activeTab.value === 'CANCELLED') {
        // Tab "Đơn đã hủy": hiển thị các đơn có status = CANCELLED
        return orders.value.filter(order => {
            const status = (order.status || '').toUpperCase()
            return status === 'CANCELLED'
        })
    }
    return []
})

onMounted(() => {
    loadOrders()
})

// Reload khi route thay đổi (ví dụ quay lại từ OrderPage)
watch(() => route.path, (newPath, oldPath) => {
    if (newPath.includes('/order-history') && oldPath && oldPath !== newPath) {
        console.log('🔄 Route changed to order-history, reloading orders...')
        loadOrders()
    }
}, { immediate: false })
</script>
