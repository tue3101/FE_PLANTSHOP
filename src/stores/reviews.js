import { defineStore } from "pinia"
import { ref } from "vue"
import { createReview } from "@/api/reviews/post"
import { 
    getAllReviews, 
    getReviewsByProductId, 
    getReviewsByUserId,
    getReviewById,
    getAllReviewsDeleted
} from "@/api/reviews/get"
import { updateReview, restoreReview } from "@/api/reviews/put"
import { deleteReview } from "@/api/reviews/delete"
import { useAuthStore } from "@/stores/auth"

export const useReviewStore = defineStore("review", () => {
    const authStore = useAuthStore()
    const reviews = ref([])
    const reviewsDeleted = ref([])
    const deletedReviews = ref([]) 
    const productReviews = ref([])
    const userReviews = ref([])
    const currentReview = ref(null)

    // Tạo đánh giá mới
    const createReviewStore = async (reviewData) => {
        const token = authStore.accessToken
        try {
            const response = await createReview(token, reviewData)
            if (response.data.success) {
                // Reload reviews for the product if needed
                if (reviewData.product_id) {
                    await getReviewsByProductIdStore(reviewData.product_id)
                }
                return response
            }
            throw new Error(response.data.message || 'Tạo đánh giá thất bại!')
        } catch (error) {
            console.error("Create review error:", error.message)
            throw error
        }
    }

    // Lấy tất cả đánh giá (cho admin) - chỉ lấy reviews hiện (chưa bị xóa)
    const getAllReviewsStore = async () => {
        const token = authStore.accessToken
        try {
            const response = await getAllReviews(token)
            if (response.data.success) {
                reviews.value = response.data.data || []
            }
            return response
        } catch (error) {
            console.error("Get all reviews error:", error.message)
            throw error
        }
    }

    const getAllDeletedReviewsStore = async () => {
        const token = authStore.accessToken
        try {
            const response = await getAllReviewsDeleted(token)
            if (response.data.success) {
                reviewsDeleted.value = response.data.data || []
            }
            return response
        } catch (error) {
            console.error("Get all deleted reviews error:", error.message)
            throw error
        }
    }

    // Lấy đánh giá theo productId
    const getReviewsByProductIdStore = async (productId) => {
        try {
            const response = await getReviewsByProductId(productId)
            if (response.data.success) {
                productReviews.value = response.data.data || []
            }
            return response
        } catch (error) {
            console.error("Get reviews by product id error:", error.message)
            throw error
        }
    }

    // Lấy đánh giá theo userId
    const getReviewsByUserIdStore = async (userId) => {
        const token = authStore.accessToken
        try {
            const response = await getReviewsByUserId(userId, token)
            if (response.data.success) {
                userReviews.value = response.data.data || []
            }
            return response
        } catch (error) {
            console.error("Get reviews by user id error:", error.message)
            throw error
        }
    }

    // Lấy đánh giá theo reviewId
    const getReviewByIdStore = async (reviewId) => {
        const token = authStore.accessToken
        try {
            const response = await getReviewById(reviewId, token)
            if (response.data.success) {
                currentReview.value = response.data.data
            }
            return response
        } catch (error) {
            console.error("Get review by id error:", error.message)
            throw error
        }
    }

    // Cập nhật đánh giá
    const updateReviewStore = async (reviewId, reviewData) => {
        const token = authStore.accessToken
        try {
            console.log('📤 Store: Gọi API UPDATE review:', {
                reviewId,
                endpoint: `/api/reviews/${reviewId}`,
                reviewData
            })
            const response = await updateReview(reviewId, token, reviewData)
            console.log('📥 Store: Response từ API UPDATE:', response.data)
            if (response.data.success) {
                // Reload reviews if needed
                if (currentReview.value?.product_id) {
                    await getReviewsByProductIdStore(currentReview.value.product_id)
                }
            }
            return response
        } catch (error) {
            console.error("❌ Store: Update review error:", error.message)
            throw error
        }
    }

    // Xóa đánh giá (ẩn đánh giá)
    const deleteReviewStore = async (reviewId) => {
        const token = authStore.accessToken
        try {
            const response = await deleteReview(reviewId, token)
            if (response.data.success) {
                // Tìm review bị xóa và chuyển sang deletedReviews
                const deletedReview = reviews.value.find(r => r.review_id === reviewId)
                if (deletedReview) {
                    // Chuyển sang deletedReviews
                    deletedReviews.value.push({ ...deletedReview, is_deleted: true })
                    // Xóa khỏi reviews hiện
                    reviews.value = reviews.value.filter(r => r.review_id !== reviewId)
                }
                // Cũng xóa khỏi productReviews và userReviews
                productReviews.value = productReviews.value.filter(r => r.review_id !== reviewId)
                userReviews.value = userReviews.value.filter(r => r.review_id !== reviewId)
            }
            return response
        } catch (error) {
            console.error("Delete review error:", error.message)
            throw error
        }
    }

    // Khôi phục đánh giá (restore)
    const restoreReviewStore = async (reviewId) => {
        const token = authStore.accessToken
        try {
            const response = await restoreReview(reviewId, token)
            if (response.data.success) {
                // Tìm review được khôi phục và chuyển về reviews
                const restoredReview = deletedReviews.value.find(r => r.review_id === reviewId)
                if (restoredReview) {
                    // Chuyển về reviews hiện
                    reviews.value.push({ ...restoredReview, is_deleted: false })
                    // Xóa khỏi deletedReviews
                    deletedReviews.value = deletedReviews.value.filter(r => r.review_id !== reviewId)
                }
            }
            return response
        } catch (error) {
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

