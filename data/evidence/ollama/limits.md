# Ollama — Rate Limits Evidence

**Last Verified:** 2026-04-27
**Source:** https://ollama.com + https://github.com/ollama/ollama

## Official Quotes

> "Ollama is a tool to run large language models locally. No rate limits, no API keys required."
> — Ollama README / official documentation (retrieved 2026-04-27)

## Structured Data

| Parameter | Value |
|-----------|-------|
| RPM | unlimited (local hardware) |
| RPD | unlimited (local hardware) |
| Cost | free (only electricity + hardware) |
| API key | none required |

### Popular Free Models (via `ollama pull`)

| Model | Size | Features |
|-------|------|---------|
| qwen2.5:7b | ~4GB | General purpose |
| qwen2.5:14b | ~8GB | Better quality |
| qwen2.5-coder:7b | ~4GB | Code specialized |
| qwen2.5-coder:32b | ~20GB | Best code |
| llama3.3:70b | ~40GB | High quality general |
| gemma3:9b | ~5GB | Google model |
| deepseek-r1:8b | ~5GB | Reasoning |
| deepseek-r1:32b | ~20GB | Better reasoning |
| llava:13b | ~8GB | Vision (image input) |
| llava-llama3 | ~5GB | Vision + Llama3 |
| hermes3:8b | ~5GB | Tool use / agents |
| hermes3:70b | ~40GB | Tool use, high quality |
| phi4 | ~9GB | Microsoft, reasoning |

## Notes

- Base URL: `http://localhost:11434` (default)
- No auth required for local use
- OpenAI-compatible API at `/v1/` endpoint
- Supports: text, vision (llava models), tool use (hermes models)
- Hardware requirements: 8GB RAM minimum for 7B models, GPU recommended
- `ollama serve` starts the server; `ollama pull <model>` downloads models
- Models stored at: `~/.ollama/models` (macOS/Linux) or `C:\Users\<user>\.ollama\models` (Windows)
