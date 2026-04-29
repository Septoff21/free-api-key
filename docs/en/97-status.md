> Mirror of [docs/zh/97-status.md](../../zh/97-status.md) (Chinese, canonical). If they drift, zh wins.

# Project Health Status

> **Auto-updated** — GitHub Actions runs probes every Monday. Results are written to `data/health/`.
> This page reflects the most recent probe run. It is **not real-time** — issues appearing between weekly runs won't be reflected until the next Monday.

## Current Status

| Provider | Status | Last Latency | Last Probe | Probe Kind |
|---|:-:|---:|---|---|
| OpenRouter | ⏳ | — | not run | minimal_chat |
| Gemini | ⏳ | — | not run | minimal_chat |
| Groq | ⏳ | — | not run | minimal_chat |
| Cerebras | ⏳ | — | not run | minimal_chat |
| GitHub Models | ⏳ | — | not run | minimal_chat |
| Mistral | ⏳ | — | not run | minimal_chat |
| Cloudflare | ⏳ | — | not run | minimal_chat |
| Ollama | ⏳ | — | local probe, CI skips | local_tags |

> **Legend:** ✅ OK · ❌ Failed · ⏳ Not tested / skipped

## Status Badge

[![Providers Health](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/YOUR_USERNAME/free-api-key/main/data/health/badge.json)](97-status.md)

> Replace `YOUR_USERNAME` with your GitHub username for the badge to display live in README.

## Probe Design

Each probe sends only:

```
model: <smallest available model>
messages: [{"role": "user", "content": "hi"}]
max_tokens: 1
```

**≤ 5 tokens per probe, once per week** — negligible noise against any provider's free quota.

### Models Used Per Provider

| Provider | Probe Model | Reason |
|---|---|---|
| OpenRouter | `deepseek/deepseek-chat:free` | Permanently free route |
| Gemini | `gemini-2.0-flash` | Highest RPD |
| Groq | `llama-3.1-8b-instant` | Smallest model, minimal quota |
| Cerebras | `llama3.1-8b` | Smallest model |
| GitHub Models | `openai/gpt-4o-mini` | Low-tier 150 RPD |
| Mistral | `open-mistral-7b` | Smallest model |
| Cloudflare | `@cf/meta/llama-3.1-8b-instruct` | Smallest model |
| Ollama | GET `/api/tags` | Lists local models only, no inference |

## History Logs

Raw JSONL logs are stored in `data/health/<provider>.jsonl`, one record per line:

```json
{"provider":"groq","ok":true,"status_code":200,"latency_ms":312,"error_class":null,"skipped":false,"timestamp":"2026-04-28T09:01:15.000Z","probe_kind":"minimal_chat"}
```

Field reference:

| Field | Description |
|---|---|
| `ok` | `true` = 200-299 response; `false` = error |
| `status_code` | HTTP status (null on network error) |
| `latency_ms` | Milliseconds from request sent to response received |
| `error_class` | `auth` / `rate_limit` / `not_found` / `network` / `timeout` / `null` (success) |
| `skipped` | `true` = provider key not configured, probe skipped |

## My requests fail but status shows ✅ — why?

1. **Probes are point-in-time** — we send one per week. Issues between probes aren't reflected until the next run.
2. **Probes are extremely lightweight** (1 token); your real requests may hit other limits (RPM, TPD, etc.).
3. Check [Troubleshooting](../zh/93-troubleshooting.md) if it exists.
4. Report via [GitHub Issues](../../issues) with the error message and provider name.

## Contributors: Running Probes Locally

```bash
# Fill in your own test keys
cp configs/.env.example .env
# Edit .env with at least one key

# Run local probes
node scripts/test-real-keys.mjs

# Run and write logs
node scripts/test-real-keys.mjs --append-logs

# Dry-run (no real requests)
node scripts/test-real-keys.mjs --dry-run
```

See [Maintenance docs](../zh/95-maintenance.md) for maintainer setup.
