import { defineStore } from "pinia"
import { ref } from "vue"
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

export const useProductStore = defineStore("product", () => {
  const products = ref([])
  const productByCategory = ref([])
  const categories = ref([])
  const addProduct = ref(null)
  const addCategory = ref(null)
  const allProductDeleted = ref(null)
  const allCategoryDeleted = ref(null)

  const getProducts = async () => {
    try {
      const response = await getAllProducts()
      if (response.data.success) {
        products.value = response.data.data
      }
    } catch (error) {
      console.error(error)
      throw error
    }
  }
  const getAllProductsDeleted = async () => {
    try {
      const response = await getAllProductDeleted()
      if (response.data.success) {
        allProductDeleted.value = response.data.data
      }
    } catch (error) {
      console.error("Error fetching deleted products:", error)
      if (error.response?.status === 400 || error.response?.status === 401) {
        allProductDeleted.value = []
        return
      }
      throw error
    }
  }
  const getProductsByCategory = async (categoryId) => {
    try {
      const response = await getProductByCategory(categoryId)
      if (response.data.success) {
        productByCategory.value = response.data.data
      }
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  const getProduct = async (productId) => {
    try {
      const response = await getProductById(productId)
      if (response.data.success) {
        return response.data.data
      }
    } catch (error) {
      console.error(error)
    }
  }
  const addProducts = async (productData) => {
    try {
      const response = await addProductsAPI(productData)
      if (response.data.success) {
        products.value = { ...products.value }
      }
    } catch (error) {
      console.error(error)
      throw error
    }
  }
  const deleteProduct = async (productId) => {
    try {
      const response = await deleteProducts(productId)
      return response
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  const restoreProductStore = async (productId) => {
    try {
      const response = await restorProduct(productId)
      return response
    } catch (error) {
      console.error(error)
      throw error
    }
  }
  const updateProductStore = async (productId, productData) => {
    try {
      const response = await updateProduct(productId, productData)
      if (response.data.success) {
        products.value = { ...products.value }
      }
      return response
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  //=======================category================================
  const getCategories = async () => {
    try {
      const response = await getAllCategories()
      if (response.data.success) {
        categories.value = response.data.data
      }
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  const getAllCategoriesDeleted = async () => {
    try {
      const response = await getAllCategoryDeleted()
      if (response.data.success) {
        allCategoryDeleted.value = response.data.data
      }
    } catch (error) {
      console.error("Error fetching deleted categories:", error)
      // Nếu lỗi 400 hoặc không có quyền, set mảng rỗng thay vì throw
      if (error.response?.status === 400 || error.response?.status === 401) {
        allCategoryDeleted.value = []
        return
      }
      throw error
    }
  }
  const addCategories = async (categoryData) => {
    try {
      const response = await addCategoriesAPI(categoryData)
      if (response.data.success) {
        categories.value = { ...categories.value }
      }
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  const deleteCategory = async (categoryId) => {
    try {
      const response = await deleteCategories(categoryId)
      return response
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  const restoreCategoryStore = async (categoryId) => {
    try {
      const response = await restorCategory(categoryId)
      return response
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  const updateCategoryStore = async (categoryId, categoryData) => {
    try {
      const response = await updateCategory(categoryId, categoryData)
      if (response.data.success) {
        categories.value = { ...categories.value }
      }
      return response
    } catch (error) {
      console.error(error)
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
