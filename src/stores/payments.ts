import { defineStore } from "pinia"
import { ref, type Ref } from "vue"
import {
  createMoMoPayment,
  createPayment as createPaymentAPI,
  getPaymentByOrderId,
  getPaymentById,
  getAllPayments,
  updatePaymentStatus as updatePaymentStatusAPI,
} from "@/api/payments/payments"
import type { Payment } from "@/types/store.types"
import type { ApiResponse } from "@/types/api.types"

interface MoMoPaymentData {
  orderId: string | number
  amount: number
  orderInfo?: string | null
}

interface PaymentData {
  status: string
  [key: string]: any
}

export const usePaymentStore = defineStore("payment", () => {
  const payments: Ref<Payment[]> = ref([])
  const currentPayment: Ref<Payment | null> = ref(null)

  // Tạo payment request MoMo
  const createMoMoPaymentStore = async (paymentData: MoMoPaymentData): Promise<any> => {
    try {
      const { orderId, amount, orderInfo } = paymentData
      const response = await createMoMoPayment(orderId, amount, orderInfo)

      // Response từ apiClient đã được unwrap bởi interceptor
      // apiClient.interceptors.response.use((response) => response.data)
      // Vậy response ở đây chính là response.data từ axios

      // Trường hợp 1: Backend trả về { success: true, data: {...} }
      if (response.data && response.data.success && response.data.data) {
        return { data: response.data }
      }

      // Trường hợp 2: Backend trả về trực tiếp data object (có qrCodeUrl, payUrl, etc.)
      if (
        response.data &&
        (response.data.qrCodeUrl ||
          response.data.qr_code_url ||
          response.data.payUrl ||
          response.data.pay_url)
      ) {
        return { data: { success: true, data: response.data } }
      }

      // Trường hợp 3: Response không có format mong đợi, trả về như cũ
      return { data: { success: true, data: response.data } }
    } catch (error) {
      console.error("Create MoMo payment error:", error)
      throw error
    }
  }

  // Tạo payment record sau khi tạo đơn hàng (chỉ tạo nếu chưa tồn tại)
  const createPaymentStore = async (
    orderId: string | number,
    paymentData: PaymentData
  ): Promise<ApiResponse> => {
    try {
      // Kiểm tra xem payment đã tồn tại chưa (đợi một chút để đảm bảo backend đã xử lý xong)
      await new Promise((resolve) => setTimeout(resolve, 100))

      try {
        const existingPayment = await getPaymentByOrderId(orderId)
        if (existingPayment.data.success && existingPayment.data.data) {
          // Payment đã tồn tại, update thay vì tạo mới
          const payment = existingPayment.data.data
          console.log("Payment already exists. Payment object:", payment)

          // Thử nhiều cách để lấy payment_id
          const paymentId =
            payment.payment_id ||
            payment.id ||
            payment.paymentId ||
            (typeof payment === "number" ? payment : null)

          if (paymentId) {
            console.log("Payment already exists, updating instead of creating:", paymentId)
            return await updatePaymentStatusAPI(paymentId, paymentData.status)
          } else {
            console.warn("Payment exists but no payment_id found. Payment object:", payment)
            // Vẫn tạo mới nếu không lấy được payment_id
          }
        }
      } catch (getError: any) {
        // Payment chưa tồn tại (404 hoặc lỗi khác), tạo mới
        console.log("Payment does not exist, creating new payment. Error:", getError.message)
      }

      // Tạo payment mới
      const response = await createPaymentAPI(orderId, paymentData)
      if (response.data.success) {
        return response.data
      }
      throw new Error(response.data.message || "Tạo payment thất bại!")
    } catch (error: any) {
      // Nếu lỗi là payment đã tồn tại, thử update
      if (
        error.response?.status === 409 ||
        error.response?.data?.message?.includes("already exists")
      ) {
        try {
          const existingPayment = await getPaymentByOrderId(orderId)
          if (existingPayment.data.success && existingPayment.data.data) {
            const paymentId =
              existingPayment.data.data.payment_id || existingPayment.data.data.id
            console.log("Payment was created by backend, updating status:", paymentId)
            return await updatePaymentStatusAPI(paymentId, paymentData.status)
          }
        } catch (updateError) {
          console.error("Error updating existing payment:", updateError)
        }
      }
      console.error("Create payment error:", error.message)
      throw error
    }
  }

  // Tạo hoặc cập nhật payment (luôn kiểm tra và update nếu đã tồn tại)
  const createOrUpdatePaymentStore = async (
    orderId: string | number,
    paymentData: PaymentData
  ): Promise<ApiResponse> => {
    try {
      // Kiểm tra xem payment đã tồn tại chưa
      try {
        const existingPayment = await getPaymentByOrderId(orderId)
        if (existingPayment.data.success && existingPayment.data.data) {
          // Payment đã tồn tại, update
          const paymentId = existingPayment.data.data.payment_id || existingPayment.data.data.id
          console.log("Payment exists, updating payment:", paymentId)
          return await updatePaymentStatusAPI(paymentId, paymentData.status)
        }
      } catch (getError: any) {
        // Payment chưa tồn tại, tạo mới
        console.log("Payment does not exist, creating new payment")
      }

      // Tạo payment mới
      const response = await createPaymentAPI(orderId, paymentData)
      if (response.data.success) {
        return response.data
      }
      throw new Error(response.data.message || "Tạo payment thất bại!")
    } catch (error: any) {
      console.error("Create or update payment error:", error.message)
      throw error
    }
  }

  // Lấy payment theo order ID
  const getPaymentByOrderIdStore = async (orderId: string | number): Promise<ApiResponse> => {
    try {
      const response = await getPaymentByOrderId(orderId)
      if (response.data.success) {
        currentPayment.value = response.data.data
      }
      return response.data
    } catch (error: any) {
      console.error("Get payment by order id error:", error.message)
      throw error
    }
  }

  // Lấy payment theo payment ID
  const getPaymentByIdStore = async (paymentId: string | number): Promise<ApiResponse> => {
    try {
      const response = await getPaymentById(paymentId)
      if (response.data.success) {
        currentPayment.value = response.data.data
      }
      return response.data
    } catch (error: any) {
      console.error("Get payment by id error:", error.message)
      throw error
    }
  }

  // Cập nhật payment status
  const updatePaymentStatusStore = async (
    paymentId: string | number,
    status: string
  ): Promise<ApiResponse> => {
    try {
      const response = await updatePaymentStatusAPI(paymentId, status)
      if (response.data.success) {
        // Reload payment if needed
        if (currentPayment.value && currentPayment.value.payment_id === paymentId) {
          await getPaymentByIdStore(paymentId)
        }
        // Reload payments list if needed
        await getAllPaymentsStore()
      }
      return response.data
    } catch (error: any) {
      console.error("Update payment status error:", error.message)
      throw error
    }
  }

  // Lấy tất cả payments (cho admin)
  const getAllPaymentsStore = async (): Promise<ApiResponse> => {
    try {
      const response = await getAllPayments()
      if (response.data.success) {
        payments.value = response.data.data || []
      }
      return response.data
    } catch (error: any) {
      console.error("Get all payments error:", error.message)
      throw error
    }
  }

  return {
    payments,
    currentPayment,
    createMoMoPaymentStore,
    createPaymentStore,
    createOrUpdatePaymentStore,
    getPaymentByOrderIdStore,
    getPaymentByIdStore,
    updatePaymentStatusStore,
    getAllPaymentsStore,
  }
})

