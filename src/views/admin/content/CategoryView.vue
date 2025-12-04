<template>
    <div class="p-8">
        <div class="flex items-center justify-between mb-4">
            <div class="flex-1 flex justify-center">
                <div class="relative w-[350px]">
                    <SearchCommon v-model="searchQuery" mode="admin" placeholder="Nhập từ khóa tìm kiếm"
                        :use-header-style="true" @search="handleSearch" />
                </div>
            </div>
            <AddButton @click="openAddModal" title="Thêm danh mục mới" />
        </div>

        <LoadingErrorState :isLoading="isLoading" :errorMessage="errorMessage" loadingMessage="Đang tải danh mục..."
            @reset-error="resetError" />

        <!-- Data Display -->
        <div v-if="!isLoading && !errorMessage">
            <h2 class="text-2xl font-bold mb-2">DANH SÁCH DANH MỤC</h2>
            <DataPager v-model="currentPageActive" :show-filter="true" :show-active="true"
                :selected-active="selectedActive" :items="filteredCategories" :items2="filteredCategoriesDeleted"
                :page-size="PAGE_SIZE" controls-class="mb-2" @update:selectedActive="selectedActive = $event">
                <template #default="{ items }">
                    <CommonTable :headers="['ID', 'TÊN DANH MỤC']" :keys="['category_id', 'category_name']"
                        :data="items" title-class="font-bold text-2xl">
                        <template #actions="{ item }">
                            <ButtonCommon :selected-active="selectedActive" :item="item" @view="handleViewDetail"
                                @update="handleUpdate" @restore="handleRestore" @delete="openDeleteConfirmModal" />
                        </template>
                    </CommonTable>
                </template>
            </DataPager>
        </div>

        <!-- Add Category Modal -->
        <ModalCommon :showModal="showAddModal" :title="'Thêm Danh Mục Mới'" :submitLabel="'Thêm danh mục'"
            :fields="categoryFields2" :isLoading="isAdding" :errorMessage="addError" @submit="handleAddCategory"
            @cancel="closeAddModal" @update:visible="showAddModal = $event" @clear-error="addError = ''" />

        <!-- Update Category Modal -->
        <ModalCommon :showModal="showUpdateModal" :title="'Cập Nhật Danh Mục'" :submitLabel="'Cập nhật danh mục'"
            :fields="categoryFields2" :isLoading="isUpdating" :errorMessage="updateError"
            :initialData="selectedCategoryForUpdate" @submit="handleUpdateCategory" @cancel="closeUpdateModal"
            @update:visible="showUpdateModal = $event" @clear-error="updateError = ''" />

        <!-- View Detail Modal -->
        <ViewDetailModal :showModal="showViewModal" :title="'Chi tiết Danh Mục'" :item="selectedItem"
            :fields="categoryFields" @close="closeViewModal" @update:showModal="showViewModal = $event" />

        <!-- Delete Modals -->
        <DeleteModal :showModal="showDeleteConfirmModal" mode="confirm" @confirm="handleDeleteConfirm"
            @cancel="handleDeleteCancel" />
        <DeleteModal :showModal="showDeleteSuccessModal" mode="delete-success" @close="handleDeleteSuccessClose" />

        <!-- Add Success Modal -->
        <DeleteModal :showModal="showAddSuccessModal" mode="add-success" @close="handleAddSuccessClose" />

        <!-- Update Success Modal -->
        <DeleteModal :showModal="showUpdateSuccessModal" mode="update-success" @close="handleUpdateSuccessClose" />

        <!-- Restore Success Modal -->
        <DeleteModal :showModal="showRestoreSuccessModal" mode="restore-success" @close="handleRestoreSuccessClose" />
    </div>
</template>

<script setup>
import DeleteModal from '../../../components/common/admin/DeleteModal.vue'
import CommonTable from '@/components/common/admin/CommonTable.vue'
import DataPager from '@/components/common/DataPager.vue'
import AddButton from '@/components/common/admin/AddButton.vue'
import ModalCommon from '@/components/common/admin/ModalCommon.vue'
import ButtonCommon from '@/components/common/admin/ButtonCommon.vue'
import LoadingErrorState from '@/components/common/LoadingErrorState.vue'
import ViewDetailModal from '@/components/common/admin/ViewDetailModal.vue'
import SearchCommon from '@/components/common/SearchCommon.vue'
import { ref, onMounted, computed } from 'vue'
import { useAsyncOperation } from '@/composables/useAsyncOperation'
import { useProductStore } from '@/stores/products'
import { useAuthStore } from '@/stores/auth'



//dataPager
const PAGE_SIZE = 5
const currentPageActive = ref(1)
const selectedActive = ref('')
const selectedCategoryId = ref(null)
const dataCategories = ref([])
const dataDeactive = ref([])
const searchQuery = ref('')

// Computed để filter categories theo search query
const filteredCategories = computed(() => {
    let categories = dataCategories.value
    if (searchQuery.value.trim()) {
        const query = searchQuery.value.toLowerCase().trim()
        categories = categories.filter(category => {
            const categoryId = String(category.category_id || '').toLowerCase()
            const categoryName = (category.category_name || '').toLowerCase()
            return categoryId.includes(query) || categoryName.includes(query)
        })
    }

    return categories
})
const filteredCategoriesDeleted = computed(() => {
    let categories = dataDeactive.value

    if (searchQuery.value.trim()) {
        const query = searchQuery.value.toLowerCase().trim()
        categories = categories.filter(category => {
            const categoryId = String(category.category_id || '').toLowerCase()
            const categoryName = (category.category_name || '').toLowerCase()
            return categoryId.includes(query) || categoryName.includes(query)
        })
    }

    return categories
})
// Search handler
const handleSearch = () => {
    currentPageActive.value = 1
}


const productStore = useProductStore()
const authStore = useAuthStore()
const { isLoading, errorMessage, executeAsync, resetError } = useAsyncOperation()

// ===================================Add Modal=====================
const showAddModal = ref(false)
const showAddSuccessModal = ref(false)
const addError = ref('')
const { executeAsync: executeAddAsync, isLoading: isAdding } = useAsyncOperation()

const openAddModal = () => {
    showAddModal.value = true
    addError.value = ''
}

const closeAddModal = () => {
    showAddModal.value = false
    addError.value = ''
}

const handleAddSuccessClose = () => {
    showAddSuccessModal.value = false
}

const handleAddCategory = async (categoryData) => {
    addError.value = ''

    const token = authStore.accessToken || localStorage.getItem('accessToken')
    if (!token) {
        addError.value = 'Vui lòng đăng nhập lại!'
        return
    }

    await executeAddAsync(async () => {
        console.log('Category data to send:', categoryData)
        await productStore.addCategories(token, categoryData)
        await refreshCategoriesData(token)
        closeAddModal()
        addError.value = '' // Reset error khi thành công
        showAddSuccessModal.value = true
    }, {
        defaultErrorMessage: 'Không thể thêm danh mục!',
        onError: (error) => {
            addError.value = error.response?.data?.message
        }
    })
}
// ====================================Update Modal==================
const showUpdateModal = ref(false)
const showUpdateSuccessModal = ref(false)
const updateError = ref('')
const selectedCategoryForUpdate = ref(null)
const { executeAsync: executeUpdateAsync, isLoading: isUpdating } = useAsyncOperation()

const handleUpdate = (item) => {
    selectedCategoryForUpdate.value = { ...item }
    showUpdateModal.value = true
    updateError.value = ''
}

const closeUpdateModal = () => {
    showUpdateModal.value = false
    selectedCategoryForUpdate.value = null
    updateError.value = ''
}

const handleUpdateSuccessClose = () => {
    showUpdateSuccessModal.value = false
}

const handleUpdateCategory = async (categoryData) => {
    updateError.value = ''
    const token = authStore.accessToken || localStorage.getItem('accessToken')
    if (!token) {
        updateError.value = 'Vui lòng đăng nhập lại!'
        return
    }

    if (!selectedCategoryForUpdate.value?.category_id) {
        updateError.value = 'Không tìm thấy danh mục!'
        return
    }

    await executeUpdateAsync(async () => {
        await productStore.updateCategoryStore(token, selectedCategoryForUpdate.value.category_id, categoryData)
        await refreshCategoriesData(token)
        closeUpdateModal()
        updateError.value = ''
        showUpdateSuccessModal.value = true
    }, {
        defaultErrorMessage: 'Không thể cập nhật danh mục!',
        onError: (error) => {
            updateError.value = error.response?.data?.message
        }
    })
}
// ================================View Detail Modal======================
const showViewModal = ref(false)
const selectedItem = ref(null)

const handleViewDetail = (item) => {
    selectedItem.value = item
    showViewModal.value = true
}

const closeViewModal = () => {
    showViewModal.value = false
    selectedItem.value = null
}
//================================delete================================
const showDeleteConfirmModal = ref(false)
const showDeleteSuccessModal = ref(false)

function openDeleteConfirmModal(item) {
    selectedCategoryId.value = item.category_id
    showDeleteConfirmModal.value = true
}

function handleDeleteCancel() {
    showDeleteConfirmModal.value = false
    selectedCategoryId.value = null
}

function handleDeleteSuccessClose() {
    showDeleteSuccessModal.value = false
    selectedCategoryId.value = null
}
async function handleDeleteConfirm() {
    const categoryId = selectedCategoryId.value
    const token = authStore.accessToken

    if (!token) {
        alert('Vui lòng đăng nhập lại!')
        showDeleteConfirmModal.value = false
        return
    }

    if (!categoryId) {
        alert('Không tìm thấy danh mục cần xóa!')
        showDeleteConfirmModal.value = false
        return
    }

    await executeAsync(async () => {
        await productStore.deleteCategory(categoryId, token)
        await refreshCategoriesData(token)
        showDeleteConfirmModal.value = false
        showDeleteSuccessModal.value = true
    }, {
        defaultErrorMessage: 'Không thể xóa danh mục!',
        onError: (error) => {
            error.response?.data?.message
            showDeleteConfirmModal.value = false
        }
    })
}
//================================restore================================
const showRestoreSuccessModal = ref(false)

const handleRestoreSuccessClose = () => {
    showRestoreSuccessModal.value = false
}

async function handleRestore(item) {
    const categoryId = item.category_id
    const token = authStore.accessToken || ''

    if (!token) {
        alert('Vui lòng đăng nhập lại!')
        return
    }

    await executeAsync(async () => {
        await productStore.restoreCategoryStore(categoryId, token)
        await refreshCategoriesData(token)
        showRestoreSuccessModal.value = true
    }, {
        defaultErrorMessage: 'Không thể khôi phục danh mục!',
        onError: (error) => {
            const errorMessage = error.response?.data?.message
            console.error('Restore error:', errorMessage || error)
        }
    })
}
// ===================================Category fields =======================================
const categoryFields = computed(() => [
    { key: 'category_id', label: 'ID', type: 'text' },
    { key: 'category_name', label: 'Tên danh mục', type: 'text', required: true, placeholder: 'Nhập tên danh mục' }
])

// Fields cho update modal (loại bỏ category_id)
const categoryFields2 = computed(() => {
    return categoryFields.value.filter(field => field.key !== 'category_id')
})


// =====================================khởi tạo gọi api======================================
const refreshCategoriesData = async (token) => {
    await productStore.getCategories()

    try {
        await productStore.getAllCategoriesDeleted(token)
    } catch (error) {
        console.error('Error loading deleted categories:', error)
    }

    const list = productStore.categories || []
    dataCategories.value = list.map((c) => ({
        category_id: c.category_id,
        category_name: c.category_name
    }))

    const listDeactive = productStore.allCategoryDeleted || []
    dataDeactive.value = listDeactive.map((c) => ({
        category_id: c.category_id,
        category_name: c.category_name
    }))
}


onMounted(async () => {
    await executeAsync(async () => {
        const token = authStore.accessToken || ''
        await refreshCategoriesData(token)
    }, { defaultErrorMessage: 'Không thể tải danh mục!' })
})




</script>
