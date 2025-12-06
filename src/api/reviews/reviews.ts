import { api } from "../axiosConfig"
import type { ApiResponse } from "@/types/api.types"

// ==================== GET ====================
export const getAllReviews = async (): Promise<ApiResponse> => {
  const response = await api.get("/reviews/get-all")
  return response.data
}

export const getReviewsByProductId = async (productId: string | number): Promise<ApiResponse> => {
  const response = await api.get(`/reviews/product/${productId}`)
  return response.data
}

export const getReviewsByUserId = async (userId: string | number): Promise<ApiResponse> => {
  const response = await api.get(`/reviews/user/${userId}`)
  return response.data
}

export const getReviewById = async (reviewId: string | number): Promise<ApiResponse> => {
  const response = await api.get(`/reviews/${reviewId}`)
  return response.data
}

export const getAllReviewsDeleted = async (): Promise<ApiResponse> => {
  const response = await api.get("/reviews/get-all-deleted")
  return response.data
}

// ==================== POST ====================
export const createReview = async (reviewData: Record<string, unknown>): Promise<ApiResponse> => {
  const response = await api.post("/reviews/add", reviewData)
  return response.data
}

// ==================== PUT ====================
export const updateReview = async (
  reviewId: string | number,
  reviewData: Record<string, unknown>
): Promise<ApiResponse> => {
  const response = await api.put(`/reviews/${reviewId}`, reviewData)
  return response.data
}

export const restoreReview = async (reviewId: string | number): Promise<ApiResponse> => {
  const response = await api.put(`/reviews/restore/${reviewId}`, {})
  return response.data
}

// ==================== DELETE ====================
export const deleteReview = async (reviewId: string | number): Promise<ApiResponse> => {
  const response = await api.delete(`/reviews/${reviewId}`)
  return response.data
}

