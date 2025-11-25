<template>
    <div class="min-h-screen bg-gray-50 py-8">
        <div class="container mx-auto px-4 max-w-6xl">
            <BackButton />
            <h1 class="text-3xl font-bold text-green-700 mb-8 text-center">Thanh Toán</h1>

            <!-- Empty State: Không có đơn hàng -->
            <div v-if="orderItems.length === 0" class="text-center py-16 bg-white rounded-lg shadow">
                <div class="mb-4">
                    <ShoppingCart class="mx-auto h-24 w-24 text-gray-400" />
                </div>
                <p class="text-xl text-gray-600 mb-4">Bạn không có đơn hàng nào cần thanh toán</p>
                <router-link to="/cart"
                    class="inline-block bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
                    Quay lại giỏ hàng
                </router-link>
            </div>

            <!-- Payment Content: Có đơn hàng -->
            <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <!-- Left: Order Items -->
                <div class="lg:col-span-2 space-y-6">
                    <!-- Shipping Info -->
                    <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 class="text-xl font-bold text-gray-900 mb-5 pb-3 border-b border-gray-200">Thông tin giao
                            hàng</h2>
                        <div class="space-y-3 text-gray-700">
                            <div class="flex items-start gap-3">
                                <span class="font-semibold text-gray-900 min-w-[120px]">Tên:</span>
                                <span class="text-gray-700">{{ shippingInfo.username }}</span>
                            </div>
                            <div class="flex items-start gap-3">
                                <span class="font-semibold text-gray-900 min-w-[120px]">Số điện thoại:</span>
                                <span class="text-gray-700">{{ shippingInfo.phone_number }}</span>
                            </div>
                            <div class="flex items-start gap-3">
                                <span class="font-semibold text-gray-900 min-w-[120px]">Địa chỉ:</span>
                                <span class="text-gray-700">{{ shippingInfo.address }}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Order Items -->
                    <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 class="text-xl font-bold text-gray-900 mb-5 pb-3 border-b border-gray-200">Sản phẩm đặt hàng
                        </h2>
                        <div class="space-y-4">
                            <div v-for="item in orderItems" :key="item.cart_detail_id || item.product_id"
                                class="flex gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100">
                                <img :src="getProductImage(item)" :alt="getProductName(item)"
                                    class="w-24 h-24 object-contain bg-gray-50 rounded-lg border border-gray-200 flex-shrink-0"
                                    @error="handleImageError($event)" />
                                <div class="flex-1 min-w-0">
                                    <h3 class="font-semibold text-gray-900 mb-2 text-lg">{{ getProductName(item) }}</h3>
                                    <div class="flex items-center gap-4 text-sm">
                                        <span class="text-green-600 font-bold text-base">{{ formatPrice(item.price)
                                        }}</span>
                                        <span class="text-gray-500">x {{ item.quantity }}</span>
                                    </div>
                                </div>
                                <div class="text-right flex-shrink-0">
                                    <p class="font-bold text-gray-900 text-lg">
                                        {{ formatPrice((item.price || 0) * item.quantity) }}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Right: Order Summary & Discount -->
                <div class="lg:col-span-1">
                    <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-4">
                        <h2 class="text-xl font-bold text-gray-900 mb-6 pb-3 border-b border-gray-200">Đơn hàng của bạn
                        </h2>

                        <!-- Discount Section -->
                        <div class="mb-6 pb-6 border-b border-gray-200">
                            <label class="block text-gray-900 font-semibold mb-3">Mã giảm giá</label>
                            <div class="flex gap-2 mb-4">
                                <input v-model="discountCode" type="text" placeholder="Nhập mã giảm giá"
                                    class="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm" />
                                <button @click="applyDiscountCode" :disabled="isLoadingDiscount"
                                    class="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg font-semibold transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer text-sm whitespace-nowrap">
                                    {{ isLoadingDiscount ? '...' : 'Áp dụng' }}
                                </button>
                            </div>

                            <div v-if="appliedSpecialDiscount"
                                class="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                                <div class="flex items-start justify-between mb-2">
                                    <p class="text-sm text-green-800">
                                        <span class="font-semibold">Đã áp dụng:</span>
                                        <span class="font-bold">{{ appliedSpecialDiscount.code }}</span>
                                        <span v-if="appliedSpecialDiscount.type === 'percent'" class="ml-1">
                                            - {{ appliedSpecialDiscount.value }}%
                                        </span>
                                        <span v-else-if="appliedSpecialDiscount.type === 'amount'" class="ml-1">
                                            - {{ formatPrice(appliedSpecialDiscount.value) }}
                                        </span>
                                        <span v-else-if="appliedSpecialDiscount.type === 'freeship'" class="ml-1">
                                            - Miễn phí vận chuyển
                                        </span>
                                    </p>
                                </div>
                                <button @click="removeDiscount"
                                    class="text-red-600 text-sm hover:text-red-700 hover:underline font-medium cursor-pointer">
                                    Xóa mã giảm giá
                                </button>
                            </div>

                            <!-- Hiển thị các mã giảm giá có thể áp dụng -->
                            <div v-if="availableDiscountCodes.length > 0" class="mt-4">
                                <p class="text-sm font-semibold text-gray-700 mb-2">Mã giảm giá có thể áp dụng:</p>
                                <div class="flex flex-wrap gap-2">
                                    <button v-for="discount in availableDiscountCodes" :key="discount.code"
                                        @click="applyAvailableDiscount(discount)" :class="[
                                            'px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer border',
                                            appliedSpecialDiscount?.code === discount.code
                                                ? 'bg-green-600 text-white border-green-700'
                                                : 'bg-green-100 hover:bg-green-200 text-green-800 border-green-300'
                                        ]" :title="discount.description"
                                        :disabled="appliedSpecialDiscount?.code === discount.code">
                                        <span class="font-bold">{{ discount.code }}</span>
                                        <span v-if="discount.type === 'percent'" class="ml-1">
                                            - {{ discount.value }}%
                                        </span>
                                        <span v-else-if="discount.type === 'amount'" class="ml-1">
                                            - {{ formatPrice(discount.value) }}
                                        </span>
                                        <span v-if="appliedSpecialDiscount?.code === discount.code" class="ml-1">
                                            ✓
                                        </span>
                                    </button>
                                </div>
                            </div>

                            <div class="mt-3 text-sm text-red-500 bg-gray-50 p-2 rounded">
                                <p>💡 Không áp dụng đồng thời nhiều mã khuyến mãi!</p>
                            </div>
                            <!-- Error Message -->
                            <div v-if="errorMessage"
                                class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm text-center">
                                {{ errorMessage }}
                            </div>

                            <!-- FreeShip info (tự động) -->
                            <div v-if="totalQuantity >= 15 && subTotal >= 4000000"
                                class="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                                <p class="text-sm text-green-800">
                                    <span class="font-semibold">🎉 Miễn phí vận chuyển:</span>
                                    <span class="block mt-1 text-xs">Đơn hàng từ 15 sản phẩm và tổng giá trị từ
                                        4.000.000 VND</span>
                                </p>
                            </div>
                        </div>

                        <!-- Payment Method -->
                        <div class="mb-6 pb-6 border-b border-gray-200">
                            <label class="block text-gray-900 font-semibold mb-4">Phương thức thanh toán</label>
                            <div class="space-y-3">
                                <label
                                    class="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all"
                                    :class="paymentMethod === 'COD' ? 'border-green-500 bg-green-50 shadow-sm' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'">
                                    <input type="radio" v-model="paymentMethod" value="COD"
                                        class="w-5 h-5 text-green-600 focus:ring-green-500" />
                                    <div class="flex-1">
                                        <span class="font-semibold text-gray-900">COD</span>
                                        <span class="block text-xs text-gray-500 mt-0.5">Thanh toán khi nhận hàng</span>
                                    </div>
                                </label>
                                <label
                                    class="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all"
                                    :class="paymentMethod === 'MOMO' ? 'border-green-500 bg-green-50 shadow-sm' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'">
                                    <input type="radio" v-model="paymentMethod" value="MOMO"
                                        class="w-5 h-5 text-green-600 focus:ring-green-500" />
                                    <div class="flex-1">
                                        <span class="font-semibold text-gray-900">Momo</span>
                                        <span class="block text-xs text-gray-500 mt-0.5">Thanh toán online</span>
                                    </div>
                                </label>
                            </div>
                        </div>

                        <!-- Price Summary -->
                        <div class="space-y-3 mb-6 bg-gray-50 p-4 rounded-lg">
                            <div class="flex justify-between items-center py-2">
                                <span class="text-gray-700">Tạm tính:</span>
                                <span class="font-semibold text-gray-900">{{ formatPrice(subTotal) }}</span>
                            </div>
                            <div class="flex justify-between items-center py-2"
                                :class="finalShippingFee === 0 ? 'text-green-600' : 'text-gray-700'">
                                <span class="text-sm">Phí vận chuyển ({{ totalQuantity }} sản phẩm):</span>
                                <span class="font-semibold">
                                    <span v-if="finalShippingFee === 0">Miễn phí</span>
                                    <span v-else>{{ formatPrice(finalShippingFee) }}</span>
                                </span>
                            </div>
                            <div v-if="specialDiscountAmount > 0"
                                class="flex justify-between items-center py-2 text-green-600">
                                <span class="text-sm">
                                    Giảm giá mã
                                    <span v-if="appliedSpecialDiscount?.code" class="font-medium">({{
                                        appliedSpecialDiscount.code }}</span>
                                    <span v-if="specialDiscountPercent !== null"> - {{ specialDiscountPercent }}%</span>
                                    <span v-if="appliedSpecialDiscount?.code">)</span>:
                                </span>
                                <span class="font-semibold">-{{ formatPrice(specialDiscountAmount) }}</span>
                            </div>
                            <div class="border-t border-gray-300 pt-4 mt-2 flex justify-between items-center">
                                <span class="text-lg font-bold text-gray-900">Tổng cộng:</span>
                                <span class="text-xl font-bold text-green-600">{{ formatPrice(finalTotal) }}</span>
                            </div>
                        </div>



                        <!-- Submit Button (chỉ hiển thị khi chưa tạo đơn hoặc COD) -->
                        <button v-if="!createdOrderId && paymentMethod !== 'MOMO'" @click="handleCreateOrder"
                            :disabled="isCreatingOrder"
                            class="w-full bg-green-600 hover:bg-green-700 text-white py-3.5 px-6 rounded-lg font-semibold transition-all disabled:bg-gray-400 disabled:cursor-not-allowed mb-3 cursor-pointer shadow-sm hover:shadow-md">
                            {{ isCreatingOrder ? 'Đang tạo đơn hàng...' : 'Xác nhận đặt hàng' }}
                        </button>

                        <!-- Button tạo đơn cho MOMO -->
                        <button v-if="!createdOrderId && paymentMethod === 'MOMO'" @click="handleCreateOrderForMoMo"
                            :disabled="isCreatingOrder"
                            class="w-full bg-green-600 hover:bg-green-700 text-white py-3.5 px-6 rounded-lg font-semibold transition-all disabled:bg-gray-400 disabled:cursor-not-allowed mb-3 cursor-pointer shadow-sm hover:shadow-md">
                            {{ isCreatingOrder ? 'Đang tạo đơn hàng...' : 'Tạo đơn hàng và thanh toán MoMo' }}
                        </button>

                        <button @click="handleCancel"
                            class="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-semibold transition-colors cursor-pointer border border-gray-300">
                            Hủy
                        </button>
                    </div>
                </div>

            </div>
        </div>

        <!-- Confirm Leave Modal -->
        <ConfirmLeaveModal :show="showConfirmModal" title="Tải lại trang web?"
            message="Bạn có chắc muốn rời khỏi trang này? Các thay đổi của bạn có thể không được lưu."
            confirm-text="Tải lại" @confirm="handleConfirmLeave" @cancel="handleCancelLeave" />
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute, onBeforeRouteLeave } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'
import { useDiscountStore } from '@/stores/discounts'
import { useOrderStore } from '@/stores/orders'
import { useUserStore } from '@/stores/user'
import { usePaymentMethodStore } from '@/stores/payment-methods'
import { usePaymentStore } from '@/stores/payments'
import { useAsyncOperation } from '@/composables/useAsyncOperation'
import BackButton from '@/components/common/user/BackButton.vue'
import ConfirmLeaveModal from '@/components/common/ConfirmLeaveModal.vue'
import { ShoppingCart } from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()
const cartStore = useCartStore()
const authStore = useAuthStore()
const discountStore = useDiscountStore()
const orderStore = useOrderStore()
const userStore = useUserStore()
const paymentMethodStore = usePaymentMethodStore()
const paymentStore = usePaymentStore()
const { isLoading: isCreatingOrder, errorMessage, executeAsync } = useAsyncOperation()

const shippingInfo = ref({})
const orderItems = ref([])
const discountCode = ref('')
const appliedSpecialDiscount = ref(null)
const availableDiscounts = ref([])
const isLoadingDiscount = ref(false)
const paymentMethod = ref('COD')
const createdOrderId = ref(null)
const isOrderCompleted = ref(false)

// Modal confirm leave
const showConfirmModal = ref(false)
const pendingNavigation = ref(null)


// Kiểm tra xem có đang trong quá trình thanh toán không
const isPaymentActive = () => {
    return createdOrderId.value !== null && paymentMethod.value === 'MOMO'
}

// Xử lý hủy đơn hàng khi user rời khỏi trang
const handleDeleteOrderOnLeave = async (orderId) => {
    try {
        console.log('🔄 User xác nhận rời khỏi, đang hủy đơn hàng:', orderId)

        // Cập nhật trạng thái đơn hàng thành CANCELLED
        await orderStore.cancelOrderStore(orderId)
        console.log('✅ Đã cập nhật trạng thái đơn hàng thành CANCELLED:', orderId)

        // Cập nhật payment status thành FAILED nếu có payment
        try {
            const paymentResponse = await paymentStore.getPaymentByOrderIdStore(orderId)
            if (paymentResponse?.data?.success && paymentResponse?.data?.data) {
                const payment = paymentResponse.data.data
                const paymentId = payment.payment_id || payment.id || payment.paymentId

                if (paymentId) {
                    console.log('💳 Đang cập nhật payment status thành FAILED:', paymentId)
                    await paymentStore.updatePaymentStatusStore(paymentId, 'FAILED')
                    console.log('✅ Đã cập nhật payment status thành FAILED')
                }
            }
        } catch (paymentError) {
            console.error('❌ Lỗi khi cập nhật payment status:', paymentError)
        }

        // Reset payment data
        createdOrderId.value = null
    } catch (error) {
        console.error('❌ Lỗi khi hủy đơn hàng:', error)
    }
}


// Sử dụng onBeforeRouteLeave để detect navigation (chặn tất cả navigation khi đang thanh toán MOMO)
onBeforeRouteLeave((to, from, next) => {
    // Chặn TẤT CẢ navigation khi đang trong quá trình thanh toán MOMO
    // KHÔNG chặn khi đang navigate vào trang này (from.name sẽ là undefined hoặc tên trang khác)
    if (isPaymentActive()) {
        console.log('⚠️ onBeforeRouteLeave: Đang chặn navigation vì đang thanh toán MOMO, to:', to.path)
        pendingNavigation.value = { to, next }
        showConfirmModal.value = true
        // Không gọi next() để chặn navigation
    } else {
        console.log('✅ onBeforeRouteLeave: Cho phép navigation')
        next()
    }
})

const handleConfirmLeave = async () => {
    showConfirmModal.value = false

    // Nếu đã tạo đơn hàng, xóa đơn hàng trước khi rời khỏi
    if (createdOrderId.value && paymentMethod.value === 'MOMO') {
        await handleDeleteOrderOnLeave(createdOrderId.value)
    }

    // Tiếp tục navigation
    if (pendingNavigation.value && pendingNavigation.value.next) {
        pendingNavigation.value.next()
        pendingNavigation.value = null
    }
}

const handleCancelLeave = () => {
    showConfirmModal.value = false
    if (pendingNavigation.value && pendingNavigation.value.next) {
        pendingNavigation.value.next(false)
        pendingNavigation.value = null
    }
}

// Kiểm tra và xử lý khi user quay lại từ MoMo payment mà không thanh toán
const checkAndHandleMoMoReturn = async () => {
    console.log('🔍 checkAndHandleMoMoReturn được gọi')
    const momoOrderId = sessionStorage.getItem('momo_payment_order_id')
    const momoTimestamp = sessionStorage.getItem('momo_payment_timestamp')

    console.log('📦 SessionStorage - momoOrderId:', momoOrderId, 'momoTimestamp:', momoTimestamp)
    console.log('🔗 Current route query:', route.query)

    // Kiểm tra xem có đang quay lại từ MoMo payment không
    if (momoOrderId && momoTimestamp) {
        console.log('✅ Có flags MoMo payment, bắt đầu xử lý')

        // Kiểm tra xem có resultCode trong URL không (nghĩa là đã được redirect từ PaymentReturnPage)
        const hasResultCode = route.query.resultCode !== undefined
        console.log('🔍 hasResultCode:', hasResultCode, 'resultCode value:', route.query.resultCode)

        // Nếu không có resultCode, nghĩa là user quay về trực tiếp từ MoMo (không thanh toán)
        if (!hasResultCode) {
            console.log('⚠️ Không có resultCode - User quay về trực tiếp từ MoMo (hủy giao dịch)')
            const orderIdNum = parseInt(momoOrderId)
            console.log('🆔 OrderId để xử lý:', orderIdNum)

            // Cập nhật trạng thái CANCELLED và payment status FAILED nếu user quay về mà không có resultCode
            if (orderIdNum) {
                // Bước 1: Cập nhật trạng thái đơn hàng thành CANCELLED
                try {
                    console.log('🔄 Đang cập nhật trạng thái đơn hàng thành CANCELLED:', orderIdNum)
                    const cancelResponse = await orderStore.cancelOrderStore(orderIdNum)
                    console.log('📥 Response từ cancelOrderStore:', cancelResponse)

                    if (cancelResponse?.data?.success) {
                        console.log('✅ Đã cập nhật trạng thái đơn hàng thành CANCELLED:', orderIdNum)
                    } else {
                        console.warn('⚠️ Cập nhật trạng thái CANCELLED không thành công:', cancelResponse?.data)
                    }
                } catch (cancelError) {
                    console.error('❌ Lỗi khi cập nhật trạng thái CANCELLED:', cancelError)
                    console.log('Chi tiết lỗi:', cancelError.response?.data || cancelError.message)
                }

                // Bước 2: Cập nhật payment status thành FAILED
                try {
                    console.log('💳 Đang lấy payment để cập nhật status thành FAILED:', orderIdNum)
                    const paymentResponse = await paymentStore.getPaymentByOrderIdStore(orderIdNum)
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
                        console.warn('⚠️ Không tìm thấy payment cho order:', orderIdNum)
                    }
                } catch (paymentError) {
                    console.error('❌ Lỗi khi cập nhật payment status:', paymentError)
                }

                // Reset createdOrderId
                createdOrderId.value = null
                console.log('✅ Đã xử lý xong: cập nhật trạng thái CANCELLED và payment FAILED')
            } else {
                console.warn('⚠️ Không có orderId hợp lệ để xử lý')
            }
        } else {
            console.log('ℹ️ Có resultCode trong URL, đã được xử lý bởi PaymentReturnPage')
        }

        // Xóa flags sau khi xử lý (CHỈ xóa nếu đã xử lý xong)
        // KHÔNG xóa flags ngay lập tức, để có thể xử lý ở các trang khác nếu cần
        if (!hasResultCode) {
            // Chỉ xóa flags nếu đã xử lý xong (user quay về mà không có resultCode)
            console.log('🧹 Xóa flags MoMo payment khỏi sessionStorage sau khi xử lý')
            sessionStorage.removeItem('momo_payment_order_id')
            sessionStorage.removeItem('momo_payment_timestamp')
        } else {
            // Nếu có resultCode, giữ flags để PaymentReturnPage xử lý
            console.log('ℹ️ Giữ flags MoMo payment để PaymentReturnPage xử lý')
        }
    } else {
        console.log('ℹ️ Không có flags MoMo payment trong sessionStorage')
    }
}


// Kiểm tra trạng thái đơn hàng và payment để chặn quay lại nếu đã thanh toán thành công/thất bại
const checkOrderAndPaymentStatus = async () => {
    try {
        // Kiểm tra orderId từ query params hoặc createdOrderId
        const orderIdFromQuery = route.query.orderId ? parseInt(route.query.orderId) : null
        const orderIdToCheck = orderIdFromQuery || createdOrderId.value

        if (!orderIdToCheck) {
            // Không có orderId, cho phép vào trang
            return true
        }

        console.log('🔍 Kiểm tra trạng thái đơn hàng và payment:', orderIdToCheck)

        // Kiểm tra trạng thái đơn hàng
        try {
            const orderResponse = await orderStore.getOrderByIdStore(orderIdToCheck)
            if (orderResponse?.data?.success && orderResponse?.data?.data) {
                const order = orderResponse.data.data
                const orderStatus = order.status

                console.log('📦 Trạng thái đơn hàng:', orderStatus)

                // Nếu đơn hàng đã thành công (CONFIRMED, DELIVERED) hoặc thất bại (CANCELLED)
                if (orderStatus === 'CONFIRMED' || orderStatus === 'DELIVERED' || orderStatus === 'CANCELLED') {
                    console.log('⚠️ Đơn hàng đã có trạng thái cuối cùng, redirect về trang đơn hàng')
                    router.replace('/orders-page')
                    return false
                }
            }
        } catch (orderError) {
            console.error('❌ Lỗi khi kiểm tra trạng thái đơn hàng:', orderError)
            // Tiếp tục kiểm tra payment status
        }

        // Kiểm tra trạng thái payment
        try {
            const paymentResponse = await paymentStore.getPaymentByOrderIdStore(orderIdToCheck)
            if (paymentResponse?.data?.success && paymentResponse?.data?.data) {
                const payment = paymentResponse.data.data
                const paymentStatus = payment.status || payment.payment_status

                console.log('💳 Trạng thái payment:', paymentStatus)

                // Nếu payment đã thành công (SUCCESS) hoặc thất bại (FAILED)
                if (paymentStatus === 'SUCCESS' || paymentStatus === 'FAILED') {
                    console.log('⚠️ Payment đã có trạng thái cuối cùng, redirect về trang đơn hàng')
                    router.replace('/orders-page')
                    return false
                }
            }
        } catch (paymentError) {
            console.error('❌ Lỗi khi kiểm tra trạng thái payment:', paymentError)
            // Không block nếu không lấy được payment status
        }

        return true
    } catch (error) {
        console.error('❌ Lỗi khi kiểm tra trạng thái đơn hàng/payment:', error)
        // Cho phép vào trang nếu có lỗi
        return true
    }
}

// Setup lifecycle hooks
onMounted(async () => {
    // Kiểm tra nếu đơn hàng đã hoàn thành, redirect về trang chủ
    // CHỈ redirect nếu thực sự đang ở PaymentPage (không phải từ CheckoutPage hoặc ReviewPage)
    const orderCompleted = sessionStorage.getItem('order_completed')
    const fromCheckout = route.query.fromCheckout === 'true'

    if (orderCompleted === 'true' && !fromCheckout) {
        console.log('⚠️ Đơn hàng đã hoàn thành, redirect về trang chủ')
        // Xóa flag
        sessionStorage.removeItem('order_completed')
        sessionStorage.removeItem('completed_order_id')
        // Redirect về trang chủ
        router.push('/home')
        return
    }

    // Nếu có flag order_completed nhưng đang từ CheckoutPage, xóa flag để tránh redirect
    if (orderCompleted === 'true' && fromCheckout) {
        console.log('⚠️ Xóa flag order_completed vì đang từ CheckoutPage')
        sessionStorage.removeItem('order_completed')
        sessionStorage.removeItem('completed_order_id')
    }

    // Kiểm tra trạng thái đơn hàng và payment để chặn quay lại nếu đã thanh toán thành công/thất bại
    const canAccess = await checkOrderAndPaymentStatus()
    if (!canAccess) {
        // Đã redirect trong checkOrderAndPaymentStatus, không cần làm gì thêm
        return
    }

    // Kiểm tra và xử lý khi user quay lại từ MoMo payment
    console.log('🚀 PaymentPage onMounted - Bắt đầu kiểm tra MoMo return')
    await checkAndHandleMoMoReturn()
    console.log('✅ PaymentPage onMounted - Hoàn thành kiểm tra MoMo return')

    // Load shipping info from query params
    try {
        const userId = authStore.userId
        if (!userId) {
            router.push('/login')
            return
        }

        // Luôn tải lại giỏ hàng từ backend để đảm bảo có dữ liệu mới nhất
        try {
            await cartStore.loadCartFromBackend(userId)
        } catch (error) {
            console.error('Error loading cart from backend:', error)
            // Không throw error, tiếp tục với dữ liệu từ query params
        }

        // Load shipping info from query params
        const shippingInfoStr = route.query.shippingInfo
        if (shippingInfoStr) {
            shippingInfo.value = JSON.parse(shippingInfoStr)
        } else {
            // Nếu không có shipping info trong query, thử lấy từ user info
            try {
                const token = authStore.accessToken
                if (token) {
                    await userStore.getInfo(token)
                    if (userStore.userInfo) {
                        shippingInfo.value = {
                            username: userStore.userInfo.username || '',
                            phone_number: userStore.userInfo.phone_number || '',
                            address: userStore.userInfo.address || '',
                            note: ''
                        }
                    }
                }
            } catch (error) {
                console.error('Error loading user info:', error)
            }

            // Nếu vẫn không có shipping info, hiển thị thông báo
            if (!shippingInfo.value.username || !shippingInfo.value.phone_number || !shippingInfo.value.address) {
                errorMessage.value = 'Vui lòng điền đầy đủ thông tin giao hàng'
            }
        }

        // Get selected items from query params or cart
        const selectedItemsStr = route.query.selectedItems
        if (selectedItemsStr) {
            try {
                const selectedItemsData = JSON.parse(selectedItemsStr)
                console.log('Selected items from query:', selectedItemsData)
                console.log('Cart items from store:', cartStore.cartItems)

                // Map selected items data to full cart items (đã được load từ backend)
                orderItems.value = selectedItemsData.map(selectedItem => {
                    // Tìm item trong cart bằng cart_detail_id hoặc product_id
                    const fullItem = cartStore.cartItems.find(
                        item => {
                            // So sánh cart_detail_id trước
                            if (selectedItem.cart_detail_id && item.cart_detail_id) {
                                return item.cart_detail_id === selectedItem.cart_detail_id
                            }
                            // Nếu không có cart_detail_id, so sánh product_id
                            if (selectedItem.product_id && item.product_id) {
                                return item.product_id === selectedItem.product_id
                            }
                            return false
                        }
                    )

                    if (fullItem) {
                        // Cập nhật quantity từ selectedItem nếu có, ưu tiên thông tin từ selectedItem
                        return {
                            ...fullItem,
                            quantity: selectedItem.quantity || fullItem.quantity,
                            price: selectedItem.price || fullItem.price,
                            // Đảm bảo có đầy đủ thông tin từ selectedItem nếu có
                            product_name: selectedItem.product_name || fullItem.product_name,
                            img_url: selectedItem.img_url || fullItem.img_url
                        }
                    }

                    // Nếu không tìm thấy trong cart, sử dụng đầy đủ thông tin từ selectedItem
                    // (selectedItem đã có đầy đủ thông tin từ CartPage)
                    return {
                        ...selectedItem,
                        product_name: selectedItem.product_name || 'Sản phẩm',
                        img_url: selectedItem.img_url || '/img/footer.png',
                        quantity: selectedItem.quantity || 1,
                        price: selectedItem.price || 0
                    }
                }).filter(item => item !== undefined && item !== null)

                console.log('Mapped order items:', orderItems.value)
            } catch (error) {
                console.error('Error parsing selectedItems:', error)
                // Fallback: get selected items from cart
                orderItems.value = cartStore.cartItems.filter(item => item.selected !== false)
            }
        } else {
            // Fallback: get selected items from cart (đã được load từ backend)
            orderItems.value = cartStore.cartItems.filter(item => {
                return item.selected !== false && item.selected !== null
            })
        }

        // Nếu không có sản phẩm, hiển thị thông báo lỗi
        if (orderItems.value.length === 0) {
            console.warn('No order items found')
            errorMessage.value = 'Không có sản phẩm để thanh toán. Vui lòng quay lại giỏ hàng.'
            // Không redirect về cart, để user có thể thấy thông báo lỗi
        }

        // Load available discounts
        loadDiscounts()

        // Load payment methods
        loadPaymentMethods()
    } catch (error) {
        console.error('Error loading checkout data:', error)
        errorMessage.value = 'Có lỗi xảy ra khi tải dữ liệu thanh toán'
    }
})

const loadDiscounts = async () => {
    try {
        await discountStore.getAllDiscounts()
        availableDiscounts.value = discountStore.discounts || []
    } catch (error) {
        console.error('Error loading discounts:', error)
    }
}

const loadPaymentMethods = async () => {
    try {
        await paymentMethodStore.getAllPaymentMethods()
    } catch (error) {
        console.error('Error loading payment methods:', error)
    }
}

// Map payment method string sang method_id
const getPaymentMethodId = (methodName) => {
    return paymentMethodStore.getPaymentMethodId(methodName)
}

// Tính tổng số lượng sản phẩm
const totalQuantity = computed(() => {
    return orderItems.value.reduce((sum, item) => sum + (item.quantity || 0), 0)
})

// Tính phí ship theo số lượng sản phẩm
const shippingFee = computed(() => {
    const quantity = totalQuantity.value
    if (quantity <= 5) {
        return 50000
    } else if (quantity <= 10) {
        return 70000
    } else if (quantity <= 15) {
        return 100000
    } else {
        return 100000 // > 15 sản phẩm
    }
})

// Giảm giá tự động theo số lượng sản phẩm - Đã tắt
const autoDiscountPercent = computed(() => {
    return 0 // Tắt auto discount
})

const applyDiscountCode = async () => {
    if (!discountCode.value.trim()) {
        errorMessage.value = 'Vui lòng nhập mã giảm giá!'
        return
    }

    isLoadingDiscount.value = true
    errorMessage.value = ''

    try {
        const code = discountCode.value.trim() // Giữ nguyên hoa thường

        // Kiểm tra nếu đã đủ điều kiện miễn phí vận chuyển tự động
        // (15 sản phẩm và >= 4.000.000 VND) thì không được áp dụng mã giảm giá khác
        if (totalQuantity.value >= 15 && subTotal.value >= 4000000) {
            errorMessage.value = 'Đơn hàng của bạn đã được miễn phí vận chuyển, không thể áp dụng mã giảm giá khác!'
            isLoadingDiscount.value = false
            return
        }

        // Kiểm tra nếu đã có mã giảm giá được áp dụng
        // Mỗi đơn chỉ được áp dụng 1 mã giảm giá duy nhất
        // Nếu đã có mã, sẽ tự động thay thế bằng mã mới
        const oldDiscountCode = appliedSpecialDiscount.value?.code
        if (oldDiscountCode && oldDiscountCode !== code) {
            // Mã cũ sẽ tự động bị thay thế bởi mã mới
            // Không cần thông báo vì đây là hành vi mong muốn
        }

        // Kiểm tra mã giảm giá đặc biệt (phân biệt hoa thường)
        if (code === 'COBALA100K') {
            if (subTotal.value >= 1500000) {
                // Áp dụng mã mới (tự động thay thế mã cũ nếu có)
                appliedSpecialDiscount.value = {
                    code: 'COBALA100K',
                    type: 'amount',
                    value: 100000
                }
                discountCode.value = ''
            } else {
                errorMessage.value = 'Mã COBALA100K chỉ áp dụng cho đơn hàng từ 1.500.000 VND trở lên!'
                return
            }
        } else if (code === 'XANH10') {
            if (subTotal.value >= 500000) {
                // Áp dụng mã mới (tự động thay thế mã cũ nếu có)
                appliedSpecialDiscount.value = {
                    code: 'XANH10',
                    type: 'percent',
                    value: 10
                }
                discountCode.value = ''
            } else {
                errorMessage.value = 'Mã XANH10 chỉ áp dụng cho đơn hàng từ 500.000 VND trở lên!'
                return
            }

        } else if (code === 'FREESHIP') {
            // Áp dụng mã mới (tự động thay thế mã cũ nếu có)
            appliedSpecialDiscount.value = {
                code: 'FREESHIP',
                type: 'freeship',
                value: 0
            }
            discountCode.value = ''
        } else {
            // Kiểm tra mã giảm giá từ database (phân biệt hoa thường)
            const discount = availableDiscounts.value.find(
                d => d.discount_code === code
            )

            if (!discount) {
                errorMessage.value = 'Mã giảm giá không hợp lệ!'
                return
            }

            // Xác định loại giảm giá dựa trên discount.type từ database
            if (discount.type === 'PERCENT') {
                // Giảm giá theo phần trăm (tự động thay thế mã cũ nếu có)
                appliedSpecialDiscount.value = {
                    code: discount.discount_code,
                    type: 'percent',
                    value: Number(discount.value) || 0,
                    discount_id: discount.discount_id
                }
            } else if (discount.type === 'CASH') {
                // Giảm giá cố định (tiền mặt) (tự động thay thế mã cũ nếu có)
                appliedSpecialDiscount.value = {
                    code: discount.discount_code,
                    type: 'amount',
                    value: Number(discount.value) || 0,
                    discount_id: discount.discount_id
                }
            } else {
                errorMessage.value = 'Loại mã giảm giá không hợp lệ!'
                return
            }
            discountCode.value = ''
        }
    } catch (error) {
        errorMessage.value = 'Có lỗi xảy ra khi áp dụng mã giảm giá!'
        console.log(error)
    } finally {
        isLoadingDiscount.value = false
    }
}

const removeDiscount = () => {
    appliedSpecialDiscount.value = null
    discountCode.value = ''
}

// Áp dụng mã giảm giá khi click vào mã có sẵn
const applyAvailableDiscount = (discount) => {
    // Nếu click vào mã đã được áp dụng, remove nó
    if (appliedSpecialDiscount.value?.code === discount.code) {
        removeDiscount()
        return
    }

    // Kiểm tra nếu đã đủ điều kiện miễn phí vận chuyển tự động
    if (totalQuantity.value >= 15 && subTotal.value >= 4000000) {
        errorMessage.value = 'Đơn hàng của bạn đã được miễn phí vận chuyển, không thể áp dụng mã giảm giá khác!'
        return
    }

    // Áp dụng mã giảm giá
    appliedSpecialDiscount.value = {
        code: discount.code,
        type: discount.type,
        value: discount.value,
        discount_id: null // Mã hardcode không có discount_id
    }
    discountCode.value = discount.code
    errorMessage.value = ''
    console.log('✅ Applied discount code:', discount.code)
}

// Calculate prices
const subTotal = computed(() => {
    return orderItems.value.reduce((sum, item) => {
        const price = item.price || 0
        return sum + (price * item.quantity)
    }, 0)
})

// Giảm giá tự động (theo số lượng sản phẩm)
const autoDiscountAmount = computed(() => {
    if (autoDiscountPercent.value === 0) return 0
    return (subTotal.value * autoDiscountPercent.value) / 100
})

// Giảm giá từ mã giảm giá đặc biệt
const specialDiscountAmount = computed(() => {
    if (!appliedSpecialDiscount.value) return 0

    const discount = appliedSpecialDiscount.value
    if (discount.type === 'amount') {
        // Giảm giá cố định (ví dụ: 100.000 VND)
        return Number(discount.value) || 0
    } else if (discount.type === 'percent') {
        // Giảm giá theo phần trăm
        const percent = Number(discount.value) || 0
        return (subTotal.value * percent) / 100
    } else if (discount.type === 'freeship') {
        return 0 // Freeship được xử lý riêng
    }
    return 0
})

// Lấy phần trăm giảm giá từ mã (để hiển thị)
const specialDiscountPercent = computed(() => {
    if (!appliedSpecialDiscount.value) return null
    if (appliedSpecialDiscount.value.type === 'percent') {
        return Number(appliedSpecialDiscount.value.value) || 0
    }
    return null
})

// Kiểm tra các mã giảm giá có thể áp dụng dựa trên điều kiện
const availableDiscountCodes = computed(() => {
    const available = []
    const total = subTotal.value

    // Kiểm tra điều kiện COBALA100K: >= 1.500.000 VND
    if (total >= 1500000) {
        available.push({
            code: 'COBALA100K',
            type: 'amount',
            value: 100000,
            description: 'Giảm 100.000 VND cho đơn hàng từ 1.500.000 VND'
        })
    }

    // Kiểm tra điều kiện XANH10: >= 500.000 VND
    if (total >= 500000) {
        available.push({
            code: 'XANH10',
            type: 'percent',
            value: 10,
            description: 'Giảm 10% cho đơn hàng từ 500.000 VND'
        })
    }

    return available
})

// Phí ship sau khi áp dụng FREESHIP
const finalShippingFee = computed(() => {
    // FreeShip: Đơn hàng từ 15 sản phẩm trở lên với tổng giá trị đơn hàng >= 4.000.000
    if (totalQuantity.value >= 15 && subTotal.value >= 4000000) {
        return 0
    }
    if (appliedSpecialDiscount.value?.type === 'freeship') {
        return 0
    }
    return shippingFee.value
})

// Tổng giảm giá (tự động + mã giảm giá)
const totalDiscountAmount = computed(() => {
    return autoDiscountAmount.value + specialDiscountAmount.value
})

// Tổng tiền cuối cùng
const finalTotal = computed(() => {
    return subTotal.value + finalShippingFee.value - totalDiscountAmount.value
})

const formatPrice = (price) => {
    if (!price) return '0 ₫'
    const numPrice = typeof price === 'string' ? parseFloat(price.replace(/[^\d.]/g, '')) : price
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(numPrice)
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

const handleCreateOrder = async () => {
    const token = authStore.accessToken
    if (!token) {
        errorMessage.value = 'Vui lòng đăng nhập lại!'
        return
    }

    if (orderItems.value.length === 0) {
        errorMessage.value = 'Không có sản phẩm nào để đặt hàng!'
        return
    }

    console.log('Starting order creation...', {
        orderItemsCount: orderItems.value.length,
        paymentMethod: paymentMethod.value,
        finalTotal: finalTotal.value
    })

    try {
        await executeAsync(async () => {
            // Get note from shipping info
            const orderNote = shippingInfo.value.note || ''

            // Prepare order items
            const items = orderItems.value.map(item => ({
                product_id: item.product_id,
                quantity: item.quantity,
                price_at_order: item.price,
                sub_total: (item.price || 0) * item.quantity,
                note: orderNote
            }))

            // Get payment method ID
            const paymentMethodId = getPaymentMethodId(paymentMethod.value)

            // Lấy thông tin giao hàng từ sessionStorage
            const shippingName = sessionStorage.getItem('shipping_name') || ''
            const shippingAddress = sessionStorage.getItem('shipping_address') || ''
            const shippingPhone = sessionStorage.getItem('shipping_phone') || ''

            console.log('📦 PaymentPage - Shipping info from sessionStorage:', {
                shipping_name: shippingName,
                shipping_address: shippingAddress,
                shipping_phone: shippingPhone,
                has_shipping_name: !!shippingName,
                has_shipping_address: !!shippingAddress,
                has_shipping_phone: !!shippingPhone
            })

            // Nếu không có shipping info từ sessionStorage, thử lấy từ shippingInfo (nếu có)
            let finalShippingName = shippingName || shippingInfo.value?.username || ''
            let finalShippingAddress = shippingAddress || shippingInfo.value?.address || ''
            let finalShippingPhone = shippingPhone || shippingInfo.value?.phone_number || ''

            // Nếu vẫn không có, thử lấy từ userInfo
            if (!finalShippingName || !finalShippingAddress || !finalShippingPhone) {
                console.warn('⚠️ PaymentPage - Missing shipping info from sessionStorage, trying userInfo')
                if (userStore.userInfo) {
                    finalShippingName = finalShippingName || userStore.userInfo.username || ''
                    finalShippingAddress = finalShippingAddress || userStore.userInfo.address || ''
                    finalShippingPhone = finalShippingPhone || userStore.userInfo.phone_number || ''
                }
            }

            // Validate: Đảm bảo có đủ thông tin shipping trước khi tạo order
            if (!finalShippingName || !finalShippingAddress || !finalShippingPhone) {
                throw new Error('Thiếu thông tin giao hàng. Vui lòng quay lại trang xác nhận thông tin giao hàng!')
            }

            console.log('✅ PaymentPage - Final shipping info to send:', {
                shipping_name: finalShippingName,
                shipping_address: finalShippingAddress,
                shipping_phone: finalShippingPhone
            })

            // Prepare order data (KHÔNG gửi payment object vì backend có thể tự động tạo payment từ đó)
            // Payment sẽ được tạo riêng sau khi tạo đơn thành công
            const orderData = {
                discount_id: appliedSpecialDiscount.value?.discount_id || null,
                discount_code: appliedSpecialDiscount.value?.code || null,
                total: subTotal.value,
                shipping_fee: finalShippingFee.value,
                auto_discount_percent: autoDiscountPercent.value,
                auto_discount_amount: autoDiscountAmount.value,
                discount_amount: specialDiscountAmount.value,
                total_discount_amount: totalDiscountAmount.value,
                final_total: finalTotal.value,
                shipping_name: finalShippingName,
                shipping_address: finalShippingAddress,
                shipping_phone: finalShippingPhone,
                payment: {
                    method_id: paymentMethodId,
                    amount: finalTotal.value,
                    status: 'PROCESSING' // Cả COD và MOMO đều bắt đầu với PROCESSING
                },
                items: items
            }

            // Log chi tiết để debug
            console.log('📤 PaymentPage - Sending order data to API:', JSON.stringify(orderData, null, 2))
            console.log('📤 PaymentPage - Shipping fields in orderData:', {
                shipping_name: orderData.shipping_name,
                shipping_address: orderData.shipping_address,
                shipping_phone: orderData.shipping_phone,
                has_shipping_name: !!orderData.shipping_name,
                has_shipping_address: !!orderData.shipping_address,
                has_shipping_phone: !!orderData.shipping_phone
            })

            const response = await orderStore.createNewOrder(orderData)

            console.log('📥 PaymentPage - Order creation response:', response?.data)

            console.log('Order creation response:', response.data)

            if (response.data.success) {
                // Lấy order_id từ response
                const orderId = response.data.data?.order_id || response.data.order_id || response.data.data?.id

                if (!orderId) {
                    throw new Error('Không thể lấy order ID từ response!')
                }

                // Payment đã được tạo tự động bởi backend từ orderData.payment
                // Không cần tạo payment ở frontend nữa để tránh duplicate
                console.log('Payment should be created by backend from orderData.payment')

                // Đánh dấu đơn hàng đã hoàn thành
                isOrderCompleted.value = true
                // Lưu flag vào sessionStorage để ngăn user back về trang thanh toán
                sessionStorage.setItem('order_completed', 'true')
                sessionStorage.setItem('completed_order_id', orderId.toString())

                console.log('Order created successfully, orderId:', orderId)

                // Xóa shipping info từ sessionStorage sau khi tạo order thành công
                sessionStorage.removeItem('shipping_name')
                sessionStorage.removeItem('shipping_address')
                sessionStorage.removeItem('shipping_phone')

                // Nếu thanh toán MOMO, lưu orderId và hiển thị QR code
                if (paymentMethod.value === 'MOMO') {
                    createdOrderId.value = orderId
                    console.log('MOMO payment, showing QR code')
                } else {
                    // Nếu COD, thay thế payment page bằng cart page, rồi chuyển về trang đơn hàng
                    // Để khi bấm back từ orders-page sẽ về cart thay vì payment
                    console.log('COD payment, redirecting to orders page')
                    router.replace('/cart')
                    // Sử dụng nextTick để đảm bảo replace cart đã hoàn thành trước khi push orders-page
                    await new Promise(resolve => setTimeout(resolve, 100))
                    router.push('/orders-page')
                }

                // Reload cart to reflect changes (sau khi đã redirect hoặc set createdOrderId)
                const userId = authStore.userId
                if (userId) {
                    // Reload cart trong background, không chờ
                    cartStore.loadCartFromBackend(userId).catch(err => {
                        console.error('Error reloading cart:', err)
                    })
                }
            } else {
                throw new Error(response.data.message || 'Tạo đơn hàng thất bại!')
            }
        }, {
            defaultErrorMessage: 'Không thể tạo đơn hàng!',
            onError: (error) => {
                console.error('Order creation error:', error)
                errorMessage.value = error.response?.data?.message || error.message
            }
        })
    } catch (error) {
        console.error('Unexpected error in handleCreateOrder:', error)
        errorMessage.value = error.message || 'Có lỗi xảy ra khi tạo đơn hàng!'
    }
}

const handleCancel = () => {
    router.push('/cart')
}

// Tạo đơn hàng cho MOMO (giống handleCreateOrder nhưng không redirect)
const initiateMoMoPayment = async (orderId) => {
    try {
        const paymentResponse = await paymentStore.createMoMoPaymentStore({
            orderId,
            amount: finalTotal.value,
            orderInfo: `Thanh toán đơn hàng #${orderId}`
        })

        const responseData = paymentResponse?.data || paymentResponse
        const paymentPayload = responseData?.data || responseData
        const payUrl = paymentPayload?.payUrl || paymentPayload?.pay_url

        if (payUrl) {
            sessionStorage.setItem('momo_payment_order_id', orderId.toString())
            sessionStorage.setItem('momo_payment_timestamp', Date.now().toString())
            window.location.href = payUrl
        } else {
            console.warn('Không tìm thấy payUrl trong dữ liệu thanh toán:', paymentPayload)
            errorMessage.value = 'Không tìm thấy link thanh toán MoMo.'
        }
    } catch (error) {
        console.error('Lỗi khi chuyển đến trang thanh toán MoMo:', error)
        errorMessage.value = error.response?.data?.message || error.message || 'Không thể mở trang thanh toán MoMo.'
    }
}

const handleCreateOrderForMoMo = async () => {
    await handleCreateOrder()

    if (createdOrderId.value) {
        await initiateMoMoPayment(createdOrderId.value)
    }
}
</script>
