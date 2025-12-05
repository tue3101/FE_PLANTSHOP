<template>
  <div class="p-8">
    <div class="flex items-center justify-between mb-4">
      <div class="flex-1 flex justify-center">
        <div class="relative w-[350px]">
          <SearchCommon
            v-model="searchQuery"
            mode="admin"
            placeholder="Nhập từ khóa tìm kiếm"
            :use-header-style="true"
            @search="handleSearch"
          />
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex justify-center items-center py-12">
      <div class="text-center">
        <div
          class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"
        ></div>
        <p class="mt-4 text-gray-600">Đang tải đơn hàng...</p>
      </div>
    </div>

    <!-- Error State -->
    <div
      v-else-if="errorMessage"
      class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4"
    >
      <div class="flex items-center justify-between">
        <span>{{ errorMessage }}</span>
        <button @click="resetError" class="text-red-700 hover:text-red-900 cursor-pointer">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>

    <!-- Data Display -->
    <div v-else class="overflow-x-auto">
      <h2 class="text-2xl font-bold mb-2">DANH SÁCH ĐƠN HÀNG</h2>
      <DataPager
        v-model="currentPage"
        :items="filteredOrders"
        :page-size="PAGE_SIZE"
        :show-filter="true"
        :show-status-filter="true"
        :show-shipping-status-filter="true"
        :shipping-status-option="shippingStatusOptions"
        :status-options="statusOptions"
        v-model:selected-status="statusFilter"
        v-model:selected-shipping-status="shippingStatusFilter"
        controls-class="mb-2"
      >
        <template #default="{ items }">
          <CommonTable
            :headers="[
              'MÃ ĐƠN',
              'TÊN KHÁCH HÀNG',
              'NGÀY ĐẶT',
              'ĐƠN HÀNG',
              'GIAO HÀNG',
              'GIAO DỊCH',
              'TỔNG CỘNG',
            ]"
            :keys="[
              'order_id',
              'customer',
              'orderDate',
              'status',
              'shipping_status',
              'payment_status',
              'final_total',
            ]"
            :data="items"
            row-key="order_id"
            title-class="font-bold text-2xl"
          >
            <template #cell-customer="{ item }">
              {{ getCustomerName(item) }}
            </template>
            <template #cell-note="{ item }">
              <span
                class="text-sm text-gray-600 max-w-xs truncate block"
                :title="getOrderNote(item)"
              >
                {{ getOrderNote(item) }}
              </span>
            </template>
            <template #cell-final_total="{ item }">
              <span class="font-semibold text-green-600">{{
                formatPrice(item.final_total || item.total)
              }}</span>
            </template>
            <template #cell-discount="{ item }">
              <span class="text-red-600">{{ formatPrice(item.discount || 0) }}</span>
            </template>
            <template #cell-orderDate="{ item }">
              {{ formatDate(item.created_at || item.order_date) }}
            </template>
            <template #cell-status="{ item }">
              <span
                :class="getStatusClass(item.status)"
                class="px-2 py-1 rounded text-sm font-medium"
              >
                {{ getStatusText(item.status) }}
              </span>
            </template>
            <template #cell-shipping_status="{ item }">
              <span
                :class="getShippingStatusClass(item.shipping_status)"
                class="px-2 py-1 rounded text-sm font-medium"
              >
                {{ getShippingStatusText(item.shipping_status) }}
              </span>
            </template>
            <template #cell-payment_status="{ item }">
              <span
                :class="getPaymentStatusClass(getPaymentStatus(item))"
                class="px-2 py-1 rounded text-sm font-medium"
              >
                {{ getPaymentStatusText(getPaymentStatus(item)) }}
              </span>
            </template>
            <template #actions="{ item }">
              <div class="flex items-center gap-3">
                <div
                  :class="[
                    '[&>div>button:not(:first-child):not(:nth-child(2))]:hidden',
                    (isOrderCompleted(item) ||
                      item.status === 'CANCELLED' ||
                      item.shipping_status === 'CANCELLED') &&
                      '[&>div>button:nth-child(2)]:hidden',
                  ]"
                >
                  <ButtonCommon
                    :selected-active="''"
                    :item="item"
                    @view="openViewDetail"
                    @update="openUpdateStatusModal"
                  />
                </div>
              </div>
            </template>
          </CommonTable>
        </template>
      </DataPager>
    </div>

    <!-- Order Detail Modal -->
    <DetailViewComponent
      :show="showViewModal"
      type="order"
      :data="selectedOrder"
      @close="closeViewModal"
    />

    <!-- Update Status Modal (Unified) -->
    <div
      v-if="showUpdateStatusModal"
      class="fixed inset-0 flex items-center justify-center z-50"
      @click.self="closeUpdateStatusModal"
    >
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div class="flex items-center justify-between p-6 border-b">
          <h2 class="text-2xl font-bold text-gray-800">Cập nhật trạng thái</h2>
          <button
            @click="closeUpdateStatusModal"
            class="text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
          >
            <X :size="24" />
          </button>
        </div>
        <div class="p-6">
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2"
              >Chọn loại trạng thái cần cập nhật:</label
            >
            <select
              v-model="statusType"
              @change="onStatusTypeChange"
              class="w-full border border-gray-400 rounded px-4 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option value="order">Trạng thái đơn hàng</option>
              <option value="shipping">Trạng thái giao hàng</option>
              <option value="payment">Trạng thái giao dịch</option>
            </select>
          </div>

          <!-- Order Status -->
          <template v-if="statusType === 'order'">
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2"
                >Trạng thái đơn hàng hiện tại:</label
              >
              <span
                :class="getStatusClass(selectedOrderForUpdate?.status)"
                class="px-3 py-1 rounded text-sm font-medium"
              >
                {{ getStatusText(selectedOrderForUpdate?.status) }}
              </span>
            </div>
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2"
                >Chọn trạng thái mới:</label
              >
              <select
                v-model="newStatus"
                class="w-full border border-gray-400 rounded px-4 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
              >
                <option value="PENDING_CONFIRMATION">Chờ xác nhận</option>
                <option value="CONFIRMED">Đã xác nhận</option>
                <option value="CANCELLED">Đã hủy</option>
              </select>
            </div>
          </template>

          <!-- Shipping Status -->
          <template v-else-if="statusType === 'shipping'">
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2"
                >Trạng thái giao hàng hiện tại:</label
              >
              <span
                :class="getShippingStatusClass(selectedOrderForUpdate?.shipping_status)"
                class="px-3 py-1 rounded text-sm font-medium"
              >
                {{ getShippingStatusText(selectedOrderForUpdate?.shipping_status) }}
              </span>
            </div>
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2"
                >Chọn trạng thái giao hàng mới:</label
              >
              <select
                v-model="newShippingStatus"
                class="w-full border border-gray-400 rounded px-4 py-2 focus:outline-none focus:ring-1 focus:ring-green-500 cursor-pointer"
              >
                <option value="PREPARING_ORDER">Đang chuẩn bị đơn</option>
                <option value="SHIPPING">Đang giao hàng</option>
                <option value="DELIVERED">Đã giao hàng</option>
                <option value="UNDELIVERED">Chưa được giao</option>
                <option value="CANCELLED">Giao thất bại</option>
              </select>
            </div>
          </template>

          <!-- Payment Status -->
          <template v-else-if="statusType === 'payment'">
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2"
                >Trạng thái giao dịch hiện tại:</label
              >
              <span
                :class="getPaymentStatusClass(getPaymentStatus(selectedOrderForUpdate))"
                class="px-3 py-1 rounded text-sm font-medium"
              >
                {{ getPaymentStatusText(getPaymentStatus(selectedOrderForUpdate)) }}
              </span>
            </div>
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2"
                >Chọn trạng thái giao dịch mới:</label
              >
              <select
                v-model="newPaymentStatus"
                class="w-full border border-gray-400 rounded px-4 py-2 focus:outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer"
              >
                <option value="PROCESSING">Đang xử lý</option>
                <option value="SUCCESS">Thành công</option>
                <option value="FAILED">Thất bại</option>
              </select>
            </div>
          </template>

          <div v-if="updateStatusError" class="mb-4 text-red-600 text-sm">
            {{ updateStatusError }}
          </div>
        </div>
        <div class="flex justify-end gap-3 p-6 border-t">
          <button
            @click="closeUpdateStatusModal"
            class="px-6 py-2 bg-gray-300 rounded hover:bg-gray-400 transition-colors cursor-pointer"
          >
            Hủy
          </button>
          <button
            @click="handleUpdateStatus"
            :disabled="isUpdatingStatus"
            class="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isUpdatingStatus ? "Đang cập nhật..." : "Cập nhật" }}
          </button>
        </div>
      </div>
    </div>

    <!-- Update Status Success Modal -->
    <DeleteModal
      :showModal="showUpdateStatusSuccessModal"
      mode="update-success"
      @close="handleUpdateStatusSuccessClose"
    />
  </div>
</template>

<script setup>
import CommonTable from "@/components/common/admin/CommonTable.vue"
import DataPager from "@/components/common/DataPager.vue"
import ButtonCommon from "@/components/common/admin/ButtonCommon.vue"
import SearchCommon from "@/components/common/SearchCommon.vue"
import DetailViewComponent from "@/components/common/admin/DetailViewComponent.vue"
import DeleteModal from "@/components/common/admin/DeleteModal.vue"
import { ref, computed, onMounted } from "vue"
import { useAsyncOperation } from "@/composables/useAsyncOperation"
import { useOrderStore } from "@/stores/orders"
import { usePaymentStore } from "@/stores/payments"
import { X } from "lucide-vue-next"
const PAGE_SIZE = 8
const currentPage = ref(1)
const searchQuery = ref("")
const statusFilter = ref("")
const shippingStatusFilter = ref("")
const { isLoading, errorMessage, executeAsync, resetError } = useAsyncOperation()

const orderStore = useOrderStore()
const paymentStore = usePaymentStore()

// Status options cho filter
const statusOptions = [
  { value: "PENDING_CONFIRMATION", label: "Chờ xác nhận" },
  { value: "CONFIRMED", label: "Đã xác nhận" },
  { value: "CANCELLED", label: "Đã hủy" },
]
const shippingStatusOptions = [
  { value: "NOT_DELIVERED", label: "Chưa giao" }, // Gộp UNDELIVERED, PREPARING_ORDER, SHIPPING
  { value: "DELIVERED", label: "Đã giao" },
  { value: "CANCELLED", label: "Giao thất bại" },
]

// Computed để filter orders (chỉ filter theo search query, status filter được xử lý bởi DataPager)
const filteredOrders = computed(() => {
  let orders = orderStore.orders || []

  // Filter theo search query
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim()
    orders = orders.filter((order) => {
      const orderId = String(order.order_id || "").toLowerCase()
      const customerName = getCustomerName(order).toLowerCase()
      const customerEmail = getCustomerEmail(order).toLowerCase()
      return (
        orderId.includes(query) || customerName.includes(query) || customerEmail.includes(query)
      )
    })
  }

  return orders
})

// Load orders and payments
const loadOrders = async () => {
  await executeAsync(
    async () => {
      await Promise.all([orderStore.getAllOrdersStore(), paymentStore.getAllPaymentsStore()])
    },
    {
      defaultErrorMessage: "Không thể tải danh sách đơn hàng!",
      onError: (error) => {
        errorMessage.value = error.response?.data?.message || error.message
      },
    }
  )
}

// Search handler
const handleSearch = () => {
  currentPage.value = 1 // Reset về trang đầu khi search
}

// Format functions
const formatPrice = (price) => {
  if (!price && price !== 0) return "0 ₫"
  const numPrice = typeof price === "string" ? parseFloat(price.replace(/[^\d.]/g, "")) : price
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(numPrice)
}

const formatDate = (dateString) => {
  if (!dateString) return ""
  const date = new Date(dateString)
  return date.toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })
}

const getStatusText = (status) => {
  const statusMap = {
    PENDING_CONFIRMATION: "Chờ xác nhận",
    CONFIRMED: "Đã xác nhận",
    SHIPPING: "Đang giao hàng",
    DELIVERED: "Đã giao hàng",
    CANCELLED: "Đã hủy",
  }
  return statusMap[status] || status
}
const getShippingStatusText = (shippingStatus) => {
  const statusMap = {
    PREPARING_ORDER: "Đang chuẩn bị đơn",
    SHIPPING: "Đang giao hàng",
    DELIVERED: "Đã giao hàng",
    UNDELIVERED: "Chưa được giao",
    CANCELLED: "Giao thất bại",
  }
  return statusMap[shippingStatus] || shippingStatus
}

const getStatusClass = (status) => {
  const classMap = {
    PENDING: "bg-yellow-100 text-yellow-800",
    PENDING_CONFIRMATION: "bg-yellow-100 text-yellow-800",
    CONFIRMED: "bg-blue-100 text-blue-800",
    PROCESSING: "bg-purple-100 text-purple-800",
    SHIPPING: "bg-indigo-100 text-indigo-800",
    DELIVERED: "bg-green-100 text-green-800",
    CANCELLED: "bg-red-100 text-red-800",
  }
  return classMap[status] || "bg-gray-100 text-gray-800"
}

const getShippingStatusClass = (shippingStatus) => {
  const classMap = {
    PREPARING_ORDER: "bg-orange-100 text-orange-800",
    SHIPPING: "bg-indigo-100 text-indigo-800",
    DELIVERED: "bg-green-100 text-green-800",
    UNDELIVERED: "bg-yellow-100 text-yellow-800",
    CANCELLED: "bg-red-100 text-red-800",
  }
  return classMap[shippingStatus] || "bg-gray-100 text-gray-800"
}

// Payment status helpers
const getPaymentStatus = (order) => {
  if (!order) return null
  // Tìm payment từ paymentStore
  const payment = paymentStore.payments?.find((p) => {
    const pOrderId = p.order_id || p.order?.order_id
    const oOrderId = order.order_id
    return pOrderId === oOrderId
  })
  return payment?.status || order.payment?.status || null
}

// Kiểm tra đơn hàng đã hoàn tất chưa
const isOrderCompleted = (order) => {
  if (!order) return false

  // Kiểm tra trạng thái đơn hàng: CONFIRMED
  const orderStatusConfirmed = order.status === "CONFIRMED"

  // Kiểm tra trạng thái giao hàng: DELIVERED
  const shippingStatusDelivered = order.shipping_status === "DELIVERED"

  // Kiểm tra trạng thái giao dịch: SUCCESS
  const paymentStatus = getPaymentStatus(order)
  const paymentStatusSuccess = paymentStatus === "SUCCESS"

  // Đơn hàng hoàn tất khi cả 3 điều kiện đều đúng
  return orderStatusConfirmed && shippingStatusDelivered && paymentStatusSuccess
}

const getPaymentStatusText = (status) => {
  if (!status) return "Chưa có"
  const statusMap = {
    PROCESSING: "Đang xử lý",
    SUCCESS: "Thành công",
    FAILED: "Thất bại",
  }
  return statusMap[status] || status
}

const getPaymentStatusClass = (status) => {
  if (!status) return "bg-gray-100 text-gray-800"
  const classMap = {
    PROCESSING: "bg-yellow-100 text-yellow-800",
    SUCCESS: "bg-green-100 text-green-800",
    FAILED: "bg-red-100 text-red-800",
  }
  return classMap[status] || "bg-gray-100 text-gray-800"
}

const getCustomerName = (order) => {
  if (order.user?.username) return order.user.username
  return "Không có tên"
}

const getCustomerEmail = (order) => {
  if (order.user?.email) return order.user.email
  return "Không có email"
}

// Lấy note từ order (có thể ở nhiều nơi)
const getOrderNote = (order) => {
  // Ưu tiên lấy từ order.note hoặc order.shipping_note
  if (order.note) return order.note
  if (order.shipping_note) return order.shipping_note

  // Nếu không có, thử lấy từ order_details (nếu đã load)
  if (order.order_details && order.order_details.length > 0) {
    const note = order.order_details[0]?.note
    if (note) return note
  }

  return "Không có"
}

// Tính phí vận chuyển dựa trên số lượng sản phẩm
const calculateShippingFee = (orderDetails) => {
  if (!orderDetails || orderDetails.length === 0) return 0

  // Tính tổng số lượng sản phẩm
  const totalQuantity = orderDetails.reduce((sum, detail) => {
    return sum + (detail.quantity || 0)
  }, 0)

  // Tính phí vận chuyển theo số lượng
  if (totalQuantity <= 5) {
    return 50000
  } else if (totalQuantity <= 10) {
    return 70000
  } else if (totalQuantity <= 15) {
    return 100000
  } else {
    return 100000
  }
}

// View Detail Modal
const showViewModal = ref(false)
const selectedOrder = ref(null)

const openViewDetail = async (order) => {
  try {
    // Load order details nếu chưa có
    let orderDetails = order.order_details
    if (!orderDetails || orderDetails.length === 0) {
      await orderStore.getOrderDetailsByOrderIdStore(order.order_id)
      orderDetails = orderStore.currentOrderDetails || []
    }

    // Tính tổng tạm tính từ order_details
    const subTotal = orderDetails.reduce((sum, detail) => {
      return (
        sum +
        (detail.sub_total || (detail.price_at_order || detail.price || 0) * (detail.quantity || 0))
      )
    }, 0)

    // Tính phí vận chuyển: ưu tiên từ DB, nếu không có thì tính lại
    let shippingFee = order.shipping_fee
    if (!shippingFee || shippingFee === 0) {
      shippingFee = calculateShippingFee(orderDetails)
    }

    // Lấy note từ nhiều nguồn có thể - sử dụng function getOrderNote để đảm bảo tính nhất quán
    // Tạo một object tạm với order_details để getOrderNote có thể lấy note từ order_details
    const orderWithDetails = {
      ...order,
      order_details: orderDetails,
    }
    const orderNote = getOrderNote(orderWithDetails)

    // Format order data for modal
    selectedOrder.value = {
      order_id: order.order_id,
      customer: order.shipping_name,
      email: getCustomerEmail(order),
      phone: order.shipping_phone,
      address: order.shipping_address,
      note: orderNote,
      total: order.total || subTotal,
      discount: order.discount || 0,
      discount_amount: order.discount_amount || 0,
      auto_discount_amount: order.auto_discount_amount || 0,
      total_discount_amount: order.total_discount_amount || 0,
      discount_code: order.discount_code || null,
      shipping_fee: shippingFee,
      final_total: order.final_total || order.total || 0,
      status: getStatusText(order.status),
      shipping_status: getShippingStatusText(order.shipping_status),
      created_at: formatDate(order.created_at || order.order_date),
      payment_method: order.payment?.method?.name || order.payment_method || "COD",
      order_details: orderDetails,
      deposit_required: order.deposit_required || false,
      deposit: order.deposit || null,
    }
    showViewModal.value = true
  } catch (error) {
    console.error("Error loading order details:", error)
    errorMessage.value = "Không thể tải chi tiết đơn hàng!"
  }
}

const closeViewModal = () => {
  showViewModal.value = false
  selectedOrder.value = null
}

// Update Status Modal (Unified)
const showUpdateStatusModal = ref(false)
const showUpdateStatusSuccessModal = ref(false)
const selectedOrderForUpdate = ref(null)
const statusType = ref("order") // 'order', 'shipping', 'payment'
const newStatus = ref("")
const newShippingStatus = ref("")
const newPaymentStatus = ref("")
const updateStatusError = ref("")
const isUpdatingStatus = ref(false)

const openUpdateStatusModal = (order) => {
  selectedOrderForUpdate.value = order
  statusType.value = "order" // Reset to order status by default
  newStatus.value = order.status
  newShippingStatus.value = order.shipping_status || ""

  // Get payment status
  const payment = paymentStore.payments?.find(
    (p) => p.order_id === order.order_id || p.order?.order_id === order.order_id
  )
  newPaymentStatus.value = payment?.status || order.payment?.status || "PROCESSING"

  updateStatusError.value = ""
  showUpdateStatusModal.value = true
}

const onStatusTypeChange = () => {
  // Reset error when changing status type
  updateStatusError.value = ""
}

const closeUpdateStatusModal = () => {
  showUpdateStatusModal.value = false
  selectedOrderForUpdate.value = null
  statusType.value = "order"
  newStatus.value = ""
  newShippingStatus.value = ""
  newPaymentStatus.value = ""
  updateStatusError.value = ""
}

const handleUpdateStatusSuccessClose = () => {
  showUpdateStatusSuccessModal.value = false
}

const handleUpdateStatus = async () => {
  if (!selectedOrderForUpdate.value) return

  isUpdatingStatus.value = true
  updateStatusError.value = ""

  try {
    if (statusType.value === "order") {
      if (!newStatus.value) {
        updateStatusError.value = "Vui lòng chọn trạng thái mới!"
        return
      }
      if (newStatus.value === selectedOrderForUpdate.value.status) {
        updateStatusError.value = "Trạng thái mới phải khác trạng thái hiện tại!"
        return
      }
      await orderStore.updateOrderStatusStore(
        selectedOrderForUpdate.value.order_id,
        newStatus.value
      )
    } else if (statusType.value === "shipping") {
      if (!newShippingStatus.value) {
        updateStatusError.value = "Vui lòng chọn trạng thái giao hàng mới!"
        return
      }
      if (newShippingStatus.value === selectedOrderForUpdate.value.shipping_status) {
        updateStatusError.value = "Trạng thái giao hàng mới phải khác trạng thái hiện tại!"
        return
      }
      // Log để debug
      console.log("🔄 Updating shipping status:", {
        orderId: selectedOrderForUpdate.value.order_id,
        newShippingStatus: newShippingStatus.value,
        currentShippingStatus: selectedOrderForUpdate.value.shipping_status,
      })

      const response = await orderStore.updateOrderShippingStatusStore(
        selectedOrderForUpdate.value.order_id,
        newShippingStatus.value
      )

      // Kiểm tra response từ backend
      if (response?.data?.data) {
        console.log("📦 Backend response data:", response.data.data)
        const updatedShippingStatus = response.data.data.shipping_status
        if (updatedShippingStatus !== newShippingStatus.value) {
          console.warn("⚠️ Backend đã thay đổi shipping_status:", {
            requested: newShippingStatus.value,
            received: updatedShippingStatus,
          })
        }
      }

      // Không tự động cập nhật order status khi cập nhật shipping status
      // Admin có thể cập nhật order status riêng nếu cần
    } else if (statusType.value === "payment") {
      if (!newPaymentStatus.value) {
        updateStatusError.value = "Vui lòng chọn trạng thái giao dịch mới!"
        return
      }
      // Find payment
      const orderId = selectedOrderForUpdate.value.order_id
      const payment = paymentStore.payments?.find((p) => {
        const pOrderId = p.order_id || p.order?.order_id
        return pOrderId === orderId
      })
      if (!payment) {
        updateStatusError.value = "Không tìm thấy giao dịch cho đơn hàng này!"
        return
      }
      const paymentId = payment.payment_id || payment.id
      if (!paymentId) {
        updateStatusError.value = "Không tìm thấy mã giao dịch!"
        return
      }
      const currentPaymentStatus = payment.status
      if (newPaymentStatus.value === currentPaymentStatus) {
        updateStatusError.value = "Trạng thái giao dịch mới phải khác trạng thái hiện tại!"
        return
      }
      await paymentStore.updatePaymentStatusStore(paymentId, newPaymentStatus.value)
    }

    closeUpdateStatusModal()
    await loadOrders() // Reload orders and payments
    showUpdateStatusSuccessModal.value = true
  } catch (error) {
    updateStatusError.value =
      error.response?.data?.message || error.message || "Không thể cập nhật trạng thái!"
  } finally {
    isUpdatingStatus.value = false
  }
}

onMounted(() => {
  loadOrders()
})
</script>
