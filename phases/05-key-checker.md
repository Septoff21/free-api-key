# Phase 05: Key Checker Script

**前置阅读：** `PHASES.md` + `phases/00-context.md` + `phases/02-providers-json.md`

## 1. Goal

写一个一键脚本：用户跑一下，输入或读取 `.env` 里的所有 key，输出每家 provider 的 ✓/✗ + 可用模型数 + 已知剩余额度。

## 2. Why Now

`providers.json` 里的 `checker.endpoint` 字段已就绪。这是项目最大差异化之一（其他 awesome 项目都没有）。

## 3. 文件清单

```
scripts/
├── check-keys.mjs     # 主入口
├── lib/
│   ├── providers.mjs  # 加载 providers.json
│   ├── http.mjs       # 通用 fetch + 超时 + 重试
│   ├── format.mjs     # 表格输出
│   └── checks/
│       ├── openai-compatible.mjs  # 通用 OpenAI 兼容检查
│       ├── gemini.mjs             # Gemini 特殊
│       ├── cloudflare.mjs         # 双参数特殊
│       └── ollama.mjs             # 本地特殊
├── package.json
├── README.md          # 脚本独立 README
└── .npmrc             # 强制 lock-file
```

## 4. 行为规范

### 4.1 调用方式

```bash
# 从 .env 读取（默认）
cd scripts
npm install
npm run check

# 等价
node check-keys.mjs

# 指定 .env 路径
node check-keys.mjs --env ../my.env

# 只检查指定家
node check-keys.mjs --only openrouter,gemini

# JSON 输出（机器可读）
node check-keys.mjs --json
```

### 4.2 输出格式（默认人类可读）

```
🔑 Free API Key —— Key Checker
   Last data verification: 2026-04-27 (from providers.json)

Provider       | Status | Models | RPM Used | Resets    | Notes
---------------|--------|--------|----------|-----------|---------------------------
OpenRouter     |   ✓    |  31    |  3 / 20  | in 47s    | Free tier
Gemini         |   ✓    |  12    |   N/A    |    -      | 429 quota check disabled
Groq           |   ✓    |   8    |  1 / 30  | in 12s    |
Cerebras       |   ✗    |   -    |    -     |    -      | 401 Unauthorized
GitHub Models  |   -    |   -    |    -     |    -      | GITHUB_TOKEN not set
Mistral        |   ✓    |   5    |   N/A    |    -      |
Cloudflare     |   ✓    |   -    |   N/A    |    -      | Account ID + token OK
Ollama (local) |   ✓    |   3    |    -     |    -      | http://localhost:11434

Summary: 6 OK, 1 fail, 1 not configured. Total free models accessible: 59.
```

### 4.3 状态语义

| 符号 | 含义 |
|---|---|
| ✓ | key 有效、endpoint 可达 |
| ✗ | key 配置了但验证失败（401/403） |
| - | env 变量未配置 / 跳过 |
| ! | 网络问题（5xx 或超时） |

### 4.4 退出码

- `0` —— 全部检测通过（包括"未配置"算 OK）
- `1` —— 至少一个配置了的 key 验证失败

## 5. 实现要点

### 5.1 通用 OpenAI 兼容检查（最常见）

对 `openai_compatible: true` 的 provider，都用同样逻辑：
- `GET <base_url>/models`
- header `Authorization: Bearer <key>`
- 200 → ✓ + 数 `data.length`
- 读 `x-ratelimit-*` 头（如有）

### 5.2 各家特殊点

- **Gemini**：endpoint 是 `https://generativelanguage.googleapis.com/v1beta/models?key=<key>`（query 参数 auth）
- **Cloudflare**：URL 含 `account_id`，header `Authorization: Bearer <token>`
- **GitHub Models**：endpoint `https://models.github.ai/catalog/models`，header `Authorization: Bearer <pat>`
- **Ollama**：endpoint `http://localhost:11434/api/tags`，无 auth
- **OpenRouter**：除了 `/models`，还有 `/auth/key` 端点能直接返回 key 信息和限速 → 优先用它

### 5.3 超时 / 重试

- 每个请求 8 秒超时
- 失败重试 1 次（间隔 2 秒）
- **不要无限重试**，避免触发供应商反 abuse

### 5.4 不能做的事

- ❌ 不要发"试探性消息"消耗用户 token（除非用户明确 `--probe-quota`）
- ❌ 不要并发超过 4（避免在共享 IP 触发限速）
- ❌ 不要把 key 打印到 stdout / 日志

## 6. package.json

```json
{
  "name": "@free-api-key/check-keys",
  "version": "0.1.0",
  "type": "module",
  "private": true,
  "engines": { "node": ">=18" },
  "scripts": {
    "check": "node check-keys.mjs",
    "check:json": "node check-keys.mjs --json"
  },
  "dependencies": {
    "dotenv": "^16.4.5"
  }
}
```

**只用 dotenv 一个依赖。** 别引入 axios / chalk / commander 之类，原生 `fetch` + 简单 ANSI 颜色就够。

## 7. scripts/README.md

写法：
- 怎么装（`cd scripts && npm install`）
- 怎么跑
- 输出含义
- 隐私声明：脚本只往 provider 官方 endpoint 发请求，不上传 key 到任何第三方（包括我们自己）
- 故障排查（network / proxy / WSL 常见问题）

## 8. Acceptance Criteria

- [ ] `npm install` 成功（`npm ci` 也要成功，需要 lock 文件）
- [ ] `.env` 全空跑：所有 provider 显示 `-`，退出码 0
- [ ] 配置至少 1 个真实 key 跑：能看到 ✓
- [ ] 配置 1 个错误 key 跑：能看到 ✗ 且退出码 1
- [ ] `--json` 输出可被 `JSON.parse`
- [ ] `--only` 过滤工作
- [ ] 不打印任何 key 内容到 stdout
- [ ] 脚本在用户网络条件下完整跑过一次（**实际跑！** 贴出输出截图或粘贴片段到 phase 完成汇报里）
- [ ] CHANGELOG 更新

## 9. Out of Scope

- ❌ 不做 GUI / Web UI
- ❌ 不做 key 轮询管理
- ❌ 不做"探测真实剩余 quota"的高级技巧（如刻意触发 429 看头）—— 留 v1.1
- ❌ 不发"试用"消息消耗 token

## 10. 风险

- **风险：网络墙** —— 中国大陆访问 Gemini / Groq 可能要代理。脚本应支持 `HTTPS_PROXY` 环境变量（Node 18+ 原生支持）
- **风险：CF / GitHub 用 PAT 易混** —— README 明确说明 token 类型

## 11. Estimated Effort

约 4-6 小时（含跨 provider 的特殊处理 + 真实测试）。
