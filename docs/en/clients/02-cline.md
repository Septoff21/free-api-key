> Mirror of [docs/zh/clients/02-cline.md](../../zh/clients/02-cline.md) (Chinese, canonical). If they drift, zh wins.

# Cline — Connect Free API Keys

> Last Verified: 2026-04-28 against Cline v3.x (VS Code Extension)
> Platform tested: Windows / macOS / Linux (via VS Code)

## What is this

Cline (formerly Claude Dev) is one of the most popular AI coding assistant extensions for VS Code, supporting autonomous file read/write, terminal command execution, and browser operations ("agentic coding"). It supports any OpenAI-compatible API, connecting to all free providers in this project.

**For:** VS Code developers, scenarios requiring AI to autonomously complete multi-step tasks (write + test + fix).

## Installation

1. VS Code → Extensions (`Ctrl+Shift+X` / `Cmd+Shift+X`)
2. Search for **"Cline"** → Install saoudrizwan.claude-dev
3. Cline icon appears in the sidebar

## Quick Start: OpenRouter (Recommended)

1. Click the Cline sidebar icon → Top-right **gear ⚙** → Settings
2. **API Provider**: Select `OpenAI Compatible`
3. Fill in:
   - **Base URL**: `https://openrouter.ai/api/v1`
   - **API Key**: Your OpenRouter key
   - **Model ID**: `deepseek/deepseek-chat:free`
4. Click **Save**, send "hello" in the chat to test

## Provider Parameters

| Provider | API Provider Option | Base URL | Recommended Free Model |
|---|---|---|---|
| OpenRouter | `OpenAI Compatible` | `https://openrouter.ai/api/v1` | `deepseek/deepseek-chat:free` |
| Gemini | `Google Gemini` *(built-in)* | *(auto)* | `gemini-2.0-flash-exp` |
| Groq | `OpenAI Compatible` | `https://api.groq.com/openai/v1` | `llama-3.3-70b-versatile` |
| Cerebras | `OpenAI Compatible` | `https://api.cerebras.ai/v1` | `llama-3.3-70b` |
| GitHub Models | `OpenAI Compatible` | `https://models.github.ai/inference` | `openai/gpt-4o-mini` |
| Mistral | `OpenAI Compatible` | `https://api.mistral.ai/v1` | `mistral-small-latest` |
| Ollama | `Ollama` *(built-in)* | `http://localhost:11434` | `qwen2.5-coder:7b` |

## Gemini (Detailed Steps)

Cline has first-class Gemini support:

1. Settings → **API Provider**: Select `Google Gemini`
2. **API Key**: Paste your Gemini key (`AIza...`)
3. **Model**: Select `gemini-2.0-flash-exp` (1.5K RPD free)
4. Save

⚠️ **Note**: Gemini free tier uses conversations for model training. Don't submit PII or sensitive codebase data. See the [Privacy Matrix](../06-privacy-matrix.md).

## Ollama (Fully Local)

1. Ensure Ollama is running:
   ```bash
   ollama pull qwen2.5-coder:7b
   ollama serve
   ```
2. Settings → **API Provider**: Select `Ollama`
3. **Base URL**: `http://localhost:11434` (default, no change needed)
4. **Model**: Select `qwen2.5-coder:7b` from the dropdown

## Config File Location

Cline config is stored in VS Code's settings.json (with `cline.` prefix):

> - macOS: `~/Library/Application Support/Code/User/settings.json`
> - Windows: `%APPDATA%\Code\User\settings.json`
> - Linux: `~/.config/Code/User/settings.json`

Manual edit example (OpenRouter):

```json
{
  "cline.apiProvider": "openai",
  "cline.openAiBaseUrl": "https://openrouter.ai/api/v1",
  "cline.openAiApiKey": "sk-or-v1-YOUR_KEY",
  "cline.openAiModelId": "deepseek/deepseek-chat:free"
}
```

## Cline-Specific Feature Config

### Custom system prompt

```json
{
  "cline.customInstructions": "Always respond in English. Code comments in English too."
}
```

### Auto-approve low-risk operations

```json
{
  "cline.alwaysAllowReadOnly": true,
  "cline.alwaysAllowWrite": false
}
```

### Limit API consumption

```json
{
  "cline.maxTokens": 4096
}
```

## Recommended Combinations

- **Daily code Q&A (fast):** Groq `llama-3.3-70b-versatile` — 14.4K RPD, extremely fast
- **Large codebase analysis:** Gemini `gemini-2.5-flash` — 1M token context
- **Autonomous agent tasks:** OpenRouter `deepseek/deepseek-chat:free` — strong tool calling
- **Fully local + private:** Ollama `qwen2.5-coder:7b` — no network requests

## Common Pitfalls

1. **"Model not supported" or empty model list** — When selecting `OpenAI Compatible`, the Model ID must be **typed manually** (Cline doesn't auto-fetch remote model lists). Spell the model name exactly including `:free` suffix.

2. **Timeout accessing OpenRouter/Groq** — Set proxy in VS Code settings (`http.proxy`), or switch to Gemini (directly accessible in most regions) or Ollama (local).

3. **Gemini returns empty response** — Gemini occasionally returns empty `choices` in openai-compat mode. Use Cline's built-in `Google Gemini` option (not OpenAI Compatible) to avoid this.

4. **Agentic tasks consume tokens extremely fast** — One autonomous task round may use thousands of tokens. Use Groq/Cerebras (high RPD) or Ollama (local), avoid draining Gemini's 1.5K RPD in a few operations.

5. **API Key stored in VS Code keychain** — The actual key is in the system keychain (macOS Keychain / Windows Credential Manager). What you see in settings.json is a placeholder, not plaintext — no need to worry about settings.json leaking the key.

## Verification

Send in Cline chat:

```
Create a new file called hello.py with content: print("hello from Cline")
```

Cline should:
1. Show a file creation preview
2. Request confirmation (or auto-create if `alwaysAllowWrite=true`)
3. File appears in the workspace

## Advanced: LiteLLM Proxy Unified Gateway

```json
{
  "cline.apiProvider": "openai",
  "cline.openAiBaseUrl": "http://localhost:4000",
  "cline.openAiApiKey": "sk-anything",
  "cline.openAiModelId": "fast-chat"
}
```

See [Recipe 03: LiteLLM Multi-Provider Routing](../recipes/03-litellm-router.md).

## Sources

- Cline VS Code Marketplace: https://marketplace.visualstudio.com/items?itemName=saoudrizwan.claude-dev (fetched 2026-04-28)
- Cline official docs: https://docs.cline.bot (fetched 2026-04-28)
- Cline GitHub: https://github.com/cline/cline (fetched 2026-04-28)
