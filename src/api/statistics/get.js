import axios from "axios"


export const getStatisticsByDate = async (year, month, day) => {
  const response = await axios.get("/api/statistics/by-date", {
    params: {
      year,
      month,
      day
    }
  })
  return response
}

/**
 * Lấy thống kê theo tháng
 * @param {number} year - Năm
 * @param {number} month - Tháng (1-12)
 * @returns {Promise} Response chứa StatisticsResponse
 */
export const getStatisticsByMonth = async (year, month) => {
  const response = await axios.get("/api/statistics/by-month", {
    params: {
      year,
      month
    }
  })
  return response
}

/**
 * Lấy thống kê theo năm
 * @param {number} year - Năm
 * @returns {Promise} Response chứa StatisticsResponse
 */
export const getStatisticsByYear = async (year) => {
  const response = await axios.get("/api/statistics/by-year", {
    params: {
      year
    }
  })
  return response
}

/**
 * Lấy danh sách sản phẩm bán chạy theo ngày
 * @param {number} year - Năm
 * @param {number} month - Tháng (1-12)
 * @param {number} day - Ngày
 * @param {number} limit - Số lượng sản phẩm (mặc định 10)
 * @returns {Promise} Response chứa danh sách TopProductResponse
 */
export const getTopProductsByDate = async (year, month, day, limit = 10) => {
  const response = await axios.get("/api/statistics/top-products/by-date", {
    params: {
      year,
      month,
      day,
      limit
    }
  })
  return response
}

/**
 * Lấy danh sách sản phẩm bán chạy theo tháng
 * @param {number} year - Năm
 * @param {number} month - Tháng (1-12)
 * @param {number} limit - Số lượng sản phẩm (mặc định 10)
 * @returns {Promise} Response chứa danh sách TopProductResponse
 */
export const getTopProductsByMonth = async (year, month, limit = 10) => {
  const response = await axios.get("/api/statistics/top-products/by-month", {
    params: {
      year,
      month,
      limit
    }
  })
  return response
}


export const getTopProductsByYear = async (year, limit = 10) => {
  const response = await axios.get("/api/statistics/top-products/by-year", {
    params: {
      year,
      limit
    }
  })
  return response
}

/**
 * Lấy tổng số sản phẩm bán được theo tháng
 * GET /api/statistics/products-sold/by-month?year=2024&month=12
 * @param {number} year - Năm
 * @param {number} month - Tháng (1-12)
 * @returns {Promise} Response chứa ProductSalesResponse
 */
export const getTotalProductsSoldByMonth = async (year, month) => {
  const response = await axios.get("/api/statistics/products-sold/by-month", {
    params: {
      year,
      month
    }
  })
  return response
}

/**
 * Lấy tổng số sản phẩm bán được theo năm
 * GET /api/statistics/products-sold/by-year?year=2024
 * @param {number} year - Năm
 * @returns {Promise} Response chứa ProductSalesResponse
 */
export const getTotalProductsSoldByYear = async (year) => {
  const response = await axios.get("/api/statistics/products-sold/by-year", {
    params: {
      year
    }
  })
  return response
}
