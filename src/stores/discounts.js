import { deleteDiscounts } from "@/api/discounts/deleted"
import { getAllDiscount, getAllDiscountDeleted } from "@/api/discounts/get"
import { addDiscount } from "@/api/discounts/post"
import { restoreDiscount, updateDiscount } from "@/api/discounts/put"
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
   const getAllDiscountsDeleted = async (token) => {
      try {
        const response = await getAllDiscountDeleted(token)
        if (response.data.success) {
          allDeleted.value = response.data.data
        }
      } catch (error) {
        console.error(error)
        throw error
      }
    }

  const addDiscounts = async (token, discountData) => {
    try {
      const response = await addDiscount(token, discountData)
      if (response.data.success) {
        discounts.value = { ...discounts.value }
      }
    } catch (error) {
      console.error("Add discount error:", error.message)
      throw error
    }
  }
  const deleteDiscount = async (discountId, token) => {
    try {
      const response = await deleteDiscounts(discountId, token)
      return response
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  const restoreDiscountStore = async (discountId, token) => {
    try {
      const response = await restoreDiscount(token, discountId)
      return response
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  const updateDiscountStore = async (token, discountId, discountData) => {
    try {
      const response = await updateDiscount(token, discountId, discountData)
      if (response.data.success) {
        discounts.value = { ...discounts.value }
      }
      return response
    } catch (error) {
      console.error("Update discount error:", error.message)
      throw error
    }
  }

  return { allDeleted, add, discounts, getAllDiscounts, getAllDiscountsDeleted, restoreDiscountStore, updateDiscountStore, addDiscounts, deleteDiscount }
})
