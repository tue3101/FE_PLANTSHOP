import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import axios from 'axios'

import App from './App.vue'
import router from './router'


// Axios interceptor để tự động thêm token
axios.interceptors.request.use(
  (config) => {
    // KHÔNG thêm token nếu đây là refresh API call (được đánh dấu bởi _skipRetry)
    // hoặc là public endpoint không cần auth (được đánh dấu bởi _skipAuth)
    if (config._skipRetry || config._skipAuth) {
      return config
    }
    
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Token sẽ được lưu trong localStorage và vẫn còn khi đóng tab
// Chỉ logout khi user bấm logout button hoặc token hết hạn

// Axios interceptor để tự động refresh token khi 401
let isRefreshing = false
let failedQueue = [] //hàng đợi các request bị lỗi khi token hết hạn

//hàm xử lý hàng đợi các request bị lỗi khi token hết hạn
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


//hàm xử lý khi token hết hạn và tự động refresh token
axios.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    const originalRequest = error.config

    // Bỏ qua nếu request có flag _skipRetry hoặc đã retry
    if (originalRequest._skipRetry || originalRequest._retry) {
      return Promise.reject(error)
    }

    // Bỏ qua retry cho các endpoint public (không cần auth)
    if (originalRequest._skipAuth) {
      return Promise.reject(error)
    }

    if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return axios(originalRequest)
          })
          .catch((err) => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const refreshToken = localStorage.getItem('refreshToken')
        if (!refreshToken) throw new Error('No refresh token')

        // Tạo config riêng cho refresh API để tránh infinite loop
        const refreshConfig = {
          headers: { Authorization: `Bearer ${refreshToken}` },
        }
        refreshConfig._skipRetry = true
        const response = await axios.post('/api/auth/refresh', null, refreshConfig)

        if (response.data.success) {
          const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data.data
          localStorage.setItem('accessToken', newAccessToken)
          localStorage.setItem('refreshToken', newRefreshToken)
          
          // Update auth store nếu có
          try {
            const { useAuthStore } = await import('./stores/auth')
            const authStore = useAuthStore()
            authStore.accessToken = newAccessToken
            authStore.refreshToken = newRefreshToken
            
            // Reload user info sau khi refresh token thành công
            try {
              const { useUserStore } = await import('./stores/user')
              const userStore = useUserStore()
              // Chỉ reload nếu user đã đăng nhập và có userId
              if (authStore.isAuthenticated && authStore.userId) {
                await userStore.getInfo(newAccessToken)
              }
            } catch (userErr) {
              console.error('Error reloading user info after token refresh:', userErr)
            }
          } catch (err) {
            console.error(err)
          }
          
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
          processQueue(null, newAccessToken)
          return axios(originalRequest)
        } else {
          throw new Error('Refresh token failed')
        }
      } catch (err) {
        processQueue(err, null)
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        window.location.href = '/login'
        return Promise.reject(err)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
