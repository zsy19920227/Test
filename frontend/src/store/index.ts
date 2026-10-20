import { configureStore } from '@reduxjs/toolkit'
import authReducer from './authSlice'

/**
 * Redux Toolkit 全局 store。
 *
 * 状态管理约定：
 * - Redux Toolkit：业务/服务端全局状态（登录态、权限等），含异步 thunk；
 * - Zustand：轻量 UI 偏好（侧栏折叠等），见 useUIStore.ts。
 * 两者各司其职，禁止把同一份状态同时放进两边。
 */
export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
