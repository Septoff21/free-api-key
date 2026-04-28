# Recipe：LiteLLM 多提供商路由 & 自动故障转移

> **难度：** 中级 · **预计时间：** 15 分钟 · **Last Verified:** 2026-04-27

[English](../../en/recipes/03-litellm-router.md)

## 场景

用 LiteLLM 统一管理多个免费 API Key，当某个提供商配额用完或报错时，自动切换到备用提供商。

## 安装

```bash
pip install litellm
```

## LiteLLM 配置文件

```yaml
# configs/litellm_config.yaml
model_list:
  # ── 主力（高 RPD）─────────────────────────────────────────
  - model_name: fast-chat    # 别名：高频任务用
    litellm_params:
      model: groq/llama-3.1-8b-instant
      api_key: os.environ/GROQ_API_KEY
      api_base: https://api.groq.com/openai/v1
      rpm: 30
      tpm: 6000

  - model_name: fast-chat    # 同别名第二优先（自动 fallback）
    litellm_params:
      model: cerebras/llama3.1-8b
      api_key: os.environ/CEREBRAS_API_KEY
      api_base: https://api.cerebras.ai/v1
      rpm: 30
      tpm: 60000

  - model_name: fast-chat    # 本地备用
    litellm_params:
      model: ollama/qwen2.5:7b
      api_base: http://localhost:11434

  # ── 高质量（大模型）──────────────────────────────────────
  - model_name: quality-chat
    litellm_params:
      model: groq/llama-3.3-70b-versatile
      api_key: os.environ/GROQ_API_KEY
      rpm: 30
      rpd: 1000

  - model_name: quality-chat
    litellm_params:
      model: openrouter/meta-llama/llama-3.3-70b-instruct:free
      api_key: os.environ/OPENROUTER_API_KEY

  - model_name: quality-chat
    litellm_params:
      model: ollama/llama3.3:70b
      api_base: http://localhost:11434

  # ── 视觉 ──────────────────────────────────────────────────
  - model_name: vision
    litellm_params:
      model: gemini/gemini-2.0-flash
      api_key: os.environ/GEMINI_API_KEY
      rpm: 15
      rpd: 1500

  - model_name: vision
    litellm_params:
      model: github/openai/gpt-4o
      api_key: os.environ/GITHUB_TOKEN
      rpm: 10
      rpd: 50

  # ── 代码 ──────────────────────────────────────────────────
  - model_name: code
    litellm_params:
      model: mistral/codestral-latest
      api_key: os.environ/MISTRAL_API_KEY
      api_base: https://codestral.mistral.ai/v1
      rpm: 2

  - model_name: code
    litellm_params:
      model: ollama/qwen2.5-coder:7b
      api_base: http://localhost:11434

router_settings:
  routing_strategy: least-busy   # 按当前负载选择
  num_retries: 3
  retry_after: 5                  # 失败后等 5 秒重试
  allowed_fails: 2                # 2 次失败后切换下一个
  cooldown_time: 60               # 失败的提供商冷却 60 秒
```

## Python 使用

```python
"""
litellm_router.py — 多提供商智能路由

依赖：pip install litellm pyyaml
"""

import os
import litellm
from litellm import Router

# 初始化路由器
router = Router(
    model_list=[
        # 快速聊天：Groq → Cerebras → Ollama
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
        # 高质量：Groq 70B → OpenRouter → Ollama
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
    """发送消息，自动路由和故障转移"""
    resp = router.completion(
        model=model_alias,
        messages=[{"role": "user", "content": message}],
    )
    return resp.choices[0].message.content


def chat_with_fallback(message: str) -> str:
    """先尝试高质量，失败则退回快速"""
    try:
        return chat(message, "quality-chat")
    except Exception as e:
        print(f"高质量模型失败：{e}，退回快速模型")
        return chat(message, "fast-chat")


# ─── 流式输出 ──────────────────────────────────────────────────────────────────

def stream_chat(message: str, model_alias: str = "fast-chat"):
    """流式输出版本"""
    for chunk in router.completion(
        model=model_alias,
        messages=[{"role": "user", "content": message}],
        stream=True,
    ):
        delta = chunk.choices[0].delta.content
        if delta:
            print(delta, end="", flush=True)
    print()  # 换行


# ─── 使用示例 ──────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    # 基础使用
    print(chat("用一句话介绍 LiteLLM"))

    # 流式输出
    print("\n流式输出：")
    stream_chat("解释什么是 API 限速")

    # 故障转移
    result = chat_with_fallback("给我 3 个 Python 学习建议")
    print(f"\n结果：{result}")
```

## 启动 LiteLLM Proxy Server

如果想让现有 OpenAI 客户端直接用（无需改代码）：

```bash
# 安装
pip install litellm[proxy]

# 启动 proxy（使用配置文件）
litellm --config configs/litellm_config.yaml --port 4000

# 现在所有 OpenAI 客户端可以直接指向 proxy：
# base_url="http://localhost:4000"
# api_key="sk-anything"  # proxy 不验证 key
```

```python
# 原有 OpenAI 代码，只改 base_url
from openai import OpenAI

client = OpenAI(
    base_url="http://localhost:4000",
    api_key="sk-anything",
)
resp = client.chat.completions.create(
    model="fast-chat",   # LiteLLM 别名
    messages=[{"role": "user", "content": "你好"}],
)
```

## 配额用尽自动降级策略

```python
# 按优先级和每日配额顺序排列
PRIORITY_MODELS = [
    ("cerebras",   "llama3.3-70b",                  14400),  # 最高配额
    ("groq",       "llama-3.1-8b-instant",           14400),  # 极速
    ("groq",       "llama-3.3-70b-versatile",         1000),
    ("openrouter", "meta-llama/llama-3.3-70b-instruct:free", 1000),
    ("ollama",     "qwen2.5:7b",                      None),  # 无限
]
```
