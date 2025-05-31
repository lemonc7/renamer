import axios from "axios"

// 创建一个实例
const service = axios.create({
  baseURL: "/",
  timeout: 3000,
  headers: {
    "Content-Type": "application/json;charset=UTF-8"
  }
})

// // 请求拦截器
// service.interceptors.request.use(function (config) {
//     // 在发送请求之前做些什么
//     return config;
//   }, function (error) {
//     // 对请求错误做些什么
//     return Promise.reject(error);
//   });

// 响应拦截器
service.interceptors.response.use(
  (response) => {
    const res = response.data
    if (res?.code && res?.code !== 200) {
      console.warn("业务错误", res.message)
      return Promise.reject(new Error(res.message))
    }
    return response
  },
  (error) => {
    const status = error.response?.status
    switch (status) {
      case 400:
        console.error("请求参数错误")
        break
      case 401:
        console.error("未授权或token过期")
        break
      case 403:
        console.error("没有权限")
        break
      case 404:
        console.error("没有接口")
        break
      case 500:
        console.error("服务器错误")
        break
      default:
        console.error("其他错误")
    }

    return Promise.reject(error)
  }
)

export default service
