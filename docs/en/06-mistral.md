> Mirror of [README.md](../../README.md) (Chinese, canonical). If they drift, zh wins.

# Mistral La Plateforme

> **Type:** First Party
> **OpenAI Compatible:** ✅
> **Last Verified:** 2026-04-27 ([sources](#sources))

[中文](../zh/06-mistral.md)

## In One Line

Mistral AI's official API (French company, GDPR-compliant) offers all models — including flagship Mistral Large and the 256K-context Codestral code model — under a free "Experiment" plan with **1 billion tokens/month**. The 2 RPM limit requires retry logic, but privacy-sensitive users benefit from a no-training-by-default policy.

## Who It's For

- ✅ Code completion (Codestral: 256K context, FIM fill-in-middle support)
- ✅ Privacy-conscious users (French GDPR compliance, no training by default)
- ✅ Monthly usage under 1B tokens (covers most individual projects)
- ✅ Vision workloads (Mistral Small 3.1 accepts image input)
- ❌ High-frequency real-time calls (2 RPM is very restrictive; retry logic is mandatory)
- ❌ Reasoning/chain-of-thought model requirements (no dedicated reasoning model in free tier)

## Getting a Key

1. Go to [https://console.mistral.ai/api-keys](https://console.mistral.ai/api-keys) — register a Mistral account
2. Choose the **Experiment** (free) plan
3. Click **Create new key**, give it a name
4. Copy the key and add to `.env`: `MISTRAL_API_KEY=...`

> 💡 No credit card required. Select the Experiment plan for free access. Codestral uses a separate base URL (`https://codestral.mistral.ai/v1`) but the same API key.

## Usage

### cURL

```bash
curl https://api.mistral.ai/v1/chat/completions \
  -H "Authorization: Bearer $MISTRAL_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "mistral-small-latest",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

### Python (OpenAI SDK)

```python
import os
from openai import OpenAI

client = OpenAI(
    base_url="https://api.mistral.ai/v1",
    api_key=os.environ["MISTRAL_API_KEY"],
)
resp = client.chat.completions.create(
    model="mistral-small-latest",
    messages=[{"role": "user", "content": "Hello"}],
)
print(resp.choices[0].message.content)
```

### Node.js

```js
import OpenAI from "openai";
const client = new OpenAI({
  baseURL: "https://api.mistral.ai/v1",
  apiKey: process.env.MISTRAL_API_KEY,
});
```

### Codestral FIM Code Completion

```python
import os, requests

resp = requests.post(
    "https://codestral.mistral.ai/v1/fim/completions",
    headers={
        "Authorization": f"Bearer {os.environ['MISTRAL_API_KEY']}",
        "Content-Type": "application/json",
    },
    json={
        "model": "codestral-latest",
        "prompt": "def fibonacci(n):",
        "suffix": "\n    return result",
        "max_tokens": 256,
    },
)
print(resp.json()["choices"][0]["message"]["content"])
```

### Vision Input (Mistral Small)

```python
import os, base64
from openai import OpenAI

client = OpenAI(
    base_url="https://api.mistral.ai/v1",
    api_key=os.environ["MISTRAL_API_KEY"],
)
with open("image.jpg", "rb") as f:
    img_b64 = base64.b64encode(f.read()).decode()

resp = client.chat.completions.create(
    model="mistral-small-latest",
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

| Model | Context | Notes |
|---|---:|---|
| `mistral-small-latest` | 131,072 | Small 3.1: vision + tool use |
| `mistral-large-latest` | 131,072 | Flagship model, strong general capability |
| `codestral-latest` | 256,000 | Code-specialized, FIM, separate endpoint |
| `open-mistral-nemo` | 131,072 | 12B open-weight, fast, multilingual |

> Full list: [https://docs.mistral.ai/getting-started/models/](https://docs.mistral.ai/getting-started/models/)
> Data from `providers.json` (Last Verified: 2026-04-27)

## Rate Limits

- **2 RPM** — only 2 requests per minute; **exponential backoff is mandatory**
- **1B tokens/month** — generous; approximately 750M English words
- Headers: `x-ratelimit-limit`, `x-ratelimit-remaining`

> See: [https://docs.mistral.ai/getting-started/quickstart/](https://docs.mistral.ai/getting-started/quickstart/)

## Privacy ⚠️

| Field | Value |
|---|---|
| Trains on your data? | **No** (explicit opt-in required) |
| Logs prompts? | Unknown |
| Retention | Unknown |
| Human review? | No |
| Policy | [https://mistral.ai/privacy/](https://mistral.ai/privacy/) |

> Mistral does not train on API data by default — you must explicitly opt in to contribute data. As a French company operating under EU law, Mistral has strong GDPR obligations, making it one of the more privacy-respecting providers in this list.

## Common Errors

| Error | Cause | Fix |
|---|---|---|
| `401 Unauthorized` | Invalid key | Check key in console, verify format |
| `429 Too Many Requests` | Exceeded 2 RPM | Wait ≥30 seconds before retrying; implement a token-bucket rate limiter |
| `404 model not found` | Codestral requires different base URL | Use `https://codestral.mistral.ai/v1` for Codestral |
| `400 Input too long` | Context exceeded | Codestral 256K, others 128K — very unlikely to trigger |

## Client Integrations

- [opencode](../../docs/en/clients/opencode.md) (Codestral for code completion)
- [Cursor](../../docs/en/clients/cursor.md)
- [Cline](../../docs/en/clients/cline.md)
- [Continue](../../docs/en/clients/continue.md) (Codestral FIM integration)
- [Chatbox](../../docs/en/clients/chatbox.md)

## Tips

1. **Build a request queue** — 2 RPM means one request every 30 seconds; a proper async queue prevents 429 floods.
2. **Codestral is exceptional for code completion** — 256K context + FIM support integrates seamlessly into Continue, Copilot, and other editor plugins.
3. **Privacy-first choice** — European regulation + no-training default = lower compliance cost for enterprise projects.
4. **1B tokens/month can serve a small team** — allocate quotas per feature to prevent a single agent from exhausting the monthly budget.
5. **Reserve Large model RPM for high-value requests** — use Nemo or Small for routine tasks; Large for when quality truly matters.

## Sources

- [https://docs.mistral.ai/getting-started/quickstart/](https://docs.mistral.ai/getting-started/quickstart/) (fetched 2026-04-27)
- [https://docs.mistral.ai/getting-started/models/](https://docs.mistral.ai/getting-started/models/) (fetched 2026-04-27)
- [https://mistral.ai/privacy/](https://mistral.ai/privacy/) (fetched 2026-04-27)
