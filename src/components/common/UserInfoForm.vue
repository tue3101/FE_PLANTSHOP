<template>
  <form
    @submit.prevent="handleSubmit"
    class="max-w-md mx-auto bg-background p-6 rounded-lg shadow-md"
  >
    <div class="mb-4">
      <Label for="username">Username</Label>
      <Input v-model="localFormData.username" type="text" id="username" placeholder="cobala1408" />
    </div>
    <div class="mb-4">
      <Label for="role">Role</Label>
      <Input
        v-model="localFormData.role"
        type="text"
        id="role"
        :readonly="isUserRole"
        :disabled="isUserRole"
        :class="isUserRole ? 'bg-muted cursor-not-allowed' : ''"
      />
    </div>
    <div class="mb-4">
      <Label for="email">Email</Label>
      <Input
        v-model="localFormData.email"
        type="email"
        id="email"
        placeholder="cobala1408@gmail.com"
      />
    </div>
    <div class="mb-6">
      <Label for="phone_number">Phone</Label>
      <Input
        v-model="localFormData.phone_number"
        type="tel"
        id="phone_number"
        placeholder="+84xxxxxxxxx"
      />
    </div>
    <div class="mb-6">
      <Label for="address">Địa chỉ</Label>
      <Textarea
        v-model="localFormData.address"
        id="address"
        rows="3"
        placeholder="Nhập địa chỉ của bạn"
      />
    </div>
    <Alert v-if="errorMessage" variant="destructive" class="mb-4">
      <AlertDescription>{{ errorMessage }}</AlertDescription>
    </Alert>
    <div class="flex space-x-4">
      <Button type="submit" :disabled="isLoading">
        {{ isLoading ? "ĐANG XỬ LÝ..." : "Cập Nhật" }}
      </Button>
      <Button type="button" variant="outline" @click="openChangeModal" :disabled="isLoading">
        Đổi Mật Khẩu
      </Button>
    </div>
  </form>
  <ModalCommon
    :showModal="showChangeModal"
    :title="'Đổi Mật Khẩu'"
    :submitLabel="'Đổi Mật Khẩu'"
    :fields="passwordFields"
    :isLoading="isChangingPassword"
    :errorMessage="passwordError"
    @submit="handleChangePassword"
    @cancel="closeChangeModal"
    @update:showModal="showChangeModal = $event"
  >
    <template #custom-content>
      <div class="flex justify-end mt-2 mb-2">
        <router-link
          to="/forgot-password"
          @click="closeChangeModal"
          class="text-primary hover:text-primary/80 text-sm underline"
        >
          Quên mật khẩu?
        </router-link>
      </div>
    </template>
  </ModalCommon>

  <!-- Modal cập nhật thành công -->
  <DeleteModal
    :show-modal="showUpdateSuccessModal"
    mode="update-success"
    title="Cập nhật thành công"
    message="Thông tin cá nhân đã được cập nhật thành công!"
    @close="handleCloseUpdateSuccessModal"
    @update:show-modal="showUpdateSuccessModal = $event"
  />
</template>

<script setup lang="ts">
import { ref, watch, computed } from "vue"
import ModalCommon from "@/components/common/admin/ModalCommon.vue"
import DeleteModal from "@/components/common/admin/DeleteModal.vue"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"

const showChangeModal = ref(false)
const isChangingPassword = ref(false)
const passwordError = ref("")
const showUpdateSuccessModal = ref(false)
const previousLoadingState = ref(false)

const passwordFields = computed(() => [
  {
    key: "oldPassword",
    label: "Mật khẩu cũ",
    type: "password",
    required: true,
    placeholder: "Nhập mật khẩu cũ",
    minLength: 8,
  },
  {
    key: "newPassword",
    label: "Mật khẩu mới",
    type: "password",
    required: true,
    placeholder: "Nhập mật khẩu mới",
    minLength: 8,
  },
  {
    key: "confirmPassword",
    label: "Xác nhận mật khẩu mới",
    type: "password",
    required: true,
    placeholder: "Nhập lại mật khẩu mới",
    minLength: 8,
  },
])

const openChangeModal = (): void => {
  showChangeModal.value = true
  passwordError.value = ""
}

const closeChangeModal = (): void => {
  showChangeModal.value = false
  passwordError.value = ""
}

const props = withDefaults(
  defineProps<{
    formData: {
      username: string
      role: string
      email: string
      phone_number: string
      address: string
    }
    isLoading?: boolean
    errorMessage?: string
    updateSuccess?: boolean
  }>(),
  {
    isLoading: false,
    errorMessage: "",
    updateSuccess: false,
  }
)

const emit = defineEmits<{
  update: [data: FormData]
  "change-password": [data: { oldPassword: string; newPassword: string }]
  "update-success-reset": []
}>()

const localFormData = ref<{
  username: string
  role: string
  email: string
  phone_number: string
  address: string
}>({ ...props.formData })

const isUserRole = computed(() => {
  const role = localFormData.value?.role || ""
  return role.toLowerCase() === "user"
})

// Đồng bộ dữ liệu khi props thay đổi
watch(
  () => props.formData,
  (newData) => {
    localFormData.value = { ...newData }
  },
  { deep: true }
)

// Theo dõi prop updateSuccess để hiển thị modal thành công
watch(
  () => props.updateSuccess,
  (newValue) => {
    if (newValue === true) {
      showUpdateSuccessModal.value = true
    }
  },
  { immediate: false }
)

// Theo dõi trạng thái loading để hiển thị modal thành công (fallback)
watch(
  () => props.isLoading,
  (newLoading, oldLoading) => {
    // Khi loading chuyển từ true sang false và không có lỗi, hiển thị modal thành công
    if (
      oldLoading === true &&
      newLoading === false &&
      !props.errorMessage &&
      !props.updateSuccess
    ) {
      // Chỉ hiển thị modal nếu đã từng submit (previousLoadingState = true)
      if (previousLoadingState.value) {
        showUpdateSuccessModal.value = true
        previousLoadingState.value = false
      }
    }
    // Lưu trạng thái loading trước đó
    if (newLoading === true) {
      previousLoadingState.value = true
    }
  }
)

const handleSubmit = (): void => {
  // Gửi dữ liệu với địa chỉ từ input
  const submitData: {
    username: string
    role: string
    email: string
    phone_number: string
    address: string
  } = {
    ...localFormData.value,
    address: localFormData.value.address || "",
  }
  emit("update", submitData)
}

const handleChangePassword = (passwordData: Record<string, string>): void => {
  // Validate password
  if (passwordData.newPassword !== passwordData.confirmPassword) {
    passwordError.value = "Mật khẩu mới và xác nhận mật khẩu không khớp!"
    return
  }

  if (passwordData.newPassword.length < 8) {
    passwordError.value = "Mật khẩu mới phải có ít nhất 8 ký tự!"
    return
  }

  passwordError.value = ""
  emit("change-password", {
    oldPassword: passwordData.oldPassword,
    newPassword: passwordData.newPassword,
  })
  closeChangeModal()
}

// Đóng modal cập nhật thành công
const handleCloseUpdateSuccessModal = (): void => {
  showUpdateSuccessModal.value = false
  // Emit event để parent component reset updateSuccess
  emit("update-success-reset")
}
</script>
