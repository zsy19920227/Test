import { Card } from 'antd'
import { Background, BackgroundVariant, Controls, MiniMap, ReactFlow } from 'reactflow'
import type { Edge, Node } from 'reactflow'
import 'reactflow/dist/style.css'
import '@/styles/reactflow.css'

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
    <>
      <h1 className="sr-only">React Flow 流程图示例</h1>
      <Card size="small" title="React Flow 流程图（测试任务执行链路示例）">
        <div
          style={{
            height: 480,
            borderRadius: 4,
            border: '1px solid var(--surface-border)',
            background: 'var(--surface)',
          }}
        >
          <ReactFlow nodes={nodes} edges={edges} fitView>
            <Background variant={BackgroundVariant.Dots} gap={16} color="#cbd5e1" />
            <Controls showInteractive={false} />
            <MiniMap
              pannable
              zoomable
              nodeColor={() => '#cbd5e1'}
              maskColor="rgba(248, 250, 252, 0.7)"
            />
          </ReactFlow>
        </div>
      </Card>
    </>
  )
}
