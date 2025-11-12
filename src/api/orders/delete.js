import axios from "axios";

// Xóa chi tiết đơn hàng
export const deleteOrderDetail = async (orderDetailId, token) => {
    const response = await axios.delete(`/api/order-details/${orderDetailId}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response;
}

// Xóa đơn hàng
export const deleteOrder = async (orderId, token) => {
    const response = await axios.delete(`/api/orders/${orderId}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response;
}

