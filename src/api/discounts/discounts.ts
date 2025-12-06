import { api } from "../axiosConfig"
import type { ApiResponse } from "@/types/api.types"

// ==================== GET ====================
export const getAllDiscount = async (): Promise<ApiResponse> => {
  const response = await api.get("/discount/getall")
  return response.data
}

export const getAllDiscountDeleted = async (): Promise<ApiResponse> => {
  const response = await api.get("/discount/getall-deleted")
  return response.data

}

// ==================== POST ====================
export const addDiscount = async (discountData: Record<string, unknown>): Promise<ApiResponse> => {
  const response = await api.post("/discount/add", discountData)
  return response.data
}

// ==================== PUT ====================
export const restoreDiscount = async (discountId: string | number): Promise<ApiResponse> => {
  const response = await api.put(`/discount/restore/${discountId}`, {})
  return response.data
}

export const updateDiscount = async (
  discountId: string | number,
  discountData: Record<string, unknown>
): Promise<ApiResponse> => {
  const response = await api.put(`/discount/update/${discountId}`, discountData)
  return response.data
}

// ==================== DELETE ====================
export const deleteDiscounts = async (discountId: string | number): Promise<ApiResponse> => {
  const response = await api.delete(`/discount/delete/${discountId}`)
  return response.data
}
