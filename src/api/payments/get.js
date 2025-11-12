import axios from "axios";

// Lấy payment theo order ID
export const getPaymentByOrderId = async (orderId, token) => {
    const response = await axios.get(`/api/payments/order/${orderId}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response;
}

// Lấy payment theo payment ID
export const getPaymentById = async (paymentId, token) => {
    const response = await axios.get(`/api/payments/${paymentId}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response;
}

// Lấy tất cả payments (cho admin)
export const getAllPayments = async (token) => {
    const response = await axios.get("/api/payments/get-all", {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response;
}

