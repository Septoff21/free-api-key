# 推理 / 思考链矩阵

> **Last Verified:** 2026-04-27

[English](../../en/capability/06-reasoning.md) | [← 返回索引](00-index.md)

## 什么是"推理模型"

推理模型在输出最终答案前，会生成可见的**思考过程（Chain-of-Thought, CoT）**，通常表现为 `<think>...</think>` 标签或独立 `reasoning_content` 字段。这类模型在数学、逻辑推导、多步骤编程问题上显著优于同规模普通模型。

## 支持推理的免费模型

| 提供商 | 模型 | CoT 格式 | 上下文 | RPD | 速度 | 备注 |
|---|---|---|---:|---:|:---:|---|
| **Gemini** | `gemini-2.5-pro` | `thinking` 字段 | 1M | 100 | 慢 | 最强推理，多模态 |
| **Gemini** | `gemini-2.5-flash` | `thinking` 字段 | 1M | 250 | 中 | 推理可选开关，性价比高 |
| **OpenRouter** | `qwen/qwq-32b:free` | `<think>` 标签 | 131K | 50/1000⁺ | 慢 | 纯推理模型 |
| **Groq** | `qwen-qwq-32b` | `<think>` 标签 | 131K | 1000 | 慢（推理） | LPU 加速推理 |
| **Groq** | `deepseek-r1-distill-llama-70b` | `<think>` 标签 | 131K | 1000 | 慢 | DeepSeek R1 蒸馏版 |
| **GitHub Models** | `deepseek/deepseek-r1` | `<think>` 标签 | 65K | 50 | 慢 | DeepSeek R1 完整版 |
| **Cerebras** | `qwen-3-235b-a22b` | Extended thinking | 32K | 14400 | 中 | 推理 + WSE 快速 |
| **Cloudflare** | `@cf/deepseek-ai/deepseek-r1-distill-qwen-32b` | `<think>` 标签 | 32K | ~200 | 慢 | CF 推理模型 |
| **Ollama** | `deepseek-r1:8b` | `<think>` 标签 | 32K | 无限 | 慢（CPU） | 本地推理 |
| **Ollama** | `deepseek-r1:32b` | `<think>` 标签 | 32K | 无限 | 慢 | 本地更强推理，~20GB |
| **Ollama** | `qwq:32b` | `<think>` 标签 | 32K | 无限 | 慢 | 本地 QwQ |

## 提取思考链

### Gemini（thinking 字段）

```python
import os
from openai import OpenAI

client = OpenAI(
    base_url="https://generativelanguage.googleapis.com/v1beta/openai",
    api_key=os.environ["GEMINI_API_KEY"],
)

resp = client.chat.completions.create(
    model="gemini-2.5-flash",
    messages=[{"role": "user", "content": "证明：√2 是无理数"}],
    # 开启思考模式（Gemini 2.5 Flash 默认关闭，可传 thinking_budget 参数）
)

# 思考内容在独立字段（原生 API）或在内容前缀中
print(resp.choices[0].message.content)
```

### DeepSeek R1 / QwQ（`<think>` 标签解析）

```python
import re, os
from openai import OpenAI

client = OpenAI(
    base_url="https://api.groq.com/openai/v1",
    api_key=os.environ["GROQ_API_KEY"],
)

resp = client.chat.completions.create(
    model="deepseek-r1-distill-llama-70b",
    messages=[{"role": "user", "content": "1+1=几？请详细推导"}],
    stream=False,
)

full = resp.choices[0].message.content

# 分离思考和答案
think_match = re.search(r"<think>(.*?)</think>", full, re.DOTALL)
thinking = think_match.group(1).strip() if think_match else ""
answer = re.sub(r"<think>.*?</think>", "", full, flags=re.DOTALL).strip()

print("【思考过程】")
print(thinking[:500] + "..." if len(thinking) > 500 else thinking)
print("\n【最终答案】")
print(answer)
```

### 本地推理（Ollama deepseek-r1）

```bash
ollama pull deepseek-r1:8b
```

```python
from openai import OpenAI
import re

client = OpenAI(base_url="http://localhost:11434/v1", api_key="ollama")

resp = client.chat.completions.create(
    model="deepseek-r1:8b",
    messages=[{"role": "user", "content": "用 Python 写一个二分查找，要求 O(log n)"}],
)

content = resp.choices[0].message.content
think = re.search(r"<think>(.*?)</think>", content, re.DOTALL)
print("思考：", think.group(1)[:200] if think else "（无）")
print("答案：", re.sub(r"<think>.*?</think>", "", content, flags=re.DOTALL).strip())
```

## 推理 vs 普通模型对比

| 任务类型 | 推荐推理模型 | 推荐普通模型 |
|---|---|---|
| 数学证明 / 竞赛题 | Gemini 2.5 Pro | ✗（普通模型效果差） |
| 多步逻辑推导 | DeepSeek R1 / QwQ | Llama 3.3 70B |
| 复杂代码 Debug | Gemini 2.5 Flash（推理模式） | DeepSeek V3 |
| 简单问答 | ✗（推理模型过慢） | 任意快速模型 |
| 实时对话 | ✗（推理模型延迟高） | llama-3.1-8b-instant |

## 选择建议

| 需求 | 推荐 |
|---|---|
| 最强推理质量 | Gemini 2.5 Pro（100 RPD 省着用） |
| 高频推理（每天>100次） | Cerebras qwen-3-235b（14.4K RPD） |
| 本地隐私推理 | Ollama deepseek-r1:8b |
| 推理 + 代码结合 | Groq deepseek-r1-distill（免费，快） |
| 预算 $0 + 高配额 | Groq qwq-32b（1K RPD，LPU 加速） |
