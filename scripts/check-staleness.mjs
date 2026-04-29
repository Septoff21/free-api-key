#!/usr/bin/env node
/**
 * check-staleness.mjs
 *
 * Reads providers.json and checks how long ago each provider's
 * last_verified date was. Exits with code 1 if any provider exceeds
 * the --max-age threshold (default 90 days).
 *
 * Usage:
 *   node scripts/check-staleness.mjs [options]
 *
 * Options:
 *   --max-age <days>   Fail if any provider exceeds this age (default: 90)
 *   --warn-only        Print warnings but always exit 0
 *   --json             Output JSON instead of human-readable
 *   --help             Show this help
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT  = resolve(__dir, '..');

// ─── Args ─────────────────────────────────────────────────────────────────────
const args     = process.argv.slice(2);
if (args.includes('--help')) {
  console.log(`
Usage: node scripts/check-staleness.mjs [options]

Options:
  --max-age <days>   Fail if any provider exceeds this age (default: 90)
  --warn-only        Print warnings but always exit 0
  --json             Output JSON
  --help             Show this help
`.trim());
  process.exit(0);
}

const WARN_ONLY = args.includes('--warn-only');
const JSON_MODE = args.includes('--json');
const maxAgeIdx = args.indexOf('--max-age');
const MAX_AGE   = maxAgeIdx !== -1 ? parseInt(args[maxAgeIdx + 1], 10) : 90;

// ─── Status thresholds ────────────────────────────────────────────────────────
const THRESHOLDS = [
  { days: MAX_AGE, label: '🔴 OUTDATED', symbol: 'outdated' },
  { days: 60,      label: '🟠 STALE',    symbol: 'stale'    },
  { days: 30,      label: '🟡 AGING',    symbol: 'aging'    },
  { days: 0,       label: '✅ FRESH',    symbol: 'fresh'    },
];

function getStatus(ageDays) {
  for (const t of THRESHOLDS) {
    if (ageDays >= t.days) return { ...t, age: ageDays };
  }
  return { days: 0, label: '✅ FRESH', symbol: 'fresh', age: ageDays };
}

// ─── Load providers.json ──────────────────────────────────────────────────────
const providersPath = resolve(ROOT, 'providers.json');
const { providers } = JSON.parse(readFileSync(providersPath, 'utf8'));

const now     = new Date();
const results = [];
let hasFailure = false;

for (const p of providers) {
  const lv      = p.last_verified;
  let ageDays   = Infinity;
  let dateStr   = 'MISSING';

  if (lv) {
    const lvDate = new Date(lv);
    ageDays  = Math.floor((now - lvDate) / 86_400_000);
    dateStr  = lv;
  }

  const status = getStatus(ageDays);
  if (status.symbol === 'outdated') hasFailure = true;

  results.push({
    key:          p.key,
    last_verified: dateStr,
    age_days:     ageDays === Infinity ? null : ageDays,
    status:       status.symbol,
    label:        status.label,
  });
}

// ─── Output ───────────────────────────────────────────────────────────────────
if (JSON_MODE) {
  const out = {
    max_age_days: MAX_AGE,
    checked_at: now.toISOString(),
    has_failure: hasFailure && !WARN_ONLY,
    providers: results,
  };
  console.log(JSON.stringify(out, null, 2));
} else {
  console.log(`\n📅 Staleness Check (max-age: ${MAX_AGE} days, checked: ${now.toISOString().slice(0,10)})\n`);
  const pad = (s, n) => String(s).padEnd(n);

  console.log(`  ${pad('Provider', 18)} ${pad('last_verified', 14)} ${pad('Age (days)', 12)} Status`);
  console.log('  ' + '-'.repeat(65));

  for (const r of results) {
    const age = r.age_days === null ? '  MISSING' : String(r.age_days).padStart(8);
    console.log(`  ${pad(r.key, 18)} ${pad(r.last_verified, 14)} ${age}      ${r.label}`);
  }

  const outdated = results.filter(r => r.status === 'outdated');
  const stale    = results.filter(r => r.status === 'stale');
  const aging    = results.filter(r => r.status === 'aging');

  console.log('');
  if (outdated.length) {
    console.log(`  ❌ ${outdated.length} provider(s) OUTDATED (>${MAX_AGE} days): ${outdated.map(r => r.key).join(', ')}`);
  }
  if (stale.length) {
    console.log(`  ⚠️  ${stale.length} provider(s) STALE (>60 days): ${stale.map(r => r.key).join(', ')}`);
  }
  if (aging.length) {
    console.log(`  ℹ️  ${aging.length} provider(s) AGING (>30 days): ${aging.map(r => r.key).join(', ')}`);
  }
  if (!outdated.length && !stale.length) {
    console.log('  ✅ All providers are fresh!');
  }
  console.log('');
}

if (hasFailure && !WARN_ONLY) {
  if (!JSON_MODE) console.error(`  FAIL: one or more providers exceed ${MAX_AGE}-day staleness gate.`);
  process.exit(1);
}

process.exit(0);
