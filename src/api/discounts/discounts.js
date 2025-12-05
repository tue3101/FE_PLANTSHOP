import { api } from "../axiosConfig"

// ==================== GET ====================
export const getAllDiscount = async () => {
  return api.get("/discount/getall")
}

export const getAllDiscountDeleted = async () => {
  return api.get("/discount/getall-deleted")
}

// ==================== POST ====================
export const addDiscount = async (discountData) => {
  return api.post("/discount/add", discountData)
}

// ==================== PUT ====================
export const restoreDiscount = async (discountId) => {
  return api.put(`/discount/restore/${discountId}`, {})
}

export const updateDiscount = async (discountId, discountData) => {
  return api.put(`/discount/update/${discountId}`, discountData)
}

// ==================== DELETE ====================
export const deleteDiscounts = async (discountId) => {
  return api.delete(`/discount/delete/${discountId}`)
}
