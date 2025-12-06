import {
  deleteDiscounts,
  getAllDiscount,
  getAllDiscountDeleted,
  addDiscount,
  restoreDiscount,
  updateDiscount,
} from "@/api/discounts/discounts"
import { defineStore } from "pinia"
import { ref, type Ref } from "vue"
import type { Discount } from "@/types/store.types"
import type { ApiResponse } from "@/types/api.types"

export const useDiscountStore = defineStore("discount", () => {
  const discounts: Ref<Discount[]> = ref([])
  const add: Ref<any> = ref(null)
  const allDeleted: Ref<Discount[] | null> = ref(null)

  const getAllDiscounts = async (): Promise<void> => {
    try {
      const res = await getAllDiscount()
      if (res.success) {
        discounts.value = res.data || []
      }
    } catch (error: any) {
      console.error("Get discount error:", error.message)
      throw error
    }
  }

  const getAllDiscountsDeleted = async (): Promise<void> => {
    try {
      const response = await getAllDiscountDeleted()
      if (response.success) {
        allDeleted.value = response.data || []
      }
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  const addDiscounts = async (discountData: Record<string, any>): Promise<void> => {
    try {
      const response = await addDiscount(discountData)
      if (response.data.success) {
        discounts.value = { ...discounts.value } as any
      }
    } catch (error: any) {
      console.error("Add discount error:", error.message)
      throw error
    }
  }

  const deleteDiscount = async (discountId: string | number): Promise<ApiResponse> => {
    try {
      const response = await deleteDiscounts(discountId)
      return response.data
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  const restoreDiscountStore = async (discountId: string | number): Promise<ApiResponse> => {
    try {
      const response = await restoreDiscount(discountId)
      return response.data
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  const updateDiscountStore = async (
    discountId: string | number,
    discountData: Record<string, any>
  ): Promise<ApiResponse> => {
    try {
      const response = await updateDiscount(discountId, discountData)
      if (response.data.success) {
        discounts.value = { ...discounts.value } as any
      }
      return response.data
    } catch (error: any) {
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
