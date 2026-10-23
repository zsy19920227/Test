import { request } from './client'
import type { PageResult, RoleCreatePayload, RolePageQuery, RoleUpdatePayload, SysRoleItem } from './types'

/** 系统角色 API（对应后端 SysRoleController） */
export const roleApi = {
  page: (params: RolePageQuery) =>
    request<PageResult<SysRoleItem>>({
      url: '/system/roles/page',
      method: 'GET',
      params,
    }),

  /** 全部启用角色（用户分配角色下拉用） */
  all: () => request<SysRoleItem[]>({ url: '/system/roles/all', method: 'GET' }),

  create: (data: RoleCreatePayload) =>
    request<void>({ url: '/system/roles', method: 'POST', data }),

  update: (data: RoleUpdatePayload) =>
    request<void>({ url: '/system/roles', method: 'PUT', data }),

  remove: (id: number) => request<void>({ url: `/system/roles/${id}`, method: 'DELETE' }),

  /** 角色已绑定的菜单/权限点 ID */
  menuIds: (id: number) => request<number[]>({ url: `/system/roles/${id}/menuIds`, method: 'GET' }),
}
