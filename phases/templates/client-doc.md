# Client Integration 文档模板

> Phase 07 写客户端接入文档时使用。

---

```markdown
# <Client Name> 接入免费 API key

> Last Verified: YYYY-MM-DD against <client> v<version>
> Platform tested: <Windows / macOS / Linux>

[English](../../en/20-clients/<name>.md)

## 这是什么

<一段：客户端定位 + 适合谁 + 我们为什么收>

## 安装

- macOS: <方式>
- Windows: <方式>
- Linux: <方式>

> 配置文件位置：
> - macOS: `~/Library/Application Support/<client>/...`
> - Windows: `%APPDATA%\<client>\...`
> - Linux: `~/.config/<client>/...`

## 快速接入：OpenRouter（最推荐）

1. 打开 <client>，进入 Settings → <具体路径>
2. <字段名>：选 "OpenAI Compatible" / "Custom"
3. **Base URL**：`https://openrouter.ai/api/v1`
4. **API Key**：粘贴你的 OpenRouter key
5. **Model**：`deepseek/deepseek-chat:free`
6. 保存，到聊天界面试发一条

<截图占位 / 配置文件示例>

## 各家接入参数表

| Provider | 客户端选项 | Base URL | 推荐 Free Model |
|---|---|---|---|
| OpenRouter | OpenAI Compatible | `https://openrouter.ai/api/v1` | `deepseek/deepseek-chat:free` |
| Gemini | <Google / OpenAI Compat> | `https://generativelanguage.googleapis.com/v1beta/openai/` | `gemini-2.0-flash-exp` |
| Groq | OpenAI Compatible | `https://api.groq.com/openai/v1` | `llama-3.3-70b-versatile` |
| Cerebras | OpenAI Compatible | `https://api.cerebras.ai/v1` | `llama-3.3-70b` |
| GitHub Models | OpenAI Compatible | `https://models.github.ai/inference` | `openai/gpt-4o-mini` |
| Mistral | <Mistral / OpenAI Compat> | `https://api.mistral.ai/v1` | `open-mistral-7b` |
| Cloudflare | OpenAI Compatible | `https://api.cloudflare.com/client/v4/accounts/<id>/ai/v1` | `@cf/meta/llama-3.1-8b-instruct` |
| Ollama | <Ollama / OpenAI Compat> | `http://localhost:11434/v1` | `qwen2.5-coder:7b` |

> 所有 Base URL 与 `providers.json` 一致。具体 model 列表见各 provider 文档。

## 配置文件示例（如适用）

​```<json/yaml/toml>
<完整可粘贴配置示例>
​```

## 推荐组合

- **代码补全：** <推荐组合>
- **聊天：** <推荐组合>
- **离线：** <推荐组合>

## 常见坑

1. **<坑 1>** — <如何识别 + 解决>
2. **<坑 2>** — <如何识别 + 解决>
3. **<坑 3>** — <如何识别 + 解决>

## 验证安装

发一条最简消息（如"你好"），应该 5 秒内返回。如果：
- 转圈不返回 → 检查 base URL / 网络
- 提示 401 → key 抄错或 scope 不对
- 提示找不到 model → model 名拼错或客户端做了校验

更详细排查见 [docs/zh/93-troubleshooting.md](../93-troubleshooting.md)。

## 进阶

- 多 provider 路由（用 LiteLLM）：[recipe](../30-recipes/max-free-quota.md)
- 完全本地：[recipe](../30-recipes/offline-private.md)

## Sources

- <client 官方 docs URL> (fetched YYYY-MM-DD)
- <如有 provider 集成的官方说明> (fetched YYYY-MM-DD)
```

---

## 写作铁律

1. 客户端版本号要写明，过 6 个月版本不一致会出问题
2. 配置文件路径**三平台都写**（即便没机器实测也写出"按客户端文档应是"）
3. 截图占位用 `[截图占位 - <描述>]`，不要用 AI 生成假截图
4. 至少展示 OpenRouter + Gemini + Ollama 三家完整步骤
5. "常见坑" 至少 3 条，至少 1 条是中文用户特有（网络、字符编码等）
