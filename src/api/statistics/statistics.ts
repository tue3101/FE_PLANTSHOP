import { api } from "../axiosConfig"
import type { ApiResponse } from "@/types/api.types"
import type { AxiosRequestConfig } from "axios"

// ==================== GET - BY DATE ====================
export const getStatisticsByDate = async (
  year: number,
  month: number,
  day: number
): Promise<ApiResponse> => {
  const response = await api.get("/statistics/by-date", {
    params: { year, month, day },
  } as AxiosRequestConfig)
  return response.data
}

export const getStatisticsByMonth = async (year: number, month: number): Promise<ApiResponse> => {
  const response = await api.get("/statistics/by-month", {
    params: { year, month },
  } as AxiosRequestConfig)
  return response.data
}

export const getStatisticsByYear = async (year: number): Promise<ApiResponse> => {
  const response = await api.get("/statistics/by-year", {
    params: { year },
  } as AxiosRequestConfig)
  return response.data
}

// ==================== GET - TOP PRODUCTS ====================
export const getTopProductsByDate = async (
  year: number,
  month: number,
  day: number,
  limit: number = 10
): Promise<ApiResponse> => {
  const response = await api.get("/statistics/top-products/by-date", {
    params: { year, month, day, limit },
  } as AxiosRequestConfig)
  return response.data
}

export const getTopProductsByMonth = async (
  year: number,
  month: number,
  limit: number = 10
): Promise<ApiResponse> => {
  const response = await api.get("/statistics/top-products/by-month", {
    params: { year, month, limit },
  } as AxiosRequestConfig)
  return response.data
}

export const getTopProductsByYear = async (
  year: number,
  limit: number = 10
): Promise<ApiResponse> => {
  const response = await api.get("/statistics/top-products/by-year", {
    params: { year, limit },
  } as AxiosRequestConfig)
  return response.data
}

// ==================== GET - PRODUCTS SOLD ====================
export const getTotalProductsSoldByMonth = async (
  year: number,
  month: number
): Promise<ApiResponse> => {
  const response = await api.get("/statistics/products-sold/by-month", {
    params: { year, month },
  } as AxiosRequestConfig)
  return response.data
}

export const getTotalProductsSoldByYear = async (year: number): Promise<ApiResponse> => {
  const response = await api.get("/statistics/products-sold/by-year", {
    params: { year },
  } as AxiosRequestConfig)
  return response.data
}
