# LibreChat 接入免费 API Key

> Last Verified: 2026-04-28 against LibreChat v0.7.x
> Platform tested: Docker (Windows / macOS / Linux)

[English](../../en/clients/05-librechat.md)

## 这是什么

LibreChat 是一个自部署的开源聊天界面，外观和功能接近 ChatGPT，支持多用户、多 API 提供商、插件系统和图片生成。Docker 一键部署，完全自托管，数据不出本机。

**适合：** 想要 ChatGPT 体验但不想付费的用户、需要给团队/家庭成员提供共享 AI 服务的场景、对隐私有高要求（完全自托管）的用户。

## 安装（Docker 推荐）

```bash
# 克隆项目
git clone https://github.com/danny-avila/LibreChat.git
cd LibreChat

# 创建环境变量文件（从模板）
cp .env.example .env

# 编辑 .env 填入 API Keys（见下文）
# 启动
docker compose up -d
```

访问：http://localhost:3080

> **配置文件位置：**
> - 主配置：`LibreChat/.env`
> - 模型配置：`LibreChat/librechat.yaml`（可选，用于高级配置）
> - Docker Compose：`LibreChat/docker-compose.yml`

## 快速接入：OpenRouter

编辑 `.env` 文件：

```env
# 取消注释并填写
OPENROUTER_KEY=sk-or-v1-YOUR_OPENROUTER_KEY
```

重启 Docker：

```bash
docker compose restart
```

在 LibreChat 界面：Endpoint 选择器 → 选 **"OpenRouter"** → 选模型 `deepseek/deepseek-chat:free`。

## 各家 `.env` 配置

```env
# ── OpenRouter ────────────────────────────────────────────
OPENROUTER_KEY=sk-or-v1-YOUR_KEY

# ── Gemini ────────────────────────────────────────────────
GOOGLE_KEY=AIza_YOUR_GEMINI_KEY

# ── Groq ──────────────────────────────────────────────────
GROQ_API_KEY=gsk_YOUR_GROQ_KEY

# ── Mistral ───────────────────────────────────────────────
MISTRAL_API_KEY=YOUR_MISTRAL_KEY

# ── GitHub Models ─────────────────────────────────────────
# 通过 librechat.yaml 的 Custom endpoint 配置
```

## 高级配置：librechat.yaml（自定义 Endpoint）

对于 LibreChat 没有内置支持的提供商（Cerebras、GitHub Models、Cloudflare），通过 `librechat.yaml` 配置自定义 OpenAI-compat 端点：

```yaml
# librechat.yaml
version: 1.1.5

endpoints:
  custom:
    # ── Cerebras ──────────────────────────────────────────
    - name: "Cerebras"
      apiKey: "${CEREBRAS_API_KEY}"
      baseURL: "https://api.cerebras.ai/v1"
      models:
        default: ["llama3.1-8b", "llama-3.3-70b"]
        fetch: false
      titleConvo: true
      titleModel: "llama3.1-8b"
      summarize: false
      iconURL: "https://cerebras.ai/favicon.ico"

    # ── GitHub Models ──────────────────────────────────────
    - name: "GitHub Models"
      apiKey: "${GITHUB_TOKEN}"
      baseURL: "https://models.github.ai/inference"
      models:
        default: ["openai/gpt-4o", "openai/gpt-4o-mini", "meta/llama-3.3-70b-instruct"]
        fetch: false
      titleConvo: true
      titleModel: "openai/gpt-4o-mini"

    # ── Ollama（本地）──────────────────────────────────────
    - name: "Ollama"
      apiKey: "ollama"
      baseURL: "http://host.docker.internal:11434/v1"
      models:
        default: ["qwen2.5-coder:7b", "llama3.3", "llava"]
        fetch: true
      titleConvo: false
```

> **Docker 内访问宿主机 Ollama**：URL 用 `http://host.docker.internal:11434`（Windows/macOS Docker Desktop 支持），Linux 用容器网关 IP（通常 `172.17.0.1`）。

对应 `.env` 添加：

```env
CEREBRAS_API_KEY=YOUR_CEREBRAS_KEY
GITHUB_TOKEN=ghp_YOUR_GITHUB_TOKEN
```

重启后刷新页面，Endpoint 列表会出现新选项。

## 完整 .env 示例（多提供商）

```env
# LibreChat 基础配置
HOST=0.0.0.0
PORT=3080
DOMAIN_CLIENT=http://localhost:3080
DOMAIN_SERVER=http://localhost:3080

# JWT 密钥（改成随机字符串）
JWT_SECRET=change_this_random_string_32_chars
JWT_REFRESH_SECRET=change_this_another_random_string

# MongoDB（Docker 内置）
MONGO_URI=mongodb://127.0.0.1:27017/LibreChat

# ── API Keys ──────────────────────────────────────────────
OPENROUTER_KEY=sk-or-v1-YOUR_KEY
GOOGLE_KEY=AIza_YOUR_GEMINI_KEY
GROQ_API_KEY=gsk_YOUR_KEY
MISTRAL_API_KEY=YOUR_KEY
CEREBRAS_API_KEY=YOUR_KEY
GITHUB_TOKEN=ghp_YOUR_TOKEN

# 禁用 OpenAI（不需要官方 ChatGPT key）
OPENAI_API_KEY=user_provided
```

## 推荐组合

- **日常聊天：** OpenRouter `deepseek/deepseek-chat:free`
- **长文档分析：** Gemini `gemini-2.0-flash`（1.5K RPD）
- **代码问题：** Groq `llama-3.3-70b-versatile`（极快）
- **完全本地（隐私）：** Ollama `qwen2.5-coder:7b` 或 `llava`（视觉）

## 图片生成配置（Cloudflare FLUX）

LibreChat 支持 DALL-E 兼容图片生成，但 Cloudflare 的接口不完全兼容。可通过自定义脚本桥接：

> 见 [Recipe 04：图片生成](../recipes/04-image-generation.md) 中的 `generate()` 函数，单独运行即可。

## 常见坑

1. **Docker 内无法访问宿主机 Ollama** — Windows/macOS Docker Desktop 可用 `host.docker.internal`；Linux 需要：
   ```yaml
   extra_hosts:
     - "host.docker.internal:host-gateway"
   ```
   在 `docker-compose.yml` 的 `api` service 下添加。

2. **librechat.yaml 缩进错误导致端点不出现** — YAML 缩进必须严格（2空格），错一格会静默失败。检查方法：`docker compose logs api | grep -i yaml`。

3. **中国大陆访问 LibreChat GitHub 下载慢** — 可从镜像站下载，或用 `git clone --depth=1` 减少下载量。API 请求同样需要代理（配置 Docker HTTP_PROXY 环境变量）。

4. **模型列表 `fetch: true` 超时** — 某些提供商的模型列表接口很慢，设 `fetch: false` 并手动在 `default` 里列出模型名即可。

5. **多用户共享注册控制** — 默认任何人都能注册。生产环境请在 `.env` 里设置：
   ```env
   ALLOW_REGISTRATION=false
   ```
   然后手动用 CLI 创建用户，防止滥用你的 API key。

## 验证安装

1. 打开 http://localhost:3080，注册账号
2. 在 Endpoint 下拉选 "OpenRouter"
3. 发送："hello，用一句话介绍你自己"
4. 应该 5 秒内返回 DeepSeek 的回答

## Sources

- LibreChat 官方文档: https://docs.librechat.ai (fetched 2026-04-28)
- LibreChat 环境变量参考: https://docs.librechat.ai/install/configuration/dotenv.html (fetched 2026-04-28)
- LibreChat Custom Endpoints: https://docs.librechat.ai/install/configuration/custom_config.html (fetched 2026-04-28)
- LibreChat GitHub: https://github.com/danny-avila/LibreChat (fetched 2026-04-28)
