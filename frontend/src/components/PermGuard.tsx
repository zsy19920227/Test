import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import PageLoading from '@/components/PageLoading'
import { usePermission } from '@/hooks/usePermission'

/**
 * 页面级权限守卫：无对应权限点时跳回工作台。
 * 用户信息异步加载期间展示 Loading，避免权限未就绪时误判。
 */
export function PermGuard({ perm, children }: { perm: string; children: ReactNode }) {
  const { hasPerm, user } = usePermission()

  if (!user) {
    return <PageLoading />
  }
  if (!hasPerm(perm)) {
    return <Navigate to="/dashboard" replace />
  }
  return <>{children}</>
}
