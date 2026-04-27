# Groq — Rate Limits Evidence

**Last Verified:** 2026-04-27
**Source:** https://console.groq.com/docs/rate-limits

## Official Quotes

> "Developer (free) tier rate limits. These limits are enforced per API key."
> — Groq Console Rate Limits page (retrieved 2026-04-27)

## Structured Data (Free/Developer Tier)

| Model | RPM | RPD | TPM | TPD |
|-------|-----|-----|-----|-----|
| llama-3.1-8b-instant | 30 | 14,400 | 6,000 | 500,000 |
| llama-3.3-70b-versatile | 30 | 1,000 | 12,000 | 100,000 |
| llama-3.2-11b-vision-preview | 30 | 1,000 | 7,000 | 500,000 |
| qwen-qwq-32b | 30 | 1,000 | 6,000 | 100,000 |
| deepseek-r1-distill-llama-70b | 30 | 1,000 | 6,000 | 100,000 |
| gemma2-9b-it | 30 | 14,400 | 15,000 | 500,000 |
| whisper-large-v3 (audio) | 20 | 2,000 | — | 7,200 sec/day |
| llama-4-scout-17b-16e-instruct | 30 | 1,000 | 8,000 | 100,000 |

## Notes

- Base URL: `https://api.groq.com/openai/v1`
- OpenAI-compatible API
- Groq specializes in ultra-fast inference (LPU hardware)
- Vision model: llama-3.2-11b-vision-preview (image input)
- Audio transcription: whisper-large-v3 and whisper-large-v3-turbo
- Reasoning: qwq-32b, deepseek-r1-distill variants
