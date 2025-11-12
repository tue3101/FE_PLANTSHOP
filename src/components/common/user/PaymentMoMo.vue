<template>
    <div class="payment-momo bg-white rounded-lg shadow p-6 mt-4">
        <h3 class="text-xl font-bold text-gray-800 mb-4">Thanh toán bằng MoMo</h3>

        <!-- Loading State -->
        <div v-if="isLoading" class="text-center py-8">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            <p class="mt-4 text-gray-600">Đang tạo QR code thanh toán...</p>
        </div>

        <!-- Error State -->
        <div v-if="error" class="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {{ error }}
        </div>

        <!-- Create Payment Button -->
        <div v-if="!qrCodeUrl && !isLoading" class="text-center">
            <button @click="handleCreatePayment" :disabled="isLoading"
                class="bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer">
                Tạo QR Code thanh toán
            </button>
        </div>

        <!-- QR Code Display -->
        <div v-if="paymentData" class="qr-code-container text-center">
            <!-- Chỉ hiển thị QR code nếu có URL hợp lệ (không phải momo://) -->
            <div v-if="qrCodeUrl && !qrCodeUrl.startsWith('momo://')">
                <h4 class="text-lg font-semibold text-gray-800 mb-4">Quét mã QR để thanh toán</h4>

                <!-- QR Code Image -->
                <div class="flex justify-center mb-4">
                    <img :src="qrCodeUrl" alt="MoMo QR Code" class="border-2 border-gray-200 rounded-lg"
                        style="width: 300px; height: 300px; object-fit: contain;" @error="handleImageError"
                        @load="handleImageLoad" />
                </div>
            </div>

            <!-- Nếu không có QR code image URL hợp lệ, hiển thị thông báo -->
            <div v-else class="mb-4">
                <p class="text-gray-600 mb-4">Sử dụng nút bên dưới để thanh toán</p>
            </div>

            <!-- Amount -->
            <p class="text-lg font-bold text-green-600 mb-4">
                Số tiền: {{ formatPrice(paymentData.amount) }}
            </p>

            <!-- Actions -->
            <div class="flex flex-col gap-3 items-center">
                <button @click="handleOpenWebPayment"
                    class="bg-green-600 hover:bg-green-700 text-white py-2.5 px-6 rounded-lg font-semibold transition-colors cursor-pointer w-full max-w-xs">
                    Thanh toán trên Web
                </button>
                <button v-if="paymentData?.payUrl || paymentData?.pay_url" @click="handleCopyPayUrl"
                    class="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2.5 px-6 rounded-lg font-semibold transition-colors cursor-pointer w-full max-w-xs">
                    Copy link thanh toán
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { usePaymentStore } from '@/stores/payments'
import QRCode from 'qrcode'

const props = defineProps({
    orderId: {
        type: Number,
        required: true
    },
    amount: {
        type: Number,
        required: true
    }
})

const paymentStore = usePaymentStore()
const isLoading = ref(false)
const qrCodeUrl = ref(null)
const paymentData = ref(null)
const error = ref(null)

const formatPrice = (price) => {
    if (!price) return '0 ₫'
    const numPrice = typeof price === 'string' ? parseFloat(price.replace(/[^\d.]/g, '')) : price
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(numPrice)
}

const handleCreatePayment = async () => {
    isLoading.value = true
    error.value = null

    try {
        const response = await paymentStore.createMoMoPaymentStore({
            orderId: props.orderId,
            amount: props.amount,
            orderInfo: `Thanh toán đơn hàng #${props.orderId}`
        })

        // Log toàn bộ response để debug
        console.log('Full payment response:', response)
        console.log('Response data:', response.data)

        // Xử lý response từ store
        // Response có thể có cấu trúc: { data: { success: true, data: {...} } } hoặc { data: {...} }
        const responseData = response.data || response

        console.log('ResponseData:', responseData)

        // Trường hợp 1: Response có format { success: true, data: {...} }
        if (responseData.success && responseData.data) {
            paymentData.value = responseData.data
            console.log('Payment data:', paymentData.value)

            // Lấy qrCodeUrl từ response (hỗ trợ nhiều tên field)
            // Tìm QR code image URL (không phải deep link momo://)
            const possibleQrUrl = responseData.data.qrCodeUrl ||
                responseData.data.qr_code_url ||
                responseData.data.qrCode ||
                responseData.data.qr_code ||
                responseData.data.qrCodeImage ||
                responseData.data.qr_code_image ||
                responseData.data.qrCodeBase64 ||
                responseData.data.qr_code_base64

            // Kiểm tra xem có phải là URL hình ảnh hợp lệ không (không phải momo://)
            if (possibleQrUrl && !possibleQrUrl.startsWith('momo://')) {
                qrCodeUrl.value = possibleQrUrl
            } else if (possibleQrUrl && possibleQrUrl.startsWith('data:image')) {
                // Nếu là base64 image
                qrCodeUrl.value = possibleQrUrl
            } else {
                // Nếu không có QR code image URL, tạo QR code từ payUrl
                const payUrl = responseData.data.payUrl || responseData.data.pay_url
                if (payUrl) {
                    console.log('Creating QR code from payUrl:', payUrl)
                    try {
                        // Tạo QR code từ payUrl và chuyển thành data URL (base64)
                        const qrCodeDataUrl = await QRCode.toDataURL(payUrl, {
                            width: 300,
                            margin: 2,
                            color: {
                                dark: '#000000',
                                light: '#FFFFFF'
                            }
                        })
                        qrCodeUrl.value = qrCodeDataUrl
                        console.log('QR Code generated successfully')
                    } catch (qrError) {
                        console.error('Error generating QR code:', qrError)
                        qrCodeUrl.value = null
                    }
                } else {
                    console.warn('QR Code image URL not found and no payUrl available. Available keys:', Object.keys(responseData.data || {}))
                    qrCodeUrl.value = null
                }
            }

            console.log('QR Code URL found:', qrCodeUrl.value)
        }
        // Trường hợp 2: Response trực tiếp có qrCodeUrl (không có wrapper)
        else if (responseData.qrCodeUrl || responseData.qr_code_url || responseData.qrCode || responseData.qr_code) {
            paymentData.value = responseData

            const possibleQrUrl = responseData.qrCodeUrl ||
                responseData.qr_code_url ||
                responseData.qrCode ||
                responseData.qr_code ||
                responseData.qrCodeImage ||
                responseData.qr_code_image ||
                responseData.qrCodeBase64 ||
                responseData.qr_code_base64

            // Kiểm tra xem có phải là URL hình ảnh hợp lệ không (không phải momo://)
            if (possibleQrUrl && !possibleQrUrl.startsWith('momo://')) {
                qrCodeUrl.value = possibleQrUrl
            } else if (possibleQrUrl && possibleQrUrl.startsWith('data:image')) {
                qrCodeUrl.value = possibleQrUrl
            } else {
                // Nếu không có QR code image URL, tạo QR code từ payUrl
                const payUrl = responseData.payUrl || responseData.pay_url
                if (payUrl) {
                    console.log('Creating QR code from payUrl (direct):', payUrl)
                    try {
                        // Tạo QR code từ payUrl và chuyển thành data URL (base64)
                        const qrCodeDataUrl = await QRCode.toDataURL(payUrl, {
                            width: 300,
                            margin: 2,
                            color: {
                                dark: '#000000',
                                light: '#FFFFFF'
                            }
                        })
                        qrCodeUrl.value = qrCodeDataUrl
                        console.log('QR Code generated successfully (direct)')
                    } catch (qrError) {
                        console.error('Error generating QR code:', qrError)
                        qrCodeUrl.value = null
                    }
                } else {
                    qrCodeUrl.value = null
                }
            }

            console.log('QR Code URL found (direct):', qrCodeUrl.value)
        }
        // Trường hợp 3: Lỗi hoặc không có dữ liệu
        else {
            console.error('No QR code URL found in response. Full response:', responseData)
            error.value = responseData.message || responseData.error || 'Không thể tạo payment request. Vui lòng kiểm tra console để xem chi tiết.'
        }
    } catch (err) {
        console.error('Lỗi khi tạo payment:', err)

        // Xử lý các loại lỗi khác nhau
        if (err.response?.data?.message) {
            error.value = err.response.data.message
        } else if (err.response?.data?.error) {
            error.value = err.response.data.error
        } else if (err.message) {
            error.value = err.message
        } else {
            error.value = 'Có lỗi xảy ra khi tạo payment. Vui lòng thử lại sau.'
        }

        // Log chi tiết để debug
        console.error('Payment error details:', {
            status: err.response?.status,
            statusText: err.response?.statusText,
            data: err.response?.data,
            message: err.message
        })
    } finally {
        isLoading.value = false
    }
}

const handleOpenWebPayment = () => {
    const payUrl = paymentData.value?.payUrl || paymentData.value?.pay_url
    if (payUrl) {
        // Lưu orderId vào sessionStorage để detect khi user quay lại
        sessionStorage.setItem('momo_payment_order_id', props.orderId.toString())
        sessionStorage.setItem('momo_payment_timestamp', Date.now().toString())
        window.location.href = payUrl
    } else {
        error.value = 'Không tìm thấy link thanh toán'
    }
}

const handleCopyPayUrl = async () => {
    const payUrl = paymentData.value?.payUrl || paymentData.value?.pay_url
    if (payUrl) {
        try {
            await navigator.clipboard.writeText(payUrl)
            // Hiển thị thông báo tạm thời
            const originalError = error.value
            error.value = null
            setTimeout(() => {
                alert('Đã copy link thanh toán!')
            }, 100)
        } catch (err) {
            console.error('Lỗi copy:', err)
            error.value = 'Không thể copy link thanh toán'
        }
    } else {
        error.value = 'Không tìm thấy link thanh toán'
    }
}

// Xử lý lỗi khi load hình ảnh QR code
const handleImageError = (event) => {
    console.error('QR Code image failed to load:', qrCodeUrl.value)
    error.value = 'Không thể tải QR code. Vui lòng thử lại hoặc sử dụng link thanh toán.'
    // Ẩn hình ảnh lỗi
    event.target.style.display = 'none'
}

// Xử lý khi hình ảnh load thành công
const handleImageLoad = () => {
    console.log('QR Code image loaded successfully')
    error.value = null
}
</script>

<style scoped>
.qr-code-container img {
    max-width: 100%;
    height: auto;
}
</style>
