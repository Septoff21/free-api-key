# Phase 01: Foundation（仓库骨架）

**前置阅读：** `PHASES.md` + `phases/00-context.md`

## 1. Goal

搭起空仓库的所有"周边"文件，让后续 phase 可以专注内容而不用反复处理基础设施。

## 2. Why Now

所有后续 phase 都假设这些文件已存在（README、CHANGELOG、`providers.json` schema、目录结构）。

## 3. 交付清单（10 个文件）

```
free-api-key/
├── README.md                  # 中文主版
├── README.en.md               # 英文版
├── CHANGELOG.md               # Keep a Changelog 空骨架
├── CONTRIBUTING.md            # 双语简版
├── LICENSE                    # MIT
├── .gitignore                 # node + env + OS
├── providers.json             # 仅 schema，先空 providers 数组
├── configs/.env.example       # 占位
├── docs/zh/.gitkeep
└── docs/en/.gitkeep
```

外加：初始化 git 仓库（`git init`），但**不要 push 到任何 remote**，用户自己处理。

## 4. 文件细则

### 4.1 `README.md`（中文主版）

骨架结构：

```markdown
# Free API Key —— 中文免费 LLM API 实用手册

> 站在 [cheahjs/free-llm-api-resources](https://github.com/cheahjs/free-llm-api-resources) 等优秀清单项目的肩膀上，补足"中文 + 工具脚本 + 真用得起来"这一层。

[English](./README.en.md) | 中文

## 这个项目是什么

<!-- 一段说清楚定位 -->

## 5 分钟上手

<!-- 占位：phase 02-05 后填 -->

## 收录的供应商

<!-- 表格占位：从 providers.json 引用，phase 02 后填 -->

## 一键检查你的 API key

<!-- phase 05 后填 -->

## 客户端接入

<!-- phase 07 后填 -->

## 隐私 / 合规 / 安全

<!-- phase 06 后填 -->

## 致谢

- [cheahjs/free-llm-api-resources](https://github.com/cheahjs/free-llm-api-resources) —— 数据参考
- [amardeeplakshkar/awesome-free-llm-apis](https://github.com/amardeeplakshkar/awesome-free-llm-apis) —— 对比表参考

## License

MIT (代码) / CC-BY-SA-4.0 (文档) —— 见 LICENSE

## 项目状态

v0.1.0 —— Foundation 阶段。详见 [CHANGELOG.md](./CHANGELOG.md)。
```

**注意：** 占位章节用 `<!-- TODO phase NN -->` 标注，方便后续 phase grep 找到该填的地方。

### 4.2 `README.en.md`

镜像中文版，英文。**首行必须有：**

```markdown
> Mirror of [README.md](./README.md) (Chinese, canonical). If they drift, zh wins.
```

### 4.3 `CHANGELOG.md`

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Phase 01: repository foundation (README, CHANGELOG, CONTRIBUTING, LICENSE, providers.json schema, directory layout).

[Unreleased]: https://github.com/YOUR_USERNAME/free-api-key/compare/v0.1.0...HEAD
```

### 4.4 `CONTRIBUTING.md`

双语合并在一篇里（中文在前、英文在后），覆盖：
- 怎么提 issue / PR
- 数据更新规范（必须附 `Last Verified` 和官方链接）
- 不接受的 PR 类型（违 ToS 的 key 共享、付费试用额度、未验证的限速数字）
- 文档风格速查（参考 phase 03 的模板）

约 80-120 行就够。

### 4.5 `LICENSE`

标准 MIT。Copyright holder 写 "the Free API Key contributors"。

### 4.6 `.gitignore`

```gitignore
# Env
.env
.env.local
.env.*.local

# Node
node_modules/
npm-debug.log*
yarn-error.log

# OS
.DS_Store
Thumbs.db
desktop.ini

# Editor
.vscode/
.idea/
*.swp

# Test artifacts
scripts/test-output/
*.tmp
```

### 4.7 `providers.json`（仅 schema，无数据）

```json
{
  "$schema": "./providers.schema.json",
  "version": "0.1.0",
  "last_updated": "2026-04-27",
  "providers": []
}
```

**同时创建 `providers.schema.json`** —— JSON Schema Draft-07，定义 provider 对象的字段。字段如下（phase 02 会填值，但 schema 现在就要定好）：

```json
{
  "type": "object",
  "required": ["key", "name", "homepage", "type", "auth", "models", "limits", "privacy", "openai_compatible", "last_verified"],
  "properties": {
    "key":               { "type": "string", "pattern": "^[a-z0-9_]+$" },
    "name":              { "type": "string" },
    "homepage":          { "type": "string", "format": "uri" },
    "signup_url":        { "type": "string", "format": "uri" },
    "docs_url":          { "type": "string", "format": "uri" },
    "limits_url":        { "type": "string", "format": "uri" },
    "type":              { "enum": ["aggregator", "first_party", "inference_provider", "local"] },
    "openai_compatible": { "type": "boolean" },
    "base_url":          { "type": "string", "format": "uri" },
    "auth": {
      "type": "object",
      "required": ["scheme", "header"],
      "properties": {
        "scheme": { "enum": ["bearer", "api_key_header", "query_param", "none"] },
        "header": { "type": "string" },
        "env_var_convention": { "type": "string" }
      }
    },
    "models": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["id", "context", "modalities_in", "modalities_out", "tool_use"],
        "properties": {
          "id":                { "type": "string" },
          "context":           { "type": "integer" },
          "max_output_tokens": { "type": ["integer", "null"] },
          "modalities_in":     {
            "type": "array",
            "items": { "enum": ["text", "image", "audio", "video", "pdf"] }
          },
          "modalities_out":    {
            "type": "array",
            "items": { "enum": ["text", "image", "audio"] }
          },
          "tool_use":          { "enum": ["native", "prompt", "none"] },
          "json_mode":         { "type": "boolean" },
          "streaming":         { "type": "boolean" },
          "reasoning":         { "type": "boolean", "description": "Visible CoT / thinking trace" },
          "code_specialized":  { "type": "boolean" },
          "speed_tier":        { "enum": ["fast", "medium", "slow"] },
          "best_for":          {
            "type": "array",
            "items": { "enum": ["chat", "agent", "vision", "code", "creative", "ocr", "translation", "image_gen", "audio_in", "audio_out", "long_context"] }
          },
          "free_tier":         { "type": "boolean" },
          "notes":             { "type": "string" }
        }
      }
    },
    "capabilities_summary": {
      "type": "object",
      "description": "Derived from models[]; for fast scripts and matrix rendering",
      "properties": {
        "supports_vision_in":  { "type": "boolean" },
        "supports_image_gen":  { "type": "boolean" },
        "supports_audio_in":   { "type": "boolean" },
        "supports_audio_out":  { "type": "boolean" },
        "supports_video_in":   { "type": "boolean" },
        "supports_pdf_in":     { "type": "boolean" },
        "supports_tool_use":   { "type": "boolean" },
        "supports_streaming":  { "type": "boolean" },
        "supports_json_mode":  { "type": "boolean" },
        "supports_reasoning":  { "type": "boolean" },
        "max_context_free":    { "type": ["integer", "null"] }
      }
    },
    "limits": {
      "type": "object",
      "properties": {
        "rpm":  { "type": ["integer", "null"] },
        "rpd":  { "type": ["integer", "null"] },
        "tpm":  { "type": ["integer", "null"] },
        "tpd":  { "type": ["integer", "null"] },
        "notes":{ "type": "string" }
      }
    },
    "privacy": {
      "type": "object",
      "required": ["trains_on_data", "logs_prompts"],
      "properties": {
        "trains_on_data":   { "enum": ["yes", "no", "opt_out", "unknown"] },
        "logs_prompts":     { "enum": ["yes", "no", "unknown"] },
        "retention_days":   { "type": ["integer", "null"] },
        "human_review":     { "enum": ["yes", "no", "unknown"] },
        "policy_url":       { "type": "string", "format": "uri" }
      }
    },
    "checker": {
      "type": "object",
      "description": "How scripts/check-keys.mjs validates this provider's key",
      "properties": {
        "method":      { "enum": ["GET", "POST"] },
        "endpoint":    { "type": "string" },
        "expect_status": { "type": "integer" },
        "rate_limit_headers": { "type": "array", "items": { "type": "string" } }
      }
    },
    "last_verified":     { "type": "string", "format": "date" },
    "sources":           { "type": "array", "items": { "type": "string", "format": "uri" } }
  }
}
```

### 4.8 `configs/.env.example`

```bash
# Free API Key —— 环境变量模板
# 复制为 .env（已 git-ignored）后填入你自己的 key

# OpenRouter (https://openrouter.ai/keys)
OPENROUTER_API_KEY=

# Google Gemini / AI Studio (https://aistudio.google.com/apikey)
GEMINI_API_KEY=

# Groq (https://console.groq.com/keys)
GROQ_API_KEY=

# Cerebras (https://cloud.cerebras.ai)
CEREBRAS_API_KEY=

# GitHub Models (用你的 GitHub PAT，scope: models:read)
GITHUB_TOKEN=

# Mistral (https://console.mistral.ai/api-keys)
MISTRAL_API_KEY=

# Cloudflare Workers AI
CLOUDFLARE_ACCOUNT_ID=
CLOUDFLARE_API_TOKEN=

# Ollama 本地（无需 key）
OLLAMA_BASE_URL=http://localhost:11434
```

## 5. Acceptance Criteria

- [ ] 所有 10 个文件已创建，`ls` 能看到
- [ ] `README.md` 和 `README.en.md` 互相链接，且双向能跳
- [ ] `providers.schema.json` 用任一 JSON Schema validator 解析无错
- [ ] `providers.json` 引用了 schema 且能被 validator 通过（即使 `providers: []`）
- [ ] `CHANGELOG.md` 有 `[Unreleased]` 段并记录了本 phase
- [ ] `git status` 干净（如已 init），所有文件已 commit
- [ ] **不存在**任何"占位符"文件（如空的 `notes.md`、`TODO.md`）—— 只有交付清单里列的文件
- [ ] 跑 `node -e "JSON.parse(require('fs').readFileSync('providers.json'))"` 不报错

## 6. Out of Scope

- ❌ 不要填充 `providers.json` 的实际数据（那是 phase 02）
- ❌ 不要写 provider 文档内容（phase 03）
- ❌ 不要写 `check-keys.mjs`（phase 05）
- ❌ 不要写隐私矩阵（phase 06）
- ❌ 不要 init `scripts/` 目录的 npm（phase 05 再做）

## 7. Notes for Phase 02

- `providers.json` 的 schema 已定，phase 02 填数据时严格按字段
- 如果 phase 02 发现 schema 漏了字段，**改 schema 同时记 CHANGELOG**，不要绕过

## 8. Estimated Effort

约 1.5-2 小时（含 schema 设计 + 双语 README 框架）。
