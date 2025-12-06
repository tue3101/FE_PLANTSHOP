import { api } from "../axiosConfig"
import type { ApiResponse } from "@/types/api.types"

// ==================== GET ====================
export const getAllOrders = async (): Promise<ApiResponse> => {
  const response = await api.get("/orders/get-all")
  return response.data
}

export const getOrdersByUserId = async (userId: string | number): Promise<ApiResponse> => {
  const response = await api.get(`/orders/user/${userId}`)
  return response.data
}

export const getOrderById = async (orderId: string | number): Promise<ApiResponse> => {
  const response = await api.get(`/orders/${orderId}`)
  return response.data
}

export const getOrderDetailsByOrderId = async (orderId: string | number): Promise<ApiResponse> => {
  const response = await api.get(`/order-details/order/${orderId}`)
  return response.data
}

export const getOrderDetailById = async (orderDetailId: string | number): Promise<ApiResponse> => {
  const response = await api.get(`/order-details/${orderDetailId}`)
  return response.data
}

// ==================== POST ====================
export const createOrder = async (orderData: Record<string, unknown>): Promise<ApiResponse> => {
  const response = await api.post("/orders/add", orderData)
  return response.data
}

// ==================== PUT ====================
export const updateOrderDetail = async (
  orderDetailId: string | number,
  orderDetailData: Record<string, unknown>
): Promise<ApiResponse> => {
  const response = await api.put(`/order-details/${orderDetailId}`, orderDetailData)
  return response.data
}

export const updateOrderStatus = async (
  orderId: string | number,
  status: string
): Promise<ApiResponse> => {
  const response = await api.put(`/orders/${orderId}`, { status })
  return response.data
}

export const updateOrderShippingStatus = async (
  orderId: string | number,
  shippingStatus: string
): Promise<ApiResponse> => {
  const response = await api.put(`/orders/${orderId}/shipping-status`, { shipping_status: shippingStatus })
  return response.data
}

export const updateOrderShippingInfo = async (
  orderId: string | number,
  shippingInfo: Record<string, unknown>
): Promise<ApiResponse> => {
  const response = await api.put(`/orders/${orderId}/shipping-info`, shippingInfo)
  return response.data
}

// ==================== DELETE ====================
export const deleteOrderDetail = async (orderDetailId: string | number): Promise<ApiResponse> => {
  const response = await api.delete(`/order-details/${orderDetailId}`)
  return response.data
}

export const deleteOrder = async (orderId: string | number): Promise<ApiResponse> => {
  const response = await api.delete(`/orders/${orderId}`)
  return response.data
}
