import axios from "axios";


export const updateCartQuantity = async (userId, productId, quantity, token, selected = null) => {
    let url = `/api/cartdetail/update-quantity/${userId}/${productId}/${quantity}`
    if (selected !== null) {
        url += `?selected=${selected}`
    }
    const response = await axios.put(
        url,
        null, 
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    )
    return response
}

