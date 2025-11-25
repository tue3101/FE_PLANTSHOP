<template>
    <div class="p-8">
        <div class="flex items-center justify-between mb-4">
            <div class="flex-1 flex justify-center">
                <div class="relative w-[350px]">
                    <SearchCommon v-model="searchQuery" mode="admin" placeholder="Nhập từ khóa tìm kiếm"
                        :use-header-style="true" @search="handleSearch" />
                </div>
            </div>
        </div>

        <!-- Loading State -->
        <div v-if="isLoading" class="flex justify-center items-center py-12">
            <div class="text-center">
                <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                <p class="mt-4 text-gray-600">Đang tải đơn hàng...</p>
            </div>
        </div>

        <!-- Error State -->
        <div v-else-if="errorMessage" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <div class="flex items-center justify-between">
                <span>{{ errorMessage }}</span>
                <button @click="resetError" class="text-red-700 hover:text-red-900 cursor-pointer">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>

        <!-- Data Display -->
        <div v-else class="overflow-x-auto">
            <h2 class="text-2xl font-bold mb-2">DANH SÁCH ĐƠN HÀNG</h2>
            <DataPager v-model="currentPage" :items="filteredOrders" :page-size="PAGE_SIZE" :show-filter="true"
                :show-status-filter="true" :show-shipping-status-filter="true"
                :shipping-status-option="shippingStatusOptions" :status-options="statusOptions"
                v-model:selected-status="statusFilter" v-model:selected-shipping-status="shippingStatusFilter"
                controls-class="mb-2">
                <template #default="{ items }">
                    <CommonTable
                        :headers="['ID', 'TÊN KHÁCH HÀNG', 'NOTE', 'TỔNG CỘNG', 'NGÀY ĐẶT', 'TRẠNG THÁI ĐƠN', 'TRẠNG THÁI GIAO HÀNG']"
                        :keys="['order_id', 'customer', 'note', 'total', 'orderDate', 'status', 'shipping_status']"
                        :data="items" row-key="order_id" title-class="font-bold text-2xl">
                        <template #cell-customer="{ item }">
                            {{ getCustomerName(item) }}
                        </template>
                        <template #cell-note="{ item }">
                            <span class="text-sm text-gray-600 max-w-xs truncate block" :title="getOrderNote(item)">
                                {{ getOrderNote(item) }}
                            </span>
                        </template>
                        <template #cell-total="{ item }">
                            <span class="font-semibold text-green-600">{{ formatPrice(item.final_total || item.total)
                                }}</span>
                        </template>
                        <template #cell-discount="{ item }">
                            <span class="text-red-600">{{ formatPrice(item.discount || 0) }}</span>
                        </template>
                        <template #cell-orderDate="{ item }">
                            {{ formatDate(item.created_at || item.order_date) }}
                        </template>
                        <template #cell-status="{ item }">
                            <span :class="getStatusClass(item.status)" class="px-2 py-1 rounded text-sm font-medium">
                                {{ getStatusText(item.status) }}
                            </span>
                        </template>
                        <template #cell-shipping_status="{ item }">
                            <span :class="getShippingStatusClass(item.shipping_status)"
                                class="px-2 py-1 rounded text-sm font-medium">
                                {{ getShippingStatusText(item.shipping_status) }}
                            </span>
                        </template>
                        <template #actions="{ item }">
                            <div class="flex items-center gap-3">
                                <div :class="[
                                    '[&>div>button:not(:first-child):not(:nth-child(2))]:hidden',
                                    (item.status === 'DELIVERED' || item.status === 'CANCELLED') && '[&>div>button:nth-child(2)]:hidden'
                                ]">
                                    <ButtonCommon :selected-active="''" :item="item" @view="openViewDetail"
                                        @update="openUpdateStatusModal" />
                                </div>
                                <button v-if="item.status !== 'CANCELLED'"
                                    class="text-green-500 hover:text-green-700 hover:cursor-pointer"
                                    title="Cập nhật trạng thái giao hàng" @click="openUpdateShippingStatusModal(item)">
                                    <Truck :size="20" />
                                </button>
                            </div>
                        </template>
                    </CommonTable>
                </template>
            </DataPager>
        </div>

        <!-- Order Detail Modal -->
        <div v-if="showViewModal" class="fixed inset-0 flex items-center justify-center z-50  bg-opacity-50"
            @click.self="closeViewModal">
            <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <!-- Header -->
                <div class="flex  p-6 border-b bg-gray-50">
                    <div class="flex w-full">
                        <h2 class="text-2xl font-bold text-gray-800">Chi tiết đơn #{{ selectedOrder?.order_id }}</h2>
                    </div>
                    <button @click="closeViewModal"
                        class="text-gray-500 hover:text-gray-700 transition-colors cursor-pointer ml-4">
                        <X :size="24" />
                    </button>
                </div>

                <!-- Content -->
                <div class="p-6">
                    <div v-if="selectedOrder">
                        <!-- Customer Information -->
                        <div class="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                            <div>
                                <label class="text-sm font-semibold text-gray-600">Tên khách hàng:</label>
                                <p class="text-gray-900 font-medium">{{ selectedOrder.customer || 'Không có' }}</p>
                            </div>

                            <div>
                                <label class="text-sm font-semibold text-gray-600">Số điện thoại:</label>
                                <p class="text-gray-900">{{ selectedOrder.phone || 'Không có' }}</p>
                            </div>
                            <div>
                                <label class="text-sm font-semibold text-gray-600">Địa chỉ:</label>
                                <p class="text-gray-900">{{ selectedOrder.address || 'Không có' }}</p>
                            </div>

                            <div>
                                <label class="text-sm font-semibold text-gray-600">Ngày đặt:</label>
                                <p class="text-gray-900">{{ selectedOrder.created_at || 'Không có' }}</p>
                            </div>
                        </div>

                        <!-- Product Details Table -->
                        <div class="mb-4">
                            <div class="overflow-x-auto">
                                <table class="min-w-full border-collapse border border-gray-300">
                                    <thead>
                                        <tr class="bg-gray-100 text-left">
                                            <th
                                                class="border border-gray-300 px-4 py-3 text-sm font-semibold text-gray-700">
                                                Mã sản phẩm</th>
                                            <th
                                                class="border border-gray-300 px-4 py-3  text-sm font-semibold text-gray-700">
                                                Tên sản phẩm</th>
                                            <th
                                                class="border border-gray-300 px-4 py-3 text-center text-sm font-semibold text-gray-700">
                                                Số lượng</th>
                                            <th
                                                class="border border-gray-300 px-4 py-3 text-center text-sm font-semibold text-gray-700">
                                                Đơn giá</th>
                                            <th
                                                class="border border-gray-300 px-4 py-3 text-center text-sm font-semibold text-gray-700">
                                                Tạm tính</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr
                                            v-if="!selectedOrder.order_details || selectedOrder.order_details.length === 0">
                                            <td colspan="5"
                                                class="border border-gray-300 px-4 py-4 text-center text-gray-500">
                                                Không có sản phẩm nào
                                            </td>
                                        </tr>
                                        <tr v-for="(detail, index) in selectedOrder.order_details" :key="index"
                                            class="hover:bg-gray-50">
                                            <td class="border border-gray-300 px-4 py-3 text-sm text-gray-900">
                                                {{ detail.product_id || detail.product?.product_id || 'N/A' }}
                                            </td>
                                            <td class="border border-gray-300 px-4 py-3 text-sm text-gray-900">
                                                {{ detail.product_name || detail.product?.product_name || 'N/A' }}
                                            </td>
                                            <td
                                                class="border border-gray-300 px-4 py-3 text-sm text-gray-900 text-center">
                                                {{ detail.quantity || 0 }}
                                            </td>
                                            <td
                                                class="border border-gray-300 px-4 py-3 text-sm text-gray-900 text-center">
                                                {{ formatPrice(detail.price_at_order || detail.price || 0) }}
                                            </td>
                                            <td
                                                class="border border-gray-300 px-4 py-3 text-sm font-semibold text-gray-900 text-center">
                                                {{ formatPrice((detail.price_at_order || detail.price || 0) *
                                                    (detail.quantity
                                                        || 0)) }}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <!-- Order Summary -->
                        <div class="mt-4 p-4 bg-gray-50 rounded-lg">
                            <div class="flex justify-end">
                                <div class="w-full md:w-1/2 space-y-2">
                                    <div class="flex justify-between text-sm">
                                        <span class="text-gray-600">Tạm tính:</span>
                                        <span class="text-gray-900 font-medium">{{ formatPrice(selectedOrder.total || 0)
                                        }}</span>
                                    </div>
                                    <div v-if="selectedOrder.discount > 0" class="flex justify-between text-sm">
                                        <span class="text-gray-600">Giảm giá:</span>
                                        <span class="text-red-600 font-medium">-{{ formatPrice(selectedOrder.discount ||
                                            0)
                                        }}</span>
                                    </div>
                                    <div class="flex justify-between text-sm">
                                        <span class="text-gray-600">Phí vận chuyển:</span>
                                        <span class="text-gray-900 font-medium">{{
                                            formatPrice(selectedOrder.shipping_fee || 0)
                                        }}</span>
                                    </div>
                                    <div
                                        class="flex justify-between text-lg font-bold border-t border-gray-300 pt-2 mt-2">
                                        <span class="text-gray-800">Tổng cộng:</span>
                                        <span class="text-green-600">{{ formatPrice(selectedOrder.final_total || 0)
                                        }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div v-else class="text-center text-gray-500 py-8">
                        Không có dữ liệu để hiển thị
                    </div>
                </div>

                <!-- Footer -->
                <div class="flex justify-end p-6 border-t bg-gray-50">
                    <button @click="closeViewModal"
                        class="px-6 py-2 bg-gray-300 rounded hover:bg-gray-400 transition-colors cursor-pointer">
                        Đóng
                    </button>
                </div>
            </div>
        </div>

        <!-- Update Status Modal -->
        <div v-if="showUpdateStatusModal" class="fixed inset-0  flex items-center justify-center z-50"
            @click.self="closeUpdateStatusModal">
            <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
                <div class="flex items-center justify-between p-6 border-b">
                    <h2 class="text-2xl font-bold text-gray-800">Cập nhật trạng thái đơn hàng</h2>
                    <button @click="closeUpdateStatusModal"
                        class="text-gray-500 hover:text-gray-700 transition-colors cursor-pointer">
                        <X :size="24" />
                    </button>
                </div>
                <div class="p-6">
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700 mb-2">Trạng thái hiện tại:</label>
                        <span :class="getStatusClass(selectedOrderForUpdate?.status)"
                            class="px-3 py-1 rounded text-sm font-medium">
                            {{ getStatusText(selectedOrderForUpdate?.status) }}
                        </span>
                    </div>
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700 mb-2">Chọn trạng thái mới:</label>
                        <select v-model="newStatus"
                            class="w-full border border-gray-400 rounded px-4 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer">
                            <option value="PENDING_CONFIRMATION">Chờ xác nhận</option>
                            <option value="CONFIRMED">Đã xác nhận</option>
                            <option value="CANCELLED">Đã hủy</option>
                        </select>
                    </div>
                    <div v-if="updateStatusError" class="mb-4 text-red-600 text-sm">
                        {{ updateStatusError }}
                    </div>
                </div>
                <div class="flex justify-end gap-3 p-6 border-t">
                    <button @click="closeUpdateStatusModal"
                        class="px-6 py-2 bg-gray-300 rounded hover:bg-gray-400 transition-colors cursor-pointer">
                        Hủy
                    </button>
                    <button @click="handleUpdateStatus" :disabled="isUpdatingStatus"
                        class="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                        {{ isUpdatingStatus ? 'Đang cập nhật...' : 'Cập nhật' }}
                    </button>
                </div>
            </div>
        </div>

        <!-- Update Shipping Status Modal -->
        <div v-if="showUpdateShippingStatusModal" class="fixed inset-0 flex items-center justify-center z-50"
            @click.self="closeUpdateShippingStatusModal">
            <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
                <div class="flex items-center justify-between p-6 border-b">
                    <h2 class="text-2xl font-bold text-gray-800">Cập nhật trạng thái giao hàng</h2>
                    <button @click="closeUpdateShippingStatusModal"
                        class="text-gray-500 hover:text-gray-700 transition-colors cursor-pointer">
                        <X :size="24" />
                    </button>
                </div>
                <div class="p-6">
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700 mb-2">Trạng thái giao hàng hiện
                            tại:</label>
                        <span :class="getShippingStatusClass(selectedOrderForShippingUpdate?.shipping_status)"
                            class="px-3 py-1 rounded text-sm font-medium">
                            {{ getShippingStatusText(selectedOrderForShippingUpdate?.shipping_status) }}
                        </span>
                    </div>
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700 mb-2">Chọn trạng thái giao hàng
                            mới:</label>
                        <select v-model="newShippingStatus"
                            class="w-full border border-gray-400 rounded px-4 py-2 focus:outline-none focus:ring-1 focus:ring-green-500 cursor-pointer">
                            <option value="PREPARING_ORDER">Đang chuẩn bị đơn</option>
                            <option value="SHIPPING">Đang giao hàng</option>
                            <option value="DELIVERED">Đã giao hàng</option>
                            <option value="UNDELIVERED">Chưa được giao</option>
                            <option value="CANCELLED">Đã hủy</option>
                        </select>
                    </div>
                    <div v-if="updateShippingStatusError" class="mb-4 text-red-600 text-sm">
                        {{ updateShippingStatusError }}
                    </div>
                </div>
                <div class="flex justify-end gap-3 p-6 border-t">
                    <button @click="closeUpdateShippingStatusModal"
                        class="px-6 py-2 bg-gray-300 rounded hover:bg-gray-400 transition-colors cursor-pointer">
                        Hủy
                    </button>
                    <button @click="handleUpdateShippingStatus" :disabled="isUpdatingShippingStatus"
                        class="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                        {{ isUpdatingShippingStatus ? 'Đang cập nhật...' : 'Cập nhật' }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import CommonTable from '@/components/common/admin/CommonTable.vue'
import DataPager from '@/components/common/DataPager.vue'
import ButtonCommon from '@/components/common/admin/ButtonCommon.vue'
import SearchCommon from '@/components/common/SearchCommon.vue'
import { ref, computed, onMounted } from 'vue'
import { useAsyncOperation } from '@/composables/useAsyncOperation'
import { useOrderStore } from '@/stores/orders'
import { X, Truck } from 'lucide-vue-next'
const PAGE_SIZE = 8
const currentPage = ref(1)
const searchQuery = ref('')
const statusFilter = ref('')
const shippingStatusFilter = ref('')
const { isLoading, errorMessage, executeAsync, resetError } = useAsyncOperation()

const orderStore = useOrderStore()

// Status options cho filter
const statusOptions = [
    { value: 'PENDING_CONFIRMATION', label: 'Chờ xác nhận' },
    { value: 'CONFIRMED', label: 'Đã xác nhận' },
    { value: 'CANCELLED', label: 'Đã hủy' }
]
const shippingStatusOptions = [
    { value: 'NOT_DELIVERED', label: 'Chưa giao' }, // Gộp UNDELIVERED, PREPARING_ORDER, SHIPPING
    { value: 'DELIVERED', label: 'Đã giao' },
    { value: 'CANCELLED', label: 'Giao thất bại' }
]

// Computed để filter orders (chỉ filter theo search query, status filter được xử lý bởi DataPager)
const filteredOrders = computed(() => {
    let orders = orderStore.orders || []

    // Filter theo search query
    if (searchQuery.value.trim()) {
        const query = searchQuery.value.toLowerCase().trim()
        orders = orders.filter(order => {
            const orderId = String(order.order_id || '').toLowerCase()
            const customerName = getCustomerName(order).toLowerCase()
            const customerEmail = getCustomerEmail(order).toLowerCase()
            return orderId.includes(query) || customerName.includes(query) || customerEmail.includes(query)
        })
    }

    return orders
})




// Load orders
const loadOrders = async () => {
    await executeAsync(async () => {
        await orderStore.getAllOrdersStore()
    }, {
        defaultErrorMessage: 'Không thể tải danh sách đơn hàng!',
        onError: (error) => {
            errorMessage.value = error.response?.data?.message || error.message
        }
    })
}

// Search handler
const handleSearch = () => {
    currentPage.value = 1 // Reset về trang đầu khi search
}

// Format functions
const formatPrice = (price) => {
    if (!price && price !== 0) return '0 ₫'
    const numPrice = typeof price === 'string' ? parseFloat(price.replace(/[^\d.]/g, '')) : price
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(numPrice)
}

const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    })
}

const getStatusText = (status) => {
    const statusMap = {
        'PENDING_CONFIRMATION': 'Chờ xác nhận',
        'CONFIRMED': 'Đã xác nhận',
        'SHIPPING': 'Đang giao hàng',
        'DELIVERED': 'Đã giao hàng',
        'CANCELLED': 'Đã hủy'
    }
    return statusMap[status] || status
}
const getShippingStatusText = (shippingStatus) => {
    const statusMap = {
        'PREPARING_ORDER': 'Đang chuẩn bị đơn',
        'SHIPPING': 'Đang giao hàng',
        'DELIVERED': 'Đã giao hàng',
        'UNDELIVERED': 'Chưa được giao',
        'CANCELLED': 'Đã hủy'
    }
    return statusMap[shippingStatus] || shippingStatus
}

const getStatusClass = (status) => {
    const classMap = {
        'PENDING': 'bg-yellow-100 text-yellow-800',
        'PENDING_CONFIRMATION': 'bg-yellow-100 text-yellow-800',
        'CONFIRMED': 'bg-blue-100 text-blue-800',
        'PROCESSING': 'bg-purple-100 text-purple-800',
        'SHIPPING': 'bg-indigo-100 text-indigo-800',
        'DELIVERED': 'bg-green-100 text-green-800',
        'CANCELLED': 'bg-red-100 text-red-800'
    }
    return classMap[status] || 'bg-gray-100 text-gray-800'
}

const getShippingStatusClass = (shippingStatus) => {
    const classMap = {
        'PREPARING_ORDER': 'bg-orange-100 text-orange-800',
        'SHIPPING': 'bg-indigo-100 text-indigo-800',
        'DELIVERED': 'bg-green-100 text-green-800',
        'UNDELIVERED': 'bg-yellow-100 text-yellow-800',
        'CANCELLED': 'bg-red-100 text-red-800'
    }
    return classMap[shippingStatus] || 'bg-gray-100 text-gray-800'
}


const getCustomerName = (order) => {
    if (order.user?.username) return order.user.username
    return 'Không có tên'
}

const getCustomerEmail = (order) => {
    if (order.user?.email) return order.user.email
    return 'Không có email'
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

    return 'Không có'
}

// Tính phí vận chuyển dựa trên số lượng sản phẩm
const calculateShippingFee = (orderDetails, subTotal = 0) => {
    if (!orderDetails || orderDetails.length === 0) return 0

    // Tính tổng số lượng sản phẩm
    const totalQuantity = orderDetails.reduce((sum, detail) => {
        return sum + (detail.quantity || 0)
    }, 0)

    // Kiểm tra điều kiện freeship: >= 15 sản phẩm và tổng >= 4,000,000
    if (totalQuantity >= 15 && subTotal >= 4000000) {
        return 0
    }

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
            return sum + (detail.sub_total || (detail.price_at_order || detail.price || 0) * (detail.quantity || 0))
        }, 0)

        // Tính phí vận chuyển: ưu tiên từ DB, nếu không có thì tính lại
        let shippingFee = order.shipping_fee
        if (!shippingFee || shippingFee === 0) {
            shippingFee = calculateShippingFee(orderDetails, subTotal)
        }

        // Lấy note từ nhiều nguồn có thể
        // Note có thể nằm ở: order.note, orderDetails[0]?.note, hoặc order.shipping_note
        let orderNote = order.note
        if (!orderNote && orderDetails && orderDetails.length > 0) {
            // Lấy note từ order_detail đầu tiên (tất cả items đều có cùng note)
            orderNote = orderDetails[0]?.note || ''
        }

        // Format order data for modal
        selectedOrder.value = {
            order_id: order.order_id,
            customer: order.shipping_name,
            email: getCustomerEmail(order),
            phone: order.shipping_phone,
            address: order.shipping_address ,
            note: orderNote || 'Không có',
            total: order.total || subTotal,
            discount: order.discount || 0,
            shipping_fee: shippingFee,
            final_total: order.final_total || order.total || 0,
            status: getStatusText(order.status),
            shipping_status: getShippingStatusText(order.shipping_status),
            created_at: formatDate(order.created_at || order.order_date),
            payment_method: order.payment?.method?.name || order.payment_method || 'COD',
            order_details: orderDetails 
        }
        showViewModal.value = true
    } catch (error) {
        console.error('Error loading order details:', error)
        errorMessage.value = 'Không thể tải chi tiết đơn hàng!'
    }
}

const closeViewModal = () => {
    showViewModal.value = false
    selectedOrder.value = null
}

// Update Status Modal
const showUpdateStatusModal = ref(false)
const selectedOrderForUpdate = ref(null)
const newStatus = ref('')
const updateStatusError = ref('')
const isUpdatingStatus = ref(false)

const openUpdateStatusModal = (order) => {
    selectedOrderForUpdate.value = order
    newStatus.value = order.status
    updateStatusError.value = ''
    showUpdateStatusModal.value = true
}

const closeUpdateStatusModal = () => {
    showUpdateStatusModal.value = false
    selectedOrderForUpdate.value = null
    newStatus.value = ''
    updateStatusError.value = ''
}

const handleUpdateStatus = async () => {
    if (!selectedOrderForUpdate.value || !newStatus.value) return

    if (newStatus.value === selectedOrderForUpdate.value.status) {
        updateStatusError.value = 'Trạng thái mới phải khác trạng thái hiện tại!'
        return
    }

    isUpdatingStatus.value = true
    updateStatusError.value = ''

    try {
        await orderStore.updateOrderStatusStore(selectedOrderForUpdate.value.order_id, newStatus.value)
        closeUpdateStatusModal()
        await loadOrders() // Reload orders
    } catch (error) {
        updateStatusError.value = error.response?.data?.message || error.message || 'Không thể cập nhật trạng thái!'
    } finally {
        isUpdatingStatus.value = false
    }
}

// Update Shipping Status Modal
const showUpdateShippingStatusModal = ref(false)
const selectedOrderForShippingUpdate = ref(null)
const newShippingStatus = ref('')
const updateShippingStatusError = ref('')
const isUpdatingShippingStatus = ref(false)

const openUpdateShippingStatusModal = (order) => {
    selectedOrderForShippingUpdate.value = order
    newShippingStatus.value = order.shipping_status || ''
    updateShippingStatusError.value = ''
    showUpdateShippingStatusModal.value = true
}

const closeUpdateShippingStatusModal = () => {
    showUpdateShippingStatusModal.value = false
    selectedOrderForShippingUpdate.value = null
    newShippingStatus.value = ''
    updateShippingStatusError.value = ''
}

const handleUpdateShippingStatus = async () => {
    if (!selectedOrderForShippingUpdate.value || !newShippingStatus.value) return

    if (newShippingStatus.value === selectedOrderForShippingUpdate.value.shipping_status) {
        updateShippingStatusError.value = 'Trạng thái giao hàng mới phải khác trạng thái hiện tại!'
        return
    }

    isUpdatingShippingStatus.value = true
    updateShippingStatusError.value = ''

    try {
        const shouldCancelOrder = newShippingStatus.value === 'CANCELLED' && selectedOrderForShippingUpdate.value.status !== 'CANCELLED'

        await orderStore.updateOrderShippingStatusStore(selectedOrderForShippingUpdate.value.order_id, newShippingStatus.value)

        if (shouldCancelOrder) {
            await orderStore.updateOrderStatusStore(selectedOrderForShippingUpdate.value.order_id, 'CANCELLED')
        }

        closeUpdateShippingStatusModal()
        await loadOrders() // Reload orders
    } catch (error) {
        updateShippingStatusError.value = error.response?.data?.message || error.message || 'Không thể cập nhật trạng thái giao hàng!'
    } finally {
        isUpdatingShippingStatus.value = false
    }
}

onMounted(() => {
    loadOrders()
})
</script>
