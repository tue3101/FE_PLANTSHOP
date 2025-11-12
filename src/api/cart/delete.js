import axios from "axios";

export const removeProductFromCart = async (userId, productId, token) => {
    const response = await axios.delete(
        `/api/cartdetail/remove-product/${userId}/${productId}`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    )
    return response
}

