#!/usr/bin/env node
/**
 * check-keys.mjs — One-click free API key checker
 *
 * Usage:
 *   node scripts/check-keys.mjs              # check all configured providers
 *   node scripts/check-keys.mjs openrouter   # check specific provider(s)
 *   node scripts/check-keys.mjs --json       # output JSON (for CI / piping)
 *   node scripts/check-keys.mjs --help
 *
 * Prerequisites:
 *   Copy configs/.env.example → .env and fill in your keys.
 *   The script loads .env automatically (no dotenv package required in Node 20+).
 *
 * Environment variables read:
 *   OPENROUTER_API_KEY, GEMINI_API_KEY, GROQ_API_KEY, CEREBRAS_API_KEY,
 *   GITHUB_TOKEN, MISTRAL_API_KEY, CLOUDFLARE_API_TOKEN,
 *   CLOUDFLARE_ACCOUNT_ID, OLLAMA_BASE_URL
 *
 * Security:
 *   Keys are NEVER logged or printed. Only ✓/✗ and quota info is shown.
 */

import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { probeProvider, PROVIDER_KEYS } from "./lib/probe.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

// ─── Load .env ────────────────────────────────────────────────────────────────

function loadDotenv() {
  const envPath = resolve(ROOT, ".env");
  if (!existsSync(envPath)) return;
  const lines = readFileSync(envPath, "utf8").split("\n");
  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eqIdx = line.indexOf("=");
    if (eqIdx < 1) continue;
    const key = line.slice(0, eqIdx).trim();
    const val = line.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
    if (!(key in process.env)) process.env[key] = val; // don't override real env
  }
}

loadDotenv();

// ─── CLI parsing ──────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const jsonMode = args.includes("--json");
const helpMode = args.includes("--help") || args.includes("-h");

const PROVIDER_DISPLAY = {
  openrouter:    "OpenRouter",
  gemini:        "Gemini (AI Studio)",
  groq:          "Groq",
  cerebras:      "Cerebras",
  github_models: "GitHub Models",
  mistral:       "Mistral",
  cloudflare:    "Cloudflare Workers AI",
  ollama:        "Ollama (Local)",
};

if (helpMode) {
  console.log(`
check-keys.mjs — Free API Key Checker
======================================
Verifies that each provider key in your .env is valid, and shows remaining
rate-limit quota where the API exposes it.

Usage:
  node scripts/check-keys.mjs                   Check all configured providers
  node scripts/check-keys.mjs openrouter groq   Check specific providers
  node scripts/check-keys.mjs --json            Output JSON for CI/scripts
  node scripts/check-keys.mjs --help            Show this help

Supported providers:
${PROVIDER_KEYS.map((k) => `  ${k.padEnd(16)} ${PROVIDER_DISPLAY[k] || ""}`).join("\n")}

Setup:
  cp configs/.env.example .env
  # Edit .env and fill in your keys
  node scripts/check-keys.mjs
`);
  process.exit(0);
}

const requestedKeys = args.filter((a) => !a.startsWith("--"));
const targetKeys = requestedKeys.length > 0
  ? requestedKeys.filter((k) => {
      if (!PROVIDER_KEYS.includes(k)) {
        console.warn(`⚠  Unknown provider: ${k} (skipping)`);
        return false;
      }
      return true;
    })
  : PROVIDER_KEYS;

// ─── ANSI colours (disabled in JSON mode or when NO_COLOR set) ────────────────

const useColour = !jsonMode && !process.env.NO_COLOR && process.stdout.isTTY;
const c = {
  green:  (s) => useColour ? `\x1b[32m${s}\x1b[0m` : s,
  red:    (s) => useColour ? `\x1b[31m${s}\x1b[0m` : s,
  yellow: (s) => useColour ? `\x1b[33m${s}\x1b[0m` : s,
  dim:    (s) => useColour ? `\x1b[2m${s}\x1b[0m`  : s,
  bold:   (s) => useColour ? `\x1b[1m${s}\x1b[0m`  : s,
  cyan:   (s) => useColour ? `\x1b[36m${s}\x1b[0m` : s,
};

// ─── Main ─────────────────────────────────────────────────────────────────────

if (!jsonMode) {
  console.log();
  console.log(c.bold("  🔑  Free API Key Checker"));
  console.log(c.dim(`  Checking ${targetKeys.length} provider(s)...\n`));
}

const results = [];

for (const key of targetKeys) {
  const display = PROVIDER_DISPLAY[key] || key;

  if (!jsonMode) {
    process.stdout.write(`  ${display.padEnd(24)}  `);
  }

  const result = await probeProvider(key, process.env);
  results.push({ provider: key, display, ...result });

  if (!jsonMode) {
    if (result.ok) {
      const quotaParts = [];
      if (result.rpmRemaining !== null) quotaParts.push(`RPM rem: ${result.rpmRemaining}`);
      if (result.rpdRemaining !== null) quotaParts.push(`RPD rem: ${result.rpdRemaining}`);
      if (result.extra) quotaParts.push(result.extra);
      const quota = quotaParts.length ? c.dim(` (${quotaParts.join(", ")})`) : "";
      console.log(`${c.green("✓")}  ${c.dim(`${result.latencyMs}ms`)}${quota}`);
    } else if (result.error?.includes("not set") || result.error?.includes("not configured")) {
      console.log(`${c.yellow("–")}  ${c.dim("not configured")}`);
    } else {
      console.log(`${c.red("✗")}  ${c.red(result.error || "unknown error")}  ${c.dim(`(${result.latencyMs}ms)`)}`);
    }
  }
}

// ─── Summary ─────────────────────────────────────────────────────────────────

if (jsonMode) {
  console.log(JSON.stringify(
    {
      timestamp: new Date().toISOString(),
      results: results.map(({ provider, display, ok, status, latencyMs, rpmRemaining, rpdRemaining, error, extra }) => ({
        provider, display, ok, status, latencyMs, rpmRemaining, rpdRemaining,
        error: error ?? null,
        extra: extra ?? null,
      })),
    },
    null,
    2,
  ));
} else {
  const ok = results.filter((r) => r.ok).length;
  const notConfigured = results.filter((r) => !r.ok && (r.error?.includes("not set") || r.error?.includes("not configured"))).length;
  const failed = results.filter((r) => !r.ok && !r.error?.includes("not set") && !r.error?.includes("not configured")).length;

  console.log();
  console.log(c.dim("  ─".repeat(28)));
  console.log(`  ${c.bold("Results:")}  ${c.green(`${ok} valid`)}  |  ${notConfigured > 0 ? c.yellow(`${notConfigured} not configured`) : `0 not configured`}  |  ${failed > 0 ? c.red(`${failed} failed`) : "0 failed"}`);
  console.log();

  if (ok === 0 && notConfigured > 0) {
    console.log(c.dim("  Tip: copy configs/.env.example → .env and fill in your keys."));
    console.log();
  }

  if (failed > 0) {
    console.log(c.yellow("  Failed providers:"));
    results
      .filter((r) => !r.ok && !r.error?.includes("not set") && !r.error?.includes("not configured"))
      .forEach((r) => console.log(`    ${c.red("✗")} ${r.display}: ${r.error}`));
    console.log();
  }

  process.exit(failed > 0 ? 1 : 0);
}
