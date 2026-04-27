# Cloudflare Workers AI — Rate Limits Evidence

**Last Verified:** 2026-04-27
**Source:** https://developers.cloudflare.com/workers-ai/platform/limits/

## Official Quotes

> "Workers AI free tier includes 10,000 neurons per day at no cost."
> — Cloudflare Workers AI documentation (retrieved 2026-04-27)

> "Neurons are Cloudflare's unit of AI compute. The number of neurons consumed depends on the model and the number of input/output tokens."
> — Cloudflare Workers AI — Pricing (retrieved 2026-04-27)

## Structured Data

| Parameter | Value |
|-----------|-------|
| Free neurons/day | 10,000 |
| RPM | not specified |
| RPD | not specified (neuron-gated) |

### Neuron Cost Estimates (approximate)
| Model | Neurons per 1K tokens |
|-------|----------------------|
| @cf/meta/llama-3.3-70b-instruct-fp8-fast | ~20-50 |
| @cf/meta/llama-3.2-11b-vision-instruct | ~30-60 |
| @cf/black-forest-labs/flux-1-schnell (image gen) | ~400 per image |
| @cf/openai/whisper (audio transcription) | varies |

### Available Free Models (selection)
**Text:**
- @cf/meta/llama-3.3-70b-instruct-fp8-fast
- @cf/meta/llama-3.2-3b-instruct
- @cf/google/gemma-3-12b-it
- @cf/qwen/qwen2.5-coder-32b-instruct
- @cf/deepseek-ai/deepseek-r1-distill-qwen-32b

**Vision:**
- @cf/meta/llama-3.2-11b-vision-instruct

**Image Generation:**
- @cf/black-forest-labs/flux-1-schnell
- @cf/stabilityai/stable-diffusion-xl-base-1.0

**Audio:**
- @cf/openai/whisper
- @cf/openai/whisper-large-v3-turbo

## Notes

- Base URL: `https://api.cloudflare.com/client/v4/accounts/{ACCOUNT_ID}/ai/run/{model}`
- Auth: Bearer API Token + Account ID required
- Account ID: found in Cloudflare Dashboard sidebar
- API Token: create at https://dash.cloudflare.com/profile/api-tokens using Workers AI template
- 10K neurons/day is roughly ~200-500 text completions depending on model/length
- Unique among providers: supports both image gen AND audio in free tier
