import axios from 'axios'

const apiClient = axios.create({
  baseURL: 'http://localhost:1234/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

// Thêm interceptor để tự động thêm token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor xử lý response
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // Xử lý lỗi
    if (error.response?.status === 401) {
      // Redirect về login
      const currentPath = window.location.pathname
      if (currentPath !== '/login' && currentPath !== '/register') {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('token')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default apiClient

