> Mirror of [docs/zh/clients/01-opencode.md](../../zh/clients/01-opencode.md) (Chinese, canonical). If they drift, zh wins.

# opencode — Connect Free API Keys

> Last Verified: 2026-04-28 against opencode v0.1.x (CLI)
> Platform tested: Windows / macOS / Linux

## What is this

opencode is an open-source AI coding assistant CLI tool, running in the terminal with multi-file understanding, code generation, and codebase search. It natively supports any OpenAI-compatible API, connecting to all free providers in this project without plugins.

**For:** CLI-focused developers, users who don't want IDE plugins, server/remote environments.

## Installation

```bash
# npm (recommended)
npm install -g opencode-ai

# or bun
bun install -g opencode-ai
```

> **Config file location:**
> - macOS/Linux: `~/.config/opencode/config.json`
> - Windows: `%APPDATA%\opencode\config.json`

## Quick Start: OpenRouter (Recommended)

1. Initialize (auto-creates config on first run):
   ```bash
   opencode
   ```
2. Exit, edit `~/.config/opencode/config.json`:

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

3. Run `opencode` again, send "hello" to verify.

## Provider Parameters

| Provider | baseURL | Recommended Free Model | Notes |
|---|---|---|---|
| OpenRouter | `https://openrouter.ai/api/v1` | `deepseek/deepseek-chat:free` | Most model choices |
| Gemini | `https://generativelanguage.googleapis.com/v1beta/openai/` | `gemini-2.0-flash` | 1.5K RPD free |
| Groq | `https://api.groq.com/openai/v1` | `llama-3.3-70b-versatile` | Fastest inference |
| Cerebras | `https://api.cerebras.ai/v1` | `llama-3.3-70b` | 1M TPD |
| GitHub Models | `https://models.github.ai/inference` | `openai/gpt-4o-mini` | Requires GitHub account |
| Mistral | `https://api.mistral.ai/v1` | `mistral-small-latest` | 1B tok/month |
| Ollama | `http://localhost:11434/v1` | `qwen2.5-coder:7b` | Fully local |

> ⚠️ Cloudflare Workers AI doesn't support the standard OpenAI-compatible interface; not recommended for opencode.

## Config Examples

### Groq (Speed-first)

```json
{
  "provider": "openai",
  "model": "llama-3.3-70b-versatile",
  "openai": {
    "baseURL": "https://api.groq.com/openai/v1",
    "apiKey": "gsk_YOUR_GROQ_KEY"
  },
  "context": { "maxTokens": 32768 }
}
```

### Gemini (Longest context)

```json
{
  "provider": "openai",
  "model": "gemini-2.5-flash",
  "openai": {
    "baseURL": "https://generativelanguage.googleapis.com/v1beta/openai/",
    "apiKey": "AIza_YOUR_GEMINI_KEY"
  },
  "context": { "maxTokens": 100000 }
}
```

### Ollama (Fully local + private)

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

### Environment Variable Mode (Recommended for teams)

```bash
export OPENROUTER_API_KEY="sk-or-v1-..."
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

## Recommended Combinations

- **Code Q&A (fast):** Groq `llama-3.3-70b-versatile` — 14.4K RPD, very fast
- **Large file analysis:** Gemini `gemini-2.5-flash` — 1M token context
- **Fully offline:** Ollama `qwen2.5-coder:7b` — unlimited local
- **Tool calling (agent):** OpenRouter `deepseek/deepseek-chat:free` — strong function calling

## Common Pitfalls

1. **Network access to OpenRouter/Groq blocked** — Requires proxy. Gemini's `generativelanguage.googleapis.com` is directly accessible in most regions. Ollama works fully offline.

2. **Model name is case-sensitive** — OpenRouter's `deepseek/deepseek-chat:free` must include `:free` in lowercase; omitting it may cause a 404 or switch to a paid route.

3. **Gemini OpenAI-compat endpoint trailing slash required** — `baseURL` must be `https://generativelanguage.googleapis.com/v1beta/openai/` with the trailing `/`; omitting it causes 404.

4. **maxTokens set too high** — Setting it above the model's actual context window returns a 400 error. Check each provider's context window size.

5. **Ollama not running** — Confirm `ollama serve` is running in the background before starting opencode.

## Verification

```bash
opencode
# In the chat window type: Hello, explain what an API is in one sentence
```

Expected: Response within 5 seconds. If:
- Spinning without response → Check `baseURL` and network/proxy
- `401 Unauthorized` → Wrong API key format
- `404 Not Found` → Wrong model name or `baseURL` path
- `429 Too Many Requests` → Rate limited, wait 1 minute

## Advanced: Multi-Provider Auto-Failover

Use LiteLLM Proxy to unify multiple providers:

```bash
litellm --config configs/litellm_config.yaml --port 4000
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

See [Recipe 03: LiteLLM Multi-Provider Routing](../recipes/03-litellm-router.md).

## Sources

- opencode official docs: https://opencode.ai/docs (fetched 2026-04-28)
- opencode GitHub: https://github.com/sst/opencode (fetched 2026-04-28)
