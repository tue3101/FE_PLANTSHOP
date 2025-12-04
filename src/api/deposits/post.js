import apiClient from "../axios";

/**
 * Tạo deposit payment request với MoMo
 * 
 * Flow đặt cọc MoMo:
 * 1. Frontend gọi API này → Backend tạo deposit record với paid = 0 và payment request với MoMo
 * 2. Backend gọi MoMo API: https://test-payment.momo.vn/v2/gateway/api/create
 * 3. MoMo redirect về Backend: http://localhost:1234/api/payments/momo/return
 * 4. Backend xử lý và redirect về Frontend: http://localhost:3000/payment/return?orderId=...&resultCode=...
 * 5. Frontend xử lý kết quả tại PaymentReturnPage.vue hoặc OrderPage.vue
 * 
 * @param {Number} orderId - Mã đơn hàng
 * @param {Number} amount - Số tiền đặt cọc
 * @param {String} orderInfo - Thông tin đơn hàng (tùy chọn)
 * @returns {Promise} Response chứa deposit info và payment info (qrCodeUrl, payUrl, deeplink)
 */
export const createDepositMoMoPayment = async (orderId, amount, orderInfo = null) => {
    const data = {
        amount,
        orderInfo: orderInfo || `Đặt cọc đơn hàng #${orderId}`
    }
    // Backend endpoint: POST /api/deposits/{orderId}/momo
    return apiClient.post(`/deposits/${orderId}/momo`, data)
}

