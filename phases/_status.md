# Phase Status

> Append-only log. Each executing agent should add an entry when finishing a phase.
> Format: `## Phase NN — <name> — YYYY-MM-DD — <agent model>` followed by a short summary.

---

## Phase 13 — VitePress Documentation Site — 2026-04-29 — claude-sonnet-4-6

VitePress 1.6.4 site with bilingual i18n nav, full sidebar (providers/clients/recipes/capability/tutorials), local search (zh translations), provider cards grid (8 animated cards with tags), custom gradient theme, stats row, route maps. Files: `.vitepress/config.ts`, `theme/index.ts`, `theme/style.css`, `theme/components/ProviderCards.vue`, `index.md`, `en/index.md`, `public/logo.svg`. Build: 21s clean. GitHub Pages deploy workflow added. `npm run docs:dev/build/preview` scripts added to `package.json`.

## Phase 09 — Non-Dev Tutorials + v1.0.0 Release — 2026-04-29 — claude-sonnet-4-6

3 tutorial files in for-non-devs/zh/: beginner guide (5-step, FAQ, provider picker), OpenRouter signup walkthrough, Gemini AI Studio walkthrough. 11 screenshot placeholders for maintainer. CHANGELOG moved to [1.0.0]. providers.json → 1.0.0. git tag v1.0.0.

## Phase 10 — Maintenance Automation — 2026-04-29 — claude-sonnet-4-6

4 GitHub Actions workflows: staleness-gate, freshness-check (SHA-256 page diff), checker-smoke, link-check. 4 issue templates + PR template + dependabot. Scripts: check-staleness.mjs, fetch-snapshots.mjs, check-links.mjs. Docs: 96-freshness-policy.md (bilingual).

## Phase 12 — Real Key Smoke Testing CI — 2026-04-29 — claude-sonnet-4-6

Weekly smoke CI (real-key-smoke.yml), 1-token probes, skip on missing keys, auto-commit health logs, issue on failure. test-real-keys.mjs + generate-status-badge.mjs. data/health/ with _index.json + badge.json + 8 JSONL logs. 97-status.md + 95-maintenance.md (bilingual). Health badge in README.

## Phase 07 — Client Integration Guides — 2026-04-29 — claude-sonnet-4-6

7 bilingual client guides (opencode, Cline, Continue, Cursor, LibreChat, Open WebUI, Chatbox). 5 English recipe mirrors. Each guide: provider params table, config examples, 5 pitfalls, LiteLLM proxy notes.

## Phase 08 — Recipes — 2026-04-28 — claude-sonnet-4-7

5 scenario recipes committed: agent-loop (ReAct tool-use loop with provider swap), vision-analyze (universal image helper + OCR/chart/screenshot presets), litellm-router (YAML config + Python Router API + proxy mode), image-generation (Cloudflare FLUX+SDXL + batch + neuron budget), quota-maximizer (priority routing + semantic cache + batch merging). LiteLLM config covers 6 model aliases with fallback chains.

## Phase 06+11 — Privacy Matrix + Capability Matrices — 2026-04-28 — claude-sonnet-4-7

Privacy matrix: full provider comparison table, per-provider deep-dive, scenario guides, best practices with code. 7 capability matrices: vision-in, image-gen, agent-tool-use (8 framework compat table), long-context (hierarchical summary pattern), code (FIM + editor config), reasoning (CoT parsing), other-modalities (Groq Whisper SRT + Gemini video). Combined quick-ref index across all dimensions.

## Phase 05 — check-keys.mjs — 2026-04-28 — claude-sonnet-4-7

One-click key checker: scripts/check-keys.mjs (coloured output ✓/–/✗, --json mode for CI, --help, auto .env load), scripts/lib/probe.mjs (per-provider HTTP probes, 10s timeout, rate-limit header parsing, Ollama model count). All 8 providers. npm run check shortcut added.

## Phase 03+04 — Bilingual Provider Docs — 2026-04-28 — claude-sonnet-4-7

16 provider docs (8 zh canonical + 8 en mirrors). Each covers: overview, who-it's-for, 3-language usage (curl/Python/Node), free model table, rate limits, privacy matrix, common errors, client links, 5 tips. Gemini privacy warning prominent; Cloudflare image-gen highlighted; Ollama full local stack with hermes3+llava.

## Phase 02 — Provider Data — 2026-04-27 — claude-sonnet-4-7

All 8 providers filled in `providers.json` (version 0.2.0): OpenRouter, Gemini, Groq, Cerebras, GitHub Models, Mistral, Cloudflare Workers AI, Ollama. Every provider has rate limits, auth config, free-tier models with full capability matrix fields, `capabilities_summary`, privacy assessment (trains_on_data/logs_prompts/human_review), and `checker` endpoint config. Evidence files written to `data/evidence/<provider>/limits.md` + `privacy.md` for all 8 providers. Schema validation passes (AJV strict:false, all 8 providers ✓). Notable: Gemini free tier trains on user data; all others do not. Cloudflare is the only provider with image_gen + audio_in. Ollama is fully local (gold standard privacy).

## Phase 01 — Foundation — 2026-04-27 — sonnet-4.6

All 11 deliverable files created and committed (bbcdbd8). JSON valid, git clean, cross-links verified, no stray files. Schema includes full capability fields (modalities_in/out, tool_use, reasoning, speed_tier, capabilities_summary). `.claude/settings.local.json` correctly excluded via .gitignore.

## Phase 00 — Context — 2026-04-27 — opus-4.7

Created `PHASES.md` and the full `phases/` plan (00-09). No code or content yet; this is planning-only.

## Plan v2 — 2026-04-27 — opus-4.7

Expanded planning:
- Added `phases/conventions.md` (single source of truth for naming, markdown style, bilingual rules, commit/changelog format, glossary).
- Added Phase 10 (`phases/10-maintenance.md`) for live-update / freshness mechanism: GitHub Actions cron, staleness gate, snapshot-based change detection, issue/PR templates, maintenance handbook.
- Added templates: `phases/templates/{provider-doc,client-doc,recipe}.md` extracted from phases 03/07/08.
- Beefed up Phase 02 with verification protocol (4-tier source priority, evidence folder requirement, conflict resolution rules).
- Beefed up Phase 06 with privacy research methodology (keyword grep checklist, semantic-trap warnings, multi-source cross-check).
- Updated `PHASES.md` index to include Phase 10 + reference conventions/templates.

## Plan v3 — 2026-04-27 — opus-4.7

Multi-dimensional capability + real-key testing:
- Added Phase 11 (`phases/11-capability-matrices.md`) — 7 capability matrices (vision-in / image-gen / tool-use / long-context / code / reasoning / other-modalities) + index page. Tool-use page covers ≥6 agent harnesses (opencode, Cline, aider, LangChain, CrewAI, smolagents, Hermes/Ollama).
- Added Phase 12 (`phases/12-real-key-testing.md`) — opt-in real key smoke test: GitHub Actions weekly cron, single-token probe per provider, append-only health log, status page, shields.io health badge. Hard constraints: ≤1 token/probe, secrets never exposed to forks, no key/response logging.
- Upgraded `providers.json` schema (in Phase 01): added per-model `modalities_in/out`, `tool_use` (native/prompt/none), `json_mode`, `streaming`, `reasoning`, `code_specialized`, `speed_tier`, `best_for`; added per-provider `capabilities_summary` derived field.
- Phase 02 now requires capability-field judgement guide (how to decide tool_use level, reasoning, speed_tier).
- Phase 08 expanded from 5 → 8 recipes, adding agent-loop ⭐, vision-analyze ⭐, image-generation ⭐, long-doc-rag.
- Conventions glossary expanded into 5 categories (quota/provider/model-capability/agent/maintenance).
- Recommended phase execution order added to PHASES.md (11 between 06 and 07, 12 before 10).
