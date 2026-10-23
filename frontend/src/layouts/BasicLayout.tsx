import { useEffect, useMemo } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Dropdown, Layout, Menu } from 'antd'
import type { MenuProps } from 'antd'
import {
  Activity,
  Cpu,
  FileCode2,
  Gauge,
  LayoutGrid,
  ListTree,
  LogOut,
  Network,
  PanelLeft,
  Settings,
  ShieldCheck,
  UserCircle2,
  Users,
  Workflow,
} from 'lucide-react'
import { fetchCurrentUser, logout } from '@/store/authSlice'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { useUIStore } from '@/store/useUIStore'
import { usePermission } from '@/hooks/usePermission'
import { tokens } from '@/styles/tokens'

const { Header, Sider, Content } = Layout

export default function BasicLayout() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const location = useLocation()

  const token = useAppSelector((state) => state.auth.token)
  const user = useAppSelector((state) => state.auth.user)
  const sidebarCollapsed = useUIStore((s) => s.sidebarCollapsed)
  const toggleSidebar = useUIStore((s) => s.toggleSidebar)
  const { hasPerm } = usePermission()

  // 侧栏菜单：系统管理子项按权限点过滤（viewer 只看到自己可访问的页面）
  const menuItems: MenuProps['items'] = useMemo(() => {
    const systemChildren = [
      hasPerm('system:user:list') && {
        key: '/system/users',
        icon: <Users size={16} />,
        label: '用户管理',
      },
      hasPerm('system:role:list') && {
        key: '/system/roles',
        icon: <ShieldCheck size={16} />,
        label: '角色管理',
      },
      hasPerm('system:menu:list') && {
        key: '/system/menus',
        icon: <ListTree size={16} />,
        label: '菜单管理',
      },
    ].filter(Boolean) as NonNullable<MenuProps['items']>

    return [
      { key: '/dashboard', icon: <Gauge size={16} />, label: '工作台' },
      {
        key: '/performance/inference',
        icon: <Activity size={16} />,
        label: '推理性能',
      },
      {
        key: 'samples',
        icon: <LayoutGrid size={16} />,
        label: '组件示例',
        children: [
          {
            key: '/samples/monaco',
            icon: <FileCode2 size={16} />,
            label: 'Monaco 编辑器',
          },
          {
            key: '/samples/flow',
            icon: <Workflow size={16} />,
            label: 'React Flow 流程图',
          },
          { key: '/samples/mermaid', icon: <Network size={16} />, label: 'Mermaid 图表' },
        ],
      },
      ...(systemChildren.length > 0
        ? [
            {
              key: 'system',
              icon: <Settings size={16} />,
              label: '系统管理',
              children: systemChildren,
            },
          ]
        : []),
    ]
  }, [hasPerm])

  // 已有 token 但还没有用户信息（如刷新页面）时补拉一次
  useEffect(() => {
    if (token && !user) {
      void dispatch(fetchCurrentUser())
    }
  }, [token, user, dispatch])

  const handleLogout = async () => {
    await dispatch(logout())
    navigate('/login', { replace: true })
  }

  const userMenu: MenuProps['items'] = [
    {
      key: 'logout',
      icon: <LogOut size={14} />,
      label: '退出登录',
      onClick: () => void handleLogout(),
    },
  ]

  return (
    <Layout className="h-full">
      {/* 键盘用户跳转链接（a11y） */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-[100] focus:rounded focus:px-3 focus:py-1.5 focus:text-xs"
        style={{
          background: 'var(--surface-raised)',
          border: '1px solid var(--surface-border)',
          color: 'var(--text)',
        }}
      >
        跳到主内容
      </a>
      <Header
        className="flex items-center gap-3 px-4"
        style={{
          height: 52,
          lineHeight: '52px',
          background: 'var(--surface)',
          borderBottom: '1px solid var(--surface-border)',
          boxShadow: 'var(--shadow-header)',
        }}
      >
        {/* 品牌区：渐变图标容器 + 文字（标准产品标识处理） */}
        <div className="flex select-none items-center gap-2.5">
          <span
            className="flex h-7 w-7 items-center justify-center rounded-lg"
            style={{
              background: 'var(--brand-grad)',
            }}
          >
            <Cpu size={16} color={tokens.surface} strokeWidth={2.2} />
          </span>
          <span className="text-[15px] font-semibold tracking-wide">图灵测试平台</span>
        </div>
        <span className="text-xs text-text-muted">Turing Test Platform · 脚手架</span>
        <div className="flex-1" />
        <Dropdown menu={{ items: userMenu }} placement="bottomRight">
          <button
            type="button"
            className="flex cursor-pointer items-center gap-2 px-2.5 py-1 text-xs"
            style={{
              border: '1px solid var(--surface-border)',
              borderRadius: 'var(--radius-sm)',
              background: 'transparent',
              color: 'var(--text-secondary)',
            }}
          >
            <UserCircle2 size={14} />
            {user?.nickname ?? user?.username ?? '未登录'}
          </button>
        </Dropdown>
      </Header>

      <Layout>
        <Sider
          width={200}
          collapsed={sidebarCollapsed}
          theme="light"
          style={{ borderRight: '1px solid var(--surface-border)' }}
        >
          <div className="flex h-full flex-col">
            <Menu
              theme="light"
              mode="inline"
              items={menuItems}
              selectedKeys={[location.pathname]}
              defaultOpenKeys={['samples', 'system']}
              onClick={({ key }) => navigate(key)}
              style={{
                borderInlineEnd: 'none',
                paddingTop: 8,
                background: 'transparent',
                flex: 1,
              }}
            />
            <div className="p-2">
              <button
                type="button"
                onClick={toggleSidebar}
                aria-label={sidebarCollapsed ? '展开侧栏' : '收起侧栏'}
                title={sidebarCollapsed ? '展开侧栏' : '收起侧栏'}
                className="flex w-full cursor-pointer items-center justify-center gap-2 py-1.5 text-xs"
                style={{
                  border: '1px solid var(--surface-border)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-muted)',
                  background: 'transparent',
                }}
              >
                <PanelLeft size={14} />
                {!sidebarCollapsed && <span>收起侧栏</span>}
              </button>
            </div>
          </div>
        </Sider>

        <Content
          id="main-content"
          tabIndex={-1}
          className="overflow-y-auto p-5"
          style={{ background: 'var(--bg)' }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}
