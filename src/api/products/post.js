import axios from "axios";

export const addProductsAPI = async (token, formData) => {
    const response = await axios.post("/api/product/add", formData, {
        headers: {
            Authorization: `Bearer ${token}`,
            
        }
    });
    return response
}


export const addCategories = async (token, categoryData) => {
    const response = await axios.post("/api/category/add", categoryData, {
        headers: {
            Authorization: `Bearer ${token}`,
            
        }
    });
    return response
}
