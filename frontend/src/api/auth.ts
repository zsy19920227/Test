import { request } from './client'
import type { LoginRequest, LoginResponse, UserInfo } from './types'

/** 认证相关 API（对应后端 AuthController） */
export const authApi = {
  login: (data: LoginRequest) =>
    request<LoginResponse>({ url: '/auth/login', method: 'POST', data }),

  logout: () => request<void>({ url: '/auth/logout', method: 'POST' }),

  me: () => request<UserInfo>({ url: '/auth/me', method: 'GET' }),
}
