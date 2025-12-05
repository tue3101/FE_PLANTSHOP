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
      <AddButton @click="openAddModal" title="Thêm người dùng mới" />
    </div>

    <LoadingErrorState
      :isLoading="isLoading"
      :errorMessage="errorMessage"
      loadingMessage="Đang tải danh sách người dùng..."
      @reset-error="resetError"
    />

    <!-- Data Display -->
    <div v-if="!isLoading && !errorMessage">
      <h2 class="text-2xl font-bold mb-2">DANH SÁCH NGƯỜI DÙNG</h2>

      <DataPager
        v-model="currentPageActive"
        :items="filteredUsers"
        :items2="filteredDeactiveUsers"
        :selected-active="selectedActive"
        :show-filter="true"
        :show-active="true"
        :page-size="PAGE_SIZE"
        controls-class="mb-2"
        @update:selectedActive="selectedActive = $event"
      >
        <template #default="{ items }">
          <CommonTable
            :headers="['ID', 'EMAIL', 'TÊN NGƯỜI DÙNG', 'SĐT', 'VAI TRÒ']"
            :keys="['user_id', 'email', 'username', 'phone_number', 'role']"
            :data="items"
            title-class="font-bold text-2xl "
          >
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

    <!-- Add User Modal -->
    <ModalCommon
      :showModal="showAddModal"
      :title="'Thêm Người Dùng Mới'"
      :submitLabel="'Thêm người dùng'"
      :fields="addUserFields"
      :options="{ roles: roleOptions }"
      :isLoading="isAdding"
      :errorMessage="addError"
      @submit="handleAddUser"
      @cancel="closeAddModal"
      @update:showModal="showAddModal = $event"
      @clear-error="addError = ''"
    />

    <!-- Update User Modal -->
    <ModalCommon
      :showModal="showUpdateModal"
      :title="'Cập Nhật Người Dùng'"
      :submitLabel="'Cập nhật người dùng'"
      :fields="updateUserFields"
      :options="{ roles: roleOptions }"
      :isLoading="isUpdating"
      :errorMessage="updateError"
      :initialData="selectedUserForUpdate"
      @submit="handleUpdateUser"
      @cancel="closeUpdateModal"
      @update:showModal="showUpdateModal = $event"
      @clear-error="updateError = ''"
    />

    <!-- View Detail Modal -->
    <ViewDetailModal
      :showModal="showViewModal"
      :title="'Chi tiết Người Dùng'"
      :item="selectedItem"
      :fields="userFields"
      :options="{ roles: roleOptions }"
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
import ButtonCommon from "@/components/common/admin/ButtonCommon.vue"
import LoadingErrorState from "@/components/common/LoadingErrorState.vue"
import ViewDetailModal from "@/components/common/admin/ViewDetailModal.vue"
import SearchCommon from "@/components/common/SearchCommon.vue"
import { ref, onMounted, computed } from "vue"
import { useRouter } from "vue-router"
import { useAsyncOperation } from "@/composables/useAsyncOperation"
import { useUserStore } from "@/stores/user"
import { useAuthStore } from "@/stores/auth"

//dataPager
const PAGE_SIZE = 5
const currentPageActive = ref(1)
const dataUsers = ref([])
const dataDeactiveUser = ref([])
const selectedActive = ref("")
const searchQuery = ref("")

// Computed để filter users theo search query (active)
const filteredUsers = computed(() => {
  let users = dataUsers.value

  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim()
    users = users.filter((user) => {
      const userId = String(user.user_id || "").toLowerCase()
      const email = (user.email || "").toLowerCase()
      const username = (user.username || "").toLowerCase()
      const phone = (user.phone_number || "").toLowerCase()
      return (
        userId.includes(query) ||
        email.includes(query) ||
        username.includes(query) ||
        phone.includes(query)
      )
    })
  }

  return users
})

// Computed để filter users theo search query (deactive)
const filteredDeactiveUsers = computed(() => {
  let users = dataDeactiveUser.value

  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim()
    users = users.filter((user) => {
      const userId = String(user.user_id || "").toLowerCase()
      const email = (user.email || "").toLowerCase()
      const username = (user.username || "").toLowerCase()
      const phone = (user.phone_number || "").toLowerCase()
      return (
        userId.includes(query) ||
        email.includes(query) ||
        username.includes(query) ||
        phone.includes(query)
      )
    })
  }

  return users
})

// Search handler
const handleSearch = () => {
  currentPageActive.value = 1
}

const userStore = useUserStore()
const authStore = useAuthStore()
const { isLoading, errorMessage, executeAsync, resetError } = useAsyncOperation()

// ===========================Add Modal==========================
const showAddModal = ref(false)
const addError = ref("")
const { executeAsync: executeAddAsync, isLoading: isAdding } = useAsyncOperation()
const router = useRouter()

const openAddModal = () => {
  showAddModal.value = true
  addError.value = ""
}

const closeAddModal = () => {
  showAddModal.value = false
  addError.value = ""
}

// Gửi OTP và chuyển đến trang verify OTP
const handleAddUser = async (userData) => {
  addError.value = ""

  // Validate dữ liệu
  if (!userData.email) {
    addError.value = "Vui lòng nhập email"
    return
  }

  if (!userData.username) {
    addError.value = "Vui lòng nhập tên người dùng"
    return
  }

  if (!userData.password) {
    addError.value = "Vui lòng nhập mật khẩu"
    return
  }

  if (!userData.role) {
    addError.value = "Vui lòng chọn vai trò"
    return
  }

  await executeAddAsync(
    async () => {
      // Gửi OTP đến email
      const response = await authStore.sendOtpToEmail(
        userData.username,
        userData.email,
        userData.password
      )

      if (response?.data?.success) {
        // Lưu thông tin vào sessionStorage
        sessionStorage.setItem("register_email", userData.email)
        sessionStorage.setItem("register_username", userData.username)
        sessionStorage.setItem("register_password", userData.password)
        sessionStorage.setItem("register_role", userData.role)
        sessionStorage.setItem("otp_countdown", "30")
        sessionStorage.setItem("admin_add_user", "true") // Đánh dấu là admin đang thêm user

        // Đóng modal
        closeAddModal()

        // Chuyển đến trang verify OTP với mode admin
        router.push({
          name: "verify-otp",
          query: {
            email: userData.email,
            username: userData.username,
            password: userData.password,
            role: userData.role,
            mode: "admin",
          },
        })
      }
    },
    {
      defaultErrorMessage: "Không thể gửi mã OTP!",
      onError: (error) => {
        addError.value = error.response?.data?.message || "Không thể gửi mã OTP!"
      },
    }
  )
}

// ===========================Update Modal==========================
const showUpdateModal = ref(false)
const showUpdateSuccessModal = ref(false)
const updateError = ref("")
const selectedUserForUpdate = ref(null)

const { executeAsync: executeUpdateAsync, isLoading: isUpdating } = useAsyncOperation()

const handleUpdate = (item) => {
  selectedUserForUpdate.value = { ...item }
  showUpdateModal.value = true
  updateError.value = ""
}

const closeUpdateModal = () => {
  showUpdateModal.value = false
  selectedUserForUpdate.value = null
  updateError.value = ""
}

const handleUpdateSuccessClose = () => {
  showUpdateSuccessModal.value = false
}

const handleUpdateUser = async (userData) => {
  updateError.value = ""
  const token = authStore.accessToken || ""
  if (!token) {
    updateError.value = "Vui lòng đăng nhập lại!"
    return
  }

  if (!selectedUserForUpdate.value?.user_id) {
    updateError.value = "Không tìm thấy người dùng!"
    return
  }

  await executeUpdateAsync(
    async () => {
      await userStore.updateInfoUsers(selectedUserForUpdate.value.user_id, userData)
      await refreshUsersData()
      closeUpdateModal()
      updateError.value = ""
      showUpdateSuccessModal.value = true
    },
    {
      defaultErrorMessage: "Không thể cập nhật người dùng!",
      onError: (error) => {
        updateError.value = error.response?.data?.message
      },
    }
  )
}

// ===========================Delete Modal==========================
const showDeleteConfirmModal = ref(false)
const showDeleteSuccessModal = ref(false)
const selectedUserId = ref(null)

function openDeleteConfirmModal(item) {
  selectedUserId.value = item.user_id
  showDeleteConfirmModal.value = true
}
function handleDeleteCancel() {
  showDeleteConfirmModal.value = false
  selectedUserId.value = null
}

function handleDeleteSuccessClose() {
  showDeleteSuccessModal.value = false
  selectedUserId.value = null
}

async function handleDeleteConfirm() {
  const userId = selectedUserId.value
  const token = authStore.accessToken || ""

  if (!token) {
    showDeleteConfirmModal.value = false
    return
  }

  if (!userId) {
    showDeleteConfirmModal.value = false
    return
  }

  await executeAsync(
    async () => {
      await userStore.deleteUser(userId)
      await refreshUsersData()
      showDeleteConfirmModal.value = false
      showDeleteSuccessModal.value = true
    },
    {
      defaultErrorMessage: "Không thể xóa người dùng!",
      onError: (error) => {
        error.response?.data?.message
        showDeleteConfirmModal.value = false
      },
    }
  )
}

//==========================restore==========================
const showRestoreSuccessModal = ref(false)

const handleRestoreSuccessClose = () => {
  showRestoreSuccessModal.value = false
}

async function handleRestore(item) {
  const userId = item.user_id
  const token = authStore.accessToken || ""

  if (!token) {
    return
  }

  await executeAsync(
    async () => {
      await userStore.restoreUserStore(userId)
      await refreshUsersData()
      showRestoreSuccessModal.value = true
    },
    {
      defaultErrorMessage: "Không thể khôi phục người dùng!",
      onError: (error) => {
        const errorMessage = error.response?.data?.message
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

// ===========================Role Options==========================
const roleOptions = ref([
  { value: "USER", label: "USER" },
  { value: "ADMIN", label: "ADMIN" },
])

// ===========================User Fields==========================
const userFields = computed(() => [
  {
    key: "user_id",
    label: "ID",
    type: "text",
  },
  {
    key: "email",
    label: "Email",
    type: "email",
    required: true,
    placeholder: "Nhập địa chỉ email",
  },
  {
    key: "username",
    label: "Tên người dùng",
    type: "text",
    required: true,
    placeholder: "Nhập tên người dùng",
  },
  {
    key: "role",
    label: "Vai trò",
    type: "select",
    required: true,
    placeholder: "Chọn vai trò",
    optionsKey: "roles",
    optionValue: "value",
    optionLabel: "label",
  },
  {
    key: "phone_number",
    label: "Số điện thoại",
    type: "text",
    required: false,
    placeholder: "Nhập số điện thoại",
  },
  {
    key: "address",
    label: "Địa chỉ",
    type: "address",
    required: false,
  },
  {
    key: "password",
    label: "Mật khẩu",
    type: "password",
    required: true,
    placeholder: "Nhập mật khẩu",
    minLength: 8,
  },
])

// Fields cho add modal
const addUserFields = computed(() => {
  return userFields.value.filter(
    (field) => field.key !== "address" && field.key !== "phone_number" && field.key !== "user_id"
  )
})

const updateUserFields = computed(() => {
  return userFields.value.filter((field) => field.key !== "password" && field.key !== "user_id")
})

// ===========================Khởi tạo gọi api==========================
const refreshUsersData = async () => {
  await userStore.getAllUsers()

  try {
    await userStore.getAllDeleted()
  } catch (error) {
    console.error("Error loading deleted users:", error)
  }

  const list = userStore.allUsers || []
  dataUsers.value = list.map((u) => ({
    user_id: u.user_id,
    email: u.email,
    username: u.username,
    phone_number: u.phone_number,
    address: u.address,
    district_id: u.district_id || null,
    city_id: u.city_id || null,
    role: u.role,
    is_deleted: u.is_deleted || false,
  }))

  const listDeactive = userStore.allDeleted || []
  dataDeactiveUser.value = listDeactive.map((u) => ({
    user_id: u.user_id,
    email: u.email,
    username: u.username,
    phone_number: u.phone_number,
    address: u.address,
    district_id: u.district_id || null,
    city_id: u.city_id || null,
    role: u.role,
    is_deleted: u.is_deleted ?? true,
  }))
}

onMounted(async () => {
  await executeAsync(
    async () => {
      await refreshUsersData()
    },
    { defaultErrorMessage: "Không thể tải danh sách người dùng!" }
  )
})
</script>
