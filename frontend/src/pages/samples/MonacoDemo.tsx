import { useState } from 'react'
import { Card, Segmented, Spin, Typography } from 'antd'
import Editor from '@monaco-editor/react'

const samples: Record<string, { language: string; code: string }> = {
  JSON: {
    language: 'json',
    code: `{
  "name": "inference-benchmark",
  "model": "DeepSeek-V3",
  "precision": "FP8",
  "framework": "MindIE",
  "hardware": {
    "server": "Atlas 800I A2",
    "cards": 8,
    "npu": "910B4"
  },
  "scenarios": ["fixed-sequence", "agent", "long-context"]
}
`,
  },
  TypeScript: {
    language: 'typescript',
    code: `interface BenchmarkRecord {
  model: string
  framework: string
  /** 每卡吞吐 tokens/s */
  tputCard: number
}

// 框架对比：按每卡吞吐取基线差值
export function deltaToBaseline(
  record: BenchmarkRecord,
  baseline: number,
): number {
  return record.tputCard - baseline
}
`,
  },
  SQL: {
    language: 'sql',
    code: `-- 测试任务分页查询（对应后端 MyBatis Plus 分页）
SELECT run_no, model, framework, precision, conc, tput_card
FROM t_benchmark_run
WHERE deleted = 0
ORDER BY create_time DESC
LIMIT 10 OFFSET 0;
`,
  },
}

export default function MonacoDemo() {
  const [kind, setKind] = useState<string>('JSON')
  const [code, setCode] = useState(samples.JSON.code)
  const current = samples[kind]

  const switchKind = (value: string) => {
    setKind(value)
    setCode(samples[value].code)
  }

  return (
    <>
      <h1 className="sr-only">Monaco 编辑器示例</h1>
      <Card
        size="small"
        title="Monaco Editor"
        extra={
          <Segmented
            options={Object.keys(samples)}
            value={kind}
            onChange={(v) => switchKind(v as string)}
          />
        }
      >
        <Editor
          height="520px"
          language={current.language}
          value={code}
          theme="vs"
          onChange={(v) => setCode(v ?? '')}
          options={{
            minimap: { enabled: true },
            fontSize: 13,
            fontFamily: "'JetBrains Mono', 'Cascadia Code', Consolas, monospace",
            tabSize: 2,
            automaticLayout: true,
            scrollBeyondLastLine: false,
          }}
          loading={
            <div className="flex h-full items-center justify-center">
              <Spin />
            </div>
          }
        />
        <Typography.Text type="secondary" className="mt-3 block text-xs">
          当前字符数：{code.length} · 编辑器内容仅存于前端内存，未持久化
        </Typography.Text>
      </Card>
    </>
  )
}
