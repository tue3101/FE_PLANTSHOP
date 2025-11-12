import { defineStore } from "pinia"
import { ref } from "vue"
import { getAllPaymentMethods as getAllPaymentMethodsAPI } from "@/api/payment-methods/get"
import { useAuthStore } from "@/stores/auth"

export const usePaymentMethodStore = defineStore("paymentMethod", () => {
    const authStore = useAuthStore()
    const paymentMethods = ref([])

    // Lấy tất cả payment methods
    const getAllPaymentMethods = async () => {
        const token = authStore.accessToken
        try {
            const response = await getAllPaymentMethodsAPI(token)
            if (response.data.success) {
                paymentMethods.value = response.data.data || []
            }
            return response
        } catch (error) {
            console.error("Get payment methods error:", error.message)
            throw error
        }
    }

    // Map payment method string sang method_id
    const getPaymentMethodId = (methodName) => {
        if (!paymentMethods.value || paymentMethods.value.length === 0) {
            console.warn('Payment methods not loaded yet, using fallback')
            return methodName === 'COD' ? 1 : 2 // Fallback: COD = 1, MOMO = 2
        }

        const method = paymentMethods.value.find(m =>
            m.name?.toUpperCase() === methodName.toUpperCase() ||
            m.method_name?.toUpperCase() === methodName.toUpperCase()
        )

        if (!method) {
            console.warn(`Payment method "${methodName}" not found, using fallback`)
            return methodName === 'COD' ? 1 : 2 // Fallback: COD = 1, MOMO = 2
        }

        const methodId = method.method_id || method.id
        return methodId
    }

    return {
        paymentMethods,
        getAllPaymentMethods,
        getPaymentMethodId,
    }
})

