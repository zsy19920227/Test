import { Card, Table, Tag } from 'antd'
import type { TableColumnsType } from 'antd'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Boxes, Cpu, Gauge, Timer } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'

/*
 * 以下均为固定字面量示例数据，仅用于界面演示；
 * 真实数据接入后整段删除。禁止随机生成数据。
 */

/** goodDirection：该指标「上升算好」还是「下降算好」，决定 trend 的语义色 */
const kpis = [
  { label: '本周测试任务', value: '27', unit: '次', icon: Boxes, trend: '+12%', goodDirection: 'up' },
  { label: '平均 MFU', value: '46.2', unit: '%', icon: Gauge, trend: '+1.8pt', goodDirection: 'up' },
  { label: '算子回归通过率', value: '98.4', unit: '%', icon: Cpu, trend: '+0.6pt', goodDirection: 'up' },
  { label: '推理 P99 TTFT', value: '412', unit: 'ms', icon: Timer, trend: '-18ms', goodDirection: 'down' },
]

/** 各框架「每卡吞吐」随并发变化（tokens/s/卡） */
const throughput = [
  { conc: 8, mindie: 228, vllm: 206, sglang: 186 },
  { conc: 16, mindie: 178, vllm: 163, sglang: 152 },
  { conc: 32, mindie: 124, vllm: 116, sglang: 110 },
  { conc: 64, mindie: 81, vllm: 78, sglang: 74 },
  { conc: 128, mindie: 51, vllm: 49, sglang: 47 },
]

interface RecentRun {
  key: string
  run: string
  model: string
  framework: string
  conc: number
  tputCard: string
  status: '通过' | '失败'
}

const recentRuns: RecentRun[] = [
  {
    key: '1',
    run: 'RUN-20261020-001',
    model: 'DeepSeek-V3',
    framework: 'MindIE 8.2.RC1',
    conc: 64,
    tputCard: '81.4',
    status: '通过',
  },
  {
    key: '2',
    run: 'RUN-20261019-014',
    model: 'Qwen3-235B',
    framework: 'vLLM-Ascend 0.9',
    conc: 32,
    tputCard: '116.2',
    status: '通过',
  },
  {
    key: '3',
    run: 'RUN-20261019-009',
    model: 'DeepSeek-V3',
    framework: 'SGLang-Ascend 0.4',
    conc: 128,
    tputCard: '46.8',
    status: '失败',
  },
  {
    key: '4',
    run: 'RUN-20261018-027',
    model: 'Qwen3-32B',
    framework: 'MindIE 8.2.RC1',
    conc: 16,
    tputCard: '176.5',
    status: '通过',
  },
  {
    key: '5',
    run: 'RUN-20261018-011',
    model: 'Qwen3-235B',
    framework: 'MindIE 8.2.RC1',
    conc: 8,
    tputCard: '231.7',
    status: '通过',
  },
]

const runColumns: TableColumnsType<RecentRun> = [
  { title: 'Run', dataIndex: 'run', key: 'run', className: 'tabular' },
  { title: '模型', dataIndex: 'model', key: 'model' },
  { title: '框架', dataIndex: 'framework', key: 'framework' },
  {
    title: '并发',
    dataIndex: 'conc',
    key: 'conc',
    align: 'right',
    className: 'tabular',
  },
  {
    title: '吞吐（tokens/s/卡）',
    dataIndex: 'tputCard',
    key: 'tputCard',
    align: 'right',
    className: 'tabular',
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    render: (status: RecentRun['status']) => (
      <Tag color={status === '通过' ? 'success' : 'error'}>{status}</Tag>
    ),
  },
]

export default function Dashboard() {
  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="工作台" description="测试任务与推理性能全局概览" />
      {/* KPI 卡：完全对称统一，无任何强调差异 */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {kpis.map(({ label, value, unit, icon: Icon, trend, goodDirection }) => {
          // 实际方向是否利好该指标：利好=绿，不利=红（TTFT 下降即利好 → 绿）
          const direction = trend.startsWith('+') ? 'up' : 'down'
          const good = direction === goodDirection
          return (
            <Card key={label} size="small" styles={{ body: { padding: 16 } }}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs text-text-muted">{label}</div>
                  <div className="tabular mt-2 text-2xl">
                    {value}
                    <span className="ml-1 text-xs text-text-muted">{unit}</span>
                  </div>
                </div>
                <Icon size={18} className="text-text-muted" />
              </div>
              <div
                className="tabular mt-2 text-xs"
                style={{ color: good ? 'var(--fw-green)' : 'var(--danger)' }}
              >
                {trend}
              </div>
            </Card>
          )
        })}
      </div>

      {/* 主图表：折线默认，X 轴为并发用户数 */}
      <Card
        size="small"
        title="推理吞吐 - 并发曲线（Atlas 800I A2 ×8 · FP8）"
        styles={{ body: { paddingTop: 8 } }}
      >
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={throughput} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
              <CartesianGrid stroke="var(--surface-border)" strokeDasharray="3 3" />
              <XAxis
                dataKey="conc"
                tick={{ fontSize: 12, fill: 'var(--text-muted)' }}
                stroke="var(--surface-border)"
                label={{
                  value: '并发用户数',
                  position: 'insideBottomRight',
                  offset: -2,
                  fontSize: 12,
                  fill: 'var(--text-muted)',
                }}
              />
              <YAxis
                tick={{ fontSize: 12, fill: 'var(--text-muted)' }}
                stroke="var(--surface-border)"
                label={{
                  value: 'tokens/s/卡',
                  angle: -90,
                  position: 'insideLeft',
                  fontSize: 12,
                  fill: 'var(--text-muted)',
                }}
              />
              <Tooltip
                contentStyle={{
                  fontSize: 12,
                  background: 'var(--surface-raised)',
                  border: '1px solid var(--surface-border)',
                }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line
                type="monotone"
                dataKey="mindie"
                name="MindIE 8.2.RC1"
                stroke="var(--fw-blue)"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="vllm"
                name="vLLM-Ascend 0.9"
                stroke="var(--fw-amber)"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="sglang"
                name="SGLang-Ascend 0.4"
                stroke="var(--fw-green)"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card size="small" title="最近测试任务">
        <Table<RecentRun>
          columns={runColumns}
          dataSource={recentRuns}
          pagination={false}
          size="small"
        />
      </Card>

      <div className="text-xs text-text-muted">示例数据仅用于界面演示</div>
    </div>
  )
}
