# Phase 07: Client Integrations（客户端接入指南）

**前置阅读：** `PHASES.md` + `phases/00-context.md` + `phases/03-provider-docs-zh.md`

## 1. Goal

教用户把上面 8 家 provider 的 key 接到流行的 LLM 客户端里。

## 2. Why Now

provider 文档和隐私已就绪。现在让 key "落地"到用户实际的工作流。

## 3. 覆盖的客户端（7 个）

| 客户端 | 类型 | 为什么收 |
|---|---|---|
| **opencode** | CLI agent | 用户问到，类 Claude Code |
| **Cline** | VSCode 扩展 | 最流行的 OSS coding agent |
| **Continue** | VSCode/JetBrains | 老牌 |
| **Cursor** | IDE | 主流 AI 编辑器 |
| **LibreChat** | Web UI | 自托管 ChatGPT 替代 |
| **OpenWebUI** | Web UI | 配 Ollama 最流行 |
| **Chatbox** | 桌面客户端 | 中文用户多 |

## 4. 文件清单（双语 = 14 个文件）

```
docs/zh/20-clients/
├── opencode.md
├── cline.md
├── continue.md
├── cursor.md
├── librechat.md
├── openwebui.md
└── chatbox.md
docs/en/20-clients/        # mirror
```

## 5. 每篇模板（必须遵循）

> **完整模板见 [`phases/templates/client-doc.md`](templates/client-doc.md)。** 下方为概览。

```markdown
# <Client Name> 接入免费 API key

> Last Verified: 2026-04-27 against <client> v<version>

[English](../../en/20-clients/<name>.md)

## 这是什么
一段简介 + 适合谁。

## 快速接入：OpenRouter（最推荐）
1. 安装 / 打开 <client>
2. 设置 → API Provider → 选 "OpenAI Compatible" / "Custom"
3. Base URL: `https://openrouter.ai/api/v1`
4. API Key: 你的 OpenRouter key
5. Model: `deepseek/deepseek-chat:free`

附截图 / 配置文件位置（如适用）。

## 各家接入参数表

| Provider | Provider Type | Base URL | Model 例 |
|---|---|---|---|
| OpenRouter | OpenAI | https://openrouter.ai/api/v1 | deepseek/deepseek-chat:free |
| Gemini | Google / OpenAI | (见下) | gemini-2.0-flash-exp |
| Groq | OpenAI | https://api.groq.com/openai/v1 | llama-3.3-70b-versatile |
| ... | ... | ... | ... |

## Gemini 特殊
有些客户端有"Google Gemini"独立选项，用 native API；其他用 OpenAI 兼容入口 `https://generativelanguage.googleapis.com/v1beta/openai/`。

## Ollama 特殊
本地：`http://localhost:11434/v1` (有些版本不需要 `/v1`)。

## 推荐组合
- **代码补全：** Cursor + OpenRouter (DeepSeek)
- **聊天：** Chatbox + Gemini
- **离线：** OpenWebUI + Ollama

## 常见坑
- 配置文件路径（macOS / Windows / Linux）
- API key header 的格式 vs 客户端期望的格式
- 客户端不识别 `:free` 后缀（少数会过滤）→ 关闭"模型校验"

## 截图位 / 配置文件示例
（如该客户端有配置文件，给完整示例）

## 参考
- 客户端官方 docs URL
- 我们的 [providers.json](../../../providers.json)
```

## 6. 各客户端关键信息（先 fetch 核对）

执行 phase 时 **每个客户端都要 WebFetch 一次官方 docs**，确认配置位置/字段名近期是否变化。

| Client | 官方 | 关键点 |
|---|---|---|
| opencode | https://opencode.ai | TOML 配置 `~/.config/opencode/opencode.toml`；支持 OpenAI 兼容 provider |
| Cline | https://cline.bot | VSCode 设置面板；多 provider 内置 |
| Continue | https://continue.dev | `~/.continue/config.json`；模型数组 |
| Cursor | https://cursor.com | Settings → Models → "Custom OpenAI" 入口 |
| LibreChat | https://librechat.ai | `librechat.yaml` 配置 |
| OpenWebUI | https://openwebui.com | Admin → Settings → Connections |
| Chatbox | https://chatboxai.app | UI 直接配 |

## 7. Acceptance Criteria

- [ ] 14 个 markdown 文件按模板完成
- [ ] 每篇头部 `Last Verified` + 客户端版本号
- [ ] 每篇至少展示 OpenRouter + Gemini + Ollama 三家接入步骤
- [ ] 配置文件路径 / 命令在 Win + macOS + Linux 都列出（如适用）
- [ ] 每个 provider 文档（phase 03）的"接到客户端"章节链接全部能跳通（不再 404）
- [ ] README.md / README.en.md 添加客户端目录链接
- [ ] CHANGELOG 更新

## 8. Out of Scope

- ❌ 客户端的高级用法（multi-agent / MCP 等）
- ❌ 客户端互相对比（这不是评测项目）
- ❌ 写第 8 个客户端（v1.0.0 锁定 7 个）

## 9. Estimated Effort

约 5-7 小时（每客户端 ~40 分钟，含 fetch + 真机测试 + 双语）。**强烈建议至少在自己机器上装 1-2 个客户端真试一遍。**
