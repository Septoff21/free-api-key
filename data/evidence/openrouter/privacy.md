# OpenRouter — Privacy / Training Policy Evidence

**Last Verified:** 2026-04-27
**Source:** https://openrouter.ai/privacy

## Official Quotes

> "OpenRouter does not train on your data. We pass requests through to underlying model providers."
> — Paraphrase of OpenRouter Privacy Policy, section on data usage (retrieved 2026-04-27)

> "The privacy practices of the underlying model providers apply to your data once it reaches them."
> — OpenRouter Privacy Policy (retrieved 2026-04-27)

## Assessment

- OpenRouter itself: **does NOT train** on user data.
- Underlying providers: each provider's own policy applies once the request is forwarded.
- For free-tier `:free` models, the underlying provider (e.g., Google, Meta) may have their own training terms.
- Users wanting strong privacy guarantees should check the specific underlying model's provider.

## Training Status: `unknown` (conditional — OR itself no, but routed providers vary)

For `providers.json` purposes: `trains_on_input: false` for OpenRouter as a platform,
with a `privacy_notes` stating underlying providers may vary.
