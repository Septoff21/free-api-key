# Open WebUI 接入免费 API Key

> Last Verified: 2026-04-28 against Open WebUI v0.5.x
> Platform tested: Docker (Windows / macOS / Linux)

[English](../../en/clients/06-openwebui.md)

## 这是什么

Open WebUI（原 Ollama WebUI）是目前最流行的自托管 AI 聊天界面，专为 Ollama 设计但同样支持任意 OpenAI 兼容 API。界面精美，支持多模型对话、文档上传（RAG）、图片生成、语音对话、用户管理、插件市场。

**适合：** 想要最佳 ChatGPT 替代体验的用户、以 Ollama 为主但同时使用云端 API 的混合场景、需要家庭/小团队 AI 服务器的用户。

## 安装（Docker）

### 方式一：仅 Open WebUI（连接已有 Ollama）

```bash
docker run -d \
  -p 3000:8080 \
  --add-host=host.docker.internal:host-gateway \
  -v open-webui:/app/backend/data \
  --name open-webui \
  --restart always \
  ghcr.io/open-webui/open-webui:main
```

访问：http://localhost:3000

### 方式二：Open WebUI + Ollama 一体（推荐新手）

```bash
# 需要 NVIDIA GPU（有 GPU 时用此版本）
docker run -d \
  -p 3000:8080 \
  --gpus all \
  -v ollama:/root/.ollama \
  -v open-webui:/app/backend/data \
  --name open-webui \
  --restart always \
  ghcr.io/open-webui/open-webui:ollama

# 无 GPU（CPU 推理）
docker run -d \
  -p 3000:8080 \
  -v ollama:/root/.ollama \
  -v open-webui:/app/backend/data \
  --name open-webui \
  --restart always \
  ghcr.io/open-webui/open-webui:ollama
```

> **配置存储位置（Docker Volume）：**
> `open-webui` named volume → Docker Desktop 或 `/var/lib/docker/volumes/open-webui/`

## 接入外部 API（Admin Settings）

1. 用管理员账号登录（首次注册的用户自动为管理员）
2. 点击右上角头像 → **Admin Panel**
3. 左侧 → **Settings** → **Connections**

### 添加 OpenRouter

在 **OpenAI API** 区域：
- **API Base URL**: `https://openrouter.ai/api/v1`
- **API Key**: `sk-or-v1-YOUR_KEY`
- 点击 ✓ 验证连接
- 保存

[截图占位 - Open WebUI Admin Panel → Connections → OpenAI API 配置区域]

验证成功后，在聊天界面 Model 选择器里会出现 OpenRouter 的所有模型，选择 `deepseek/deepseek-chat:free` 开始使用。

## 各家接入参数

| Provider | API Base URL | API Key 示例 | 备注 |
|---|---|---|---|
| OpenRouter | `https://openrouter.ai/api/v1` | `sk-or-v1-...` | 模型最多 |
| Groq | `https://api.groq.com/openai/v1` | `gsk_...` | 最快 |
| Cerebras | `https://api.cerebras.ai/v1` | `csk-...` | 1M TPD |
| Gemini | `https://generativelanguage.googleapis.com/v1beta/openai/` | `AIza...` | 注意末尾 `/` |
| GitHub Models | `https://models.github.ai/inference` | `ghp_...` | 50 RPD 高层 |
| Mistral | `https://api.mistral.ai/v1` | `...` | 1B tok/月 |
| Ollama（外部）| `http://host.docker.internal:11434` | *(空)* | 若 Ollama 在宿主机 |

> **多 API 并存**：Open WebUI 的 Admin Panel → Connections 支持填写多个 OpenAI-compat API，每个可以独立启用/禁用，聊天时可在模型选择器中切换任意一家的模型。

## Ollama 本地模型管理

Open WebUI 内置 Ollama 模型管理器：

1. Admin Panel → **Settings** → **Models**（若与 Ollama 一体安装）
2. 或直接在 **Models** 页面搜索并下载模型

常用命令（在宿主机终端）：

```bash
# 对话模型
ollama pull qwen2.5:7b        # 中文强，通用
ollama pull llama3.3:70b      # 英文强，质量高（需 40GB RAM）
ollama pull hermes3            # 工具调用（agent 场景）

# 视觉模型
ollama pull llava:7b

# 代码补全
ollama pull qwen2.5-coder:7b

# 嵌入（RAG 用）
ollama pull nomic-embed-text
```

## RAG 文档上传配置

Open WebUI 内置 RAG（检索增强生成），上传 PDF/docx/txt 后可对文档提问：

Admin Panel → Settings → **Documents**：

```
Embedding Model Engine: Ollama
Embedding Model: nomic-embed-text:latest
```

```bash
ollama pull nomic-embed-text
```

上传文档：在对话框点击 📎 → 选择文件 → 上传后即可在对话中引用。

## 推荐组合

- **日常聊天：** OpenRouter `deepseek/deepseek-chat:free` + Groq `llama-3.3-70b-versatile`（快速响应）
- **文档分析（RAG）：** Gemini `gemini-2.5-flash`（1M context）+ nomic-embed-text（本地嵌入）
- **图片理解：** Ollama `llava:7b` 或 Gemini `gemini-2.0-flash`（云端）
- **完全本地：** Ollama `qwen2.5:7b` + nomic-embed-text

## 常见坑

1. **Linux 下 `host.docker.internal` 不可用** — 需在 `docker run` 加 `--add-host=host.docker.internal:host-gateway`（命令已在上方包含），或用宿主机实际 IP。

2. **Gemini 模型列表拉取后出现大量重复模型名** — Gemini OpenAI 兼容端点会列出所有 gemini 模型，包括很多实验/预览版本。建议在 Admin Panel → Models 里手动隐藏不需要的。

3. **中国大陆 Docker 镜像拉取慢** — 使用国内 Docker Hub 镜像加速（`registry.cn-hangzhou.aliyuncs.com`）或配置代理。Open WebUI 的 API 请求同样需要代理环境变量：
   ```bash
   docker run -e HTTP_PROXY=http://your-proxy:port ...
   ```

4. **首次注册后无法登录** — Open WebUI 默认要求邮箱注册，本地部署无真实邮件服务时，可在 Admin Panel → Settings → General → 关闭邮箱验证，或通过环境变量 `WEBUI_AUTH=False` 完全禁用登录。

5. **模型加载 OOM（内存不足）** — 运行 70B 模型需要约 40GB RAM（量化版约 20GB），7B 模型需要约 8GB。内存不足时 Ollama 会静默返回空响应，检查 `ollama ps` 和系统内存。

## 验证安装

1. 打开 http://localhost:3000，注册并登录
2. 在 Model 选择器里找到你配置的模型（如 `deepseek/deepseek-chat:free`）
3. 发送："hello，介绍一下你自己"
4. 上传一个 PDF，发送："总结这份文档的主要内容"

## Sources

- Open WebUI 官方文档: https://docs.openwebui.com (fetched 2026-04-28)
- Open WebUI GitHub: https://github.com/open-webui/open-webui (fetched 2026-04-28)
- Open WebUI 安装指南: https://docs.openwebui.com/getting-started/quick-start (fetched 2026-04-28)
