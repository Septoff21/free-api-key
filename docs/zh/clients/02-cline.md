# Cline 接入免费 API Key

> Last Verified: 2026-04-28 against Cline v3.x (VS Code Extension)
> Platform tested: Windows / macOS / Linux（均通过 VS Code）

[English](../../en/clients/02-cline.md)

## 这是什么

Cline（原名 Claude Dev）是 VS Code 中最流行的 AI 编码助手扩展之一，支持自主完成文件读写、终端命令执行、浏览器操作等复杂任务（"agentic coding"）。它支持任意 OpenAI 兼容 API，可对接本项目所有免费提供商。

**适合：** 使用 VS Code 的开发者、需要让 AI 自主完成多步任务（写代码+测试+修复）的场景。

## 安装

1. 打开 VS Code → Extensions（`Ctrl+Shift+X` / `Cmd+Shift+X`）
2. 搜索 **"Cline"**，安装 saoudrizwan.claude-dev
3. 侧边栏出现 Cline 图标

## 快速接入：OpenRouter（最推荐）

1. 点击侧边栏 Cline 图标 → 右上角 **齿轮⚙** → Settings
2. **API Provider**：选择 `OpenAI Compatible`
3. 填写：
   - **Base URL**: `https://openrouter.ai/api/v1`
   - **API Key**: 你的 OpenRouter key
   - **Model ID**: `deepseek/deepseek-chat:free`
4. 点击 **Save**，回到聊天界面发 "hello" 测试

[截图占位 - Cline Settings 面板，API Provider 下拉选 OpenAI Compatible]

## 各家接入参数表

| Provider | API Provider 选项 | Base URL | 推荐 Free Model |
|---|---|---|---|
| OpenRouter | `OpenAI Compatible` | `https://openrouter.ai/api/v1` | `deepseek/deepseek-chat:free` |
| Gemini | `Google Gemini` *(内置)* | *(自动)* | `gemini-2.0-flash-exp` |
| Groq | `OpenAI Compatible` | `https://api.groq.com/openai/v1` | `llama-3.3-70b-versatile` |
| Cerebras | `OpenAI Compatible` | `https://api.cerebras.ai/v1` | `llama-3.3-70b` |
| GitHub Models | `OpenAI Compatible` | `https://models.github.ai/inference` | `openai/gpt-4o-mini` |
| Mistral | `OpenAI Compatible` | `https://api.mistral.ai/v1` | `mistral-small-latest` |
| Ollama | `Ollama` *(内置)* | `http://localhost:11434` | `qwen2.5-coder:7b` |

> **Gemini 内置支持**：Cline 对 Gemini 有原生支持，直接选 `Google Gemini` 并粘贴 key，无需手动填 Base URL。

## Gemini 接入（详细步骤）

Cline 对 Gemini 有一等公民支持，步骤更简单：

1. Settings → **API Provider**：选 `Google Gemini`
2. **API Key**：粘贴 Gemini API key（`AIza...`）
3. **Model**：选 `gemini-2.0-flash-exp`（免费 1.5K RPD）
4. 保存

⚠️ **注意**：Gemini 免费层会使用对话内容训练模型，请勿提交含个人信息或代码库敏感信息的对话。详见 [隐私矩阵](../06-privacy-matrix.md)。

## Ollama 接入（完全本地）

1. 确保 Ollama 已启动：
   ```bash
   ollama pull qwen2.5-coder:7b
   ollama serve
   ```
2. Settings → **API Provider**：选 `Ollama`
3. **Base URL**：`http://localhost:11434`（默认，无需改动）
4. **Model**：在下拉中选 `qwen2.5-coder:7b`（若列表为空检查 Ollama 是否运行）

## 配置文件位置

Cline 配置存储在 VS Code 的 settings.json（`settings.json` 里以 `cline.` 前缀）：

> - macOS: `~/Library/Application Support/Code/User/settings.json`
> - Windows: `%APPDATA%\Code\User\settings.json`
> - Linux: `~/.config/Code/User/settings.json`

手动编辑示例（OpenRouter）：

```json
{
  "cline.apiProvider": "openai",
  "cline.openAiBaseUrl": "https://openrouter.ai/api/v1",
  "cline.openAiApiKey": "sk-or-v1-YOUR_KEY",
  "cline.openAiModelId": "deepseek/deepseek-chat:free"
}
```

## Cline 特有功能配置

### 自定义系统提示

```json
{
  "cline.customInstructions": "请用中文回答所有问题。代码注释也用中文。"
}
```

### 自动批准低风险操作（加快速度）

```json
{
  "cline.alwaysAllowReadOnly": true,
  "cline.alwaysAllowWrite": false
}
```

> 建议 `alwaysAllowWrite` 保持 false，每次写文件手动确认更安全。

### 限制 API 消耗上限

```json
{
  "cline.maxTokens": 4096
}
```

## 推荐组合

- **日常代码问答（快）：** Groq `llama-3.3-70b-versatile` — 14.4K RPD，推理极快
- **大代码库分析：** Gemini `gemini-2.5-flash` — 1M token 上下文
- **自主 Agent 任务：** OpenRouter `deepseek/deepseek-chat:free` — 工具调用能力强
- **完全本地 + 隐私：** Ollama `qwen2.5-coder:7b` — 无网络请求

## 常见坑

1. **"Model not supported" 或模型列表为空** — 选 `OpenAI Compatible` 后，Model ID 必须**手动输入**（Cline 不会自动拉取远程模型列表），注意 model 名完整拼写，如 `deepseek/deepseek-chat:free` 中的 `:free` 不能省。

2. **中国大陆访问 OpenRouter/Groq 超时** — 在 VS Code 里通过 `HTTP: Proxy` 设置代理，或改用 Gemini（大部分地区可直连）、Ollama（本地）。

3. **Gemini 返回空响应** — Gemini 偶尔在 openai-compat 模式下返回空 `choices`，改用 Cline 内置的 `Google Gemini` 选项（非 OpenAI Compatible）可避免此问题。

4. **Cline 的 agentic 任务消耗 token 极快** — 自主任务一轮可能消耗数千 token，建议在 Groq/Cerebras 高配额提供商上使用，或用 Ollama 本地跑，避免把 Gemini 1.5K RPD 在几轮内耗尽。

5. **API Key 存储在 VS Code 密钥库** — 实际 key 存储在系统密钥链（macOS Keychain / Windows Credential Manager），settings.json 里看到的是占位符，不是明文 key，不需要担心 settings.json 泄露。

## 验证安装

在 Cline 聊天框发送：

```
Create a new file called hello.py with content: print("hello from Cline")
```

Cline 应该：
1. 显示要创建的文件预览
2. 请求确认（或在 alwaysAllowWrite=true 时自动创建）
3. 文件出现在工作区

如果没有任何响应：检查 API Key 和 Base URL；如果报 429 等速率限制错误，切换到配额更高的提供商。

## 进阶：LiteLLM Proxy 统一代理

配合 LiteLLM 实现自动故障转移，Cline 无需感知多 provider：

```json
{
  "cline.apiProvider": "openai",
  "cline.openAiBaseUrl": "http://localhost:4000",
  "cline.openAiApiKey": "sk-anything",
  "cline.openAiModelId": "fast-chat"
}
```

详见 [Recipe 03：LiteLLM 多提供商路由](../recipes/03-litellm-router.md)。

## Sources

- Cline VS Code Marketplace: https://marketplace.visualstudio.com/items?itemName=saoudrizwan.claude-dev (fetched 2026-04-28)
- Cline 官方文档: https://docs.cline.bot (fetched 2026-04-28)
- Cline GitHub: https://github.com/cline/cline (fetched 2026-04-28)
