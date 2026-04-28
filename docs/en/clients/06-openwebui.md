> Mirror of [docs/zh/clients/06-openwebui.md](../../zh/clients/06-openwebui.md) (Chinese, canonical). If they drift, zh wins.

# Open WebUI — Connect Free API Keys

> Last Verified: 2026-04-28 against Open WebUI v0.5.x
> Platform tested: Docker (Windows / macOS / Linux)

## What is this

Open WebUI (formerly Ollama WebUI) is the most popular self-hosted AI chat interface, designed for Ollama but also supporting any OpenAI-compatible API. Beautiful UI with multi-model conversations, document upload (RAG), image generation, voice chat, user management, and a plugin marketplace.

**For:** Users wanting the best ChatGPT alternative experience, hybrid scenarios combining Ollama with cloud APIs, families/small teams running an AI server.

## Installation (Docker)

### Option 1: Open WebUI only (connect to existing Ollama)

```bash
docker run -d \
  -p 3000:8080 \
  --add-host=host.docker.internal:host-gateway \
  -v open-webui:/app/backend/data \
  --name open-webui \
  --restart always \
  ghcr.io/open-webui/open-webui:main
```

Access: http://localhost:3000

### Option 2: Open WebUI + Ollama bundled (recommended for beginners)

```bash
# With NVIDIA GPU
docker run -d \
  -p 3000:8080 \
  --gpus all \
  -v ollama:/root/.ollama \
  -v open-webui:/app/backend/data \
  --name open-webui \
  --restart always \
  ghcr.io/open-webui/open-webui:ollama

# CPU only
docker run -d \
  -p 3000:8080 \
  -v ollama:/root/.ollama \
  -v open-webui:/app/backend/data \
  --name open-webui \
  --restart always \
  ghcr.io/open-webui/open-webui:ollama
```

## Connect External APIs (Admin Settings)

1. Log in with admin account (first registered user is auto-admin)
2. Click avatar (top-right) → **Admin Panel**
3. Left sidebar → **Settings** → **Connections**

### Add OpenRouter

In the **OpenAI API** section:
- **API Base URL**: `https://openrouter.ai/api/v1`
- **API Key**: `sk-or-v1-YOUR_KEY`
- Click ✓ to verify connection
- Save

After successful verification, all OpenRouter models appear in the chat Model selector. Select `deepseek/deepseek-chat:free` to start.

## Provider Parameters

| Provider | API Base URL | API Key Example | Notes |
|---|---|---|---|
| OpenRouter | `https://openrouter.ai/api/v1` | `sk-or-v1-...` | Most models |
| Groq | `https://api.groq.com/openai/v1` | `gsk_...` | Fastest |
| Cerebras | `https://api.cerebras.ai/v1` | `csk-...` | 1M TPD |
| Gemini | `https://generativelanguage.googleapis.com/v1beta/openai/` | `AIza...` | Note trailing `/` |
| GitHub Models | `https://models.github.ai/inference` | `ghp_...` | 50 RPD (high tier) |
| Mistral | `https://api.mistral.ai/v1` | `...` | 1B tok/month |
| Ollama (external) | `http://host.docker.internal:11434` | *(empty)* | If Ollama is on host |

> **Multiple APIs simultaneously**: Admin Panel → Connections supports multiple OpenAI-compat APIs, each independently toggleable. Switch between any provider's models in the chat model selector.

## Ollama Local Model Management

Open WebUI has a built-in Ollama model manager. Common pulls:

```bash
# Chat models
ollama pull qwen2.5:7b         # Strong Chinese, general purpose
ollama pull llama3.3:70b       # Strong English, high quality (needs ~40GB RAM)
ollama pull hermes3            # Tool calling (agent scenarios)

# Vision
ollama pull llava:7b

# Code completion
ollama pull qwen2.5-coder:7b

# Embeddings (for RAG)
ollama pull nomic-embed-text
```

## RAG Document Upload Config

Open WebUI has built-in RAG — upload PDF/docx/txt and ask questions:

Admin Panel → Settings → **Documents**:

```
Embedding Model Engine: Ollama
Embedding Model: nomic-embed-text:latest
```

```bash
ollama pull nomic-embed-text
```

Upload documents: click 📎 in the chat box → select file → upload, then reference in conversation.

## Recommended Combinations

- **Daily chat:** OpenRouter `deepseek/deepseek-chat:free` + Groq `llama-3.3-70b-versatile` (fast response)
- **Document analysis (RAG):** Gemini `gemini-2.5-flash` (1M context) + nomic-embed-text (local embeddings)
- **Image understanding:** Ollama `llava:7b` or Gemini `gemini-2.0-flash` (cloud)
- **Fully local:** Ollama `qwen2.5:7b` + nomic-embed-text

## Common Pitfalls

1. **`host.docker.internal` unavailable on Linux** — The `--add-host=host.docker.internal:host-gateway` flag is already included in the command above. Or use the host's actual IP address.

2. **Gemini model list pulls too many duplicate/experimental models** — Manually hide unwanted models in Admin Panel → Models.

3. **Docker image pull slow** — Use a Docker Hub mirror or configure proxy environment variables:
   ```bash
   docker run -e HTTP_PROXY=http://your-proxy:port ...
   ```

4. **First-time login fails** — Open WebUI requires email registration by default. For local deployments without a real mail server, disable email verification in Admin Panel → Settings → General, or set `WEBUI_AUTH=False` to disable login entirely.

5. **Model loading OOM** — Running 70B models requires ~40GB RAM (quantized ~20GB), 7B needs ~8GB. Check `ollama ps` and system memory if Ollama returns empty responses silently.

## Verification

1. Open http://localhost:3000, register and log in
2. Select your configured model (e.g., `deepseek/deepseek-chat:free`) in the Model selector
3. Send: "hello, tell me about yourself"
4. Upload a PDF: "Summarize the main points of this document"

## Sources

- Open WebUI official docs: https://docs.openwebui.com (fetched 2026-04-28)
- Open WebUI GitHub: https://github.com/open-webui/open-webui (fetched 2026-04-28)
- Open WebUI quick start: https://docs.openwebui.com/getting-started/quick-start (fetched 2026-04-28)
