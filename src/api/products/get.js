import axios from "axios"

export const getAllProducts = async () => {
  const response = await axios.get("/api/product/getall")
  return response
}

export const getProductByCategory = async (categoryId) => {
  const response = await axios.get(`/api/category/get-product-by-category/${categoryId}`)
  return response
}



export const getProductById = async (productId) => {
  const response = await axios.get(`/api/product/get-by-id/${productId}`)
  return response
}


export const getAllProductDeleted = async(token) => {
    const response = await axios.get("/api/product/getall-deleted",{
        headers:{
            Authorization: `Bearer ${token}`,
        },
    })
    return response
}
 //====================category=========================
export const getAllCategories = async () => {
  const response = await axios.get("/api/category/getall")
  return response
}
export const getAllCategoryDeleted = async(token) => {
    const response = await axios.get("/api/category/getall-deleted",{
        headers:{
            Authorization: `Bearer ${token}`,
        },
    })
    return response
}