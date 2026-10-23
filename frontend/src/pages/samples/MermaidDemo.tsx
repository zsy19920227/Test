import { useEffect, useState } from 'react'
import { Alert, Card, Input, Segmented } from 'antd'
import mermaid from 'mermaid'
import { tokens } from '@/styles/tokens'
import { PageHeader } from '@/components/PageHeader'

mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  themeVariables: {
    primaryColor: tokens.blueTint,
    primaryTextColor: tokens.text,
    primaryBorderColor: tokens.blueBorder,
    lineColor: tokens.textMuted,
    secondaryColor: tokens.muted,
    tertiaryColor: tokens.bg,
    background: tokens.surface,
    fontSize: '13px',
  },
})

const presets: Record<string, string> = {
  时序图: `sequenceDiagram
  participant FE as 前端 (React)
  participant BE as 后端 (Spring Boot)
  participant DB as MySQL
  participant RD as Redis
  FE->>BE: POST /api/auth/login
  BE->>DB: 校验用户 (BCrypt)
  BE->>RD: 缓存权限列表
  BE-->>FE: 返回 JWT Token
  FE->>FE: 存储 Token / 跳转工作台`,
  流程图: `flowchart LR
  A[提交测试任务] --> B{资源充足?}
  B -- 是 --> C[执行压测]
  B -- 否 --> D[进入排队]
  D --> C
  C --> E{指标达标?}
  E -- 是 --> F[生成通过报告]
  E -- 否 --> G[标记回归 + 通知]`,
  饼图: `pie title 算子耗时分布（示例）
  "Matmul" : 42
  "Attention" : 27
  "Vector" : 18
  "TransData" : 13`,
}

let renderSeq = 0

export default function MermaidDemo() {
  const [kind, setKind] = useState('时序图')
  const [code, setCode] = useState(presets['时序图'])
  const [svg, setSvg] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        const result = await mermaid.render(`turing-mmd-${++renderSeq}`, code)
        if (!cancelled) {
          setSvg(result.svg)
          setError(null)
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : '图表语法解析失败')
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [code])

  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Mermaid 图表" description="Mermaid DSL 图表渲染示例" />
      <Card
        size="small"
        title="图表编辑与预览"
        extra={
          <Segmented
            options={Object.keys(presets)}
            value={kind}
            onChange={(v) => {
              const next = v as string
              setKind(next)
              setCode(presets[next])
            }}
          />
        }
      >
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div>
            <div className="mb-2 text-xs text-text-muted">
              图表定义（Mermaid DSL，可编辑）
            </div>
            <Input.TextArea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              rows={16}
              style={{
                fontFamily: "'JetBrains Mono', 'Cascadia Code', Consolas, monospace",
                fontSize: 12,
              }}
            />
          </div>
          <div>
            <div className="mb-2 text-xs text-text-muted">
              渲染结果
            </div>
            {error ? (
              <Alert type="error" message="语法错误" description={error} showIcon />
            ) : (
              <div
                className="flex min-h-[320px] items-center justify-center overflow-auto p-3"
                style={{
                  border: '1px solid var(--surface-border)',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--surface)',
                }}
                dangerouslySetInnerHTML={{ __html: svg }}
              />
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}
