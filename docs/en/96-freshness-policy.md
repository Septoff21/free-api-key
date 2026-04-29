> Mirror of [docs/zh/96-freshness-policy.md](../../zh/96-freshness-policy.md) (Chinese, canonical). If they drift, zh wins.

# Data Freshness Policy

> This document describes how the project defines, detects, and handles stale data.

## Background

The free LLM API ecosystem changes extremely fast: rate limit adjustments, model deprecations, and privacy policy updates can happen at any time.  
Every provider entry in `providers.json` has a `last_verified` field recording the date of the last human-verified review.

## Freshness Levels

| `last_verified` age | Level | Icon | Behavior |
|---|---|:-:|---|
| ≤ 30 days | Fresh | ✅ | Displayed normally, no warnings |
| 31–60 days | Aging | 🟡 | Docs suggest "consider reviewing" |
| 61–90 days | Stale | 🟠 | CI warning, triggers freshness issue |
| > 90 days | Outdated | 🔴 | CI **fails**, PR cannot merge |

## Automated Detection

### 1. Weekly Official Page Snapshots (`freshness-check.yml`)

Runs every Monday at 08:00 UTC:
- Fetches `limits_url` and `policy_url` for each provider in `providers.json`
- Computes SHA-256 hash of page content
- Compares against last week's snapshot
- Change detected → auto-opens an issue with label `data-update-needed`

Snapshots stored in `data/snapshots/<provider>.<type>.json`:
```json
{
  "provider": "groq",
  "page_type": "limits",
  "url": "https://console.groq.com/docs/rate-limits",
  "fetched_at": "2026-04-28T08:00:00Z",
  "sha256": "abc123...",
  "size_bytes": 15234
}
```

### 2. PR Staleness Gate (`staleness-gate.yml`)

Triggers on all PRs touching `providers.json`:
- Checks whether any provider's `last_verified` exceeds 90 days
- If yes: PR check fails — **data must be updated before merging**

### 3. Local Checks

```bash
# Check for stale data (90-day gate)
node scripts/check-staleness.mjs

# Warn only, don't fail (60-day warning)
node scripts/check-staleness.mjs --max-age 60 --warn-only

# JSON output (for CI integration)
node scripts/check-staleness.mjs --json
```

## Data Update Process

When a `data-update-needed` issue appears:

```
1. Review the snapshot diff in the issue (which provider, which page)
2. Visit the official page to confirm what changed
3. Update providers.json:
   - Modify changed fields (e.g., rpm, rpd, model names)
   - Update last_verified to today's date (YYYY-MM-DD)
4. Update docs/zh/0X-*.md (user-facing content)
5. Update docs/en/0X-*.md (English mirror)
6. Update data/evidence/<provider>/limits.md (record new source)
7. Update CHANGELOG.md: ## [Unreleased] ### Changed
8. Create PR, reference the issue
9. After PR passes staleness gate, merge
10. Close the issue
```

## For Contributors: Submitting Data Updates

1. Fork the repository
2. Follow the update process above
3. Run `node scripts/check-staleness.mjs` — confirm no errors
4. Submit a PR (fill in the Sources table in the PR checklist)

**Not sure if the data is accurate?** Open a `data-outdated` issue first and let maintainers verify before merging.

## Archiving Deprecated Providers

Documentation for providers that have shut down or removed their free tier is moved to `docs/zh/_archive/` — preserved for historical reference, not deleted outright.

## Why 90 Days is the Hard Limit

- Most LLM API service policies update roughly quarterly
- 90 days = one quarter; beyond this, data reliability drops significantly
- Shorter thresholds (e.g., 30 days) create excessive pressure on maintainers
- Longer thresholds (e.g., 180 days) let users act on outdated data, damaging trust
