/** 后端统一响应结构，对应 com.turing.platform.common.api.Result&lt;T&gt; */
export interface ApiResult<T = unknown> {
  code: number
  message: string
  data: T
}

/** 分页结果，对应 com.turing.platform.common.api.PageResult&lt;T&gt; */
export interface PageResult<T = unknown> {
  records: T[]
  total: number
  current: number
  size: number
}

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  /** JWT access token */
  token: string
  /** 固定为 Bearer */
  tokenType: string
  /** 有效期（秒） */
  expiresIn: number
}

export interface UserInfo {
  id: number
  username: string
  nickname: string
  /** 角色编码，如 ROLE_ADMIN */
  roles: string[]
  /** 权限标识，如 system:user:list */
  permissions: string[]
}

/** 系统用户（列表页） */
export interface SysUserItem {
  id: number
  username: string
  nickname: string
  email: string | null
  status: 0 | 1
  roleCodes: string[]
  roleIds: number[]
  createTime: string
}

export interface UserPageQuery {
  current?: number
  size?: number
  keyword?: string
}

export interface UserCreatePayload {
  username: string
  nickname: string
  email?: string
  /** 不填则后端使用默认密码 */
  password?: string
  roleIds?: number[]
}

export interface UserUpdatePayload {
  id: number
  nickname: string
  email?: string
  status: 0 | 1
  /** null/undefined 表示不调整角色 */
  roleIds?: number[]
}

/** 系统角色 */
export interface SysRoleItem {
  id: number
  code: string
  name: string
  status: 0 | 1
  remark: string | null
  createTime: string
}

export interface RolePageQuery {
  current?: number
  size?: number
  keyword?: string
}

export interface RoleCreatePayload {
  code: string
  name: string
  remark?: string
  menuIds?: number[]
}

export interface RoleUpdatePayload {
  id: number
  name: string
  remark?: string
  status: 0 | 1
  /** null/undefined 表示不调整权限绑定 */
  menuIds?: number[]
}

/** 菜单/权限点树节点 */
export interface SysMenuNode {
  id: number
  parentId: number
  type: 'M' | 'C' | 'F'
  name: string
  permission: string | null
  path: string | null
  sort: number
  status: 0 | 1
  children: SysMenuNode[]
}

export interface MenuPayload {
  id?: number
  parentId: number
  type: 'M' | 'C' | 'F'
  name: string
  permission?: string
  path?: string
  sort?: number
  status?: 0 | 1
}
