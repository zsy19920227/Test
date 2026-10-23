import { lazy, Suspense } from 'react'
import type { ReactNode } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import BasicLayout from '@/layouts/BasicLayout'
import { AuthGuard } from '@/components/AuthGuard'
import { PermGuard } from '@/components/PermGuard'
import PageLoading from '@/components/PageLoading'
import Login from '@/pages/login/Login'
import Dashboard from '@/pages/dashboard/Dashboard'
import NotFound from '@/pages/error/NotFound'

// 重型依赖页面懒加载，避免拖慢首屏
const InferencePage = lazy(() => import('@/pages/inference/InferencePage'))
const MonacoDemo = lazy(() => import('@/pages/samples/MonacoDemo'))
const FlowDemo = lazy(() => import('@/pages/samples/FlowDemo'))
const MermaidDemo = lazy(() => import('@/pages/samples/MermaidDemo'))
const UserManagement = lazy(() => import('@/pages/system/UserManagement'))
const RoleManagement = lazy(() => import('@/pages/system/RoleManagement'))
const MenuManagement = lazy(() => import('@/pages/system/MenuManagement'))

function lazily(element: ReactNode) {
  return <Suspense fallback={<PageLoading />}>{element}</Suspense>
}

export const router = createBrowserRouter([
  { path: '/login', element: <Login /> },
  {
    path: '/',
    element: (
      <AuthGuard>
        <BasicLayout />
      </AuthGuard>
    ),
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'performance/inference', element: lazily(<InferencePage />) },
      { path: 'samples/monaco', element: lazily(<MonacoDemo />) },
      { path: 'samples/flow', element: lazily(<FlowDemo />) },
      { path: 'samples/mermaid', element: lazily(<MermaidDemo />) },
      {
        path: 'system/users',
        element: lazily(
          <PermGuard perm="system:user:list">
            <UserManagement />
          </PermGuard>,
        ),
      },
      {
        path: 'system/roles',
        element: lazily(
          <PermGuard perm="system:role:list">
            <RoleManagement />
          </PermGuard>,
        ),
      },
      {
        path: 'system/menus',
        element: lazily(
          <PermGuard perm="system:menu:list">
            <MenuManagement />
          </PermGuard>,
        ),
      },
    ],
  },
  { path: '*', element: <NotFound /> },
])
