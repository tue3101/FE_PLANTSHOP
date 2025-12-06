import { Home, Package, Users, Folder, Percent, ShoppingCart, Star } from "lucide-vue-next"
import { createRouter, createWebHistory, type RouteRecordRaw } from "vue-router"
import { useAuthStore } from "@/stores/auth"
import type { RouteMeta } from "@/types/router.types"

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "homepage",
    component: () => import("@/layouts/user/UserLayout.vue"),
    redirect: "/home",
    meta: {
      requiresAuth: true,
      requiresUser: true,
    } as RouteMeta,
    children: [
      {
        path: "home",
        name: "home",
        component: () => import("@/views/user/content/HomePage.vue"),
        meta: {
          isShow: true,
          title: "Trang Chủ",
          requiresAuth: true,
          requiresUser: true,
        } as RouteMeta,
      },
      {
        path: "product",
        name: "product",
        component: () => import("@/views/user/content/ProductPage.vue"),
        meta: {
          isShow: true,
          title: "Sản Phẩm",
          requiresAuth: true,
          requiresUser: true,
        } as RouteMeta,
      },
      {
        path: "categories",
        name: "categories",
        meta: {
          isShow: true,
          title: "Danh Mục",
          requiresAuth: true,
          requiresUser: true,
        } as RouteMeta,
      },
      {
        path: "product-detail/:id",
        name: "product-detail",
        component: () => import("@/components/common/user/product/ProductDetailPage.vue"),
        meta: {
          isShow: false,
          title: "Chi tiết sản phẩm",
          requiresAuth: true,
          requiresUser: true,
        } as RouteMeta,
      },
      {
        path: "contact",
        name: "contact",
        component: () => import("@/views/user/content/ContactPage.vue"),
        meta: {
          isShow: true,
          title: "Liên Hệ",
          requiresAuth: true,
          requiresUser: true,
        } as RouteMeta,
      },
      {
        path: "userinfo",
        name: "userinfo",
        component: () => import("@/views/components/UserInfoPage.vue"),
        meta: {
          isShow: false,
          title: "Thông tin người dùng",
          requiresAuth: true,
          requiresUser: true,
        } as RouteMeta,
      },
      {
        path: "cart",
        name: "cart",
        component: () => import("@/views/user/content/CartPage.vue"),
        meta: {
          isShow: false,
          title: "Giỏ hàng",
          requiresAuth: true,
          requiresUser: true,
        } as RouteMeta,
      },
      {
        path: "checkout",
        name: "checkout",
        component: () => import("@/views/user/content/payment/CheckInfoPage.vue"),
        meta: {
          isShow: false,
          title: "Kiểm tra thông tin giao hàng",
          requiresAuth: true,
          requiresUser: true,
        } as RouteMeta,
      },
      {
        path: "payment",
        name: "payment",
        component: () => import("@/views/user/content/payment/PaymentPage.vue"),
        meta: {
          isShow: false,
          title: "Tạm tính giá tiền",
          requiresAuth: true,
          requiresUser: true,
        } as RouteMeta,
      },
      {
        path: "orders-page",
        name: "orders-page",
        component: () => import("@/views/user/content/order/OrderPage.vue"),
        meta: {
          isShow: false,
          title: "Đơn hàng của tôi",
          requiresAuth: true,
          requiresUser: true,
        } as RouteMeta,
      },
      {
        path: "order-history",
        name: "order-history",
        component: () => import("@/views/user/content/order/OrderHistoryPage.vue"),
        meta: {
          isShow: false,
          title: "Lịch sử đơn hàng",
          requiresAuth: true,
          requiresUser: true,
        } as RouteMeta,
      },
      {
        path: "review/:orderId",
        name: "review",
        component: () => import("@/views/user/content/ReviewPage.vue"),
        meta: {
          isShow: false,
          title: "Đánh giá sản phẩm",
          requiresAuth: true,
          requiresUser: true,
        } as RouteMeta,
      },
      {
        path: "payment/return",
        name: "payment-return",
        component: () => import("@/views/user/content/payment/PaymentReturnPage.vue"),
        meta: {
          isShow: false,
          title: "Kết quả thanh toán",
          requiresAuth: false, // Không yêu cầu auth vì MoMo redirect về đây
          requiresUser: false,
        } as RouteMeta,
      },
    ],
  },
  {
    path: "/login",
    name: "login",
    component: () => import("@/views/auth/LoginView.vue"),
  },
  {
    path: "/auth/google/callback",
    name: "google-callback",
    component: () => import("@/views/auth/GoogleCallbackView.vue"),
  },
  {
    path: "/dashboard",
    name: "dashboard",
    component: () => import("@/layouts/admin/AdminLayout.vue"),
    redirect: "/dashboard/homeview",
    meta: {
      requiresAuth: true,
      requiresAdmin: true,
    } as RouteMeta,
    children: [
      {
        path: "homeview",
        name: "homeview",
        component: () => import("@/views/admin/content/HomeView.vue"),
        meta: {
          icon: Home,
          isShow: true,
          title: "Quản Lý Thống Kê",
          requiresAuth: true,
          requiresAdmin: true,
        } as RouteMeta,
      },
      {
        path: "personal",
        name: "personal",
        component: () => import("@/views/components/UserInfoPage.vue"),
        meta: {
          isShow: false,
          requiresAuth: true,
          requiresAdmin: true,
        } as RouteMeta,
      },
      {
        path: "products",
        name: "products",
        component: () => import("@/views/admin/content/ProductView.vue"),
        meta: {
          icon: Package,
          isShow: true,
          title: "Quản Lý Sản Phẩm",
          requiresAuth: true,
          requiresAdmin: true,
        } as RouteMeta,
      },
      {
        path: "users",
        name: "users",
        component: () => import("@/views/admin/content/UserView.vue"),
        meta: {
          icon: Users,
          isShow: true,
          title: "Quản Lý Người Dùng",
          requiresAuth: true,
          requiresAdmin: true,
        } as RouteMeta,
      },
      {
        path: "categories",
        name: "categories",
        component: () => import("@/views/admin/content/CategoryView.vue"),
        meta: {
          icon: Folder,
          isShow: true,
          title: "Quản Lý Danh Mục",
          requiresAuth: true,
          requiresAdmin: true,
        } as RouteMeta,
      },
      {
        path: "discounts",
        name: "discounts",
        component: () => import("@/views/admin/content/DiscountView.vue"),
        meta: {
          icon: Percent,
          isShow: true,
          title: "Quản Lý Mã Giảm Giá",
          requiresAuth: true,
          requiresAdmin: true,
        } as RouteMeta,
      },
      {
        path: "orders",
        name: "orders",
        component: () => import("@/views/admin/content/OrderView.vue"),
        meta: {
          icon: ShoppingCart,
          isShow: true,
          title: "Quản Lý Đơn Hàng",
          requiresAuth: true,
          requiresAdmin: true,
        } as RouteMeta,
      },
      {
        path: "reviews",
        name: "reviews",
        component: () => import("@/views/admin/content/ReviewView.vue"),
        meta: {
          icon: Star,
          isShow: true,
          title: "Quản Lý Đánh Giá",
          requiresAuth: true,
          requiresAdmin: true,
        } as RouteMeta,
      },
    ],
  },
  {
    path: "/register",
    name: "register",
    component: () => import("@/views/auth/RegisterView.vue"),
  },
  {
    path: "/verify-otp",
    name: "verify-otp",
    component: () => import("@/views/auth/VerifyOtpView.vue"),
  },
  {
    path: "/forgot-password",
    name: "forgot-password",
    component: () => import("@/views/auth/ForgotPassView.vue"),
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    if (to.hash) {
      return {
        el: to.hash,
        behavior: "smooth",
      }
    }
    return {
      top: 0,
      behavior: "smooth",
    }
  },
  routes,
})

router.beforeEach(async (to) => {
  document.title = (to.meta?.title as string) || (to.name as string) || "Plant Shop"

  const authStore = useAuthStore()

  // Chặn truy cập /login và /register nếu đã đăng nhập
  if (authStore.isAuthenticated && (to.path === "/login" || to.path === "/register")) {
    const role = authStore.userRole
    if (role === "ADMIN") {
      return "/dashboard"
    } else {
      return "/"
    }
  }

  // Check nếu route yêu cầu authentication
  if (to.meta?.requiresAuth) {
    if (!authStore.isAuthenticated) {
      return "/login"
    }

    // Check nếu route yêu cầu quyền ADMIN
    if (to.meta?.requiresAdmin) {
      const role = authStore.userRole
      if (role !== "ADMIN") {
        alert("Bạn không có quyền truy cập trang này!")
        return "/"
      }
    }

    // Check nếu route yêu cầu quyền USER
    if (to.meta?.requiresUser) {
      const role = authStore.userRole
      if (role !== "USER") {
        // Nếu là ADMIN thì redirect về dashboard
        if (role === "ADMIN") {
          return "/dashboard"
        }
        // Không có quyền thì về login
        alert("Bạn không có quyền truy cập trang này!")
        return "/login"
      }
    }
  }
})

export default router

