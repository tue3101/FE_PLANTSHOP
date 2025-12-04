import { defineStore } from "pinia"
import { ref } from "vue"
import { createOrder } from "@/api/orders/post"
import { 
    getAllOrders, 
    getOrdersByUserId, 
    getOrderById,
    getOrderDetailsByOrderId,
    getOrderDetailById
} from "@/api/orders/get"
import { updateOrderDetail, updateOrderStatus, updateOrderShippingStatus, updateOrderShippingInfo } from "@/api/orders/put"
import { deleteOrderDetail, deleteOrder } from "@/api/orders/delete"
import { useAuthStore } from "@/stores/auth"

export const useOrderStore = defineStore("order", () => {
    const authStore = useAuthStore()
    const orders = ref([])
    const orderDetails = ref([])
    const currentOrder = ref(null)
    const currentOrderDetails = ref([])

    // Tạo đơn hàng mới
    const createNewOrder = async (orderData) => {
        const token = authStore.accessToken
        try {
            const response = await createOrder(token, orderData)
            if (response.data.success) {
                return response
            }
            throw new Error(response.data.message || 'Tạo đơn hàng thất bại!')
        } catch (error) {
            console.error("Create order error:", error.message)
            throw error
        }
    }

    // Lấy tất cả đơn hàng (cho admin)
    const getAllOrdersStore = async () => {
        const token = authStore.accessToken
        try {
            const response = await getAllOrders(token)
            if (response.data.success) {
                orders.value = response.data.data || []
            }
            return response
        } catch (error) {
            console.error("Get all orders error:", error.message)
            throw error
        }
    }

    // Lấy đơn hàng theo userId (cho user)
    const getOrdersByUserIdStore = async (userId) => {
        const token = authStore.accessToken
        try {
            const response = await getOrdersByUserId(userId, token)
            if (response.data.success) {
                orders.value = response.data.data || []
            }
            return response
        } catch (error) {
            console.error("Get orders by user id error:", error.message)
            throw error
        }
    }

    // Lấy đơn hàng theo orderId
    const getOrderByIdStore = async (orderId) => {
        const token = authStore.accessToken
        try {
            const response = await getOrderById(orderId, token)
            if (response.data.success) {
                currentOrder.value = response.data.data
            }
            return response
        } catch (error) {
            console.error("Get order by id error:", error.message)
            throw error
        }
    }

    // Lấy chi tiết đơn hàng theo orderId
    const getOrderDetailsByOrderIdStore = async (orderId) => {
        const token = authStore.accessToken
        try {
            const response = await getOrderDetailsByOrderId(orderId, token)
            if (response.data.success) {
                currentOrderDetails.value = response.data.data || []
            }
            return response
        } catch (error) {
            console.error("Get order details by order id error:", error.message)
            throw error
        }
    }

    // Lấy chi tiết đơn hàng theo orderDetailId
    const getOrderDetailByIdStore = async (orderDetailId) => {
        const token = authStore.accessToken
        try {
            const response = await getOrderDetailById(orderDetailId, token)
            if (response.data.success) {
                return response
            }
            throw new Error(response.data.message || 'Lấy chi tiết đơn hàng thất bại!')
        } catch (error) {
            console.error("Get order detail by id error:", error.message)
            throw error
        }
    }

    // Cập nhật chi tiết đơn hàng
    const updateOrderDetailStore = async (orderDetailId, orderDetailData) => {
        const token = authStore.accessToken
        try {
            const response = await updateOrderDetail(orderDetailId, token, orderDetailData)
            if (response.data.success) {
                // Reload order details if needed
                if (currentOrder.value) {
                    await getOrderDetailsByOrderIdStore(currentOrder.value.order_id)
                }
            }
            return response
        } catch (error) {
            console.error("Update order detail error:", error.message)
            throw error
        }
    }

    // Xóa chi tiết đơn hàng
    const deleteOrderDetailStore = async (orderDetailId) => {
        const token = authStore.accessToken
        try {
            const response = await deleteOrderDetail(orderDetailId, token)
            if (response.data.success) {
                // Reload order details if needed
                if (currentOrder.value) {
                    await getOrderDetailsByOrderIdStore(currentOrder.value.order_id)
                }
            }
            return response
        } catch (error) {
            console.error("Delete order detail error:", error.message)
            throw error
        }
    }

    // Hủy đơn hàng (cập nhật status thành CANCELLED)
    const cancelOrderStore = async (orderId) => {
        const token = authStore.accessToken
        try {
            const response = await updateOrderStatus(orderId, token, 'CANCELLED')
            if (response.data.success) {
                // Reload orders list
                const userId = authStore.userId
                if (userId) {
                    await getOrdersByUserIdStore(userId)
                }
            }
            return response
        } catch (error) {
            console.error("Cancel order error:", error.message)
            throw error
        }
    }

    // Cập nhật trạng thái đơn hàng (cho admin)
    const updateOrderStatusStore = async (orderId, status) => {
        const token = authStore.accessToken
        try {
            const response = await updateOrderStatus(orderId, token, status)
            if (response.data.success) {
                // Reload orders list
                await getAllOrdersStore()
            }
            return response
        } catch (error) {
            console.error("Update order status error:", error.message)
            throw error
        }
    }

    // Cập nhật trạng thái giao hàng (cho admin)
    const updateOrderShippingStatusStore = async (orderId, shippingStatus) => {
        const token = authStore.accessToken
        try {
            console.log('🔄 Updating shipping status:', { orderId, shippingStatus })
            const response = await updateOrderShippingStatus(orderId, token, shippingStatus)
            console.log('📦 Response from backend:', response.data)
            if (response.data.success) {
                // Reload orders list
                await getAllOrdersStore()
                // Kiểm tra giá trị sau khi reload
                const updatedOrder = orders.value.find(o => o.order_id === orderId)
                if (updatedOrder) {
                    console.log('✅ Order after reload:', {
                        orderId: updatedOrder.order_id,
                        shipping_status: updatedOrder.shipping_status,
                        status: updatedOrder.status
                    })
                }
            }
            return response
        } catch (error) {
            console.error("Update order shipping status error:", error.message)
            throw error
        }
    }

    // Cập nhật thông tin giao hàng (shipping_name, shipping_address, shipping_phone)
    const updateOrderShippingInfoStore = async (orderId, shippingInfo) => {
        const token = authStore.accessToken
        try {
            const response = await updateOrderShippingInfo(orderId, token, shippingInfo)
            return response
        } catch (error) {
            console.error("Update order shipping info error:", error.message)
            throw error
        }
    }

    // Xóa đơn hàng
    const deleteOrderStore = async (orderId) => {
        const token = authStore.accessToken
        try {
            const response = await deleteOrder(orderId, token)
            // Kiểm tra response - có thể backend trả về success hoặc không có success field
            if (response.data?.success !== false) {
                // Reload orders list
                const userId = authStore.userId
                if (userId) {
                    await getOrdersByUserIdStore(userId)
                }
            }
            return response
        } catch (error) {
            console.error("Delete order error:", error.message)
            console.error("Error details:", error.response?.data || error)
            // Nếu API không tồn tại (404), throw error để fallback về cancelOrder
            if (error.response?.status === 404) {
                throw new Error('API xóa đơn hàng không tồn tại')
            }
            throw error
        }
    }

    // Helper function để xóa đơn hàng với fetch keepalive (dùng trong beforeunload)
    const deleteOrderWithKeepalive = (orderId) => {
        const token = authStore.accessToken
        if (!token || !orderId) {
            return Promise.reject(new Error('Missing token or orderId'))
        }
        
        const url = `/api/orders/${orderId}`
        return fetch(url, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            keepalive: true // Quan trọng: cho phép request tiếp tục sau khi page unload
        })
    }

    return {
        orders,
        orderDetails,
        currentOrder,
        currentOrderDetails,
        createNewOrder,
        getAllOrdersStore,
        getOrdersByUserIdStore,
        getOrderByIdStore,
        getOrderDetailsByOrderIdStore,
        getOrderDetailByIdStore,
        updateOrderDetailStore,
        deleteOrderDetailStore,
        cancelOrderStore,
        updateOrderStatusStore,
        updateOrderShippingStatusStore,
        updateOrderShippingInfoStore,
        deleteOrderStore,
        deleteOrderWithKeepalive,
    }
})

