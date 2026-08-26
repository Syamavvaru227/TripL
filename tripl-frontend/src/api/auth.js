import client from "./client"
export const login = (email, password) => client.post("/auth/login", { email, password })
export const register = (full_name, email, password) => client.post("/auth/register", { full_name, email, password })
export const getMe = () => client.get("/auth/me")
