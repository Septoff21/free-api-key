# Phase 02: Providers Data（结构化数据填充）

**前置阅读：** `PHASES.md` + `phases/00-context.md` + `phases/01-foundation.md`

## 1. Goal

把 8 家核心 provider 的真实数据填进 `providers.json`，每个字段都有官方来源。

## 2. Why Now

后续所有 phase（文档、checker、recipes）都从 `providers.json` 读取数据。这一步是"单一真相源"的基石，错一个数字下游全错。

## 3. 任务

为以下 8 家填 `providers.json`：

```
1. openrouter
2. gemini
3. groq
4. cerebras
5. github_models
6. mistral
7. cloudflare
8. ollama
```

## 4. 验证工作流（每个 provider 重复）

> **核心原则：所有数据必须有可追溯证据。** 不留证据 = 不算验证。

### Step A: 列出待 fetch 的 4 类官方页

每个 provider 至少 fetch 这 4 类（凑不齐就在 evidence 里写"未找到"）：

1. **限速页**（`limits_url`）—— rate limits 数字
2. **模型/定价页**（`pricing_url` 或 `models_url`）—— free 模型列表 + 上下文
3. **隐私政策**（`policy_url`）—— 训练数据使用、保留时长
4. **API 文档首页**（`docs_url`）—— base URL、auth scheme

URL 起点见 `phases/00-context.md` § 6。如果该 URL 已 redirect / 改版，**先 WebSearch 找新 URL**，不要硬 fetch 旧的。

### Step B: 抓证据

为每个 provider 创建：
```
data/evidence/<provider_key>/
├── limits.YYYY-MM-DD.md          # 从官方页提取的关键文本
├── pricing.YYYY-MM-DD.md
├── privacy.YYYY-MM-DD.md
└── _summary.YYYY-MM-DD.md         # 你从证据中提炼出的结论
```

每个 `.md` 文件结构：

```markdown
# <Provider> Limits — Evidence

**Source:** https://...
**Fetched:** 2026-04-27
**Method:** WebFetch

## Extracted Facts
- Free tier RPM: 20
- Free tier RPD: 50 (basic) / 1000 (paid history)
- Token cap: not specified

## Original Quote (verbatim)
> "Free models are subject to a base limit of 50 requests per day..."

## Caveats
- Page mentions "subject to change without notice"
- Last updated date on the page itself: <date if found>
```

**为什么留证据：** Phase 10 的 freshness-check 比对哈希，要看历史变化；将来争议 / 校正时有依据；社区贡献者要证据才能 review。

### Step C: 提取字段填 `providers.json`

按 `providers.schema.json` 的字段从 evidence 里抄数据。**禁止跳过 evidence 直接填 `providers.json`**。

要填的字段全集（提醒）：
- 基础：`key`、`name`、`homepage`、`signup_url`、`docs_url`、`limits_url`
- 接口：`type`、`openai_compatible`、`base_url`、`auth.{scheme,header,env_var_convention}`
- 模型 `models[]`（≥3 个），每个含：
  - `id`、`context`、`max_output_tokens`
  - `modalities_in`（text/image/audio/video/pdf）、`modalities_out`（text/image/audio）
  - `tool_use`（`native`/`prompt`/`none`）
  - `json_mode`、`streaming`、`reasoning`、`code_specialized`
  - `speed_tier`（`fast`/`medium`/`slow`）
  - `best_for`（chat/agent/vision/code/creative/ocr/translation/image_gen/audio_in/audio_out/long_context）
  - `free_tier`、`notes`
- 派生：`capabilities_summary`（从 `models[]` 汇总，用于 Phase 11 矩阵）
- 限速：`limits.{rpm,rpd,tpm,tpd,notes}`
- 隐私：`privacy.{trains_on_data,logs_prompts,retention_days,human_review,policy_url}`
- 验证：`checker.{method,endpoint,expect_status,rate_limit_headers}`
- 元：`last_verified`、`sources[]`

### Step C.1: 能力字段判定指南

这些字段不是直接抄官方页能拿到，要判断：

**`tool_use` 判定：**
- 官方文档明确说 "function calling supported" + 给 OpenAI 兼容例子 → `native`
- 仅有"用 prompt 让模型输出 JSON 模拟工具调用"教程 → `prompt`
- 完全无相关文档 → `none`
- **不确定** → 默认 `prompt`（最保守），并在 `notes` 里写 `"tool_use unverified, marked prompt to be safe"`

**`reasoning` = true 的判定：**
- 模型名带 `r1`、`thinking`、`reasoner`、`o1` 等
- 或官方说会输出 `<thinking>...</thinking>` 块 / `reasoning_content` 字段
- 仅"能 step-by-step 思考"不算（普通 LLM 都能）

**`code_specialized` = true：**
- 模型名含 `coder`、`codestral`、`code` 等
- 或官方明确"trained for code"

**`speed_tier`：**
- `fast`: Groq、Cerebras 全部模型；其他 ≥ 200 tok/s 的
- `slow`: 推理模型（生成 thinking 慢）、超大模型（>70B）
- 其他 → `medium`
- 估算即可，不是 benchmark

**`best_for`：**
- 选 1-3 个最匹配的，不要全选
- 例：`qwen2.5-coder` → `["code", "agent"]`，不写 chat（chat 普通模型都行）

### Step C.2: 派生 `capabilities_summary`

从填好的 `models[]` 自动汇总（建议写一段简单脚本，但手填也可）：
- `supports_vision_in`: 任一 model `modalities_in` 含 `image` → true
- `supports_image_gen`: 任一 model `modalities_out` 含 `image` → true
- `supports_tool_use`: 任一 model `tool_use === "native"` → true
- `max_context_free`: 所有 `free_tier: true` 的 model 中最大 `context`

### Step D: 冲突解决（重要）

不同来源说法不一致时（常见！）：

| 冲突来源 | 优先级 |
|---|---|
| 官方限速页 | ⭐⭐⭐ 最高 |
| 官方 API docs 中的"limits"章节 | ⭐⭐⭐ 同最高 |
| 官方 changelog / blog | ⭐⭐ 次优 |
| 社区文章 / Reddit | ⭐ 仅做参考，不入 `providers.json` |
| AI 生成 / 二手清单 | ❌ 不采用 |

冲突时：取最严的（更小的 RPM / 更短的保留期），并在 `limits.notes` 写："Sources A says X, B says Y; using A as more recent / more conservative."

### Step E: 拿不准的处理

- 隐私字段找不到明确说法 → `"unknown"` + `notes` 里写 `"checked YYYY-MM-DD, no clear statement on training use found in <policy_url>"`
- 限速数字找不到 → `null` + `notes` 里写 `"see <url>, exact figure not published; observed ~X RPM in practice (unverified)"`

**永远不要瞎编。** 错的数字比缺数字危害大。

### Step F: 自检

填完一家立刻自检：
1. `providers.json` 该 provider 通过 schema validation
2. evidence 文件夹里 4 类证据齐（或缺的有解释）
3. `last_verified` = 执行当天
4. `sources[]` ≥ 2 个 URL，与 evidence 文件名对应
5. grep `<provider_key>` 到任何外部已存在的文档（README 等），确保没遗漏链接

## 5. 必填字段示例（OpenRouter）

```json
{
  "key": "openrouter",
  "name": "OpenRouter",
  "homepage": "https://openrouter.ai",
  "signup_url": "https://openrouter.ai/sign-up",
  "docs_url": "https://openrouter.ai/docs",
  "limits_url": "https://openrouter.ai/docs/api-reference/limits",
  "type": "aggregator",
  "openai_compatible": true,
  "base_url": "https://openrouter.ai/api/v1",
  "auth": {
    "scheme": "bearer",
    "header": "Authorization",
    "env_var_convention": "OPENROUTER_API_KEY"
  },
  "models": [
    {
      "id": "deepseek/deepseek-chat:free",
      "context": 65536,
      "modalities": ["text"],
      "free_tier": true,
      "notes": "DeepSeek V3 free tier"
    }
    // ... 至少 3 个
  ],
  "limits": {
    "rpm": 20,
    "rpd": 50,
    "tpm": null,
    "tpd": null,
    "notes": "Free tier: 20 req/min, 50 req/day base. 1000/day if account ever topped up $10+."
  },
  "privacy": {
    "trains_on_data": "opt_out",
    "logs_prompts": "yes",
    "retention_days": 30,
    "human_review": "no",
    "policy_url": "https://openrouter.ai/privacy"
  },
  "checker": {
    "method": "GET",
    "endpoint": "https://openrouter.ai/api/v1/auth/key",
    "expect_status": 200,
    "rate_limit_headers": ["x-ratelimit-limit", "x-ratelimit-remaining", "x-ratelimit-reset"]
  },
  "last_verified": "2026-04-27",
  "sources": [
    "https://openrouter.ai/docs/api-reference/limits",
    "https://openrouter.ai/privacy"
  ]
}
```

**注意：上面的具体数字（20 RPM 等）是示例，phase 02 执行时必须重新核对官方页！**

## 6. Acceptance Criteria

- [ ] `providers.json` 包含 8 个 provider 对象，每个都通过 schema 验证
- [ ] 每个 provider 的 `last_verified` 都是执行当天日期
- [ ] 每个 provider 的 `sources[]` 至少 2 个官方 URL
- [ ] 每个 provider 至少 3 个 free 模型（Ollama 可特殊：本地无 free/paid 概念，列代表性模型）
- [ ] `privacy` 对象的 `trains_on_data` 和 `logs_prompts` 不全是 `unknown`（如果一家全 unknown，必须在 `notes` 解释为何查不到）
- [ ] `data/evidence/<provider>/` 目录每家都有，每家至少 2 个 evidence 文件
- [ ] evidence 文件中的关键数字与 `providers.json` 字段**完全一致**（grep 抽查 3 家）
- [ ] 每个 provider 至少 1 个 model 标了 `tool_use: "native"` 或在 `notes` 解释为何全无
- [ ] 每个 provider 的 `capabilities_summary` 与 `models[]` 一致（脚本或手验）
- [ ] `best_for` 字段不全空
- [ ] 跑 `npx ajv validate -s providers.schema.json -d providers.json` 通过（agent 可临时装 ajv-cli 验证）
- [ ] CHANGELOG.md 在 `[Unreleased]` 下添加 `### Added - Phase 02: provider data + evidence for openrouter, gemini, groq, ...`

## 7. Out of Scope

- ❌ 不要为 provider 写 markdown 文档（phase 03）
- ❌ 不要写 checker 脚本逻辑（phase 05）
- ❌ 不要新增 8 家以外的 provider（v1.0.0 锁定 8 家）

## 8. 风险 & 应对

**风险 1：某 provider 官方页墙了 / fetch 失败**
→ 在 `sources` 里标 `(fetch failed YYYY-MM-DD)`，让用户介入

**风险 2：限速规则太复杂（如 GitHub Models 按 model 类别不同）**
→ 在 `limits.notes` 写概要，详细分级在 phase 03 的 markdown 文档里展开

**风险 3：Ollama 不像 API provider**
→ 它的 `auth.scheme: "none"`、`limits` 全 null、`privacy.trains_on_data: "no"`、`checker.endpoint: "http://localhost:11434/api/tags"`

## 9. Estimated Effort

约 3-4 小时（每家 ~25 分钟，含 fetch + 整理 + 验证）。
