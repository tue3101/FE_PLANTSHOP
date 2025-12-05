import axios from "axios"

// Tạo axios instance với cấu hình mặc định
const apiClient = axios.create({
  baseURL: "http://localhost:1234/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
})

// Biến để quản lý refresh token
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

// Interceptor xử lý request - tự động thêm token
apiClient.interceptors.request.use(
  (config) => {
    if (config._skipRetry || config._skipAuth) {
      return config
    }
    const token = localStorage.getItem("accessToken")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Interceptor xử lý response với refresh token logic
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Bỏ qua nếu request có flag _skipRetry hoặc đã retry
    if (originalRequest._skipRetry || originalRequest._retry) {
      return Promise.reject(error)
    }

    // Bỏ qua retry cho các endpoint public
    if (originalRequest._skipAuth) {
      return Promise.reject(error)
    }

    if (
      (error.response?.status === 401 || error.response?.status === 403) &&
      !originalRequest._retry
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return apiClient(originalRequest)
          })
          .catch((err) => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const refreshToken = localStorage.getItem("refreshToken")
        if (!refreshToken) throw new Error("No refresh token")

        const refreshConfig = {
          headers: { Authorization: `Bearer ${refreshToken}` },
          _skipRetry: true,
        }
        const response = await apiClient.post("/auth/refresh", null, refreshConfig)

        if (response.data.success) {
          const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data.data
          localStorage.setItem("accessToken", newAccessToken)
          localStorage.setItem("refreshToken", newRefreshToken)

          // Update auth store nếu có
          try {
            const { useAuthStore } = await import("../stores/auth")
            const authStore = useAuthStore()
            authStore.accessToken = newAccessToken
            authStore.refreshToken = newRefreshToken

            // Reload user info
            try {
              const { useUserStore } = await import("../stores/user")
              const userStore = useUserStore()
              if (authStore.isAuthenticated && authStore.userId) {
                await userStore.getInfo()
              }
            } catch (userErr) {
              console.error("Error reloading user info:", userErr)
            }
          } catch (err) {
            console.error("Error updating auth store:", err)
          }

          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
          processQueue(null, newAccessToken)
          return apiClient(originalRequest)
        } else {
          throw new Error("Refresh token failed")
        }
      } catch (err) {
        processQueue(err, null)
        localStorage.removeItem("accessToken")
        localStorage.removeItem("refreshToken")
        const currentPath = window.location.pathname
        if (currentPath !== "/login" && currentPath !== "/register") {
          window.location.href = "/login"
        }
        return Promise.reject(err)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

// Helper methods để sử dụng chung
export const api = {
  get: (url, config = {}) => apiClient.get(url, config),
  post: (url, data = null, config = {}) => apiClient.post(url, data, config),
  put: (url, data = null, config = {}) => apiClient.put(url, data, config),
  delete: (url, config = {}) => apiClient.delete(url, config),
  patch: (url, data = null, config = {}) => apiClient.patch(url, data, config),
}

export default apiClient
