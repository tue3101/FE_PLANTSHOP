import axios from "axios"

export const getInfoUser = async(token)=>{
    const response = await axios.get("/api/user/get-user", {
        headers: {
            Authorization: `Bearer ${token}`,
        },
        _skipRetry: true, // Đánh dấu để skip refresh token khi 401 (vì đây là request verify)
    })
    return response
}

export const getAllUser = async(token)=>{
    const response = await axios.get("/api/user/getall", {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })
    return response

}

export const getAllUserDeleted = async(token) => {
    const response = await axios.get("/api/user/getall-deleted",{
        headers:{
            Authorization: `Bearer ${token}`,
        },
    })
    return response
}