import { request } from './client'
import type { MenuPayload, SysMenuNode } from './types'

/** 系统菜单/权限点 API（对应后端 SysMenuController） */
export const menuApi = {
  tree: () => request<SysMenuNode[]>({ url: '/system/menus/tree', method: 'GET' }),

  create: (data: MenuPayload) => request<void>({ url: '/system/menus', method: 'POST', data }),

  update: (data: MenuPayload) => request<void>({ url: '/system/menus', method: 'PUT', data }),

  remove: (id: number) => request<void>({ url: `/system/menus/${id}`, method: 'DELETE' }),
}
