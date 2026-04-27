# GitHub Models — Rate Limits Evidence

**Last Verified:** 2026-04-27
**Source:** https://docs.github.com/en/github-models/prototyping-with-ai-models

## Official Quotes

> "Rate limits for GitHub Models free tier depend on model tier (low/high)."
> "Low-tier models: 15 requests per minute, 150 requests per day"
> "High-tier models: 10 requests per minute, 50 requests per day"
> "Input tokens per request: 8,000 | Output tokens per request: 4,000"
> — GitHub Models documentation (retrieved 2026-04-27)

## Structured Data

| Tier | RPM | RPD | Input/req | Output/req |
|------|-----|-----|-----------|------------|
| Low (small models) | 15 | 150 | 8,000 | 4,000 |
| High (large models) | 10 | 50 | 8,000 | 4,000 |

### Model Tier Classification (examples)
**Low tier:** Phi-3.5-mini, Phi-4-mini, Mistral-small, Llama-3.2-11B-vision
**High tier:** GPT-4o, GPT-4.1, Claude 3.5 Sonnet, Llama-3.3-70B, Mistral Large, DeepSeek-R1

## Notes

- Catalog: https://models.github.ai/catalog/models (or GitHub Marketplace → Models)
- Base URL: `https://models.github.ai/inference`
- Auth: GitHub PAT (Personal Access Token) with `models:read` scope
- OpenAI-compatible SDK supported
- Available through GitHub Marketplace; requires GitHub account
- Some models support vision input (e.g., GPT-4o, Llama-3.2-vision)
- Production use requires migrating to the model provider's API directly
