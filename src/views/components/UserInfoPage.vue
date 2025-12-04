<template>
    <div class="p-8">
        <h1 class="text-2xl font-bold mb-6 text-center">Thông Tin Cá Nhân</h1>
        <UserInfoForm :formData="formData" :isLoading="isLoading" :errorMessage="errorMessage" 
            :update-success="updateSuccess" @update="handleUpdate"
            @change-password="handleChangePassword" 
            @update-success-reset="updateSuccess = false" />
    </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
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

const updateSuccess = ref(false)

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

            // Lấy role hiện tại của user từ userInfo hoặc authStore
            const currentRole = userStore.userInfo?.role || authStore.userRole || ''
            const roleLower = (currentRole || '').toLowerCase()

            const userData = { ...credentials }

            // Nếu role là "user", không gửi role lên khi cập nhật
            if (roleLower === 'user') {
                delete userData.role
                console.log('🔒 User có role là "user", đã loại bỏ role khỏi dữ liệu cập nhật')
            }

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
                // Hiển thị modal thành công
                updateSuccess.value = true
            }
        },
        {
            defaultErrorMessage: 'Cập nhật thông tin thất bại!',
            onError: (error) => {
                errorMessage.value = error.response?.data?.message || error.message
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

// Theo dõi khi userInfo trong store thay đổi (ví dụ sau khi token refresh)
watch(() => userStore.userInfo, (newUserInfo) => {
    if (newUserInfo) {
        console.log('🔄 UserInfoPage - userInfo đã thay đổi trong store, cập nhật formData...')
        formData.value = {
            username: '',
            role: '',
            email: '',
            phone_number: '',
            address: '',
            ...newUserInfo
        }
    }
}, { deep: true, immediate: false })

// Theo dõi khi token thay đổi (ví dụ sau khi refresh)
watch(() => authStore.accessToken, (newToken, oldToken) => {
    if (newToken && newToken !== oldToken && oldToken !== null) {
        console.log('🔄 UserInfoPage - Token đã được refresh, reload userInfo...')
        loadUserInfo()
    }
})

// Theo dõi khi authentication state thay đổi
watch(() => authStore.isAuthenticated, (isAuthenticated) => {
    if (isAuthenticated) {
        console.log('🔄 UserInfoPage - User đã authenticated, load userInfo...')
        loadUserInfo()
    }
})

onMounted(() => {
    loadUserInfo()
})
</script>
