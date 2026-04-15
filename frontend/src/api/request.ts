import axios from "axios"

const service = axios.create({
  baseURL:
    process.env.NODE_ENV === "production"
      ? "/api"
      : "http://localhost:7777/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json;charset=UTF-8"
  }
})

// 请求拦截
service.interceptors.request.use(
  (config) => {
    return config
  },
  (error) => Promise.reject(error)
)

// 响应拦截
service.interceptors.response.use(
  (response) => {
    // 直接返回数据, 后续不需要再使用.data
    return response.data
  },
  (error) => {
    if (error.response) {
      const response = error.response
      // 提取后端传过来的错误
      const backendError =
        response.data?.error ||
        (typeof response.data === "string" ? response.data : null)

      // 如果返回了error
      if (backendError) {
        return Promise.reject(new Error(backendError))
      }

      // 如果没有明确的error字段，提供通用的错误信息
      const statusText = response.statusText || "未知错误"
      return Promise.reject(new Error(statusText))
    }

    // 没有response
    return Promise.reject(new Error("网络错误或服务不可用"))
  }
)

export default service
