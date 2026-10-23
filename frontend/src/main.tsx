import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { App as AntdApp, ConfigProvider, theme } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import { RouterProvider } from 'react-router-dom'
import { store } from '@/store'
import { router } from '@/router'
import { tokens } from '@/styles/tokens'
import '@/styles/index.css'

dayjs.locale('zh-cn')

/**
 * 全局主题：浅色 Data-Dense Dashboard（ui-ux-pro-max 设计系统）。
 * 深蓝主色 + 琥珀强调，白卡片浮于浅灰底。
 */
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <ConfigProvider
        locale={zhCN}
        theme={{
          algorithm: theme.defaultAlgorithm,
          token: {
            colorPrimary: tokens.primary,
            colorBgBase: tokens.bg,
            colorBgContainer: tokens.surface,
            colorBgElevated: tokens.surface,
            colorBorder: tokens.borderStrong,
            colorBorderSecondary: tokens.surfaceBorder,
            borderRadius: 6,
            borderRadiusLG: 8,
            fontSize: 14,
            fontFamily: "'HarmonyOS Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif",
          },
        }}
      >
        <AntdApp>
          <RouterProvider router={router} />
        </AntdApp>
      </ConfigProvider>
    </Provider>
  </React.StrictMode>,
)
