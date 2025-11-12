import axios from "axios"

export const changePassword = async (oldPassword, newPassword, token) => {
  const response = await axios.put("/api/auth/change-password", {
    oldPassword,
    newPassword
  }, {
    headers: {
      Authorization: `Bearer ${token}`,
    }
  })
  return response
}

