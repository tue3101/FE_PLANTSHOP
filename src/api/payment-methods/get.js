import axios from "axios";

// Lấy tất cả payment methods
export const getAllPaymentMethods = async (token) => {
    const response = await axios.get("/api/payment-methods/get-all", {
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
        }
    });
    return response;
}

