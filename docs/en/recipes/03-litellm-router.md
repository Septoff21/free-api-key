> Mirror of [docs/zh/recipes/03-litellm-router.md](../../zh/recipes/03-litellm-router.md) (Chinese, canonical). If they drift, zh wins.

# Recipe: LiteLLM Multi-Provider Routing & Auto-Failover

> **Difficulty:** Intermediate · **Est. time:** 15 min · **Last Verified:** 2026-04-27

## Scenario

Use LiteLLM to centrally manage multiple free API keys. When a provider's quota is exhausted or returns an error, automatically switch to a fallback provider.

## Installation

```bash
pip install litellm
```

## Python Usage

```python
"""
litellm_router.py — Multi-provider intelligent routing

Requirements: pip install litellm pyyaml
"""

import os
import litellm
from litellm import Router

# Initialize router
router = Router(
    model_list=[
        # Fast chat: Groq → Cerebras → Ollama
        {
            "model_name": "fast-chat",
            "litellm_params": {
                "model": "groq/llama-3.1-8b-instant",
                "api_key": os.environ.get("GROQ_API_KEY", ""),
            },
            "model_info": {"rpm": 30, "tpm": 6000},
        },
        {
            "model_name": "fast-chat",
            "litellm_params": {
                "model": "cerebras/llama3.1-8b",
                "api_key": os.environ.get("CEREBRAS_API_KEY", ""),
                "api_base": "https://api.cerebras.ai/v1",
            },
            "model_info": {"rpm": 30, "tpm": 60000},
        },
        {
            "model_name": "fast-chat",
            "litellm_params": {
                "model": "ollama/qwen2.5:7b",
                "api_base": "http://localhost:11434",
                "api_key": "ollama",
            },
        },
        # Quality chat: Groq 70B → OpenRouter → Ollama
        {
            "model_name": "quality-chat",
            "litellm_params": {
                "model": "groq/llama-3.3-70b-versatile",
                "api_key": os.environ.get("GROQ_API_KEY", ""),
            },
        },
        {
            "model_name": "quality-chat",
            "litellm_params": {
                "model": "openrouter/meta-llama/llama-3.3-70b-instruct:free",
                "api_key": os.environ.get("OPENROUTER_API_KEY", ""),
            },
        },
    ],
    num_retries=3,
    retry_after=5,
    allowed_fails=2,
    cooldown_time=60,
    routing_strategy="least-busy",
)


def chat(message: str, model_alias: str = "fast-chat") -> str:
    """Send message with automatic routing and failover"""
    resp = router.completion(
        model=model_alias,
        messages=[{"role": "user", "content": message}],
    )
    return resp.choices[0].message.content


def chat_with_fallback(message: str) -> str:
    """Try quality first, fall back to fast on failure"""
    try:
        return chat(message, "quality-chat")
    except Exception as e:
        print(f"Quality model failed: {e}, falling back to fast model")
        return chat(message, "fast-chat")


# ─── Streaming Output ──────────────────────────────────────────────────────────

def stream_chat(message: str, model_alias: str = "fast-chat"):
    """Streaming output version"""
    for chunk in router.completion(
        model=model_alias,
        messages=[{"role": "user", "content": message}],
        stream=True,
    ):
        delta = chunk.choices[0].delta.content
        if delta:
            print(delta, end="", flush=True)
    print()  # newline


# ─── Usage Examples ────────────────────────────────────────────────────────────

if __name__ == "__main__":
    # Basic usage
    print(chat("Explain LiteLLM in one sentence"))

    # Streaming output
    print("\nStreaming output:")
    stream_chat("Explain what API rate limiting is")

    # Failover
    result = chat_with_fallback("Give me 3 Python learning tips")
    print(f"\nResult: {result}")
```

## Launch LiteLLM Proxy Server

To let existing OpenAI clients connect directly (no code changes needed):

```bash
# Install
pip install litellm[proxy]

# Launch proxy with config file
litellm --config configs/litellm_config.yaml --port 4000

# Now all OpenAI clients can point to the proxy:
# base_url="http://localhost:4000"
# api_key="sk-anything"  # proxy doesn't validate keys
```

```python
# Existing OpenAI code, only change base_url
from openai import OpenAI

client = OpenAI(
    base_url="http://localhost:4000",
    api_key="sk-anything",
)
resp = client.chat.completions.create(
    model="fast-chat",   # LiteLLM alias
    messages=[{"role": "user", "content": "hello"}],
)
```

## Quota Exhaustion Fallback Order

```python
# Ordered by priority and daily quota
PRIORITY_MODELS = [
    ("cerebras",   "llama3.3-70b",                          14400),  # Highest quota
    ("groq",       "llama-3.1-8b-instant",                  14400),  # Extremely fast
    ("groq",       "llama-3.3-70b-versatile",                1000),
    ("openrouter", "meta-llama/llama-3.3-70b-instruct:free", 1000),
    ("ollama",     "qwen2.5:7b",                              None),  # Unlimited
]
```

See `configs/litellm_config.yaml` for the full YAML configuration with 6 model aliases and router settings.
