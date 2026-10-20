import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { authApi } from '@/api/auth'
import { tokenStorage } from '@/api/client'
import type { LoginRequest, LoginResponse, UserInfo } from '@/api/types'

export interface AuthState {
  token: string | null
  user: UserInfo | null
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: string | null
}

const initialState: AuthState = {
  token: tokenStorage.get(),
  user: null,
  status: 'idle',
  error: null,
}

/** 登录（异步 thunk 示范：成功后持久化 token） */
export const login = createAsyncThunk<LoginResponse, LoginRequest>(
  'auth/login',
  async (payload) => {
    const res = await authApi.login(payload)
    tokenStorage.set(res.token)
    return res
  },
)

/** 登出：无论后端调用是否成功，都清理本地 token */
export const logout = createAsyncThunk('auth/logout', async () => {
  try {
    await authApi.logout()
  } finally {
    tokenStorage.clear()
  }
})

/** 拉取当前登录用户（角色/权限），用于界面权限控制 */
export const fetchCurrentUser = createAsyncThunk('auth/me', async () => authApi.me())

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.token = action.payload.token
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message ?? '登录失败'
      })
      .addCase(logout.fulfilled, (state) => {
        state.token = null
        state.user = null
        state.status = 'idle'
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action: PayloadAction<UserInfo>) => {
        state.user = action.payload
      })
  },
})

export const { clearError } = authSlice.actions
export default authSlice.reducer
