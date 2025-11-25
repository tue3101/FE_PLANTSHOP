import axios from "axios";

// Cập nhật chi tiết đơn hàng
export const updateOrderDetail = async (orderDetailId, token, orderDetailData) => {
    const response = await axios.put(`/api/order-details/${orderDetailId}`, orderDetailData, {
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
        },
    });
    return response;
}

// Cập nhật trạng thái đơn hàng (hủy đơn hàng)
export const updateOrderStatus = async (orderId, token, status) => {
    const response = await axios.put(`/api/orders/${orderId}`, { status }, {
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
        },
    });
    return response;
}

// Cập nhật trạng thái giao hàng
export const updateOrderShippingStatus = async (orderId, token, shippingStatus) => {
    const response = await axios.put(`/api/orders/${orderId}/shipping-status`, { shipping_status: shippingStatus }, {
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
        },
    });
    return response;
}

// Cập nhật thông tin giao hàng (shipping_name, shipping_address, shipping_phone)
export const updateOrderShippingInfo = async (orderId, token, shippingInfo) => {
    const response = await axios.put(`/api/orders/${orderId}/shipping-info`, shippingInfo, {
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
        },
    });
    return response;
}