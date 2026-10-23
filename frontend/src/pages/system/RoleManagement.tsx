import { useCallback, useEffect, useState } from 'react'
import { Alert, Badge, Button, Card, Drawer, Form, Input, message, Modal, Popconfirm, Select, Space, Spin, Table, Tag, Tooltip, Tree } from 'antd'
import type { TableColumnsType } from 'antd'
import type { TreeDataNode } from 'antd'
import { DeleteOutlined, EditOutlined, PlusOutlined, ReloadOutlined, SafetyOutlined, SearchOutlined } from '@ant-design/icons'
import { menuApi } from '@/api/menu'
import { roleApi } from '@/api/role'
import type { SysMenuNode, SysRoleItem } from '@/api/types'
import { FieldLabel } from '@/components/FieldLabel'
import { PageHeader } from '@/components/PageHeader'
import { usePermission } from '@/hooks/usePermission'

interface RoleFormValues {
  code?: string
  name: string
  remark?: string
  status?: 0 | 1
}

/** 菜单树 -> antd TreeDataNode（按钮节点展示权限标识） */
function toTreeData(nodes: SysMenuNode[]): TreeDataNode[] {
  return nodes.map((n) => ({
    key: n.id,
    title: n.type === 'F' && n.permission ? `${n.name}（${n.permission}）` : n.name,
    children: toTreeData(n.children),
  }))
}

/** 收集树中全部节点 ID（用于默认展开） */
function collectIds(nodes: SysMenuNode[]): number[] {
  return nodes.flatMap((n) => [n.id, ...collectIds(n.children)])
}

/** id -> parentId 映射（用于计算祖先） */
function buildParentMap(nodes: SysMenuNode[], map = new Map<number, number>()): Map<number, number> {
  for (const n of nodes) {
    map.set(n.id, n.parentId)
    buildParentMap(n.children, map)
  }
  return map
}

/** 所有祖先节点 ID（不含根 0） */
function ancestorsOf(ids: number[], parentMap: Map<number, number>): number[] {
  const set = new Set<number>()
  for (const id of ids) {
    let p = parentMap.get(id)
    while (p && p !== 0) {
      set.add(p)
      p = parentMap.get(p)
    }
  }
  return [...set]
}

/** 树中的叶子节点 ID 集合（antd 非严格模式：父节点勾选会级联子孙，只能传叶子） */
function collectLeafIds(nodes: SysMenuNode[], set = new Set<number>()): Set<number> {
  for (const n of nodes) {
    if (n.children.length === 0) {
      set.add(n.id)
    } else {
      collectLeafIds(n.children, set)
    }
  }
  return set
}

/**
 * 角色管理：角色 CRUD + 权限分配（菜单/按钮树勾选）。
 * 操作按钮按权限点（system:role:add/edit/remove）渲染。
 */
export default function RoleManagement() {
  const { hasPerm } = usePermission()
  const canAdd = hasPerm('system:role:add')
  const canEdit = hasPerm('system:role:edit')
  const canRemove = hasPerm('system:role:remove')
  const showOps = canEdit || canRemove

  const [data, setData] = useState<SysRoleItem[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [keyword, setKeyword] = useState('')
  const [query, setQuery] = useState({ current: 1, size: 10 })

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<SysRoleItem | null>(null)
  const [saving, setSaving] = useState(false)
  const [form] = Form.useForm<RoleFormValues>()

  // 权限分配抽屉
  const [permRole, setPermRole] = useState<SysRoleItem | null>(null)
  const [menuTree, setMenuTree] = useState<SysMenuNode[]>([])
  const [treeExpandedKeys, setTreeExpandedKeys] = useState<number[]>([])
  const [checkedKeys, setCheckedKeys] = useState<number[]>([])
  const [halfCheckedKeys, setHalfCheckedKeys] = useState<number[]>([])
  const [treeLoading, setTreeLoading] = useState(false)
  const [permSaving, setPermSaving] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const page = await roleApi.page({
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

  const openCreate = () => {
    setEditing(null)
    form.resetFields()
    setModalOpen(true)
  }

  const openEdit = (role: SysRoleItem) => {
    setEditing(role)
    form.resetFields()
    form.setFieldsValue({ name: role.name, remark: role.remark ?? undefined, status: role.status })
    setModalOpen(true)
  }

  const handleSave = async () => {
    const values = await form.validateFields()
    setSaving(true)
    try {
      if (editing) {
        await roleApi.update({
          id: editing.id,
          name: values.name,
          remark: values.remark,
          status: values.status ?? 1,
        })
        message.success('角色已更新')
      } else {
        await roleApi.create({ code: values.code ?? '', name: values.name, remark: values.remark })
        message.success('角色已创建')
      }
      setModalOpen(false)
      await fetchData()
    } catch {
      // 拦截器已提示
    } finally {
      setSaving(false)
    }
  }

  const handleRemove = async (role: SysRoleItem) => {
    try {
      await roleApi.remove(role.id)
      message.success('角色已删除')
      await fetchData()
    } catch {
      // 拦截器已提示
    }
  }

  const openPerms = async (role: SysRoleItem) => {
    setPermRole(role)
    setCheckedKeys([])
    setHalfCheckedKeys([])
    setTreeLoading(true)
    try {
      const [tree, ids] = await Promise.all([menuApi.tree(), roleApi.menuIds(role.id)])
      setMenuTree(tree)
      setTreeExpandedKeys(collectIds(tree))
      // antd 非严格勾选模式下 checkedKeys 只能放叶子节点，父节点状态由推导得出
      const leafIds = collectLeafIds(tree)
      setCheckedKeys(ids.filter((id) => leafIds.has(id)))
    } catch {
      // 拦截器已提示
    } finally {
      setTreeLoading(false)
    }
  }

  const handleSavePerms = async () => {
    if (!permRole) return
    setPermSaving(true)
    try {
      // 提交 = 勾选叶子 + 半选父级 + 勾选项的全部祖先（目录/菜单也要绑定）
      const parentMap = buildParentMap(menuTree)
      const menuIds = [...new Set([...checkedKeys, ...halfCheckedKeys, ...ancestorsOf(checkedKeys, parentMap)])]
      await roleApi.update({
        id: permRole.id,
        name: permRole.name,
        remark: permRole.remark ?? undefined,
        status: permRole.status,
        menuIds,
      })
      message.success(`角色「${permRole.name}」权限已更新，对应用户即时生效`)
      setPermRole(null)
    } catch {
      // 拦截器已提示
    } finally {
      setPermSaving(false)
    }
  }

  const columns: TableColumnsType<SysRoleItem> = [
    { title: 'ID', dataIndex: 'id', width: 64, className: 'tabular' },
    { title: '角色编码', dataIndex: 'code', render: (code: string) => <Tag>{code}</Tag> },
    { title: '角色名称', dataIndex: 'name' },
    { title: '备注', dataIndex: 'remark', ellipsis: true },
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
            width: 150,
            render: (_: unknown, role: SysRoleItem) => (
              <Space size={4}>
                {canEdit && (
                  <Tooltip title="编辑">
                    <Button
                      type="text"
                      size="small"
                      icon={<EditOutlined />}
                      aria-label={`编辑角色 ${role.name}`}
                      onClick={() => openEdit(role)}
                    />
                  </Tooltip>
                )}
                {canEdit && (
                  <Tooltip title="分配权限">
                    <Button
                      type="text"
                      size="small"
                      icon={<SafetyOutlined />}
                      aria-label={`分配权限 ${role.name}`}
                      onClick={() => void openPerms(role)}
                    />
                  </Tooltip>
                )}
                {canRemove && (
                  <Popconfirm
                    title={`确认删除角色「${role.name}」？`}
                    okText="删除"
                    cancelText="取消"
                    onConfirm={() => void handleRemove(role)}
                  >
                    <Tooltip title="删除">
                      <Button
                        type="text"
                        size="small"
                        danger
                        icon={<DeleteOutlined />}
                        aria-label={`删除角色 ${role.name}`}
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

  const isBuiltInAdmin = permRole?.code === 'admin'

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="角色管理"
        description="角色定义与菜单 / 按钮权限分配"
        extra={
          canAdd && (
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              新增角色
            </Button>
          )
        }
      />
      <Card
        size="small"
        title="角色列表"
        extra={
          <Space>
            <Input.Search
              allowClear
              placeholder="编码 / 名称"
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
                aria-label="刷新角色列表"
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
            message="无法加载角色列表"
            description="请确认后端服务已启动，且当前账号具备 system:role:list 权限。"
          />
        )}
        <Table<SysRoleItem>
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
        title={editing ? `编辑角色：${editing.name}` : '新增角色'}
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
                name="code"
                label={<FieldLabel label="角色编码" hint="系统内唯一，如 operator，创建后不可修改" />}
                rules={[
                  { required: true, message: '请输入角色编码' },
                  { pattern: /^[a-zA-Z0-9_]{2,32}$/, message: '2-32 位字母/数字/下划线' },
                ]}
              >
                <Input autoComplete="off" />
              </Form.Item>
            )}
            <Form.Item
              name="name"
              label={<FieldLabel label="角色名称" hint="显示在角色列表与用户分配处" />}
              rules={[{ required: true, message: '请输入角色名称' }]}
            >
              <Input />
            </Form.Item>
            {editing && (
              <Form.Item
                name="status"
                label={<FieldLabel label="状态" hint="停用后拥有该角色的用户不再获得其权限" />}
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
          <Form.Item name="remark" label={<FieldLabel label="备注" hint="角色的用途说明" />}>
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>

      <Drawer
        title={`分配权限：${permRole?.name ?? ''}`}
        width={420}
        open={permRole !== null}
        onClose={() => setPermRole(null)}
        footer={
          <Space className="flex justify-end">
            <Button onClick={() => setPermRole(null)}>取消</Button>
            <Button
              type="primary"
              loading={permSaving}
              disabled={isBuiltInAdmin}
              onClick={() => void handleSavePerms()}
            >
              保存
            </Button>
          </Space>
        }
      >
        {isBuiltInAdmin && (
          <Alert
            className="mb-3"
            type="info"
            showIcon
            message="内置管理员角色拥有全部权限，不可修改。"
          />
        )}
        {treeLoading ? (
          <div className="flex justify-center py-10">
            <Spin />
          </div>
        ) : (
          <Tree
            checkable
            checkedKeys={checkedKeys}
            treeData={toTreeData(menuTree)}
            expandedKeys={treeExpandedKeys}
            selectable={false}
            onExpand={(keys) => setTreeExpandedKeys([...keys] as number[])}
            onCheck={(checked, info) => {
              setCheckedKeys(checked as number[])
              setHalfCheckedKeys((info.halfCheckedKeys ?? []) as number[])
            }}
          />
        )}
      </Drawer>
    </div>
  )
}
