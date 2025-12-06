import { ref, type Ref } from "vue"

interface AsyncOperationOptions {
  defaultErrorMessage?: string
  onError?: (error: any, errorMessage: string) => void
  onSuccess?: (result: any) => void
}

export function useAsyncOperation() {
  const isLoading: Ref<boolean> = ref(false)
  const errorMessage: Ref<string> = ref("")

  const resetError = (): void => {
    errorMessage.value = ""
  }

  const setError = (message: string): void => {
    errorMessage.value = message
  }

  const handleError = (
    error: any,
    defaultMessage: string = "Đã xảy ra lỗi. Vui lòng thử lại!"
  ): string => {
    // Nếu error là Error object với message, ưu tiên dùng message đó
    if (error instanceof Error && error.message) {
      return error.message
    }

    if (error.response) {
      // Lỗi từ server (có response)
      const responseData = error.response.data
      return (
        responseData?.message ||
        responseData?.error ||
        responseData?.errorMessage ||
        responseData?.msg ||
        (responseData?.data?.message) ||
        defaultMessage
      )
    } else if (error.request) {
      // Không nhận được response từ server
      return "Không thể kết nối đến server. Vui lòng kiểm tra lại!"
    } else {
      // Lỗi khác
      return error.message || defaultMessage
    }
  }

  const executeAsync = async <T = any>(
    asyncFn: () => Promise<T>,
    options: AsyncOperationOptions = {}
  ): Promise<T> => {
    const {
      defaultErrorMessage = "Đã xảy ra lỗi. Vui lòng thử lại!",
      onError,
      onSuccess,
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
    } catch (error: any) {
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
    handleError,
  }
}

