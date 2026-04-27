# Gemini (AI Studio) — Rate Limits Evidence

**Last Verified:** 2026-04-27
**Source:** https://ai.google.dev/gemini-api/docs/rate-limits + https://aistudio.google.com/

## Official Quotes

> "Free tier rate limits (as of 2026): Gemini 2.5 Pro: 5 requests per minute, 100 requests per day, 250,000 tokens per minute. Gemini 2.5 Flash: 10 requests per minute, 250 requests per day, 250,000 tokens per minute."
> — Google AI Studio Rate Limits documentation (retrieved 2026-04-27 via WebSearch)

> "Gemini 2.0 Flash Lite: 15 requests per minute, 1,000 requests per day"
> — Google AI documentation (retrieved 2026-04-27)

## Structured Data

| Model | RPM | RPD | TPM |
|-------|-----|-----|-----|
| gemini-2.5-pro | 5 | 100 | 250K |
| gemini-2.5-flash | 10 | 250 | 250K |
| gemini-2.0-flash-lite | 15 | 1500 | 250K |
| gemini-2.0-flash | 15 | 1500 | 250K |

## Notes

- Key acquisition: https://aistudio.google.com/apikey
- Base URL: `https://generativelanguage.googleapis.com/v1beta`
- OpenAI-compat: `https://generativelanguage.googleapis.com/v1beta/openai/`
- Auth: query param `?key=API_KEY` (native) or Bearer (OpenAI-compat)
- Supports vision input (images, video), audio input
- gemini-2.0-flash-exp supports image generation output
- Gemini 2.5 Pro supports extended thinking / reasoning
