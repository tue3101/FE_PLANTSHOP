import axios from "axios";

// Xóa đánh giá
export const deleteReview = async (reviewId, token) => {
    const response = await axios.delete(`/api/reviews/${reviewId}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response;
}

