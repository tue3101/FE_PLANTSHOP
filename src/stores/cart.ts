import { defineStore } from "pinia"
import { ref, computed, type Ref, type ComputedRef } from "vue"
import {
  getCartOfUser,
  getCartDetail,
  addProductToCart,
  updateCartQuantity,
  removeProductFromCart,
} from "@/api/cart/cart"
import { useAuthStore } from "@/stores/auth"
import type { CartItem, Product } from "@/types/store.types"
import type { ApiResponse } from "@/types/api.types"

export const useCartStore = defineStore("cart", () => {
  const authStore = useAuthStore()
  const cartItems: Ref<CartItem[]> = ref([])
  const cartId: Ref<number | null> = ref(null)

  const loadCartFromBackend = async (userId: string | number | null): Promise<void> => {
    if (!userId) return
    try {
      const cartResponse = await getCartOfUser(userId)
      if (cartResponse.data.success) {
        cartId.value = cartResponse.data.data?.cart_id || null
      }
      if (!cartId.value) {
        cartItems.value = []
        return
      }
      const detailResponse = await getCartDetail(cartId.value)
      if (detailResponse.data.success) {
        const data = detailResponse.data.data || []
        cartItems.value = Array.isArray(data)
          ? data.map((item: any) => {
              const product: Product = item.products

              const cartItem: CartItem = {
                ...product,
                product_id: product.product_id,
                product_name: product.product_name,
                price: product.price || 0,
                img_url: product.img_url,
                quantity: item.quantity || 1,
                cart_detail_id: item.cart_detail_id,
                selected: item.selected ?? true,
                stock: product.quantity || 0,
                out_of_stock: product.out_of_stock || false,
                products: product,
                is_deleted: product._deleted || false,
              }

              return cartItem
            })
          : []
      } else {
        cartItems.value = []
      }
    } catch (error) {
      cartItems.value = []
      throw error
    }
  }

  // Thêm sản phẩm vào giỏ hàng
  const addToCart = async (product: Product, quantity: number = 1): Promise<ApiResponse> => {
    const userId = authStore.userId
    if (!userId) throw new Error("User not authenticated")
    const productId = product.product_id
    const response = await addProductToCart(userId, productId, quantity)

    if (response.data.success) {
      await loadCartFromBackend(userId)
    }

    return response.data
  }

  // Xóa sản phẩm khỏi giỏ hàng
  const removeFromCart = async (cart_detail_id: number): Promise<ApiResponse> => {
    const userId = authStore.userId
    if (!userId) throw new Error("User not authenticated")

    const item = cartItems.value.find((item) => item.cart_detail_id === cart_detail_id)

    if (!item) throw new Error("Item not found in cart")

    const productId = item.product_id
    const response = await removeProductFromCart(userId, productId)

    if (response.data.success) {
      await loadCartFromBackend(userId)
    }

    return response.data
  }

  // Cập nhật số lượng sản phẩm
  const updateQuantity = async (
    cart_detail_id: number,
    quantity: number,
    selected: boolean | null = null
  ): Promise<ApiResponse | void> => {
    const userId = authStore.userId
    if (!userId) throw new Error("User not authenticated")
    const item = cartItems.value.find((item) => item.cart_detail_id === cart_detail_id)

    if (!item) return

    if (quantity <= 0) {
      return await removeFromCart(cart_detail_id)
    }

    const productId = item.product_id
    const response = await updateCartQuantity(userId, productId, quantity, selected)

    if (response.data.success) {
      await loadCartFromBackend(userId)
    }

    return response.data
  }

  //reduce sẽ khởi tạo sum=0 và duyệt từng item trong cartItems và cộng dồn
  // Tính tổng số lượng sản phẩm trong giỏ
  const totalItems: ComputedRef<number> = computed(() => {
    return cartItems.value.reduce((sum, item) => sum + item.quantity, 0)
  })

  // Tính tổng tiền
  const totalPrice: ComputedRef<number> = computed(() => {
    return cartItems.value.reduce((sum, item) => {
      if (!item.selected) return sum
      const price = item.price
      return sum + price * item.quantity
    }, 0)
  })

  // Kiểm tra sản phẩm đã có trong giỏ hàng chưa
  const isInCart = (productId: number): boolean => {
    return cartItems.value.some((item) => item.product_id === productId)
  }

  return {
    cartItems,
    cartId,
    addToCart,
    removeFromCart,
    updateQuantity,
    totalItems,
    totalPrice,
    isInCart,
    loadCartFromBackend,
  }
})

