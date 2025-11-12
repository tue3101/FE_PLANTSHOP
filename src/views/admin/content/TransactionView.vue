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
                <p class="mt-4 text-gray-600">Đang tải giao dịch...</p>
            </div>
        </div>

        <!-- Error State -->
        <div v-else-if="errorMessage" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <div class="flex items-center justify-between">
                <span>{{ errorMessage }}</span>
                <button @click="resetError" class="text-red-700 hover:text-red-900 cursor-pointer">
                    <X :size="20" />
                </button>
            </div>
        </div>

        <!-- Data Display -->
        <div v-else class="overflow-x-auto">
            <h2 class="text-2xl font-bold mb-2">DANH SÁCH GIAO DỊCH</h2>
            <DataPager v-model="currentPage" :items="filteredTransactions" :page-size="PAGE_SIZE" :show-filter="true"
                :show-status-filter="true" :status-options="statusOptions" v-model:selected-status="statusFilter"
                controls-class="mb-2">
                <template #default="{ items }">
                    <CommonTable :headers="['ID', 'MÃ ĐƠN HÀNG', 'PHƯƠNG THỨC', 'SỐ TIỀN', 'TRẠNG THÁI', 'NGÀY TẠO']"
                        :keys="['payment_id', 'order_id', 'method', 'amount', 'status', 'payment_date']" :data="items"
                        row-key="payment_id" title-class="font-bold text-2xl">
                        <template #cell-order_id="{ item }">
                            #{{ item.order_id || item.order?.order_id || 'N/A' }}
                        </template>
                        <template #cell-method="{ item }">
                            {{ getPaymentMethodName(item) }}
                        </template>
                        <template #cell-amount="{ item }">
                            <span class="font-semibold text-green-600">{{ formatPrice(item.amount) }}</span>
                        </template>
                        <template #cell-status="{ item }">
                            <span :class="getStatusClass(item.status)" class="px-2 py-1 rounded text-sm font-medium">
                                {{ getStatusText(item.status) }}
                            </span>
                        </template>
                        <template #cell-payment_date="{ item }">
                            {{ formatDate(item.payment_date || item.created_at || item.createdAt) }}
                        </template>
                        <template #actions="{ item }">
                            <div class="flex items-center gap-3">
                                <div :class="[
                                    '[&>div>button:not(:first-child):not(:nth-child(2))]:hidden'
                                ]">
                                    <ButtonCommon :selected-active="''" :item="item" @view="openViewDetail"
                                        @update="openUpdateStatusModal" />
                                </div>
                            </div>
                        </template>
                    </CommonTable>
                </template>
            </DataPager>
        </div>

        <!-- View Detail Modal -->
        <ViewDetailModal :showModal="showViewModal" :title="'Chi tiết Giao Dịch'" :item="selectedTransaction"
            :fields="transactionFields" :options="{}" @close="closeViewModal"
            @update:showModal="showViewModal = $event" />

        <!-- Update Status Modal -->
        <div v-if="showUpdateStatusModal" class="fixed inset-0 flex items-center justify-center z-50"
            @click.self="closeUpdateStatusModal">
            <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
                <div class="flex items-center justify-between p-6 border-b">
                    <h2 class="text-2xl font-bold text-gray-800">Cập nhật trạng thái giao dịch</h2>
                    <button @click="closeUpdateStatusModal"
                        class="text-gray-500 hover:text-gray-700 transition-colors cursor-pointer">
                        <X :size="24" />
                    </button>
                </div>
                <div class="p-6">
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700 mb-2">Trạng thái hiện tại:</label>
                        <span :class="getStatusClass(selectedTransactionForUpdate?.status)"
                            class="px-3 py-1 rounded text-sm font-medium">
                            {{ getStatusText(selectedTransactionForUpdate?.status) }}
                        </span>
                    </div>
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700 mb-2">Chọn trạng thái mới:</label>
                        <select v-model="newStatus"
                            class="w-full border border-gray-400 rounded px-4 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer">
                            <option value="PROCESSING">Đang xử lý</option>
                            <option value="SUCCESS">Thành công</option>
                            <option value="FAILED">Thất bại</option>
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
import { usePaymentStore } from '@/stores/payments'
import { X } from 'lucide-vue-next'

const PAGE_SIZE = 8
const currentPage = ref(1)
const searchQuery = ref('')
const statusFilter = ref('')
const { isLoading, errorMessage, executeAsync, resetError } = useAsyncOperation()

const paymentStore = usePaymentStore()

// Status options cho filter
const statusOptions = [
    { value: 'PROCESSING', label: 'Đang xử lý' },
    { value: 'SUCCESS', label: 'Thành công' },
    { value: 'FAILED', label: 'Thất bại' }
]

// Computed để filter transactions
const filteredTransactions = computed(() => {
    let transactions = paymentStore.payments || []

    // Filter theo search query
    if (searchQuery.value.trim()) {
        const query = searchQuery.value.toLowerCase().trim()
        transactions = transactions.filter(transaction => {
            const paymentId = String(transaction.payment_id || '').toLowerCase()
            const orderId = String(transaction.order_id || transaction.order?.order_id || '').toLowerCase()
            return paymentId.includes(query) || orderId.includes(query)
        })
    }

    return transactions
})

// Load transactions
const loadTransactions = async () => {
    await executeAsync(async () => {
        await paymentStore.getAllPaymentsStore()
    }, {
        defaultErrorMessage: 'Không thể tải danh sách giao dịch!',
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
        'PROCESSING': 'Đang xử lý',
        'SUCCESS': 'Thành công',
        'FAILED': 'Thất bại'
    }
    return statusMap[status] || status
}

const getStatusClass = (status) => {
    const classMap = {
        'PROCESSING': 'bg-yellow-100 text-yellow-800',
        'SUCCESS': 'bg-green-100 text-green-800',
        'FAILED': 'bg-red-100 text-red-800'
    }
    return classMap[status] || 'bg-gray-100 text-gray-800'
}

const getPaymentMethodName = (transaction) => {
    if (transaction.method?.name) return transaction.method.name
    if (transaction.payment_method?.name) return transaction.payment_method.name
    if (transaction.method_name) return transaction.method_name
    return 'COD'
}

// View Detail Modal
const showViewModal = ref(false)
const selectedTransaction = ref(null)

const transactionFields = [
    { key: 'payment_id', label: 'Mã giao dịch', type: 'text' },
    { key: 'order_id', label: 'Mã đơn hàng', type: 'text' },
    { key: 'method', label: 'Phương thức thanh toán', type: 'text' },
    { key: 'amount', label: 'Số tiền', type: 'price', format: 'price' },
    { key: 'status', label: 'Trạng thái', type: 'text' },
    { key: 'payment_date', label: 'Ngày tạo', type: 'text' }
]

const openViewDetail = async (transaction) => {
    try {
        // Format transaction data for modal
        selectedTransaction.value = {
            payment_id: transaction.payment_id,
            order_id: transaction.order_id || transaction.order?.order_id || 'N/A',
            method: getPaymentMethodName(transaction),
            amount: formatPrice(transaction.amount),
            status: getStatusText(transaction.status),
            payment_date: formatDate(transaction.payment_date)
        }
        showViewModal.value = true
    } catch (error) {
        console.error('Error loading transaction details:', error)
        errorMessage.value = 'Không thể tải chi tiết giao dịch!'
    }
}

const closeViewModal = () => {
    showViewModal.value = false
    selectedTransaction.value = null
}

// Update Status Modal
const showUpdateStatusModal = ref(false)
const selectedTransactionForUpdate = ref(null)
const newStatus = ref('')
const updateStatusError = ref('')
const isUpdatingStatus = ref(false)

const openUpdateStatusModal = (transaction) => {
    selectedTransactionForUpdate.value = transaction
    newStatus.value = transaction.status
    updateStatusError.value = ''
    showUpdateStatusModal.value = true
}

const closeUpdateStatusModal = () => {
    showUpdateStatusModal.value = false
    selectedTransactionForUpdate.value = null
    newStatus.value = ''
    updateStatusError.value = ''
}

const handleUpdateStatus = async () => {
    if (!selectedTransactionForUpdate.value || !newStatus.value) return

    if (newStatus.value === selectedTransactionForUpdate.value.status) {
        updateStatusError.value = 'Trạng thái mới phải khác trạng thái hiện tại!'
        return
    }

    isUpdatingStatus.value = true
    updateStatusError.value = ''

    try {
        const paymentId = selectedTransactionForUpdate.value.payment_id || selectedTransactionForUpdate.value.id
        await paymentStore.updatePaymentStatusStore(paymentId, newStatus.value)
        closeUpdateStatusModal()
        await loadTransactions() // Reload transactions
    } catch (error) {
        updateStatusError.value = error.response?.data?.message || error.message || 'Không thể cập nhật trạng thái!'
    } finally {
        isUpdatingStatus.value = false
    }
}

onMounted(() => {
    loadTransactions()
})
</script>
