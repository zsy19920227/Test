import { useCallback } from 'react'
import { useAppSelector } from '@/store/hooks'

/**
 * 按钮级权限控制 hook。
 *
 * 用法：const { hasPerm } = usePermission();
 *      hasPerm('system:user:remove') === false 时不渲染删除按钮。
 *
 * 约定：admin 角色视为拥有全部权限（与后端 sys_role_menu 全量绑定一致，
 * 同时避免新增权限点后忘记给 admin 绑定导致管理员被锁）。
 * 权限数据来自 /auth/me，刷新页面或重新登录后生效。
 */
export function usePermission() {
  const user = useAppSelector((state) => state.auth.user)

  const hasPerm = useCallback(
    (perm?: string | null) => {
      if (!perm) return true
      if (!user) return false
      if (user.roles.includes('admin')) return true
      return user.permissions.includes(perm)
    },
    [user],
  )

  return { hasPerm, user }
}
