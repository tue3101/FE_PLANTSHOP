<template>
    <div class="p-8">
        <h1 class="text-2xl font-bold mb-6 text-center">Thông Tin Cá Nhân</h1>
        <UserInfoForm :formData="formData" :isLoading="isLoading" :errorMessage="errorMessage" @update="handleUpdate"
            @change-password="handleChangePassword" />
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { useAuthStore } from '@/stores/auth'
import { useAsyncOperation } from '@/composables/useAsyncOperation'
import UserInfoForm from '@/components/common/UserInfoForm.vue'

const userStore = useUserStore()
const authStore = useAuthStore()
const { isLoading, errorMessage, executeAsync } = useAsyncOperation()

const formData = ref({
    username: '',
    role: '',
    email: '',
    phone_number: '',
    address: ''
})

const handleUpdate = async (credentials) => {
    const token = authStore.accessToken
    if (!token) {
        errorMessage.value = 'Vui lòng đăng nhập lại!'
        return
    }

    await executeAsync(
        async () => {
            let userId = authStore.userId
            if (!userId) {
                throw new Error('Không tìm thấy ID người dùng. Vui lòng đăng nhập lại!')
            }

            const userData = { ...credentials }
            //update và cập nhật lại sau update
            const response = await userStore.updateInfoUsers(token, userId, userData)
            if (response?.data?.success) {
                await userStore.getInfo(token)
                if (userStore.userInfo) {
                    formData.value = {
                        username: '',
                        role: '',
                        email: '',
                        phone_number: '',
                        address: '',
                        ...userStore.userInfo
                    }
                }
            }
        },
        {
            defaultErrorMessage: 'Cập nhật thông tin thất bại!',
            onError: (error) => {
            updateError.value = error.response?.data?.message
        }
        }
    )
}

const handleChangePassword = async (passwordData) => {
    const token = authStore.accessToken
    if (!token) {
        errorMessage.value = 'Vui lòng đăng nhập lại!'
        return
    }

    await executeAsync(
        async () => {
            await authStore.changePassword(passwordData.oldPassword, passwordData.newPassword, token)
            alert('Đổi mật khẩu thành công!')
        },
        {
            defaultErrorMessage: 'Đổi mật khẩu thất bại!',
            onError: (error, errorMsg) => {
                const backendError = error.response?.data?.message || errorMsg
                alert(backendError || 'Đổi mật khẩu thất bại!')
            },
            onSuccess: () => {
                console.log('Đổi mật khẩu thành công!')
            }
        }
    )
}

const loadUserInfo = async () => {
    try {
        const token = authStore.accessToken
        if (token) {
            await userStore.getInfo(token)
            if (userStore.userInfo) {
                formData.value = {
                    username: '',
                    role: '',
                    email: '',
                    phone_number: '',
                    address: '',
                    ...userStore.userInfo
                }
            }
        }
    } catch (error) {
        console.error('Error loading user info:', error)
    }
}

onMounted(() => {
    loadUserInfo()
})
</script>
