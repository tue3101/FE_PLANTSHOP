import { defineStore } from "pinia"
import { ref, type Ref } from "vue"
import { getAllPaymentMethods as getAllPaymentMethodsAPI } from "@/api/payment-methods/paymentMethods"
import { useAuthStore } from "@/stores/auth"
import type { ApiResponse } from "@/types/api.types"

interface PaymentMethod {
  method_id?: number
  id?: number
  name?: string
  method_name?: string
  [key: string]: any
}

export const usePaymentMethodStore = defineStore("paymentMethod", () => {
  const authStore = useAuthStore()
  const paymentMethods: Ref<PaymentMethod[]> = ref([])

  // Lấy tất cả payment methods
  const getAllPaymentMethods = async (): Promise<ApiResponse> => {
    try {
      const response = await getAllPaymentMethodsAPI()
      if (response.data.success) {
        paymentMethods.value = response.data.data || []
      }
      return response.data
    } catch (error: any) {
      console.error("Get payment methods error:", error.message)
      throw error
    }
  }

  // Map payment method string sang method_id
  const getPaymentMethodId = (methodName: string): number => {
    if (!paymentMethods.value || paymentMethods.value.length === 0) {
      console.warn("Payment methods not loaded yet, using fallback")
      return methodName === "COD" ? 1 : 2 // Fallback: COD = 1, MOMO = 2
    }

    const method = paymentMethods.value.find(
      (m) =>
        m.name?.toUpperCase() === methodName.toUpperCase() ||
        m.method_name?.toUpperCase() === methodName.toUpperCase()
    )

    if (!method) {
      console.warn(`Payment method "${methodName}" not found, using fallback`)
      return methodName === "COD" ? 1 : 2 // Fallback: COD = 1, MOMO = 2
    }

    const methodId = method.method_id || method.id
    return methodId || (methodName === "COD" ? 1 : 2)
  }

  return {
    paymentMethods,
    getAllPaymentMethods,
    getPaymentMethodId,
  }
})
