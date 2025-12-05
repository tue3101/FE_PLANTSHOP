import { api } from "../axiosConfig"

// ==================== GET ====================
export const getAllProducts = async () => {
  return api.get("/product/getall")
}

export const getProductByCategory = async (categoryId) => {
  return api.get(`/category/get-product-by-category/${categoryId}`)
}

export const getProductById = async (productId) => {
  return api.get(`/product/get-by-id/${productId}`)
}

export const getAllProductDeleted = async () => {
  return api.get("/product/getall-deleted")
}

// ==================== CATEGORY GET ====================
export const getAllCategories = async () => {
  return api.get("/category/getall")
}

export const getAllCategoryDeleted = async () => {
  return api.get("/category/getall-deleted")
}

// ==================== POST ====================
export const addProductsAPI = async (formData) => {
  return api.post("/product/add", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  })
}

export const addCategories = async (categoryData) => {
  return api.post("/category/add", categoryData)
}

// ==================== PUT ====================
export const restoreProduct = async (productId) => {
  return api.put(`/product/restore/${productId}`, {})
}

export const updateProduct = async (productId, productData) => {
  return api.put(`/product/update/${productId}`, productData, {
    headers: { "Content-Type": "multipart/form-data" },
  })
}

export const restoreCategory = async (categoryId) => {
  return api.put(`/category/restore/${categoryId}`, {})
}

export const updateCategory = async (categoryId, categoryData) => {
  return api.put(`/category/update/${categoryId}`, categoryData)
}

// ==================== DELETE ====================
export const deleteProducts = async (productId) => {
  return api.delete(`/product/delete/${productId}`)
}

export const deleteCategories = async (categoryId) => {
  return api.delete(`/category/delete/${categoryId}`)
}
