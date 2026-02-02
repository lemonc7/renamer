import axios from "axios";

// 1. 使用环境变量 (如果未设置则默认为 /)
const baseURL = import.meta.env.VITE_API_URL || "/";

const service = axios.create({
  baseURL: baseURL,
  timeout: 10000, 
  headers: {
    "Content-Type": "application/json;charset=UTF-8",
  },
});

// 2. 请求拦截器
service.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 3. 响应拦截器
service.interceptors.response.use(
  (response) => {
    // 直接返回数据, 后续不需要再使用.data
    return response.data; 
  },
  (error) => {
    if (error.response) {
      const response = error.response;
      // 提取后端传过来的错误
      const backendError =
        response.data?.error || 
        (typeof response.data === "string" ? response.data : null);
      
      // 如果返回了error
      if (backendError) {
        return Promise.reject(new Error(backendError));
      }

      // 如果没有明确的error字段，提供通用的错误信息
      const statusText = response.statusText || "未知错误";
      return Promise.reject(new Error(statusText));
    }
    
    // 处理断网或超时情况
    if (error.message.includes('timeout')) {
        return Promise.reject(new Error("请求超时"));
    }
    
    // 没有response，直接返回
    return Promise.reject(new Error("网络错误或服务不可用"));
  }
);

export default service;
