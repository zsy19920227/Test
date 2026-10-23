import type { ReactNode } from 'react'

interface PageHeaderProps {
  /** 页面标题（可见 h1，承担 a11y 基线，与侧栏菜单文案一致） */
  title: string
  /** 一句话页面说明 */
  description?: string
  /** 右侧主操作区（如「新增用户」） */
  extra?: ReactNode
}

/**
 * 页头：每个业务页的可见标题层。
 * 标题 16px/600；说明 text-xs 灰；extra 右对齐放主操作。
 * 卡片标题只做区块语义（如「用户列表」），不要与页头重复。
 */
export function PageHeader({ title, description, extra }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-[16px] font-semibold leading-6">{title}</h1>
        {description && <div className="mt-0.5 text-xs text-text-muted">{description}</div>}
      </div>
      {extra && <div className="flex shrink-0 items-center gap-2">{extra}</div>}
    </div>
  )
}
