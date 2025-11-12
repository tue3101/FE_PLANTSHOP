<template>
    <div class="p-8">
        <div class="flex items-center justify-between mb-4">
            <div class="flex-1 flex justify-center">
                <div class="relative w-[350px]">
                    <input type="text" v-model="searchQuery" placeholder="Nhập từ khóa tìm kiếm"
                        class="w-full border border-gray-400 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        @input="handleSearch" />
                    <span class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                            stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
                        </svg>
                    </span>
                </div>
            </div>
        </div>

        <!-- Loading State -->
        <LoadingErrorState :isLoading="isLoading" :errorMessage="errorMessage" loadingMessage="Đang tải đánh giá..."
            @reset-error="resetError" />

        <!-- Data Display -->
        <div v-if="!isLoading && !errorMessage" class="overflow-x-auto">
            <h2 class="text-2xl font-bold mb-2">DANH SÁCH ĐÁNH GIÁ</h2>
            <DataPager v-model="currentPage" :items="filteredActiveReviews" :items2="filteredDeletedReviews"
                :page-size="PAGE_SIZE" :show-filter="true" :show-active="true" :show-status-filter="true"
                :status-options="ratingOptions" v-model:selected-status="ratingFilter"
                v-model:selected-active="selectedActive" controls-class="mb-1">
                <template #default="{ items }">
                    <CommonTable :headers="['ID', 'NGƯỜI DÙNG', 'SẢN PHẨM', 'ĐÁNH GIÁ', 'NHẬN XÉT', 'NGÀY ĐÁNH GIÁ']"
                        :keys="['review_id', 'user', 'product', 'rating', 'comment', 'created_at']" :data="items"
                        row-key="review_id" title-class="font-bold text-2xl">
                        <template #cell-user="{ item }">
                            {{ getUserName(item) }}
                        </template>
                        <template #cell-product="{ item }">
                            {{ getProductName(item) }}
                        </template>
                        <template #cell-rating="{ item }">
                            <div class="flex items-center gap-1">
                                <span v-for="star in 5" :key="star" :class="[
                                    'text-lg',
                                    star <= item.rating ? 'text-yellow-400' : 'text-gray-300'
                                ]">★</span>
                                <span class="ml-2 text-sm text-gray-600">({{ item.rating }}/5)</span>
                            </div>
                        </template>
                        <template #cell-comment="{ item }">
                            <p class="max-w-md truncate" :title="item.comment || 'Không có nhận xét'">
                                {{ item.comment || 'Không có nhận xét' }}
                            </p>
                        </template>
                        <template #cell-created_at="{ item }">
                            {{ formatDate(item.created_at || item.review_date) }}
                        </template>
                        <template #actions="{ item }">
                            <ButtonCommon :selected-active="selectedActive" :item="item" @view="openViewDetail"
                                @update="handleUpdate" @restore="handleRestore" @delete="openDeleteConfirmModal" />
                        </template>
                    </CommonTable>
                </template>
            </DataPager>
        </div>

        <!-- View Detail Modal -->
        <ViewDetailModal :showModal="showViewModal" :title="'Chi tiết Đánh giá'" :item="selectedReview"
            :fields="reviewFields" :options="{}" @close="closeViewModal" @update:showModal="showViewModal = $event" />

        <!-- Delete Modals -->
        <DeleteModal :showModal="showDeleteConfirmModal" mode="confirm" @confirm="handleDeleteConfirm"
            @cancel="handleDeleteCancel" />
        <DeleteModal :showModal="showDeleteSuccessModal" mode="success" @close="handleDeleteSuccessClose" />
    </div>
</template>

<script setup>
import CommonTable from '@/components/common/admin/CommonTable.vue'
import DataPager from '@/components/common/DataPager.vue'
import ViewDetailModal from '@/components/common/admin/ViewDetailModal.vue'
import ButtonCommon from '@/components/common/admin/ButtonCommon.vue'
import DeleteModal from '@/components/common/admin/DeleteModal.vue'
import LoadingErrorState from '@/components/common/LoadingErrorState.vue'
import { ref, computed, onMounted } from 'vue'
import { useAsyncOperation } from '@/composables/useAsyncOperation'
import { useReviewStore } from '@/stores/reviews'
import { useAuthStore } from '@/stores/auth'

const PAGE_SIZE = 8
const currentPage = ref(1)
const searchQuery = ref('')
const ratingFilter = ref('')
const selectedActive = ref('')
const { isLoading, errorMessage, executeAsync, resetError } = useAsyncOperation()

const authStore = useAuthStore()
const reviewStore = useReviewStore()

// Local data refs
const dataReviews = ref([])
const dataDeleted = ref([])

// Rating options cho filter
const ratingOptions = [
    { value: '5', label: '5 sao' },
    { value: '4', label: '4 sao' },
    { value: '3', label: '3 sao' },
    { value: '2', label: '2 sao' },
    { value: '1', label: '1 sao' }
]

// Computed để filter reviews hiện theo search query
const filteredActiveReviews = computed(() => {
    let reviews = dataReviews.value

    // Filter theo search query
    if (searchQuery.value.trim()) {
        const query = searchQuery.value.toLowerCase().trim()
        reviews = reviews.filter(review => {
            const reviewId = String(review.review_id || '').toLowerCase()
            const userName = getUserName(review).toLowerCase()
            const productName = getProductName(review).toLowerCase()
            const comment = (review.comment || '').toLowerCase()
            return reviewId.includes(query) || userName.includes(query) || productName.includes(query) || comment.includes(query)
        })
    }

    // Map rating thành status để DataPager filter
    return reviews.map(review => ({
        ...review,
        status: String(review.rating)
    }))
})

// Computed để filter reviews đã bị xóa theo search query
const filteredDeletedReviews = computed(() => {
    let reviews = dataDeleted.value
    console.log('filteredDeletedReviews - dataDeleted.value:', reviews.length)

    // Filter theo search query
    if (searchQuery.value.trim()) {
        const query = searchQuery.value.toLowerCase().trim()
        reviews = reviews.filter(review => {
            const reviewId = String(review.review_id || '').toLowerCase()
            const userName = getUserName(review).toLowerCase()
            const productName = getProductName(review).toLowerCase()
            const comment = (review.comment || '').toLowerCase()
            return reviewId.includes(query) || userName.includes(query) || productName.includes(query) || comment.includes(query)
        })
    }

    // Map rating thành status để DataPager filter
    const result = reviews.map(review => ({
        ...review,
        status: String(review.rating)
    }))
    console.log('filteredDeletedReviews - result:', result.length)
    return result
})


// Search handler
const handleSearch = () => {
    currentPage.value = 1
}

// Format functions
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

const getUserName = (review) => {
    if (review.user?.username) return review.user.username
    if (review.user?.full_name) return review.user.full_name
    if (review.user_name) return review.user_name
    return 'Không có tên'
}

const getProductName = (review) => {
    if (review.product?.product_name) return review.product.product_name
    if (review.product?.name) return review.product.name
    if (review.product_name) return review.product_name
    return 'Sản phẩm không xác định'
}

// View Detail Modal
const showViewModal = ref(false)
const selectedReview = ref(null)

const reviewFields = [
    { key: 'review_id', label: 'Mã đánh giá', type: 'text' },
    { key: 'user', label: 'Người đánh giá', type: 'text' },
    { key: 'product', label: 'Sản phẩm', type: 'text' },
    { key: 'rating', label: 'Đánh giá', type: 'text' },
    { key: 'comment', label: 'Nhận xét', type: 'text' },
    { key: 'created_at', label: 'Ngày đánh giá', type: 'text' }
]

const openViewDetail = async (review) => {
    try {
        // Load review details if needed
        if (!review.user || !review.product) {
            await reviewStore.getReviewByIdStore(review.review_id)
            review = reviewStore.currentReview || review
        }

        // Format review data for modal
        selectedReview.value = {
            review_id: review.review_id,
            user: getUserName(review),
            product: getProductName(review),
            rating: `${review.rating}/5 sao`,
            comment: review.comment || 'Không có nhận xét',
            created_at: formatDate(review.created_at || review.review_date)
        }
        showViewModal.value = true
    } catch (error) {
        console.error('Error loading review details:', error)
        errorMessage.value = 'Không thể tải chi tiết đánh giá!'
    }
}

const closeViewModal = () => {
    showViewModal.value = false
    selectedReview.value = null
}

// Delete Modal
const showDeleteConfirmModal = ref(false)
const showDeleteSuccessModal = ref(false)
const selectedReviewForDelete = ref(null)

const openDeleteConfirmModal = (review) => {
    selectedReviewForDelete.value = review
    showDeleteConfirmModal.value = true
}

const handleDeleteCancel = () => {
    showDeleteConfirmModal.value = false
    selectedReviewForDelete.value = null
}

const handleDeleteConfirm = async () => {
    if (!selectedReviewForDelete.value) return

    const token = authStore.accessToken || ''
    if (!token) {
        alert('Vui lòng đăng nhập lại!')
        showDeleteConfirmModal.value = false
        return
    }

    await executeAsync(async () => {
        await reviewStore.deleteReviewStore(selectedReviewForDelete.value.review_id)
        await refreshReviewsData(token)
        showDeleteConfirmModal.value = false
        showDeleteSuccessModal.value = true
        selectedReviewForDelete.value = null
    }, {
        defaultErrorMessage: 'Không thể xóa đánh giá!',
        onError: (error) => {
            errorMessage.value = error.response?.data?.message || error.message || 'Không thể xóa đánh giá!'
            showDeleteConfirmModal.value = false
        }
    })
}

const handleDeleteSuccessClose = () => {
    showDeleteSuccessModal.value = false
}

// Restore function
const handleRestore = async (item) => {
    const reviewId = item.review_id
    const token = authStore.accessToken || ''

    if (!token) {
        alert('Vui lòng đăng nhập lại!')
        return
    }

    if (!reviewId) {
        alert('Không tìm thấy đánh giá cần khôi phục!')
        return
    }

    await executeAsync(async () => {
        await reviewStore.restoreReviewStore(reviewId)
        await refreshReviewsData(token)
    }, {
        defaultErrorMessage: 'Không thể khôi phục đánh giá!',
        onError: (error) => {
            const errorMessage = error.response?.data?.message
            console.error('Restore error:', errorMessage || error)
        }
    })
}


// =====================================khởi tạo gọi api======================================
const refreshReviewsData = async (token) => {
    await reviewStore.getAllReviewsStore(token)

    try {
        await reviewStore.getAllDeletedReviewsStore(token)
    } catch (error) {
        console.error('Error loading deleted reviews:', error)
    }

    const list = reviewStore.reviews || []
    dataReviews.value = list.map((r) => ({
        review_id: r.review_id,
        rating: r.rating,
        comment: r.comment,
        created_at: r.created_at || r.review_date,
        user: r.user,
        product: r.product,
        user_name: r.user_name,
        product_name: r.product_name
    }))

    const listDeleted = reviewStore.reviewsDeleted || []
    console.log('listDeleted from store:', listDeleted.length, listDeleted)
    dataDeleted.value = listDeleted.map((r) => ({
        review_id: r.review_id,
        rating: r.rating,
        comment: r.comment,
        created_at: r.created_at || r.review_date,
        user: r.user,
        product: r.product,
        user_name: r.user_name,
        product_name: r.product_name
    }))
    console.log('dataDeleted after map:', dataDeleted.value.length, dataDeleted.value)
}

onMounted(async () => {
    await executeAsync(async () => {
        const token = authStore.accessToken || ''
        await refreshReviewsData(token)
    }, { defaultErrorMessage: 'Không thể tải danh sách đánh giá!' })
})
</script>
