import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios"
import type { CustomAxiosRequestConfig, RefreshTokenResponse, ApiResponse } from "@/types/api.types"

// Tạo axios instance với cấu hình mặc định
const apiClient: AxiosInstance = axios.create({
  baseURL: "http://localhost:1234/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
})

// Biến để quản lý refresh token
let isRefreshing = false
type QueueItem = {
  resolve: (_token: string | null) => void
  reject: (_error: unknown | null) => void
}
let failedQueue: QueueItem[] = []

const processQueue = (error: unknown | null, token: string | null = null): void => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token!)
    }
  })
  failedQueue = []
}

// Interceptor xử lý request - tự động thêm token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const customConfig = config as CustomAxiosRequestConfig
    if (customConfig._skipRetry || customConfig._skipAuth) {
      return config
    }
    const token = localStorage.getItem("accessToken")
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Interceptor xử lý response với refresh token logic
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomAxiosRequestConfig

    // Log error for debugging
    if (error.response) {
      console.log(`📡 API Error: ${error.response.status} - ${originalRequest.url}`)
    }

    // Bỏ qua nếu request có flag _skipRetry hoặc đã retry
    if (originalRequest._skipRetry || originalRequest._retry) {
      return Promise.reject(error)
    }

    // Bỏ qua retry cho các endpoint public
    if (originalRequest._skipAuth) {
      return Promise.reject(error)
    }

    // Check if error is 401 (Unauthorized) - token expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      console.log("🔐 401 Unauthorized detected, attempting to refresh token...")
      if (isRefreshing) {
        return new Promise<string | null>((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string | null) => resolve(token),
            reject: (error: unknown | null) => reject(error),
          })
        })
          .then((token: string | null) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`
            }
            return apiClient(originalRequest)
          })
          .catch((err) => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const refreshToken = localStorage.getItem("refreshToken")
        if (!refreshToken) {
          console.error("❌ No refresh token found in localStorage")
          throw new Error("No refresh token")
        }

        console.log("🔄 Attempting to refresh token...")
        const refreshConfig: CustomAxiosRequestConfig = {
          headers: { Authorization: `Bearer ${refreshToken}` },
          _skipRetry: true,
        }
        const response = await apiClient.post<ApiResponse<RefreshTokenResponse>>(
          "/auth/refresh",
          null,
          refreshConfig
        )

        console.log("📦 Refresh token response:", response.data)

        if (response.data.success && response.data.data) {
          const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data.data
          console.log("✅ Token refreshed successfully")
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

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
          }
          processQueue(null, newAccessToken)
          return apiClient(originalRequest)
        } else {
          console.error("❌ Refresh token failed - invalid response:", response.data)
          throw new Error("Refresh token failed - invalid response")
        }
      } catch (err) {
        console.error("❌ Error refreshing token:", err)
        processQueue(err, null)
        localStorage.removeItem("accessToken")
        localStorage.removeItem("refreshToken")

        // Clear auth store
        try {
          const { useAuthStore } = await import("../stores/auth")
          const authStore = useAuthStore()
          authStore.logout()
        } catch (storeErr) {
          console.error("Error clearing auth store:", storeErr)
        }

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
  get: <T = unknown>(
    url: string,
    config: AxiosRequestConfig = {}
  ): Promise<AxiosResponse<ApiResponse<T>>> => apiClient.get<ApiResponse<T>>(url, config),
  post: <T = unknown>(
    url: string,
    data: unknown = null,
    config: AxiosRequestConfig = {}
  ): Promise<AxiosResponse<ApiResponse<T>>> => apiClient.post<ApiResponse<T>>(url, data, config),
  put: <T = unknown>(
    url: string,
    data: unknown = null,
    config: AxiosRequestConfig = {}
  ): Promise<AxiosResponse<ApiResponse<T>>> => apiClient.put<ApiResponse<T>>(url, data, config),
  delete: <T = unknown>(
    url: string,
    config: AxiosRequestConfig = {}
  ): Promise<AxiosResponse<ApiResponse<T>>> => apiClient.delete<ApiResponse<T>>(url, config),
  patch: <T = unknown>(
    url: string,
    data: unknown = null,
    config: AxiosRequestConfig = {}
  ): Promise<AxiosResponse<ApiResponse<T>>> => apiClient.patch<ApiResponse<T>>(url, data, config),
}

export default apiClient
