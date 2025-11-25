<template>
    <div v-if="products.length > 0"
        class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6 justify-items-center max-w-7xl mx-auto">
        <div v-for="product in products" :key="product.product_id"
            class="product-card bg-white rounded-lg shadow-md hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 overflow-hidden flex flex-col w-full max-w-sm transform hover:scale-[1.02] border border-transparent hover:border-green-200 relative cursor-pointer"
            @click="handleViewDetail(product)">
            <!-- Out of Stock Overlay -->
            <div v-if="product.out_of_stock === 1 || product.out_of_stock === true"
                class="absolute inset-0 z-10 flex items-center justify-center rounded-lg pointer-events-none">
                <div class="bg-white/60 bg-opacity-90 px-6 py-3 rounded-full shadow-lg">
                    <p class="text-lg font-semibold text-red-500">Sản phẩm tạm hết</p>
                </div>
            </div>

            <!-- Product Image -->
            <div class="relative h-64 bg-gray-100 overflow-hidden flex items-center justify-center p-4 group"
                :class="{ 'opacity-60': product.out_of_stock === 1 || product.out_of_stock === true }">
                <img :src="getProductImage(product)" :alt="getProductName(product)"
                    class="max-w-full max-h-full w-auto h-auto object-contain group-hover:scale-110 transition-transform duration-300"
                    @error="handleImageError($event)" />

                <!-- Add to Cart Button - chỉ hiện khi hover và còn hàng -->
                <div v-if="product.out_of_stock !== 1 && product.out_of_stock !== true"
                    class="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button @click.stop="(e) => { createFlyAnimation(e); handleAddToCart(product); }"
                        class="text-gray-300 hover:text-green-500 transition-all duration-200 transform hover:scale-110 active:scale-95 cursor-pointer"
                        title="Thêm vào giỏ hàng">
                        <ShoppingBagIcon :size="30" class="stroke-2" />
                    </button>
                </div>
            </div>

            <!-- Product Info -->
            <div class="p-4 flex flex-col flex-grow">
                <h3 class="font-semibold text-lg text-gray-800 mb-2 line-clamp-2">
                    {{ getProductName(product) }}
                </h3>
                <p v-if="product.description" class="text-gray-600 text-sm mb-3 line-clamp-2">
                    {{ product.description }}
                </p>

                <!-- Price and Rating -->
                <div class="flex items-center justify-between gap-2 mb-3">
                    <span class="text-xl font-bold text-green-600">
                        {{ formatPrice(product.price) }}
                    </span>
                    <div class="flex items-center gap-1">
                        <template v-for="star in 5" :key="star">
                            <span :class="[
                                'text-lg',
                                star <= Math.round(getProductRating(product)) ? 'text-yellow-400' : 'text-gray-300'
                            ]">★</span>
                        </template>
                        <span v-if="getProductRating(product) > 0" class="text-xs text-gray-500 ml-1">
                            ({{ getProductReviewCount(product) }})
                        </span>
                    </div>
                </div>

            </div>
        </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-16">
        <p class="text-gray-600 text-lg">Chưa có sản phẩm nào.</p>
    </div>
</template>
<style>
@keyframes cartBounce {

    0%,
    100% {
        transform: scale(1);
    }

    25% {
        transform: scale(1.15) rotate(-5deg);
    }

    50% {
        transform: scale(1.15) rotate(5deg);
    }

    75% {
        transform: scale(1.1) rotate(-3deg);
    }
}

.cart-bounce {
    animation: cartBounce 0.6s ease-in-out;
}
</style>
<script setup>
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'
import { useReviewStore } from '@/stores/reviews'
import { ref, watch, computed } from 'vue'
import { useCartAnimation } from '@/composables/useCartAnimation'

import { ShoppingBagIcon } from 'lucide-vue-next'

// Define props
const props = defineProps({
    products: {
        type: Array,
        required: true,
        default: () => []
    }
})

const router = useRouter()
const cartStore = useCartStore()
const authStore = useAuthStore()
const reviewStore = useReviewStore()
const { createFlyAnimation } = useCartAnimation()

// Store để lưu ratings của từng sản phẩm
const productRatingsMap = ref({})

// Computed để tính rating trung bình cho mỗi sản phẩm
const productRatings = computed(() => {
    return productRatingsMap.value
})

// Load reviews cho tất cả sản phẩm khi component mount hoặc products thay đổi
const loadProductRatings = async (products) => {
    if (!products || products.length === 0) return

    // Lấy reviews cho từng sản phẩm (API công khai, không cần token)
    const ratingPromises = products.map(async (product) => {
        const productId = product.product_id 
        if (!productId) return

        try {
            const response = await reviewStore.getReviewsByProductIdStore(productId)
            if (response?.data?.success && response.data.data) {
                const reviews = response.data.data || []
                if (reviews.length > 0) {
                    const total = reviews.reduce((sum, review) => sum + (review.rating || 0), 0)
                    const average = (total / reviews.length).toFixed(1) //giữ 1 số thập phân
                    productRatingsMap.value[productId] = {
                        average: parseFloat(average),
                        count: reviews.length
                    }
                }
            }
        } catch (error) {
            console.log(error)
            console.log(`Không thể lấy reviews cho sản phẩm ${productId}`)
        }
    })

    await Promise.all(ratingPromises)
}

// Watch products để load ratings khi danh sách thay đổi
watch(() => props.products, async (newProducts) => {
    if (newProducts && newProducts.length > 0) {
        await loadProductRatings(newProducts)
    }
}, { immediate: true })


// Xử lý xem chi tiết sản phẩm
const handleViewDetail = (product) => {
    const productId = product.product_id || product.id
    router.push(`/product-detail/${productId}`)
}

// Xử lý thêm vào giỏ hàng
const handleAddToCart = async (product) => {
    // Kiểm tra sản phẩm còn hàng
    if (product.out_of_stock === 1 || product.out_of_stock === true) {
        alert('Sản phẩm này đã hết hàng!')
        return
    }

    try {
        const userId = authStore.userId

        if (!userId) {
            alert('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!')
            return
        }

        await cartStore.addToCart(product, 1)
        // Bỏ thông báo thành công - chỉ dùng animation
    } catch (errorMessage) {
        alert(`Lỗi khi thêm sản phẩm vào giỏ hàng: ${errorMessage}`)
    }
}

// Format giá tiền
const formatPrice = (price) => {
    if (!price) return '0 ₫'
    const numPrice = typeof price === 'string' ? parseFloat(price.replace(/[^\d.]/g, '')) : price
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(numPrice)
}

// Lấy tên sản phẩm
const getProductName = (product) => {
    return product?.product_name || 'Không có tên'
}

// Lấy hình ảnh sản phẩm từ Cloudinary
const getProductImage = (product) => {
    const imageUrl = product?.img_url

    if (!imageUrl || imageUrl.trim() === '') {
        return '/img/footer.png'
    }
    return imageUrl
}

// Xử lý lỗi khi load hình ảnh
const handleImageError = (event) => {
    if (!event.target.src.includes('footer.png')) {
        event.target.src = '/img/footer.png'
    }
}

// Lấy rating trung bình của sản phẩm
const getProductRating = (product) => {
    const productId = product.product_id 
    const rating = productRatings.value[productId]
    if (rating && rating.average > 0) {
        return parseFloat(rating.average)
    }
    return 0
}

// Lấy số lượng đánh giá của sản phẩm
const getProductReviewCount = (product) => {
    const productId = product.product_id || product.id
    const rating = productRatings.value[productId]
    if (rating && rating.count > 0) {
        return rating.count
    }
    return 0
}
</script>
