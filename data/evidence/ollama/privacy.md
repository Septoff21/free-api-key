# Ollama — Privacy / Training Policy Evidence

**Last Verified:** 2026-04-27
**Source:** https://ollama.com + https://github.com/ollama/ollama (fully local software)

## Official Quotes

> "Ollama runs models locally on your machine. No data is sent to external servers."
> — Ollama documentation / GitHub README (retrieved 2026-04-27)

## Assessment

- Ollama is **fully local** software — no data leaves the user's machine.
- Zero network requests during inference (after initial model download).
- No training whatsoever — models are static weights downloaded from model hubs.
- Maximum privacy: suitable for sensitive/confidential data, air-gapped environments.
- The only outbound traffic is: `ollama pull` (downloading models) and optional telemetry (can be disabled).

## Training Status: N/A — fully local, no data transmission

This is the **gold standard for privacy** among all providers in this project.
`trains_on_input: false`, `data_stays_local: true`
