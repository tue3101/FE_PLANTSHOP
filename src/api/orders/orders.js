import { api } from "../axiosConfig"

// ==================== GET ====================
export const getAllOrders = async () => {
  return api.get("/orders/get-all")
}

export const getOrdersByUserId = async (userId) => {
  return api.get(`/orders/user/${userId}`)
}

export const getOrderById = async (orderId) => {
  return api.get(`/orders/${orderId}`)
}

export const getOrderDetailsByOrderId = async (orderId) => {
  return api.get(`/order-details/order/${orderId}`)
}

export const getOrderDetailById = async (orderDetailId) => {
  return api.get(`/order-details/${orderDetailId}`)
}

// ==================== POST ====================
export const createOrder = async (orderData) => {
  return api.post("/orders/add", orderData)
}

// ==================== PUT ====================
export const updateOrderDetail = async (orderDetailId, orderDetailData) => {
  return api.put(`/order-details/${orderDetailId}`, orderDetailData)
}

export const updateOrderStatus = async (orderId, status) => {
  return api.put(`/orders/${orderId}`, { status })
}

export const updateOrderShippingStatus = async (orderId, shippingStatus) => {
  return api.put(`/orders/${orderId}/shipping-status`, { shipping_status: shippingStatus })
}

export const updateOrderShippingInfo = async (orderId, shippingInfo) => {
  return api.put(`/orders/${orderId}/shipping-info`, shippingInfo)
}

// ==================== DELETE ====================
export const deleteOrderDetail = async (orderDetailId) => {
  return api.delete(`/order-details/${orderDetailId}`)
}

export const deleteOrder = async (orderId) => {
  return api.delete(`/orders/${orderId}`)
}
