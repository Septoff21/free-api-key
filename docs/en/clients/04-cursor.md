> Mirror of [docs/zh/clients/04-cursor.md](../../zh/clients/04-cursor.md) (Chinese, canonical). If they drift, zh wins.

# Cursor — Connect Free API Keys (BYOK)

> Last Verified: 2026-04-28 against Cursor v0.44.x
> Platform tested: Windows / macOS / Linux

## What is this

Cursor is the most popular AI-native code editor, a VS Code fork with built-in AI chat (Cmd+L), code editing (Cmd+K), Composer (multi-file generation), and Tab smart completion. **Cursor's free plan provides limited premium model requests per month (500).** Once exceeded, configure "Bring Your Own Key" (BYOK) to use external APIs. This guide focuses on BYOK configuration.

**For:** Users with Cursor whose monthly quota is insufficient, developers wanting unlimited Cursor usage with free APIs.

## Installation

- Download: https://cursor.sh
- Supports Windows, macOS, Linux (.AppImage / .deb / .rpm)

## Cursor BYOK Mode

Cursor → **Settings** (`Ctrl+Shift+J` / `Cmd+Shift+J`) → **Models** tab:

1. Find the **"OpenAI API Key"** section
2. Enable **"Enable Custom API Keys"** (toggle)
3. Fill in your key

> ⚠️ Cursor BYOK: **Tab autocomplete still consumes Cursor's own quota** (Tab completion doesn't use BYOK). BYOK only affects **Chat** (Cmd+L) and **Cmd+K** edits. Tab completion requires Cursor Pro or use the Continue extension.

## Connect OpenRouter (Recommended)

Cursor natively supports OpenAI-compatible interfaces:

1. Settings → Models → Enable **"OpenAI API Key"**
2. **OpenAI API Key**: Enter `sk-or-v1-YOUR_OPENROUTER_KEY`
3. **Override OpenAI Base URL**: `https://openrouter.ai/api/v1`
4. Add custom model: `deepseek/deepseek-chat:free`
5. Select this model in Chat (Cmd+L)

## Provider Parameters

| Provider | API Key Field | Override Base URL | Recommended Free Model |
|---|---|---|---|
| OpenRouter | OpenAI API Key | `https://openrouter.ai/api/v1` | `deepseek/deepseek-chat:free` |
| Groq | OpenAI API Key | `https://api.groq.com/openai/v1` | `llama-3.3-70b-versatile` |
| Cerebras | OpenAI API Key | `https://api.cerebras.ai/v1` | `llama-3.3-70b` |
| Gemini | OpenAI API Key | `https://generativelanguage.googleapis.com/v1beta/openai/` | `gemini-2.0-flash` |
| GitHub Models | OpenAI API Key | `https://models.github.ai/inference` | `openai/gpt-4o-mini` |
| Mistral | OpenAI API Key | `https://api.mistral.ai/v1` | `mistral-small-latest` |
| Ollama | OpenAI API Key | `http://localhost:11434/v1` | `qwen2.5-coder:7b` |

## Adding Custom Models

Cursor doesn't auto-fetch external model lists — add models manually:

1. Settings → Models → Scroll to bottom **"+ Add Model"**
2. Enter the full model name, e.g.: `deepseek/deepseek-chat:free`
3. Click **Add**

Ready-to-paste free model names:
```
deepseek/deepseek-chat:free          # OpenRouter, general purpose
meta-llama/llama-3.3-70b-instruct:free  # OpenRouter, open source
llama-3.3-70b-versatile             # Groq
llama-3.3-70b                       # Cerebras
gemini-2.0-flash                    # Gemini
gemini-2.5-flash                    # Gemini (stronger reasoning)
mistral-small-latest                # Mistral
qwen2.5-coder:7b                    # Ollama (local)
```

## LiteLLM Proxy for Multi-Provider Failover

Cursor only allows one Base URL, but LiteLLM Proxy can unify multiple providers:

```bash
litellm --config configs/litellm_config.yaml --port 4000
```

Cursor config:
- **Override Base URL**: `http://localhost:4000`
- **OpenAI API Key**: `sk-anything` (proxy doesn't validate)
- **Model**: `fast-chat` (LiteLLM alias)

See [Recipe 03: LiteLLM Multi-Provider Routing](../recipes/03-litellm-router.md).

## Tab Autocomplete Solution (Not Covered by BYOK)

Since Cursor BYOK doesn't cover Tab completion, install the **Continue extension** inside Cursor for custom Tab autocomplete:

1. Inside Cursor → Extensions → Search Continue → Install
2. Configure `~/.continue/config.json`'s `tabAutocompleteModel` (see [Continue docs](03-continue.md))

## Recommended Combinations

- **Chat + Code Edit (BYOK):** Groq `llama-3.3-70b-versatile` (very fast, 14.4K RPD)
- **Large file analysis (BYOK):** Gemini `gemini-2.5-flash` (1M context)
- **Privacy-sensitive code:** Ollama `qwen2.5-coder:7b` (local, zero cloud requests)
- **Tab completion (Continue):** Codestral FIM or Ollama qwen2.5-coder

## Common Pitfalls

1. **Tab autocomplete not working / still prompting Pro upgrade** — Known Cursor BYOK limitation: Tab completion doesn't use custom APIs. Requires Pro subscription or Continue extension.

2. **Model name unrecognized** — Manually added models return 404 if the provider doesn't recognize the name. Ensure the model name exactly matches the provider's documentation (case, slashes, `:free` suffix).

3. **Override Base URL gets reset** — Some Cursor versions clear custom Base URL after restart. Upgrade to the latest version (this bug is fixed in newer versions).

4. **Composer tasks consume tokens extremely fast** — Use high-quota providers (Groq/Cerebras 14.4K RPD), avoid draining Gemini's low RPD in a few Composer operations.

## Verification

1. Open Cursor, press `Cmd+L` (macOS) or `Ctrl+L` (Windows) to open Chat
2. In the Model selector, choose your newly added model
3. Send: `Hello, explain what an API is in one sentence`
4. Expected: Response within 5 seconds

Error diagnosis:
- `401` → Wrong API key format
- `404` → Model name doesn't exist or wrong Base URL path
- `Connection refused` → Ollama not started (if using local model)

## Sources

- Cursor official docs: https://docs.cursor.com (fetched 2026-04-28)
- Cursor model configuration: https://docs.cursor.com/settings/models (fetched 2026-04-28)
