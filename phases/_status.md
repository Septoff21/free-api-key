# Phase Status

> Append-only log. Each executing agent should add an entry when finishing a phase.
> Format: `## Phase NN — <name> — YYYY-MM-DD — <agent model>` followed by a short summary.

---

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
