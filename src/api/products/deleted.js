import axios from "axios"

export const deleteProducts = async (productId, token) => {
  const response = await axios.delete(`/api/product/delete/${productId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    }
  })
  return response
}
export const deleteCategories = async (categoryId, token) => {
  const response = await axios.delete(`/api/category/delete/${categoryId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    }
  })
  return response
}
