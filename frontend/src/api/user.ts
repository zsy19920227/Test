import { request } from './client'
import type { PageResult, SysUserItem, UserCreatePayload, UserPageQuery, UserUpdatePayload } from './types'

/** 系统用户 API（对应后端 SysUserController） */
export const userApi = {
  page: (params: UserPageQuery) =>
    request<PageResult<SysUserItem>>({
      url: '/system/users/page',
      method: 'GET',
      params,
    }),

  get: (id: number) => request<SysUserItem>({ url: `/system/users/${id}`, method: 'GET' }),

  create: (data: UserCreatePayload) => request<void>({ url: '/system/users', method: 'POST', data }),

  update: (data: UserUpdatePayload) => request<void>({ url: '/system/users', method: 'PUT', data }),

  remove: (id: number) => request<void>({ url: `/system/users/${id}`, method: 'DELETE' }),
}
