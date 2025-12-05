import { api } from "../axiosConfig"

// ==================== GET - BY DATE ====================
export const getStatisticsByDate = async (year, month, day) => {
  return api.get("/statistics/by-date", {
    params: { year, month, day },
  })
}

export const getStatisticsByMonth = async (year, month) => {
  return api.get("/statistics/by-month", {
    params: { year, month },
  })
}

export const getStatisticsByYear = async (year) => {
  return api.get("/statistics/by-year", {
    params: { year },
  })
}

// ==================== GET - TOP PRODUCTS ====================
export const getTopProductsByDate = async (year, month, day, limit = 10) => {
  return api.get("/statistics/top-products/by-date", {
    params: { year, month, day, limit },
  })
}

export const getTopProductsByMonth = async (year, month, limit = 10) => {
  return api.get("/statistics/top-products/by-month", {
    params: { year, month, limit },
  })
}

export const getTopProductsByYear = async (year, limit = 10) => {
  return api.get("/statistics/top-products/by-year", {
    params: { year, limit },
  })
}

// ==================== GET - PRODUCTS SOLD ====================
export const getTotalProductsSoldByMonth = async (year, month) => {
  return api.get("/statistics/products-sold/by-month", {
    params: { year, month },
  })
}

export const getTotalProductsSoldByYear = async (year) => {
  return api.get("/statistics/products-sold/by-year", {
    params: { year },
  })
}
