#!/usr/bin/env node
/*
 * 风格防回退检查（lint:style）：src 下 ts/tsx 禁止裸 hex 颜色，
 * 防止绕过设计 tokens（详见 docs/ui-style-guide.md「Do / Don't」）。
 * 白名单：src/styles/tokens.ts（JS 侧唯一色值来源）。
 * styles/index.css 与 tailwind.config.js 不在扫描范围（CSS / 构建配置层，本身即 token 来源）。
 * 零依赖，仅用 node 内置模块。
 */
import { readdirSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { join, relative, sep } from 'node:path'

const FRONTEND_ROOT = fileURLToPath(new URL('..', import.meta.url))
const SRC = join(FRONTEND_ROOT, 'src')
const WHITELIST = new Set([join(SRC, 'styles', 'tokens.ts')])
const HEX_RE = /#[0-9a-fA-F]{3,8}\b/g

/** 递归收集 src 下全部 .ts/.tsx 文件 */
function walk(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) walk(full, out)
    else if (/\.(ts|tsx)$/.test(entry.name)) out.push(full)
  }
  return out
}

let bad = 0
for (const file of walk(SRC)) {
  if (WHITELIST.has(file)) continue
  const lines = readFileSync(file, 'utf8').split(/\r?\n/)
  lines.forEach((line, i) => {
    for (const m of line.matchAll(HEX_RE)) {
      console.error(
        `${relative(FRONTEND_ROOT, file).split(sep).join('/')}:${i + 1}: 裸 hex 颜色 ${m[0]} —— 请改用 src/styles/tokens.ts 或 CSS 变量（docs/ui-style-guide.md）`,
      )
      bad++
    }
  })
}

if (bad > 0) {
  console.error(`\nlint:style: 发现 ${bad} 处裸 hex（白名单：src/styles/tokens.ts）`)
  process.exit(1)
}
console.log('lint:style: 通过 —— src 下无裸 hex 颜色')
