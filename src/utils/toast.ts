import { toast } from "vue-sonner"

type ToastType = "success" | "error" | "warning" | "info"

interface ToastOptions {
  description?: string
  duration?: number
}

/**
 * Common function to show toast notifications
 * @param type - Type of toast (success, error, warning, info)
 * @param message - Main message to display
 * @param options - Optional configuration (description, duration)
 */
const showToast = (type: ToastType, message: string, options?: ToastOptions): void => {
  const toastOptions = {
    description: options?.description,
    duration: options?.duration ?? 3000,
  }

  switch (type) {
    case "success":
      toast.success(message, toastOptions)
      break
    case "error":
      toast.error(message, toastOptions)
      break
    case "warning":
      toast.warning(message, toastOptions)
      break
    case "info":
      toast.info(message, toastOptions)
      break
  }
}

export const toastSuccess = (message: string, options?: ToastOptions): void => {
  showToast("success", message, options)
}

export const toastError = (message: string, options?: ToastOptions): void => {
  showToast("error", message, options)
}

export const toastWarning = (message: string, options?: ToastOptions): void => {
  showToast("warning", message, options)
}

export const toastInfo = (message: string, options?: ToastOptions): void => {
  showToast("info", message, options)
}

export const toastPromise = <T>(
  promise: Promise<T>,
  messages: {
    loading: string
    success: (data: T) => string
    error: (error: any) => string
  }
): void => {
  toast.promise(promise, {
    loading: messages.loading,
    success: (data: T) => messages.success(data),
    error: (error: any) => messages.error(error),
  })
}
