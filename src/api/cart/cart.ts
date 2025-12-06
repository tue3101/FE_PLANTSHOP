import { api } from "../axiosConfig"
import type { ApiResponse } from "@/types/api.types"

// ==================== GET ====================
export const getCartOfUser = async (userId: string | number): Promise<ApiResponse> => {
  const response = await api.get(`/cart/get-cart-of-user/${userId}`)
  return response.data
}

export const getCartDetail = async (cartId: string | number): Promise<ApiResponse> => {
  const response = await api.get(`/cartdetail/get-cart-detail/${cartId}`)
  return response.data
}

// ==================== POST ====================
export const addProductToCart = async (
  userId: string | number,
  productId: string | number,
  quantity: number
): Promise<ApiResponse> => {
  const response = await api.post(`/cartdetail/add-product/${userId}/${productId}/${quantity}`)
  return response.data
}

// ==================== PUT ====================
export const updateCartQuantity = async (
  userId: string | number,
  productId: string | number,
  quantity: number,
  selected: boolean | null = null
): Promise<ApiResponse> => {
  let url = `/cartdetail/update-quantity/${userId}/${productId}/${quantity}`
  if (selected !== null) {
    url += `?selected=${selected}`
  }
  const response = await api.put(url)
  return response.data
}

// ==================== DELETE ====================
export const removeProductFromCart = async (
  userId: string | number,
  productId: string | number
): Promise<ApiResponse> => {
  const response = await api.delete(`/cartdetail/remove-product/${userId}/${productId}`)
  return response.data
}
