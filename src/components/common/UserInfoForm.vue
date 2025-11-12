<template>
  <form @submit.prevent="handleSubmit" class="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
    <div class="mb-4">
      <label for="username" class="block text-gray-700 font-bold mb-2">Username</label>
      <input v-model="localFormData.username" type="text" id="username" placeholder="cobala1408"
        class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
    </div>
    <div class="mb-4">
      <label for="role" class="block text-gray-700 font-bold mb-2">Role</label>
      <input v-model="localFormData.role" type="text" id="role" :readonly="isUserRole" :disabled="isUserRole" :class="[
        'w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500',
        isUserRole ? 'bg-gray-100 cursor-not-allowed' : ''
      ]" />
    </div>
    <div class="mb-4">
      <label for="email" class="block text-gray-700 font-bold mb-2">Email</label>
      <input v-model="localFormData.email" type="email" id="email" placeholder="cobala1408@gmail.com"
        class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
    </div>
    <div class="mb-6">
      <label for="phone_number" class="block text-gray-700 font-bold mb-2">Phone</label>
      <input v-model="localFormData.phone_number" type="tel" id="phone_number" placeholder="+84xxxxxxxxx"
        class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
    </div>
    <div class="mb-6">
      <label for="address" class="block text-gray-700 font-bold mb-2">Address</label>
      <input v-model="localFormData.address" type="tel" id="address" placeholder="abcxyz"
        class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
    </div>
    <div v-if="errorMessage" class="mb-4 text-red-600 text-sm text-center">
      {{ errorMessage }}
    </div>
    <div class="flex space-x-4">
      <button type="submit" :disabled="isLoading"
        class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed">
        {{ isLoading ? 'ĐANG XỬ LÝ...' : 'Cập Nhật' }}
      </button>
      <button type="button" @click="openChangeModal" :disabled="isLoading"
        class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-gray-500 cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed">
        Đổi Mật Khẩu
      </button>
    </div>
  </form>
  <ModalCommon :showModal="showChangeModal" :title="'Đổi Mật Khẩu'" :submitLabel="'Đổi Mật Khẩu'"
    :fields="passwordFields" :isLoading="isChangingPassword" :errorMessage="passwordError"
    @submit="handleChangePassword" @cancel="closeChangeModal" @update:showModal="showChangeModal = $event">
    <template #custom-content>
      <div class=" flex justify-end mt-2 mb-2">
        <router-link to="/forgot-password" @click="closeChangeModal"
          class="text-blue-600 hover:text-blue-800 text-sm underline">
          Quên mật khẩu?
        </router-link>
      </div>
    </template>
  </ModalCommon>
</template>


<script setup>
import { ref, watch, computed } from 'vue'
import ModalCommon from '@/components/common/admin/ModalCommon.vue'

const showChangeModal = ref(false)
const isChangingPassword = ref(false)
const passwordError = ref('')

const passwordFields = computed(() => [
  {
    key: 'oldPassword',
    label: 'Mật khẩu cũ',
    type: 'password',
    required: true,
    placeholder: 'Nhập mật khẩu cũ',
    minLength: 8
  },
  {
    key: 'newPassword',
    label: 'Mật khẩu mới',
    type: 'password',
    required: true,
    placeholder: 'Nhập mật khẩu mới',
    minLength: 8
  },
  {
    key: 'confirmPassword',
    label: 'Xác nhận mật khẩu mới',
    type: 'password',
    required: true,
    placeholder: 'Nhập lại mật khẩu mới',
    minLength: 8
  }
])

const openChangeModal = () => {
  showChangeModal.value = true
  passwordError.value = ''
}

const closeChangeModal = () => {
  showChangeModal.value = false
  passwordError.value = ''
}

const props = defineProps({
  formData: {
    type: Object,
    required: true,
    default: () => ({
      username: '',
      role: '',
      email: '',
      phone_number: '',
      address: ''
    })
  },
  isLoading: {
    type: Boolean,
    default: false
  },
  errorMessage: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update', 'change-password'])

const localFormData = ref({ ...props.formData })

const isUserRole = computed(() => {
  const role = localFormData.value?.role || ''
  return role.toLowerCase() === 'user'
})

// Đồng bộ dữ liệu khi props thay đổi
watch(() => props.formData, (newData) => {
  localFormData.value = { ...newData }
}, { deep: true })

const handleSubmit = () => {
  emit('update', localFormData.value)
}

const handleChangePassword = (passwordData) => {
  // Validate password
  if (passwordData.newPassword !== passwordData.confirmPassword) {
    passwordError.value = 'Mật khẩu mới và xác nhận mật khẩu không khớp!'
    return
  }

  if (passwordData.newPassword.length < 8) {
    passwordError.value = 'Mật khẩu mới phải có ít nhất 8 ký tự!'
    return
  }

  passwordError.value = ''
  emit('change-password', {
    oldPassword: passwordData.oldPassword,
    newPassword: passwordData.newPassword
  })
  closeChangeModal()
}

</script>