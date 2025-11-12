<template>
    <div v-if="shouldDisplayOrder" class="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
        <!-- Order Header -->

        <!-- Payment and Shipping Info -->
        <div class="mt-4 mb-4 space-y-2">
            <div class="flex flex-col ">
                <div>
                    <h3 class="text-lg font-bold text-gray-800">Đơn hàng #{{ order.order_id }}</h3>
                    <p class="text-sm text-gray-600 mt-1">
                        Ngày đặt: {{ formatDate(order.order_date) }}
                    </p>
                </div>

            </div>
            <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600">Trạng thái đơn hàng:</span>
                <span :class="[
                    'inline-block px-3 py-1 rounded-full text-sm font-semibold',
                    getStatusClass(order?.status)
                ]">
                    {{ getStatusText(order.status) }}
                </span>
            </div>
            <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600">Phương thức thanh toán ({{ getPaymentMethodName(order) }}):</span>
                <span :class="[
                    'inline-block px-3 py-1 rounded-full text-sm font-semibold',
                    getPaymentStatusClass(paymentInfo?.status)
                ]">
                    {{ getPaymentStatusText(order) }}
                </span>
            </div>
            <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600">Trạng thái giao hàng:</span>
                <span :class="[
                    'inline-block px-3 py-1 rounded-full text-sm font-semibold',
                    getShippingStatusClass(order?.shipping_status)
                ]">
                    {{ getShippingStatusText(order.shipping_status) }}
                </span>
            </div>
        </div>

        <!-- Order Items -->
        <div class="mb-4 pt-3 border-t ">
            <h4 class="font-semibold text-gray-800 mb-2">Sản phẩm:</h4>
            <div class="space-y-2">
                <div v-for="detail in order.order_details" :key="detail.order_detail_id"
                    class="flex items-center gap-3 p-2 bg-gray-50 rounded">
                    <img :src="getProductImage(detail.product)" :alt="getProductName(detail.product)"
                        class="w-16 h-16 object-contain bg-white rounded" @error="handleImageError($event)" />
                    <div class="flex-1">
                        <p class="font-medium text-gray-800">{{ getProductName(detail.product) }}</p>
                        <p class="text-sm text-gray-600">Số lượng: {{ detail.quantity }}</p>
                        <p class="text-sm text-green-600 font-semibold">
                            {{ formatPrice(detail.price_at_order) }} x {{ detail.quantity }}
                        </p>
                    </div>
                    <div class="text-right">
                        <p class="font-bold text-gray-800">{{ formatPrice(detail.sub_total) }}</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Order Summary - Tạm tính chi tiết giống ReviewOrderPage -->
        <div class="border-t pt-4 space-y-3">
            <div class="flex justify-between text-gray-600">
                <span>Tạm tính:</span>
                <span class="font-semibold">{{ formatPrice(order.total) }}</span>
            </div>
            <div class="flex justify-between" :class="isFreeship ? 'text-green-600' : 'text-gray-600'">
                <span>Phí vận chuyển ({{ totalQuantity }} sản phẩm):</span>
                <span class="font-semibold">
                    <span v-if="isFreeship">Miễn phí</span>
                    <span v-else>{{ formatPrice(shippingFee) }}</span>
                </span>
            </div>
            <div v-if="specialDiscountAmount > 0" class="flex justify-between text-green-600">
                <span>
                    Giảm giá
                    <span v-if="order.discount_code">({{ order.discount_code }})</span>:
                </span>
                <span class="font-semibold">-{{ formatPrice(specialDiscountAmount) }}</span>
            </div>
            <div class="border-t pt-3 flex justify-between text-lg font-bold text-gray-800">
                <span>Tổng cộng:</span>
                <span class="text-green-600">{{ formatPrice(order.final_total) }}</span>
            </div>

        </div>

        <!-- Action Buttons -->
        <div class="mt-4 pt-4 border-t flex justify-end gap-3">
            <!-- Cancel Order Button -->
            <button v-if="showCancelButton" @click="$emit('cancel-order', order)"
                :disabled="order.status !== 'PENDING_CONFIRMATION'" :class="[
                    'px-4 py-1.5 text-sm rounded-lg font-medium transition-colors',
                    order.status === 'PENDING_CONFIRMATION'
                        ? 'bg-red-600 hover:bg-red-700 text-white cursor-pointer'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                ]">
                Hủy đơn hàng
            </button>
            <!-- Review Button (only for DELIVERED orders) -->
            <router-link v-if="order.status === 'DELIVERED' && !hasAllProductsReviewed"
                :to="`/review/${order.order_id}`"
                class="px-4 py-1.5 text-sm rounded-lg font-medium bg-green-600 hover:bg-green-700 text-white transition-colors cursor-pointer">
                Đánh giá sản phẩm
            </router-link>
            <!-- View Review Button (if all products are reviewed) -->
            <router-link v-if="order.status === 'DELIVERED' && hasAllProductsReviewed" :to="`/review/${order.order_id}`"
                class="px-4 py-1.5 text-sm rounded-lg font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer">
                Xem đánh giá
            </router-link>
        </div>
    </div>
</template>

<script setup>
import { defineProps, computed, onMounted, watch, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useReviewStore } from '@/stores/reviews'
import { usePaymentStore } from '@/stores/payments'

const props = defineProps({
    order: {
        type: Object,
        required: true
    },
    showCancelButton: {
        type: Boolean,
        default: false
    },
    // Prop để xác định có áp dụng filter hay không (mặc định là true cho OrderPage)
    applyFilter: {
        type: Boolean,
        default: true
    }
})

defineEmits(['cancel-order'])

const authStore = useAuthStore()
const reviewStore = useReviewStore()
const paymentStore = usePaymentStore()
const userReviews = ref([])
const isLoadingReviews = ref(false)
const paymentInfo = ref(null)

// Kiểm tra xem có nên hiển thị đơn hàng này không
// Chỉ áp dụng filter khi applyFilter = true (dùng trong OrderPage)
// Không áp dụng filter khi applyFilter = false (dùng trong OrderHistoryPage)
const shouldDisplayOrder = computed(() => {
    // Nếu không áp dụng filter, luôn hiển thị
    if (!props.applyFilter) {
        return true
    }

    // Chỉ áp dụng filter khi applyFilter = true (OrderPage)
    const status = (props.order.status || '').toUpperCase()
    const shippingStatus = (props.order.shipping_status || '').toUpperCase()

    // Chỉ KHÔNG hiển thị khi ĐỒNG THỜI status = CONFIRMED VÀ shipping_status = DELIVERED
    // Hoặc khi status = CANCELLED
    // Nếu chỉ một trong hai điều kiện đúng (CONFIRMED hoặc DELIVERED) thì vẫn hiển thị
    const isConfirmedAndDelivered = status === 'CONFIRMED' && shippingStatus === 'DELIVERED'
    const isCancelled = status === 'CANCELLED'
    return !isConfirmedAndDelivered && !isCancelled
})

// Load user reviews to check if all products are reviewed
const loadUserReviews = async () => {
    const userId = authStore.userId
    if (!userId || props.order.status !== 'DELIVERED') return

    isLoadingReviews.value = true
    try {
        await reviewStore.getReviewsByUserIdStore(userId)
        userReviews.value = reviewStore.userReviews || []
    } catch (error) {
        console.error('Error loading user reviews:', error)
        userReviews.value = []
    } finally {
        isLoadingReviews.value = false
    }
}

// Check if all products in order have been reviewed
const hasAllProductsReviewed = computed(() => {
    if (!props.order.order_details || props.order.order_details.length === 0) {
        return false
    }

    // If reviews haven't loaded yet, return false
    if (isLoadingReviews.value) {
        return false
    }

    // Check if all products in order have reviews
    const allReviewed = props.order.order_details.every(detail => {
        const productId = detail.product?.product_id || detail.product_id
        if (!productId) return false

        // Check if there's a review for this product
        return userReviews.value.some(review => {
            const reviewProductId = review.product_id || review.product?.product_id
            return reviewProductId === productId || String(reviewProductId) === String(productId)
        })
    })

    return allReviewed
})

// Watch order changes to reload reviews
watch(() => props.order.order_id, () => {
    if (props.order.status === 'DELIVERED') {
        loadUserReviews()
    }
}, { immediate: true })

onMounted(() => {
    if (props.order.status === 'DELIVERED') {
        loadUserReviews()
    }
    // Load payment info nếu chưa có
    loadPaymentInfo()
})

// Tính tổng số lượng sản phẩm
const totalQuantity = computed(() => {
    if (!props.order.order_details) return 0
    return props.order.order_details.reduce((sum, detail) => sum + (detail.quantity || 0), 0)
})

// Tính tổng giá trị đơn hàng (tạm tính)
const subTotal = computed(() => {
    if (!props.order.order_details) return props.order.total || 0
    return props.order.order_details.reduce((sum, detail) => {
        return sum + (detail.sub_total || (detail.price_at_order || 0) * (detail.quantity || 0))
    }, 0)
})




// Lấy special discount amount (discount từ mã giảm giá)
const specialDiscountAmount = computed(() => {
    // Nếu có auto_discount_amount và discount_amount, thì discount_amount là special discount
    if (props.order.auto_discount_amount && props.order.discount_amount) {
        // discount_amount có thể là tổng hoặc chỉ special, cần kiểm tra
        // Nếu có total_discount_amount, thì special = total - auto
        if (props.order.total_discount_amount) {
            return props.order.total_discount_amount - (props.order.auto_discount_amount || 0)
        }
        // Nếu không có total_discount_amount, giả sử discount_amount là special
        return props.order.discount_amount
    }
    // Nếu không có auto discount, thì discount_amount là special discount
    return props.order.discount_amount || 0
})

// Tính phí ship dựa trên số lượng sản phẩm (nếu không có trong order)
const shippingFee = computed(() => {
    // Ưu tiên lấy từ order object
    if (props.order.shipping_fee !== null && props.order.shipping_fee !== undefined && props.order.shipping_fee !== 0) {
        console.log('Shipping fee from order:', props.order.shipping_fee)
        return props.order.shipping_fee
    }

    // Nếu không có, tính theo số lượng sản phẩm
    const quantity = totalQuantity.value
    let calculatedFee = 0
    if (quantity <= 5) {
        calculatedFee = 50000
    } else if (quantity <= 10) {
        calculatedFee = 70000
    } else if (quantity <= 15) {
        calculatedFee = 100000
    } else {
        calculatedFee = 100000
    }

    console.log('Calculated shipping fee:', calculatedFee, 'for quantity:', quantity, 'Order object:', props.order)
    return calculatedFee
})

// Kiểm tra có freeship không
const isFreeship = computed(() => {
    // Kiểm tra điều kiện freeship: >= 15 sản phẩm và tổng >= 4,000,000
    if (totalQuantity.value >= 15 && subTotal.value >= 4000000) {
        return true
    }
    // Hoặc shipping_fee = 0
    return shippingFee.value === 0 || shippingFee.value === null
})

const formatPrice = (price) => {
    if (!price) return '0 ₫'
    const numPrice = typeof price === 'string' ? parseFloat(price.replace(/[^\d.]/g, '')) : price
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(numPrice)
}

const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
}

const getStatusText = (status) => {
    const statusMap = {
        'PENDING': 'Chờ xử lý',
        'PENDING_CONFIRMATION': 'Chờ xác nhận',
        'CONFIRMED': 'Đã xác nhận',
        'PROCESSING': 'Đang xử lý',
        'SHIPPING': 'Đang giao hàng',
        'DELIVERED': 'Đã giao hàng',
        'CANCELLED': 'Đã hủy'
    }
    return statusMap[status] || status
}

// Hàm chung để lấy class cho tất cả các loại status (order status và shipping status)
const getStatusClass = (status) => {
    if (!status) return 'bg-gray-100 text-gray-800'

    const classMap = {
        // Order status
        'PENDING_CONFIRMATION': 'bg-yellow-100 text-yellow-800',
        'CONFIRMED': 'bg-blue-100 text-blue-800',
        'CANCELLED': 'bg-red-100 text-red-800',
        'FAILED': 'bg-red-100 text-red-800',
    }
    return classMap[status] || 'bg-gray-100 text-gray-800'
}
const getShippingStatusClass = (shipping_status) => {
    if (!shipping_status) return 'bg-gray-100 text-gray-800'

    const classMap = {

        'SHIPPING': 'bg-indigo-100 text-indigo-800',
        'DELIVERED': 'bg-green-100 text-green-800',
        'CANCELLED': 'bg-red-100 text-red-800',
        'PREPARING_ORDER': 'bg-orange-100 text-orange-800',
        'UNDELIVERED': 'bg-yellow-100 text-yellow-800',
    }
    return classMap[shipping_status] || 'bg-gray-100 text-gray-800'
}
const getPaymentStatusClass = (status) => {
    if (!status) return 'bg-gray-100 text-gray-800'

    const classMap = {
    
        'PROCESSING': 'bg-yellow-100 text-yellow-800',
        'FAILED': 'bg-red-100 text-red-800',
        'SUCCESS': 'bg-green-100 text-green-800',
    }
    return classMap[status] || 'bg-gray-100 text-gray-800'
}


// Lấy tên phương thức thanh toán từ order
const getPaymentMethodName = () => {
    if (paymentInfo.value?.method_name) {
        return paymentInfo.value.method_name
    }


}

// Lấy trạng thái thanh toán
const getPaymentStatusText = (order) => {
    // Ưu tiên lấy từ payment object
    if (order.payment?.status) {
        const statusMap = {
            'PROCESSING': 'Đang xử lý',
            'SUCCESS': 'Thành công',
            'FAILED': 'Thất bại'
        }
        return statusMap[order.payment.status] || order.payment.status
    }
    // Nếu không có, thử lấy từ paymentInfo
    if (paymentInfo.value?.status) {
        const statusMap = {
            'PROCESSING': 'Đang xử lý',
            'SUCCESS': 'Thành công',
            'FAILED': 'Thất bại'
        }
        return statusMap[paymentInfo.value.status] || paymentInfo.value.status
    }
    return 'Chưa xác định'
}



// Lấy trạng thái giao hàng
const getShippingStatusText = (shippingStatus) => {
    if (!shippingStatus) return 'Chưa xác định'
    const statusMap = {
        'PREPARING_ORDER': 'Đang chuẩn bị đơn',
        'SHIPPING': 'Đang giao hàng',
        'DELIVERED': 'Đã giao hàng',
        'UNDELIVERED': 'Chưa được giao',
        'CANCELLED': 'Đã hủy'
    }
    return statusMap[shippingStatus] || shippingStatus
}


// Load payment info nếu chưa có trong order
const loadPaymentInfo = async () => {
    if (paymentInfo.value) return

    try {
        const paymentResponse = await paymentStore.getPaymentByOrderIdStore(props.order.order_id)
        if (paymentResponse?.data?.success && paymentResponse?.data?.data) {
            // Xử lý cả trường hợp array và object
            const data = paymentResponse.data.data
            if (Array.isArray(data) && data.length > 0) {
                // Nếu là array, lấy phần tử đầu tiên
                paymentInfo.value = data[0]
            } else if (typeof data === 'object') {
                // Nếu là object, dùng trực tiếp
                paymentInfo.value = data
            }
            console.log('Loaded payment info:', paymentInfo.value)
        }
    } catch (error) {
        console.error('Error loading payment info:', error)
    }
}

const getProductName = (product) => {
    return product?.product_name || 'Không có tên'
}

const getProductImage = (product) => {
    const imageUrl = product?.img_url
    if (!imageUrl || imageUrl.trim() === '') {
        return '/img/footer.png'
    }
    return imageUrl
}

const handleImageError = (event) => {
    if (!event.target.src.includes('footer.png')) {
        event.target.src = '/img/footer.png'
    }
}
</script>
