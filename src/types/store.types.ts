import type { ApiResponse } from "./api.types"

export interface User {
  id?: number
  user_id?: number
  username?: string
  email?: string
  phone_number?: string
  role?: string
  address?: string
  district_id?: number
  city_id?: number
  [key: string]: any
}

export interface Product {
  product_id: number
  product_name: string
  price: number
  img_url: string
  quantity?: number
  stock?: number
  out_of_stock?: boolean
  is_deleted?: boolean
  _deleted?: boolean
  [key: string]: any
}

export interface CartItem {
  product_id: number
  product_name: string
  price: number
  img_url: string
  quantity: number
  cart_detail_id: number
  selected: boolean
  stock: number
  out_of_stock: boolean
  products: Product
  is_deleted: boolean
  [key: string]: any
}

export interface Order {
  order_id: number
  user_id: number
  status: string
  shipping_status?: string
  total_amount: number
  created_at?: string
  [key: string]: any
}

export interface Category {
  category_id: number
  category_name: string
  [key: string]: any
}

export interface Discount {
  discount_id: number
  discount_code: string
  discount_percent: number
  [key: string]: any
}

export interface Review {
  review_id: number
  product_id: number
  user_id: number
  rating: number
  comment: string
  [key: string]: any
}

export interface Payment {
  payment_id: number
  order_id: number
  amount: number
  status: string
  [key: string]: any
}

export interface Statistics {
  totalRevenue?: number
  totalOrders?: number
  totalProducts?: number
  totalUsers?: number
  [key: string]: any
}

