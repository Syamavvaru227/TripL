import client from "./client"
export const login = (email, password) => client.post("/auth/login", { email, password })
export const register = (full_name, email, password) => client.post("/auth/register", { full_name, email, password })
export const getMe = () => client.get("/auth/me")
export const sendOtp = (phone) => client.post("/auth/send-otp", { phone })
export const registerPhone = (phone, otp, full_name) => client.post("/auth/register-phone", { phone, otp, full_name })
export const loginPhone = (phone, otp) => client.post("/auth/login-phone", { phone, otp })
