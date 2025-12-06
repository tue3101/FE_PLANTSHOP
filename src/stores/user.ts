import {
  deleteUsers,
  getAllUser,
  getAllUserDeleted,
  getInfoUser,
  updateInfoUser,
  restoreUser,
} from "@/api/user/user"
import { defineStore } from "pinia"
import { ref, type Ref } from "vue"
import type { User } from "@/types/store.types"
import type { ApiResponse } from "@/types/api.types"

export const useUserStore = defineStore("user", () => {
  const userInfo: Ref<User | null> = ref(null)
  const updateInfo: Ref<any> = ref(null)
  const allUsers: Ref<User[] | null> = ref(null)
  const allDeleted: Ref<User[] | null> = ref(null)

  const getAllUsers = async (): Promise<void> => {
    try {
      const response = await getAllUser()
      if (response.success) {
        allUsers.value = response.data
      }
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  const getAllDeleted = async (): Promise<void> => {
    try {
      const response = await getAllUserDeleted()
      if (response.success) {
        allDeleted.value = response.data
      }
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  const getInfo = async (): Promise<void> => {
    try {
      const response = await getInfoUser()
      if (response.success) {
        userInfo.value = response.data
      }
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  const updateInfoUsers = async (
    userId: string | number,
    userData: Record<string, any>
  ): Promise<ApiResponse> => {
    try {
      const response = await updateInfoUser(userId, userData)
      if (response.success) {
        userInfo.value = { ...userInfo.value } as User
      }
      return response
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  const deleteUser = async (userId: string | number): Promise<ApiResponse> => {
    try {
      const response = await deleteUsers(userId)
      return response
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  const restoreUserStore = async (userId: string | number): Promise<ApiResponse> => {
    try {
      const response = await restoreUser(userId)
      return response
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  return {
    allUsers,
    allDeleted,
    updateInfo,
    userInfo,
    deleteUser,
    restoreUserStore,
    getAllUsers,
    getAllDeleted,
    getInfo,
    updateInfoUsers,
  }
})
