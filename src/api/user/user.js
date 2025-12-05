import { api } from "../axiosConfig"

// ==================== GET ====================
export const getInfoUser = async () => {
  return api.get("/user/get-user", { _skipRetry: true })
}

export const getAllUser = async () => {
  return api.get("/user/getall")
}

export const getAllUserDeleted = async () => {
  return api.get("/user/getall-deleted")
}

// ==================== PUT ====================
export const updateInfoUser = async (userId, userData) => {
  return api.put(`/user/update/${userId}`, userData)
}

export const restoreUser = async (userId) => {
  return api.put(`/user/restore/${userId}`, {})
}

// ==================== DELETE ====================
export const deleteUsers = async (userId) => {
  return api.delete(`/user/delete/${userId}`)
}
