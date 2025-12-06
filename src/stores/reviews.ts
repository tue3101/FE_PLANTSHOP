import { defineStore } from "pinia"
import { ref, type Ref } from "vue"
import {
  createReview,
  getAllReviews,
  getReviewsByProductId,
  getReviewsByUserId,
  getReviewById,
  getAllReviewsDeleted,
  updateReview,
  restoreReview,
  deleteReview,
} from "@/api/reviews/reviews"
import type { Review } from "@/types/store.types"
import type { ApiResponse } from "@/types/api.types"

export const useReviewStore = defineStore("review", () => {
  const reviews: Ref<Review[]> = ref([])
  const reviewsDeleted: Ref<Review[]> = ref([])
  const deletedReviews: Ref<Review[]> = ref([])
  const productReviews: Ref<Review[]> = ref([])
  const userReviews: Ref<Review[]> = ref([])
  const currentReview: Ref<Review | null> = ref(null)

  // Tạo đánh giá mới
  const createReviewStore = async (reviewData: Record<string, any>): Promise<ApiResponse> => {
    try {
      const response = await createReview(reviewData)
      if (response.data.success) {
        // Reload reviews for the product if needed
        if (reviewData.product_id) {
          await getReviewsByProductIdStore(reviewData.product_id)
        }
        return response.data
      }
      throw new Error(response.data.message || "Tạo đánh giá thất bại!")
    } catch (error: any) {
      console.error("Create review error:", error.message)
      throw error
    }
  }

  // Lấy tất cả đánh giá (cho admin) - chỉ lấy reviews hiện (chưa bị xóa)
  const getAllReviewsStore = async (): Promise<ApiResponse> => {
    try {
      const response = await getAllReviews()
      if (response.data.success) {
        reviews.value = response.data.data || []
      }
      return response.data
    } catch (error: any) {
      console.error("Get all reviews error:", error.message)
      throw error
    }
  }

  const getAllDeletedReviewsStore = async (): Promise<ApiResponse> => {
    try {
      const response = await getAllReviewsDeleted()
      if (response.data.success) {
        reviewsDeleted.value = response.data.data || []
      }
      return response.data
    } catch (error: any) {
      console.error("Get all deleted reviews error:", error.message)
      throw error
    }
  }

  // Lấy đánh giá theo productId
  const getReviewsByProductIdStore = async (productId: string | number): Promise<ApiResponse> => {
    try {
      const response = await getReviewsByProductId(productId)
      if (response.data.success) {
        productReviews.value = response.data.data || []
      }
      return response.data
    } catch (error: any) {
      console.error("Get reviews by product id error:", error.message)
      throw error
    }
  }

  // Lấy đánh giá theo userId
  const getReviewsByUserIdStore = async (userId: string | number): Promise<ApiResponse> => {
    try {
      const response = await getReviewsByUserId(userId)
      if (response.data.success) {
        userReviews.value = response.data.data || []
      }
      return response.data
    } catch (error: any) {
      console.error("Get reviews by user id error:", error.message)
      throw error
    }
  }

  // Lấy đánh giá theo reviewId
  const getReviewByIdStore = async (reviewId: string | number): Promise<ApiResponse> => {
    try {
      const response = await getReviewById(reviewId)
      if (response.data.success) {
        currentReview.value = response.data.data
      }
      return response.data
    } catch (error: any) {
      console.error("Get review by id error:", error.message)
      throw error
    }
  }

  // Cập nhật đánh giá
  const updateReviewStore = async (
    reviewId: string | number,
    reviewData: Record<string, any>
  ): Promise<ApiResponse> => {
    try {
      console.log("📤 Store: Gọi API UPDATE review:", {
        reviewId,
        endpoint: `/api/reviews/${reviewId}`,
        reviewData,
      })
      const response = await updateReview(reviewId, reviewData)
      console.log("📥 Store: Response từ API UPDATE:", response.data)
      if (response.data.success) {
        // Reload reviews if needed
        if (currentReview.value?.product_id) {
          await getReviewsByProductIdStore(currentReview.value.product_id)
        }
      }
      return response.data
    } catch (error: any) {
      console.error("❌ Store: Update review error:", error.message)
      throw error
    }
  }

  // Xóa đánh giá (ẩn đánh giá)
  const deleteReviewStore = async (reviewId: string | number): Promise<ApiResponse> => {
    try {
      const response = await deleteReview(reviewId)
      if (response.data.success) {
        // Tìm review bị xóa và chuyển sang deletedReviews
        const deletedReview = reviews.value.find((r) => r.review_id === reviewId)
        if (deletedReview) {
          // Chuyển sang deletedReviews
          deletedReviews.value.push({ ...deletedReview, is_deleted: true } as Review)
          // Xóa khỏi reviews hiện
          reviews.value = reviews.value.filter((r) => r.review_id !== reviewId)
        }
        // Cũng xóa khỏi productReviews và userReviews
        productReviews.value = productReviews.value.filter((r) => r.review_id !== reviewId)
        userReviews.value = userReviews.value.filter((r) => r.review_id !== reviewId)
      }
      return response.data
    } catch (error: any) {
      console.error("Delete review error:", error.message)
      throw error
    }
  }

  // Khôi phục đánh giá (restore)
  const restoreReviewStore = async (reviewId: string | number): Promise<ApiResponse> => {
    try {
      const response = await restoreReview(reviewId)
      if (response.data.success) {
        // Tìm review được khôi phục và chuyển về reviews
        const restoredReview = deletedReviews.value.find((r) => r.review_id === reviewId)
        if (restoredReview) {
          // Chuyển về reviews hiện
          reviews.value.push({ ...restoredReview, is_deleted: false } as Review)
          // Xóa khỏi deletedReviews
          deletedReviews.value = deletedReviews.value.filter((r) => r.review_id !== reviewId)
        }
      }
      return response.data
    } catch (error: any) {
      console.error("Restore review error:", error.message)
      throw error
    }
  }

  return {
    reviews,
    deletedReviews,
    reviewsDeleted,
    productReviews,
    userReviews,
    currentReview,
    createReviewStore,
    getAllReviewsStore,
    getAllDeletedReviewsStore,
    getReviewsByProductIdStore,
    getReviewsByUserIdStore,
    getReviewByIdStore,
    updateReviewStore,
    deleteReviewStore,
    restoreReviewStore,
  }
})
