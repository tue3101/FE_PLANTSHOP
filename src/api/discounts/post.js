import axios from "axios";

export const addDiscount= async (token, discountData) => {
    const response = await axios.post("/api/discount/add", discountData, {
        headers: {
            Authorization: `Bearer ${token}`,
            
        }
    });
    return response
}
