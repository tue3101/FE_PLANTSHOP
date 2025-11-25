import AdminLayout from "@/layouts/admin/AdminLayout.vue"
import HomeLayout from "@/layouts/user/UserLayout.vue"
import CategoryView from "@/views/admin/content/CategoryView.vue"
import DiscountView from "@/views/admin/content/DiscountView.vue"
import HomeView from "@/views/admin/content/HomeView.vue"
import OrderView from "@/views/admin/content/OrderView.vue"
import ProductView from "@/views/admin/content/ProductView.vue"
import ReviewView from "@/views/admin/content/ReviewView.vue"
import UserView from "@/views/admin/content/UserView.vue"
import ForgotPassView from "@/views/auth/ForgotPassView.vue"
import LoginView from "@/views/auth/LoginView.vue"
import RegisterView from "@/views/auth/RegisterView.vue"
import VerifyOtpView from "@/views/auth/VerifyOtpView.vue"
import ContactPage from "@/views/user/content/ContactPage.vue"
import HomePage from "@/views/user/content/HomePage.vue"
import ProductPage from "@/views/user/content/ProductPage.vue"
import { Home, Package, Users, Folder, Percent, ShoppingCart, Star } from "lucide-vue-next"
import { createRouter, createWebHistory } from "vue-router"
import { useAuthStore } from '@/stores/auth'
import CartPage from "@/views/user/content/CartPage.vue"
import GoogleCallbackView from "@/views/auth/GoogleCallbackView.vue"
import UserInfoPage from "@/views/components/UserInfoPage.vue"
import CheckoutPage from "@/views/user/content/payment/CheckInfoPage.vue"
import PaymentPage from "@/views/user/content/payment/PaymentPage.vue"
import OrderPage from "@/views/user/content/order/OrderPage.vue"
import OrderHistoryPage from "@/views/user/content/order/OrderHistoryPage.vue"
import PaymentReturnPage from "@/views/user/content/payment/PaymentReturnPage.vue"
import ReviewPage from "@/views/user/content/ReviewPage.vue"
import TransactionView from "@/views/admin/content/TransactionView.vue"
import { DollarSign } from "lucide-vue-next"
import ProductDetailPage from "@/components/common/user/product/ProductDetailPage.vue"
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth'
      }
    }
    return {
      top: 0,
      behavior: 'smooth'
    }
  },
  routes: [
    {
      path: "/",
      name: "homepage",
      component: HomeLayout,
      redirect: "/home",
      meta: {
        requiresAuth: true,
        requiresUser: true,
      },
      children: [
        {
          path: "home",
          name: "home",
          component: HomePage,
          meta: {
            isShow: true,
            title: "Trang Chủ",
            requiresAuth: true,
            requiresUser: true,
          },
        },
        {
          path: "product",
          name: "product",
          component: ProductPage,
          meta: {
            isShow: true,
            title: "Sản Phẩm",
            requiresAuth: true,
            requiresUser: true,
          },
        },
        {
          path: "categories",
          name: "categories",
          meta: {
            isShow: true,
            title: "Danh Mục",
            requiresAuth: true,
            requiresUser: true,
          },
        },
        {
          path: "product-detail/:id",
          name: "product-detail",
          component: ProductDetailPage,
          meta: {
            isShow: false,
            title: "Chi tiết sản phẩm",
            requiresAuth: true,
            requiresUser: true,
          },
        },
        {
          path: "contact",
          name: "contact",
          component: ContactPage,
          meta: {
            isShow: true,
            title: "Liên Hệ",
            requiresAuth: true,
            requiresUser: true,
          },
        },
        {
          path: "userinfo",
          name: "userinfo",
          component: UserInfoPage,
          meta: {
            isShow: false,
            title: "Thông tin người dùng",
            requiresAuth: true,
            requiresUser: true,
          },
        },
        {
          path: "cart",
          name: "cart",
          component: CartPage,
          meta: {
            isShow: false,
            title: "Giỏ hàng",
            requiresAuth: true,
            requiresUser: true,
          },
        },
        {
          path: "checkout",
          name: "checkout",
          component: CheckoutPage,
          meta: {
            isShow: false,
            title: "Kiểm tra thông tin giao hàng",
            requiresAuth: true,
            requiresUser: true,
          },
        },
        {
          path: "review-order",
          name: "review-order",
          component: PaymentPage,
          meta: {
            isShow: false,
            title: "Tạm tính giá tiền",
            requiresAuth: true,
            requiresUser: true,
          },
        },
        {
          path: "orders-page",
          name: "orders-page",
          component: OrderPage,
          meta: {
            isShow: false,
            title: "Đơn hàng của tôi",
            requiresAuth: true,
            requiresUser: true,
          },
        },
        {
          path: "order-history",
          name: "order-history",
          component:OrderHistoryPage,
          meta: {
            isShow: false,
            title: "Lịch sử đơn hàng",
            requiresAuth: true,
            requiresUser: true,
          },
        },
        {
          path: "review/:orderId",
          name: "review",
          component: ReviewPage,
          meta: {
            isShow: false,
            title: "Đánh giá sản phẩm",
            requiresAuth: true,
            requiresUser: true,
          },
        },
        {
          path: "payment/return",
          name: "payment-return",
          component:PaymentReturnPage,
          meta: {
            isShow: false,
            title: "Kết quả thanh toán",
            requiresAuth: false, // Không yêu cầu auth vì MoMo redirect về đây
            requiresUser: false,
          },
      
        },
      ],
    },
    {
      path: "/login",
      name: "login",
      component: LoginView,
    },
    {
      path: "/auth/google/callback",
      name: "google-callback",
      component: GoogleCallbackView,
    },
    {
      path: "/dashboard",
      name: "dashboard",
      component: AdminLayout,
      redirect: "/dashboard/homeview",
      meta: {
        requiresAuth: true,
        requiresAdmin: true,
      },
      children: [
        {
          path: "homeview",
          name: "homeview",
          component: HomeView,
          meta: {
            icon: Home,
            isShow: true,
            title: "Quản Lý Thống Kê",
            requiresAuth: true,
            requiresAdmin: true,
          },
        },
        {
          path: "personal",
          name: "personal",
          component: UserInfoPage,
          meta: {
            isShow: false,
            requiresAuth: true,
            requiresAdmin: true,
          },
        },
        {
          path: "products",
          name: "products",
          component: ProductView,
          meta: {
            icon: Package,
            isShow: true,
            title: "Quản Lý Sản Phẩm",
            requiresAuth: true,
            requiresAdmin: true,
          },
        },
        {
          path: "users",
          name: "users",
          component: UserView,
          meta: {
            icon: Users,
            isShow: true,
            title: "Quản Lý Người Dùng",
            requiresAuth: true,
            requiresAdmin: true,
          },
        },
        {
          path: "categories",
          name: "categories",
          component: CategoryView,
          meta: {
            icon: Folder,
            isShow: true,
            title: "Quản Lý Danh Mục",
            requiresAuth: true,
            requiresAdmin: true,
          },
        },
        {
          path: "discounts",
          name: "discounts",
          component: DiscountView,
          meta: {
            icon: Percent,
            isShow: true,
            title: "Quản Lý Mã Giảm Giá",
            requiresAuth: true,
            requiresAdmin: true,
          },
        },
        {
          path: "orders",
          name: "orders",
          component: OrderView,
          meta: {
            icon: ShoppingCart,
            isShow: true,
            title: "Quản Lý Đơn Hàng",
            requiresAuth: true,
            requiresAdmin: true,
          },
        },
        {
          path: "payments",
          name: "payments",
          component: TransactionView,
          meta: {
            icon: DollarSign,
            isShow: true,
            title: "Quản Lý Giao Dịch",
            requiresAuth: true,
            requiresAdmin: true,
          },
        },
        {
          path: "reviews",
          name: "reviews",
          component: ReviewView,
          meta: {
            icon: Star,
            isShow: true,
            title: "Quản Lý Đánh Giá",
            requiresAuth: true,
            requiresAdmin: true,
          },
        },
      ],
    },

    {
      path: "/register",
      name: "register",
      component: RegisterView,
    },
    {
      path: "/verify-otp",
      name: "verify-otp",
      component: VerifyOtpView,
    },
    {
      path: "/forgot-password",
      name: "forgot-password",
      component: ForgotPassView,
    },
  ],
})

export default router

router.beforeEach(async (to) => {
  document.title = to.meta?.title || to.name || "Plant Shop"
  
  const authStore = useAuthStore()
  
  // Chặn truy cập /login và /register nếu đã đăng nhập
  if (authStore.isAuthenticated && (to.path === '/login' || to.path === '/register')) {
    const role = authStore.userRole
    if (role === 'ADMIN') {
      return '/dashboard'
    } else {
      return '/'
    }
  }

  // Check nếu route yêu cầu authentication
  if (to.meta?.requiresAuth) {
    if (!authStore.isAuthenticated) {
      return '/login'
    }

    // Check nếu route yêu cầu quyền ADMIN
    if (to.meta?.requiresAdmin) {
      const role = authStore.userRole
      if (role !== 'ADMIN') {
        alert('Bạn không có quyền truy cập trang này!')
        return '/'
      }
    }

    // Check nếu route yêu cầu quyền USER
    if (to.meta?.requiresUser) {
      const role = authStore.userRole
      if (role !== 'USER') {
        // Nếu là ADMIN thì redirect về dashboard
        if (role === 'ADMIN') {
          return '/dashboard'
        }
        // Không có quyền thì về login
        alert('Bạn không có quyền truy cập trang này!')
        return '/login'
      }
    }
  }
})
