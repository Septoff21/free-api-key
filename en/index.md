---
layout: home

hero:
  name: "Free AI API Guide"
  text: "8 Providers · Completely Free · No Credit Card"
  tagline: Set up your own AI assistant in 30 minutes. No subscriptions. No vendor lock-in.
  actions:
    - theme: brand
      text: 📋 Provider Docs
      link: /docs/en/01-openrouter
    - theme: alt
      text: 🔧 Client Guides
      link: /docs/en/clients/01-opencode
    - theme: alt
      text: 中文版 →
      link: /

features:
  - icon: 🌐
    title: 8 Free Providers
    details: OpenRouter · Gemini · Groq · Cerebras · GitHub Models · Mistral · Cloudflare Workers AI · Ollama. All have genuinely free tiers with no credit card required.
  - icon: 🔍
    title: One-click Key Checker
    details: Run <code>npm run check</code> to validate all your API keys in 30 seconds. Colored output ✓ / – / ✗ with optional JSON mode for CI.
  - icon: 🔒
    title: Privacy Matrix
    details: Which providers train on your data? Which have human review? Complete side-by-side privacy comparison for all 8 providers.
  - icon: ⚡
    title: Health Monitoring
    details: GitHub Actions probes all providers weekly, commits health logs, and opens issues automatically when something breaks.
  - icon: 🎯
    title: Capability Matrices
    details: 7-dimensional capability comparison across 25+ models — vision, image-gen, tool-use, long-context, code, reasoning, audio/video.
  - icon: 🍳
    title: Scenario Recipes
    details: 5 production-ready recipes — ReAct agent loop, vision analysis, LiteLLM router, image generation, quota maximizer.
---

<div class="vp-doc" style="max-width:1152px;margin:0 auto;padding:0 24px;">

## Quick Provider Comparison

| Provider | Best For | Free Tier | Privacy |
|---|---|---|---|
| **OpenRouter** | Most model variety | 200+ models | ✅ No training |
| **Gemini** | Easiest start | Generous RPM | ⚠️ Trains on data |
| **Groq** | Fastest inference | 14K RPD | ✅ No training |
| **Cerebras** | Ultra-low latency | 1M tokens/day | ✅ No training |
| **GitHub Models** | Microsoft ecosystem | Token quotas | ✅ No training |
| **Mistral** | EU GDPR compliance | Codestral free | ✅ GDPR opt-in |
| **Cloudflare** | Image generation | Neurons budget | ✅ No training |
| **Ollama** | Max privacy | Unlimited | ✅ 100% local |

---

## Get Started in 3 Steps

**Step 1** — Pick a provider and get your API key (see docs for each provider above)

**Step 2** — Validate your key:
```bash
cp configs/.env.example .env
# Fill in your keys
npm run check
```

**Step 3** — Connect to your favorite client (Cline, Cursor, Continue, Chatbox, Open WebUI…)

See the **[Client Guides](/docs/en/clients/01-opencode)** for step-by-step setup for each tool.

</div>
