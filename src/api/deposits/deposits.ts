import { api } from "../axiosConfig"
import type { ApiResponse } from "@/types/api.types"

// ==================== GET ====================
/**
 * Lấy thông tin deposit theo orderId
 * @param orderId - Mã đơn hàng
 * @returns Response chứa deposit info (bao gồm paid status)
 */
export const getDepositByOrderId = async (orderId: string | number): Promise<ApiResponse> => {
  const response = await api.get(`/deposits/order/${orderId}`)
  return response.data
}

// ==================== POST ====================
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
 * @param orderId - Mã đơn hàng
 * @param amount - Số tiền đặt cọc
 * @param orderInfo - Thông tin đơn hàng (tùy chọn)
 * @returns Response chứa deposit info và payment info (qrCodeUrl, payUrl, deeplink)
 */
export const createDepositMoMoPayment = async (
  orderId: string | number,
  amount: number,
  orderInfo: string | null = null
): Promise<ApiResponse> => {
  const data = {
    amount,
    orderInfo: orderInfo || `Đặt cọc đơn hàng #${orderId}`,
  }
  const response = await api.post(`/deposits/${orderId}/momo`, data)
  return response.data
}

