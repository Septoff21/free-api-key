> Mirror of [docs/zh/clients/05-librechat.md](../../zh/clients/05-librechat.md) (Chinese, canonical). If they drift, zh wins.

# LibreChat — Connect Free API Keys

> Last Verified: 2026-04-28 against LibreChat v0.7.x
> Platform tested: Docker (Windows / macOS / Linux)

## What is this

LibreChat is a self-hosted open-source chat interface that looks and feels like ChatGPT, supporting multiple users, multiple API providers, a plugin system, and image generation. One-command Docker deployment, fully self-hosted — data never leaves your machine.

**For:** Users wanting a ChatGPT experience without paying, teams/families sharing AI services, users with high privacy requirements (fully self-hosted).

## Installation (Docker Recommended)

```bash
git clone https://github.com/danny-avila/LibreChat.git
cd LibreChat
cp .env.example .env
# Edit .env with API keys (see below)
docker compose up -d
```

Access: http://localhost:3080

> **Config file locations:**
> - Main config: `LibreChat/.env`
> - Model config: `LibreChat/librechat.yaml` (optional, for advanced config)
> - Docker Compose: `LibreChat/docker-compose.yml`

## Quick Start: OpenRouter

Edit `.env`:

```env
OPENROUTER_KEY=sk-or-v1-YOUR_OPENROUTER_KEY
```

Restart Docker:

```bash
docker compose restart
```

In LibreChat UI: Endpoint selector → **"OpenRouter"** → Model: `deepseek/deepseek-chat:free`.

## .env Config for All Providers

```env
# OpenRouter
OPENROUTER_KEY=sk-or-v1-YOUR_KEY

# Gemini
GOOGLE_KEY=AIza_YOUR_GEMINI_KEY

# Groq
GROQ_API_KEY=gsk_YOUR_GROQ_KEY

# Mistral
MISTRAL_API_KEY=YOUR_MISTRAL_KEY
```

## Advanced: librechat.yaml (Custom Endpoints)

For providers without built-in LibreChat support (Cerebras, GitHub Models):

```yaml
# librechat.yaml
version: 1.1.5

endpoints:
  custom:
    - name: "Cerebras"
      apiKey: "${CEREBRAS_API_KEY}"
      baseURL: "https://api.cerebras.ai/v1"
      models:
        default: ["llama3.1-8b", "llama-3.3-70b"]
        fetch: false
      titleConvo: true
      titleModel: "llama3.1-8b"

    - name: "GitHub Models"
      apiKey: "${GITHUB_TOKEN}"
      baseURL: "https://models.github.ai/inference"
      models:
        default: ["openai/gpt-4o", "openai/gpt-4o-mini", "meta/llama-3.3-70b-instruct"]
        fetch: false
      titleConvo: true
      titleModel: "openai/gpt-4o-mini"

    - name: "Ollama"
      apiKey: "ollama"
      baseURL: "http://host.docker.internal:11434/v1"
      models:
        default: ["qwen2.5-coder:7b", "llama3.3", "llava"]
        fetch: true
      titleConvo: false
```

> **Accessing host Ollama from Docker**: Windows/macOS Docker Desktop supports `host.docker.internal`. On Linux, add to `docker-compose.yml` under the `api` service:
> ```yaml
> extra_hosts:
>   - "host.docker.internal:host-gateway"
> ```

Add to `.env`:

```env
CEREBRAS_API_KEY=YOUR_CEREBRAS_KEY
GITHUB_TOKEN=ghp_YOUR_GITHUB_TOKEN
```

After restart, new options appear in the Endpoint list.

## Full .env Example (Multi-Provider)

```env
HOST=0.0.0.0
PORT=3080
DOMAIN_CLIENT=http://localhost:3080
DOMAIN_SERVER=http://localhost:3080

# JWT secrets (change to random strings)
JWT_SECRET=change_this_random_string_32_chars
JWT_REFRESH_SECRET=change_this_another_random_string

MONGO_URI=mongodb://127.0.0.1:27017/LibreChat

# API Keys
OPENROUTER_KEY=sk-or-v1-YOUR_KEY
GOOGLE_KEY=AIza_YOUR_GEMINI_KEY
GROQ_API_KEY=gsk_YOUR_KEY
MISTRAL_API_KEY=YOUR_KEY
CEREBRAS_API_KEY=YOUR_KEY
GITHUB_TOKEN=ghp_YOUR_TOKEN

# Disable OpenAI (no official ChatGPT key needed)
OPENAI_API_KEY=user_provided
```

## Recommended Combinations

- **Daily chat:** OpenRouter `deepseek/deepseek-chat:free`
- **Long document analysis:** Gemini `gemini-2.0-flash` (1.5K RPD)
- **Code questions:** Groq `llama-3.3-70b-versatile` (very fast)
- **Fully local (privacy):** Ollama `qwen2.5-coder:7b` or `llava` (vision)

## Common Pitfalls

1. **Docker can't access host Ollama on Linux** — Add to `docker-compose.yml`:
   ```yaml
   extra_hosts:
     - "host.docker.internal:host-gateway"
   ```

2. **librechat.yaml indentation errors cause endpoints not appearing** — YAML requires strict indentation (2 spaces). Check: `docker compose logs api | grep -i yaml`.

3. **Model list `fetch: true` timeout** — Some providers' model list APIs are slow. Set `fetch: false` and manually list models in `default`.

4. **Multi-user registration control** — Anyone can register by default. For production, set in `.env`:
   ```env
   ALLOW_REGISTRATION=false
   ```
   Then manually create users via CLI to prevent abuse of your API keys.

## Verification

1. Open http://localhost:3080, register and log in
2. Select "OpenRouter" from the Endpoint dropdown
3. Send: "hello, introduce yourself in one sentence"
4. Should receive DeepSeek's response within 5 seconds

## Sources

- LibreChat official docs: https://docs.librechat.ai (fetched 2026-04-28)
- LibreChat .env reference: https://docs.librechat.ai/install/configuration/dotenv.html (fetched 2026-04-28)
- LibreChat Custom Endpoints: https://docs.librechat.ai/install/configuration/custom_config.html (fetched 2026-04-28)
- LibreChat GitHub: https://github.com/danny-avila/LibreChat (fetched 2026-04-28)
