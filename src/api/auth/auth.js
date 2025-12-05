import { api } from "../axiosConfig"

// ==================== POST ====================
export const registerUser = async (email, username, password, otpCode, role = null) => {
  const requestBody = { email, username, password, otpCode }
  if (role) requestBody.role = role
  return api.post("/auth/register", requestBody)
}

export const sendOtp = async (username, email, password) => {
  return api.post("/auth/send-otp-register", { username, email, password })
}

export const verifyOtp = async (email, otpCode) => {
  return api.post("/auth/verify-otp", { email, otpCode })
}

export const loginUser = async (email, password) => {
  return api.post("/auth/login", { email, password })
}

export const refreshToken = async () => {
  return api.post("/auth/refresh")
}

export const logoutUser = async () => {
  return api.post("/auth/logout")
}

export const loginWithGoogle = async (code) => {
  return api.post("/auth/google", { code })
}

export const sendOtpForForgotPassword = async (email) => {
  return api.post("/auth/forgot-password/send-otp", { email })
}

export const resetPasswordWithOtp = async (email, otpCode, newPassword) => {
  return api.post("/auth/forgot-password/reset", { email, otpCode, newPassword })
}

// ==================== PUT ====================
export const changePassword = async (oldPassword, newPassword) => {
  return api.put("/auth/change-password", { oldPassword, newPassword })
}

// ==================== UTILS ====================
export const isTokenExpired = (token) => {
  if (!token) return true
  try {
    const decoded = JSON.parse(atob(token.split(".")[1]))
    const exp = decoded.exp * 1000
    return Date.now() >= exp
  } catch (error) {
    console.error("Token error:", error.message)
    return true
  }
}
