> Mirror of [docs/zh/95-maintenance.md](../../zh/95-maintenance.md) (Chinese, canonical). If they drift, zh wins.

# Maintainer Handbook

> This document is for project maintainers (people with repo write access).
> Regular contributors, see [CONTRIBUTING.md](../../CONTRIBUTING.md).

---

## 1. Maintenance Cadence

| Frequency | Task |
|---|---|
| **Weekly** | GitHub Actions auto-runs `real-key-smoke` (Monday 09:00 UTC); review health log; handle failure issues |
| **Monthly** | Check `providers.json` data for staleness (downed models, rate limit changes); update `last_verified` fields |
| **Quarterly** | Rotate probe keys (every 3 months); check `CHANGELOG.md` for unreleased entries |
| **Pre-release** | Run `node scripts/test-real-keys.mjs --append-logs` locally to validate all probes |

---

## 2. Enabling Real Key Smoke (First-Time Setup)

### 2.1 Prepare Dedicated Test Accounts

> ⚠️ **Strongly recommended**: Use accounts created specifically for testing, not personal daily accounts. If a key leaks, blast radius is contained.

Create or designate a test key for each of the 8 providers:

| Provider | Registration | Suggested Key Name |
|---|---|---|
| OpenRouter | https://openrouter.ai/keys | `free-api-key-smoke` |
| Gemini | https://aistudio.google.com/app/apikey | `free-api-key-smoke` |
| Groq | https://console.groq.com/keys | `free-api-key-smoke` |
| Cerebras | https://cloud.cerebras.ai/platform/keys | `free-api-key-smoke` |
| GitHub Models | https://github.com/settings/tokens | scope: `models:read` |
| Mistral | https://console.mistral.ai/api-keys | `free-api-key-smoke` |
| Cloudflare | https://dash.cloudflare.com/profile/api-tokens | `free-api-key-smoke` |

> Missing keys cause that provider to show "skipped" — **does not affect other providers**.

### 2.2 Add GitHub Secrets

Repo → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

| Secret Name | Provider | Value |
|---|---|---|
| `OPENROUTER_TEST_KEY` | OpenRouter | `sk-or-v1-...` |
| `GEMINI_TEST_KEY` | Gemini | `AIza...` |
| `GROQ_TEST_KEY` | Groq | `gsk_...` |
| `CEREBRAS_TEST_KEY` | Cerebras | `csk-...` |
| `GITHUB_MODELS_TEST_TOKEN` | GitHub Models | `ghp_...` (PAT with `models:read`) |
| `MISTRAL_TEST_KEY` | Mistral | `...` |
| `CLOUDFLARE_TEST_ACCOUNT_ID` | Cloudflare | Account ID (32-char hex, not the token) |
| `CLOUDFLARE_TEST_API_TOKEN` | Cloudflare | API Token |

### 2.3 Manually Trigger a Verification Run

GitHub → Actions → **Real Key Smoke Test** → **Run workflow** → Run

Expected output:
- ✓ Configured providers show `200 (XXms)`
- `–` Unconfigured providers show `skipped`
- After the run, a commit appears in `data/health/`

---

## 3. Handling Smoke Failures

### 3.1 Failure Issue Format

CI auto-creates issues titled: `[smoke] Provider failure — YYYY-MM-DD`, labeled `smoke-failure`.

### 3.2 Diagnosis

```
error_class = auth
  → Key expired or revoked → Go to provider console, revoke + regenerate → Update GitHub Secret

error_class = not_found (404)
  → Provider changed API path → Check provider changelog → Update scripts/lib/probe.mjs

error_class = rate_limit (429)
  → Probe key hit rate limit (once/week shouldn't trigger this) → Check if other jobs use the same key

error_class = network
  → GitHub Actions runner can't reach the provider → Likely temporary regional issue → Wait for next run

error_class = timeout (>30s)
  → Provider responding very slowly → Check provider status page → Update latency baseline
```

### 3.3 Updating `providers.json`

If a provider changed its endpoint or model names:

1. Update the provider entry in `providers.json`
2. Update `data/evidence/<provider>/limits.md` or `privacy.md` (record new source)
3. Update the probe URL/model in `scripts/lib/probe.mjs` if needed
4. Update the `last_verified` field
5. Update `CHANGELOG.md`
6. Commit + PR (don't push directly to main)

---

## 4. Key Security and Rotation

### 4.1 Security Guarantees

- GitHub Secrets are encrypted at rest, injected only at workflow runtime
- Workflow has `if: github.repository == ...` guard blocking fork access to upstream secrets
- Workflow never prints env vars or response bodies
- Each probe consumes ≤ 1 token; annual total ≤ 416 tokens (8 providers × 52 runs)

### 4.2 Key Leak Response

```
1. Immediately revoke at the provider console (each provider's key management page)
2. Delete the GitHub Secret from repo settings
3. Regenerate the key → update the GitHub Secret
4. Check git history: git log --all -p | grep -i "sk-or\|gsk_\|AIza"
   If a key appears in a commit, it's already leaked — revoke immediately
5. Consider running gitleaks: gitleaks detect --source . --report-path gitleaks.json
```

### 4.3 Recommended Rotation Schedule

Rotate probe keys every **3 months** (set a calendar reminder).

---

## 5. Releasing a New Version

```bash
# 1. Confirm all phases complete, CHANGELOG [Unreleased] section is populated
cat CHANGELOG.md

# 2. Run full probe locally
node scripts/test-real-keys.mjs --append-logs

# 3. Run key checker
npm run check

# 4. Validate schema
node -e "
  const Ajv = require('ajv');
  const ajv = new Ajv({strict: false});
  const schema = require('./providers.schema.json');
  const data   = require('./providers.json');
  const valid  = ajv.validate(schema, data);
  console.log(valid ? '✓ schema valid' : ajv.errors);
"

# 5. Update CHANGELOG: rename [Unreleased] → [x.y.z] - YYYY-MM-DD
# 6. Commit + Tag
git add -A
git commit -m "release: v1.0.0"
git tag -a v1.0.0 -m "v1.0.0 - first stable release"
git push && git push --tags
```

### Version Number Rules (Semantic Versioning)

- **Major** (x.0.0): Breaking structural changes (e.g., incompatible `providers.json` schema upgrade)
- **Minor** (0.x.0): New provider, new documentation chapters
- **Patch** (0.0.x): Data updates, bug fixes, copy changes

---

## 6. Link Checking (Manual)

Periodically check for dead external links in docs:

```bash
npm install -g markdown-link-check
markdown-link-check docs/zh/01-openrouter.md
find docs -name "*.md" | xargs -I{} markdown-link-check {} 2>&1 | grep -E "ERROR|DEAD"
```

---

## 7. Adding a New Provider

1. Add entry to `providers.json` (follow schema)
2. Write `data/evidence/<provider>/limits.md` + `privacy.md` (cite official sources)
3. Create `docs/zh/<NN>-<name>.md` + `docs/en/<NN>-<name>.md` (use provider-doc template)
4. Update `docs/zh/06-privacy-matrix.md` (add row)
5. Update `docs/zh/capability/00-index.md` (add model rows)
6. Update `scripts/lib/probe.mjs` (add provider probe)
7. Update `scripts/test-real-keys.mjs` PROBES array
8. Update `configs/litellm_config.yaml` (if relevant models)
9. Update `CHANGELOG.md` + `providers.json` version field (minor bump)

---

## Sources

- GitHub Actions docs: https://docs.github.com/en/actions
- shields.io endpoint badge: https://shields.io/badges/endpoint-badge
- Keep a Changelog: https://keepachangelog.com/en/1.1.0/
