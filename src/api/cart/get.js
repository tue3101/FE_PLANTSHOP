import axios from "axios";


export const getCartOfUser = async (userId, token) => {
    const response = await axios.get(`/api/cart/get-cart-of-user/${userId}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })
    return response
}


export const getCartDetail = async (cartId, token) => {
    const response = await axios.get(`/api/cartdetail/get-cart-detail/${cartId}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })
    return response
}

