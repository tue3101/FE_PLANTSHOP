import { api } from "../axiosConfig"
import type { ApiResponse } from "@/types/api.types"

// ==================== GET ====================
export const getAllPaymentMethods = async (): Promise<ApiResponse> => {
  const response = await api.get("/payment-methods/get-all")
  return response.data
}

