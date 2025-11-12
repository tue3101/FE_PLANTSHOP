import axios from "axios";

// Cập nhật payment status
export const updatePaymentStatus = async (token, paymentId, status) => {
    const response = await axios.put(`/api/payments/${paymentId}/status`, null, {
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
        },
        params: {
            status: status
        }
    });
    return response;
}

