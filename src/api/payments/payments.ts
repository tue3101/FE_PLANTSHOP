import { api } from "../axiosConfig"
import type { ApiResponse } from "@/types/api.types"
import type { AxiosRequestConfig } from "axios"

// ==================== GET ====================
export const getPaymentByOrderId = async (orderId: string | number): Promise<ApiResponse> => {
  return api.get(`/payments/order/${orderId}`)
}

export const getPaymentById = async (paymentId: string | number): Promise<ApiResponse> => {
  return api.get(`/payments/${paymentId}`)
}

export const getAllPayments = async (): Promise<ApiResponse> => {
  return api.get("/payments/get-all")
}

// ==================== POST ====================
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
 * @param orderId - Mã đơn hàng
 * @param amount - Số tiền thanh toán
 * @param orderInfo - Thông tin đơn hàng (tùy chọn)
 * @returns Response chứa qrCodeUrl và payUrl
 */
export const createMoMoPayment = async (
  orderId: string | number,
  amount: number,
  orderInfo: string | null = null
): Promise<ApiResponse> => {
  const data = {
    orderId,
    amount,
    orderInfo: orderInfo || `Thanh toán đơn hàng #${orderId}`,
  }
  return api.post("/payments/momo/create", data)
}

export const createPayment = async (
  orderId: string | number,
  paymentData: Record<string, unknown>
): Promise<ApiResponse> => {
  return api.post(`/payments/create/${orderId}`, paymentData)
}

// ==================== PUT ====================
export const updatePaymentStatus = async (
  paymentId: string | number,
  status: string
): Promise<ApiResponse> => {
  return api.put(`/payments/${paymentId}/status`, null, {
    params: { status },
  } as AxiosRequestConfig)
}

