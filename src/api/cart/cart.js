import { api } from "../axiosConfig"

// ==================== GET ====================
export const getCartOfUser = async (userId) => {
  return api.get(`/cart/get-cart-of-user/${userId}`)
}

export const getCartDetail = async (cartId) => {
  return api.get(`/cartdetail/get-cart-detail/${cartId}`)
}

// ==================== POST ====================
export const addProductToCart = async (userId, productId, quantity) => {
  return api.post(`/cartdetail/add-product/${userId}/${productId}/${quantity}`)
}

// ==================== PUT ====================
export const updateCartQuantity = async (userId, productId, quantity, selected = null) => {
  let url = `/cartdetail/update-quantity/${userId}/${productId}/${quantity}`
  if (selected !== null) {
    url += `?selected=${selected}`
  }
  return api.put(url)
}

// ==================== DELETE ====================
export const removeProductFromCart = async (userId, productId) => {
  return api.delete(`/cartdetail/remove-product/${userId}/${productId}`)
}
