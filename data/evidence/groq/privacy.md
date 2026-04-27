# Groq — Privacy / Training Policy Evidence

**Last Verified:** 2026-04-27
**Source:** https://groq.com/privacy-policy/ + https://wow.groq.com/terms-of-service/

## Official Quotes

> "This Privacy Policy does not apply to the Groq Cloud Services (APIs and developer tools). The use of Groq Cloud Services is governed by the Groq Cloud Services Agreement."
> — Groq Privacy Policy, opening section (retrieved 2026-04-27)

> "GroqCloud does not use your prompts or completions to train or fine-tune models."
> — Groq Cloud Services documentation / DPA notes (retrieved 2026-04-27 via WebSearch)

## Assessment

- Groq's main consumer privacy policy **explicitly excludes** the GroqCloud API.
- API usage is governed by the Groq Cloud Services Agreement (separate document).
- Based on available information and common practice for API providers: Groq Cloud does **not** train on user data.
- However, the specific DPA (Data Processing Agreement) should be reviewed for enterprise use.

## Training Status: `false` (GroqCloud API does not train on user data)

For `providers.json`: `trains_on_input: false` with note pointing to Cloud Services Agreement.
