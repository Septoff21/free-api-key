> Mirror of [README.md](../../README.md) (Chinese, canonical). If they drift, zh wins.

# GitHub Models

> **Type:** Aggregator
> **OpenAI Compatible:** ✅
> **Last Verified:** 2026-04-27 ([sources](#sources))

[中文](../zh/05-github-models.md)

## In One Line

GitHub's model playground in the Marketplace lets you access GPT-4o, Llama 3.3, DeepSeek-R1, Phi-4, and dozens more using a GitHub Personal Access Token — no OpenAI account or credit card needed. Officially a **prototyping environment only**; not suitable for production.

## Who It's For

- ✅ Developers with a GitHub account who want fast access to GPT-4o without an OpenAI account
- ✅ Model comparison and evaluation (OpenAI / Meta / Mistral / Microsoft / DeepSeek)
- ✅ Low-frequency prototyping and demos
- ❌ Production workloads (explicitly labeled "prototyping only")
- ❌ High-frequency use (premium models are capped at 50 RPD)
- ❌ Sensitive data (underlying provider policies vary)

## Getting a Key

### Option 1: Fine-grained PAT (recommended)

1. Go to [https://github.com/settings/tokens](https://github.com/settings/tokens)
2. Click **Generate new token → Fine-grained token**
3. Under **Permissions**, find **Models** → set to `Read-only`
4. Generate and copy the token
5. Add to `.env`: `GITHUB_TOKEN=github_pat_...`

### Option 2: Classic PAT

1. Go to [https://github.com/settings/tokens](https://github.com/settings/tokens)
2. Click **Generate new token (classic)**
3. No special scopes needed (default permissions work for Models)
4. Copy the token

> 💡 No credit card required. Uses your GitHub account permissions with no separate registration.

## Usage

### cURL

```bash
curl https://models.github.ai/inference/chat/completions \
  -H "Authorization: Bearer $GITHUB_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "openai/gpt-4o",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

### Python (OpenAI SDK)

```python
import os
from openai import OpenAI

client = OpenAI(
    base_url="https://models.github.ai/inference",
    api_key=os.environ["GITHUB_TOKEN"],
)
resp = client.chat.completions.create(
    model="openai/gpt-4o",
    messages=[{"role": "user", "content": "Hello"}],
)
print(resp.choices[0].message.content)
```

### Node.js

```js
import OpenAI from "openai";
const client = new OpenAI({
  baseURL: "https://models.github.ai/inference",
  apiKey: process.env.GITHUB_TOKEN,
});
```

### Vision (GPT-4o Image Analysis)

```python
import os, base64
from openai import OpenAI

client = OpenAI(
    base_url="https://models.github.ai/inference",
    api_key=os.environ["GITHUB_TOKEN"],
)
with open("screenshot.png", "rb") as f:
    img_b64 = base64.b64encode(f.read()).decode()

resp = client.chat.completions.create(
    model="openai/gpt-4o",
    messages=[{
        "role": "user",
        "content": [
            {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{img_b64}"}},
            {"type": "text", "text": "Describe what you see in this screenshot"},
        ],
    }],
)
```

## Free Models (Selection)

| Model | Context | Tier | RPM | RPD | Notes |
|---|---:|---|---:|---:|---|
| `openai/gpt-4o` | 128,000 | High | 10 | 50 | Top multimodal; no OpenAI account needed |
| `openai/gpt-4.1-mini` | 128,000 | High | 10 | 50 | Fast GPT-4 variant |
| `meta/llama-3.3-70b-instruct` | 128,000 | High | 10 | 50 | Strongest open-source |
| `microsoft/phi-4` | 16,384 | Low | 15 | 150 | Excellent code + reasoning |
| `deepseek/deepseek-r1` | 65,536 | High | 10 | 50 | Reasoning model, visible CoT |
| `mistral-ai/mistral-small` | 32,768 | Low | 15 | 150 | Vision + tool use |

> Full list: [https://github.com/marketplace/models](https://github.com/marketplace/models)
> Data from `providers.json` (Last Verified: 2026-04-27)

## Rate Limits

- **Low-tier models: 15 RPM / 150 RPD** (8K input / 4K output tokens per request)
- **High-tier models: 10 RPM / 50 RPD** (8K input / 4K output tokens per request)
- No rate-limit headers; count manually

> See: [https://docs.github.com/en/github-models/prototyping-with-ai-models](https://docs.github.com/en/github-models/prototyping-with-ai-models)

## Privacy ⚠️

| Field | Value |
|---|---|
| Trains on your data? | **No** (GitHub itself does not train) |
| Logs prompts? | Unknown |
| Retention | Unknown |
| Human review? | No |
| Policy | [GitHub Privacy Statement](https://docs.github.com/en/site-policy/privacy-policies/github-privacy-statement) |

> GitHub does not train on GitHub Models data. Underlying providers (OpenAI, Anthropic, Meta, etc.) have their own policies.
> ⚠️ Officially labeled a "prototyping environment" — **do not use for production or sensitive data.**

## Common Errors

| Error | Cause | Fix |
|---|---|---|
| `401 Unauthorized` | Invalid or insufficient PAT permissions | Confirm token is valid; fine-grained PAT needs `Models:read` |
| `429 Too Many Requests` | RPD exhausted | High-tier 50 RPD depletes fast; switch to Low-tier models |
| `400 Invalid model` | Missing `provider/` prefix in model ID | Use full format e.g. `openai/gpt-4o` |
| `413 Request too large` | Input exceeds 8K tokens per request | Reduce input or split into batches |

## Client Integrations

- [opencode](../../docs/en/clients/opencode.md)
- [Cursor](../../docs/en/clients/cursor.md)
- [Cline](../../docs/en/clients/cline.md)
- [Continue](../../docs/en/clients/continue.md)
- [Chatbox](../../docs/en/clients/chatbox.md)

## Tips

1. **Easiest path to GPT-4o** — any GitHub account works; no OpenAI account or billing needed; 50 RPD is fine for daily experiments.
2. **Low-tier models have higher quotas** — Phi-4 and Mistral-Small give 150 RPD; prefer them for frequent testing.
3. **4K output cap applies regardless of model capability** — for long-form generation, plan chunked output.
4. **Model IDs must include the provider prefix** — format is `openai/gpt-4o`, not just `gpt-4o`; this is the most common beginner mistake.
5. **Plan your migration early** — once validated, move to the model provider's production API; GitHub Models provides no SLA.

## Sources

- [https://docs.github.com/en/github-models/prototyping-with-ai-models](https://docs.github.com/en/github-models/prototyping-with-ai-models) (fetched 2026-04-27)
- [https://docs.github.com/en/github-models/responsible-use-of-github-models](https://docs.github.com/en/github-models/responsible-use-of-github-models) (fetched 2026-04-27)
- [https://github.com/marketplace/models](https://github.com/marketplace/models) (fetched 2026-04-27)
