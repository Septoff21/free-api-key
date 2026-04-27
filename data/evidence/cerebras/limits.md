# Cerebras — Rate Limits Evidence

**Last Verified:** 2026-04-27
**Source:** https://inference-docs.cerebras.ai/support/rate-limits

## Official Quotes

> "Free tier (Tier 1) rate limits per API key:"
> — Cerebras Inference Docs, Rate Limits page (retrieved 2026-04-27)

## Structured Data (Free Tier)

| Model | RPM | RPD | TPM | TPD |
|-------|-----|-----|-----|-----|
| llama3.1-8b | 30 | 14,400 | 60,000 | 1,000,000 |
| llama3.1-70b | 30 | 14,400 | 60,000 | 1,000,000 |
| llama3.3-70b | 30 | 14,400 | 60,000 | 1,000,000 |
| qwen-3-235b-a22b | 30 | 14,400 | 60,000 | 1,000,000 |
| zai-glm-4-plus-9b | 10 | 100 | 10,000 | 100,000 |

## Notes

- Base URL: `https://api.cerebras.ai/v1`
- OpenAI-compatible API
- Cerebras uses proprietary wafer-scale chips (WSE) for ultra-fast inference
- Free tier: 1M tokens/day is very generous
- 60K TPM = 60,000 tokens per minute (very fast throughput)
- No vision input, no image output (text only)
- Good for: high-throughput text generation, code generation, batch processing
