import {
  loginUser,
  logoutUser,
  registerUser,
  sendOtp,
  verifyOtp,
  sendOtpForForgotPassword,
  resetPasswordWithOtp,
  changePassword as changePasswordAPI,
  loginWithGoogle as loginGoogleAPI,
} from "../api/auth/auth"
import { defineStore } from "pinia"
import { ref, computed, type Ref, type ComputedRef } from "vue"
import type { ApiResponse } from "@/types/api.types"

interface JWTPayload {
  sub?: string
  role?: string
  exp?: number
  [key: string]: any
}

// giải mã JWT
const decodeJWT = (token: string): JWTPayload => {
  try {
    const base64Url = token.split(".")[1] //tách chuỗi token tại dấu .
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/") //thay đổi nếu có kí tự - hoặc _
    const jsonPayload = decodeURIComponent(
      //giải mã  chuỗi đã encode theo URL
      atob(base64)
        .split("")
        // c là từng kí tự riêng lẻ trong chuỗi => % => 00 đảm bảo luôn ít nhất 2 chữ số => chuyển về mã số Unicode => sang hệ 16 => láy 2 kí tự cuối
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("") //nối chuỗi
    )
    return JSON.parse(jsonPayload) //=>object
  } catch (error) {
    console.error(error)
    throw error
  }
}

export const useAuthStore = defineStore("auth", () => {
  const accessToken: Ref<string | null> = ref(localStorage.getItem("accessToken"))
  const refreshToken: Ref<string | null> = ref(localStorage.getItem("refreshToken"))

  // Hàm lưu token vào localStorage
  const saveTokens = (access: string | null, refresh: string | null): void => {
    if (access) {
      localStorage.setItem("accessToken", access)
      accessToken.value = access
    }
    if (refresh) {
      localStorage.setItem("refreshToken", refresh)
      refreshToken.value = refresh
    }
  }

  // Hàm xóa token khỏi localStorage
  const clearTokens = (): void => {
    localStorage.removeItem("accessToken")
    localStorage.removeItem("refreshToken")
    accessToken.value = null
    refreshToken.value = null
  }

  // check user login
  const isAuthenticated: ComputedRef<boolean> = computed(() => {
    return !!accessToken.value //!!=> ép boolean
  })

  // lấy role từ JWT token
  const userRole: ComputedRef<string | null> = computed(() => {
    if (!accessToken.value) return null
    const decoded = decodeJWT(accessToken.value)
    return decoded?.role || null
  })

  //  lấy userId từ JWT token
  const userId: ComputedRef<string | number | null> = computed(() => {
    if (!accessToken.value) return null
    const decoded = decodeJWT(accessToken.value)
    return decoded?.sub || null
  })

  const registerUsers = async (
    email: string,
    username: string,
    password: string,
    otpCode: string,
    role: string | null = null
  ): Promise<ApiResponse> => {
    try {
      const response = await registerUser(email, username, password, otpCode, role)
      return response.data
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  // Gửi OTP đến email (cho đăng ký - cần username, email, password)
  const sendOtpToEmail = async (
    username: string,
    email: string,
    password: string
  ): Promise<ApiResponse> => {
    try {
      const response = await sendOtp(username, email, password)
      return response.data
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  // Xác thực OTP (optional)
  const verifyOtpCode = async (email: string, otpCode: string): Promise<ApiResponse> => {
    try {
      const response = await verifyOtp(email, otpCode)
      return response.data
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  const loginUsers = async (email: string, password: string): Promise<void> => {
    try {
      const response = await loginUser(email, password)
      if (!response.success) {
        throw new Error(response.message || "Đăng nhập thất bại")
      }
      if (!response.data?.accessToken || !response.data?.refreshToken) {
        throw new Error("Không nhận được token từ server")
      }
      saveTokens(response.data.accessToken, response.data.refreshToken)
    } catch (error) {
      console.error("Login error:", error)
      // Nếu error đã có message, giữ nguyên, nếu không thì thêm message mặc định
      if (error instanceof Error) {
        throw error
      }
      throw new Error("Đăng nhập thất bại. Vui lòng thử lại!")
    }
  }

  const logout = async (): Promise<void> => {
    try {
      if (accessToken.value) {
        await logoutUser()
      }
    } catch (error) {
      console.error(error)
      throw error
    } finally {
      clearTokens()
    }
  }

  const loginWithGoogle = async (code: string): Promise<ApiResponse> => {
    try {
      const response = await loginGoogleAPI(code)
      saveTokens(response.data.data.accessToken, response.data.data.refreshToken)
      return response.data
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  const changePassword = async (
    oldPassword: string,
    newPassword: string
  ): Promise<ApiResponse> => {
    try {
      const response = await changePasswordAPI(oldPassword, newPassword)
      return response.data
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  // Gửi OTP cho quên mật khẩu
  const sendOtpForForgotPasswordStore = async (email: string): Promise<ApiResponse> => {
    try {
      const response = await sendOtpForForgotPassword(email)
      return response.data
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  // Reset password với OTP
  const resetPasswordWithOtpStore = async (
    email: string,
    otpCode: string,
    newPassword: string
  ): Promise<ApiResponse> => {
    try {
      const response = await resetPasswordWithOtp(email, otpCode, newPassword)
      return response.data
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  return {
    accessToken,
    refreshToken,
    userRole,
    userId,
    isAuthenticated,
    registerUsers,
    loginUsers,
    logout,
    loginWithGoogle,
    changePassword,
    sendOtpToEmail,
    verifyOtpCode,
    sendOtpForForgotPasswordStore,
    resetPasswordWithOtpStore,
  }
})

