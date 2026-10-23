import { Card } from 'antd'
import { Background, BackgroundVariant, Controls, MiniMap, ReactFlow } from 'reactflow'
import type { Edge, Node } from 'reactflow'
import 'reactflow/dist/style.css'
import '@/styles/reactflow.css'
import { tokens } from '@/styles/tokens'
import { PageHeader } from '@/components/PageHeader'

/** 测试任务执行链路（固定示例拓扑） */
const nodes: Node[] = [
  { id: 'submit', type: 'input', data: { label: '提交测试任务' }, position: { x: 0, y: 160 } },
  { id: 'schedule', data: { label: '资源调度' }, position: { x: 220, y: 160 } },
  { id: 'exec', data: { label: '执行压测' }, position: { x: 440, y: 60 } },
  { id: 'collect', data: { label: '指标采集' }, position: { x: 440, y: 260 } },
  { id: 'report', type: 'output', data: { label: '生成报告' }, position: { x: 680, y: 160 } },
]

const edges: Edge[] = [
  { id: 'e1', source: 'submit', target: 'schedule', animated: true },
  { id: 'e2', source: 'schedule', target: 'exec' },
  { id: 'e3', source: 'exec', target: 'collect' },
  { id: 'e4', source: 'collect', target: 'report' },
]

export default function FlowDemo() {
  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="React Flow 流程图" description="流程图集成示例" />
      <Card size="small" title="测试任务执行链路">
        <div
          style={{
            height: 480,
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--surface-border)',
            background: 'var(--surface)',
          }}
        >
          <ReactFlow nodes={nodes} edges={edges} fitView>
            <Background variant={BackgroundVariant.Dots} gap={16} color={tokens.borderStrong} />
            <Controls showInteractive={false} />
            <MiniMap
              pannable
              zoomable
              nodeColor={() => tokens.borderStrong}
              maskColor={tokens.bgMask}
            />
          </ReactFlow>
        </div>
      </Card>
    </div>
  )
}
