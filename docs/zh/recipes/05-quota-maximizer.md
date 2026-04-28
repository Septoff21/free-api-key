# Recipe：配额最大化策略

> **难度：** 中级 · **预计时间：** 20 分钟 · **Last Verified:** 2026-04-27

[English](../../en/recipes/05-quota-maximizer.md)

## 场景

在 0 成本预算下，最大化可用的免费 API 调用次数。核心策略：**多 key 轮换 + 多提供商降级 + 智能缓存**。

## 总配额速查（免费层每日最大值）

| 提供商 | RPD（每日请求） | TPD（每日 tokens） |
|---|---:|---:|
| Groq（8B 模型） | 14,400 | 500,000 |
| Cerebras（所有模型） | 14,400 | 1,000,000 |
| Mistral（月配额） | 无限 | ~33M/天（1B/月） |
| GitHub Models（Low 层） | 150 | — |
| GitHub Models（High 层） | 50 | — |
| OpenRouter（无余额） | 50 | — |
| OpenRouter（$10+） | 1,000 | — |
| Gemini 2.0 Flash | 1,500 | — |
| Gemini 2.5 Flash | 250 | — |
| Ollama | ∞ | ∞（本地） |

**理论每日总计：** 30,000+ 次请求（不含 Ollama）

## 策略一：多提供商顺序降级

```python
"""
quota_router.py — 按配额优先级路由
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
        # 检查是否需要重置（每天 UTC 00:00）
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
    """获取下一个有配额的提供商"""
    for p in PROVIDERS:
        if p.api_key and p.is_available:
            return p
    return None


def smart_chat(message: str) -> str:
    """智能路由，自动选择有配额的提供商"""
    provider = get_next_provider()
    if provider is None:
        raise RuntimeError("所有提供商配额已耗尽")

    client = OpenAI(base_url=provider.base_url, api_key=provider.api_key)
    try:
        resp = client.chat.completions.create(
            model=provider.model,
            messages=[{"role": "user", "content": message}],
        )
        provider.use()
        print(f"[{provider.name} | 已用 {provider.rpd_used}/{provider.rpd_limit}]")
        return resp.choices[0].message.content
    except Exception as e:
        # 标记此提供商有问题，但不减配额
        print(f"[{provider.name}] 错误：{e}，尝试下一个")
        provider.rpd_used = provider.rpd_limit  # 临时标记为耗尽
        return smart_chat(message)
```

## 策略二：语义缓存（相似问题复用结果）

```python
import hashlib, json
from pathlib import Path

CACHE_DIR = Path(".cache/llm_responses")
CACHE_DIR.mkdir(parents=True, exist_ok=True)

def cache_key(message: str, model: str) -> str:
    """生成缓存 key"""
    content = f"{model}:{message}"
    return hashlib.md5(content.encode()).hexdigest()

def cached_chat(message: str, model: str = "llama-3.1-8b-instant",
                ttl_hours: int = 24) -> tuple[str, bool]:
    """
    带缓存的对话
    返回：(response, from_cache)
    """
    key = cache_key(message, model)
    cache_file = CACHE_DIR / f"{key}.json"

    # 检查缓存
    if cache_file.exists():
        data = json.loads(cache_file.read_text())
        age_hours = (time.time() - data["timestamp"]) / 3600
        if age_hours < ttl_hours:
            return data["response"], True

    # 调用 API
    response = smart_chat(message)

    # 写入缓存
    cache_file.write_text(json.dumps({
        "message": message,
        "response": response,
        "model": model,
        "timestamp": time.time(),
    }, ensure_ascii=False))

    return response, False


# 使用示例
resp, from_cache = cached_chat("什么是 API 限速？")
print(f"{'(缓存)' if from_cache else '(新请求)'} {resp}")
```

## 策略三：批量请求合并

```python
def batch_questions(questions: list[str], batch_size: int = 5) -> list[str]:
    """
    将多个独立问题合并为一次请求，节省 RPD
    适合：不需要上下文关联的问答
    """
    results = []
    for i in range(0, len(questions), batch_size):
        batch = questions[i:i+batch_size]
        prompt = "请依次回答以下 {} 个问题，每个答案用 [答案N] 格式标注：\n\n".format(len(batch))
        for j, q in enumerate(batch, 1):
            prompt += f"[问题{j}] {q}\n"

        response = smart_chat(prompt)
        # 解析结果（简单版）
        for j in range(1, len(batch) + 1):
            start = response.find(f"[答案{j}]")
            end = response.find(f"[答案{j+1}]") if j < len(batch) else len(response)
            if start != -1:
                answer = response[start + len(f"[答案{j}]"):end].strip()
                results.append(answer)
            else:
                results.append("")
    return results


# 10 个问题合并为 2 次请求
questions = [f"问题 {i}: 解释什么是 {['API', 'RPM', 'token', 'LLM', 'RAG'][i%5]}" for i in range(10)]
answers = batch_questions(questions, batch_size=5)
for q, a in zip(questions, answers):
    print(f"Q: {q[:30]}... → A: {a[:50]}...")
```

## 策略四：响应压缩（减少 TPD 消耗）

```python
COMPRESSION_SYSTEM_PROMPT = """你是一个简洁的助手。
规则：
1. 回答尽量精简，去掉不必要的客套语
2. 列表不超过 5 项
3. 代码示例简短但完整
4. 如非必要，不重复问题内容
"""

def compact_chat(message: str, max_tokens: int = 512) -> str:
    """精简模式，减少 token 消耗"""
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
        max_tokens=max_tokens,  # 限制输出长度
    )
    return resp.choices[0].message.content
```

## 每日配额使用建议

```
上午（大配额任务）：
  └─ Groq + Cerebras 14.4K RPD 做批量处理

白天（互动任务）：
  └─ Gemini 2.0 Flash 1.5K RPD 做视觉/对话

晚上（低配额任务）：
  └─ GitHub Models 150/50 RPD 做测试/评估
  └─ Mistral 做代码补全（2 RPM，但 1B token/月）

随时（本地/隐私）：
  └─ Ollama 无限，不消耗云端配额
```
