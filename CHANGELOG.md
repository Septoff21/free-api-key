# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

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
