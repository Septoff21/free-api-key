# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **Phase 07** — Client integration guides (7 clients × bilingual):
  - `docs/zh/clients/01-opencode.md` + `docs/en/clients/01-opencode.md` — opencode CLI: JSON config, all 8 providers, LiteLLM proxy integration, env-var key management
  - `docs/zh/clients/02-cline.md` + `docs/en/clients/02-cline.md` — Cline VS Code extension: OpenRouter/Gemini/Ollama setup, agentic task tips, settings.json reference
  - `docs/zh/clients/03-continue.md` + `docs/en/clients/03-continue.md` — Continue (VS Code + JetBrains): multi-model config, Codestral FIM, Ollama local autocomplete, @codebase indexing
  - `docs/zh/clients/04-cursor.md` + `docs/en/clients/04-cursor.md` — Cursor BYOK: model registration, LiteLLM proxy, BYOK limitations (Tab completion caveat)
  - `docs/zh/clients/05-librechat.md` + `docs/en/clients/05-librechat.md` — LibreChat Docker: .env config, librechat.yaml custom endpoints for Cerebras/GitHub Models/Ollama
  - `docs/zh/clients/06-openwebui.md` + `docs/en/clients/06-openwebui.md` — Open WebUI Docker: Admin Panel connections, Ollama model management, RAG document upload
  - `docs/zh/clients/07-chatbox.md` + `docs/en/clients/07-chatbox.md` — Chatbox (desktop + mobile): GUI config, iOS/Android instructions, multi-chat-group provider switching

- **Phase 08** — Scenario recipes (5 recipes × bilingual):
  - `docs/zh/recipes/01-agent-loop.md` + English mirror — ReAct agent with tool calling (search/calculate/time), provider swap pattern
  - `docs/zh/recipes/02-vision-analyze.md` + English mirror — Universal vision helper: OCR, chart, screenshot, code analysis presets; batch processing
  - `docs/zh/recipes/03-litellm-router.md` + English mirror — LiteLLM Router Python API + proxy server mode
  - `docs/zh/recipes/04-image-generation.md` + English mirror — Cloudflare FLUX+SDXL generation, batch, neuron budget calculator
  - `docs/zh/recipes/05-quota-maximizer.md` + English mirror — Priority routing, semantic cache (MD5+TTL), batch question merging, compact mode
  - `configs/litellm_config.yaml` — 6 model aliases (fast-chat/quality-chat/vision/code/reasoning/transcription) with Ollama fallbacks

- **Phase 06+11** — Privacy matrix + 7 capability matrices (bilingual):
  - `docs/zh/06-privacy-matrix.md` + `docs/en/06-privacy-matrix.md` — Full provider comparison, per-provider deep-dive, scenario guides, PII redaction code
  - `docs/zh/capability/00-index.md` + `docs/en/capability/00-index.md` — Combined quick-ref across 25+ models × 7 dimensions
  - `docs/zh/capability/01-vision-in.md` — Vision input matrix (image/video/PDF/context/RPD)
  - `docs/zh/capability/02-image-gen.md` — Image generation matrix
  - `docs/zh/capability/03-agent-tool-use.md` — Agent/tool-use matrix with 8-framework compatibility table
  - `docs/zh/capability/04-long-context.md` — Long context matrix with hierarchical summary pattern
  - `docs/zh/capability/05-code.md` — Code matrix with FIM examples
  - `docs/zh/capability/06-reasoning.md` — Reasoning matrix with CoT parsing
  - `docs/zh/capability/07-other-modalities.md` — Audio/video: Groq Whisper SRT, Gemini video API

- **Phase 05** — `scripts/check-keys.mjs` one-click key checker:
  - Colored output (✓/–/✗), `--json` CI mode, `--help`, auto .env loading
  - `scripts/lib/probe.mjs` — 8 per-provider HTTP probes (10s timeout, Ollama model count, Cloudflare dual-key)
  - `npm run check` shortcut in `package.json`

- **Phase 03+04** — 16 bilingual provider docs (8 zh canonical + 8 en mirrors):
  - `docs/zh/01-openrouter.md` through `docs/zh/08-ollama.md`
  - Each: overview, who-it's-for, curl/Python/Node examples, rate limits, privacy matrix, common errors, 5 tips
  - Gemini doc includes ⚠️ training-data warning; Cloudflare highlights image-gen; Ollama covers hermes3 + llava

- **Phase 02** — Provider data + evidence:
  - `providers.json` — complete data for all 8 providers (OpenRouter, Gemini, Groq, Cerebras, GitHub Models, Mistral, Cloudflare Workers AI, Ollama). Each provider includes: rate limits, auth config, free-tier models with full capability fields (`modalities_in/out`, `tool_use`, `reasoning`, `speed_tier`, `best_for`, `json_mode`, `streaming`), `capabilities_summary`, `privacy` assessment, and `checker` config for key validation scripts.
  - `data/evidence/openrouter/` — rate limits + privacy evidence files
  - `data/evidence/gemini/` — rate limits + privacy evidence files (⚠️ trains on free-tier data)
  - `data/evidence/groq/` — rate limits + privacy evidence files
  - `data/evidence/cerebras/` — rate limits + privacy evidence files
  - `data/evidence/github-models/` — rate limits + privacy evidence files
  - `data/evidence/mistral/` — rate limits + privacy evidence files (GDPR, opt-in only)
  - `data/evidence/cloudflare/` — rate limits + privacy evidence files
  - `data/evidence/ollama/` — local / no-limits + privacy evidence files (gold standard)
  - Bumped `providers.json` version to `0.2.0`

- **Phase 01** — Repository foundation:
  - `README.md` (Chinese, canonical) + `README.en.md` (English mirror) with full project structure, capability matrix placeholders, provider table placeholders
  - `CHANGELOG.md` (this file) in Keep a Changelog format
  - `CONTRIBUTING.md` — bilingual contribution guide (zh + en)
  - `LICENSE` — MIT for code, CC-BY-SA 4.0 for documentation
  - `.gitignore` — covers Node, env files, OS artifacts, editor configs, test output
  - `providers.json` — empty providers array with `$schema` reference
  - `providers.schema.json` — JSON Schema Draft-07 defining the full provider data model, including multi-dimensional capability fields (`modalities_in`, `modalities_out`, `tool_use`, `json_mode`, `streaming`, `reasoning`, `code_specialized`, `speed_tier`, `best_for`, `capabilities_summary`)
  - `configs/.env.example` — environment variable template for all 8 providers
  - `docs/zh/` + `docs/en/` — directory stubs for bilingual documentation

[Unreleased]: https://github.com/YOUR_USERNAME/free-api-key/compare/v0.1.0...HEAD
