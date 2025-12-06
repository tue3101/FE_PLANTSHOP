import { api } from "../axiosConfig"
import type { ApiResponse } from "@/types/api.types"

// ==================== GET ====================
export const getInfoUser = async (): Promise<ApiResponse> => {
  const response = await api.get("/user/get-user")
  return response.data
}

export const getAllUser = async (): Promise<ApiResponse> => {
  const response = await api.get("/user/getall")
  return response.data
}

export const getAllUserDeleted = async (): Promise<ApiResponse> => {
  const response = await api.get("/user/getall-deleted")
  return response.data
}

// ==================== PUT ====================
export const updateInfoUser = async (
  userId: string | number,
  userData: Record<string, unknown>
): Promise<ApiResponse> => {
  const response = await api.put(`/user/update/${userId}`, userData)
  return response.data
}

export const restoreUser = async (userId: string | number): Promise<ApiResponse> => {
  const response = await api.put(`/user/restore/${userId}`, {})
  return response.data
}

// ==================== DELETE ====================
export const deleteUsers = async (userId: string | number): Promise<ApiResponse> => {
  const response = await api.delete(`/user/delete/${userId}`)
  return response.data
}

