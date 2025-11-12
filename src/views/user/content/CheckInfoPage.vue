<template>
    <div class="min-h-screen bg-gray-50 py-8">
        <div class="container mx-auto px-4 max-w-2xl">
            <h1 class="text-3xl font-bold text-green-700 mb-6 text-center">Kiểm tra thông tin giao hàng</h1>

            <!-- Confirm Leave Modal -->
            <ConfirmLeaveModal :show="showConfirmModal"  @confirm="handleConfirmLeave" @cancel="handleCancelLeave" />

            <div class="bg-white rounded-lg shadow p-6">
                <form @submit.prevent="handleSubmit" class="space-y-6">
                    <!-- Username -->
                    <div>
                        <label for="username" class="block text-gray-700 font-semibold mb-2">
                            Tên người dùng <span class="text-red-500">*</span>
                        </label>
                        <input v-model="formData.username" type="text" id="username" required
                            placeholder="Nhập tên người dùng"
                            class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" />
                    </div>

                    <!-- Phone Number -->
                    <div>
                        <label for="phone_number" class="block text-gray-700 font-semibold mb-2">
                            Số điện thoại <span class="text-red-500">*</span>
                        </label>
                        <input v-model="formData.phone_number" type="tel" id="phone_number" required
                            placeholder="Nhập số điện thoại"
                            class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" />
                    </div>

                    <!-- Address -->
                    <div>
                        <label for="address" class="block text-gray-700 font-semibold mb-2">
                            Địa chỉ <span class="text-red-500">*</span>
                        </label>
                        <textarea v-model="formData.address" id="address" required rows="3"
                            placeholder="Nhập địa chỉ giao hàng"
                            class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"></textarea>
                    </div>

                    <!-- Note -->
                    <div>
                        <label for="note" class="block text-gray-700 font-semibold mb-2">
                            Ghi chú đơn hàng
                        </label>
                        <textarea v-model="formData.note" id="note" rows="3"
                            placeholder="Nhập ghi chú cho đơn hàng (nếu có)"
                            class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"></textarea>
                    </div>

                    <!-- Error Message -->
                    <div v-if="errorMessage" class="text-red-600 text-sm text-center">
                        {{ errorMessage }}
                    </div>

                    <!-- Buttons -->
                    <div class="flex gap-4 pt-4">
                        <button type="button" @click="handleCancel"
                            class="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 px-6 rounded-lg font-semibold transition-colors cursor-pointer">
                            Hủy
                        </button>
                        <button type="submit" :disabled="isLoading"
                            class="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer">
                            {{ isLoading ? 'Đang xử lý...' : 'Xác nhận' }}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute, onBeforeRouteLeave } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useUserStore } from '@/stores/user'
import { useAsyncOperation } from '@/composables/useAsyncOperation'
import ConfirmLeaveModal from '@/components/common/ConfirmLeaveModal.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const userStore = useUserStore()
const { isLoading, errorMessage } = useAsyncOperation()

const formData = ref({
    username: '',
    phone_number: '',
    address: '',
    note: ''
})

const showConfirmModal = ref(false)
const pendingNavigation = ref(null)

// Chặn navigation về trang home khi đang ở trang checkout
onBeforeRouteLeave((to, from, next) => {
    // Cho phép điều hướng đến các trang khác, nhưng chặn về home
    if (to.path === '/home' || to.name === 'home') {
        pendingNavigation.value = { to, next }
        showConfirmModal.value = true
        // Không gọi next() để chặn navigation
    } else {
        // Cho phép điều hướng đến các trang khác (cart, review-order, etc.)
        next()
    }
})

const handleConfirmLeave = () => {
    showConfirmModal.value = false
    if (pendingNavigation.value && pendingNavigation.value.next) {
        pendingNavigation.value.next()
        pendingNavigation.value = null
    }
}

const handleCancelLeave = () => {
    showConfirmModal.value = false
    if (pendingNavigation.value && pendingNavigation.value.next) {
        pendingNavigation.value.next(false)
        pendingNavigation.value = null
    }
}



onMounted(async () => {
    // Xóa flag order_completed để tránh redirect về home khi đang ở trang checkout
    // (flag này có thể còn sót từ lần thanh toán trước)
    sessionStorage.removeItem('order_completed')
    sessionStorage.removeItem('completed_order_id')

    try {
        const token = authStore.accessToken
        if (token) {
            await userStore.getInfo(token)
            if (userStore.userInfo) {
                formData.value = {
                    username: userStore.userInfo.username || '',
                    phone_number: userStore.userInfo.phone_number || '',
                    address: userStore.userInfo.address || ''
                }
            }
        }
    } catch (error) {
        console.error('Error loading user info:', error)
    }
})

const handleSubmit = async () => {
    // Validate required fields
    if (!formData.value.username || !formData.value.phone_number || !formData.value.address) {
        errorMessage.value = 'Vui lòng điền đầy đủ thông tin bắt buộc!'
        return
    }

    // Xóa flag review_page_left để đảm bảo có thể vào trang ReviewOrderPage
    // (flag này được set khi rời khỏi ReviewOrderPage, nhưng khi navigate từ CheckoutPage thì cần xóa)
    sessionStorage.removeItem('review_page_left')

    // Navigate to review order page with shipping info
    router.push({
        name: 'review-order',
        query: {
            ...route.query, // Preserve selectedItems from cart page
            shippingInfo: JSON.stringify(formData.value),
            fromCheckout: 'true' // Đánh dấu là điều hướng từ checkout
        }
    })
}

const handleCancel = () => {
    router.push('/cart')
}
</script>
