# 贡献指南（CONTRIBUTING）

本项目的前后端规范由两套技能标准约束：**superpowers**（开发流程纪律）与 **ui-ux-pro-max**（UI/UX 质量规则）。AI 代理的执行细节见 [CLAUDE.md](CLAUDE.md)。

## 环境要求

- Node ≥ 18、JDK 21、Maven 3.9+、MySQL 8.0+、Redis 7
- 内网镜像已配置：前端 npm 走华为云（`frontend/.npmrc`），Maven 走华为云（全局 `settings.xml`）
- 本地联调：`docker compose up -d`（自动执行 `backend/sql/init.sql` 建库）

## 分支与提交

- `main` 为主干；功能分支 `feature/<名称>`，修复分支 `fix/<issue>`
- 提交信息遵循 **Conventional Commits**：
  `feat(auth): 支持登出黑名单`、`fix(ui): 修复排行榜排序`、`docs: ...`、`refactor: ...`、`test: ...`、`chore: ...`
- 小步提交，每次提交都必须保持可构建（`npm run build` / `mvn package` 通过）
- 合并前必须通过代码评审与全量验证（见下）

## 开发工作流（superpowers 纪律）

1. **先想清楚再动手**：新功能先澄清需求与方案（brainstorm → 计划文档），拆成可验证的小任务
2. **TDD**：能写测试的逻辑先写失败测试，再实现至通过（后端参考 `JwtTokenProviderTest` 模式——不依赖数据库的纯单元测试优先）
3. **完成前验证（铁律）**：声称完成前必须新鲜跑出以下证据，任何一步不绿都不算完成：
   - 前端：`npm run lint`（0 error）+ `npm run build`（成功）
   - 后端：`mvn package -DskipTests`（BUILD SUCCESS）+ 涉及认证/工具类时 `mvn test`
   - UI 改动：`npm run preview` 后浏览器逐页冒烟（页面渲染、图表、表格、无控制台错误）
4. **评审**：提交 PR 前自查 + 交叉评审，通过后才合并

## 前端规范（frontend/）

### 结构职责

```
src/api/        # axios 封装 + 接口定义（types.ts 与后端契约一一对应）
src/components/ # 跨页面通用组件
src/layouts/    # 布局（BasicLayout）
src/pages/      # 页面，按领域分目录；重型依赖页面必须 React.lazy
src/router/     # 路由与守卫
src/store/      # RTK（业务状态）+ Zustand（UI 偏好），分工见 CLAUDE.md 铁律 1
src/styles/     # tokens + 全局样式；色值只允许出现在 :root
```

### 代码风格

- 严格 TypeScript（strict + noUnusedLocals），Prettier 统一格式（`npm run format`），ESLint 0 error 才能提交
- 组件文件 PascalCase，hooks/工具 camelCase；hooks 统一用 `useAppDispatch` / `useAppSelector`
- 请求一律走 `api/client.ts` 实例（自动带 token、解包 Result、统一错误提示）

### UI/UX 最低要求（ui-ux-pro-max 优先级 1-2，CRITICAL）

- **可访问性**：图标按钮必须有 `aria-label`；表单可见 label + 就近报错；焦点环不可移除；正文对比度 ≥ 4.5:1；页面有语义化 h1（可 sr-only）；不得仅靠颜色传达含义（加图标/文字）
- **交互**：异步按钮 loading/禁用；可点元素 `cursor-pointer`；触控目标 ≥ 24px
- **动效**：`prefers-reduced-motion` 已全局处理，新增动画不得绕过
- **图表**：必须有图例 + 悬浮提示；框架色只做数据编码
- **性能**：新重型依赖必须懒加载 + manualChunks 分包；长列表（50+）虚拟化

## 后端规范（backend/）

- 新业务模块复制 `module/system` 目录结构（entity/mapper/service/controller/dto/vo），Mapper 会被 `@MapperScan("com.turing.platform.**.mapper")` 自动扫描
- Controller 只做参数校验 + 编排；业务逻辑在 Service；复杂 SQL 写 XML（`resources/mapper/`）
- 错误处理：业务错误抛 `BusinessException`；入参用 `@Valid` + JSR303 注解；禁止捕获后吞异常
- 权限：每个接口显式 `@PreAuthorize`，权限标识三段式 `system:user:list`，新权限点同步登记到 `sys_menu`
- 实体：逻辑删除 `deleted`（@TableLogic）、时间字段 `@TableField(fill=...)` 自动填充
- 配置：敏感配置（JWT 密钥、数据库密码）生产走环境变量，禁止硬编码进仓库
