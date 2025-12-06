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
      <AddButton @click="openAddModal" title="Thêm mã giảm giá mới" />
    </div>

    <LoadingErrorState
      :isLoading="isLoading"
      :errorMessage="errorMessage"
      loadingMessage="Đang tải mã giảm giá..."
      @reset-error="resetError"
    />

    <!-- Data Display -->
    <div v-if="!isLoading && !errorMessage">
      <h2 class="text-2xl font-bold mb-2">DANH SÁCH KHUYẾN MÃI</h2>
      <DataPager
        v-model="currentPageActive"
        :items="filteredDiscounts"
        :page-size="PAGE_SIZE"
        :show-active="true"
        :show-filter="true"
        controls-class="mb2"
        @update:selectedActive="selectedActive = $event"
      >
        <template #default="{ items }">
          <CommonTable
            :headers="['ID', 'CODE', 'TÊN MÃ', 'GIÁ TRỊ', 'LOẠI', 'SỐ LƯỢNG']"
            :keys="['discount_id', 'discount_code', 'discount_name', 'value', 'type', 'quantity']"
            :data="items"
            title-class="font-bold text-2xl"
          >
            <template #cell-value="{ item }">
              <span
                class="font-semibold"
                :class="item.type === 'PERCENT' ? 'text-blue-600' : 'text-green-600'"
              >
                {{ formatDiscountValue(item.value, item.type) }}
              </span>
            </template>
            <template #actions="{ item }">
              <ButtonCommon
                :selected-active="selectedActive"
                :item="item"
                @view="handleViewDetail"
                @update="handleUpdate"
                @restore="handleRestore"
                @delete="openDeleteConfirmModal"
              />
            </template>
          </CommonTable>
        </template>
      </DataPager>
    </div>

    <!-- Add Discount Modal -->
    <ModalCommon
      :showModal="showAddModal"
      :title="'Thêm Mã Giảm Giá Mới'"
      :submitLabel="'Thêm mã giảm giá'"
      :fields="discountFields2"
      :options="{ types: typeOptions }"
      :isLoading="isAdding"
      :errorMessage="addError"
      @submit="handleAddDiscount"
      @cancel="closeAddModal"
      @update:showModal="showAddModal = $event"
      @clear-error="addError = ''"
    />

    <!-- Update Discount Modal -->
    <ModalCommon
      :showModal="showUpdateModal"
      :title="'Cập Nhật Mã Giảm Giá'"
      :submitLabel="'Cập nhật mã giảm giá'"
      :fields="discountFields2"
      :options="{ types: typeOptions }"
      :isLoading="isUpdating"
      :errorMessage="updateError"
      :initialData="selectedDiscountForUpdate"
      @submit="handleUpdateDiscount"
      @cancel="closeUpdateModal"
      @update:showModal="showUpdateModal = $event"
      @clear-error="updateError = ''"
    />

    <!-- View Detail Modal -->
    <ViewDetailModal
      :showModal="showViewModal"
      :title="'Chi tiết Mã Giảm Giá'"
      :item="selectedItem"
      :fields="discountFields"
      :options="{ types: typeOptions }"
      @close="closeViewModal"
      @update:showModal="showViewModal = $event"
    />

    <!-- Delete Modals -->
    <DeleteModal
      :showModal="showDeleteConfirmModal"
      mode="confirm"
      @confirm="handleDeleteConfirm"
      @cancel="handleDeleteCancel"
    />
  </div>
</template>

<script setup>
import DeleteModal from "../../../components/common/admin/DeleteModal.vue"
import CommonTable from "@/components/common/admin/CommonTable.vue"
import DataPager from "@/components/common/DataPager.vue"
import AddButton from "@/components/common/admin/AddButton.vue"
import ModalCommon from "@/components/common/admin/ModalCommon.vue"
import ButtonCommon from "@/components/common/admin/ButtonCommon.vue"
import LoadingErrorState from "@/components/common/LoadingErrorState.vue"
import ViewDetailModal from "@/components/common/admin/ViewDetailModal.vue"
import SearchCommon from "@/components/common/SearchCommon.vue"
import { useDiscountStore } from "@/stores/discounts"
import { useAuthStore } from "@/stores/auth"

import { ref, onMounted, computed } from "vue"
import { useAsyncOperation } from "@/composables/useAsyncOperation"
import { toastSuccess, toastError } from "@/utils/toast"

//dataPager
const PAGE_SIZE = 5
const currentPageActive = ref(1)
const activeDiscounts = ref([])
const deactiveDiscounts = ref([])
const selectedActive = ref("")
const searchQuery = ref("")

// Computed để filter discounts theo search query
const filteredDiscounts = computed(() => {
  let discounts = activeDiscounts.value
  if (selectedActive.value === "deactive") {
    discounts = deactiveDiscounts.value
  }

  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim()
    discounts = discounts.filter((discount) => {
      const discountId = String(discount.discount_id || "").toLowerCase()
      const discountCode = (discount.discount_code || "").toLowerCase()
      const discountName = (discount.discount_name || "").toLowerCase()
      return (
        discountId.includes(query) || discountCode.includes(query) || discountName.includes(query)
      )
    })
  }

  return discounts
})

// Search handler
const handleSearch = () => {
  currentPageActive.value = 1
}

const discountStore = useDiscountStore()
const authStore = useAuthStore()
const { isLoading, errorMessage, executeAsync, resetError } = useAsyncOperation()

// ===========================Add Modal==========================
const showAddModal = ref(false)
const showAddSuccessModal = ref(false)
const addError = ref("")
const { executeAsync: executeAddAsync, isLoading: isAdding } = useAsyncOperation()

const openAddModal = () => {
  showAddModal.value = true
  addError.value = ""
}

const closeAddModal = () => {
  showAddModal.value = false
  addError.value = ""
}

const handleAddSuccessClose = () => {
  showAddSuccessModal.value = false
}

const handleAddDiscount = async (discountData) => {
  addError.value = ""

  const token = authStore.accessToken || localStorage.getItem("accessToken")
  if (!token) {
    addError.value = "Vui lòng đăng nhập lại!"
    return
  }
  // Validate type field
  if (!discountData.type || !["PERCENT", "CASH"].includes(discountData.type)) {
    addError.value = "Vui lòng chọn loại mã giảm giá!"
    return
  }

  await executeAddAsync(
    async () => {
      // Ensure type is properly set
      const dataToSubmit = {
        ...discountData,
        type: discountData.type,
      }
      await discountStore.addDiscounts(dataToSubmit)
      await refreshDiscountsData()
      closeAddModal()
      addError.value = "" // Reset error khi thành công
      toastSuccess("Thêm mã giảm giá thành công!")
      showAddSuccessModal.value = true
    },
    {
      defaultErrorMessage: "Không thể thêm mã giảm giá!",
      onError: (error) => {
        addError.value = error.response?.data?.message
      },
    }
  )
}
// ===========================Update Modal==========================
const showUpdateModal = ref(false)
const showUpdateSuccessModal = ref(false)
const updateError = ref("")
const selectedDiscountForUpdate = ref(null)
const { executeAsync: executeUpdateAsync, isLoading: isUpdating } = useAsyncOperation()

const handleUpdate = (item) => {
  selectedDiscountForUpdate.value = { ...item }
  showUpdateModal.value = true
  updateError.value = ""
}

const closeUpdateModal = () => {
  showUpdateModal.value = false
  selectedDiscountForUpdate.value = null
  updateError.value = ""
}

const handleUpdateSuccessClose = () => {
  showUpdateSuccessModal.value = false
}
const handleUpdateDiscount = async (discountData) => {
  updateError.value = ""
  const token = authStore.accessToken || localStorage.getItem("accessToken")
  if (!token) {
    updateError.value = "Vui lòng đăng nhập lại!"
    return
  }

  if (!selectedDiscountForUpdate.value?.discount_id) {
    updateError.value = "Không tìm thấy mã giảm giá!"
    return
  }

  if (!discountData.type || !["PERCENT", "CASH"].includes(discountData.type)) {
    updateError.value = "Vui lòng chọn loại mã giảm giá!"
    return
  }

  await executeUpdateAsync(
    async () => {
      const dataToSubmit = {
        ...discountData,
        type: discountData.type,
      }
      await discountStore.updateDiscountStore(
        selectedDiscountForUpdate.value.discount_id,
        dataToSubmit
      )
      await refreshDiscountsData()
      closeUpdateModal()
      updateError.value = ""
      toastSuccess("Cập nhật mã giảm giá thành công!")
      showUpdateSuccessModal.value = true
    },
    {
      defaultErrorMessage: "Không thể cập nhật mã giảm giá!",
      onError: (error) => {
        updateError.value = error.response?.data?.message
        toastError(error.response?.data?.message || "Không thể cập nhật mã giảm giá!")
      },
    }
  )
}
// ===========================Delete Modal==========================
const showDeleteConfirmModal = ref(false)
const showDeleteSuccessModal = ref(false)
const selectedDiscountId = ref(null)

function openDeleteConfirmModal(item) {
  selectedDiscountId.value = item.discount_id
  showDeleteConfirmModal.value = true
}
function handleDeleteCancel() {
  showDeleteConfirmModal.value = false
  selectedDiscountId.value = null
}

function handleDeleteSuccessClose() {
  showDeleteSuccessModal.value = false
  selectedDiscountId.value = null
}

async function handleDeleteConfirm() {
  const discountId = selectedDiscountId.value
  const token = authStore.accessToken

  if (!token) {
    alert("Vui lòng đăng nhập lại!")
    showDeleteConfirmModal.value = false
    return
  }

  if (!discountId) {
    alert("Không tìm thấy mã giảm giá cần xóa!")
    showDeleteConfirmModal.value = false
    return
  }

  await executeAsync(
    async () => {
      await discountStore.deleteDiscount(discountId)
      await refreshDiscountsData()
      showDeleteConfirmModal.value = false
      toastSuccess("Xóa mã giảm giá thành công!")
      showDeleteSuccessModal.value = true
    },
    {
      defaultErrorMessage: "Không thể xóa mã giảm giá!",
      onError: (error) => {
        const errorMessage = error.response?.data?.message
        toastError(errorMessage || "Không thể xóa mã giảm giá!")
        showDeleteConfirmModal.value = false
      },
    }
  )
}
//====================================restore======================================
const showRestoreSuccessModal = ref(false)

const handleRestoreSuccessClose = () => {
  showRestoreSuccessModal.value = false
}

async function handleRestore(item) {
  const discountId = item.discount_id
  const token = authStore.accessToken || ""

  if (!token) {
    alert("Vui lòng đăng nhập lại!")
    return
  }

  if (!discountId) {
    alert("Không tìm thấy mã giảm giá cần khôi phục!")
    return
  }

  await executeAsync(
    async () => {
      await discountStore.restoreDiscountStore(discountId)
      await refreshDiscountsData()
      toastSuccess("Khôi phục mã giảm giá thành công!")
      showRestoreSuccessModal.value = true
    },
    {
      defaultErrorMessage: "Không thể khôi phục mã giảm giá!",
      onError: (error) => {
        const errorMessage = error.response?.data?.message
        toastError(errorMessage || "Không thể khôi phục mã giảm giá!")
        console.error("Restore error:", errorMessage || error)
      },
    }
  )
}
// ===========================View Detail Modal==========================
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
// ===========================Type Options==========================
const typeOptions = ref([
  { value: "PERCENT", label: "PERCENT" },
  { value: "CASH", label: "CASH" },
])

// ===========================Discount Fields==========================
const discountFields = computed(() => [
  { key: "discount_id", label: "ID", type: "text" },
  {
    key: "discount_code",
    label: "Mã giảm giá",
    type: "text",
    required: true,
    placeholder: "Nhập mã giảm giá",
  },
  {
    key: "discount_name",
    label: "Tên mã",
    type: "text",
    required: true,
    placeholder: "Nhập tên mã",
  },
  {
    key: "value",
    label: "Giá trị",
    type: "number",
    required: true,
    min: 0,
    placeholder: "Nhập giá trị",
  },
  {
    key: "type",
    label: "Loại",
    type: "select",
    required: true,
    placeholder: "Chọn loại mã giảm giá",
    optionsKey: "types",
    optionValue: "value",
    optionLabel: "label",
  },
  {
    key: "quantity",
    label: "Số lượng",
    type: "number",
    required: true,
    min: 0,
    placeholder: "Nhập số lượng",
  },
])
const discountFields2 = computed(() => {
  return discountFields.value.filter((field) => field.key !== "discount_id")
})

// ===========================Khởi tạo gọi api==========================
const refreshDiscountsData = async () => {
  await discountStore.getAllDiscounts()

  try {
    await discountStore.getAllDiscountsDeleted()
  } catch (error) {
    console.error("Error loading deleted discounts:", error)
  }

  const list = discountStore.discounts || []
  activeDiscounts.value = list.map((c) => ({
    discount_id: c.discount_id,
    discount_code: c.discount_code,
    discount_name: c.discount_name,
    value: c.value,
    type: c.type,
    quantity: c.quantity,
  }))

  const listDeactive = discountStore.allDeleted || []
  deactiveDiscounts.value = listDeactive.map((c) => ({
    discount_id: c.discount_id,
    discount_code: c.discount_code,
    discount_name: c.discount_name,
    value: c.value,
    type: c.type,
    quantity: c.quantity,
  }))
}

onMounted(async () => {
  await executeAsync(
    async () => {
      await refreshDiscountsData()
    },
    { defaultErrorMessage: "Không thể tải danh sách mã giảm giá!" }
  )
})

// ===========================Format giá trị giảm giá dựa trên loại==========================
function formatDiscountValue(value, type) {
  if (value == null || value === undefined || value === "") {
    return type === "PERCENT" ? "0%" : "0 VND"
  }
  const numValue = Number(value)
  //isNaN -> ko phải số
  if (isNaN(numValue)) {
    return type === "PERCENT" ? "0%" : "0 VND"
  }

  if (type === "PERCENT") {
    return `${numValue}%`
  } else if (type === "CASH") {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(numValue)
  }
  return numValue
}
</script>
