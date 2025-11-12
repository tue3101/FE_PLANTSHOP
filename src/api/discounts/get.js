import axios from "axios"
export const getAllDiscount = async()=>{
    const response = await axios.get("/api/discount/getall")
    return response

}
export const getAllDiscountDeleted = async(token) => {
    const response = await axios.get("/api/discount/getall-deleted",{
        headers:{
            Authorization: `Bearer ${token}`,
        },
    })
    return response
}