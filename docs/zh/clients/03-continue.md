# Continue 接入免费 API Key

> Last Verified: 2026-04-28 against Continue v0.9.x (VS Code / JetBrains Extension)
> Platform tested: Windows / macOS / Linux

[English](../../en/clients/03-continue.md)

## 这是什么

Continue 是一款开源 AI 编码助手，支持 VS Code 和 JetBrains 全系 IDE。核心功能：**Tab 代码补全**（FIM）、聊天问答、代码编辑（`Cmd+I`/`Ctrl+I`）、代码库索引（@codebase）。Continue 的配置高度灵活，可分别为"补全"和"聊天"指定不同的模型 + 提供商，是接入免费 API 最适合深度定制的客户端。

**适合：** 重度使用代码补全的开发者、需要在 VS Code 和 JetBrains 之间共享配置的团队。

## 安装

**VS Code：**
- Extensions → 搜索 "Continue" → 安装 Continue.continue

**JetBrains（IntelliJ / PyCharm / GoLand 等）：**
- Settings → Plugins → Marketplace → 搜索 "Continue" → 安装

> **配置文件位置：**
> - macOS: `~/.continue/config.json`
> - Windows: `%USERPROFILE%\.continue\config.json`
> - Linux: `~/.continue/config.json`
>
> 也可在扩展内点击右下角 **齿轮⚙** → Open config.json 直接编辑。

## 快速接入：OpenRouter（最推荐）

编辑 `~/.continue/config.json`：

```json
{
  "models": [
    {
      "title": "OpenRouter DeepSeek (Free)",
      "provider": "openai",
      "model": "deepseek/deepseek-chat:free",
      "apiBase": "https://openrouter.ai/api/v1",
      "apiKey": "sk-or-v1-YOUR_OPENROUTER_KEY"
    }
  ],
  "tabAutocompleteModel": {
    "title": "Groq Autocomplete",
    "provider": "openai",
    "model": "llama-3.1-8b-instant",
    "apiBase": "https://api.groq.com/openai/v1",
    "apiKey": "gsk_YOUR_GROQ_KEY"
  }
}
```

保存后 Continue 自动重载，在 VS Code 侧边栏打开 Continue 面板发送 "hello" 测试。

## 各家接入参数表

| Provider | `provider` 字段 | `apiBase` | 推荐 Free Chat Model | 推荐 Free Autocomplete Model |
|---|---|---|---|---|
| OpenRouter | `openai` | `https://openrouter.ai/api/v1` | `deepseek/deepseek-chat:free` | 不推荐（latency 高） |
| Gemini | `gemini` *(内置)* | *(自动)* | `gemini-2.0-flash` | 不支持 FIM |
| Groq | `openai` | `https://api.groq.com/openai/v1` | `llama-3.3-70b-versatile` | `llama-3.1-8b-instant` |
| Cerebras | `openai` | `https://api.cerebras.ai/v1` | `llama-3.3-70b` | `llama3.1-8b` |
| GitHub Models | `openai` | `https://models.github.ai/inference` | `openai/gpt-4o-mini` | — |
| Mistral | `mistral` *(内置)* | *(自动)* | `mistral-small-latest` | `codestral-latest`（需单独 key）|
| Ollama | `ollama` *(内置)* | `http://localhost:11434` | `llama3.3` | `qwen2.5-coder:7b` |

## 完整推荐配置（多模型组合）

```json
{
  "models": [
    {
      "title": "DeepSeek via OpenRouter (Free)",
      "provider": "openai",
      "model": "deepseek/deepseek-chat:free",
      "apiBase": "https://openrouter.ai/api/v1",
      "apiKey": "sk-or-v1-YOUR_KEY"
    },
    {
      "title": "Gemini 2.0 Flash",
      "provider": "gemini",
      "model": "gemini-2.0-flash",
      "apiKey": "AIza_YOUR_GEMINI_KEY"
    },
    {
      "title": "Groq 70B (Fast)",
      "provider": "openai",
      "model": "llama-3.3-70b-versatile",
      "apiBase": "https://api.groq.com/openai/v1",
      "apiKey": "gsk_YOUR_GROQ_KEY"
    },
    {
      "title": "Ollama Local",
      "provider": "ollama",
      "model": "qwen2.5-coder:7b",
      "apiBase": "http://localhost:11434"
    }
  ],
  "tabAutocompleteModel": {
    "title": "Groq 8B Autocomplete",
    "provider": "openai",
    "model": "llama-3.1-8b-instant",
    "apiBase": "https://api.groq.com/openai/v1",
    "apiKey": "gsk_YOUR_GROQ_KEY",
    "contextLength": 8192
  },
  "embeddingsProvider": {
    "provider": "ollama",
    "model": "nomic-embed-text",
    "apiBase": "http://localhost:11434"
  },
  "slashCommands": [
    { "name": "edit", "description": "Edit highlighted code" },
    { "name": "comment", "description": "Add comments to code" },
    { "name": "tests", "description": "Generate unit tests" }
  ]
}
```

## Codestral 代码补全（Mistral FIM，最推荐补全方案）

Codestral 是目前免费层里**唯一支持原生 FIM**（Fill-in-Middle）的云端模型，补全质量极高：

```json
{
  "tabAutocompleteModel": {
    "title": "Codestral FIM",
    "provider": "mistral",
    "model": "codestral-latest",
    "apiKey": "YOUR_MISTRAL_API_KEY",
    "apiBase": "https://codestral.mistral.ai/v1"
  }
}
```

> ⚠️ Codestral 需要单独申请 key（与 Mistral Chat 同一账户，但需在 console.mistral.ai 单独开通），每月 1B token 免费。限速 2 RPM（每分钟请求），适合补全（每次请求较小）。

## Ollama 本地补全（完全离线）

```json
{
  "tabAutocompleteModel": {
    "title": "Qwen2.5-Coder Local FIM",
    "provider": "ollama",
    "model": "qwen2.5-coder:7b",
    "apiBase": "http://localhost:11434"
  }
}
```

```bash
# 下载模型（约 4.7GB）
ollama pull qwen2.5-coder:7b
```

## @codebase 索引配置

Continue 的 `@codebase` 功能需要本地嵌入（embedding）模型：

```json
{
  "embeddingsProvider": {
    "provider": "ollama",
    "model": "nomic-embed-text",
    "apiBase": "http://localhost:11434"
  }
}
```

```bash
ollama pull nomic-embed-text
```

> 完成后在 Continue 面板输入 `@codebase 找所有处理认证的函数` 即可搜索代码库。

## 推荐组合

- **Chat（日常问答）：** OpenRouter DeepSeek Free 或 Groq 70B
- **Tab 补全：** Codestral（云端 FIM 最佳）或 Ollama qwen2.5-coder（离线最佳）
- **大文件分析：** Gemini 2.0 Flash（1M context）
- **完全离线：** Ollama qwen2.5-coder + nomic-embed-text

## 常见坑

1. **Tab 补全一直是 "loading" 状态** — 检查 `tabAutocompleteModel` 配置；Groq 8B 是最快的云端选项，若还慢则改用 Ollama 本地。

2. **Gemini provider 不支持 FIM** — Gemini 不提供 Fill-in-Middle 端点，不能用作 `tabAutocompleteModel`，只能用作聊天模型（`models` 数组）。

3. **Codestral 2 RPM 触发限速** — 补全请求太频繁时会返回 429。Continue 内置退避重试，但可在设置里增大 `debounceDelay`（毫秒）减少触发频率：
   ```json
   { "tabAutocompleteOptions": { "debounceDelay": 1000 } }
   ```

4. **中国大陆访问 OpenRouter/Mistral 超时** — 改用 Gemini（可直连）或 Ollama（本地）。Continue 的 HTTP 请求走 VS Code 代理设置（`http.proxy`）。

5. **JetBrains 版本配置同步** — JetBrains 版 Continue 与 VS Code 版共享同一 `~/.continue/config.json`，切换 IDE 无需重新配置。

## 验证安装

1. 在 VS Code 打开任意 .py 文件，光标移到函数签名后，等待 1-3 秒，应出现灰色补全建议（Tab 接受）
2. 在 Continue 聊天面板：`解释这段代码的作用`（选中代码块后）
3. 若 Tab 补全不出现：检查 Continue 状态栏图标是否为绿色

## Sources

- Continue 官方文档: https://docs.continue.dev (fetched 2026-04-28)
- Continue GitHub: https://github.com/continuedev/continue (fetched 2026-04-28)
- Codestral 文档: https://docs.mistral.ai/capabilities/code_generation/ (fetched 2026-04-28)
