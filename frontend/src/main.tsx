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
import '@/styles/index.css'

dayjs.locale('zh-cn')

/**
 * 全局主题：深色工程看板风格（对齐平台原型 v3 tokens）。
 * 红色仅作为品牌主色，不做大面积装饰。
 */
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <ConfigProvider
        locale={zhCN}
        theme={{
          algorithm: theme.darkAlgorithm,
          token: {
            colorPrimary: '#e5484d',
            colorBgBase: '#0c0e11',
            colorBgContainer: '#13161b',
            colorBgElevated: '#1e232b',
            colorBorder: '#262b33',
            colorBorderSecondary: '#22262e',
            borderRadius: 4,
            fontSize: 13,
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
