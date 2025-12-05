import { api } from "../axiosConfig"

// ==================== GET ====================
export const getAllReviews = async () => {
  return api.get("/reviews/get-all")
}

export const getReviewsByProductId = async (productId) => {
  return api.get(`/reviews/product/${productId}`)
}

export const getReviewsByUserId = async (userId) => {
  return api.get(`/reviews/user/${userId}`)
}

export const getReviewById = async (reviewId) => {
  return api.get(`/reviews/${reviewId}`)
}

export const getAllReviewsDeleted = async () => {
  return api.get("/reviews/get-all-deleted")
}

// ==================== POST ====================
export const createReview = async (reviewData) => {
  return api.post("/reviews/add", reviewData)
}

// ==================== PUT ====================
export const updateReview = async (reviewId, reviewData) => {
  return api.put(`/reviews/${reviewId}`, reviewData)
}

export const restoreReview = async (reviewId) => {
  return api.put(`/reviews/restore/${reviewId}`, {})
}

// ==================== DELETE ====================
export const deleteReview = async (reviewId) => {
  return api.delete(`/reviews/${reviewId}`)
}
