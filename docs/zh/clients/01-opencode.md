# opencode 接入免费 API Key

> Last Verified: 2026-04-28 against opencode v0.1.x (CLI)
> Platform tested: Windows / macOS / Linux

[English](../../en/clients/01-opencode.md)

## 这是什么

opencode 是 Anthropic 官方推出的开源 AI 编码助手（CLI 工具），在终端内运行，支持多文件理解、代码生成、代码库搜索。它原生支持任意 OpenAI 兼容 API，无需插件即可对接本项目所有免费提供商。

**适合：** 热衷命令行的开发者、不想装 IDE 插件的用户、需要在服务器/远程环境使用 AI 的场景。

## 安装

```bash
# npm（推荐）
npm install -g opencode-ai

# 或 bun
bun install -g opencode-ai
```

> **配置文件位置：**
> - macOS/Linux: `~/.config/opencode/config.json`
> - Windows: `%APPDATA%\opencode\config.json`

## 快速接入：OpenRouter（最推荐）

1. 初始化配置（首次运行自动创建）：
   ```bash
   opencode
   ```
2. 退出，编辑配置文件 `~/.config/opencode/config.json`：

```json
{
  "provider": "openai",
  "model": "deepseek/deepseek-chat:free",
  "openai": {
    "baseURL": "https://openrouter.ai/api/v1",
    "apiKey": "sk-or-v1-YOUR_OPENROUTER_KEY"
  }
}
```

3. 重新运行 `opencode`，在聊天窗口发 "hello" 验证。

## 各家接入参数表

| Provider | baseURL | 推荐 Free Model | 备注 |
|---|---|---|---|
| OpenRouter | `https://openrouter.ai/api/v1` | `deepseek/deepseek-chat:free` | 最多模型选择 |
| Gemini | `https://generativelanguage.googleapis.com/v1beta/openai/` | `gemini-2.0-flash` | 1.5K RPD 免费 |
| Groq | `https://api.groq.com/openai/v1` | `llama-3.3-70b-versatile` | 最快推理速度 |
| Cerebras | `https://api.cerebras.ai/v1` | `llama-3.3-70b` | 1M TPD |
| GitHub Models | `https://models.github.ai/inference` | `openai/gpt-4o-mini` | 需 GitHub 账户 |
| Mistral | `https://api.mistral.ai/v1` | `mistral-small-latest` | 1B tok/月 |
| Ollama | `http://localhost:11434/v1` | `qwen2.5-coder:7b` | 完全本地 |

> ⚠️ Cloudflare Workers AI 不支持标准 OpenAI 兼容接口，不推荐在 opencode 内使用。

## 完整配置文件示例

### Groq（速度优先）

```json
{
  "provider": "openai",
  "model": "llama-3.3-70b-versatile",
  "openai": {
    "baseURL": "https://api.groq.com/openai/v1",
    "apiKey": "gsk_YOUR_GROQ_KEY"
  },
  "context": {
    "maxTokens": 32768
  }
}
```

### Gemini（上下文最长）

```json
{
  "provider": "openai",
  "model": "gemini-2.5-flash",
  "openai": {
    "baseURL": "https://generativelanguage.googleapis.com/v1beta/openai/",
    "apiKey": "AIza_YOUR_GEMINI_KEY"
  },
  "context": {
    "maxTokens": 100000
  }
}
```

### Ollama（完全本地 + 隐私）

```json
{
  "provider": "openai",
  "model": "qwen2.5-coder:7b",
  "openai": {
    "baseURL": "http://localhost:11434/v1",
    "apiKey": "ollama"
  }
}
```

### 环境变量方式（推荐团队共享）

opencode 支持从环境变量读取 key，避免明文写入配置文件：

```bash
# .env 或 shell profile
export OPENROUTER_API_KEY="sk-or-v1-..."
export GROQ_API_KEY="gsk_..."
```

```json
{
  "provider": "openai",
  "model": "deepseek/deepseek-chat:free",
  "openai": {
    "baseURL": "https://openrouter.ai/api/v1",
    "apiKey": "${OPENROUTER_API_KEY}"
  }
}
```

## 推荐组合

- **代码补全 + 问答：** Groq `llama-3.3-70b-versatile`（快，14.4K RPD）
- **大文件理解：** Gemini `gemini-2.5-flash`（1M token 上下文）
- **完全离线：** Ollama `qwen2.5-coder:7b`（本地无限）
- **工具调用（agent）：** OpenRouter `deepseek/deepseek-chat:free`（支持 function calling）

## 常见坑

1. **中国大陆网络访问 OpenRouter / Groq 受限** — 需要代理或使用 Gemini（国内 `generativelanguage.googleapis.com` 大部分地区可直连）。Ollama 完全离线无此问题。

2. **model 名称大小写敏感** — 例如 OpenRouter 的 `deepseek/deepseek-chat:free` 中 `:free` 必须小写且完整，否则会 404 或被收费路由。

3. **Gemini OpenAI 兼容端点结尾斜杠不能省** — `baseURL` 必须是 `https://generativelanguage.googleapis.com/v1beta/openai/`，少了末尾 `/` 会报 404。

4. **Token 上限配置过高** — 设 `maxTokens` 超过模型实际支持值会返回 400 错误。参考各 provider 文档的 context window 大小。

5. **Ollama 未启动** — 运行前确认 `ollama serve` 已在后台运行，否则会连接拒绝。

## 验证安装

```bash
opencode
# 在聊天界面输入：你好，用一句话解释什么是 API
```

预期：5 秒内返回一句话。如果：
- 转圈不返回 → 检查 `baseURL`、网络/代理
- `401 Unauthorized` → API key 格式错误（注意各家前缀不同）
- `404 Not Found` → model 名拼错，或 `baseURL` 路径不对
- `429 Too Many Requests` → 触发限速，等 1 分钟后重试

## 进阶：多 Provider 自动切换

opencode 本身不内置多 provider 路由，但可用 LiteLLM Proxy 统一代理：

```bash
# 启动 LiteLLM proxy（见 Recipe 03）
litellm --config configs/litellm_config.yaml --port 4000

# opencode 配置指向本地 proxy
```

```json
{
  "provider": "openai",
  "model": "fast-chat",
  "openai": {
    "baseURL": "http://localhost:4000",
    "apiKey": "sk-anything"
  }
}
```

详见 [Recipe 03：LiteLLM 多提供商路由](../recipes/03-litellm-router.md)。

## Sources

- opencode 官方文档: https://opencode.ai/docs (fetched 2026-04-28)
- opencode GitHub: https://github.com/sst/opencode (fetched 2026-04-28)
