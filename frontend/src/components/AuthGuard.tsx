import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAppSelector } from '@/store/hooks'

/** 路由守卫：无 token 一律踢回登录页，并记住来路 */
export function AuthGuard({ children }: { children: ReactNode }) {
  const token = useAppSelector((state) => state.auth.token)
  const location = useLocation()

  if (!token) {
    return (
      <Navigate
        to={`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`}
        replace
      />
    )
  }
  return <>{children}</>
}
