import { useCallback, useEffect, useState } from 'react'
import { Alert, Badge, Button, Card, Input, Space, Table, Tag, Tooltip } from 'antd'
import type { TableColumnsType } from 'antd'
import { ReloadOutlined, SearchOutlined } from '@ant-design/icons'
import { userApi } from '@/api/user'
import type { SysUserItem } from '@/api/types'

/**
 * 用户管理：演示「后端分页 + 权限接口」的完整链路。
 * 需要后端启动且以 admin 登录后才能拉到数据。
 */
export default function UserManagement() {
  const [data, setData] = useState<SysUserItem[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [keyword, setKeyword] = useState('')
  const [query, setQuery] = useState({ current: 1, size: 10 })

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const page = await userApi.page({
        ...query,
        keyword: keyword.trim() || undefined,
      })
      setData(page.records)
      setTotal(page.total)
    } catch (e) {
      setError(e instanceof Error ? e.message : '加载失败')
    } finally {
      setLoading(false)
    }
  }, [query, keyword])

  useEffect(() => {
    void fetchData()
  }, [fetchData])

  const columns: TableColumnsType<SysUserItem> = [
    { title: 'ID', dataIndex: 'id', width: 64, className: 'tabular' },
    { title: '用户名', dataIndex: 'username' },
    { title: '昵称', dataIndex: 'nickname' },
    { title: '邮箱', dataIndex: 'email' },
    {
      title: '角色',
      dataIndex: 'roleCodes',
      render: (roles: string[]) => (
        <>
          {roles.map((r) => (
            <Tag key={r}>{r}</Tag>
          ))}
        </>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 80,
      render: (status: 0 | 1) =>
        status === 1 ? (
          <Badge status="success" text="启用" />
        ) : (
          <Badge status="default" text="停用" />
        ),
    },
    { title: '创建时间', dataIndex: 'createTime', className: 'tabular' },
  ]

  return (
    <>
      <h1 className="sr-only">用户管理</h1>
      <Card
        size="small"
        title="用户管理（RBAC 分页示例）"
        extra={
          <Space>
            <Input.Search
              allowClear
              placeholder="用户名 / 昵称"
              prefix={<SearchOutlined />}
              style={{ width: 220 }}
              onSearch={(v) => {
                setKeyword(v)
                setQuery((q) => ({ ...q, current: 1 }))
              }}
            />
            <Tooltip title="刷新">
              <Button
                type="text"
                size="small"
                icon={<ReloadOutlined />}
                aria-label="刷新用户列表"
                onClick={() => void fetchData()}
              />
            </Tooltip>
          </Space>
        }
      >
        {error && (
          <Alert
            className="mb-3"
            type="warning"
            showIcon
            message="无法加载用户列表"
            description="请确认后端服务已启动（默认 http://localhost:8080），且当前账号具备 system:user:list 权限。"
          />
        )}
        <Table<SysUserItem>
          rowKey="id"
          columns={columns}
          dataSource={data}
          loading={loading}
          size="small"
          pagination={{
            current: query.current,
            pageSize: query.size,
            total,
            showSizeChanger: true,
            showTotal: (t) => `共 ${t} 条`,
            onChange: (page, pageSize) => setQuery({ current: page, size: pageSize }),
          }}
        />
      </Card>
    </>
  )
}
