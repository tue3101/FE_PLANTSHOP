import { defineStore } from "pinia"
import { ref } from "vue"
import { getDepositByOrderId } from "@/api/deposits/get"
import { createDepositMoMoPayment } from "@/api/deposits/post"

export const useDepositStore = defineStore("deposit", () => {
    const deposits = ref([])
    const currentDeposit = ref(null)

    // Lấy thông tin deposit theo orderId
    const getDepositByOrderIdStore = async (orderId) => {
        try {
            const response = await getDepositByOrderId(orderId)
            // apiClient interceptor đã unwrap response.data
            // Parse response với nhiều trường hợp khác nhau
            let depositData = null
            
            // Trường hợp 1: Response có format {success: true, data: {...}}
            if (response?.success && response?.data) {
                depositData = response.data
            }
            // Trường hợp 2: Response trực tiếp là data object
            else if (response && typeof response === 'object') {
                depositData = response
            }

            return {
                success: true,
                data: depositData
            }
        } catch (error) {
            console.error("Get deposit by orderId error:", error.message)
            throw error
        }
    }

    // Tạo deposit MoMo payment
    const createDepositMoMoPaymentStore = async (orderId, amount, orderInfo = null) => {
        try {
            const response = await createDepositMoMoPayment(orderId, amount, orderInfo)
            // apiClient interceptor đã unwrap response.data
            return response
        } catch (error) {
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
