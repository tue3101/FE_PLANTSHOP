import type { AxiosRequestConfig, AxiosResponse } from 'axios'

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface ApiError {
  message: string
  status?: number
  data?: any
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
}

export interface CustomAxiosRequestConfig extends AxiosRequestConfig {
  _skipRetry?: boolean
  _skipAuth?: boolean
  _retry?: boolean
}

export interface RefreshTokenResponse {
  accessToken: string
  refreshToken: string
}

