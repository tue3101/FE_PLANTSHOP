import axios from "axios"

export const deleteUsers = async (userId, token) => {
  const response = await axios.delete(`/api/user/delete/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    }
  })
  return response
}
