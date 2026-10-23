import { useCallback, useEffect, useState } from 'react'
import { Alert, Badge, Button, Card, Form, Input, message, Modal, Popconfirm, Select, Space, Table, Tag, Tooltip } from 'antd'
import type { TableColumnsType } from 'antd'
import { DeleteOutlined, EditOutlined, PlusOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons'
import { roleApi } from '@/api/role'
import { userApi } from '@/api/user'
import type { SysRoleItem, SysUserItem } from '@/api/types'
import { FieldLabel } from '@/components/FieldLabel'
import { PageHeader } from '@/components/PageHeader'
import { usePermission } from '@/hooks/usePermission'

interface UserFormValues {
  username?: string
  nickname: string
  email?: string
  password?: string
  status?: 0 | 1
  roleIds?: number[]
}

/**
 * 用户管理：完整 CRUD + 角色分配。
 * 操作按钮按权限点（system:user:add/edit/remove）渲染，只读用户仅能查看。
 */
export default function UserManagement() {
  const { hasPerm } = usePermission()
  const canAdd = hasPerm('system:user:add')
  const canEdit = hasPerm('system:user:edit')
  const canRemove = hasPerm('system:user:remove')
  const showOps = canEdit || canRemove

  const [data, setData] = useState<SysUserItem[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [keyword, setKeyword] = useState('')
  const [query, setQuery] = useState({ current: 1, size: 10 })

  const [roles, setRoles] = useState<SysRoleItem[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<SysUserItem | null>(null)
  const [saving, setSaving] = useState(false)
  const [form] = Form.useForm<UserFormValues>()

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

  const loadRoles = useCallback(async () => {
    if (roles.length === 0) {
      try {
        setRoles(await roleApi.all())
      } catch {
        // 角色列表加载失败时仍可提交表单（不分配角色）
      }
    }
  }, [roles.length])

  const openCreate = () => {
    setEditing(null)
    form.resetFields()
    form.setFieldsValue({ roleIds: [] })
    setModalOpen(true)
    void loadRoles()
  }

  const openEdit = (user: SysUserItem) => {
    setEditing(user)
    form.resetFields()
    form.setFieldsValue({
      nickname: user.nickname,
      email: user.email ?? undefined,
      status: user.status,
      roleIds: user.roleIds,
    })
    setModalOpen(true)
    void loadRoles()
  }

  const handleSave = async () => {
    const values = await form.validateFields()
    setSaving(true)
    try {
      if (editing) {
        await userApi.update({
          id: editing.id,
          nickname: values.nickname,
          email: values.email,
          status: values.status ?? 1,
          roleIds: values.roleIds ?? [],
        })
        message.success('用户已更新')
      } else {
        await userApi.create({
          username: values.username ?? '',
          nickname: values.nickname,
          email: values.email,
          password: values.password || undefined,
          roleIds: values.roleIds ?? [],
        })
        message.success('用户已创建')
      }
      setModalOpen(false)
      await fetchData()
    } catch {
      // 表单校验失败或请求失败（拦截器已提示），保持弹窗
    } finally {
      setSaving(false)
    }
  }

  const handleRemove = async (user: SysUserItem) => {
    try {
      await userApi.remove(user.id)
      message.success('用户已删除')
      await fetchData()
    } catch {
      // 拦截器已提示
    }
  }

  const columns: TableColumnsType<SysUserItem> = [
    { title: 'ID', dataIndex: 'id', width: 64, className: 'tabular' },
    { title: '用户名', dataIndex: 'username' },
    { title: '昵称', dataIndex: 'nickname' },
    { title: '邮箱', dataIndex: 'email' },
    {
      title: '角色',
      dataIndex: 'roleCodes',
      render: (codes: string[]) => (
        <>
          {codes.map((c) => (
            <Tag key={c}>{c}</Tag>
          ))}
        </>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 80,
      render: (status: 0 | 1) =>
        status === 1 ? <Badge status="success" text="启用" /> : <Badge status="default" text="停用" />,
    },
    { title: '创建时间', dataIndex: 'createTime', className: 'tabular' },
    ...(showOps
      ? [
          {
            title: '操作',
            key: 'ops',
            width: 120,
            render: (_: unknown, user: SysUserItem) => (
              <Space size={4}>
                {canEdit && (
                  <Tooltip title="编辑">
                    <Button
                      type="text"
                      size="small"
                      icon={<EditOutlined />}
                      aria-label={`编辑用户 ${user.username}`}
                      onClick={() => openEdit(user)}
                    />
                  </Tooltip>
                )}
                {canRemove && (
                  <Popconfirm
                    title={`确认删除用户「${user.username}」？`}
                    description="逻辑删除，数据保留"
                    okText="删除"
                    cancelText="取消"
                    onConfirm={() => void handleRemove(user)}
                  >
                    <Tooltip title="删除">
                      <Button
                        type="text"
                        size="small"
                        danger
                        icon={<DeleteOutlined />}
                        aria-label={`删除用户 ${user.username}`}
                      />
                    </Tooltip>
                  </Popconfirm>
                )}
              </Space>
            ),
          },
        ]
      : []),
  ]

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="用户管理"
        description="平台账号的增删改查与角色分配"
        extra={
          canAdd && (
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              新增用户
            </Button>
          )
        }
      />
      <Card
        size="small"
        title="用户列表"
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
            description="请确认后端服务已启动（默认 http://localhost:8081），且当前账号具备 system:user:list 权限。"
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

      <Modal
        title={editing ? `编辑用户：${editing.username}` : '新增用户'}
        open={modalOpen}
        onOk={() => void handleSave()}
        onCancel={() => setModalOpen(false)}
        confirmLoading={saving}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" className="pt-2">
          <div className="grid grid-cols-2 gap-x-4">
            {!editing && (
              <Form.Item
                name="username"
                label={<FieldLabel label="用户名" hint="登录账号，创建后不可修改" />}
                rules={[
                  { required: true, message: '请输入用户名' },
                  { pattern: /^[a-zA-Z0-9_]{3,32}$/, message: '3-32 位字母/数字/下划线' },
                ]}
              >
                <Input autoComplete="off" />
              </Form.Item>
            )}
            <Form.Item
              name="nickname"
              label={<FieldLabel label="昵称" hint="显示在页面右上角的名称" />}
              rules={[{ required: true, message: '请输入昵称' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="email"
              label="邮箱"
              rules={[{ type: 'email', message: '邮箱格式不正确' }]}
            >
              <Input type="email" autoComplete="email" />
            </Form.Item>
            {!editing && (
              <Form.Item
                name="password"
                label={<FieldLabel label="初始密码" hint="不填则使用默认密码 Turing@123" />}
                rules={[{ min: 6, message: '密码至少 6 位' }]}
              >
                <Input.Password autoComplete="new-password" />
              </Form.Item>
            )}
            {editing && (
              <Form.Item
                name="status"
                label={<FieldLabel label="状态" hint="停用后用户无法登录" />}
                rules={[{ required: true, message: '请选择状态' }]}
              >
                <Select
                  options={[
                    { value: 1, label: '启用' },
                    { value: 0, label: '停用' },
                  ]}
                />
              </Form.Item>
            )}
          </div>
          <Form.Item
            name="roleIds"
            label={<FieldLabel label="角色" hint="勾选用户拥有的角色，决定其可访问的页面与可执行的操作" />}
          >
            <Select
              mode="multiple"
              allowClear
              placeholder="选择角色（可多选）"
              options={roles.map((r) => ({ value: r.id, label: `${r.name}（${r.code}）` }))}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
