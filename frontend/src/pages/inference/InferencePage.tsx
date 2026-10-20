import { useMemo, useState } from 'react'
import { Card, Select, Table } from 'antd'
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
import { ArrowUp } from 'lucide-react'

/*
 * 推理性能页（脚手架演示版）：基准配置筛选 → 折线主图 → 可排序排行榜。
 * 数据为固定字面量示例，仅用于界面演示，真实数据接入后整段替换。
 */

interface InferenceRecord {
  model: string
  framework: string
  precision: string
  conc: number
  tputCard: number
  tputTotal: number
  ttft: number
  tpot: number
  hbm: number
  run: string
}

const records: InferenceRecord[] = [
  {
    model: 'DeepSeek-V3',
    framework: 'MindIE 8.2.RC1',
    precision: 'FP8',
    conc: 64,
    tputCard: 81.4,
    tputTotal: 5210,
    ttft: 412,
    tpot: 38,
    hbm: 58,
    run: 'RUN-1020-001',
  },
  {
    model: 'DeepSeek-V3',
    framework: 'vLLM-Ascend 0.9',
    precision: 'FP8',
    conc: 64,
    tputCard: 77.5,
    tputTotal: 4960,
    ttft: 447,
    tpot: 41,
    hbm: 61,
    run: 'RUN-1019-014',
  },
  {
    model: 'DeepSeek-V3',
    framework: 'SGLang-Ascend 0.4',
    precision: 'FP8',
    conc: 64,
    tputCard: 73.8,
    tputTotal: 4720,
    ttft: 489,
    tpot: 45,
    hbm: 60,
    run: 'RUN-1019-009',
  },
  {
    model: 'DeepSeek-V3',
    framework: 'MindIE 8.0.0',
    precision: 'BF16',
    conc: 64,
    tputCard: 46.2,
    tputTotal: 2960,
    ttft: 721,
    tpot: 77,
    hbm: 62,
    run: 'RUN-1018-032',
  },
  {
    model: 'Qwen3-235B',
    framework: 'MindIE 8.2.RC1',
    precision: 'W8A8',
    conc: 32,
    tputCard: 116.2,
    tputTotal: 3720,
    ttft: 298,
    tpot: 31,
    hbm: 49,
    run: 'RUN-1019-021',
  },
  {
    model: 'Qwen3-235B',
    framework: 'vLLM-Ascend 0.9',
    precision: 'W8A8',
    conc: 32,
    tputCard: 109.4,
    tputTotal: 3500,
    ttft: 331,
    tpot: 35,
    hbm: 52,
    run: 'RUN-1019-016',
  },
  {
    model: 'Qwen3-32B',
    framework: 'MindIE 8.2.RC1',
    precision: 'BF16',
    conc: 16,
    tputCard: 176.5,
    tputTotal: 2820,
    ttft: 187,
    tpot: 24,
    hbm: 31,
    run: 'RUN-1018-027',
  },
  {
    model: 'Qwen3-32B',
    framework: 'SGLang-Ascend 0.4',
    precision: 'BF16',
    conc: 16,
    tputCard: 168.1,
    tputTotal: 2690,
    ttft: 205,
    tpot: 27,
    hbm: 33,
    run: 'RUN-1018-019',
  },
]

const models = [...new Set(records.map((r) => r.model))]
const precisions = [...new Set(records.map((r) => r.precision))]

/** 框架色：只做数据编码，不做 UI 装饰 */
const fwColor: Record<string, string> = {
  'MindIE 8.2.RC1': 'var(--fw-cyan)',
  'MindIE 8.0.0': 'var(--fw-pink)',
  'vLLM-Ascend 0.9': 'var(--fw-amber)',
  'SGLang-Ascend 0.4': 'var(--fw-green)',
}

const columns: TableColumnsType<InferenceRecord> = [
  {
    title: '框架',
    dataIndex: 'framework',
    sorter: (a, b) => a.framework.localeCompare(b.framework),
    render: (fw: string) => (
      <span className="flex items-center gap-2">
        <span className="inline-block h-2 w-2 rounded-full" style={{ background: fwColor[fw] }} />
        {fw}
      </span>
    ),
  },
  { title: '模型', dataIndex: 'model' },
  { title: '精度', dataIndex: 'precision' },
  {
    title: '并发',
    dataIndex: 'conc',
    align: 'right',
    sorter: (a, b) => a.conc - b.conc,
    className: 'tabular',
  },
  {
    title: '吞吐（tokens/s/卡）',
    dataIndex: 'tputCard',
    align: 'right',
    defaultSortOrder: 'descend',
    sorter: (a, b) => a.tputCard - b.tputCard,
    className: 'tabular',
  },
  {
    title: '总吞吐（tokens/s）',
    dataIndex: 'tputTotal',
    align: 'right',
    sorter: (a, b) => a.tputTotal - b.tputTotal,
    className: 'tabular',
  },
  {
    title: 'TTFT P99（ms）',
    dataIndex: 'ttft',
    align: 'right',
    sorter: (a, b) => a.ttft - b.ttft,
    className: 'tabular',
    render: (v: number, row: InferenceRecord) => (
      <span className="flex items-center justify-end gap-1">
        {v}
        {row.ttft <= 450 ? <ArrowUp size={11} style={{ color: 'var(--fw-green)' }} /> : null}
      </span>
    ),
  },
  {
    title: 'TPOT P99（ms）',
    dataIndex: 'tpot',
    align: 'right',
    sorter: (a, b) => a.tpot - b.tpot,
    className: 'tabular',
  },
  {
    title: 'HBM 占用（%）',
    dataIndex: 'hbm',
    align: 'right',
    sorter: (a, b) => a.hbm - b.hbm,
    className: 'tabular',
  },
  { title: 'Run', dataIndex: 'run', className: 'tabular' },
]

export default function InferencePage() {
  const [model, setModel] = useState<string>()
  const [precision, setPrecision] = useState<string>()

  const filtered = useMemo(
    () =>
      records.filter(
        (r) => (!model || r.model === model) && (!precision || r.precision === precision),
      ),
    [model, precision],
  )

  // 主图：X = 并发，Y = tokens/s/卡，按框架分组
  const chartData = useMemo(() => {
    const byConc = new Map<number, Record<string, number | string>>()
    for (const r of filtered) {
      const point = byConc.get(r.conc) ?? { conc: r.conc }
      point[r.framework] = r.tputCard
      byConc.set(r.conc, point)
    }
    return [...byConc.values()].sort((a, b) => Number(a.conc) - Number(b.conc))
  }, [filtered])

  const frameworks = useMemo(() => [...new Set(filtered.map((r) => r.framework))], [filtered])

  return (
    <div className="flex flex-col gap-5">
      <h1 className="sr-only">推理性能</h1>
      <Card size="small" title="基准测试配置">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              模型
            </span>
            <Select
              allowClear
              placeholder="全部"
              style={{ width: 180 }}
              value={model}
              onChange={setModel}
              options={models.map((m) => ({ value: m, label: m }))}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              精度
            </span>
            <Select
              allowClear
              placeholder="全部"
              style={{ width: 120 }}
              value={precision}
              onChange={setPrecision}
              options={precisions.map((p) => ({ value: p, label: p }))}
            />
          </div>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            芯片配置：Atlas 800I A2 ×8（910B4, 64GB）
          </span>
        </div>
      </Card>

      <Card size="small" title="吞吐 - 并发曲线（默认折线）" styles={{ body: { paddingTop: 8 } }}>
        <div className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
              <CartesianGrid stroke="var(--surface-border)" strokeDasharray="3 3" />
              <XAxis
                dataKey="conc"
                type="number"
                allowDuplicatedCategory={false}
                tick={{ fontSize: 12, fill: 'var(--text-muted)' }}
                stroke="var(--surface-border)"
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
              {frameworks.map((fw) => (
                <Line
                  key={fw}
                  type="monotone"
                  dataKey={fw}
                  stroke={fwColor[fw]}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card size="small" title="排行榜（点击列头排序）">
        <Table<InferenceRecord>
          columns={columns}
          dataSource={filtered}
          rowKey={(r) => `${r.framework}-${r.model}-${r.conc}`}
          size="small"
          pagination={false}
          scroll={{ x: 1100 }}
        />
      </Card>

      <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
        示例数据仅用于界面演示 · 每个数据点对应一次可复现测试任务（run #, 环境快照 CANN/固件/驱动）
      </div>
    </div>
  )
}
