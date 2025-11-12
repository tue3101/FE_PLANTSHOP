import axios from "axios";

// Lấy tất cả đánh giá (cho admin)
export const getAllReviews = async (token) => {
    const response = await axios.get("/api/reviews/get-all", {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response;
}

// Lấy đánh giá theo productId
export const getReviewsByProductId = async (productId) => {
    const response = await axios.get(`/api/reviews/product/${productId}`);
    return response;
}

// Lấy đánh giá theo userId
export const getReviewsByUserId = async (userId, token) => {
    const response = await axios.get(`/api/reviews/user/${userId}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response;
}

// Lấy đánh giá theo reviewId
export const getReviewById = async (reviewId, token) => {
    const response = await axios.get(`/api/reviews/${reviewId}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response;
}

export const getAllReviewsDeleted = async (token) => {
    const response = await axios.get("/api/reviews/get-all-deleted", {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response;
}



