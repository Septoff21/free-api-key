# Cursor 接入免费 API Key

> Last Verified: 2026-04-28 against Cursor v0.44.x
> Platform tested: Windows / macOS / Linux

[English](../../en/clients/04-cursor.md)

## 这是什么

Cursor 是目前最流行的 AI 原生代码编辑器，基于 VS Code fork，内置 AI 聊天（Cmd+L）、代码编辑（Cmd+K）、Composer（多文件生成）和 Tab 智能补全。**Cursor 免费计划每月提供有限的 premium 模型请求**（500次），超出后可配置"自带 key"（Bring Your Own Key, BYOK）使用外部 API，本指南专注于 BYOK 配置。

**适合：** 已有 Cursor 但月度配额不足的用户、想用免费 API 无限制使用 Cursor 的开发者。

## 安装

- 官网下载：https://cursor.sh
- 支持 Windows、macOS、Linux（.AppImage / .deb / .rpm）

## Cursor 的 BYOK 模式

Cursor → **Settings**（`Ctrl+Shift+J` / `Cmd+Shift+J`）→ **Models** 标签页：

1. 找到 **"OpenAI API Key"** 或 **"Anthropic API Key"** 区域
2. 启用 **"Enable Custom API Keys"**（切换开关）
3. 填入你的 key

> ⚠️ Cursor BYOK 模式：**Tab 自动补全仍然消耗 Cursor 自己的配额**（Tab 补全不走 BYOK）。BYOK 只影响 **Chat**（Cmd+L）和 **Cmd+K** 编辑功能。Tab 补全需要 Cursor Pro 订阅或通过 Continue 扩展实现。

## 接入 OpenRouter（最推荐）

Cursor 原生支持 OpenAI 兼容接口，OpenRouter 无缝对接：

1. Settings → Models → 启用 **"OpenAI API Key"**
2. **OpenAI API Key**：填入 `sk-or-v1-YOUR_OPENROUTER_KEY`
3. **Override OpenAI Base URL**：`https://openrouter.ai/api/v1`
4. 在 Model 下拉中添加自定义模型：`deepseek/deepseek-chat:free`
5. 在聊天（Cmd+L）中选择该模型

[截图占位 - Cursor Settings → Models，填写 Base URL 和 Model 字段]

## 各家接入参数表

| Provider | API Key 字段 | Override Base URL | 推荐 Free Model |
|---|---|---|---|
| OpenRouter | OpenAI API Key | `https://openrouter.ai/api/v1` | `deepseek/deepseek-chat:free` |
| Groq | OpenAI API Key | `https://api.groq.com/openai/v1` | `llama-3.3-70b-versatile` |
| Cerebras | OpenAI API Key | `https://api.cerebras.ai/v1` | `llama-3.3-70b` |
| Gemini | OpenAI API Key | `https://generativelanguage.googleapis.com/v1beta/openai/` | `gemini-2.0-flash` |
| GitHub Models | OpenAI API Key | `https://models.github.ai/inference` | `openai/gpt-4o-mini` |
| Mistral | OpenAI API Key | `https://api.mistral.ai/v1` | `mistral-small-latest` |
| Ollama | OpenAI API Key | `http://localhost:11434/v1` | `qwen2.5-coder:7b` |

> **Anthropic API Key 字段**：Cursor 也支持直接填 Anthropic key，但 Anthropic 无免费层，此处不推荐。

## 自定义模型添加步骤

Cursor 不自动拉取外部 provider 的模型列表，需手动添加：

1. Settings → Models → 滚动到最下方 **"+ Add Model"**
2. 输入完整模型名，例如：`deepseek/deepseek-chat:free`
3. 点击 **Add**
4. 在聊天界面 Model 选择器里找到并选中该模型

常用免费模型列表（直接复制粘贴）：
```
deepseek/deepseek-chat:free          # OpenRouter，通用
meta-llama/llama-3.3-70b-instruct:free  # OpenRouter，开源
llama-3.3-70b-versatile             # Groq
llama-3.3-70b                       # Cerebras
gemini-2.0-flash                    # Gemini
gemini-2.5-flash                    # Gemini（推理更强）
mistral-small-latest                # Mistral
qwen2.5-coder:7b                    # Ollama（本地）
```

## 配合 LiteLLM 实现多 Provider 自动切换

Cursor 只允许填一个 Base URL，但可以用 LiteLLM Proxy 统一代理多个 provider：

```bash
# 启动 LiteLLM（见 configs/litellm_config.yaml）
litellm --config configs/litellm_config.yaml --port 4000
```

Cursor 配置：
- **Override Base URL**: `http://localhost:4000`
- **OpenAI API Key**: `sk-anything`（proxy 不验证）
- **Model**: `fast-chat`（LiteLLM 别名）

详见 [Recipe 03：LiteLLM 多提供商路由](../recipes/03-litellm-router.md)。

## Tab 补全方案（BYOK 不覆盖）

由于 Cursor BYOK 不覆盖 Tab 补全，可以安装 **Continue 扩展**在 Cursor 内实现自定义 Tab 补全：

1. Cursor 内打开 Extensions → 搜索 Continue → 安装
2. 配置 `~/.continue/config.json` 的 `tabAutocompleteModel`（见 [Continue 文档](03-continue.md)）

或者：直接升级到 Cursor Pro（$20/月），Tab 补全无限量。

## 推荐组合

- **Chat + Code Edit（BYOK）：** Groq `llama-3.3-70b-versatile`（极快，14.4K RPD）
- **长文件分析（BYOK）：** Gemini `gemini-2.5-flash`（1M context）
- **隐私敏感代码：** Ollama `qwen2.5-coder:7b`（本地，零云端请求）
- **Tab 补全（Continue）：** Codestral FIM 或 Ollama qwen2.5-coder

## 常见坑

1. **Tab 补全无效果/仍提示升级 Pro** — 这是 Cursor BYOK 的已知限制：Tab 补全不走自定义 API。Tab 补全需要 Pro 订阅或安装 Continue 扩展。

2. **模型名无法识别（选中后无法使用）** — 手动添加的模型如果 provider 不认识该名称会返回 404。确保模型名与 provider 文档完全一致（大小写、斜杠、`:free` 后缀）。

3. **Cursor 的 "Override Base URL" 被重置** — 某些 Cursor 版本重启后会清空自定义 Base URL，需重新填写。建议升级到最新版本（该 bug 在新版已修复）。

4. **中国大陆网络访问问题** — Cursor 本身也会访问 cursor.sh 的服务器验证 license，需要代理。API 请求走自定义 Base URL 时同样受网络影响，建议本机配置系统代理或用 Ollama（完全本地）。

5. **Composer 多文件任务消耗 token 极快** — 建议在高配额 provider（Groq/Cerebras 14.4K RPD）上使用，避免 Gemini 的低 RPD 配额被 Composer 在几次操作内耗尽。

## 验证安装

1. 打开 Cursor，按 `Cmd+L`（macOS）或 `Ctrl+L`（Windows）打开 Chat
2. 在 Model 选择器选择你刚添加的模型
3. 发送：`你好，用一句话解释 API 是什么`
4. 预期：5 秒内收到回复

如果出现错误：
- `401` → API key 填错或格式错误
- `404` → Model 名不存在或 Base URL 路径不对
- `Connection refused` → Ollama 未启动（如用本地模型）

## Sources

- Cursor 官方文档: https://docs.cursor.com (fetched 2026-04-28)
- Cursor 模型配置: https://docs.cursor.com/settings/models (fetched 2026-04-28)
