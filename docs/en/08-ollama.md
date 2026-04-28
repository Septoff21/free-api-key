> Mirror of [README.md](../../README.md) (Chinese, canonical). If they drift, zh wins.

# Ollama (Local)

> **Type:** Local
> **OpenAI Compatible:** ✅ (via `/v1/` endpoint)
> **Last Verified:** 2026-04-27 ([sources](#sources))

[中文](../zh/08-ollama.md)

## In One Line

Ollama runs open-source large language models entirely on your local machine — **zero API key, zero rate limits, zero cost, zero privacy risk**. After the initial model download, everything runs fully offline. The trade-off is hardware: a decent machine (8GB+ RAM, GPU recommended) is needed for reasonable speed.

## Who It's For

- ✅ Privacy-critical workloads (medical, legal, trade secrets — data never leaves the machine)
- ✅ Unlimited inference without RPM/RPD constraints
- ✅ Air-gapped or restricted-network environments
- ✅ Local agents and code completion tools (hermes3, qwen2.5-coder)
- ❌ Low-spec machines (<8GB RAM) — model inference will be painfully slow
- ❌ Access to the latest proprietary models (GPT-4o, Claude, etc. require their APIs)

## Installation

### macOS / Linux

```bash
# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Start the service (runs in background)
ollama serve
```

### Windows

1. Go to [https://ollama.com/download](https://ollama.com/download), download the Windows installer
2. After installation, Ollama runs automatically in the background (system tray icon)

### Download Models

```bash
# General chat (recommended for beginners)
ollama pull qwen2.5:7b

# Code completion
ollama pull qwen2.5-coder:7b

# Image analysis (vision)
ollama pull llava:13b

# Agent / tool use
ollama pull hermes3:8b

# Reasoning
ollama pull deepseek-r1:8b
```

> 💡 Model downloads may be slow depending on your connection. Once downloaded, models run entirely offline.

## Usage

### CLI (direct chat)

```bash
ollama run qwen2.5:7b "Hello, introduce yourself"
```

### cURL (OpenAI-compatible format)

```bash
curl http://localhost:11434/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "qwen2.5:7b",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

### Python (OpenAI SDK — no code changes needed)

```python
from openai import OpenAI

# No real API key needed; any string works
client = OpenAI(
    base_url="http://localhost:11434/v1",
    api_key="ollama",
)
resp = client.chat.completions.create(
    model="qwen2.5:7b",
    messages=[{"role": "user", "content": "Hello"}],
)
print(resp.choices[0].message.content)
```

### Node.js

```js
import OpenAI from "openai";
const client = new OpenAI({
  baseURL: "http://localhost:11434/v1",
  apiKey: "ollama",  // any string
});
```

### Tool Use (hermes3 recommended)

```python
from openai import OpenAI

client = OpenAI(
    base_url="http://localhost:11434/v1",
    api_key="ollama",
)

tools = [{
    "type": "function",
    "function": {
        "name": "search_web",
        "description": "Search the web for information",
        "parameters": {
            "type": "object",
            "properties": {"query": {"type": "string"}},
            "required": ["query"],
        },
    },
}]

resp = client.chat.completions.create(
    model="hermes3:8b",
    messages=[{"role": "user", "content": "Search for the latest AI news"}],
    tools=tools,
)
print(resp.choices[0].message.tool_calls)
```

### Vision (llava image analysis)

```python
import base64
from openai import OpenAI

client = OpenAI(base_url="http://localhost:11434/v1", api_key="ollama")
with open("image.jpg", "rb") as f:
    img_b64 = base64.b64encode(f.read()).decode()

resp = client.chat.completions.create(
    model="llava:13b",
    messages=[{
        "role": "user",
        "content": [
            {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{img_b64}"}},
            {"type": "text", "text": "What is in this image?"},
        ],
    }],
)
print(resp.choices[0].message.content)
```

## Recommended Models

| Model | Size | Use Case | Min RAM |
|---|---:|---|---:|
| `qwen2.5:7b` | ~4 GB | General chat, tool use | 8 GB |
| `qwen2.5-coder:7b` | ~4 GB | Code generation + completion | 8 GB |
| `hermes3:8b` | ~5 GB | Agents, tool calling | 8 GB |
| `llava:13b` | ~8 GB | Image analysis (vision) | 16 GB |
| `deepseek-r1:8b` | ~5 GB | Reasoning, math | 8 GB |
| `llama3.3:70b` | ~40 GB | High-quality chat | 48 GB |
| `qwen2.5-coder:32b` | ~20 GB | Best-in-class code | 32 GB |

> Full model library: [https://ollama.com/library](https://ollama.com/library)

## Rate Limits

- **None** — entirely constrained by local hardware
- CPU inference (7B model): ≈10–30 tokens/second
- GPU inference (NVIDIA/Apple Silicon, 7B model): ≈50–150 tokens/second
- Adjust context window: `OLLAMA_NUM_CTX=8192` environment variable

## Privacy ⚠️

| Field | Value |
|---|---|
| Trains on your data? | **No (impossible — fully local)** |
| Logs prompts? | **No** |
| Retention | **0 days (nothing stored)** |
| Human review? | **No** |
| Policy | [https://ollama.com/privacy](https://ollama.com/privacy) |

> **The gold standard for privacy**: 100% local inference, zero network requests during generation, data never leaves the machine. To disable startup telemetry: `OLLAMA_NO_ANALYTICS=1`.

## Common Errors

| Error | Cause | Fix |
|---|---|---|
| `Connection refused` | Ollama service not running | Run `ollama serve` or check system tray |
| `model not found` | Model not downloaded | Run `ollama pull <model>` |
| Very slow generation | CPU-only, model too large | Use a smaller model or enable GPU |
| Context truncation | Default num_ctx=2048 | Set `OLLAMA_NUM_CTX=8192` or configure in Modelfile |
| Out of memory crash | Model exceeds available RAM | Use a smaller quantization (`:7b` → `:3b`) or add swap |

## Client Integrations

- [opencode](../../docs/en/clients/opencode.md) (local provider config)
- [Cursor](../../docs/en/clients/cursor.md) (Ollama provider)
- [Cline](../../docs/en/clients/cline.md) (custom OpenAI-compatible endpoint)
- [Continue](../../docs/en/clients/continue.md) (native Ollama support)
- [Open WebUI](../../docs/en/clients/openwebui.md) (best Ollama GUI)

## Tips

1. **hermes3 is the best local agent model** — fine-tuned specifically for tool calling; noticeably better than plain Llama in opencode and agent frameworks.
2. **qwen2.5-coder exceeds expectations** — code capability rivals some cloud models; the 7B version needs only 8GB RAM; exceptional value.
3. **Always increase the context window** — the default `num_ctx=2048` is far too small; set `OLLAMA_NUM_CTX=8192` at minimum; code tasks need 32768.
4. **GPU acceleration makes a dramatic difference** — NVIDIA GPU or Apple Silicon users see 5-10× speed improvement; strongly recommended.
5. **Use as an offline fallback** — in agent code, add local Ollama as a fallback provider; when cloud API quotas are exhausted, switch seamlessly.

## Sources

- [https://ollama.com](https://ollama.com) (fetched 2026-04-27)
- [https://github.com/ollama/ollama](https://github.com/ollama/ollama) (fetched 2026-04-27)
- [https://ollama.com/library](https://ollama.com/library) (fetched 2026-04-27)
- [https://ollama.com/privacy](https://ollama.com/privacy) (fetched 2026-04-27)
