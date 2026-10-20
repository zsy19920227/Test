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
  createTime: string
}

export interface UserPageQuery {
  current?: number
  size?: number
  keyword?: string
}
