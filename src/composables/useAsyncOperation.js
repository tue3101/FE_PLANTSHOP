import { ref } from 'vue'

export function useAsyncOperation() {
  const isLoading = ref(false)
  const errorMessage = ref('')

 
  const resetError = () => {
    errorMessage.value = ''
  }

 
  const setError = (message) => {
    errorMessage.value = message
  }

 
  const handleError = (error, defaultMessage = 'Đã xảy ra lỗi. Vui lòng thử lại!') => {
    if (error.response) {
      // Lỗi từ server (có response)
      return error.response.data?.message 
        || error.response.data?.error 
        || error.response.data?.errorMessage
        || error.response.data?.msg
        || defaultMessage
    } else if (error.request) {
      // Không nhận được response từ server
      return 'Không thể kết nối đến server. Vui lòng kiểm tra lại!'
    } else {
      // Lỗi khác
      return error.message || defaultMessage
    }
  }

  
  const executeAsync = async (asyncFn, options = {}) => {
    const {
      defaultErrorMessage = 'Đã xảy ra lỗi. Vui lòng thử lại!',
      onError,
      onSuccess
    } = options

    // Reset error trước khi thực thi
    resetError()
    isLoading.value = true

    try {
      const result = await asyncFn()
      
      // Callback khi thành công (nếu có)
      if (onSuccess) {
        onSuccess(result)
      }

      return result
    } catch (error) {
      // Error handling
      
      // Xử lý lỗi và set error message
      const errorMsg = handleError(error, defaultErrorMessage)
      errorMessage.value = errorMsg

      // Callback khi có lỗi (nếu có)
      if (onError) {
        onError(error, errorMsg)
      }

      // Re-throw error để caller có thể xử lý thêm nếu cần
      throw error
    } finally {
      isLoading.value = false
    }
  }

  return {
    isLoading,
    errorMessage,
    executeAsync,
    resetError,
    setError,
    handleError
  }
}

