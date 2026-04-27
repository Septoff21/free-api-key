# Gemini (AI Studio) — Privacy / Training Policy Evidence

**Last Verified:** 2026-04-27
**Source:** https://ai.google.dev/gemini-api/terms + https://support.google.com/gemini/answer/13594961

## Official Quotes

> "When you use the free tier of the Gemini API, Google may use your API inputs and outputs to improve Google products and services, including machine learning models."
> — Google Gemini API Terms of Service (retrieved 2026-04-27)

> "Human reviewers may read, annotate, and process your API input and output. Google takes steps to protect your privacy as part of this process."
> — Google AI Studio FAQ / Terms (retrieved 2026-04-27)

## Assessment

- **Free tier (AI Studio):** Google DOES use inputs/outputs to improve models. Human review possible.
- **Paid tier (Vertex AI):** No training on customer data by default.
- This is a significant privacy consideration for sensitive use cases.

## Training Status: `true` (free tier trains on user data)

For `providers.json`: `trains_on_input: true`, `human_review_possible: true`
with note to use Vertex AI for privacy-sensitive workloads.
