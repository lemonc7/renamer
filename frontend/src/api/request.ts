import axios from "axios"

// 创建一个实例
const service = axios.create({
  // 实际生产api
  baseURL: "/",
  // 开发测试api
  // baseURL: "http://192.168.100.2:7777/",
  timeout: 3000,
  headers: {
    "Content-Type": "application/json;charset=UTF-8"
  }
})

// 请求拦截器
service.interceptors.request.use(
  (config) => {
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
    // 对请求错误做些什么
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
      // 提取gin.H{"error": ...}中的错误信息
      const backendError =
        response.data?.error ||
        (typeof response.data === "string" ? response.data : null)
      // 如果返回了error
      if (backendError) {
        return Promise.reject(new Error(`${backendError}`))
      }

      // 如果没有明确的error字段,提供通用的错误信息
      const statusText = response.statusText || "未知错误"
      return Promise.reject(new Error(`${statusText}`))
    }
    // 处理没有服务器响应的情况
    return Promise.reject(new Error("网络错误"))
  }
)

export default service
