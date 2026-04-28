# 长上下文矩阵

> **Last Verified:** 2026-04-27

[English](../../en/capability/04-long-context.md) | [← 返回索引](00-index.md)

## 免费层最大上下文窗口排行

| 提供商 | 模型 | 上下文 | RPD | 备注 |
|---|---|---:|---:|---|
| **Gemini** | `gemini-2.5-pro/flash/2.0-flash` | **1 048 576** | 100-1500 | 业界最大免费上下文 |
| **OpenRouter** | `google/gemini-2.0-flash-exp:free` | **1 048 576** | 50/1000⁺ | OR 路由 Gemini |
| **Mistral** | `codestral-latest` | **256 000** | 无限† | 代码专用超长 |
| **Mistral** | `mistral-small/large-latest` | 131 072 | 无限† | 通用 128K |
| **OpenRouter** | `meta-llama/llama-3.3-70b-instruct:free` | 131 072 | 50/1000⁺ | Llama 128K |
| **Groq** | `llama-3.1-8b-instant` | 131 072 | 14 400 | 高 RPD 128K |
| **Groq** | `llama-3.3-70b-versatile` | 131 072 | 1 000 | 128K 高质量 |
| **Cerebras** | `llama3.3-70b` | 128 000 | 14 400 | 128K 超快 |
| **GitHub Models** | `openai/gpt-4o` / `gpt-4.1-mini` | 128 000 | 50 | GPT-4 128K |
| **Cloudflare** | `@cf/meta/llama-3.3-70b-instruct-fp8-fast` | 131 072 | ~200 | neurons 限制 |
| **Ollama** | `llama3.3:70b` | 131 072 | 无限 | 本地 128K（需 48GB RAM） |
| **Ollama** | `qwen2.5:7b` | 32 768 | 无限 | 本地 32K（8GB RAM） |

> 1M tokens ≈ 约 75 万汉字 ≈ 约 3000 页 A4 文档

## 长文档处理技巧

### 一次性整文档分析（Gemini 1M 上下文）

```python
import os
from openai import OpenAI

client = OpenAI(
    base_url="https://generativelanguage.googleapis.com/v1beta/openai",
    api_key=os.environ["GEMINI_API_KEY"],
)

def analyze_document(file_path: str, question: str) -> str:
    """一次性传入完整文档，不需要分块"""
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    print(f"文档大小：{len(content)} 字符（约 {len(content)//4} tokens）")

    resp = client.chat.completions.create(
        model="gemini-2.0-flash",  # 1M 上下文，1500 RPD
        messages=[
            {
                "role": "user",
                "content": f"以下是完整文档：\n\n{content}\n\n请回答：{question}",
            }
        ],
        max_tokens=4096,
    )
    return resp.choices[0].message.content

# 示例：分析完整代码库
result = analyze_document("project_code.txt", "总结这个项目的架构和主要功能")
print(result)
```

### 大代码库理解（Codestral 256K）

```python
import os, glob
from openai import OpenAI

client = OpenAI(
    base_url="https://api.mistral.ai/v1",
    api_key=os.environ["MISTRAL_API_KEY"],
)

def load_codebase(root_dir: str, extensions: list = None) -> str:
    """将代码库所有文件合并为单个字符串"""
    if extensions is None:
        extensions = [".py", ".js", ".ts", ".go", ".java", ".rs"]

    files = []
    for ext in extensions:
        files.extend(glob.glob(f"{root_dir}/**/*{ext}", recursive=True))

    parts = []
    for path in sorted(files)[:50]:  # 限制文件数量
        try:
            with open(path, "r", encoding="utf-8", errors="ignore") as f:
                code = f.read()
            parts.append(f"# File: {path}\n```\n{code}\n```")
        except Exception:
            continue

    return "\n\n".join(parts)

codebase = load_codebase("./src")
print(f"代码库大小：{len(codebase)} 字符")

resp = client.chat.completions.create(
    model="codestral-latest",
    messages=[
        {"role": "user", "content": f"分析以下代码库，找出潜在的 bug 和改进点：\n\n{codebase}"},
    ],
    max_tokens=4096,
)
print(resp.choices[0].message.content)
```

### 长文本摘要链（超出单次上下文时）

```python
import os
from openai import OpenAI

client = OpenAI(
    base_url="https://api.groq.com/openai/v1",
    api_key=os.environ["GROQ_API_KEY"],
)

def chunk_text(text: str, chunk_size: int = 50000) -> list[str]:
    """按字符数分块"""
    return [text[i:i+chunk_size] for i in range(0, len(text), chunk_size)]

def hierarchical_summary(long_text: str) -> str:
    """分层摘要：分块 → 摘要 → 合并再摘要"""
    chunks = chunk_text(long_text, 50000)
    print(f"分为 {len(chunks)} 块")

    # 第一层：每块摘要
    summaries = []
    for i, chunk in enumerate(chunks):
        resp = client.chat.completions.create(
            model="llama-3.1-8b-instant",  # 高 RPD，适合批量
            messages=[{"role": "user", "content": f"用 200 字摘要以下文本：\n\n{chunk}"}],
        )
        summaries.append(resp.choices[0].message.content)
        print(f"  块 {i+1}/{len(chunks)} 摘要完成")

    # 第二层：合并摘要再摘要
    combined = "\n\n".join(summaries)
    final = client.chat.completions.create(
        model="llama-3.3-70b-versatile",  # 高质量最终摘要
        messages=[{"role": "user", "content": f"综合以下分段摘要，写出整体摘要：\n\n{combined}"}],
    )
    return final.choices[0].message.content
```

## 上下文 vs 场景对应

| 场景 | 所需上下文 | 推荐提供商 |
|---|---:|---|
| 一封邮件回复 | ~1K | 任意 |
| 分析一个源文件 | ~10K | 任意 |
| 分析完整 PR（含 diff） | ~30K | Groq / Ollama |
| 分析整个代码库（小型） | ~100K | Groq / Cerebras / Mistral |
| 分析整本书 | ~300K | Gemini 2.5 Flash |
| 全代码库 + 文档 | ~500K | Gemini 2.5 Pro |
| 多本书 / 超长报告 | >500K | Gemini 2.5 Pro（1M） |
