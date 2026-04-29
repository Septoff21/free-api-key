# 项目健康状态

> **自动更新** — 每周一由 GitHub Actions 运行探针，结果写入 `data/health/`。
> 状态页反映最近一次探针运行的结果，**不保证实时准确**（中间出现的问题最迟下周一才会反映）。

[English](../../en/97-status.md)

## 当前状态

<!-- 以下表格由 data/health/_index.json 生成，手动或 CI 更新 -->

| Provider | 状态 | 上次延迟 | 上次探针时间 | 探针类型 |
|---|:-:|---:|---|---|
| OpenRouter | ⏳ | — | 未运行 | minimal_chat |
| Gemini | ⏳ | — | 未运行 | minimal_chat |
| Groq | ⏳ | — | 未运行 | minimal_chat |
| Cerebras | ⏳ | — | 未运行 | minimal_chat |
| GitHub Models | ⏳ | — | 未运行 | minimal_chat |
| Mistral | ⏳ | — | 未运行 | minimal_chat |
| Cloudflare | ⏳ | — | 未运行 | minimal_chat |
| Ollama | ⏳ | — | 本地探针，CI 跳过 | local_tags |

> **图例：** ✅ 正常 · ❌ 故障 · ⏳ 未测试/已跳过

## 状态 Badge

[![Providers Health](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/septoff21/free-api-key/main/data/health/badge.json)](docs/zh/97-status.md)

> 将 `septoff21` 替换为你的 GitHub 用户名后，Badge 会在 README 中实时显示。

## 探针设计

每次探针只发送：

```
model: <最小模型>
messages: [{"role": "user", "content": "hi"}]
max_tokens: 1
```

**每次 ≤ 5 token，每周 1 次**，对任何 provider 的免费配额来说都是可忽略的噪声。

### 各 Provider 使用的模型

| Provider | 探针模型 | 理由 |
|---|---|---|
| OpenRouter | `deepseek/deepseek-chat:free` | 永久免费路由 |
| Gemini | `gemini-2.0-flash` | 最高 RPD |
| Groq | `llama-3.1-8b-instant` | 最小模型，省配额 |
| Cerebras | `llama3.1-8b` | 最小模型 |
| GitHub Models | `openai/gpt-4o-mini` | Low 层 150 RPD |
| Mistral | `open-mistral-7b` | 最小模型 |
| Cloudflare | `@cf/meta/llama-3.1-8b-instruct` | 最小模型 |
| Ollama | GET `/api/tags` | 仅列出本地模型，不发推理请求 |

## 历史日志

原始 JSONL 日志存储在 `data/health/<provider>.jsonl`，每行一条探针记录：

```json
{"provider":"groq","ok":true,"status_code":200,"latency_ms":312,"error_class":null,"skipped":false,"timestamp":"2026-04-28T09:01:15.000Z","probe_kind":"minimal_chat"}
```

字段说明：

| 字段 | 说明 |
|---|---|
| `ok` | `true` = 200-299 响应；`false` = 错误 |
| `status_code` | HTTP 状态码（网络错误时为 `null`）|
| `latency_ms` | 从发出请求到收到响应的毫秒数 |
| `error_class` | `auth` / `rate_limit` / `not_found` / `network` / `timeout` / `null`（成功）|
| `skipped` | `true` = 该 provider 的 key 未配置，已跳过 |

## 我的请求失败，但状态显示 ✅ 是怎么回事？

1. **探针是点测**，我们每周只发一次。两次探针之间出现的问题不会立刻反映
2. **探针非常轻量**（1 token）；你的实际请求可能触发了其他限制（RPM、TPD 等）
3. 检查 [docs/zh/93-troubleshooting.md](93-troubleshooting.md)（如存在）
4. 在 [GitHub Issues](../../issues) 报告，附上错误信息和 provider 名称

## 贡献者：如何在本地运行探针

```bash
# 填入你自己的 key（测试用）
cp configs/.env.example .env
# 编辑 .env，填入至少一个 key

# 运行本地版探针
node scripts/test-real-keys.mjs

# 运行并写入日志
node scripts/test-real-keys.mjs --append-logs

# 不发真实请求（dry-run）
node scripts/test-real-keys.mjs --dry-run
```

详见 [维护者文档](95-maintenance.md)。
