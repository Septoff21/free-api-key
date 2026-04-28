# Chatbox 接入免费 API Key

> Last Verified: 2026-04-28 against Chatbox v1.x
> Platform tested: Windows / macOS / Linux / iOS / Android

[English](../../en/clients/07-chatbox.md)

## 这是什么

Chatbox 是一款跨平台的 AI 聊天客户端，支持 Windows、macOS、Linux、iOS 和 Android，界面简洁，专注聊天体验。支持 OpenAI 兼容 API，配置简单，有图形化界面无需改配置文件。数据本地存储，对话历史不上传云端。

**适合：** 非开发者用户（界面最简单）、需要在手机上使用免费 API 的用户、想要跨设备同步对话记录的用户。

## 安装

- **Windows**: 官网下载 .exe 安装包，或 Microsoft Store 搜索 "Chatbox"
- **macOS**: 官网下载 .dmg，或 `brew install --cask chatbox`
- **Linux**: 下载 .AppImage，`chmod +x Chatbox-*.AppImage && ./Chatbox-*.AppImage`
- **iOS**: App Store 搜索 "Chatbox AI"
- **Android**: Google Play 搜索 "Chatbox AI"

官网：https://chatboxai.app

## 快速接入：OpenRouter（最推荐）

1. 打开 Chatbox → 左下角 **Settings（设置齿轮）**
2. **AI Provider（AI 提供商）**：选 `OpenAI API`（注意：不是"Chatbox AI"）
3. 填写：
   - **API Host**: `https://openrouter.ai/api/v1`
   - **API Key**: `sk-or-v1-YOUR_OPENROUTER_KEY`
   - **Model**: 输入 `deepseek/deepseek-chat:free`（需手动填写）
4. 点击 **Save（保存）**，回到聊天界面发送 "hello" 测试

[截图占位 - Chatbox 设置界面，API Host 和 API Key 填写区域]

## 各家接入参数表

| Provider | AI Provider 选项 | API Host | 推荐 Free Model |
|---|---|---|---|
| OpenRouter | `OpenAI API` | `https://openrouter.ai/api/v1` | `deepseek/deepseek-chat:free` |
| Gemini | `Google Gemini` *(内置)* | *(自动)* | `gemini-2.0-flash` |
| Groq | `OpenAI API` | `https://api.groq.com/openai/v1` | `llama-3.3-70b-versatile` |
| Cerebras | `OpenAI API` | `https://api.cerebras.ai/v1` | `llama-3.3-70b` |
| GitHub Models | `OpenAI API` | `https://models.github.ai/inference` | `openai/gpt-4o-mini` |
| Mistral | `OpenAI API` | `https://api.mistral.ai/v1` | `mistral-small-latest` |
| Ollama | `Ollama API` *(内置)* | `http://localhost:11434` | `qwen2.5:7b` |

## Gemini 接入（图形化，最简单）

Chatbox 对 Gemini 有内置支持：

1. Settings → **AI Provider** → 选 `Google Gemini`
2. **API Key**: 填入 `AIza_YOUR_GEMINI_KEY`
3. **Model**: 选择 `gemini-2.0-flash`（免费 1.5K RPD）
4. 保存

⚠️ Gemini 免费层训练数据说明：免费层的对话数据可能被用于模型训练，敏感内容请改用 Ollama 本地模型。

## Ollama 接入（完全本地）

1. 确保本机 Ollama 已启动：
   ```bash
   ollama pull qwen2.5:7b
   ollama serve
   ```
2. Settings → **AI Provider** → 选 `Ollama API`
3. **API Host**: `http://localhost:11434`（默认）
4. **Model**: 在下拉列表选 `qwen2.5:7b`

> 手机版 Chatbox 无法连接本机 Ollama（需要手机和电脑在同一局域网，且 Ollama 监听 `0.0.0.0`：`OLLAMA_HOST=0.0.0.0 ollama serve`，填写电脑的局域网 IP）。

## 多 Provider 切换技巧

Chatbox 支持创建多个"对话组"，每个对话组可以设置不同的 Provider：

1. 点击 **+ New Chat**
2. 在聊天标题右键 → **Edit（编辑）** → 在 Provider 里选不同配置

这样可以快速在 Groq（快）、Gemini（长文档）、Ollama（本地）之间切换，不需要每次改全局设置。

## 手机端配置（iOS / Android）

手机版 Chatbox 支持云端 API（OpenRouter、Groq、Gemini 等），配置步骤相同：

Settings → AI Provider → OpenAI API → 填入 Host 和 Key

> **手机端网络注意**：
> - 手机连接 VPN 时，API 请求才能到达被墙的服务（OpenRouter、Groq）
> - Gemini 在部分地区可直连（不需要 VPN）
> - Ollama 需要手机和电脑在同一 Wi-Fi，且 Ollama 监听 `0.0.0.0`

## 推荐组合

- **日常聊天（最简单）：** Gemini `gemini-2.0-flash`（Chatbox 内置，配置最简）
- **快速响应：** Groq `llama-3.3-70b-versatile`
- **多模型备用：** OpenRouter `deepseek/deepseek-chat:free`（一个 key 访问多个免费模型）
- **手机隐私：** 无法用 Ollama → 用 OpenRouter，注意别发敏感信息
- **桌面隐私：** Ollama 本地 `qwen2.5:7b`

## 常见坑

1. **Model 名显示错误或不返回内容** — Chatbox 的 Model 输入框接受任意字符串，如果拼错 provider 会返回 404。OpenRouter 的模型名格式为 `provider/model:variant`（如 `deepseek/deepseek-chat:free`），Groq 直接是 `llama-3.3-70b-versatile`。

2. **中国大陆 iOS/Android App 下载** — Chatbox 在 App Store 中国区可能下架，需切换到香港/美国 Apple ID 下载，或从官网下载 APK（Android）。

3. **API Host 填错格式** — 常见错误：漏写 `https://`、Gemini URL 末尾少 `/`、把 API Key 填到 API Host 框里。

4. **Chatbox 更新后配置丢失** — 部分版本升级会重置设置，建议截图保存配置信息备用。

5. **使用 OpenRouter 时模型列表很长** — Chatbox 不会过滤免费/付费模型，手动输入模型名是最保险的方式（避免误选付费模型）。

## 验证安装

1. 打开 Chatbox，确保设置里已保存正确配置
2. 在聊天框发送："你好，用一句话介绍量子计算"
3. 预期：5 秒内出现回复

如果没有响应：
- 检查 API Host 是否包含 `https://`
- 检查 API Key 是否完整（没有多余空格）
- 检查网络/VPN 是否正常

## Sources

- Chatbox 官网: https://chatboxai.app (fetched 2026-04-28)
- Chatbox GitHub: https://github.com/Bin-Huang/chatbox (fetched 2026-04-28)
- Chatbox 文档: https://chatboxai.app/docs (fetched 2026-04-28)
