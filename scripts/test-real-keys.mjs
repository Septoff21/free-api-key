#!/usr/bin/env node
/**
 * test-real-keys.mjs — Real-key smoke test runner
 *
 * Sends a 1-token "hi" request to each configured provider.
 * Missing keys are skipped gracefully (exit 0).
 * Failures are recorded but do NOT trigger retries (quota safety).
 *
 * Usage:
 *   node scripts/test-real-keys.mjs [options]
 *
 * Options:
 *   --append-logs           Append results to data/health/<provider>.jsonl
 *   --output-index <path>   Write summary JSON to <path> (default: data/health/_index.json)
 *   --dry-run               Print what would be done, make no requests
 *   --help                  Show this help
 *
 * Local maintainer usage (from repo root):
 *   cp configs/.env.example .env  # fill in test keys
 *   node scripts/test-real-keys.mjs --append-logs
 */

import { readFileSync, writeFileSync, mkdirSync, appendFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '..');

// ─── Load .env if present (local runs) ────────────────────────────────────────
const envPath = resolve(ROOT, '.env');
if (existsSync(envPath)) {
  const lines = readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  }
}

// ─── CLI Args ─────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
if (args.includes('--help')) {
  console.log(`
Usage: node scripts/test-real-keys.mjs [options]

Options:
  --append-logs           Append results to data/health/<provider>.jsonl
  --output-index <path>   Write summary JSON (default: data/health/_index.json)
  --dry-run               Describe probes without sending requests
  --help                  Show this help
`.trim());
  process.exit(0);
}

const APPEND_LOGS = args.includes('--append-logs');
const DRY_RUN     = args.includes('--dry-run');
const idxArg      = args.indexOf('--output-index');
const INDEX_PATH  = idxArg !== -1 ? args[idxArg + 1] : resolve(ROOT, 'data/health/_index.json');

// ─── Probe definitions ────────────────────────────────────────────────────────
// Each probe sends the absolute minimum request: "hi" with max_tokens=1.
// This ensures ≤5 tokens consumed per provider per run.

const PROBES = [
  {
    key: 'openrouter',
    envKey: 'OPENROUTER_API_KEY',
    kind: 'minimal_chat',
    url: 'https://openrouter.ai/api/v1/chat/completions',
    model: 'deepseek/deepseek-chat:free',
    authHeader: (k) => `Bearer ${k}`,
    extraHeaders: { 'HTTP-Referer': 'https://github.com/free-api-key' },
  },
  {
    key: 'gemini',
    envKey: 'GEMINI_API_KEY',
    kind: 'minimal_chat',
    url: 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
    model: 'gemini-2.0-flash',
    authHeader: (k) => `Bearer ${k}`,
  },
  {
    key: 'groq',
    envKey: 'GROQ_API_KEY',
    kind: 'minimal_chat',
    url: 'https://api.groq.com/openai/v1/chat/completions',
    model: 'llama-3.1-8b-instant',   // smallest model → least quota impact
    authHeader: (k) => `Bearer ${k}`,
  },
  {
    key: 'cerebras',
    envKey: 'CEREBRAS_API_KEY',
    kind: 'minimal_chat',
    url: 'https://api.cerebras.ai/v1/chat/completions',
    model: 'llama3.1-8b',
    authHeader: (k) => `Bearer ${k}`,
  },
  {
    key: 'github_models',
    envKey: 'GITHUB_TOKEN',
    kind: 'minimal_chat',
    url: 'https://models.github.ai/inference/chat/completions',
    model: 'openai/gpt-4o-mini',
    authHeader: (k) => `Bearer ${k}`,
  },
  {
    key: 'mistral',
    envKey: 'MISTRAL_API_KEY',
    kind: 'minimal_chat',
    url: 'https://api.mistral.ai/v1/chat/completions',
    model: 'open-mistral-7b',
    authHeader: (k) => `Bearer ${k}`,
  },
  {
    key: 'cloudflare',
    envKey: null,  // dual-key: CLOUDFLARE_ACCOUNT_ID + CLOUDFLARE_API_TOKEN
    kind: 'minimal_chat',
    getUrl: () => {
      const id = process.env.CLOUDFLARE_ACCOUNT_ID;
      return id
        ? `https://api.cloudflare.com/client/v4/accounts/${id}/ai/v1/chat/completions`
        : null;
    },
    model: '@cf/meta/llama-3.1-8b-instruct',
    authHeader: () => `Bearer ${process.env.CLOUDFLARE_API_TOKEN || ''}`,
    isConfigured: () => !!(process.env.CLOUDFLARE_ACCOUNT_ID && process.env.CLOUDFLARE_API_TOKEN),
  },
  {
    key: 'ollama',
    envKey: null,   // local only — always skip in CI; run locally for full check
    kind: 'local_tags',
    url: 'http://localhost:11434/api/tags',
    isConfigured: () => false,  // CI always skips; local runner can override
  },
];

// ─── Error classification ─────────────────────────────────────────────────────
function classifyError(status, err) {
  if (err?.name === 'AbortError' || err?.code === 'ETIMEDOUT') return 'timeout';
  if (err?.code === 'ECONNREFUSED' || err?.code === 'ENOTFOUND') return 'network';
  if (!status) return 'network';
  if (status === 401 || status === 403) return 'auth';
  if (status === 429) return 'rate_limit';
  if (status === 404) return 'not_found';
  return 'unknown';
}

// ─── Single probe runner ──────────────────────────────────────────────────────
async function runProbe(probe) {
  const timestamp = new Date().toISOString();

  // Check if configured
  const isConfigured = probe.isConfigured
    ? probe.isConfigured()
    : !!(probe.envKey && process.env[probe.envKey]);

  if (!isConfigured) {
    return {
      provider: probe.key,
      ok: null,
      status_code: null,
      latency_ms: 0,
      error_class: null,
      skipped: true,
      timestamp,
      probe_kind: probe.kind,
    };
  }

  if (DRY_RUN) {
    console.log(`  [DRY-RUN] Would probe ${probe.key} (${probe.kind})`);
    return {
      provider: probe.key,
      ok: true,
      status_code: 200,
      latency_ms: 0,
      error_class: null,
      skipped: false,
      dry_run: true,
      timestamp,
      probe_kind: probe.kind,
    };
  }

  const t0 = Date.now();
  let status = null;
  let errorClass = null;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 30_000);

    let response;

    if (probe.kind === 'local_tags') {
      // Ollama: just GET /api/tags
      response = await fetch(probe.url, { signal: controller.signal });
      clearTimeout(timer);
      status = response.status;
    } else {
      // Minimal chat: "hi" → max_tokens: 1
      const apiKey = probe.envKey ? process.env[probe.envKey] : '';
      const url = probe.getUrl ? probe.getUrl() : probe.url;

      response = await fetch(url, {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': probe.authHeader(apiKey),
          ...(probe.extraHeaders || {}),
        },
        body: JSON.stringify({
          model: probe.model,
          messages: [{ role: 'user', content: 'hi' }],
          max_tokens: 1,
          stream: false,
        }),
      });
      clearTimeout(timer);
      status = response.status;
    }

    const latency = Date.now() - t0;
    const ok = status >= 200 && status < 300;
    if (!ok) errorClass = classifyError(status, null);

    return {
      provider: probe.key,
      ok,
      status_code: status,
      latency_ms: latency,
      error_class: errorClass,
      skipped: false,
      timestamp,
      probe_kind: probe.kind,
    };

  } catch (err) {
    const latency = Date.now() - t0;
    errorClass = classifyError(null, err);
    return {
      provider: probe.key,
      ok: false,
      status_code: null,
      latency_ms: latency,
      error_class: errorClass,
      skipped: false,
      timestamp,
      probe_kind: probe.kind,
    };
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────
const HEALTH_DIR = resolve(ROOT, 'data/health');
mkdirSync(HEALTH_DIR, { recursive: true });

console.log(`\n🔍 Free API Key — Real Key Smoke Test`);
console.log(`   ${new Date().toISOString()}`);
if (DRY_RUN) console.log('   Mode: DRY-RUN (no requests sent)\n');
else console.log('   Mode: LIVE (sending 1-token probes)\n');

const results = [];

for (const probe of PROBES) {
  process.stdout.write(`  ${probe.key.padEnd(16)}`);
  const r = await runProbe(probe);
  results.push(r);

  if (r.skipped) {
    console.log('–  not configured (skipped)');
  } else if (r.dry_run) {
    console.log('○  dry-run');
  } else if (r.ok) {
    console.log(`✓  ${r.status_code} (${r.latency_ms}ms)`);
  } else {
    console.log(`✗  ${r.status_code ?? 'no response'} [${r.error_class}] (${r.latency_ms}ms)`);
  }

  // Append to per-provider JSONL log
  if (APPEND_LOGS && !r.skipped && !r.dry_run) {
    const logPath = resolve(HEALTH_DIR, `${probe.key}.jsonl`);
    appendFileSync(logPath, JSON.stringify(r) + '\n');
  }
}

// ─── Build _index.json ────────────────────────────────────────────────────────
const active = results.filter(r => !r.skipped && !r.dry_run);
const ok     = active.filter(r => r.ok).length;
const failed = active.filter(r => !r.ok).length;
const skipped = results.filter(r => r.skipped).length;

const providersMap = {};
for (const r of results) {
  providersMap[r.provider] = {
    ok: r.ok,
    latency_ms: r.latency_ms,
    status_code: r.status_code,
    error_class: r.error_class,
    skipped: r.skipped || false,
    probe_kind: r.probe_kind,
    last_run: r.timestamp,
  };
}

const index = {
  generated_at: new Date().toISOString(),
  summary: {
    ok,
    failed,
    skipped,
    total: results.length,
  },
  providers: providersMap,
};

writeFileSync(INDEX_PATH, JSON.stringify(index, null, 2) + '\n');
console.log(`\n  Summary: ${ok} OK, ${failed} failed, ${skipped} skipped`);
console.log(`  Index written → ${INDEX_PATH}`);

// Exit 0 always (missing keys are not failures; only real errors are reported via issues)
process.exit(0);
