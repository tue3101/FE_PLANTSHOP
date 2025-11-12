import axios from "axios"

export const deleteDiscounts = async (discountId, token) => {
  const response = await axios.delete(`/api/discount/delete/${discountId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    }
  })
  return response
}
