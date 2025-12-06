import { defineStore } from "pinia"
import { ref, type Ref } from "vue"
import { getDepositByOrderId, createDepositMoMoPayment } from "@/api/deposits/deposits"
import type { ApiResponse } from "@/types/api.types"

export const useDepositStore = defineStore("deposit", () => {
  const deposits: Ref<any[]> = ref([])
  const currentDeposit: Ref<any> = ref(null)

  // Lấy thông tin deposit theo orderId
  const getDepositByOrderIdStore = async (
    orderId: string | number
  ): Promise<ApiResponse> => {
    try {
      const response = await getDepositByOrderId(orderId)
      // apiClient interceptor đã unwrap response.data
      // Parse response với nhiều trường hợp khác nhau
      let depositData = null

      // Trường hợp 1: Response có format {success: true, data: {...}}
      if (response.data?.success && response.data?.data) {
        depositData = response.data.data
      }
      // Trường hợp 2: Response trực tiếp là data object
      else if (response.data && typeof response.data === "object") {
        depositData = response.data
      }

      return {
        success: true,
        data: depositData,
      } as ApiResponse
    } catch (error: any) {
      console.error("Get deposit by orderId error:", error.message)
      throw error
    }
  }

  // Tạo deposit MoMo payment
  const createDepositMoMoPaymentStore = async (
    orderId: string | number,
    amount: number,
    orderInfo: string | null = null
  ): Promise<ApiResponse> => {
    try {
      const response = await createDepositMoMoPayment(orderId, amount, orderInfo)
      // apiClient interceptor đã unwrap response.data
      return response.data
    } catch (error: any) {
      console.error("Create deposit MoMo payment error:", error.message)
      throw error
    }
  }

  return {
    deposits,
    currentDeposit,
    getDepositByOrderIdStore,
    createDepositMoMoPaymentStore,
  }
})

