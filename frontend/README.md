# 前端工程（React 18.2 + TS 5.3 + Vite 5 + Ant Design 6）

## 命令

```bash
npm install     # 安装依赖（.npmrc 已指向华为云 npm 镜像）
npm run dev     # 开发服务器 http://localhost:5173（/api 代理到 8081）
npm run build   # 类型检查 + 生产构建（输出 dist/）
npm run preview # 本地预览构建产物
npm run typecheck
```

## 约定

- **路径别名**：`@/` 指向 `src/`（tsconfig paths + vite alias）。
- **API 层**：所有请求走 `src/api/client.ts` 的 axios 实例——自动注入 `Bearer Token`、
  解包后端 `Result<T>`、统一错误提示、401 自动跳转登录页。新增接口在 `src/api/*.ts` 定义。
- **状态管理分工**：
  - Redux Toolkit（`src/store/authSlice.ts`）：业务/服务端全局状态（登录态），异步用 thunk；
  - Zustand（`src/store/useUIStore.ts`）：轻量 UI 偏好（侧栏折叠等），persist 持久化。
  - 禁止把同一份状态同时放进两边。
- **类型即契约**：`src/api/types.ts` 与后端 `Result/PageResult/LoginResponse/UserInfo/SysUserVO` 一一对应，后端改字段先改这里。
- **主题**：Ant Design 6 深色算法 + 平台 tokens（`src/styles/index.css` 的 `:root` 变量），
  红色（--accent）仅用于品牌与选中态；框架色只做数据编码。新页面复用既有 tokens，勿另起色板。
- **重型依赖页面必须懒加载**：Monaco / React Flow / Mermaid 页面已示范 `React.lazy`，
  vite.config.ts 的 manualChunks 已做分包。

## 目录

```
src/
├── api/        # client.ts（axios 封装）+ auth.ts / user.ts（接口）
├── components/ # AuthGuard 等通用组件
├── layouts/    # BasicLayout（顶栏 + 侧栏 + 用户菜单）
├── pages/      # login / dashboard / inference / samples（monaco/flow/mermaid）/ system / error
├── router/     # createBrowserRouter + 懒加载
├── store/      # Redux Toolkit（auth）+ Zustand（UI 偏好）
└── styles/     # 全局 css + tailwind + reactflow 深色适配
```
