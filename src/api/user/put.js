import axios from "axios"

export const updateInfoUser = async(token, userId, userData)=>{
    const response = await axios.put(`/api/user/update/${userId}`, userData, {
        headers:{
            Authorization:`Bearer ${token}`,
        }
    })
    return response
}

export const restoreUser = async(token, userId)=>{
    const response = await axios.put(`/api/user/restore/${userId}`, {}, {
        headers:{
            Authorization:`Bearer ${token}`,
        }
    })
    return response
}