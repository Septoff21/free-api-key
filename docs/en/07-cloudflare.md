> Mirror of [README.md](../../README.md) (Chinese, canonical). If they drift, zh wins.

# Cloudflare Workers AI

> **Type:** Inference Provider
> **OpenAI Compatible:** ❌ (native REST API; OpenAI-compatible via AI Gateway)
> **Last Verified:** 2026-04-27 ([sources](#sources))

[中文](../zh/07-cloudflare.md)

## In One Line

The only free-tier provider that covers **text generation + image generation + audio transcription + vision** all in one service. Free allowance is 10,000 neurons/day (≈200–500 text requests or ≈25 images). Requires both an Account ID and an API Token; uses a unique URL structure distinct from OpenAI's.

## Who It's For

- ✅ Free image generation (FLUX.1 Schnell, ≈25 images/day)
- ✅ All-in-one multimodal pipeline (text, image in/out, audio)
- ✅ Existing Cloudflare users (Workers / Pages)
- ✅ Enterprise-grade privacy needs (SOC 2, GDPR compliant)
- ❌ Requires native OpenAI SDK compatibility (URL structure differs; adapter needed)
- ❌ High-volume text generation (10K neurons/day ≈ 500 short requests)

## Getting Credentials

You need **two values**: Account ID + API Token.

### Step 1: Get Account ID

1. Log in to [https://dash.cloudflare.com](https://dash.cloudflare.com)
2. Find **Account ID** in the right sidebar, copy it
3. Add to `.env`: `CLOUDFLARE_ACCOUNT_ID=...`

### Step 2: Create API Token

1. Go to [https://dash.cloudflare.com/profile/api-tokens](https://dash.cloudflare.com/profile/api-tokens)
2. Click **Create Token**
3. Use the **Workers AI** template (or create custom with `Workers AI: Read` permission)
4. Generate and copy the token
5. Add to `.env`: `CLOUDFLARE_API_TOKEN=...`

> 💡 No credit card required for the free tier. Workers AI free allocation is included by default.

## Usage

### cURL (text generation)

```bash
curl "https://api.cloudflare.com/client/v4/accounts/$CLOUDFLARE_ACCOUNT_ID/ai/run/@cf/meta/llama-3.3-70b-instruct-fp8-fast" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"messages": [{"role": "user", "content": "Hello"}]}'
```

### Python (requests helper)

```python
import os, requests

ACCOUNT_ID = os.environ["CLOUDFLARE_ACCOUNT_ID"]
API_TOKEN = os.environ["CLOUDFLARE_API_TOKEN"]

def cf_run(model, payload):
    url = f"https://api.cloudflare.com/client/v4/accounts/{ACCOUNT_ID}/ai/run/{model}"
    resp = requests.post(
        url,
        headers={"Authorization": f"Bearer {API_TOKEN}"},
        json=payload,
    )
    return resp.json()

# Text
result = cf_run(
    "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
    {"messages": [{"role": "user", "content": "Hello"}]},
)
print(result["result"]["response"])
```

### Image Generation (FLUX.1 Schnell)

```python
import os, requests
from PIL import Image
from io import BytesIO

ACCOUNT_ID = os.environ["CLOUDFLARE_ACCOUNT_ID"]
API_TOKEN = os.environ["CLOUDFLARE_API_TOKEN"]

resp = requests.post(
    f"https://api.cloudflare.com/client/v4/accounts/{ACCOUNT_ID}/ai/run/@cf/black-forest-labs/flux-1-schnell",
    headers={"Authorization": f"Bearer {API_TOKEN}"},
    json={"prompt": "A cute panda in a bamboo forest, watercolor style"},
)
# Returns raw image bytes
image = Image.open(BytesIO(resp.content))
image.save("output.png")
print("Saved to output.png")
```

### Audio Transcription (Whisper)

```python
import os, requests

ACCOUNT_ID = os.environ["CLOUDFLARE_ACCOUNT_ID"]
API_TOKEN = os.environ["CLOUDFLARE_API_TOKEN"]

with open("audio.mp3", "rb") as f:
    resp = requests.post(
        f"https://api.cloudflare.com/client/v4/accounts/{ACCOUNT_ID}/ai/run/@cf/openai/whisper",
        headers={"Authorization": f"Bearer {API_TOKEN}"},
        files={"audio": f},
    )
print(resp.json()["result"]["text"])
```

## Free Models (Selection)

| Model | Type | Notes |
|---|---|---|
| `@cf/meta/llama-3.3-70b-instruct-fp8-fast` | Text | Main text model, tool use |
| `@cf/meta/llama-3.2-11b-vision-instruct` | Text + Vision | Image analysis |
| `@cf/black-forest-labs/flux-1-schnell` | Image gen | ≈25 images/day (400 neurons/image) |
| `@cf/openai/whisper` | Audio → Text | Audio transcription |
| `@cf/qwen/qwen2.5-coder-32b-instruct` | Text (code) | Top open-source code model |
| `@cf/deepseek-ai/deepseek-r1-distill-qwen-32b` | Text (reasoning) | Reasoning + CoT trace |

> Full list: [https://developers.cloudflare.com/workers-ai/models/](https://developers.cloudflare.com/workers-ai/models/)
> Data from `providers.json` (Last Verified: 2026-04-27)

## Rate Limits

- **10,000 neurons/day** (free allowance; "neurons" are Cloudflare's compute unit)
- Text models: ≈20–50 neurons per 1K tokens → ≈200–500 short requests/day
- Image generation: ≈400 neurons/image → **≈25 images/day**
- No explicit RPM cap documented; exceeding the daily neuron budget causes request failure

> See: [https://developers.cloudflare.com/workers-ai/platform/limits/](https://developers.cloudflare.com/workers-ai/platform/limits/)

## Privacy ⚠️

| Field | Value |
|---|---|
| Trains on your data? | **No** |
| Logs prompts? | Unknown |
| Retention | Unknown |
| Human review? | No |
| Policy | [https://www.cloudflare.com/privacypolicy/](https://www.cloudflare.com/privacypolicy/) |

> Cloudflare does not train AI models on customer content (confirmed in Workers AI docs and DPA). Enterprise-grade privacy standard (SOC 2, GDPR). Note: the main Cloudflare privacy policy covers CDN/DNS; Workers AI is governed by the Cloudflare Data Processing Addendum.

## Common Errors

| Error | Cause | Fix |
|---|---|---|
| `401 Unauthorized` | Token lacks Workers AI permission | Create token with Workers AI template |
| `400 Account not found` | Wrong Account ID | Re-copy Account ID from Dashboard sidebar |
| `429` / neurons exceeded | Daily 10K neuron budget exhausted | Wait for daily reset or upgrade to paid plan |
| `404 Model not found` | Missing `@cf/` prefix in model ID | Use full format e.g. `@cf/meta/llama-3.3-70b-instruct-fp8-fast` |

## Client Integrations

- [opencode](../../docs/en/clients/opencode.md) (via AI Gateway OpenAI-compatible layer)
- [Chatbox](../../docs/en/clients/chatbox.md) (custom API endpoint)

> Note: Direct Workers AI calls are not OpenAI-format. For OpenAI SDK compatibility, create a Cloudflare AI Gateway and use its OpenAI-compatible URL.

## Tips

1. **Image generation is the standout feature** — the only free-tier service offering image gen; FLUX.1 Schnell quality is solid; ≈25 images/day works for personal projects.
2. **Neurons ≠ tokens** — plan your daily budget in neurons, not tokens; the conversion varies by model.
3. **Wrap the URL in a helper function** — the Account ID embedded in every URL is cumbersome; abstract it away once and reuse.
4. **Use AI Gateway for OpenAI compatibility** — create an AI Gateway in the Cloudflare Dashboard, then use its OpenAI-compatible endpoint with the standard SDK.
5. **Combine modalities in one pipeline** — a single API key covers text, image gen, vision, and audio; ideal for multimedia content processing workflows.

## Sources

- [https://developers.cloudflare.com/workers-ai/platform/limits/](https://developers.cloudflare.com/workers-ai/platform/limits/) (fetched 2026-04-27)
- [https://developers.cloudflare.com/workers-ai/models/](https://developers.cloudflare.com/workers-ai/models/) (fetched 2026-04-27)
- [https://www.cloudflare.com/privacypolicy/](https://www.cloudflare.com/privacypolicy/) (fetched 2026-04-27)
