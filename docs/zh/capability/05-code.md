# 代码专项矩阵

> **Last Verified:** 2026-04-27

[English](../../en/capability/05-code.md) | [← 返回索引](00-index.md)

## 代码专项免费模型

| 提供商 | 模型 | 上下文 | FIM | 工具调用 | RPD | 评分† |
|---|---|---:|:---:|:---:|---:|:---:|
| **Mistral** | `codestral-latest` | 256K | ✅ | ✅ | 无限‡ | ⭐⭐⭐⭐⭐ |
| **Ollama** | `qwen2.5-coder:32b` | 32K | ✅ | ✅ | 无限 | ⭐⭐⭐⭐⭐ |
| **Cloudflare** | `@cf/qwen/qwen2.5-coder-32b-instruct` | 32K | ✅ | ✅ | ~200 | ⭐⭐⭐⭐ |
| **Ollama** | `qwen2.5-coder:7b` | 32K | ✅ | ✅ | 无限 | ⭐⭐⭐⭐ |
| **GitHub Models** | `microsoft/phi-4` | 16K | — | ✅ | 150 | ⭐⭐⭐⭐ |
| **OpenRouter** | `deepseek/deepseek-chat-v3-0324:free` | 65K | — | ✅ | 50/1000⁺ | ⭐⭐⭐⭐ |
| **Groq** | `deepseek-r1-distill-llama-70b` | 131K | — | — | 1000 | ⭐⭐⭐⭐ |
| **Groq** | `qwen-qwq-32b` | 131K | — | — | 1000 | ⭐⭐⭐⭐ |
| **Gemini** | `gemini-2.5-pro` | 1M | — | ✅ | 100 | ⭐⭐⭐⭐⭐ |
| **Gemini** | `gemini-2.5-flash` | 1M | — | ✅ | 250 | ⭐⭐⭐⭐ |

> † 综合代码能力评估，参考 HumanEval / LiveCodeBench 等公开基准
> ‡ Mistral 以 token/月 计量（1B tok/月），2 RPM

## 场景一：代码补全（FIM Fill-in-Middle）

FIM 支持在光标位置"中间插入"代码，是接入编辑器插件的核心能力。

### Codestral FIM（Mistral）

```python
import os, requests

def fim_complete(prefix: str, suffix: str, model: str = "codestral-latest") -> str:
    """
    Fill-in-Middle 代码补全
    prefix: 光标前的代码
    suffix: 光标后的代码
    """
    resp = requests.post(
        "https://codestral.mistral.ai/v1/fim/completions",
        headers={
            "Authorization": f"Bearer {os.environ['MISTRAL_API_KEY']}",
            "Content-Type": "application/json",
        },
        json={
            "model": model,
            "prompt": prefix,
            "suffix": suffix,
            "max_tokens": 256,
            "temperature": 0.0,
            "stop": ["\n\n", "```"],
        },
    )
    resp.raise_for_status()
    return resp.json()["choices"][0]["message"]["content"]

# 示例
prefix = """def binary_search(arr: list, target: int) -> int:
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
"""
suffix = """
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1"""

completion = fim_complete(prefix, suffix)
print(completion)
# 期望输出：return mid
```

### Qwen2.5-Coder FIM（Ollama 本地）

```python
import requests

def ollama_fim(prefix: str, suffix: str, model: str = "qwen2.5-coder:7b") -> str:
    """Ollama FIM 补全（qwen2.5-coder 使用特殊 token）"""
    prompt = f"<|fim_prefix|>{prefix}<|fim_suffix|>{suffix}<|fim_middle|>"
    resp = requests.post("http://localhost:11434/api/generate", json={
        "model": model,
        "prompt": prompt,
        "stream": False,
        "options": {"temperature": 0.0, "stop": ["<|endoftext|>"]},
    })
    return resp.json()["response"]
```

## 场景二：代码生成与调试

```python
import os
from openai import OpenAI

# 使用 Groq QwQ-32B 推理模型调试
client = OpenAI(
    base_url="https://api.groq.com/openai/v1",
    api_key=os.environ["GROQ_API_KEY"],
)

def debug_code(code: str, error: str) -> str:
    resp = client.chat.completions.create(
        model="deepseek-r1-distill-llama-70b",  # 推理模型找 bug 更准
        messages=[{
            "role": "user",
            "content": f"以下代码报错，请分析原因并给出修复方案：\n\n```python\n{code}\n```\n\n错误信息：\n```\n{error}\n```",
        }],
    )
    return resp.choices[0].message.content

# 示例
code = """
def divide(a, b):
    return a / b

result = divide(10, 0)
"""
error = "ZeroDivisionError: division by zero"
print(debug_code(code, error))
```

## 场景三：接入编辑器（Continue 插件）

```json
// ~/.continue/config.json
{
  "models": [
    {
      "title": "Codestral (Mistral)",
      "provider": "mistral",
      "model": "codestral-latest",
      "apiKey": "${MISTRAL_API_KEY}"
    },
    {
      "title": "Qwen2.5-Coder (Local)",
      "provider": "ollama",
      "model": "qwen2.5-coder:7b"
    }
  ],
  "tabAutocompleteModel": {
    "title": "Codestral FIM",
    "provider": "mistral",
    "model": "codestral-latest",
    "apiKey": "${MISTRAL_API_KEY}"
  }
}
```

## 按语言推荐

| 语言 | 推荐模型 | 理由 |
|---|---|---|
| Python | Codestral / qwen2.5-coder | 训练数据充足，FIM 补全准确 |
| JavaScript / TypeScript | Codestral / phi-4 | 微软生态优化 |
| Go | qwen2.5-coder / Gemini 2.5 | 系统级语言理解好 |
| Rust | Gemini 2.5 Pro | 复杂生命周期推理需要推理能力 |
| SQL | DeepSeek V3 / Codestral | 结构化数据理解强 |
| Shell / Bash | llama-3.3-70b / qwen2.5 | 通用脚本能力足够 |

## 选择建议

| 需求 | 推荐 |
|---|---|
| 编辑器 Tab 补全 | Codestral（Mistral，FIM，256K） |
| 本地代码补全（隐私） | Ollama qwen2.5-coder:7b 或 :32b |
| 代码 Debug + 推理 | Groq deepseek-r1 / Gemini 2.5 Flash |
| 大型代码库分析 | Gemini 2.5 Pro（1M 上下文） |
| 高频代码审查 | Groq llama-3.3-70b（1K RPD）或 Cerebras（14.4K RPD） |
