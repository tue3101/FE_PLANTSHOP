import type { Component } from "vue"
import type { LucideIcon } from "lucide-vue-next"

export interface RouteMeta {
  requiresAuth?: boolean
  requiresAdmin?: boolean
  requiresUser?: boolean
  isShow?: boolean
  title?: string
  icon?: LucideIcon
}

declare module "vue-router" {
  interface RouteMeta extends RouteMeta {}
}

