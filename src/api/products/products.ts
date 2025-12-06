import { api } from "../axiosConfig"
import type { ApiResponse } from "@/types/api.types"

// ==================== GET ====================
export const getAllProducts = async (): Promise<ApiResponse> => {
  const response = await api.get("/product/getall")
  return response.data
}

export const getProductByCategory = async (categoryId: string | number): Promise<ApiResponse> => {
  const response = await api.get(`/category/get-product-by-category/${categoryId}`)
  return response.data
}

export const getProductById = async (productId: string | number): Promise<ApiResponse> => {
  const response = await api.get(`/product/get-by-id/${productId}`)
  return response.data
}

export const getAllProductDeleted = async (): Promise<ApiResponse> => {
  const response = await api.get("/product/getall-deleted")
  return response.data
}

// ==================== CATEGORY GET ====================
export const getAllCategories = async (): Promise<ApiResponse> => {
  const response = await api.get("/category/getall")
  return response.data
}

export const getAllCategoryDeleted = async (): Promise<ApiResponse> => {
  const response = await api.get("/category/getall-deleted")
  return response.data
}

// ==================== POST ====================
export const addProductsAPI = async (formData: FormData): Promise<ApiResponse> => {
  const response = await api.post("/product/add", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  })
  return response.data
}

export const addCategories = async (categoryData: Record<string, unknown>): Promise<ApiResponse> => {
  const response = await api.post("/category/add", categoryData)
  return response.data
}

// ==================== PUT ====================
export const restoreProduct = async (productId: string | number): Promise<ApiResponse> => {
  const response = await api.put(`/product/restore/${productId}`, {})
  return response.data
}

export const updateProduct = async (
  productId: string | number,
  productData: FormData
): Promise<ApiResponse> => {
  const response = await api.put(`/product/update/${productId}`, productData, {
    headers: { "Content-Type": "multipart/form-data" },
  })
  return response.data
}

export const restoreCategory = async (categoryId: string | number): Promise<ApiResponse> => {
  const response = await api.put(`/category/restore/${categoryId}`, {})
  return response.data
}

export const updateCategory = async (
  categoryId: string | number,
  categoryData: Record<string, unknown>
): Promise<ApiResponse> => {
  const response = await api.put(`/category/update/${categoryId}`, categoryData)
  return response.data
}

// ==================== DELETE ====================
export const deleteProducts = async (productId: string | number): Promise<ApiResponse> => {
  const response = await api.delete(`/product/delete/${productId}`)
  return response.data
}

export const deleteCategories = async (categoryId: string | number): Promise<ApiResponse> => {
  const response = await api.delete(`/category/delete/${categoryId}`)
  return response.data
}

