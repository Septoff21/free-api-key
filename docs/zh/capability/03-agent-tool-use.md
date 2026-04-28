# Agent / 工具调用矩阵

> **Last Verified:** 2026-04-27

[English](../../en/capability/03-agent-tool-use.md) | [← 返回索引](00-index.md)

## 工具调用分级说明

| 级别 | 含义 |
|---|---|
| **native** | 模型经过函数调用专项训练（OpenAI function calling 格式），结构化输出稳定 |
| **prompt** | 通过系统提示词模拟工具调用，JSON 输出不保证稳定，错误率较高 |
| **none** | 不支持工具调用 |

## 支持工具调用的免费模型

| 提供商 | 模型 | 级别 | 上下文 | RPD | 推荐场景 |
|---|---|:---:|---:|---:|---|
| **Gemini** | `gemini-2.5-pro` | native | 1M | 100 | 复杂多工具 Agent，推理辅助 |
| **Gemini** | `gemini-2.5-flash` | native | 1M | 250 | 生产级 Agent，速度/质量平衡 |
| **Gemini** | `gemini-2.0-flash` | native | 1M | 1500 | 高频 Agent 循环，多模态 |
| **OpenRouter** | `meta-llama/llama-3.3-70b-instruct:free` | native | 131K | 50/1000⁺ | 强通用 Agent |
| **OpenRouter** | `deepseek/deepseek-chat-v3-0324:free` | native | 65K | 50/1000⁺ | 代码+工具 Agent |
| **OpenRouter** | `mistralai/mistral-small-3.1:free` | native | 131K | 50/1000⁺ | 视觉+工具 Agent |
| **GitHub Models** | `openai/gpt-4o` | native | 128K | 50 | 高质量 Agent，GPT-4o 级别 |
| **GitHub Models** | `openai/gpt-4.1-mini` | native | 128K | 50 | 快速 Agent |
| **GitHub Models** | `meta/llama-3.3-70b-instruct` | native | 128K | 50 | 开源顶级 Agent |
| **GitHub Models** | `microsoft/phi-4` | native | 16K | 150 | 轻量高效 Agent |
| **GitHub Models** | `mistral-ai/mistral-small` | native | 32K | 150 | 视觉+工具 |
| **Groq** | `llama-3.1-8b-instant` | native | 131K | 14400 | **高频 Agent 内循环**（最高 RPD） |
| **Groq** | `llama-3.3-70b-versatile` | native | 131K | 1000 | 高质量 Agent |
| **Cerebras** | `llama3.1-8b` | native | 8K | 14400 | 超快 Agent（WSE 芯片） |
| **Cerebras** | `llama3.3-70b` | native | 128K | 14400 | 高质量超快 Agent |
| **Cerebras** | `qwen-3-235b-a22b` | native | 32K | 14400 | 推理增强 Agent |
| **Mistral** | `mistral-small-latest` | native | 131K | 无限† | 视觉+工具，GDPR |
| **Mistral** | `mistral-large-latest` | native | 131K | 无限† | 旗舰 Agent，2 RPM |
| **Mistral** | `codestral-latest` | native | 256K | 无限† | 代码 Agent，FIM |
| **Cloudflare** | `@cf/meta/llama-3.3-70b-instruct-fp8-fast` | native | 131K | ~200 | 多模态 Agent（neurons 限制） |
| **Cloudflare** | `@cf/qwen/qwen2.5-coder-32b-instruct` | native | 32K | ~200 | 代码 Agent |
| **Ollama** | `hermes3:8b` | native | 8K | 无限 | **本地 Agent 首选**，tool use 专训 |
| **Ollama** | `qwen2.5:7b` | native | 32K | 无限 | 本地通用 Agent |
| **Ollama** | `qwen2.5-coder:7b` | native | 32K | 无限 | 本地代码 Agent |
| **Ollama** | `llama3.3:70b` | native | 131K | 无限 | 本地高质量 Agent（需 48GB RAM） |

## Agent 框架兼容表

| 框架 | 协议 | 推荐模型 | 配置方式 |
|---|---|---|---|
| **opencode** | OpenAI API | Groq llama-3.1-8b / Ollama hermes3 | `OPENAI_BASE_URL` + `OPENAI_API_KEY` |
| **Cline** | OpenAI API | OpenRouter llama-3.3-70b:free / Gemini 2.5 Flash | 自定义 provider 配置 |
| **Continue** | OpenAI API | Mistral codestral / Ollama qwen2.5-coder | `config.json` models 配置 |
| **aider** | OpenAI API | Groq llama-3.3-70b / DeepSeek v3:free | `--openai-api-base` + `--model` |
| **LangChain** | OpenAI API | 任意 native tool_use 模型 | `ChatOpenAI(base_url=...)` |
| **CrewAI** | OpenAI API | Groq / Cerebras（高 RPD） | `LLM(base_url=...)` |
| **smolagents** | OpenAI API | Groq / Ollama hermes3 | `OpenAIServerModel(api_base=...)` |
| **Hermes / Ollama** | Ollama API | `hermes3:8b` / `hermes3:70b` | 原生 Ollama，函数调用 XML 格式 |

## opencode 配置示例

```json
// ~/.opencode/config.json
{
  "providers": {
    "groq": {
      "apiKey": "${GROQ_API_KEY}",
      "baseURL": "https://api.groq.com/openai/v1",
      "models": ["llama-3.1-8b-instant", "llama-3.3-70b-versatile"]
    },
    "ollama-local": {
      "apiKey": "ollama",
      "baseURL": "http://localhost:11434/v1",
      "models": ["hermes3:8b", "qwen2.5-coder:7b"]
    }
  }
}
```

## LangChain 示例

```python
from langchain_openai import ChatOpenAI
from langchain_core.tools import tool
import os

# 使用 Groq 作为 LangChain LLM
llm = ChatOpenAI(
    base_url="https://api.groq.com/openai/v1",
    api_key=os.environ["GROQ_API_KEY"],
    model="llama-3.3-70b-versatile",
)

@tool
def get_weather(city: str) -> str:
    """获取城市天气"""
    return f"{city} 今天晴，25°C"

llm_with_tools = llm.bind_tools([get_weather])
response = llm_with_tools.invoke("北京今天天气怎么样？")
print(response.tool_calls)
```

## Hermes3 本地 Agent（Ollama 原生格式）

```python
import requests

def hermes_tool_call(prompt: str, tools: list) -> dict:
    """使用 Ollama hermes3 进行工具调用"""
    resp = requests.post("http://localhost:11434/api/chat", json={
        "model": "hermes3:8b",
        "messages": [{"role": "user", "content": prompt}],
        "tools": tools,
        "stream": False,
    })
    return resp.json()["message"]

tools = [{
    "type": "function",
    "function": {
        "name": "search",
        "description": "搜索信息",
        "parameters": {
            "type": "object",
            "properties": {"query": {"type": "string"}},
            "required": ["query"],
        },
    },
}]

result = hermes_tool_call("搜索最新 AI 论文", tools)
print(result.get("tool_calls", []))
```

## 选择建议

| 需求 | 推荐 |
|---|---|
| 高频 Agent 内循环 | Groq `llama-3.1-8b-instant`（14.4K RPD，极速） |
| 高质量 + 高频 | Cerebras `llama3.3-70b`（14.4K RPD，WSE 快速） |
| 本地 Agent，隐私优先 | Ollama `hermes3:8b`（无限，tool-use 专训） |
| 视觉 + 工具组合 | Gemini 2.5 Flash 或 Mistral Small |
| 代码 Agent | Mistral Codestral / Ollama qwen2.5-coder |
| 无需注册，快速原型 | GitHub Models `openai/gpt-4o` |
