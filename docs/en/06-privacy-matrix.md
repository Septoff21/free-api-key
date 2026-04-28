> Mirror of [README.md](../../README.md) (Chinese, canonical). If they drift, zh wins.

# Privacy & Data Security Matrix

> **Last Verified:** 2026-04-27
> Data sourced from `data/evidence/<provider>/privacy.md`

[中文](../zh/06-privacy-matrix.md)

## Quick Reference

| Provider | Trains on your data? | Logs prompts? | Human review? | Compliance | Best for |
|---|:---:|:---:|:---:|---|---|
| **Gemini (AI Studio)** | ⚠️ **Yes** | Yes | Yes (possible) | — | Non-sensitive only |
| **OpenRouter** | ✅ No | Unknown | No | — | General use |
| **Groq** | ✅ No | Unknown | No | DPA available | General use |
| **Cerebras** | ✅ No | Unknown | No | — | General use |
| **GitHub Models** | ✅ No (GitHub itself) | Unknown | No | — | Prototyping |
| **Mistral** | ✅ No (opt-in only) | Unknown | No | **GDPR** | Privacy-first |
| **Cloudflare** | ✅ No | Unknown | No | SOC2/GDPR | Enterprise |
| **Ollama (Local)** | ✅ No (impossible) | **No** | **No** | Fully local | Maximum privacy |

> Legend: ✅ Explicitly confirmed no training / ⚠️ Trains or risk present / Unknown = not clearly stated in official docs

---

## Provider Details

### 🔴 Gemini (AI Studio) — The Only Provider That Trains on Your Data

**The most important fact: free tier trains by default.**

Google's Gemini API Terms of Service explicitly state that when using the free AI Studio API:
- Google **may use your inputs and outputs to improve models**
- **Human reviewers** may access your prompts
- This is **on by default** and cannot be disabled on the free tier

**What's safe to use:**
- ✅ Debugging code with no trade secrets, learning, processing publicly available content
- ❌ PII, medical data, legal materials, business contracts, internal company documents

**Solutions:**
- Upgrade to **Vertex AI** (paid) — contractually guarantees no training on your data
- Switch to a non-training provider (Groq, Cerebras, Mistral, etc.)

---

### 🟡 OpenRouter — Platform Doesn't Train; Underlying Providers Vary

OpenRouter itself does not train. However, it's an **aggregator** — requests are forwarded to the underlying model providers:

| `:free` Model | Underlying Provider | Training Policy |
|---|---|---|
| `google/gemini-*:free` | Google | ⚠️ May train (see above) |
| `meta-llama/llama-*:free` | Meta / third-party inference | Generally no training |
| `deepseek/*:free` | DeepSeek / third-party | Generally no training |
| `mistralai/*:free` | Mistral / third-party | Generally no training |

**Recommendation:** For sensitive tasks, avoid `:free` models that route through Google.

---

### 🟡 GitHub Models — GitHub Doesn't Train; Commercial Model Providers Do Their Own Thing

GitHub itself doesn't train, but:
- Using `openai/gpt-4o` → OpenAI's policy applies (API users generally not trained on)
- Using `anthropic/claude-*` → Anthropic's policy applies
- Platform is explicitly positioned as a "prototyping environment" with no production SLA or privacy guarantees

---

### 🟢 Groq — No Training; Separate Agreement

- GroqCloud API is governed by **Groq Cloud Services Agreement** (≠ main consumer privacy policy)
- Explicitly states: **does not train on API data**
- Enterprise customers can sign a DPA (Data Processing Agreement)
- Recommendation: review GroqCloud terms before sending production data

---

### 🟢 Cerebras — No Training; Transient Processing

- API data used only for immediate inference, then discarded
- No human review
- Suitable for moderate privacy requirements

---

### 🟢 Mistral — One of the Strongest Privacy Guarantees

French company, bound by EU law:
- **No training by default** (explicit opt-in required to contribute data)
- Full GDPR compliance; data subject rights protected
- No human review
- **First choice for EU enterprise compliance** and data residency requirements

---

### 🟢 Cloudflare Workers AI — Enterprise-Grade Privacy

- Explicitly states: **does not use customer content to train AI models** (confirmed in Workers AI docs + DPA)
- SOC 2 Type II certified
- GDPR compliant
- Suitable for teams with infrastructure trust requirements

---

### 🟢 Ollama (Local) — Absolute Privacy

- Fully local; **physically impossible to send data externally**
- Zero network requests during inference
- No telemetry (startup analytics can be disabled)
- **The only recommended solution for sensitive data**

---

## Choose by Scenario

### Scenario A: Processing user PII (names, addresses, IDs)

→ **Ollama (local)** first choice; fallback: Mistral / Cloudflare (no training + compliant)
→ **Never use** Gemini free tier

### Scenario B: Medical / Legal / Financial data

→ **Ollama (local)** — data never leaves the machine
→ If cloud is required: Mistral (GDPR) or Cloudflare (SOC 2)

### Scenario C: Proprietary business code / algorithms

→ Ollama / Mistral / Groq (DPA available)
→ Avoid Gemini free tier

### Scenario D: Non-sensitive learning / public content

→ Any provider is fine; Gemini free tier's high quota makes sense here

### Scenario E: EU data with GDPR compliance requirements

→ **Mistral** (French company, EU jurisdiction)
→ Cloudflare (has EU DPA)

---

## Best Practices

### 1. Redact PII before sending

```python
import re

def redact_pii(text: str) -> str:
    """Simple example: mask phone numbers and emails"""
    text = re.sub(r'\b(\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b', '[PHONE]', text)
    text = re.sub(r'[\w.+-]+@[\w-]+\.\w+', '[EMAIL]', text)
    return text

prompt = redact_pii(user_input)
response = call_api(prompt)
```

### 2. Local + cloud hybrid architecture

```
Sensitive data   →  Ollama (local)         →  result
Non-sensitive    →  Groq / Cerebras (cloud) →  result
```

```python
def smart_route(text: str, is_sensitive: bool):
    if is_sensitive:
        return call_ollama(text)   # local, zero leakage
    else:
        return call_groq(text)     # cloud, fast
```

### 3. Never put secrets in prompts

Never:
```python
prompt = f"Check this code, AWS_SECRET={secret}"  # ❌ Dangerous!
```

Instead:
```python
prompt = "Check this code logic — credentials replaced with placeholders"  # ✅
```

### 4. Lock down your .env file permissions

```bash
# Check .env permissions (Linux/macOS)
ls -la .env
# Should be -rw------- (600). If not:
chmod 600 .env
```

### 5. Use secret injection in CI; never commit .env

GitHub Actions:
```yaml
env:
  OPENROUTER_API_KEY: ${{ secrets.OPENROUTER_API_KEY }}
```

`.gitignore` already excludes `.env` in this project — verify with `git check-ignore .env`.

---

## Privacy Tier Summary

```
High privacy need (medical / legal / PII)
  └─ Ollama (local) ─────────────────────── ⭐⭐⭐⭐⭐ Zero risk
  └─ Mistral ────────────────────────────── ⭐⭐⭐⭐  GDPR + no training
  └─ Cloudflare ─────────────────────────── ⭐⭐⭐⭐  SOC2 + no training

Moderate privacy need (business code / internal docs)
  └─ Groq ───────────────────────────────── ⭐⭐⭐   No training, DPA available
  └─ Cerebras ───────────────────────────── ⭐⭐⭐   No training
  └─ GitHub Models ──────────────────────── ⭐⭐⭐   GitHub doesn't train

Low privacy need (public content / learning)
  └─ OpenRouter ─────────────────────────── ⭐⭐    Platform no training; underlying varies
  └─ Gemini free tier ───────────────────── ⭐     Explicitly trains on user data ⚠️
```

---

## Sources

- `data/evidence/*/privacy.md` — individual provider evidence files
- [https://ai.google.dev/gemini-api/terms](https://ai.google.dev/gemini-api/terms)
- [https://mistral.ai/privacy/](https://mistral.ai/privacy/)
- [https://developers.cloudflare.com/workers-ai/](https://developers.cloudflare.com/workers-ai/)
- [https://groq.com/privacy-policy/](https://groq.com/privacy-policy/)
