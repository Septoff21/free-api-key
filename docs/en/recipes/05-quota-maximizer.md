> Mirror of [docs/zh/recipes/05-quota-maximizer.md](../../zh/recipes/05-quota-maximizer.md) (Chinese, canonical). If they drift, zh wins.

# Recipe: Quota Maximizer

> **Difficulty:** Intermediate · **Est. time:** 20 min · **Last Verified:** 2026-04-27

## Scenario

Maximize available free API calls on a $0 budget. Core strategies: **multi-key rotation + multi-provider fallback + smart caching**.

## Total Quota Reference (Free Tier Daily Maximums)

| Provider | RPD (Requests/Day) | TPD (Tokens/Day) |
|---|---:|---:|
| Groq (8B models) | 14,400 | 500,000 |
| Cerebras (all models) | 14,400 | 1,000,000 |
| Mistral (monthly quota) | Unlimited | ~33M/day (1B/month) |
| GitHub Models (Low tier) | 150 | — |
| GitHub Models (High tier) | 50 | — |
| OpenRouter (no balance) | 50 | — |
| OpenRouter ($10+) | 1,000 | — |
| Gemini 2.0 Flash | 1,500 | — |
| Gemini 2.5 Flash | 250 | — |
| Ollama | ∞ | ∞ (local) |

**Theoretical daily total:** 30,000+ requests (excluding Ollama)

## Strategy 1: Multi-Provider Sequential Fallback

```python
"""
quota_router.py — Route by quota priority
"""

import os, time
from openai import OpenAI
from dataclasses import dataclass, field

@dataclass
class Provider:
    name: str
    base_url: str
    api_key: str
    model: str
    rpd_limit: int
    rpd_used: int = 0
    last_reset: float = field(default_factory=time.time)

    @property
    def is_available(self) -> bool:
        # Check if daily reset needed (UTC 00:00)
        now = time.time()
        if now - self.last_reset > 86400:
            self.rpd_used = 0
            self.last_reset = now
        return self.rpd_used < self.rpd_limit

    def use(self):
        self.rpd_used += 1


PROVIDERS = [
    Provider(
        name="Groq-8B",
        base_url="https://api.groq.com/openai/v1",
        api_key=os.environ.get("GROQ_API_KEY", ""),
        model="llama-3.1-8b-instant",
        rpd_limit=14400,
    ),
    Provider(
        name="Cerebras-8B",
        base_url="https://api.cerebras.ai/v1",
        api_key=os.environ.get("CEREBRAS_API_KEY", ""),
        model="llama3.1-8b",
        rpd_limit=14400,
    ),
    Provider(
        name="Gemini-Flash",
        base_url="https://generativelanguage.googleapis.com/v1beta/openai",
        api_key=os.environ.get("GEMINI_API_KEY", ""),
        model="gemini-2.0-flash",
        rpd_limit=1500,
    ),
    Provider(
        name="Ollama",
        base_url="http://localhost:11434/v1",
        api_key="ollama",
        model="qwen2.5:7b",
        rpd_limit=999999,
    ),
]


def get_next_provider() -> Provider | None:
    """Get the next provider with remaining quota"""
    for p in PROVIDERS:
        if p.api_key and p.is_available:
            return p
    return None


def smart_chat(message: str) -> str:
    """Smart routing, auto-selects a provider with remaining quota"""
    provider = get_next_provider()
    if provider is None:
        raise RuntimeError("All providers' quotas exhausted")

    client = OpenAI(base_url=provider.base_url, api_key=provider.api_key)
    try:
        resp = client.chat.completions.create(
            model=provider.model,
            messages=[{"role": "user", "content": message}],
        )
        provider.use()
        print(f"[{provider.name} | Used {provider.rpd_used}/{provider.rpd_limit}]")
        return resp.choices[0].message.content
    except Exception as e:
        print(f"[{provider.name}] Error: {e}, trying next")
        provider.rpd_used = provider.rpd_limit  # Temporarily mark as exhausted
        return smart_chat(message)
```

## Strategy 2: Semantic Cache (Reuse results for similar questions)

```python
import hashlib, json
from pathlib import Path

CACHE_DIR = Path(".cache/llm_responses")
CACHE_DIR.mkdir(parents=True, exist_ok=True)

def cache_key(message: str, model: str) -> str:
    """Generate cache key"""
    content = f"{model}:{message}"
    return hashlib.md5(content.encode()).hexdigest()

def cached_chat(message: str, model: str = "llama-3.1-8b-instant",
                ttl_hours: int = 24) -> tuple[str, bool]:
    """
    Chat with caching
    Returns: (response, from_cache)
    """
    key = cache_key(message, model)
    cache_file = CACHE_DIR / f"{key}.json"

    # Check cache
    if cache_file.exists():
        data = json.loads(cache_file.read_text())
        age_hours = (time.time() - data["timestamp"]) / 3600
        if age_hours < ttl_hours:
            return data["response"], True

    # Call API
    response = smart_chat(message)

    # Write to cache
    cache_file.write_text(json.dumps({
        "message": message,
        "response": response,
        "model": model,
        "timestamp": time.time(),
    }, ensure_ascii=False))

    return response, False


# Usage example
resp, from_cache = cached_chat("What is API rate limiting?")
print(f"{'(cached)' if from_cache else '(new request)'} {resp}")
```

## Strategy 3: Batch Request Merging

```python
def batch_questions(questions: list[str], batch_size: int = 5) -> list[str]:
    """
    Merge multiple independent questions into one request, saving RPD
    Best for: Q&A that doesn't require context continuity
    """
    results = []
    for i in range(0, len(questions), batch_size):
        batch = questions[i:i+batch_size]
        prompt = f"Please answer the following {len(batch)} questions in order, labeling each answer with [Answer N]:\n\n"
        for j, q in enumerate(batch, 1):
            prompt += f"[Question {j}] {q}\n"

        response = smart_chat(prompt)
        # Parse results (simple version)
        for j in range(1, len(batch) + 1):
            start = response.find(f"[Answer {j}]")
            end = response.find(f"[Answer {j+1}]") if j < len(batch) else len(response)
            if start != -1:
                answer = response[start + len(f"[Answer {j}]"):end].strip()
                results.append(answer)
            else:
                results.append("")
    return results


# 10 questions merged into 2 requests
questions = [f"Question {i}: Explain what {['API', 'RPM', 'token', 'LLM', 'RAG'][i%5]} is" for i in range(10)]
answers = batch_questions(questions, batch_size=5)
for q, a in zip(questions, answers):
    print(f"Q: {q[:30]}... → A: {a[:50]}...")
```

## Strategy 4: Response Compression (Reduce TPD consumption)

```python
COMPRESSION_SYSTEM_PROMPT = """You are a concise assistant.
Rules:
1. Keep answers brief, remove unnecessary filler
2. Lists no longer than 5 items
3. Code examples short but complete
4. Don't repeat the question unless necessary
"""

def compact_chat(message: str, max_tokens: int = 512) -> str:
    """Compact mode, reduces token consumption"""
    client = OpenAI(
        base_url="https://api.groq.com/openai/v1",
        api_key=os.environ["GROQ_API_KEY"],
    )
    resp = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {"role": "system", "content": COMPRESSION_SYSTEM_PROMPT},
            {"role": "user", "content": message},
        ],
        max_tokens=max_tokens,
    )
    return resp.choices[0].message.content
```

## Daily Quota Usage Recommendations

```
Morning (high-quota tasks):
  └─ Groq + Cerebras 14.4K RPD for batch processing

Daytime (interactive tasks):
  └─ Gemini 2.0 Flash 1.5K RPD for vision/chat

Evening (low-quota tasks):
  └─ GitHub Models 150/50 RPD for testing/evaluation
  └─ Mistral for code completion (2 RPM, but 1B tokens/month)

Anytime (local/private):
  └─ Ollama unlimited, doesn't consume cloud quota
```
