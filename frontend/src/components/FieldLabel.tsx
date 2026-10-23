import type { ReactNode } from 'react'
import { Tooltip } from 'antd'
import { QuestionCircleOutlined } from '@ant-design/icons'

/**
 * 表单字段标签 + 悬停说明图标。
 * 替代 Form.Item 的 extra 常驻小字：说明收进 ？ Tooltip，表单更干净。
 */
export function FieldLabel({ label, hint }: { label: ReactNode; hint?: ReactNode }) {
  if (!hint) {
    return <>{label}</>
  }
  return (
    <span>
      {label}{' '}
      <Tooltip title={hint}>
        <QuestionCircleOutlined
          role="img"
          aria-label={`${typeof label === 'string' ? label : ''}字段说明`}
          style={{ color: 'var(--text-muted)', fontSize: 12 }}
        />
      </Tooltip>
    </span>
  )
}
