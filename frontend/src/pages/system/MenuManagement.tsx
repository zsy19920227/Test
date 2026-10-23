import { useCallback, useEffect, useState } from 'react'
import { Alert, Badge, Button, Card, Divider, Form, Input, InputNumber, message, Modal, Popconfirm, Radio, Space, Table, Tag, Tooltip, TreeSelect } from 'antd'
import type { TableColumnsType } from 'antd'
import type { TreeSelectProps } from 'antd'
import { AppstoreOutlined, ControlOutlined, DeleteOutlined, EditOutlined, FolderOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons'
import type { ReactNode } from 'react'
import { menuApi } from '@/api/menu'
import type { MenuPayload, SysMenuNode } from '@/api/types'
import { FieldLabel } from '@/components/FieldLabel'
import { PageHeader } from '@/components/PageHeader'
import { usePermission } from '@/hooks/usePermission'

interface MenuFormValues {
  parentId: number
  type: 'M' | 'C' | 'F'
  name: string
  permission?: string
  path?: string
  sort?: number
  status?: 0 | 1
}

type MenuType = SysMenuNode['type']

/** 三类节点的元信息：图标 / 标签 / 颜色 / 一句话说明 / 编辑表单里的详细说明 */
const TYPE_META: Record<MenuType, { icon: ReactNode; label: string; color: string; brief: string; detail: ReactNode }> = {
  M: {
    icon: <FolderOutlined />,
    label: '目录',
    color: 'blue',
    brief: '侧栏分组，如「系统管理」',
    detail: '目录只用于侧栏分组，不对应任何页面，无需填写路由或权限标识。例如「系统管理」就是一个目录。',
  },
  C: {
    icon: <AppstoreOutlined />,
    label: '菜单',
    color: 'geekblue',
    brief: '一个页面，如「用户管理」',
    detail: '菜单对应前端的一个页面，需要在下方填写「路由路径」——即浏览器地址栏中的页面地址（如 /system/users）。新增页面时才需要配置，通常由开发提供。',
  },
  F: {
    icon: <ControlOutlined />,
    label: '按钮',
    color: 'orange',
    brief: '页面里的操作权限点',
    detail: '按钮代表页面里的一个操作（新增 / 编辑 / 删除…），需要在下方填写「权限标识」。后端接口和前端按钮都会校验它——角色勾选了某按钮权限，用户才能执行对应操作。标识须与后端接口注解 @PreAuthorize 一致，通常由开发提供。',
  },
}

/** 表格行：叶子节点去掉空 children（避免出现无意义的展开箭头） */
type MenuRow = Omit<SysMenuNode, 'children'> & { children?: MenuRow[] }

function toTableData(nodes: SysMenuNode[]): MenuRow[] {
  return nodes.map((n) => ({
    id: n.id,
    parentId: n.parentId,
    type: n.type,
    name: n.name,
    permission: n.permission,
    path: n.path,
    sort: n.sort,
    status: n.status,
    children: n.children.length > 0 ? toTableData(n.children) : undefined,
  }))
}

/** 菜单树 -> TreeSelect 数据（含「根目录」选项） */
function toSelectData(nodes: SysMenuNode[]): TreeSelectProps['treeData'] {
  return nodes
    .filter((n) => n.type !== 'F')
    .map((n) => ({
      value: n.id,
      title: n.name,
      children: toSelectData(n.children),
    }))
}

function collectIds(nodes: SysMenuNode[]): number[] {
  return nodes.flatMap((n) => [n.id, ...collectIds(n.children)])
}

/**
 * 菜单/权限点管理：树形 CRUD（目录 M / 菜单 C / 按钮权限点 F）。
 * 操作按钮按权限点（system:menu:add/edit/remove）渲染。
 */
export default function MenuManagement() {
  const { hasPerm } = usePermission()
  const canAdd = hasPerm('system:menu:add')
  const canEdit = hasPerm('system:menu:edit')
  const canRemove = hasPerm('system:menu:remove')
  const showOps = canEdit || canRemove

  const [tree, setTree] = useState<SysMenuNode[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expandedKeys, setExpandedKeys] = useState<number[]>([])

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<MenuRow | null>(null)
  const [saving, setSaving] = useState(false)
  const [form] = Form.useForm<MenuFormValues>()
  const formType = (Form.useWatch('type', form) ?? 'C') as MenuType

  const fetchTree = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const tree = await menuApi.tree()
      setTree(tree)
      setExpandedKeys(collectIds(tree))
    } catch (e) {
      setError(e instanceof Error ? e.message : '加载失败')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchTree()
  }, [fetchTree])

  const openCreate = (parentId = 0) => {
    setEditing(null)
    form.resetFields()
    form.setFieldsValue({ parentId, type: parentId === 0 ? 'M' : 'C', sort: 0, status: 1 })
    setModalOpen(true)
  }

  const openEdit = (node: MenuRow) => {
    setEditing(node)
    form.resetFields()
    form.setFieldsValue({
      parentId: node.parentId,
      type: node.type,
      name: node.name,
      permission: node.permission ?? undefined,
      path: node.path ?? undefined,
      sort: node.sort,
      status: node.status,
    })
    setModalOpen(true)
  }

  const handleSave = async () => {
    const values = await form.validateFields()
    setSaving(true)
    try {
      const payload: MenuPayload = {
        parentId: values.parentId,
        type: values.type,
        name: values.name,
        permission: values.permission,
        path: values.path,
        sort: values.sort ?? 0,
        status: values.status ?? 1,
      }
      if (editing) {
        await menuApi.update({ ...payload, id: editing.id })
        message.success('菜单已更新')
      } else {
        await menuApi.create(payload)
        message.success('菜单已创建')
      }
      setModalOpen(false)
      await fetchTree()
    } catch {
      // 拦截器已提示
    } finally {
      setSaving(false)
    }
  }

  const handleRemove = async (node: MenuRow) => {
    try {
      await menuApi.remove(node.id)
      message.success('菜单已删除')
      await fetchTree()
    } catch {
      // 拦截器已提示
    }
  }

  const columns: TableColumnsType<MenuRow> = [
    { title: '名称', dataIndex: 'name' },
    {
      title: (
        <Tooltip title="目录=侧栏分组 ｜ 菜单=一个页面 ｜ 按钮=页面内操作的权限点">
          <span>类型</span>
        </Tooltip>
      ),
      dataIndex: 'type',
      width: 96,
      render: (type: MenuType) => (
        <Tag color={TYPE_META[type].color} icon={TYPE_META[type].icon}>
          {TYPE_META[type].label}
        </Tag>
      ),
    },
    {
      title: (
        <Tooltip title="按钮类型节点的权限标识，控制角色可执行哪些操作">
          <span>权限标识</span>
        </Tooltip>
      ),
      dataIndex: 'permission',
      render: (perm: string | null) =>
        perm ? <code className="text-xs">{perm}</code> : <span className="opacity-40">—</span>,
    },
    {
      title: (
        <Tooltip title="菜单类型节点对应的页面地址">
          <span>路由路径</span>
        </Tooltip>
      ),
      dataIndex: 'path',
      render: (p: string | null) => (p ? <code className="text-xs">{p}</code> : <span className="opacity-40">—</span>),
    },
    {
      title: (
        <Tooltip title="同级节点按此数字从小到大排列；数字相同按 ID 升序">
          <span>排序</span>
        </Tooltip>
      ),
      dataIndex: 'sort',
      width: 72,
      className: 'tabular',
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 80,
      render: (status: 0 | 1) =>
        status === 1 ? <Badge status="success" text="启用" /> : <Badge status="default" text="停用" />,
    },
    ...(showOps
      ? [
          {
            title: '操作',
            key: 'ops',
            width: 150,
            render: (_: unknown, node: MenuRow) => (
              <Space size={4}>
                {canAdd && node.type !== 'F' && (
                  <Tooltip title={`在「${node.name}」下新增子节点`}>
                    <Button
                      type="text"
                      size="small"
                      icon={<PlusOutlined />}
                      aria-label={`为 ${node.name} 新增子节点`}
                      onClick={() => openCreate(node.id)}
                    />
                  </Tooltip>
                )}
                {canEdit && (
                  <Tooltip title="编辑">
                    <Button
                      type="text"
                      size="small"
                      icon={<EditOutlined />}
                      aria-label={`编辑菜单 ${node.name}`}
                      onClick={() => openEdit(node)}
                    />
                  </Tooltip>
                )}
                {canRemove && (
                  <Popconfirm
                    title={`确认删除「${node.name}」？`}
                    okText="删除"
                    cancelText="取消"
                    onConfirm={() => void handleRemove(node)}
                  >
                    <Tooltip title="删除">
                      <Button
                        type="text"
                        size="small"
                        danger
                        icon={<DeleteOutlined />}
                        aria-label={`删除菜单 ${node.name}`}
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
        title="菜单管理"
        description="目录 / 菜单 / 按钮权限点的树形管理"
        extra={
          canAdd && (
            <Button type="primary" icon={<PlusOutlined />} onClick={() => openCreate(0)}>
              新增根节点
            </Button>
          )
        }
      />
      <Card
        size="small"
        title="菜单树"
        extra={
          <Tooltip title="刷新">
            <Button
              type="text"
              size="small"
              icon={<ReloadOutlined />}
              aria-label="刷新菜单树"
              onClick={() => void fetchTree()}
            />
          </Tooltip>
        }
      >
        <Alert
          className="mb-3"
          type="info"
          showIcon
          closable
          message="菜单树由三类节点组成，权限即通过勾选这些节点分配给角色"
          description={
            <div className="text-xs leading-6">
              {(Object.keys(TYPE_META) as MenuType[]).map((t) => (
                <div key={t}>
                  <Tag color={TYPE_META[t].color} icon={TYPE_META[t].icon}>
                    {TYPE_META[t].label}
                  </Tag>
                  {TYPE_META[t].brief}
                </div>
              ))}
            </div>
          }
        />
        {error && (
          <Alert
            className="mb-3"
            type="warning"
            showIcon
            message="无法加载菜单树"
            description="请确认后端服务已启动，且当前账号具备 system:menu:list 权限。"
          />
        )}
        <Table<MenuRow>
          rowKey="id"
          columns={columns}
          dataSource={toTableData(tree)}
          loading={loading}
          size="small"
          expandable={{
            expandedRowKeys: expandedKeys,
            onExpandedRowsChange: (keys) => setExpandedKeys([...keys] as number[]),
          }}
          pagination={false}
        />
      </Card>

      <Modal
        title={editing ? `编辑：${TYPE_META[editing.type].label}「${editing.name}」` : '新增菜单 / 权限点'}
        width={560}
        open={modalOpen}
        onOk={() => void handleSave()}
        onCancel={() => setModalOpen(false)}
        okText={editing ? '保存' : '创建'}
        cancelText="取消"
        confirmLoading={saving}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" className="pt-2">
          <Divider titlePlacement="left" orientationMargin={0} className="text-xs">
            挂载位置
          </Divider>
          <div className="grid grid-cols-2 gap-x-4">
            <Form.Item
              name="parentId"
              label={<FieldLabel label="父级节点" hint="该节点挂在哪个节点之下；根目录表示作为顶级节点" />}
              rules={[{ required: true, message: '请选择父级' }]}
            >
              <TreeSelect
                allowClear={false}
                treeDefaultExpandAll
                treeData={[{ value: 0, title: '根目录（作为顶级节点）' }, ...(toSelectData(tree) ?? [])]}
              />
            </Form.Item>
            <Form.Item name="type" label={<FieldLabel label="节点类型" hint="决定该节点在侧栏/权限体系中扮演的角色" />} rules={[{ required: true, message: '请选择类型' }]}>
              <Radio.Group
                optionType="button"
                buttonStyle="solid"
                className="flex w-full [&_.ant-radio-button-wrapper]:w-1/3 [&_.ant-radio-button-wrapper]:text-center"
              >
                {(Object.keys(TYPE_META) as MenuType[]).map((t) => (
                  <Radio.Button key={t} value={t}>
                    {TYPE_META[t].icon} {TYPE_META[t].label}
                  </Radio.Button>
                ))}
              </Radio.Group>
            </Form.Item>
          </div>
          <Alert
            className="mb-4"
            type="info"
            message={<span className="text-xs leading-5">{TYPE_META[formType].detail}</span>}
          />

          <Divider titlePlacement="left" orientationMargin={0} className="text-xs">
            基本信息
          </Divider>
          <div className="grid grid-cols-2 gap-x-4">
            <Form.Item
              name="name"
              label={<FieldLabel label="名称" hint="显示在侧栏或权限树中的文字" />}
              rules={[{ required: true, message: '请输入名称' }]}
            >
              <Input
                placeholder={formType === 'F' ? '如：删除用户' : formType === 'C' ? '如：用户管理' : '如：系统管理'}
              />
            </Form.Item>
            <Form.Item
              name="sort"
              label={<FieldLabel label="排序" hint="同级节点按此数字从小到大排列" />}
              initialValue={0}
              rules={[{ required: true, message: '请填写排序' }]}
            >
              <InputNumber min={0} precision={0} className="w-full" />
            </Form.Item>
          </div>

          {formType === 'C' && (
            <>
              <Divider titlePlacement="left" orientationMargin={0} className="text-xs">
                页面路由
              </Divider>
              <Form.Item
                name="path"
                label={<FieldLabel label="路由路径" hint="页面在浏览器地址栏中的地址（以 / 开头）。新增页面时由开发提供，与前端路由保持一致。" />}
                rules={[
                  { required: true, message: '菜单必须填写路由路径' },
                  { pattern: /^\/[a-zA-Z0-9\-_/]*$/, message: '以 / 开头，仅含字母/数字/中划线/下划线' },
                ]}
              >
                <Input placeholder="如：/system/users" autoComplete="off" />
              </Form.Item>
            </>
          )}
          {formType === 'F' && (
            <>
              <Divider titlePlacement="left" orientationMargin={0} className="text-xs">
                权限标识
              </Divider>
              <Form.Item
                name="permission"
                label={<FieldLabel label="权限标识" hint="格式「模块:资源:动作」。须与后端接口注解 @PreAuthorize 中的标识完全一致；角色勾选本节点后，用户才能执行该操作。" />}
                rules={[
                  { required: true, message: '按钮/权限点必须填写权限标识' },
                  {
                    pattern: /^[a-z][a-z0-9_]*(?::[a-z][a-z0-9_]*){1,2}$/,
                    message: '格式如 system:user:remove（小写字母/数字/下划线，冒号分隔）',
                  },
                ]}
              >
                <Input placeholder="如：system:user:remove" autoComplete="off" />
              </Form.Item>
            </>
          )}

          <Divider titlePlacement="left" orientationMargin={0} className="text-xs">
            状态
          </Divider>
          <Form.Item
            name="status"
            label={<FieldLabel label="是否启用" hint="停用后该节点不参与权限计算" />}
            initialValue={1}
          >
            <Radio.Group
              options={[
                { value: 1, label: '启用' },
                { value: 0, label: '停用' },
              ]}
              optionType="button"
              buttonStyle="solid"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
