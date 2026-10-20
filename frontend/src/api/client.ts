import axios from 'axios'
import type { AxiosError, AxiosRequestConfig } from 'axios'
import { message } from 'antd'
import type { ApiResult } from './types'

const TOKEN_KEY = 'turing.token'

/** token 存取的唯一入口（ Redux 与拦截器共用 ） */
export const tokenStorage = {
  get: (): string | null => localStorage.getItem(TOKEN_KEY),
  set: (token: string): void => localStorage.setItem(TOKEN_KEY, token),
  clear: (): void => localStorage.removeItem(TOKEN_KEY),
}

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
  timeout: 15000,
})

// 请求拦截：注入 Bearer Token
http.interceptors.request.use((config) => {
  const token = tokenStorage.get()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 响应拦截：统一解包 Result、统一错误提示、401 踢回登录页
http.interceptors.response.use(
  (response) => {
    const result = response.data as ApiResult | undefined
    // 文件流等非 Result 结构直接放行
    if (result && typeof result.code === 'number' && result.code !== 200) {
      message.error(result.message || '请求失败')
      return Promise.reject(new Error(result.message || '请求失败'))
    }
    return response
  },
  (error: AxiosError<ApiResult>) => {
    if (error.response?.status === 401) {
      tokenStorage.clear()
      if (!window.location.pathname.startsWith('/login')) {
        window.location.replace(`/login?redirect=${encodeURIComponent(window.location.pathname)}`)
      }
      return Promise.reject(error)
    }
    const msg = error.response?.data?.message || error.message || '网络异常，请稍后重试'
    message.error(msg)
    return Promise.reject(error)
  },
)

/** 便捷请求方法：自动解包 Result，直接返回 data 字段 */
export async function request<T>(config: AxiosRequestConfig): Promise<T> {
  const response = await http.request<ApiResult<T>>(config)
  return response.data.data
}
