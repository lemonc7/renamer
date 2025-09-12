import axios from "axios"

const service = axios.create({
  baseURL: "/",
  timeout: 3000,
  headers: {
    "Content-Type": "application/json;charset=UTF-8"
  }
})

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    // 对请求中的path进行解码,防止乱码
    if (config.method === "get" && config.params.path) {
      config.params.path = decodeURIComponent(config.params.path)
    }

    if (config.data) {
      if (typeof config.data.path === "string") {
        config.data.path = decodeURIComponent(config.data.path)
      }
      if (typeof config.data.targetPath === "string") {
        config.data.targetPath = decodeURIComponent(config.data.targetPath)
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response) {
      const response = error.response
      // 提取后端传过来的错误
      const backendError =
        response.data.error ||
        (typeof response.data === "string" ? response.data : null)
      // 如果返回了error
      if (backendError) {
        return Promise.reject(new Error(`${backendError}`))
      }

      // 如果没有明确的error字段，提供通用的错误信息
      const statusText = response.statusText || "未知错误"
      return Promise.reject(new Error(`${statusText}`))
    }
    // 没有response，直接返回
    return Promise.reject(new Error("网络错误"))
  }
)

export default service
