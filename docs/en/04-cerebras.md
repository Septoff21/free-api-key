> Mirror of [README.md](../../README.md) (Chinese, canonical). If they drift, zh wins.

# Cerebras Inference

> **Type:** Inference Provider
> **OpenAI Compatible:** ✅
> **Last Verified:** 2026-04-27 ([sources](#sources))

[中文](../zh/04-cerebras.md)

## In One Line

Cerebras runs AI inference on its proprietary WSE (Wafer-Scale Engine) chips — a single chip with more compute than an entire GPU cluster. The free tier offers **1M tokens/day**, 30 RPM, 14.4K RPD, and 60K TPM, making it one of the most generous free tiers available. Best for high-throughput text workloads.

## Who It's For

- ✅ High-throughput batch processing (60K TPM, 1M TPD)
- ✅ Agentic workflows where the LLM is called in a tight loop
- ✅ Text generation at scale with native tool use (llama3.3-70b)
- ❌ Image, video, or audio input (text-only provider)
- ❌ Very long context requirements (llama3.1-8b is 8K context only)

## Getting a Key

1. Go to [https://cloud.cerebras.ai](https://cloud.cerebras.ai) and register
2. Log in and navigate to **API Keys**
3. Click **Create API Key**, copy the key
4. Add to `.env`: `CEREBRAS_API_KEY=csk-...`

> 💡 No credit card required. Mainland China users will need a proxy.

## Usage

### cURL

```bash
curl https://api.cerebras.ai/v1/chat/completions \
  -H "Authorization: Bearer $CEREBRAS_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "llama3.1-8b",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

### Python (OpenAI SDK)

```python
import os
from openai import OpenAI

client = OpenAI(
    base_url="https://api.cerebras.ai/v1",
    api_key=os.environ["CEREBRAS_API_KEY"],
)
resp = client.chat.completions.create(
    model="llama3.3-70b",
    messages=[{"role": "user", "content": "Hello"}],
)
print(resp.choices[0].message.content)
```

### Node.js

```js
import OpenAI from "openai";
const client = new OpenAI({
  baseURL: "https://api.cerebras.ai/v1",
  apiKey: process.env.CEREBRAS_API_KEY,
});
```

### Tool Use Example

```python
import os
from openai import OpenAI

client = OpenAI(
    base_url="https://api.cerebras.ai/v1",
    api_key=os.environ["CEREBRAS_API_KEY"],
)

tools = [{
    "type": "function",
    "function": {
        "name": "get_weather",
        "description": "Get weather for a city",
        "parameters": {
            "type": "object",
            "properties": {"city": {"type": "string"}},
            "required": ["city"],
        },
    },
}]

resp = client.chat.completions.create(
    model="llama3.3-70b",
    messages=[{"role": "user", "content": "What's the weather in London?"}],
    tools=tools,
    tool_choice="auto",
)
print(resp.choices[0].message.tool_calls)
```

## Free Models (Selection)

| Model | Context | RPM | RPD | TPD | Notes |
|---|---:|---:|---:|---:|---|
| `llama3.1-8b` | 8,192 | 30 | 14,400 | 1,000,000 | Fastest, tool use, highest quota |
| `llama3.3-70b` | 128,000 | 30 | 14,400 | 1,000,000 | High quality, 128K context |
| `qwen-3-235b-a22b` | 32,768 | 30 | 14,400 | 1,000,000 | Qwen3 MoE, extended thinking |

> Full list: [https://inference-docs.cerebras.ai/introduction](https://inference-docs.cerebras.ai/introduction)
> Data from `providers.json` (Last Verified: 2026-04-27)

## Rate Limits

- **30 RPM / 14.4K RPD / 1M TPD / 60K TPM** (all major models)
- 1M tokens/day ≈ 750 average-length articles; very generous for individual developers
- Headers: `x-ratelimit-limit`, `x-ratelimit-remaining`

> See: [https://inference-docs.cerebras.ai/support/rate-limits](https://inference-docs.cerebras.ai/support/rate-limits)

## Privacy ⚠️

| Field | Value |
|---|---|
| Trains on your data? | **No** |
| Logs prompts? | Unknown |
| Retention | Unknown |
| Human review? | No |
| Policy | [https://cerebras.ai/privacy-policy](https://cerebras.ai/privacy-policy) |

> Cerebras does not train on API user data. Prompts are processed transiently for inference only.

## Common Errors

| Error | Cause | Fix |
|---|---|---|
| `401 Unauthorized` | Invalid key | Confirm key starts with `csk-` |
| `429 Too Many Requests` | RPM or TPM exceeded | Add backoff; 60K TPM is high, usually RPM is the constraint |
| `400 context_length_exceeded` | llama3.1-8b capped at 8K | Switch to llama3.3-70b (128K context) |
| Connection timeout | Network issue | Configure proxy |

## Client Integrations

- [opencode](../../docs/en/clients/opencode.md)
- [Cursor](../../docs/en/clients/cursor.md)
- [Cline](../../docs/en/clients/cline.md)
- [Continue](../../docs/en/clients/continue.md)
- [Chatbox](../../docs/en/clients/chatbox.md)

## Tips

1. **1M TPD is production-grade free quota** — 5-10× higher than most free services; ideal for batch jobs, data cleaning, and large-scale summarization.
2. **Use 8B as the agent inner-loop model** — tool use + extreme speed + high quota makes it a perfect "agent workhorse"; use 70B for validation.
3. **Watch the 8K context limit on 8B** — long documents must use 70B (128K) or be chunked.
4. **60K TPM enables concurrent streaming** — fire multiple streaming requests simultaneously for maximum total throughput.
5. **Qwen3-235B with thinking mode** — the MoE model supports extended reasoning; a pleasant surprise for deep reasoning tasks on the free tier.

## Sources

- [https://inference-docs.cerebras.ai/support/rate-limits](https://inference-docs.cerebras.ai/support/rate-limits) (fetched 2026-04-27)
- [https://inference-docs.cerebras.ai/introduction](https://inference-docs.cerebras.ai/introduction) (fetched 2026-04-27)
- [https://cerebras.ai/privacy-policy](https://cerebras.ai/privacy-policy) (fetched 2026-04-27)
