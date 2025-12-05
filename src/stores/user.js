import {
  deleteUsers,
  getAllUser,
  getAllUserDeleted,
  getInfoUser,
  updateInfoUser,
  restoreUser,
} from "@/api/user/user"
import { defineStore } from "pinia"
import { ref } from "vue"

export const useUserStore = defineStore("user", () => {
  const userInfo = ref(null)
  const updateInfo = ref(null)
  const allUsers = ref(null)
  const allDeleted = ref(null)

  const getAllUsers = async () => {
    try {
      const response = await getAllUser()
      if (response.data.success) {
        allUsers.value = response.data.data
      }
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  const getAllDeleted = async () => {
    try {
      const response = await getAllUserDeleted()
      if (response.data.success) {
        allDeleted.value = response.data.data
      }
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  const getInfo = async () => {
    try {
      const response = await getInfoUser()
      if (response.data.success) {
        userInfo.value = response.data.data
      }
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  const updateInfoUsers = async (userId, userData) => {
    try {
      const response = await updateInfoUser(userId, userData)
      if (response.data.success) {
        userInfo.value = { ...userInfo.value }
      }
      return response
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  const deleteUser = async (userId) => {
    try {
      const response = await deleteUsers(userId)
      return response
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  const restoreUserStore = async (userId) => {
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
