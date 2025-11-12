import apiClient from "../axios";

/**
 * Tạo payment request với MoMo
 * 
 * Flow thanh toán MoMo:
 * 1. Frontend gọi API này → Backend tạo payment request với MoMo
 * 2. Backend gọi MoMo API: https://test-payment.momo.vn/v2/gateway/api/create
 * 3. MoMo redirect về Backend: http://localhost:1234/api/payments/momo/return
 * 4. Backend xử lý và redirect về Frontend: http://localhost:3000/payment/return?orderId=...&resultCode=...
 * 5. Frontend xử lý kết quả tại PaymentReturnPage.vue
 * 
 * @param {Number} orderId - Mã đơn hàng
 * @param {Number} amount - Số tiền thanh toán
 * @param {String} orderInfo - Thông tin đơn hàng (tùy chọn)
 * @returns {Promise} Response chứa qrCodeUrl và payUrl
 */
export const createMoMoPayment = async (orderId, amount, orderInfo = null) => {
    const data = {
        orderId,
        amount,
        orderInfo: orderInfo || `Thanh toán đơn hàng #${orderId}`
    }
    // Backend endpoint: POST /api/payments/momo/create
    return apiClient.post('/payments/momo/create', data)
}

// Tạo payment record sau khi tạo đơn hàng
export const createPayment = async (orderId, paymentData) => {
    return apiClient.post(`/payments/create/${orderId}`, paymentData)
}

