<template>
    <Teleport to="body">
        <div v-if="show" data-deposit-modal class="fixed inset-0 z-[9999] flex items-center justify-center "
            style="position: fixed !important; z-index: 9999 !important;" @click.self="handleClose">
            <div ref="modalRef"
                class="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto relative z-[10000]"
                :style="{
                    transform: `translate(${position.x}px, ${position.y}px)`,
                    position: 'relative',
                    zIndex: 10000
                }" @click.stop>
                <div class="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <!-- Header - có thể kéo modal từ đây -->
                    <div class="flex items-center justify-between mb-4 cursor-move" @mousedown="handleMouseDown">
                        <h3 class="text-lg font-bold text-gray-900 select-none">Yêu cầu đặt cọc</h3>
                        <button @click="handleClose" class="text-gray-400 hover:text-gray-600 cursor-pointer no-drag">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>

                    <!-- Content -->
                    <div class="space-y-4">
                        <!-- Thông báo quy định -->
                        <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                            <div class="flex">
                                <div class="flex-shrink-0">
                                    <svg class="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fill-rule="evenodd"
                                            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                            clip-rule="evenodd" />
                                    </svg>
                                </div>
                                <div class="ml-3">
                                    <p class="text-sm font-medium text-yellow-800">
                                        Quy định của cửa hàng
                                    </p>
                                    <p class="mt-1 text-sm text-yellow-700">
                                        Đơn hàng có số lượng từ <strong>10 sản phẩm</strong> trở lên cần đặt cọc
                                        <strong>50%</strong> tổng giá trị đơn hàng (không tính phí vận chuyển) trước
                                        khi
                                        đơn hàng được xử lý.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <!-- Thông tin đặt cọc -->
                        <div v-if="depositAmount > 0 || depositPayment" class="space-y-3">
                            <!-- Debug info -->
                            <div v-if="depositPayment && !depositPayment.amount && !depositPayment.payUrl"
                                class="bg-red-50 border border-red-300 rounded p-3 text-sm text-red-700">
                                ⚠️ Thiếu thông tin thanh toán. Vui lòng liên hệ cửa hàng.
                            </div>
                            <div class="flex justify-between items-center">
                                <span class="text-gray-700">Số tiền cần đặt cọc:</span>
                                <span class="text-lg font-bold text-green-600">{{
                                    depositPayment?.amount ? formatCurrency(depositPayment.amount)
                                        : (depositAmount > 0 ? formatCurrency(depositAmount) : 'Đang tải...')
                                }}</span>
                            </div>

                            <!-- QR Code (chỉ hiển thị sau khi tạo đơn và có depositPayment) -->
                            <div v-if="depositPayment && depositPayment.qrCodeUrl"
                                class="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
                                <p class="text-sm text-gray-600 mb-2">Quét mã QR để thanh toán</p>
                                <img :src="depositPayment.qrCodeUrl" alt="QR Code"
                                    class="w-48 h-48 border-2 border-gray-300 rounded" />
                            </div>

                            <!-- Nút thanh toán -->
                            <div class="flex flex-col gap-2">
                                <button @click="handlePayment"
                                    class="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold flex items-center justify-center gap-2 cursor-pointer"
                                    :disabled="isProcessing || (!orderId && !orderData)">
                                    <span v-if="!isProcessing">Thanh toán cọc qua MoMo</span>
                                    <span v-else class="flex items-center gap-2">
                                        <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg"
                                            fill="none" viewBox="0 0 24 24">
                                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                                stroke-width="4"></circle>
                                            <path class="opacity-75" fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                                            </path>
                                        </svg>
                                        Đang xử lý...
                                    </span>
                                </button>

                                <button @click="handleClose"
                                    class="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors cursor-pointer">
                                    Hủy
                                </button>
                            </div>
                        </div>

                        <!-- Thông báo khi chưa có depositAmount và depositPayment -->
                        <div v-else class="space-y-3">
                            <div class="bg-yellow-50 border border-yellow-300 rounded p-4">
                                <p class="text-sm text-yellow-800">Đang tải thông tin thanh toán...</p>
                            </div>
                        </div>

                        <!-- Trạng thái đã đặt cọc -->
                        <div v-if="deposit && deposit.paid" class="bg-green-50 border-l-4 border-green-400 p-4 rounded">
                            <div class="flex">
                                <div class="flex-shrink-0">
                                    <svg class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fill-rule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                            clip-rule="evenodd" />
                                    </svg>
                                </div>
                                <div class="ml-3">
                                    <p class="text-sm font-medium text-green-800">
                                        Đã đặt cọc thành công
                                    </p>
                                    <p class="mt-1 text-sm text-green-700">
                                        Đơn hàng của bạn đã được đặt cọc. Đơn hàng sẽ được xử lý trong thời gian sớm
                                        nhất.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </Teleport>
</template>

<script setup>
import { ref, computed, watch, onUnmounted } from 'vue'
import { useOrderStore } from '@/stores/orders'
import { useAuthStore } from '@/stores/auth'
import { useUserStore } from '@/stores/user'
import { useCartStore } from '@/stores/cart'
import { useDragModal } from '@/composables/useDragModal'


const props = defineProps({
    show: {
        type: Boolean,
        default: false
    },
    deposit: {
        type: Object,
        default: null
    },
    depositPayment: {
        type: Object,
        default: null
    },
    orderId: {
        type: [Number, String],
        default: null
    },
    // Các props cần thiết để tạo đơn hàng
    orderData: {
        type: Object,
        default: null
    },
    depositAmount: {
        type: Number,
        default: 0
    }
})

const emit = defineEmits(['close', 'payment', 'order-created'])

const isProcessing = ref(false)
const orderStore = useOrderStore()
const authStore = useAuthStore()
const userStore = useUserStore()
const cartStore = useCartStore()
// Drag functionality để di chuyển modal
const modalRef = ref(null)
// Tạo props object với showModal để useDragModal nhận đúng
const dragModalProps = {
    get showModal() {
        return props.show
    }
}
const { position, handleMouseDown } = useDragModal(dragModalProps)

const handleClose = () => {
    if (!isProcessing.value) {
        emit('close')
    }
}

const handlePayment = async () => {
    if (isProcessing.value) return

    isProcessing.value = true

    try {
        // Nếu đã có orderId, chỉ mở link thanh toán
        if (props.orderId) {
            if (!props.depositPayment) {
                throw new Error('Không tìm thấy thông tin thanh toán')
            }

            // Kiểm tra nếu là mobile, dùng deeplink, nếu không dùng payUrl
            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
            const paymentUrl = isMobile && props.depositPayment.deeplink
                ? props.depositPayment.deeplink
                : props.depositPayment.payUrl

            if (!paymentUrl) {
                throw new Error('Không tìm thấy link thanh toán')
            }

            // Lưu orderId vào sessionStorage để xử lý redirect
            sessionStorage.setItem('deposit_order_id', props.orderId.toString())

            // Mở link thanh toán
            window.location.href = paymentUrl
            return
        }

        // Nếu chưa có orderId, tạo đơn hàng trước
        if (!props.orderData) {
            console.log('💰 Chưa có orderData, emit payment event để xử lý ở parent...')
            emit('payment')
            isProcessing.value = false
            return
        }

        console.log('💰 Tạo đơn hàng để đặt cọc...', {
            orderItemsCount: props.orderData.items?.length || 0,
            paymentMethod: props.orderData.payment?.method_id,
            depositAmount: props.depositAmount
        })

        const token = authStore.accessToken
        if (!token) {
            throw new Error('Vui lòng đăng nhập lại!')
        }

        // Tạo đơn hàng
        const response = await orderStore.createNewOrder(props.orderData)

        if (response.data.success) {
            // Lấy order data từ response
            const orderDataFromResponse = response.data.data
            const orderId = orderDataFromResponse?.order_id || response.data.order_id || orderDataFromResponse?.id

            if (!orderId) {
                throw new Error('Không thể lấy order ID từ response!')
            }

            // Lưu deposit fields từ response
            const depositRequired = orderDataFromResponse?.deposit_required || false
            const deposit = orderDataFromResponse?.deposit || null
            const depositPayment = orderDataFromResponse?.deposit_payment || null

            console.log('✅ Order created for deposit, orderId:', orderId)
            console.log('💰 Deposit info:', {
                depositRequired,
                deposit,
                depositPayment
            })

            // Xóa shipping info từ sessionStorage
            sessionStorage.removeItem('shipping_name')
            sessionStorage.removeItem('shipping_address')
            sessionStorage.removeItem('shipping_phone')

            // Reload cart
            const userId = authStore.userId
            if (userId) {
                cartStore.loadCartFromBackend(userId).catch(err => {
                    console.error('Error reloading cart:', err)
                })
            }

            // Mở link thanh toán MoMo
            if (depositPayment?.payUrl || depositPayment?.deeplink) {
                const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
                const paymentUrl = isMobile && depositPayment.deeplink
                    ? depositPayment.deeplink
                    : depositPayment.payUrl

                if (paymentUrl) {
                    // Lưu orderId vào sessionStorage để xử lý redirect
                    sessionStorage.setItem('deposit_order_id', orderId.toString())

                    // Emit event để parent component cập nhật state
                    emit('order-created', {
                        orderId,
                        deposit,
                        depositPayment
                    })

                    // Mở link thanh toán
                    window.location.href = paymentUrl
                } else {
                    throw new Error('Không tìm thấy link thanh toán')
                }
            } else {
                throw new Error('Không tìm thấy thông tin thanh toán đặt cọc')
            }
        } else {
            throw new Error(response.data.message || 'Tạo đơn hàng thất bại!')
        }
    } catch (error) {
        console.error('Error in handlePayment:', error)
        alert(error.response?.data?.message || error.message || 'Không thể tạo đơn hàng. Vui lòng thử lại!')
        isProcessing.value = false
    }
}

const formatCurrency = (amount) => {
    if (!amount) return '0 ₫'
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount)
}

// Lock body scroll khi modal mở và unlock khi đóng
watch(() => props.show, (newVal) => {
    if (newVal) {
        // Lock body scroll
        document.body.style.overflow = 'hidden'
        console.log('🔔 DepositModal is showing:', {
            show: props.show,
            deposit: props.deposit,
            depositPayment: props.depositPayment,
            orderId: props.orderId
        })
        // Debug: Kiểm tra xem modal có trong DOM không
        setTimeout(() => {
            const modalElement = document.querySelector('[data-deposit-modal]')
            console.log('🔍 Modal element in DOM:', modalElement)
            if (!modalElement) {
                console.error('❌ Modal không có trong DOM!')
            }
        }, 100)
    } else {
        // Unlock body scroll
        document.body.style.overflow = ''
    }
}, { immediate: true })

// Cleanup khi component unmount
onUnmounted(() => {
    document.body.style.overflow = ''
})
</script>