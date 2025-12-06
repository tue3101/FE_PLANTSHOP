import { api } from "../axiosConfig"
import type { ApiResponse } from "@/types/api.types"

export interface RegisterRequest {
  email: string
  username: string
  password: string
  otpCode: string
  role?: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface SendOtpRequest {
  username: string
  email: string
  password: string
}

export interface VerifyOtpRequest {
  email: string
  otpCode: string
}

export interface GoogleLoginRequest {
  code: string
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  email: string
  otpCode: string
  newPassword: string
}

export interface ChangePasswordRequest {
  oldPassword: string
  newPassword: string
}

// ==================== POST ====================
export const registerUser = async (
  email: string,
  username: string,
  password: string,
  otpCode: string,
  role: string | null = null
): Promise<ApiResponse> => {
  const requestBody: RegisterRequest = { email, username, password, otpCode }
  if (role) requestBody.role = role
  const response = await api.post("/auth/register", requestBody)
  return response.data
}

export const sendOtp = async (
  username: string,
  email: string,
  password: string
): Promise<ApiResponse> => {
  const response = await api.post("/auth/send-otp-register", { username, email, password })
  return response.data
}

export const verifyOtp = async (
  email: string,
  otpCode: string
): Promise<ApiResponse> => {
  const response = await api.post("/auth/verify-otp", { email, otpCode })
  return response.data
}

export const loginUser = async (
  email: string,
  password: string
): Promise<ApiResponse> => {
  const response = await api.post("/auth/login", { email, password })
  return response.data
}

export const refreshToken = async (): Promise<ApiResponse> => {
  const response = await api.post("/auth/refresh")
  return response.data
}

export const logoutUser = async (): Promise<ApiResponse> => {
  const response = await api.post("/auth/logout")
  return response.data
}

export const loginWithGoogle = async (code: string): Promise<ApiResponse> => {
  const response = await api.post("/auth/google", { code })
  return response.data
}

export const sendOtpForForgotPassword = async (
  email: string
): Promise<ApiResponse> => {
  const response = await api.post("/auth/forgot-password/send-otp", { email })
  return response.data
}

export const resetPasswordWithOtp = async (
  email: string,
  otpCode: string,
  newPassword: string
): Promise<ApiResponse> => {
  const response = await api.post("/auth/forgot-password/reset", { email, otpCode, newPassword })
  return response.data
}

// ==================== PUT ====================
export const changePassword = async (
  oldPassword: string,
  newPassword: string
): Promise<ApiResponse> => {
  const response = await api.put("/auth/change-password", { oldPassword, newPassword })
  return response.data
}

// ==================== UTILS ====================
export const isTokenExpired = (token: string | null): boolean => {
  if (!token) return true
  try {
    const decoded = JSON.parse(atob(token.split(".")[1])) as { exp?: number }
    const exp = decoded.exp ? decoded.exp * 1000 : 0
    return Date.now() >= exp
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error("Token error:", errorMessage)
    return true
  }
}

