import axios from "axios";

// Cập nhật đánh giá
export const updateReview = async (reviewId, token, reviewData) => {
    const response = await axios.put(`/api/reviews/${reviewId}`, reviewData, {
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
        },
    });
    return response;
}

// Khôi phục đánh giá (restore)
export const restoreReview = async (reviewId, token) => {
    const response = await axios.put(`/api/reviews/restore/${reviewId}`, {}, {
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
        },
    });
    return response;
}

