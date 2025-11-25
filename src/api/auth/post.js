import axios from "axios"

export const registerUser = async (email, username, password, otpCode, role = null)=>{
  const requestBody = {
    email,
    username,
    password,
    otpCode,
  }
  if (role) {
    requestBody.role = role
  }
  // Không gửi token vì đây là đăng ký, user chưa có tài khoản
  const response = await axios.post("/api/auth/register", requestBody)
  return response
}

// Gửi OTP đến email (cho đăng ký)
export const sendOtp = async (username, email, password) => {
  try {
    // Không gửi token vì đây là bước đầu của đăng ký, user chưa có tài khoản
    const response = await axios.post("/api/auth/send-otp-register", { 
      username, 
      email, 
      password 
    }) 
    console.log('Send OTP success:', response)
    return response
  } catch (error) {
    console.error('Send OTP error:', error)
    console.error('Error response:', error.response)
    console.error('Error status:', error.response?.status)
    console.error('Error data:', error.response?.data)
    throw error
  }
}

// Xác thực OTP (optional)
export const verifyOtp = async (email, otpCode) => {
  const response = await axios.post("/api/auth/verify-otp", { email, otpCode })
  return response
}


export const loginUser = async (email, password) => {
  const response = await axios.post("/api/auth/login", {
    email,
    password,
  })
  return response
}

export const refreshToken = async (token)=>{
  const response = await axios.post("/api/auth/refresh", null, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return response
}

// Hàm kiểm tra token có hết hạn không
export const isTokenExpired = (token) => {
  if (!token) return true
  try {
    const decoded = JSON.parse(atob(token.split('.')[1]))
    const exp = decoded.exp * 1000 // Convert to milliseconds
    return Date.now() >= exp
  } catch (error) {
    console.error("token error:", error.message)
    return true
  }
}

export const logoutUser = async (token) => {
  const response = await axios.post("/api/auth/logout", null, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return response
}

// Google login với code từ Google OAuth callback
export const loginWithGoogle = async (code) => {
  try {
    const response = await axios.post("/api/auth/google", {
      code: code
    })
    console.log('API response status:', response.status)
    return response
  } catch (error) {
    console.error('API call error:', error)
    throw error
  }
}

// Gửi OTP cho quên mật khẩu
export const sendOtpForForgotPassword = async (email) => {
  try {
    const response = await axios.post("/api/auth/forgot-password/send-otp", { email })
    return response
  } catch (error) {
    console.error('Send OTP for forgot password error:', error)
    throw error
  }
}

// Reset password với OTP
export const resetPasswordWithOtp = async (email, otpCode, newPassword) => {
  try {
    const response = await axios.post("/api/auth/forgot-password/reset", {
      email,
      otpCode,
      newPassword
    }, {
      _skipAuth: true
    })
    return response
  } catch (error) {
    console.error('Reset password error:', error)
    throw error
  }
}