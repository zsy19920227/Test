import { Spin } from 'antd'

/** 路由懒加载时的统一加载态 */
export default function PageLoading() {
  return (
    <div className="flex h-64 items-center justify-center">
      <Spin size="large" />
    </div>
  )
}
