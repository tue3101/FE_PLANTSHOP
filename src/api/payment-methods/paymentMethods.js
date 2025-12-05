import { api } from "../axiosConfig"

// ==================== GET ====================
export const getAllPaymentMethods = async () => {
  return api.get("/payment-methods/get-all")
}
