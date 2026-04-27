# Mistral — Rate Limits Evidence

**Last Verified:** 2026-04-27
**Source:** https://docs.mistral.ai/getting-started/quickstart/ + https://console.mistral.ai/

## Official Quotes

> "The Experiment plan is free and includes access to all Mistral models, with a rate limit of 2 requests per minute and 1 billion tokens per month."
> — Mistral La Plateforme documentation (retrieved 2026-04-27 via WebSearch)

> "Codestral is available free of charge on La Plateforme under the Experiment plan."
> — Mistral Codestral announcement / docs (retrieved 2026-04-27)

## Structured Data (Experiment / Free Tier)

| Parameter | Value |
|-----------|-------|
| RPM | 2 |
| TPM | not specified |
| Tokens/month | 1,000,000,000 (1B) |
| All models | ✓ (including Codestral) |

### Available Models (Free Tier)
- mistral-small-latest (Mistral Small 3.1)
- mistral-medium-latest (if available)
- mistral-large-latest (Mistral Large)
- codestral-latest (code model, `https://codestral.mistral.ai/v1`)
- open-mistral-nemo
- open-codestral-mamba

## Notes

- Key acquisition: https://console.mistral.ai/api-keys
- Base URL: `https://api.mistral.ai/v1`
- Codestral base URL: `https://codestral.mistral.ai/v1`
- OpenAI-compatible API
- 2 RPM is low — build retry logic with exponential backoff
- 1B tokens/month is very generous for solo developers
- Mistral Small 3.1 supports vision input (image analysis)
