> Mirror of [README.md](../../README.md) (Chinese, canonical). If they drift, zh wins.

# OpenRouter

> **Type:** Aggregator
> **OpenAI Compatible:** ✅
> **Last Verified:** 2026-04-27 ([sources](#sources))

[中文](../zh/01-openrouter.md)

## In One Line

OpenRouter is an AI model gateway that aggregates hundreds of models from Google, Meta, Mistral, and more under a single OpenAI-compatible API. Free users can access models with the `:free` suffix without a credit card; adding $10 to your account bumps the daily limit from 50 to 1,000 requests.

## Who It's For

- ✅ Developers who want one key to access many top models
- ✅ A/B testing and comparing model outputs
- ✅ Switching freely between Gemini, Llama, Mistral, etc.
- ❌ Latency-sensitive apps (requests travel through an extra routing hop)
- ❌ Users who need guaranteed privacy from underlying model providers

## Getting a Key

1. Go to [https://openrouter.ai/keys](https://openrouter.ai/keys) — sign in with GitHub or Google
2. Click **Create Key**, give it a name
3. Copy the key and add it to `.env`: `OPENROUTER_API_KEY=sk-or-...`

> 💡 No credit card required for free models. Add $10 once to jump from 50 → 1,000 RPD.

## Usage

### cURL

```bash
curl https://openrouter.ai/api/v1/chat/completions \
  -H "Authorization: Bearer $OPENROUTER_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "meta-llama/llama-3.3-70b-instruct:free",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

### Python (OpenAI SDK)

```python
import os
from openai import OpenAI

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=os.environ["OPENROUTER_API_KEY"],
)
resp = client.chat.completions.create(
    model="meta-llama/llama-3.3-70b-instruct:free",
    messages=[{"role": "user", "content": "Hello"}],
)
print(resp.choices[0].message.content)
```

### Node.js

```js
import OpenAI from "openai";
const client = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});
```

## Free Models (Selection)

| Model | Context | Notes |
|---|---:|---|
| `meta-llama/llama-3.3-70b-instruct:free` | 131,072 | Strong general model, native tool use |
| `google/gemini-2.0-flash-exp:free` | 1,048,576 | 1M context, image input |
| `deepseek/deepseek-chat-v3-0324:free` | 65,536 | Excellent code + chat |
| `qwen/qwq-32b:free` | 131,072 | Reasoning model, visible CoT |
| `mistralai/mistral-small-3.1-24b-instruct:free` | 131,072 | Vision + tool use |
| `google/gemma-3-27b-it:free` | 131,072 | Google Gemma 3 open weights |

> Full list: [https://openrouter.ai/models?q=free](https://openrouter.ai/models?q=free)
> Data from `providers.json` (Last Verified: 2026-04-27)

## Rate Limits

- **20 RPM** — requests per minute
- **50 RPD** (no balance) / **1,000 RPD** (after adding $10+) — requests per day
- Response headers `x-ratelimit-limit-requests` and `x-ratelimit-remaining-requests` report remaining quota

> See: [https://openrouter.ai/docs/api/reference/limits](https://openrouter.ai/docs/api/reference/limits)

## Privacy ⚠️

| Field | Value |
|---|---|
| Trains on your data? | **No** (OpenRouter itself does not train) |
| Logs prompts? | Unknown |
| Retention | Unknown |
| Human review? | No |
| Policy | [https://openrouter.ai/privacy](https://openrouter.ai/privacy) |

> ⚠️ OpenRouter itself doesn't train on data, but requests are forwarded to underlying providers (Google, Meta, etc.) which have their own privacy policies. For sensitive workloads, verify the policy of each specific `:free` model's provider.

## Common Errors

| Error | Cause | Fix |
|---|---|---|
| `401 Unauthorized` | Invalid key | Confirm key starts with `sk-or-`, check header format |
| `429 Too Many Requests` | RPM or RPD exceeded | Add retry with exponential backoff; consider adding $10 |
| `404 model not found` | Missing `:free` suffix | Append `:free` to the model ID |
| `503 Service Unavailable` | Underlying provider down | Switch to a different `:free` model or retry later |

## Client Integrations

- [opencode](../../docs/en/clients/opencode.md)
- [Cursor](../../docs/en/clients/cursor.md)
- [Cline](../../docs/en/clients/cline.md)
- [Continue](../../docs/en/clients/continue.md)
- [Chatbox](../../docs/en/clients/chatbox.md)

## Tips

1. **Zero-cost model switching** — only change the `model` field; all code stays the same. When one model's quota runs out, swap in another `:free` model instantly.
2. **Adding $10 is the highest-ROI action** — 50 → 1,000 RPD at minimal cost; suitable for light production use.
3. **Use `/api/v1/auth/key` for health checks** — `GET /api/v1/auth/key` returns balance and remaining RPD; perfect for self-check scripts.
4. **Free models rotate** — manage model IDs in config files, not hardcoded strings, so you can swap quickly.
5. **Add `HTTP-Referer` header** — OpenRouter recommends including your project URL for usage attribution.

## Sources

- [https://openrouter.ai/docs/api/reference/limits](https://openrouter.ai/docs/api/reference/limits) (fetched 2026-04-27)
- [https://openrouter.ai/models](https://openrouter.ai/models) (fetched 2026-04-27)
- [https://openrouter.ai/privacy](https://openrouter.ai/privacy) (fetched 2026-04-27)
