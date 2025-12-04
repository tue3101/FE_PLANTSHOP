<template>
    <div class="min-h-screen bg-gray-50 py-8">
        <div class="container mx-auto px-4">
            <div class="flex items-center justify-between mb-6">
                <div class="flex-1"></div>
                <h1 class="text-3xl font-bold text-green-700 flex-1 text-center">Giỏ hàng của tôi</h1>
                <div class="flex items-center gap-4 flex-1 justify-end">
                    <router-link v-if="hasOrders" to="/orders-page"
                        class="text-green-700 hover:text-green-500 font-semibold transition-colors">
                        Xem đơn hàng
                    </router-link>
                    <router-link to="/order-history" class="text-green-700 hover:text-green-500 transition-colors">
                        <History :size="28" />
                    </router-link>
                </div>
            </div>

            <!-- Empty Cart -->
            <div v-if="cartStore.cartItems.length === 0" class="text-center py-16 bg-white rounded-lg shadow">
                <div class="mb-4">
                    <svg class="mx-auto h-24 w-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                </div>
                <p class="text-xl text-gray-600 mb-4">Giỏ hàng của bạn đang trống</p>
                <div class="flex flex-col sm:flex-row gap-3 justify-center items-center">
                    <router-link to="/product"
                        class="inline-block bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
                        Tiếp tục mua sắm
                    </router-link>

                </div>
            </div>

            <!-- giỏ hàng -->
            <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div class="lg:col-span-2 space-y-4">
                    <!-- tick chọn-->
                    <div class="bg-white rounded-lg shadow p-4 flex items-center justify-between">
                        <label class="flex items-center gap-3 cursor-pointer">
                            <input type="checkbox" :checked="isAllSelected" @change="toggleSelectAll"
                                class="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500">
                            <span class="font-semibold text-gray-800">Chọn tất cả</span>
                        </label>
                        <span class="text-sm text-gray-600">{{ selectedCount }} / {{ selectableItemsCount }} sản
                            phẩm được chọn</span>
                    </div>

                    <div v-for="(item) in cartStore.cartItems" :key="item.cart_detail_id" :class="[
                        'bg-white rounded-lg shadow p-6 flex flex-col sm:flex-row gap-4 relative'

                    ]">
                        <!-- Checkbox - Ẩn khi sản phẩm hết hàng hoặc ngưng kinh doanh -->
                        <div v-if="!isOutOfStock(item) && !isDeleted(item)" class="flex items-start">
                            <input type="checkbox" :checked="isItemSelected(item)" @change="toggleItemSelection(item)"
                                class="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500 mt-1 cursor-pointer">
                        </div>

                        <!-- Overlay sản phẩm hết hàng -->
                        <div v-if="isDeleted(item)"
                            class="absolute inset-0 z-[5] flex items-center justify-center rounded-lg pointer-events-none">
                            <div class="bg-white/50 bg-opacity-90 px-6 py-3 rounded-full shadow-lg">
                                <p class="text-lg font-semibold text-red-500">Sản phẩm ngưng kinh doanh</p>
                            </div>
                        </div>
                        <div v-else-if="isOutOfStock(item)"
                            class="absolute inset-0 z-[5] flex items-center justify-center rounded-lg pointer-events-none">
                            <div class="bg-white/50 bg-opacity-90 px-6 py-3 rounded-full shadow-lg">
                                <p class="text-lg font-semibold text-red-500">Sản phẩm tạm hết</p>
                            </div>
                        </div>


                        <!-- Product Image -->
                        <div class="flex-shrink-0 w-full sm:w-32 h-32 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center"
                            :class="{ 'pointer-events-none opacity-50': isOutOfStock(item) || isDeleted(item) }">
                            <img :src="getProductImage(item)" :alt="getProductName(item)"
                                class="max-w-full max-h-full w-auto h-auto object-contain"
                                @error="handleImageError($event)" />
                        </div>

                        <!-- Product Info -->
                        <div class="flex-1 flex flex-col justify-between">
                            <div class="flex-1 flex flex-col justify-between"
                                :class="{ 'pointer-events-none opacity-50': isOutOfStock(item) || isDeleted(item) }">
                                <div>
                                    <h3 class="text-lg font-semibold text-gray-800 mb-2">
                                        {{ getProductName(item) }}
                                    </h3>
                                    <p class="text-xl font-bold text-green-600 mb-2">
                                        {{ formatPrice(item.price) }}
                                    </p>

                                    <!-- Product Details -->
                                    <div class="space-y-1 mb-3">
                                        <p v-if="item.size" class="text-sm text-gray-600">
                                            Kích thước: {{ item.size }}
                                        </p>
                                        <div class="flex items-center gap-2">
                                            <span class="text-sm font-medium text-gray-600">Số lượng còn lại:</span>
                                            <span :class="[
                                                'text-sm font-semibold',
                                                getAvailableStock(item) > 0 ? 'text-green-600' : 'text-red-600'
                                            ]">
                                                {{ getAvailableStock(item) }} sản phẩm
                                            </span>
                                        </div>
                                    </div>
                                </div>

                            </div>


                            <!-- Quantity Control -->
                            <div class="flex items-end mt-4">
                                <div class="flex-1"
                                    :class="{ 'pointer-events-none opacity-70': isOutOfStock(item) || isDeleted(item) }">
                                    <QuantitySelector :model-value="item.quantity"
                                        @update:model-value="(value) => updateItemQuantityAndSelected(item, value)"
                                        @exceed-max="(value) => handleExceedMaxInCart(item, value)" :min="1"
                                        :max="getMaxQuantity(item)" :disabled="isOutOfStock(item) || isDeleted(item)"
                                        label="Số lượng mua:" :show-error="true" />
                                </div>

                                <!-- Remove Button -->
                                <button @click="removeItem(item)"
                                    class="relative z-20 text-red-500 hover:text-red-500/80 font-medium text-sm flex gap-1 transition-colors px-3 py-2 rounded-lg ml-4 cursor-pointer mb-6">
                                    <Trash2 :size="20" />
                                    Xóa
                                </button>
                            </div>
                        </div>

                        <!-- Item Total -->
                        <div class="flex-shrink-0 text-right"
                            :class="{ 'pointer-events-none opacity-50': isOutOfStock(item) || isDeleted(item) }">
                            <p class="text-lg font-bold text-gray-800">
                                {{ formatPrice((item.price || 0) * item.quantity) }}
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Order Summary -->
                <div class="lg:col-span-1">
                    <div class="bg-white rounded-lg shadow p-6 sticky top-4">
                        <h2 class="text-xl font-bold text-gray-800 mb-4">Đơn hàng của bạn</h2>

                        <div class="space-y-3 mb-6">
                            <div class="flex justify-between text-gray-600">
                                <span>Tổng số lượng:</span>
                                <span class="font-semibold">{{ selectedTotalItems }} sản phẩm</span>
                            </div>
                            <div class="flex justify-between text-gray-600">
                                <span>Tạm tính:</span>
                                <span class="font-semibold">{{ formatPrice(selectedTotalPrice) }}</span>
                            </div>

                            <div class="border-t pt-3 flex justify-between text-lg font-bold text-gray-800">
                                <span>Tổng cộng:</span>
                                <span class="text-green-600">{{ formatPrice(selectedTotalPrice) }}</span>
                            </div>
                        </div>

                        <button @click="handleCheckout"
                            class="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors mb-3 cursor-pointer">
                            Thanh toán
                        </button>

                        <button @click="handleContinueShopping"
                            class="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 px-6 rounded-lg font-semibold transition-colors cursor-pointer mb-3">
                            Tiếp tục mua sắm
                        </button>

                        <!-- Debug info -->
                        <div v-if="false" class="text-xs text-gray-500 mb-2">
                            Debug: hasOrders = {{ hasOrders }}, debugHasOrders = {{ debugHasOrders }}
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Modal thông báo -->
        <div v-if="showNotificationModal" class="fixed inset-0 flex items-center justify-center  z-50"
            @click="closeNotificationModal">
            <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4" @click.stop>
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-semibold text-gray-800">Thông báo</h3>
                    <button @click="closeNotificationModal" class="text-gray-500 hover:text-gray-700 cursor-pointer">
                        <X :size="24" />
                    </button>
                </div>
                <p class="text-gray-700 mb-6">{{ notificationMessage }}</p>
                <div class="flex justify-end">
                    <button @click="closeNotificationModal"
                        class="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors cursor-pointer">
                        Đóng
                    </button>
                </div>
            </div>
        </div>

        <!-- Modal xóa sản phẩm -->
        <DeleteModal :showModal="showDeleteModal" :mode="deleteModalMode" :message="deleteModalMessage"
            @confirm="handleDeleteConfirm" @cancel="handleDeleteCancel" @close="handleDeleteClose" />

        <!-- Modal thông báo số lượng không đủ -->
        <DeleteModal :show-modal="showStockModal" mode="info" title="Số lượng không đủ" :message="stockModalMessage"
            @close="handleCloseStockModal" @update:show-modal="showStockModal = $event" />
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'
import { useOrderStore } from '@/stores/orders'
import { useRouter } from 'vue-router'
import { useAsyncOperation } from '@/composables/useAsyncOperation'
import QuantitySelector from '@/components/common/user/QuantitySelector.vue'
import DeleteModal from '@/components/common/admin/DeleteModal.vue'
import { History, X, Trash2 } from 'lucide-vue-next'

const router = useRouter()
const cartStore = useCartStore()
const authStore = useAuthStore()
const orderStore = useOrderStore()
const { executeAsync } = useAsyncOperation()

// Quản lý trạng thái selected của các items
const selectedItems = ref(new Set())
const hasOrders = ref(false)

// Modal thông báo
const showNotificationModal = ref(false)
const notificationMessage = ref('')

// Modal xóa sản phẩm
const showDeleteModal = ref(false)
const itemToDelete = ref(null)
const deleteModalMode = ref('confirm')

// Modal thông báo số lượng không đủ
const showStockModal = ref(false)
const currentMaxQuantity = ref(0)
const currentProductName = ref('')

const deleteModalMessage = computed(() => {
    if (itemToDelete.value) {
        return `Bạn có chắc muốn xóa "${getProductName(itemToDelete.value)}" khỏi giỏ hàng?`
    }
    return ''
})

// Message cho modal thông báo số lượng
const stockModalMessage = computed(() => {
    return `Số lượng sản phẩm "${currentProductName.value}" trong kho không đủ. Số lượng tối đa có thể mua là ${currentMaxQuantity.value} sản phẩm.`
})

// Debug computed để kiểm tra
const debugHasOrders = computed(() => {
    console.log('Computed hasOrders:', hasOrders.value)
    return hasOrders.value
})

// Watch orderStore.orders để tự động cập nhật hasOrders
watch(() => orderStore.orders, (newOrders) => {
    console.log('OrderStore.orders changed:', newOrders)
    if (newOrders && Array.isArray(newOrders)) {
        hasOrders.value = newOrders.length > 0
        console.log('hasOrders updated from watch:', hasOrders.value)
    }
}, { immediate: true, deep: true })

const getUserId = () => {
    return authStore.userId
}



//===================================CHECK BOX===================================
// Số lượng items được selected (chỉ đếm sản phẩm có thể chọn được)
const selectedCount = computed(() => {
    return cartStore.cartItems
        .filter(item => {
            const identifier = item.cart_detail_id || item.product_id || item.id
            return selectedItems.value.has(identifier) && !isOutOfStock(item) && !isDeleted(item)
        }).length
})

// Số lượng sản phẩm có thể chọn được (không hết hàng và chưa bị xóa)
const selectableItemsCount = computed(() => {
    return cartStore.cartItems.filter(item => !isOutOfStock(item) && !isDeleted(item)).length
})

// Tính tổng số lượng của các items được selected
const selectedTotalItems = computed(() => {
    return cartStore.cartItems
        .filter(item => {
            const identifier = item.cart_detail_id || item.product_id || item.id
            return selectedItems.value.has(identifier)
        })
        .reduce((sum, item) => sum + item.quantity, 0)
})

// ===========================check all==========================
// tính toán xem item đã được chọn hết chưa (chỉ kiểm tra sản phẩm có thể chọn được)
//.every() sẽ kiểm tra mọi phần tử trong mảng có thỏa điều kiện hay không.
//.has(id) → kiểm tra xem ID đó có nằm trong Set
const isAllSelected = computed(() => {
    const selectableItems = cartStore.cartItems.filter(item => !isOutOfStock(item) && !isDeleted(item))
    if (selectableItems.length === 0) return false
    return selectableItems.every(item => {
        const identifier = item.cart_detail_id
        return selectedItems.value.has(identifier)
    })
})

const toggleSelectAll = async (event) => {
    const userId = getUserId()
    //thuộc tính boolean của checkbox
    const shouldSelect = event.target.checked

    // Optimistic update: cập nhật UI ngay lập tức
    if (shouldSelect) {
        // Chọn tất cả (chỉ chọn sản phẩm còn hàng và chưa bị xóa)
        cartStore.cartItems.forEach(item => {
            // Bỏ qua sản phẩm hết hàng hoặc đã bị xóa
            if (isOutOfStock(item) || isDeleted(item)) return

            const identifier = item.cart_detail_id
            selectedItems.value.add(identifier)
            item.selected = true
        })
    } else {
        // Bỏ chọn tất cả (chỉ bỏ chọn sản phẩm có thể chọn được)
        cartStore.cartItems.forEach(item => {
            if (isOutOfStock(item) || isDeleted(item)) return
            const identifier = item.cart_detail_id
            selectedItems.value.delete(identifier)
            item.selected = false
        })
    }

    // Gọi API để cập nhật trường selected cho tất cả items đồng loạt
    // Sử dụng Promise.all để gọi song song, không block UI
    if (userId) {
        try {
            // Tạo array các promise để gọi API đồng loạt (chỉ cho sản phẩm còn hàng và chưa bị xóa)
            const updatePromises = cartStore.cartItems
                .filter(item => !isOutOfStock(item) && !isDeleted(item)) // Chỉ cập nhật sản phẩm còn hàng và chưa bị xóa
                .map(item => {
                    const identifier = item.cart_detail_id
                    return cartStore.updateQuantity(identifier, item.quantity, shouldSelect)
                        .catch(error => {
                            // Nếu một item lỗi, vẫn tiếp tục với các item khác
                            return { error, identifier }
                        })
                })

            // Gọi tất cả API cùng lúc, không chờ từng cái
            const results = await Promise.all(updatePromises)


            const errors = results.filter(r => r && r.error)
            if (errors.length > 0) {
                console.log(errors)
            }
        } catch (error) {
            console.error(error)
        }
    }
}

//===================================check 1 item===================================
const toggleItemSelection = async (item) => {
    // Không cho phép chọn sản phẩm hết hàng
    if (isOutOfStock(item)) {
        showNotification('Không thể chọn sản phẩm hết hàng!')
        return
    }

    const identifier = item.cart_detail_id
    const userId = getUserId()
    const isSelected = selectedItems.value.has(identifier)
    const newSelected = !isSelected

    // cập nhật UI 
    if (isSelected) {
        selectedItems.value.delete(identifier)
    } else {
        selectedItems.value.add(identifier)
    }
    // Cập nhật item.selected trong local state
    item.selected = newSelected

    // Gọi API để cập nhật trường selected 
    if (userId) {
        try {
            await cartStore.updateQuantity(identifier, item.quantity, newSelected)
        } catch (error) {
            console.error(error)
        }
    }
}



// Tính tổng tiền của các items được selected
const selectedTotalPrice = computed(() => {
    return cartStore.cartItems
        .filter(item => {
            const identifier = item.cart_detail_id || item.product_id || item.id
            return selectedItems.value.has(identifier)
        })
        .reduce((sum, item) => {
            const price = item.price || 0
            return sum + (price * item.quantity)
        }, 0)
})

// Kiểm tra sản phẩm có hết hàng không
const isOutOfStock = (item) => {
    const outOfStock = item?.out_of_stock ?? item?.products?.out_of_stock
    return outOfStock === true
}
const isDeleted = (item) => {
    const deletedFromItem = item?._deleted
    const deleted = deletedFromItem
    const result = deleted === true
    return result
}

// Lấy số lượng tồn kho hiện có của sản phẩm
const getAvailableStock = (item) => {
    return item.stock ?? 0
}

const getMaxQuantity = (item) => {
    const stock = getAvailableStock(item)
    return stock > 0 ? stock : 999
}



//===================================update số lượng===================================
// Kiểm tra item có được selected không
const isItemSelected = (item) => {
    const identifier = item.cart_detail_id
    return selectedItems.value.has(identifier)
}

const updateItemQuantityAndSelected = async (item, newQuantity) => {
    const identifier = item.cart_detail_id
    const isSelected = isItemSelected(item)

    const maxQuantity = getMaxQuantity(item)
    if (newQuantity > maxQuantity) {
        // Hiển thị modal thông báo
        currentMaxQuantity.value = maxQuantity
        currentProductName.value = getProductName(item)
        showStockModal.value = true
        // Tự động set về maxQuantity
        await cartStore.updateQuantity(identifier, maxQuantity, isSelected)
        return
    }

    if (newQuantity < 1) {
        // Hiển thị modal xác nhận xóa
        removeItem(item)
        return
    }

    // cập nhật UI ngay lập tức
    const oldQuantity = item.quantity
    item.quantity = newQuantity

    try {
        // Gửi cả quantity và selected khi update
        const response = await cartStore.updateQuantity(identifier, newQuantity, isSelected)
        // Sau khi API thành công, cart sẽ được reload từ backend để đảm bảo đồng bộ
        // item.quantity đã được cập nhật ở trên, reload sẽ thay thế bằng dữ liệu mới từ backend
        if (!response?.data?.success) {
            // Nếu API không thành công, rollback
            item.quantity = oldQuantity
        }
    } catch (error) {
        // Nếu có lỗi, rollback về giá trị cũ
        item.quantity = oldQuantity
        console.error('Lỗi cập nhật số lượng:', error)
        alert('Có lỗi xảy ra khi cập nhật số lượng. Vui lòng thử lại!')
    }
}

// Xử lý khi số lượng vượt quá max trong giỏ hàng
const handleExceedMaxInCart = async (item, value) => {
    const identifier = item.cart_detail_id
    const isSelected = isItemSelected(item)
    const maxQuantity = getMaxQuantity(item)

    if (value > maxQuantity) {
        // Hiển thị modal thông báo
        currentMaxQuantity.value = maxQuantity
        currentProductName.value = getProductName(item)
        showStockModal.value = true
        // Tự động set về maxQuantity
        await cartStore.updateQuantity(identifier, maxQuantity, isSelected)
    }
}

// Đóng modal thông báo số lượng
const handleCloseStockModal = () => {
    showStockModal.value = false
}

//===================================xóa item===================================
const removeItem = async (item) => {
    // Hiển thị modal xác nhận xóa
    itemToDelete.value = item
    deleteModalMode.value = 'confirm'
    showDeleteModal.value = true
}

const handleDeleteConfirm = async () => {
    if (!itemToDelete.value) return

    const item = itemToDelete.value
    const identifier = item.cart_detail_id

    try {
        // Gọi API xóa sản phẩm (sẽ tự động reload cart sau khi xóa)
        await cartStore.removeFromCart(identifier)

        // Xóa khỏi selected items 
        selectedItems.value.delete(identifier)

        // Hiển thị modal thành công
        deleteModalMode.value = 'success'
    } catch (error) {
        console.error(error)
        // Đóng modal nếu có lỗi
        showDeleteModal.value = false
        itemToDelete.value = null
    }
}

const handleDeleteCancel = () => {
    showDeleteModal.value = false
    itemToDelete.value = null
    deleteModalMode.value = 'confirm'
}

const handleDeleteClose = () => {
    showDeleteModal.value = false
    itemToDelete.value = null
    deleteModalMode.value = 'confirm'
}



//===================================format và get data===================================
const formatPrice = (price) => {
    if (!price) return '0 ₫'
    const numPrice = typeof price === 'string' ? parseFloat(price.replace(/[^\d.]/g, '')) : price
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(numPrice)
}

const getProductName = (product) => {
    return product?.product_name || 'Không có tên'
}

const getProductImage = (product) => {
    const imageUrl = product?.img_url
    if (!imageUrl || imageUrl.trim() === '') {
        return '/img/footer.png'
    }
    return imageUrl
}

const handleImageError = (event) => {
    if (!event.target.src.includes('footer.png')) {
        event.target.src = '/img/footer.png'
    }
}

//===================================reset selected items===================================
// Reset selected items khi cart thay đổi
const resetSelectedItems = () => {
    selectedItems.value.clear()
    cartStore.cartItems.forEach(item => {
        const identifier = item.cart_detail_id
        if (item.selected !== undefined && item.selected !== null) {
            if (item.selected) {
                selectedItems.value.add(identifier)
            }
        } else {
            selectedItems.value.add(identifier)
        }
    })
}

// Watch cartItems để tự động cập nhật selected items khi cart thay đổi
watch(() => cartStore.cartItems, (newItems, oldItems) => {
    // Đồng bộ selected items với selected state từ backend
    newItems.forEach(item => {
        const identifier = item.cart_detail_id || item.product_id || item.id
        if (item.selected !== undefined && item.selected !== null) {

            if (item.selected) {
                selectedItems.value.add(identifier)
            } else {
                selectedItems.value.delete(identifier)
            }
        } else {
            const isNewItem = !oldItems || !oldItems.some(oldItem => {
                const oldIdentifier = oldItem.cart_detail_id || oldItem.product_id || oldItem.id
                return oldIdentifier === identifier
            })
            if (isNewItem) {
                selectedItems.value.add(identifier)
            }
        }
    })

    // Xóa các selected items không còn trong cart nữa
    const currentIdentifiers = new Set(newItems.map(item =>
        item.cart_detail_id
    ))

    Array.from(selectedItems.value).forEach(identifier => {
        if (!currentIdentifiers.has(identifier)) {
            selectedItems.value.delete(identifier)
        }
    })
}, { deep: true })


// Kiểm tra xem user có đơn hàng không
const checkUserOrders = async () => {
    const userId = getUserId()
    if (!userId) {
        hasOrders.value = false
        return
    }

    try {
        const response = await orderStore.getOrdersByUserIdStore(userId)

        console.log('=== DEBUG CHECK ORDERS ===')
        console.log('Response:', response)
        console.log('Response.data:', response?.data)
        console.log('Response.data.success:', response?.data?.success)
        console.log('Response.data.data:', response?.data?.data)
        console.log('OrderStore.orders:', orderStore.orders)

        // Kiểm tra cả response và store
        let ordersList = null
        if (response?.data?.success && response.data.data) {
            ordersList = response.data.data
            console.log('Using response.data.data:', ordersList)
        } else if (orderStore.orders && Array.isArray(orderStore.orders)) {
            ordersList = orderStore.orders
            console.log('Using orderStore.orders:', ordersList)
        }

        console.log('ordersList:', ordersList)
        console.log('Is array?', Array.isArray(ordersList))
        console.log('Length:', ordersList?.length)

        if (ordersList && Array.isArray(ordersList)) {
            hasOrders.value = ordersList.length > 0
            console.log('hasOrders set to:', hasOrders.value)
        } else {
            hasOrders.value = false
            console.log('hasOrders set to false - ordersList is not valid array')
        }

        console.log('Final hasOrders:', hasOrders.value)
        console.log('=== END DEBUG ===')
    } catch (error) {
        console.error('Error checking orders:', error)
        hasOrders.value = false
    }
}

//===================================khởi tạo gọi api===================================
onMounted(async () => {
    const userId = getUserId()
    if (userId) {
        await executeAsync(async () => {
            await cartStore.loadCartFromBackend(userId)
            resetSelectedItems()
            // Kiểm tra đơn hàng
            await checkUserOrders()
        }, {
            defaultErrorMessage: 'Không thể tải giỏ hàng từ server!'
        })
    }
})

const showNotification = (message) => {
    notificationMessage.value = message
    showNotificationModal.value = true
}

const closeNotificationModal = () => {
    showNotificationModal.value = false
    notificationMessage.value = ''
}

const handleCheckout = () => {
    // Check if there are selected items
    if (selectedCount.value === 0) {
        showNotification('Vui lòng chọn ít nhất một sản phẩm để thanh toán!')
        return
    }

    // Navigate to checkout page
    router.push({
        path: '/checkout',
        query: {
            // Pass selected items info với đầy đủ thông tin sản phẩm
            selectedItems: JSON.stringify(
                cartStore.cartItems
                    .filter(item => {
                        const identifier = item.cart_detail_id || item.product_id || item.id
                        return selectedItems.value.has(identifier)
                    })
                    .map(item => ({
                        cart_detail_id: item.cart_detail_id,
                        product_id: item.product_id,
                        product_name: item.product_name,
                        img_url: item.img_url,
                        quantity: item.quantity,
                        price: item.price,
                        stock: item.stock
                    }))
            )
        }
    })
}

const handleContinueShopping = () => {
    router.push('/product')
}

</script>
