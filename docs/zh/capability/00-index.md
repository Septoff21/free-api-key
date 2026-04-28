# 能力矩阵索引

> **Last Verified:** 2026-04-27 · 数据来自 `providers.json`

[English](../../en/capability/00-index.md)

按场景快速找到最合适的免费模型。

## 矩阵列表

| 维度 | 文档 | 一句话 |
|---|---|---|
| 👁️ 视觉输入（图片分析） | [01-vision-in.md](01-vision-in.md) | 哪些模型能"看"图片？ |
| 🎨 图片生成（图片输出） | [02-image-gen.md](02-image-gen.md) | 哪些模型能"画"图片？ |
| 🤖 Agent / 工具调用 | [03-agent-tool-use.md](03-agent-tool-use.md) | 适合 opencode / Cline / LangChain 的模型 |
| 📄 长上下文 | [04-long-context.md](04-long-context.md) | 处理长文档、大代码库 |
| 💻 代码专项 | [05-code.md](05-code.md) | 代码生成、补全、调试 |
| 🧠 推理 / 思考链 | [06-reasoning.md](06-reasoning.md) | 数学、逻辑、CoT 可见 |
| 🔊 其他模态 | [07-other-modalities.md](07-other-modalities.md) | 音频输入、音频输出 |

## 综合速查

| 模型 | 视觉 | 图生 | 工具 | 长文 | 代码 | 推理 | 音频 |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| `gemini-2.5-pro` | ✅ | — | ✅ | 1M | — | ✅ | ✅ |
| `gemini-2.5-flash` | ✅ | — | ✅ | 1M | — | ✅ | ✅ |
| `gemini-2.0-flash` | ✅ | — | ✅ | 1M | — | — | ✅ |
| `google/gemini-2.0-flash-exp:free`(OR) | ✅ | — | ✅ | 1M | — | — | — |
| `mistral-small-latest` | ✅ | — | ✅ | 128K | — | — | — |
| `mistral-ai/mistral-small`(GH) | ✅ | — | ✅ | 32K | — | — | — |
| `openai/gpt-4o`(GH) | ✅ | — | ✅ | 128K | — | — | — |
| `llama-3.2-11b-vision-preview`(Groq) | ✅ | — | — | 8K | — | — | — |
| `@cf/llama-3.2-11b-vision`(CF) | ✅ | — | — | 8K | — | — | — |
| `@cf/flux-1-schnell`(CF) | — | ✅ | — | — | — | — | — |
| `whisper-large-v3`(Groq) | — | — | — | — | — | — | ✅ |
| `@cf/whisper`(CF) | — | — | — | — | — | — | ✅ |
| `llama-3.3-70b-instruct:free`(OR) | — | — | ✅ | 128K | — | — | — |
| `llama-3.1-8b-instant`(Groq) | — | — | ✅ | 128K | — | — | — |
| `llama3.3-70b`(Cerebras) | — | — | ✅ | 128K | — | — | — |
| `hermes3:8b`(Ollama) | — | — | ✅ | 8K | — | — | — |
| `qwen2.5:7b`(Ollama) | — | — | ✅ | 32K | — | — | — |
| `codestral-latest`(Mistral) | — | — | ✅ | 256K | ✅ | — | — |
| `qwen2.5-coder:7b`(Ollama) | — | — | ✅ | 32K | ✅ | — | — |
| `@cf/qwen2.5-coder-32b`(CF) | — | — | ✅ | 32K | ✅ | — | — |
| `microsoft/phi-4`(GH) | — | — | ✅ | 16K | ✅ | — | — |
| `gemini-2.5-pro`(推理) | ✅ | — | ✅ | 1M | — | ✅ | ✅ |
| `qwen-qwq-32b`(Groq) | — | — | — | 128K | ✅ | ✅ | — |
| `deepseek-r1-distill-llama-70b`(Groq) | — | — | — | 128K | ✅ | ✅ | — |
| `deepseek/deepseek-r1`(GH) | — | — | — | 64K | ✅ | ✅ | — |
| `deepseek-r1:8b`(Ollama) | — | — | — | 32K | ✅ | ✅ | — |
| `@cf/deepseek-r1-distill-qwen-32b`(CF) | — | — | — | 32K | ✅ | ✅ | — |
| `qwen-3-235b-a22b`(Cerebras) | — | — | ✅ | 32K | — | ✅ | — |

> OR=OpenRouter · GH=GitHub Models · CF=Cloudflare · Groq · Cerebras · Mistral · Ollama
