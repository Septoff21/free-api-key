> Mirror of [README.md](../../../README.md) (Chinese, canonical). If they drift, zh wins.

# Capability Matrix Index

> **Last Verified:** 2026-04-27 · Data from `providers.json`

[中文](../../zh/capability/00-index.md)

Find the best free model for your use case quickly.

## Matrix List

| Dimension | Document | One Line |
|---|---|---|
| 👁️ Vision Input (image analysis) | [01-vision-in.md](01-vision-in.md) | Which models can "see" images? |
| 🎨 Image Generation (image output) | [02-image-gen.md](02-image-gen.md) | Which models can "draw" images? |
| 🤖 Agent / Tool Use | [03-agent-tool-use.md](03-agent-tool-use.md) | Models for opencode / Cline / LangChain |
| 📄 Long Context | [04-long-context.md](04-long-context.md) | Long documents, large codebases |
| 💻 Code Specialized | [05-code.md](05-code.md) | Code generation, completion, debugging |
| 🧠 Reasoning / Chain-of-Thought | [06-reasoning.md](06-reasoning.md) | Math, logic, visible CoT |
| 🔊 Other Modalities | [07-other-modalities.md](07-other-modalities.md) | Audio input, video input |

## Combined Quick Reference

| Model | Vision | ImgGen | Tools | LongCtx | Code | Reason | Audio |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| `gemini-2.5-pro` | ✅ | — | ✅ | 1M | — | ✅ | ✅ |
| `gemini-2.5-flash` | ✅ | — | ✅ | 1M | — | ✅ | ✅ |
| `gemini-2.0-flash` | ✅ | — | ✅ | 1M | — | — | ✅ |
| `google/gemini-2.0-flash-exp:free`(OR) | ✅ | — | ✅ | 1M | — | — | — |
| `mistral-small-latest` | ✅ | — | ✅ | 128K | — | — | — |
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
| `codestral-latest`(Mistral) | — | — | ✅ | 256K | ✅ | — | — |
| `qwen2.5-coder:7b`(Ollama) | — | — | ✅ | 32K | ✅ | — | — |
| `microsoft/phi-4`(GH) | — | — | ✅ | 16K | ✅ | — | — |
| `qwen-qwq-32b`(Groq) | — | — | — | 128K | ✅ | ✅ | — |
| `deepseek-r1-distill-llama-70b`(Groq) | — | — | — | 128K | ✅ | ✅ | — |
| `deepseek/deepseek-r1`(GH) | — | — | — | 64K | ✅ | ✅ | — |
| `deepseek-r1:8b`(Ollama) | — | — | — | 32K | ✅ | ✅ | — |
| `qwen-3-235b-a22b`(Cerebras) | — | — | ✅ | 32K | — | ✅ | — |

> OR=OpenRouter · GH=GitHub Models · CF=Cloudflare · Groq · Cerebras · Mistral · Ollama
