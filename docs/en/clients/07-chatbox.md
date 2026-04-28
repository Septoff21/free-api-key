> Mirror of [docs/zh/clients/07-chatbox.md](../../zh/clients/07-chatbox.md) (Chinese, canonical). If they drift, zh wins.

# Chatbox — Connect Free API Keys

> Last Verified: 2026-04-28 against Chatbox v1.x
> Platform tested: Windows / macOS / Linux / iOS / Android

## What is this

Chatbox is a cross-platform AI chat client supporting Windows, macOS, Linux, iOS, and Android. Clean UI, focused on chat experience. Supports OpenAI-compatible APIs, simple configuration with a graphical interface — no config file editing needed. Data stored locally, conversation history not uploaded to the cloud.

**For:** Non-developer users (simplest UI), users wanting free APIs on mobile, users wanting cross-device conversation sync.

## Installation

- **Windows**: Download .exe installer from official website, or Microsoft Store search "Chatbox"
- **macOS**: Download .dmg, or `brew install --cask chatbox`
- **Linux**: Download .AppImage, `chmod +x Chatbox-*.AppImage && ./Chatbox-*.AppImage`
- **iOS**: App Store search "Chatbox AI"
- **Android**: Google Play search "Chatbox AI"

Official website: https://chatboxai.app

## Quick Start: OpenRouter (Recommended)

1. Open Chatbox → Bottom-left **Settings (gear icon)**
2. **AI Provider**: Select `OpenAI API` (not "Chatbox AI")
3. Fill in:
   - **API Host**: `https://openrouter.ai/api/v1`
   - **API Key**: `sk-or-v1-YOUR_OPENROUTER_KEY`
   - **Model**: Type `deepseek/deepseek-chat:free` (must be entered manually)
4. Click **Save**, send "hello" in chat to test

## Provider Parameters

| Provider | AI Provider Option | API Host | Recommended Free Model |
|---|---|---|---|
| OpenRouter | `OpenAI API` | `https://openrouter.ai/api/v1` | `deepseek/deepseek-chat:free` |
| Gemini | `Google Gemini` *(built-in)* | *(auto)* | `gemini-2.0-flash` |
| Groq | `OpenAI API` | `https://api.groq.com/openai/v1` | `llama-3.3-70b-versatile` |
| Cerebras | `OpenAI API` | `https://api.cerebras.ai/v1` | `llama-3.3-70b` |
| GitHub Models | `OpenAI API` | `https://models.github.ai/inference` | `openai/gpt-4o-mini` |
| Mistral | `OpenAI API` | `https://api.mistral.ai/v1` | `mistral-small-latest` |
| Ollama | `Ollama API` *(built-in)* | `http://localhost:11434` | `qwen2.5:7b` |

## Gemini (Simplest Setup)

Chatbox has built-in Gemini support — the easiest configuration:

1. Settings → **AI Provider** → Select `Google Gemini`
2. **API Key**: Enter `AIza_YOUR_GEMINI_KEY`
3. **Model**: Select `gemini-2.0-flash` (1.5K RPD free)
4. Save

⚠️ Gemini free tier: conversations may be used for model training. Don't send sensitive content. Switch to Ollama for private data.

## Ollama (Fully Local)

1. Ensure Ollama is running:
   ```bash
   ollama pull qwen2.5:7b
   ollama serve
   ```
2. Settings → **AI Provider** → Select `Ollama API`
3. **API Host**: `http://localhost:11434` (default)
4. **Model**: Select `qwen2.5:7b` from dropdown

> Mobile Chatbox can't connect to your PC's Ollama unless both are on the same LAN and Ollama listens on `0.0.0.0`: `OLLAMA_HOST=0.0.0.0 ollama serve`. Then enter the PC's LAN IP in Chatbox.

## Multi-Provider Switching Tips

Chatbox supports multiple "chat groups," each with a different Provider setting:

1. Click **+ New Chat**
2. Right-click the chat title → **Edit** → Change Provider

This lets you quickly switch between Groq (fast), Gemini (long docs), and Ollama (local) without changing global settings each time.

## Mobile Configuration (iOS / Android)

Mobile Chatbox supports cloud APIs (OpenRouter, Groq, Gemini, etc.) with the same setup steps:

Settings → AI Provider → OpenAI API → Enter Host and Key

> **Mobile network notes:**
> - VPN may be required for blocked services (OpenRouter, Groq)
> - Gemini is directly accessible in most regions
> - Ollama requires same Wi-Fi network, Ollama listening on `0.0.0.0`

## Recommended Combinations

- **Daily chat (easiest):** Gemini `gemini-2.0-flash` (built-in, simplest config)
- **Fast responses:** Groq `llama-3.3-70b-versatile`
- **Multiple model backup:** OpenRouter `deepseek/deepseek-chat:free` (one key, many free models)
- **Desktop privacy:** Ollama local `qwen2.5:7b`

## Common Pitfalls

1. **Wrong model name returns no content** — Chatbox accepts any string in the Model field. If you mistype it, the provider returns 404. OpenRouter format: `provider/model:variant` (e.g., `deepseek/deepseek-chat:free`). Groq format: just `llama-3.3-70b-versatile`.

2. **iOS/Android app not available in your region** — Chatbox may be removed from some regional App Stores. Switch Apple ID region to US/HK, or download APK directly from official website (Android).

3. **Wrong API Host format** — Common errors: missing `https://`, missing trailing `/` in Gemini URL, putting API Key in the API Host field.

4. **Config lost after Chatbox update** — Some version upgrades reset settings. Take a screenshot of your config for reference.

5. **OpenRouter shows very long model list** — Chatbox doesn't filter free/paid models. Typing the model name manually is the safest approach to avoid accidentally selecting a paid model.

## Verification

1. Open Chatbox, confirm settings are saved correctly
2. Send: "Hello, explain quantum computing in one sentence"
3. Expected: Response appears within 5 seconds

If no response:
- Check API Host includes `https://`
- Check API Key is complete (no extra spaces)
- Check network/VPN is working

## Sources

- Chatbox official website: https://chatboxai.app (fetched 2026-04-28)
- Chatbox GitHub: https://github.com/Bin-Huang/chatbox (fetched 2026-04-28)
- Chatbox docs: https://chatboxai.app/docs (fetched 2026-04-28)
