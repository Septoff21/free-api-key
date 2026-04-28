> Mirror of [README.md](../../README.md) (Chinese, canonical). If they drift, zh wins.

# Groq

> **Type:** Inference Provider
> **OpenAI Compatible:** ✅
> **Last Verified:** 2026-04-27 ([sources](#sources))

[中文](../zh/03-groq.md)

## In One Line

Groq uses custom LPU (Language Processing Unit) chips to deliver inference at 500+ tokens/second — 5-10× faster than GPU-based services. The free tier offers 30 RPM and up to 14,400 RPD for 8B models, plus Llama 3.x, DeepSeek-R1, QwQ reasoning models, and Whisper audio transcription.

## Who It's For

- ✅ Ultra-low latency, high-throughput inference (500+ tok/s)
- ✅ Real-time streaming applications
- ✅ High-volume small-model calls (8B: 14.4K RPD free)
- ✅ Audio transcription (Whisper, extremely fast)
- ❌ Complex vision tasks (only 11B vision preview available)
- ❌ High-frequency 70B model use (only 1K RPD for 70B)

## Getting a Key

1. Go to [https://console.groq.com/keys](https://console.groq.com/keys) — sign up with Google or GitHub
2. Click **Create API Key**, give it a name
3. Copy the key and add to `.env`: `GROQ_API_KEY=gsk_...`

> 💡 No credit card required. Immediately usable. Mainland China users will likely need a proxy.

## Usage

### cURL

```bash
curl https://api.groq.com/openai/v1/chat/completions \
  -H "Authorization: Bearer $GROQ_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "llama-3.1-8b-instant",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

### Python (OpenAI SDK)

```python
import os
from openai import OpenAI

client = OpenAI(
    base_url="https://api.groq.com/openai/v1",
    api_key=os.environ["GROQ_API_KEY"],
)
resp = client.chat.completions.create(
    model="llama-3.1-8b-instant",
    messages=[{"role": "user", "content": "Hello"}],
)
print(resp.choices[0].message.content)
```

### Node.js

```js
import OpenAI from "openai";
const client = new OpenAI({
  baseURL: "https://api.groq.com/openai/v1",
  apiKey: process.env.GROQ_API_KEY,
});
```

### Audio Transcription (Whisper)

```python
from groq import Groq  # pip install groq

client = Groq(api_key=os.environ["GROQ_API_KEY"])
with open("audio.mp3", "rb") as f:
    transcription = client.audio.transcriptions.create(
        model="whisper-large-v3",
        file=f,
        language="en",
    )
print(transcription.text)
```

## Free Models (Selection)

| Model | Context | RPM | RPD | Notes |
|---|---:|---:|---:|---|
| `llama-3.1-8b-instant` | 131,072 | 30 | 14,400 | Highest quota, ultra-fast |
| `llama-3.3-70b-versatile` | 131,072 | 30 | 1,000 | High quality general |
| `llama-3.2-11b-vision-preview` | 8,192 | 30 | 1,000 | Image analysis (preview) |
| `deepseek-r1-distill-llama-70b` | 131,072 | 30 | 1,000 | Reasoning, visible CoT |
| `qwen-qwq-32b` | 131,072 | 30 | 1,000 | Reasoning, math + code |
| `whisper-large-v3` | — | 20 | 2,000 | Audio transcription |

> Full list: [https://console.groq.com/docs/models](https://console.groq.com/docs/models)
> Data from `providers.json` (Last Verified: 2026-04-27)

## Rate Limits

- **30 RPM / 14.4K RPD** (8B models: 6K TPM / 500K TPD)
- **30 RPM / 1K RPD** (70B and reasoning models: 12K TPM / 100K TPD)
- **20 RPM / 2K RPD** (Whisper audio)
- Headers: `x-ratelimit-limit-requests`, `x-ratelimit-remaining-requests`, `x-ratelimit-limit-tokens`

> See: [https://console.groq.com/docs/rate-limits](https://console.groq.com/docs/rate-limits)

## Privacy ⚠️

| Field | Value |
|---|---|
| Trains on your data? | **No** (GroqCloud does not train) |
| Logs prompts? | Unknown |
| Retention | Unknown |
| Human review? | No |
| Policy | [https://groq.com/privacy-policy/](https://groq.com/privacy-policy/) |

> The GroqCloud API is governed by a separate Groq Cloud Services Agreement — not the main consumer privacy policy. API data is not used for model training.

## Common Errors

| Error | Cause | Fix |
|---|---|---|
| `401 Unauthorized` | Invalid key | Confirm key starts with `gsk_` |
| `429 Too Many Requests` | RPM/RPD/TPM exceeded | Check response headers for which limit was hit; add backoff |
| `400 model not found` | Typo in model ID | Fetch correct IDs from `GET /v1/models` |
| Connection timeout | Network issue | Configure proxy |

## Client Integrations

- [opencode](../../docs/en/clients/opencode.md)
- [Cursor](../../docs/en/clients/cursor.md)
- [Cline](../../docs/en/clients/cline.md)
- [Continue](../../docs/en/clients/continue.md)
- [Chatbox](../../docs/en/clients/chatbox.md)

## Tips

1. **8B is the pipeline workhorse** — 14.4K RPD + ultra speed makes it ideal for high-frequency agent sub-tasks (classification, rewriting, extraction).
2. **Reasoning models have very low RPD** — QwQ / DeepSeek-R1 are capped at 1K RPD; save them for tasks that truly need deep reasoning.
3. **Poll rate-limit headers** — `x-ratelimit-remaining-requests` tells you exact quota left; use it in scripts to auto-switch models before hitting the limit.
4. **Whisper is exceptionally fast** — LPU-powered transcription is 3-5× faster than other free services; great for real-time captioning.
5. **Enable streaming** — high-speed inference with `stream: true` gives near-instant first-token latency, comparable to local models.

## Sources

- [https://console.groq.com/docs/rate-limits](https://console.groq.com/docs/rate-limits) (fetched 2026-04-27)
- [https://console.groq.com/docs/models](https://console.groq.com/docs/models) (fetched 2026-04-27)
- [https://groq.com/privacy-policy/](https://groq.com/privacy-policy/) (fetched 2026-04-27)
