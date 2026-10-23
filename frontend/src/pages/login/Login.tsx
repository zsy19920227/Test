import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button, Form, Input } from 'antd'
import { Cpu, Lock, User } from 'lucide-react'
import { login } from '@/store/authSlice'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { tokens } from '@/styles/tokens'

interface LoginFormValues {
  username: string
  password: string
}

export default function Login() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const status = useAppSelector((state) => state.auth.status)
  const error = useAppSelector((state) => state.auth.error)

  const [form] = Form.useForm<LoginFormValues>()
  const loading = status === 'loading'

  const onFinish = async (values: LoginFormValues) => {
    try {
      await dispatch(login(values)).unwrap()
      const redirect = searchParams.get('redirect')
      navigate(redirect && redirect.startsWith('/') ? redirect : '/dashboard', { replace: true })
    } catch {
      // 错误已由拦截器统一提示，这里只阻断跳转
    }
  }

  return (
    <div
      className="flex h-full items-center justify-center"
      style={{ background: 'var(--page-grad)' }}
    >
      <div
        className="w-[360px] p-8"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--surface-border)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        <div className="mb-6 flex items-center gap-2.5">
          <span
            className="flex h-9 w-9 items-center justify-center rounded-lg"
            style={{
              background: 'var(--brand-grad)',
            }}
          >
            <Cpu size={18} color={tokens.surface} strokeWidth={2.2} />
          </span>
          <div>
            <h1 className="text-lg font-semibold leading-tight">图灵测试平台</h1>
            <div className="text-xs text-text-muted">系统规格测试平台 · 脚手架</div>
          </div>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ username: 'admin' }}
          requiredMark={false}
        >
          <Form.Item
            name="username"
            label="用户名"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input
              prefix={<User size={14} />}
              placeholder="admin"
              size="large"
              autoComplete="username"
            />
          </Form.Item>
          <Form.Item
            name="password"
            label="密码"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password
              prefix={<Lock size={14} />}
              placeholder="Admin@123"
              size="large"
              autoComplete="current-password"
            />
          </Form.Item>
          <Button type="primary" htmlType="submit" block size="large" loading={loading}>
            登 录
          </Button>
        </Form>

        {error && (
          <div className="mt-3 text-xs text-danger">{error}</div>
        )}

        <div className="mt-6 text-xs text-text-muted">
          演示账号：admin / Admin@123（需先执行 backend/sql/init.sql 初始化数据库）
        </div>
      </div>
    </div>
  )
}
