# OpenRouter — Rate Limits Evidence

**Last Verified:** 2026-04-27
**Source:** https://openrouter.ai/docs/api/reference/limits + https://openrouter.ai/faq

## Official Quotes

> "Free models are available to use without any credits. However, they do have rate limits."
> — OpenRouter FAQ (retrieved 2026-04-27)

> "Rate limits for free models: 20 requests/minute, 50 requests/day (without credits) or 1000 requests/day (with $10+ credits purchased)"
> — OpenRouter rate limits page (retrieved 2026-04-27, page content via WebSearch)

## Structured Data

| Parameter | Value |
|-----------|-------|
| RPM (free) | 20 |
| RPD (no credits) | 50 |
| RPD ($10+ credits) | 1000 |
| TPM | not published |
| TPD | not published |

## Notes

- OpenRouter aggregates many providers; free models rotate and may change.
- Free-tier RPD jumps from 50 → 1000 after adding $10 to account (one-time).
- "Free" model IDs are marked with `:free` suffix, e.g. `google/gemma-3-27b-it:free`.
- Base URL: `https://openrouter.ai/api/v1`
- Auth key endpoint: `GET https://openrouter.ai/api/v1/auth/key`
- OpenAI-compatible API (drop-in replacement).
