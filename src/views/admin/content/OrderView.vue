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
                :show-status-filter="true" :status-options="statusOptions" v-model:selected-status="statusFilter"
                controls-class="mb-2">
                <template #default="{ items }">
                    <CommonTable
                        :headers="['ID', 'NGƯỜI ĐẶT', 'EMAIL', 'TỔNG CỘNG', 'GIẢM GIÁ', 'NGÀY ĐẶT', 'TRẠNG THÁI ĐƠN', 'TRẠNG THÁI GIAO HÀNG']"
                        :keys="['order_id', 'customer', 'email', 'total', 'discount', 'orderDate', 'status', 'shipping_status']"
                        :data="items" row-key="order_id" title-class="font-bold text-2xl">
                        <template #cell-customer="{ item }">
                            {{ getCustomerName(item) }}
                        </template>
                        <template #cell-email="{ item }">
                            {{ getCustomerEmail(item) }}
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

        <!-- View Detail Modal -->
        <ViewDetailModal :showModal="showViewModal" :title="'Chi tiết Đơn Hàng'" :item="selectedOrder"
            :fields="orderFields" :options="{}" @close="closeViewModal" @update:showModal="showViewModal = $event" />

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
import ViewDetailModal from '@/components/common/admin/ViewDetailModal.vue'
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
const { isLoading, errorMessage, executeAsync, resetError } = useAsyncOperation()

const orderStore = useOrderStore()

// Status options cho filter
const statusOptions = [
    { value: 'PENDING_CONFIRMATION', label: 'Chờ xác nhận' },
    { value: 'CONFIRMED', label: 'Đã xác nhận' },
    { value: 'CANCELLED', label: 'Đã hủy' }
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

// View Detail Modal
const showViewModal = ref(false)
const selectedOrder = ref(null)

const orderFields = [
    { key: 'order_id', label: 'Mã đơn hàng', type: 'text' },
    { key: 'customer', label: 'Khách hàng', type: 'text' },
    { key: 'email', label: 'Email', type: 'text' },
    { key: 'phone', label: 'Số điện thoại', type: 'text' },
    { key: 'address', label: 'Địa chỉ', type: 'text' },
    { key: 'total', label: 'Tổng tiền', type: 'price', format: 'price' },
    { key: 'discount', label: 'Giảm giá', type: 'price', format: 'price' },
    { key: 'final_total', label: 'Thành tiền', type: 'price', format: 'price' },
    { key: 'status', label: 'Trạng thái đơn hàng', type: 'text' },
    { key: 'shipping_status', label: 'Trạng thái giao hàng', type: 'text' },
    { key: 'created_at', label: 'Ngày đặt', type: 'text' },
    { key: 'payment_method', label: 'Phương thức thanh toán', type: 'text' }
]

const openViewDetail = async (order) => {
    try {
        // Load order details nếu chưa có
        if (!order.order_details) {
            await orderStore.getOrderDetailsByOrderIdStore(order.order_id)
            order.order_details = orderStore.currentOrderDetails
        }

        // Format order data for modal
        selectedOrder.value = {
            order_id: order.order_id,
            customer: getCustomerName(order),
            email: getCustomerEmail(order),
            phone: order.user?.phone_number || order.phone || 'Không có',
            address: order.shipping_address || order.address || 'Không có',
            total: order.total || 0,
            discount: order.discount || 0,
            shipping_fee: order.shipping_fee || 0,
            final_total: order.final_total || order.total || 0,
            status: getStatusText(order.status),
            shipping_status: getShippingStatusText(order.shipping_status),
            created_at: formatDate(order.created_at || order.order_date),
            payment_method: order.payment?.method?.name || order.payment_method || 'COD'
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
        await orderStore.updateOrderShippingStatusStore(selectedOrderForShippingUpdate.value.order_id, newShippingStatus.value)
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
