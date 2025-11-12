import axios from "axios";

// Lấy tất cả đơn hàng (cho admin)
export const getAllOrders = async (token) => {
    const response = await axios.get("/api/orders/get-all", {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response;
}

// Lấy đơn hàng theo userId (cho user)
export const getOrdersByUserId = async (userId, token) => {
    const response = await axios.get(`/api/orders/user/${userId}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response;
}

// Lấy đơn hàng theo orderId
export const getOrderById = async (orderId, token) => {
    const response = await axios.get(`/api/orders/${orderId}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response;
}

// Lấy chi tiết đơn hàng theo orderId
export const getOrderDetailsByOrderId = async (orderId, token) => {
    const response = await axios.get(`/api/order-details/order/${orderId}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response;
}

// Lấy chi tiết đơn hàng theo orderDetailId
export const getOrderDetailById = async (orderDetailId, token) => {
    const response = await axios.get(`/api/order-details/${orderDetailId}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response;
}

