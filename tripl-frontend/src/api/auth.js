import client from "./client"
export const login = (email, password) => client.post("/auth/login", { email, password })
export const register = (full_name, email, password) => client.post("/auth/register", { full_name, email, password })
export const getMe = () => client.get("/auth/me")
export const sendOtp = (phone) => client.post("/auth/send-otp", { phone })
export const checkPhone = (phone, otp) => client.post("/auth/check-phone", { phone, otp })
export const registerPhone = (phone, otp, full_name, email, password) => client.post("/auth/register-phone", { phone, otp, full_name, email, password })
export const loginPhone = (phone, password) => client.post("/auth/login-phone", { phone, password })
export const forgotPassword = (phone, otp, new_password) => client.post("/auth/forgot-password", { phone, otp, new_password })
