<template>
    <div class="min-h-screen bg-gray-50">
        <!-- Loading State with Skeleton -->
        <div v-if="isLoading" class="container mx-auto px-4 py-8">
            <div class="bg-white rounded-lg shadow-lg overflow-hidden animate-pulse">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 md:p-8">
                    <!-- Image Skeleton -->
                    <div class="flex items-center justify-center bg-gray-200 rounded-lg h-96"></div>

                    <!-- Content Skeleton -->
                    <div class="flex flex-col space-y-6">
                        <div class="h-8 bg-gray-200 rounded w-3/4"></div>
                        <div class="h-10 bg-gray-200 rounded w-1/3"></div>
                        <div class="space-y-3">
                            <div class="h-4 bg-gray-200 rounded"></div>
                            <div class="h-4 bg-gray-200 rounded w-5/6"></div>
                            <div class="h-4 bg-gray-200 rounded w-4/6"></div>
                        </div>
                        <div class="h-12 bg-gray-200 rounded w-32"></div>
                        <div class="flex gap-4">
                            <div class="h-12 bg-gray-200 rounded flex-1"></div>
                            <div class="h-12 bg-gray-200 rounded flex-1"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Error State -->
        <div v-else-if="errorMessage || localErrorMessage" class="flex justify-center items-center min-h-[400px] py-8">
            <div class="text-center text-red-600">
                <p class="text-lg font-semibold mb-2">Có lỗi xảy ra!</p>
                <p class="mb-4">{{ errorMessage || localErrorMessage }}</p>
                <button @click="$router.push('/home')"
                    class="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors">
                    Quay lại trang chủ
                </button>
            </div>
        </div>

        <!-- Product Not Found -->
        <div v-else-if="!product && !isLoading" class="flex justify-center items-center min-h-[400px] py-8">
            <div class="text-center">
                <p class="text-lg text-gray-600 mb-4">Không tìm thấy sản phẩm</p>
                <button @click="$router.push('/home')"
                    class="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors">
                    Quay lại trang chủ
                </button>
            </div>
        </div>

        <!-- Product Detail Content -->
        <div v-else-if="product && !isLoading" class="container mx-auto px-4 py-8">
            <BackButton />

            <div class="bg-white rounded-lg shadow-lg overflow-hidden">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 md:p-8">
                    <!-- Product Image -->
                    <div class="flex items-center justify-center bg-gray-100 rounded-lg p-8 product-detail-image">
                        <img :src="getProductImage(product)" :alt="getProductName(product)"
                            class="max-w-full max-h-96 w-auto h-auto object-contain transition-opacity duration-300"
                            loading="eager" @error="handleImageError($event)" />
                    </div>

                    <!-- Product Info -->
                    <div class="flex flex-col">
                        <h1 class="text-3xl font-bold text-gray-800 mb-4">
                            {{ getProductName(product) }}
                        </h1>

                        <!-- Out of Stock Notice -->
                        <div v-if="product.out_of_stock === 1 || product.out_of_stock === true"
                            class="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <p class="text-lg font-semibold text-red-600">Sản phẩm tạm hết</p>
                        </div>

                        <!-- Price -->
                        <div class="mb-6">
                            <span class="text-3xl font-bold text-green-600">
                                {{ formatPrice(product.price) }}
                            </span>
                        </div>

                        <!-- Description -->
                        <div class="mb-6">
                            <h3 class="text-lg font-semibold text-gray-800 mb-2">Mô tả sản phẩm</h3>
                            <p class="text-gray-600 leading-relaxed">
                                {{ product.description || 'Chưa có mô tả cho sản phẩm này.' }}
                            </p>
                        </div>

                        <!-- Product Details -->
                        <div class="mb-6 space-y-3">
                            <div v-if="product.size" class="flex items-center gap-2">
                                <span class="font-semibold text-gray-700">Kích thước:</span>
                                <span class="text-gray-600">{{ product.size }}</span>
                            </div>
                            <div class="flex items-center gap-2">
                                <span class="font-semibold text-gray-700">Số lượng còn lại:</span>
                                <span :class="[
                                    'font-semibold',
                                    product.quantity > 0 ? 'text-green-600' : 'text-red-600'
                                ]">
                                    {{ product.quantity || 0 }} sản phẩm
                                </span>
                            </div>
                            <div v-if="product.category_name" class="flex items-center gap-2">
                                <span class="font-semibold text-gray-700">Danh mục:</span>
                                <span class="text-gray-600">{{ product.category_name }}</span>
                            </div>
                        </div>

                        <!-- Quantity Selector -->
                        <QuantitySelector :model-value="quantity" @update:model-value="updateQuantity" :min="1"
                            :max="product.quantity || 999" label="Số lượng:" :show-error="true" />

                        <!-- Action Buttons -->
                        <div class="flex flex-col sm:flex-row gap-4 mt-auto">
                            <button @click="(e) => handleAddToCart(e)" :disabled="!canAddToCart || isOutOfStock" :class="[
                                'flex-1 py-3 px-6 rounded-lg font-semibold transition-colors',
                                canAddToCart && !isOutOfStock
                                    ? 'bg-green-600 hover:bg-green-700 text-white  cursor-pointer'
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            ]">
                                Thêm vào giỏ hàng
                            </button>
                            <button @click="handleCheckout" :disabled="!canAddToCart || isOutOfStock" :class="[
                                'flex-1 py-3 px-6 rounded-lg font-semibold transition-colors border-2 ',
                                canAddToCart && !isOutOfStock
                                    ? 'border-green-600 text-green-600 hover:bg-green-50 cursor-pointer'
                                    : 'border-gray-300 text-gray-400 cursor-not-allowed'
                            ]">
                                Thanh toán
                            </button>
                        </div>

                    </div>
                </div>
            </div>

            <!-- Product Reviews Section -->
            <div v-if="product && !isLoading" class="mt-8 bg-white rounded-lg shadow-lg overflow-hidden">
                <div class="p-6 md:p-8">
                    <h2 class="text-2xl font-bold text-gray-800 mb-6">Đánh giá sản phẩm</h2>

                    <!-- Rating Summary -->
                    <div v-if="productReviews.length > 0" class="mb-8 pb-6 border-b border-gray-200">
                        <div class="flex flex-col md:flex-row gap-8">
                            <!-- Average Rating -->
                            <div class="text-center md:text-left">
                                <div class="text-4xl font-bold text-gray-800 text-center">{{ averageRating }}</div>
                                <div class="flex items-center justify-center md:justify-start gap-1 mt-2">
                                    <template v-for="star in 5" :key="star">
                                        <span :class="[
                                            'text-2xl',
                                            star <= Math.round(averageRating) ? 'text-yellow-400' : 'text-gray-300'
                                        ]">★</span>
                                    </template>
                                </div>
                                <div class="text-sm text-gray-500 mt-1 text-center">{{ productReviews.length }} đánh giá
                                </div>
                            </div>

                            <!-- Rating Filter Buttons (Shopee style) -->
                            <div class="flex-1">
                                <div class="flex flex-wrap gap-2 justify-center">
                                    <button @click="selectedRatingFilter = null" :class="[
                                        'px-4 py-2 rounded-lg border-2 transition-all duration-200 font-medium',
                                        selectedRatingFilter === null
                                            ? 'bg-orange-500 border-orange-500 text-white'
                                            : 'bg-white border-gray-300 text-gray-700 hover:border-orange-500 hover:text-orange-500'
                                    ]">
                                        Tất cả ({{ productReviews.length }})
                                    </button>
                                    <button v-for="rating in [5, 4, 3, 2, 1]" :key="rating"
                                        @click="selectedRatingFilter = rating" :class="[
                                            'px-4 py-2 rounded-lg border-2 transition-all duration-200 font-medium',
                                            selectedRatingFilter === rating
                                                ? 'bg-orange-500 border-orange-500 text-white'
                                                : 'bg-white border-gray-300 text-gray-700 hover:border-orange-500 hover:text-orange-500'
                                        ]">
                                        <span class="flex items-center gap-1">
                                            <span>{{ rating }} sao</span>
                                            <span class="text-xs">({{ getRatingCount(rating) }})</span>
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Reviews List -->
                    <div v-if="isLoadingReviews" class="text-center py-8">
                        <p class="text-gray-600">Đang tải đánh giá...</p>
                    </div>
                    <div v-else-if="productReviews.length === 0" class="text-center py-8">
                        <p class="text-gray-600">Chưa có đánh giá nào cho sản phẩm này.</p>
                    </div>
                    <div v-else-if="filteredReviews.length === 0 && selectedRatingFilter !== null"
                        class="text-center py-8">
                        <p class="text-gray-600">Không có đánh giá {{ selectedRatingFilter }} sao nào.</p>
                    </div>
                    <div v-else class="space-y-6">
                        <div v-for="review in filteredReviews" :key="review.review_id"
                            class="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0">
                            <div class="flex items-start justify-between mb-3">
                                <div class="flex items-center gap-3">
                                    <div
                                        class="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white font-semibold">
                                        {{ getUserInitial(review) }}
                                    </div>
                                    <div>
                                        <div class="font-semibold text-gray-800">{{ getUserName(review) }}</div>
                                        <div class="text-sm text-gray-500">{{ formatDate(review.created_at ||
                                            review.createdAt) }}</div>
                                    </div>
                                </div>
                                <div class="flex items-center gap-1">
                                    <template v-for="star in 5" :key="star">
                                        <span :class="[
                                            'text-lg',
                                            star <= (review.rating || 0) ? 'text-yellow-400' : 'text-gray-300'
                                        ]">★</span>
                                    </template>
                                </div>
                            </div>
                            <p v-if="review.comment" class="text-gray-700 leading-relaxed mt-3">
                                {{ review.comment }}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRoute, useRouter, onBeforeRouteUpdate, onBeforeRouteLeave } from 'vue-router'
import { useProductStore } from '@/stores/products'
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'
import { useReviewStore } from '@/stores/reviews'
import { useAsyncOperation } from '@/composables/useAsyncOperation'
import { useCartAnimation } from '@/composables/useCartAnimation'
import { getProductById } from '@/api/products/get'
import QuantitySelector from '@/components/common/user/QuantitySelector.vue'
import BackButton from '@/components/common/user/BackButton.vue'

const route = useRoute()
const router = useRouter()
const productStore = useProductStore()
const cartStore = useCartStore()
const authStore = useAuthStore()
const reviewStore = useReviewStore()
const { isLoading, errorMessage, executeAsync } = useAsyncOperation()
const { createFlyAnimation } = useCartAnimation()

const product = ref(null)
const quantity = ref(1)
const localErrorMessage = ref('')
const productReviews = ref([])
const isLoadingReviews = ref(false)
const selectedRatingFilter = ref(null) // null = tất cả, 1-5 = filter theo rating







//===================================Thêm  vào giỏ hàng===================================
const isOutOfStock = computed(() => {
    if (!product.value) return false
    return product.value.out_of_stock === 1 || product.value.out_of_stock === true
})

const canAddToCart = computed(() => {
    if (!product.value) return false
    if (isOutOfStock.value) return false
    if (product.value.quantity <= 0) return false
    if (quantity.value <= 0 || quantity.value > product.value.quantity) return false
    return true
})
const handleAddToCart = async (event) => {
    if (!canAddToCart.value) return

    try {
        const userId = authStore.userId

        if (!userId) {
            alert('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!')
            return
        }

        // Tạo animation trước khi thêm vào giỏ hàng
        if (event) {
            // Tìm hình ảnh sản phẩm trong trang detail
            const productImage = document.querySelector('.product-detail-image img') ||
                document.querySelector('.bg-gray-100 img') ||
                document.querySelector('img[alt*="' + getProductName(product.value) + '"]')
            if (productImage) {
                createFlyAnimation(event, productImage)
            } else {
                createFlyAnimation(event)
            }
        }

        await cartStore.addToCart(product.value, quantity.value)

    } catch (error) {
        const errorMessage = error.message || error.originalError?.response?.data?.message || 'Đã có lỗi xảy ra'
        alert(`Lỗi khi thêm sản phẩm vào giỏ hàng: ${errorMessage}`)
    }
}
//===================================cập nhật số lượng===================================
const updateQuantity = (newValue) => {
    quantity.value = newValue
}
//===================================xử lý thanh toán===================================
const handleCheckout = async () => {
    if (!canAddToCart.value) return

    const userId = authStore.userId
    await cartStore.addToCart(product.value, quantity.value, userId)
    router.push('/cart')
}

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

//===================================Xử lý đánh giá sản phẩm===================================
// Load reviews cho sản phẩm
const loadProductReviews = async (productId) => {
    if (!productId) return

    isLoadingReviews.value = true
    try {
        const response = await reviewStore.getReviewsByProductIdStore(productId)
        if (response?.data?.success && response.data.data) {
            productReviews.value = response.data.data || []
        } else {
            productReviews.value = []
        }
    } catch (error) {
        console.error('Error loading reviews:', error)
        productReviews.value = []
    } finally {
        isLoadingReviews.value = false
    }
}

// Tính rating trung bình
const averageRating = computed(() => {
    if (productReviews.value.length === 0) return 0
    const total = productReviews.value.reduce((sum, review) => sum + (review.rating || 0), 0)
    return (total / productReviews.value.length).toFixed(1)
})

// Lấy số lượng đánh giá theo rating
const getRatingCount = (rating) => {
    return productReviews.value.filter(review => review.rating === rating).length
}

// Filter reviews theo rating được chọn
const filteredReviews = computed(() => {
    if (selectedRatingFilter.value === null) {
        return productReviews.value
    }
    return productReviews.value.filter(review => review.rating === selectedRatingFilter.value)
})

// Lấy tên người dùng từ review
const getUserName = (review) => {
    if (review.user?.username) return review.user.username
    if (review.username) return review.username
    return 'Người dùng'
}

// Lấy chữ cái đầu của tên người dùng
const getUserInitial = (review) => {
    const name = getUserName(review)
    return name.charAt(0).toUpperCase()
}

// Format ngày tháng
const formatDate = (dateString) => {
    if (!dateString) return ''
    try {
        const date = new Date(dateString)
        return date.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    } catch (error) {
        console.log(error)

        return dateString
    }
}

//===================================xử lý quay lại trang===================================
watch(() => route.params.id, (newId, oldId) => {
    if (newId && newId !== oldId) {
        console.log('Route params.id changed:', oldId, '->', newId)
        loadProduct()
    }
}, { immediate: false })

//theo dõi sự thay đổi đường dẫn query
watch(() => route.query.id, (newId, oldId) => {
    if (newId && newId !== oldId && !route.params.id) {
        console.log('Route query.id changed:', oldId, '->', newId)
        loadProduct()
    }
}, { immediate: false })

// Watch fullPath để đảm bảo detect mọi thay đổi route
watch(() => route.fullPath, (newPath, oldPath) => {
    if (newPath !== oldPath && newPath.includes('product-detail')) {
        const newId = route.params.id || route.query.id
        const oldId = oldPath ? oldPath.split('/').pop() : null
        if (newId && newId !== oldId) {
            console.log('Route fullPath changed, loading product:', newId)
            loadProduct()
        }
    }
}, { immediate: false })

onBeforeRouteUpdate((to, from, next) => {
    console.log('onBeforeRouteUpdate:', from.params.id, '->', to.params.id)
    if (to.params.id !== from.params.id) {
        loadProduct()
    }
    next()
})
//===================================xử lý rời trang===================================

//xóa dữ liệu sau khi rời trang
onUnmounted(() => {
    product.value = null
    isLoadingProduct.value = false
    localErrorMessage.value = ''
})

//xóa dữ liệu trước khi rời trang
onBeforeRouteLeave((to, from, next) => {
    product.value = null
    isLoadingProduct.value = false
    next()
})

//===================================khởi tạo gọi api===================================
const isLoadingProduct = ref(false)

const loadProduct = async () => {
    const productId = route.params.id || route.query.id

    if (!productId) {
        localErrorMessage.value = 'Không tìm thấy ID sản phẩm'
        return
    }

    // Reset state trước khi load
    isLoadingProduct.value = true
    localErrorMessage.value = ''
    product.value = null
    selectedRatingFilter.value = null // Reset filter khi load sản phẩm mới
    console.log('Loading product with ID:', productId)

    await executeAsync(async () => {
        try {
            const response = await getProductById(productId)

            if (response.data && response.data.success) {
                console.log('Product loaded successfully:', response.data.data)
                // Force clear old product first
                product.value = null
                await nextTick()
                // Set new product
                product.value = { ...response.data.data }
                quantity.value = 1
                // Load reviews cho sản phẩm
                const loadedProductId = product.value.product_id || product.value.id
                if (loadedProductId) {
                    await loadProductReviews(loadedProductId)
                }
                console.log('Product value after assignment:', product.value)
            } else {
                localErrorMessage.value = response.data?.message || 'Không tìm thấy sản phẩm'
            }
        } catch (error) {

            // Fallback: thử tìm trong store nếu có
            try {
                if (!productStore.products || productStore.products.length === 0) {
                    await productStore.getProducts()
                }

                if (productStore.products && Array.isArray(productStore.products)) {
                    const foundProduct = productStore.products.find(
                        p => {
                            const pId = p.product_id || p.id
                            return pId == productId || String(pId) === String(productId)
                        }
                    )
                    if (foundProduct) {
                        product.value = foundProduct
                        quantity.value = 1
                        // Load reviews cho sản phẩm
                        const productId = foundProduct.product_id || foundProduct.id
                        if (productId) {
                            await loadProductReviews(productId)
                        }
                        return
                    }
                }
            } catch (error) {
                console.error(error)
            }

            let errorMsg = 'Không thể tải thông tin sản phẩm!'
            if (error.response) {
                if (error.response.status === 404) {
                    errorMsg = 'Không tìm thấy sản phẩm với ID: ' + productId
                } else if (error.response.status === 500) {
                    errorMsg = 'Lỗi server. Vui lòng thử lại sau.'
                } else {
                    errorMsg = error.response.data?.message || `Lỗi ${error.response.status}: ${error.response.statusText}`
                }
            } else if (error.message) {
                errorMsg = error.message
            }
            localErrorMessage.value = errorMsg
        }
    }, {
        defaultErrorMessage: 'Không thể tải thông tin sản phẩm!'
    }).finally(() => {
        isLoadingProduct.value = false
    })
}
onMounted(() => {
    loadProduct()
})
</script>
