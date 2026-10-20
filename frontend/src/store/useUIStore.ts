import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * 轻量 UI 状态走 Zustand（与 Redux 分工，见 store/index.ts 注释）。
 * persist 中间件自动写入 localStorage。
 */
interface UIState {
  sidebarCollapsed: boolean
  toggleSidebar: () => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
    }),
    { name: 'turing-ui-preferences' },
  ),
)
