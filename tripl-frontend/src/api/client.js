import axios from "axios"
const client = axios.create({
  // A blank VITE_API_URL means the frontend and API share the same origin.
  // This is the production layout used by the Docker/Render deployment.
  baseURL: `${import.meta.env.VITE_API_URL || ""}/api`,
  timeout: 60000,
})

client.interceptors.request.use((config) => {
  const token = localStorage.getItem("tripl_token")
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("tripl_token")
      window.location.href = "/auth"
    }
    return Promise.reject(err)
  }
)

export default client
