import axios from "axios";

// Tạo đánh giá mới
export const createReview = async (token, reviewData) => {
    const response = await axios.post("/api/reviews/add", reviewData, {
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
        }
    });
    return response;
}

