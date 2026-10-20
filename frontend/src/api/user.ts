import { request } from './client'
import type { PageResult, SysUserItem, UserPageQuery } from './types'

/** 系统用户 API（对应后端 SysUserController，分页查询演示） */
export const userApi = {
  page: (params: UserPageQuery) =>
    request<PageResult<SysUserItem>>({
      url: '/system/users/page',
      method: 'GET',
      params,
    }),
}
