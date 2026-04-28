> Mirror of [docs/zh/clients/03-continue.md](../../zh/clients/03-continue.md) (Chinese, canonical). If they drift, zh wins.

# Continue — Connect Free API Keys

> Last Verified: 2026-04-28 against Continue v0.9.x (VS Code / JetBrains Extension)
> Platform tested: Windows / macOS / Linux

## What is this

Continue is an open-source AI coding assistant supporting VS Code and all JetBrains IDEs. Core features: **Tab autocomplete** (FIM), chat Q&A, code editing (`Cmd+I`/`Ctrl+I`), and codebase indexing (`@codebase`). Continue's configuration is highly flexible — you can specify different models and providers for "autocomplete" vs "chat" separately. It's the most suitable client for deep customization with free APIs.

**For:** Heavy code-completion users, teams sharing config between VS Code and JetBrains.

## Installation

**VS Code:**
- Extensions → Search "Continue" → Install Continue.continue

**JetBrains (IntelliJ / PyCharm / GoLand, etc.):**
- Settings → Plugins → Marketplace → Search "Continue" → Install

> **Config file location:**
> - macOS/Linux: `~/.continue/config.json`
> - Windows: `%USERPROFILE%\.continue\config.json`
>
> Or click the **gear ⚙** at the bottom-right of the extension → Open config.json.

## Quick Start: OpenRouter (Recommended)

Edit `~/.continue/config.json`:

```json
{
  "models": [
    {
      "title": "OpenRouter DeepSeek (Free)",
      "provider": "openai",
      "model": "deepseek/deepseek-chat:free",
      "apiBase": "https://openrouter.ai/api/v1",
      "apiKey": "sk-or-v1-YOUR_OPENROUTER_KEY"
    }
  ],
  "tabAutocompleteModel": {
    "title": "Groq Autocomplete",
    "provider": "openai",
    "model": "llama-3.1-8b-instant",
    "apiBase": "https://api.groq.com/openai/v1",
    "apiKey": "gsk_YOUR_GROQ_KEY"
  }
}
```

Continue auto-reloads after saving. Open the Continue panel in VS Code sidebar, send "hello" to test.

## Provider Parameters

| Provider | `provider` field | `apiBase` | Recommended Free Chat Model | Recommended Autocomplete Model |
|---|---|---|---|---|
| OpenRouter | `openai` | `https://openrouter.ai/api/v1` | `deepseek/deepseek-chat:free` | Not recommended (high latency) |
| Gemini | `gemini` *(built-in)* | *(auto)* | `gemini-2.0-flash` | FIM not supported |
| Groq | `openai` | `https://api.groq.com/openai/v1` | `llama-3.3-70b-versatile` | `llama-3.1-8b-instant` |
| Cerebras | `openai` | `https://api.cerebras.ai/v1` | `llama-3.3-70b` | `llama3.1-8b` |
| GitHub Models | `openai` | `https://models.github.ai/inference` | `openai/gpt-4o-mini` | — |
| Mistral | `mistral` *(built-in)* | *(auto)* | `mistral-small-latest` | `codestral-latest` (separate key) |
| Ollama | `ollama` *(built-in)* | `http://localhost:11434` | `llama3.3` | `qwen2.5-coder:7b` |

## Full Recommended Config (Multi-model combo)

```json
{
  "models": [
    {
      "title": "DeepSeek via OpenRouter (Free)",
      "provider": "openai",
      "model": "deepseek/deepseek-chat:free",
      "apiBase": "https://openrouter.ai/api/v1",
      "apiKey": "sk-or-v1-YOUR_KEY"
    },
    {
      "title": "Gemini 2.0 Flash",
      "provider": "gemini",
      "model": "gemini-2.0-flash",
      "apiKey": "AIza_YOUR_GEMINI_KEY"
    },
    {
      "title": "Groq 70B (Fast)",
      "provider": "openai",
      "model": "llama-3.3-70b-versatile",
      "apiBase": "https://api.groq.com/openai/v1",
      "apiKey": "gsk_YOUR_GROQ_KEY"
    },
    {
      "title": "Ollama Local",
      "provider": "ollama",
      "model": "qwen2.5-coder:7b",
      "apiBase": "http://localhost:11434"
    }
  ],
  "tabAutocompleteModel": {
    "title": "Groq 8B Autocomplete",
    "provider": "openai",
    "model": "llama-3.1-8b-instant",
    "apiBase": "https://api.groq.com/openai/v1",
    "apiKey": "gsk_YOUR_GROQ_KEY",
    "contextLength": 8192
  },
  "embeddingsProvider": {
    "provider": "ollama",
    "model": "nomic-embed-text",
    "apiBase": "http://localhost:11434"
  }
}
```

## Codestral Autocomplete (Best Cloud FIM Option)

Codestral is the **only free-tier cloud model with native FIM** (Fill-in-Middle) support — best completion quality:

```json
{
  "tabAutocompleteModel": {
    "title": "Codestral FIM",
    "provider": "mistral",
    "model": "codestral-latest",
    "apiKey": "YOUR_MISTRAL_API_KEY",
    "apiBase": "https://codestral.mistral.ai/v1"
  }
}
```

> ⚠️ Codestral requires a separate key (same account, but activate at console.mistral.ai). 1B tokens/month free, 2 RPM limit (suitable for completions — each request is small).

## Ollama Local Autocomplete (Fully Offline)

```json
{
  "tabAutocompleteModel": {
    "title": "Qwen2.5-Coder Local FIM",
    "provider": "ollama",
    "model": "qwen2.5-coder:7b",
    "apiBase": "http://localhost:11434"
  }
}
```

```bash
ollama pull qwen2.5-coder:7b  # ~4.7GB
```

## @codebase Indexing

Continue's `@codebase` feature requires a local embedding model:

```json
{
  "embeddingsProvider": {
    "provider": "ollama",
    "model": "nomic-embed-text",
    "apiBase": "http://localhost:11434"
  }
}
```

```bash
ollama pull nomic-embed-text
```

## Recommended Combinations

- **Chat (daily Q&A):** OpenRouter DeepSeek Free or Groq 70B
- **Tab autocomplete:** Codestral (best cloud FIM) or Ollama qwen2.5-coder (best offline)
- **Large file analysis:** Gemini 2.0 Flash (1M context)
- **Fully offline:** Ollama qwen2.5-coder + nomic-embed-text

## Common Pitfalls

1. **Tab autocomplete stuck "loading"** — Check `tabAutocompleteModel` config. Groq 8B is the fastest cloud option; if still slow, switch to Ollama local.

2. **Gemini provider doesn't support FIM** — Gemini has no Fill-in-Middle endpoint, can't be used as `tabAutocompleteModel`. Only usable as a chat model (in the `models` array).

3. **Codestral 2 RPM rate limit** — Too-frequent completions return 429. Continue has built-in backoff, but you can increase `debounceDelay` to reduce trigger frequency:
   ```json
   { "tabAutocompleteOptions": { "debounceDelay": 1000 } }
   ```

4. **JetBrains version config sync** — The JetBrains Continue extension shares the same `~/.continue/config.json` as VS Code — no need to reconfigure when switching IDEs.

## Verification

1. Open any .py file in VS Code, move cursor after a function signature, wait 1-3 seconds — gray completion suggestion should appear (Tab to accept)
2. In Continue chat panel: `Explain what this code does` (with code selected)
3. If Tab autocomplete doesn't appear: check if the Continue status bar icon is green

## Sources

- Continue official docs: https://docs.continue.dev (fetched 2026-04-28)
- Continue GitHub: https://github.com/continuedev/continue (fetched 2026-04-28)
- Codestral docs: https://docs.mistral.ai/capabilities/code_generation/ (fetched 2026-04-28)
