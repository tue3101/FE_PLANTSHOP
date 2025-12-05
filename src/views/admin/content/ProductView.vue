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
      <AddButton @click="openAddModal" />
    </div>
    <!-- Add Product Modal -->
    <ModalCommon
      :showModal="showAddModal"
      :title="'Thêm Sản Phẩm Mới'"
      :submitLabel="'Thêm sản phẩm'"
      :fields="productFields2"
      :options="{ categories: categories }"
      :isLoading="isAdding"
      :errorMessage="addError"
      @submit="handleAddProduct"
      @cancel="closeAddModal"
      @update:showModal="showAddModal = $event"
      @clear-error="addError = ''"
    />

    <!-- Update Product Modal -->
    <ModalCommon
      :showModal="showUpdateModal"
      :title="'Cập Nhật Sản Phẩm'"
      :submitLabel="'Cập nhật sản phẩm'"
      :fields="productFields2"
      :options="{ categories: categories }"
      :isLoading="isUpdating"
      :errorMessage="updateError"
      :initialData="selectedProductForUpdate"
      @submit="handleUpdateProduct"
      @cancel="closeUpdateModal"
      @update:showModal="showUpdateModal = $event"
      @clear-error="updateError = ''"
    />

    <LoadingErrorState
      :isLoading="isLoading"
      :errorMessage="errorMessage"
      loadingMessage="Đang tải sản phẩm..."
      @reset-error="resetError"
    />

    <!-- Data Display -->
    <div v-if="!isLoading && !errorMessage">
      <h2 class="text-2xl font-bold mb-2">DANH SÁCH SẢN PHẨM</h2>
      <DataPager
        v-model="currentPageActive"
        v-model:selectedCategory="selectedCategory"
        v-model:sortOption="sortOption"
        :items="filteredActiveProducts"
        :items2="getItemsForPager"
        :page-size="PAGE_SIZE"
        :search-query="searchQuery"
        :selected-category="selectedCategory"
        :selected-active="selectedActive"
        :sort-option="sortOption"
        :show-filter="true"
        :show-category-filter="true"
        :show-sort-option="true"
        :show-active="true"
        :use-product-labels="true"
        @update:selectedActive="selectedActive = $event"
        :category-options="categories"
        :sync-route="true"
        route-query-key="category"
        controls-class="mb-2 "
      >
        <!-- nhận item từ con qua slot #default -->
        <template #default="{ items }">
          <CommonTable
            :headers="['ID', 'TÊN SẢN PHẨM', 'HÌNH ẢNH', 'KÍCH THƯỚC', 'GIÁ', 'SỐ LƯỢNG']"
            :keys="['product_id', 'product_name', 'img_url', 'size', 'price', 'quantity']"
            :data="items"
            title-class="font-bold text-2xl "
          >
            <template #cell-img_url="{ item }">
              <div class="flex items-center justify-center">
                <img
                  :src="getThumbUrl(getProductImage(item))"
                  :alt="getProductName(item)"
                  class="w-16 h-16 object-contain bg-gray-100 rounded-md hover:opacity-90 transition-opacity duration-300"
                  @error="handleImageError($event)"
                />
              </div>
            </template>
            <!--#->v-slot-->
            <template #cell-price="{ item }">
              <span class="font-semibold text-green-600">{{ formatPrice(item.price) }}</span>
            </template>
            <template #actions="{ item }">
              <ButtonCommon
                :selected-active="selectedActive"
                :item="item"
                @view="openViewDetail"
                @update="openUpdateModal"
                @restore="handleRestore"
                @delete="openDeleteConfirmModal"
              />
            </template>
          </CommonTable>
        </template>
      </DataPager>
    </div>

    <!-- View Detail Modal -->
    <ViewDetailModal
      :showModal="showViewModal"
      :title="'Chi tiết Sản Phẩm'"
      :item="selectedItem"
      :fields="productFields"
      :options="{ categories: categories }"
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
    <DeleteModal
      :showModal="showDeleteSuccessModal"
      mode="delete-success"
      @close="handleDeleteSuccessClose"
    />

    <!-- Add Success Modal -->
    <DeleteModal
      :showModal="showAddSuccessModal"
      mode="add-success"
      @close="handleAddSuccessClose"
    />

    <!-- Update Success Modal -->
    <DeleteModal
      :showModal="showUpdateSuccessModal"
      mode="update-success"
      @close="handleUpdateSuccessClose"
    />

    <!-- Restore Success Modal -->
    <DeleteModal
      :showModal="showRestoreSuccessModal"
      mode="restore-success"
      @close="handleRestoreSuccessClose"
    />
  </div>
</template>

<script setup>
import DeleteModal from "../../../components/common/admin/DeleteModal.vue"
import CommonTable from "@/components/common/admin/CommonTable.vue"
import DataPager from "@/components/common/DataPager.vue"
import AddButton from "@/components/common/admin/AddButton.vue"
import ModalCommon from "@/components/common/admin/ModalCommon.vue"
import LoadingErrorState from "@/components/common/LoadingErrorState.vue"
import ViewDetailModal from "@/components/common/admin/ViewDetailModal.vue"
import SearchCommon from "@/components/common/SearchCommon.vue"
import { ref, onMounted, computed } from "vue"
import { useAsyncOperation } from "@/composables/useAsyncOperation"
import { useProductStore } from "@/stores/products"
import { useAuthStore } from "@/stores/auth"
import ButtonCommon from "@/components/common/admin/ButtonCommon.vue"

//datapager
const searchQuery = ref("")
const sortOption = ref("")
const selectedCategory = ref("")
const selectedActive = ref("")
const PAGE_SIZE = 5
const currentPageActive = ref(1)

// Computed để filter sản phẩm đang bán (loại bỏ out_of_stock và deleted)
const filteredActiveProducts = computed(() => {
  return dataProducts.value.filter((p) => p.out_of_stock !== 1 && p.out_of_stock !== true)
})

// Computed để filter sản phẩm tạm hết hàng (out_of_stock = 1)
const outOfStockProducts = computed(() => {
  return dataProducts.value.filter((p) => p.out_of_stock === 1 || p.out_of_stock === true)
})

// Computed để trả về items2 dựa trên selectedActive
const getItemsForPager = computed(() => {
  if (selectedActive.value === "out_of_stock") {
    return outOfStockProducts.value
  }
  return dataDeactiveProduct.value
})

// Search handler
const handleSearch = () => {
  currentPageActive.value = 1
}

//store
const categories = ref([])
const productStore = useProductStore()
const authStore = useAuthStore()
const { isLoading, errorMessage, executeAsync, resetError } = useAsyncOperation()

// ============================================Add Modal=========================
const showAddModal = ref(false)
const showAddSuccessModal = ref(false)
const addError = ref("")
const { executeAsync: executeAddAsync, isLoading: isAdding } = useAsyncOperation()

const openAddModal = () => {
  showAddModal.value = true
}

const closeAddModal = () => {
  showAddModal.value = false
}

const handleAddSuccessClose = () => {
  showAddSuccessModal.value = false
}

const handleAddProduct = async (productData) => {
  addError.value = ""

  const token = authStore.accessToken
  if (!token) {
    addError.value = "Vui lòng đăng nhập lại!"
    return
  }

  // Create FormData for multipart/form-data
  const formData = new FormData()

  // Create product object to convert to JSON string
  const productObject = {
    product_name: productData.product_name,
    category_id: productData.category_id,
    price: productData.price,
    quantity: productData.quantity,
    size: productData.size || "",
    description: productData.description || "",
    out_of_stock: false,
  }

  // (Append =>thêm gtri mới vào formdata) product as JSON string
  formData.append("product", JSON.stringify(productObject))

  // Append image file
  if (productData.imageFile) {
    formData.append("image", productData.imageFile)
  }

  await executeAddAsync(
    async () => {
      await productStore.addProducts(formData)
      await refreshProductsData()
      closeAddModal()
      addError.value = ""
      showAddSuccessModal.value = true
    },
    {
      defaultErrorMessage: "Không thể thêm sản phẩm!",
      onError: (error) => {
        addError.value = error.response?.data?.message
      },
    }
  )
}

// =========================================Update Modal====================================
const showUpdateModal = ref(false)
const showUpdateSuccessModal = ref(false)
const updateError = ref("")
const selectedProductForUpdate = ref(null)
const { executeAsync: executeUpdateAsync, isLoading: isUpdating } = useAsyncOperation()

const openUpdateModal = (item) => {
  selectedProductForUpdate.value = { ...item }
  showUpdateModal.value = true
  updateError.value = ""
}

const closeUpdateModal = () => {
  showUpdateModal.value = false
  selectedProductForUpdate.value = null
  updateError.value = ""
}

const handleUpdateSuccessClose = () => {
  showUpdateSuccessModal.value = false
}

const handleUpdateProduct = async (productData) => {
  updateError.value = ""
  const token = authStore.accessToken
  if (!token) {
    updateError.value = "Vui lòng đăng nhập lại!"
    return
  }

  if (!selectedProductForUpdate.value?.product_id) {
    updateError.value = "Không tìm thấy sản phẩm!"
    return
  }

  const formData = new FormData()
  const productObject = {
    product_name: productData.product_name,
    category_id: productData.category_id,
    price: productData.price,
    quantity: productData.quantity,
    size: productData.size || "",
    description: productData.description || "",
    out_of_stock: false,
  }

  formData.append("product", JSON.stringify(productObject))
  if (productData.imageFile) {
    formData.append("image", productData.imageFile)
  }

  await executeUpdateAsync(
    async () => {
      await productStore.updateProductStore(selectedProductForUpdate.value.product_id, formData)
      await refreshProductsData()
      closeUpdateModal()
      updateError.value = ""
      showUpdateSuccessModal.value = true
    },
    {
      defaultErrorMessage: "Không thể cập nhật sản phẩm!",
      onError: (error) => {
        updateError.value = error.response?.data?.message
      },
    }
  )
}
//=================================deleted==========================
const showDeleteConfirmModal = ref(false)
const showDeleteSuccessModal = ref(false)
const selectedProductId = ref(null)

function openDeleteConfirmModal(item) {
  selectedProductId.value = item.product_id
  showDeleteConfirmModal.value = true
}
function handleDeleteCancel() {
  showDeleteConfirmModal.value = false
  selectedProductId.value = null
}

function handleDeleteSuccessClose() {
  showDeleteSuccessModal.value = false
  selectedProductId.value = null
}

async function handleDeleteConfirm() {
  const productId = selectedProductId.value
  const token = authStore.accessToken

  if (!token) {
    alert("Vui lòng đăng nhập lại!")
    showDeleteConfirmModal.value = false
    return
  }

  if (!productId) {
    alert("Không tìm thấy sản phẩm cần xóa!")
    showDeleteConfirmModal.value = false
    return
  }

  await executeAsync(
    async () => {
      await productStore.deleteProduct(productId)
      await refreshProductsData()
      showDeleteConfirmModal.value = false
      showDeleteSuccessModal.value = true
    },
    {
      defaultErrorMessage: "Không thể xóa sản phẩm!",
    }
  )
}
//====================================restore======================================
const showRestoreSuccessModal = ref(false)

const handleRestoreSuccessClose = () => {
  showRestoreSuccessModal.value = false
}

async function handleRestore(item) {
  const productId = item.product_id
  const token = authStore.accessToken || ""

  await executeAsync(
    async () => {
      await productStore.restoreProductStore(productId)
      await refreshProductsData()
      showRestoreSuccessModal.value = true
    },
    {
      defaultErrorMessage: "Không thể khôi phục sản phẩm!",
      onError: (error) => {
        const errorMessage = error.response?.data?.message
        console.error("Restore error:", errorMessage || error)
      },
    }
  )
}

//==================================== View Detail Modal===========================
const showViewModal = ref(false)
const selectedItem = ref(null)
const openViewDetail = (item) => {
  selectedItem.value = item
  showViewModal.value = true
}

const closeViewModal = () => {
  showViewModal.value = false
  selectedItem.value = null
}

// =======================================field ===================================
const productFields = computed(() => [
  { key: "product_id", label: "ID", type: "text" },
  {
    key: "product_name",
    label: "Tên sản phẩm",
    type: "text",
    required: true,
    placeholder: "Nhập tên sản phẩm",
  },
  {
    key: "category_id",
    label: "Danh mục",
    type: "select",
    required: true,
    optionsKey: "categories",
    optionValue: "category_id",
    optionLabel: "category_name",
  },
  {
    key: "price",
    label: "Giá",
    type: "text",
    format: "price",
    required: true,
    placeholder: "Nhập giá sản phẩm",
  },
  {
    key: "quantity",
    label: "Số lượng",
    type: "number",
    required: true,
    min: 0,
    placeholder: "Nhập số lượng",
  },
  { key: "size", label: "Kích thước", type: "text", required: true, placeholder: "0cmx0cm" },
  {
    key: "description",
    label: "Mô tả",
    type: "textarea",
    required: false,
    placeholder: "Nhập mô tả sản phẩm",
  },
  { key: "img_url", label: "Hình ảnh sản phẩm", type: "image", required: true },
])

// Fields cho update/add modal
const productFields2 = computed(() => {
  return productFields.value.filter((field) => field.key !== "product_id")
})

// Lấy tên sản phẩm
const getProductName = (product) => {
  return product?.product_name || "Không có tên"
}

// Lấy hình ảnh sản phẩm từ Cloudinary
const getProductImage = (product) => {
  const imageUrl = product?.img_url
  if (!imageUrl || String(imageUrl).trim() === "") {
    return "/img/footer.png"
  }
  return imageUrl
}

// Xử lý lỗi khi load hình ảnh
const handleImageError = (event) => {
  if (!event.target.src.includes("footer.png")) {
    event.target.src = "/img/footer.png"
  }
}

// Tạo URL thumbnail Cloudinary để ảnh nhẹ và nhỏ gọn
// c_fill: cắt ảnh sao cho vừa khung (crop fill)
// f_auto: tự chọn định dạng tốt nhất (WebP, JPEG,...)
// q_auto: tự điều chỉnh chất lượng tối ưu
// w_96,h_96: chiều rộng và cao = 96px
function getThumbUrl(url) {
  if (!url) return "/img/footer.png"
  try {
    const s = String(url)
    if (s.includes("res.cloudinary.com") && s.includes("/upload/")) {
      return s.replace("/upload/", "/upload/c_fill,f_auto,q_auto,w_96,h_96/")
    }
    return s
  } catch {
    return "/img/footer.png"
  }
}

// Format giá tiền theo định dạng Việt Nam Đồng
function formatPrice(price) {
  if (price == null || price === undefined || price === "") {
    return "0 VND"
  }
  const numPrice = Number(price)
  if (isNaN(numPrice)) {
    return "0 VND"
  }
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(numPrice)
}

//=====================================khởi tạo gọi api=================================

const dataProducts = ref([])
const dataDeactiveProduct = ref([])

const refreshProductsData = async () => {
  await productStore.getProducts()

  try {
    await productStore.getAllProductsDeleted()
  } catch (error) {
    console.error("Error loading deleted products:", error)
    if (error.response?.status === 400 || error.response?.status === 401) {
      productStore.allProductDeleted = []
    }
  }

  const list = productStore.products || []
  dataProducts.value = list.map((p) => ({
    product_id: p.product_id,
    product_name: p.product_name,
    img_url: p.img_url,
    category_id: p.category_id,
    description: p.description,
    size: p.size,
    price: p.price,
    quantity: p.quantity,
    out_of_stock: p.out_of_stock || false,
  }))

  const listDeactive = productStore.allProductDeleted || []
  dataDeactiveProduct.value = listDeactive.map((p) => ({
    product_id: p.product_id,
    product_name: p.product_name,
    img_url: p.img_url,
    category_id: p.category_id,
    description: p.description,
    size: p.size,
    price: p.price,
    quantity: p.quantity,
  }))
}

onMounted(async () => {
  await executeAsync(
    async () => {
      await productStore.getCategories()
      await refreshProductsData()
      categories.value = productStore.categories || []
    },
    {
      defaultErrorMessage: "Không thể tải danh sách sản phẩm!",
    }
  )
})
</script>
