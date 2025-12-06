import { defineStore } from "pinia"
import { ref, type Ref } from "vue"
import {
  getAllProducts,
  getProductByCategory,
  getAllCategories,
  getProductById,
  getAllProductDeleted,
  getAllCategoryDeleted,
  addProductsAPI,
  addCategories as addCategoriesAPI,
  deleteProducts,
  deleteCategories,
  restoreCategory as restorCategory,
  restoreProduct as restorProduct,
  updateProduct,
  updateCategory,
} from "@/api/products/products"
import type { Product, Category } from "@/types/store.types"
import type { ApiResponse } from "@/types/api.types"

export const useProductStore = defineStore("product", () => {
  const products: Ref<Product[]> = ref([])
  const productByCategory: Ref<Product[]> = ref([])
  const categories: Ref<Category[]> = ref([])
  const addProduct: Ref<any> = ref(null)
  const addCategory: Ref<any> = ref(null)
  const allProductDeleted: Ref<Product[] | null> = ref(null)
  const allCategoryDeleted: Ref<Category[] | null> = ref(null)

  const getProducts = async (): Promise<void> => {
    try {
      const response = await getAllProducts()
      if (response.success) {
        products.value = response.data
      }
    } catch (error) {
      throw error
    }
  }
  const getAllProductsDeleted = async (): Promise<void> => {
    try {
      const response = await getAllProductDeleted()
      if (response.success) {
        allProductDeleted.value = response.data
      }
    } catch (error: any) {
      if (error.response?.status === 400 || error.response?.status === 401) {
        allProductDeleted.value = []
        return
      }
      throw error
    }
  }
  const getProductsByCategory = async (categoryId: string | number): Promise<void> => {
    try {
      const response = await getProductByCategory(categoryId)
      if (response.success) {
        productByCategory.value = response.data
      }
    } catch (error) {
      throw error
    }
  }

  const getProduct = async (productId: string | number): Promise<Product | undefined> => {
    try {
      const response = await getProductById(productId)
      if (response.success) {
        return response.data
      }
    } catch (error) {
      // Silent fail for getProduct
    }
  }
  const addProducts = async (productData: FormData): Promise<void> => {
    try {
      const response = await addProductsAPI(productData)
      if (response.success) {
        products.value = { ...products.value } as any
      }
    } catch (error) {
      throw error
    }
  }
  const deleteProduct = async (productId: string | number): Promise<ApiResponse> => {
    try {
      const response = await deleteProducts(productId)
      return response
    } catch (error) {
      throw error
    }
  }

  const restoreProductStore = async (productId: string | number): Promise<ApiResponse> => {
    try {
      const response = await restorProduct(productId)
      return response
    } catch (error) {
      throw error
    }
  }
  const updateProductStore = async (
    productId: string | number,
    productData: FormData
  ): Promise<ApiResponse> => {
    try {
      const response = await updateProduct(productId, productData)
      if (response.success) {
        products.value = { ...products.value } as any
      }
      return response
    } catch (error) {
      throw error
    }
  }

  //=======================category================================
  const getCategories = async (): Promise<void> => {
    try {
      const response = await getAllCategories()
      if (response.success) {
        categories.value = response.data
      }
    } catch (error) {
      throw error
    }
  }

  const getAllCategoriesDeleted = async (): Promise<void> => {
    try {
      const response = await getAllCategoryDeleted()
      if (response.success) {
        allCategoryDeleted.value = response.data
      }
    } catch (error: any) {
      if (error.response?.status === 400 || error.response?.status === 401) {
        allCategoryDeleted.value = []
        return
      }
      throw error
    }
  }
  const addCategories = async (categoryData: Record<string, any>): Promise<void> => {
    try {
      const response = await addCategoriesAPI(categoryData)
      if (response.success) {
        categories.value = { ...categories.value } as any
      }
    } catch (error) {
      throw error
    }
  }

  const deleteCategory = async (categoryId: string | number): Promise<ApiResponse> => {
    try {
      const response = await deleteCategories(categoryId)
      return response
    } catch (error) {
      throw error
    }
  }

  const restoreCategoryStore = async (categoryId: string | number): Promise<ApiResponse> => {
    try {
      const response = await restorCategory(categoryId)
      return response
    } catch (error) {
      throw error
    }
  }

  const updateCategoryStore = async (
    categoryId: string | number,
    categoryData: Record<string, any>
  ): Promise<ApiResponse> => {
    try {
      const response = await updateCategory(categoryId, categoryData)
      if (response.success) {
        categories.value = { ...categories.value } as any
      }
      return response
    } catch (error) {
      throw error
    }
  }

  return {
    addCategory,
    addProduct,
    allProductDeleted,
    allCategoryDeleted,
    productByCategory,
    products,
    categories,
    getAllProductsDeleted,
    getAllCategoriesDeleted,
    deleteCategory,
    deleteProduct,
    restoreProductStore,
    restoreCategoryStore,
    updateProductStore,
    updateCategoryStore,
    getProducts,
    getProductsByCategory,
    getCategories,
    addProducts,
    addCategories,
    getProduct,
  }
})
