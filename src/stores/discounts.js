import {
  deleteDiscounts,
  getAllDiscount,
  getAllDiscountDeleted,
  addDiscount,
  restoreDiscount,
  updateDiscount,
} from "@/api/discounts/discounts"
import { defineStore } from "pinia"
import { ref } from "vue"

export const useDiscountStore = defineStore("discount", () => {
  const discounts = ref([])
  const add = ref(null)
  const allDeleted = ref(null)

  const getAllDiscounts = async () => {
    try {
      const res = await getAllDiscount()
      if (res.data.success) {
        discounts.value = res.data.data
      }
    } catch (error) {
      console.error("Get discount error:", error.message)
      throw error
    }
  }

  const getAllDiscountsDeleted = async () => {
    try {
      const response = await getAllDiscountDeleted()
      if (response.data.success) {
        allDeleted.value = response.data.data
      }
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  const addDiscounts = async (discountData) => {
    try {
      const response = await addDiscount(discountData)
      if (response.data.success) {
        discounts.value = { ...discounts.value }
      }
    } catch (error) {
      console.error("Add discount error:", error.message)
      throw error
    }
  }

  const deleteDiscount = async (discountId) => {
    try {
      const response = await deleteDiscounts(discountId)
      return response
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  const restoreDiscountStore = async (discountId) => {
    try {
      const response = await restoreDiscount(discountId)
      return response
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  const updateDiscountStore = async (discountId, discountData) => {
    try {
      const response = await updateDiscount(discountId, discountData)
      if (response.data.success) {
        discounts.value = { ...discounts.value }
      }
      return response
    } catch (error) {
      console.error("Update discount error:", error.message)
      throw error
    }
  }

  return {
    allDeleted,
    add,
    discounts,
    getAllDiscounts,
    getAllDiscountsDeleted,
    restoreDiscountStore,
    updateDiscountStore,
    addDiscounts,
    deleteDiscount,
  }
})
