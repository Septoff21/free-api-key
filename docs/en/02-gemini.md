> Mirror of [README.md](../../README.md) (Chinese, canonical). If they drift, zh wins.

# Google Gemini (AI Studio)

> **Type:** First Party
> **OpenAI Compatible:** ✅ (via `/v1beta/openai/` compatibility endpoint)
> **Last Verified:** 2026-04-27 ([sources](#sources))

[中文](../zh/02-gemini.md)

## In One Line

Google's official Gemini API, accessible for free via AI Studio — no credit card required. Features 1M-token context, multimodal input (images, video, PDF, audio), native function calling, and built-in reasoning (Gemini 2.5 Pro). **Warning: the free tier allows Google to use your data for model improvement.**

## Who It's For

- ✅ Long-context tasks (1M tokens — entire codebases, books, long documents)
- ✅ Multimodal workflows (images, video, PDF, audio input)
- ✅ Reasoning / chain-of-thought (2.5 Pro thinking mode)
- ❌ Privacy-sensitive workloads (free tier trains on your data)
- ❌ High-frequency calls (2.5 Pro is only 5 RPM free)

## Getting a Key

1. Go to [https://aistudio.google.com/apikey](https://aistudio.google.com/apikey) — sign in with a Google account
2. Click **Create API key**
3. Choose **Create API key in new project** or link an existing project
4. Copy the key and add to `.env`: `GEMINI_API_KEY=AIza...`

> 💡 No credit card needed. Key is immediately usable. Users in mainland China may need a proxy to access AI Studio and the API.

## Usage

### Native API (query param)

```bash
curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=$GEMINI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"contents": [{"parts": [{"text": "Hello"}]}]}'
```

### OpenAI-Compatible Endpoint (recommended)

```bash
curl https://generativelanguage.googleapis.com/v1beta/openai/chat/completions \
  -H "Authorization: Bearer $GEMINI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gemini-2.5-flash",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

### Python (OpenAI SDK)

```python
import os
from openai import OpenAI

client = OpenAI(
    base_url="https://generativelanguage.googleapis.com/v1beta/openai",
    api_key=os.environ["GEMINI_API_KEY"],
)
resp = client.chat.completions.create(
    model="gemini-2.5-flash",
    messages=[{"role": "user", "content": "Hello"}],
)
print(resp.choices[0].message.content)
```

### Node.js

```js
import OpenAI from "openai";
const client = new OpenAI({
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai",
  apiKey: process.env.GEMINI_API_KEY,
});
```

### Image Input

```python
import base64, os
from openai import OpenAI

client = OpenAI(
    base_url="https://generativelanguage.googleapis.com/v1beta/openai",
    api_key=os.environ["GEMINI_API_KEY"],
)
with open("image.jpg", "rb") as f:
    img_b64 = base64.b64encode(f.read()).decode()

resp = client.chat.completions.create(
    model="gemini-2.5-flash",
    messages=[{
        "role": "user",
        "content": [
            {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{img_b64}"}},
            {"type": "text", "text": "What is in this image?"},
        ],
    }],
)
```

## Free Models (Selection)

| Model | Context | RPM | RPD | Notes |
|---|---:|---:|---:|---|
| `gemini-2.5-pro` | 1,048,576 | 5 | 100 | Best model, reasoning + multimodal |
| `gemini-2.5-flash` | 1,048,576 | 10 | 250 | Best value, optional reasoning |
| `gemini-2.0-flash` | 1,048,576 | 15 | 1,500 | Fast, full multimodal |
| `gemini-2.0-flash-lite` | 1,048,576 | 15 | 1,500 | Lightest, high-volume simple tasks |

> Full list: [https://ai.google.dev/gemini-api/docs/models](https://ai.google.dev/gemini-api/docs/models)
> Data from `providers.json` (Last Verified: 2026-04-27)

## Rate Limits

- **gemini-2.5-pro: 5 RPM / 100 RPD / 250K TPM**
- **gemini-2.5-flash: 10 RPM / 250 RPD / 250K TPM**
- **gemini-2.0-flash / lite: 15 RPM / 1,500 RPD / 250K TPM**
- No rate-limit headers; you must count requests yourself

> See: [https://ai.google.dev/gemini-api/docs/rate-limits](https://ai.google.dev/gemini-api/docs/rate-limits)

## Privacy ⚠️

| Field | Value |
|---|---|
| Trains on your data? | **Yes (free tier)** |
| Logs prompts? | Yes |
| Retention | Unknown |
| Human review? | Yes (possible) |
| Policy | [https://ai.google.dev/gemini-api/terms](https://ai.google.dev/gemini-api/terms) |

> ⚠️ **Important:** On the AI Studio free tier, Google may use your inputs and outputs to improve its models, and human reviewers may access your data. **Do not send sensitive, confidential, medical, or legally privileged data through the free tier.** Upgrade to Vertex AI (paid) for a no-training guarantee.

## Common Errors

| Error | Cause | Fix |
|---|---|---|
| `400 API_KEY_INVALID` | Bad or revoked key | Regenerate key in AI Studio |
| `429 RESOURCE_EXHAUSTED` | RPM or RPD exceeded | Slow down; 2.5 Pro is only 5 RPM |
| `403 Permission denied` | API not enabled in project | Enable Gemini API in Google Cloud Console |
| Connection refused | Network issue (mainland China) | Set proxy: `HTTPS_PROXY=http://127.0.0.1:7890` |

## Client Integrations

- [opencode](../../docs/en/clients/opencode.md)
- [Cursor](../../docs/en/clients/cursor.md)
- [Cline](../../docs/en/clients/cline.md)
- [Continue](../../docs/en/clients/continue.md)
- [Chatbox](../../docs/en/clients/chatbox.md)

## Tips

1. **gemini-2.5-flash is the daily workhorse** — 10 RPM / 250 RPD, quality close to Pro, fast enough for most tasks.
2. **Leverage the 1M context window** — pass entire codebases or long documents in one shot; more accurate than chunking.
3. **Save Pro quota for real reasoning tasks** — 100 RPD is scarce; reserve 2.5 Pro for tasks genuinely needing deep reasoning.
4. **Native PDF/video support** — no format conversion needed; drop the file directly into the request.
5. **Drop-in migration from OpenAI** — existing OpenAI SDK code needs only `base_url` and `api_key` changes.

## Sources

- [https://ai.google.dev/gemini-api/docs/rate-limits](https://ai.google.dev/gemini-api/docs/rate-limits) (fetched 2026-04-27)
- [https://ai.google.dev/gemini-api/docs/models](https://ai.google.dev/gemini-api/docs/models) (fetched 2026-04-27)
- [https://ai.google.dev/gemini-api/terms](https://ai.google.dev/gemini-api/terms) (fetched 2026-04-27)
