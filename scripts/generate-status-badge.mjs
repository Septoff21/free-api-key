#!/usr/bin/env node
/**
 * generate-status-badge.mjs
 *
 * Reads data/health/_index.json and writes data/health/badge.json
 * in shields.io endpoint format.
 *
 * Color rules:
 *   8/8 OK  → green
 *   6-7/8   → yellow
 *   ≤ 5/8   → red
 *   0 data  → grey (never run yet)
 *
 * Usage:
 *   node scripts/generate-status-badge.mjs [--index <path>] [--out <path>]
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT   = resolve(__dir, '..');

const args    = process.argv.slice(2);
const idxArg  = args.indexOf('--index');
const outArg  = args.indexOf('--out');

const INDEX_PATH = idxArg !== -1 ? args[idxArg + 1] : resolve(ROOT, 'data/health/_index.json');
const BADGE_PATH = outArg !== -1 ? args[outArg + 1] : resolve(ROOT, 'data/health/badge.json');

// ─── Read index ───────────────────────────────────────────────────────────────
if (!existsSync(INDEX_PATH)) {
  console.error(`Index not found: ${INDEX_PATH}`);
  process.exit(1);
}

const index = JSON.parse(readFileSync(INDEX_PATH, 'utf8'));
const { ok, total, skipped } = index.summary;
const active = total - skipped;   // providers that were actually tested

// ─── Determine color ──────────────────────────────────────────────────────────
function pickColor(okCount, activeCount) {
  if (activeCount === 0) return 'grey';
  const ratio = okCount / activeCount;
  if (ratio >= 1.0)   return 'brightgreen';
  if (ratio >= 0.875) return 'yellow';       // 7/8
  if (ratio >= 0.75)  return 'orange';       // 6/8
  return 'red';
}

const color   = pickColor(ok, active);
const message = active === 0 ? 'not tested' : `${ok}/${active} OK`;

const badge = {
  schemaVersion: 1,
  label: 'providers',
  message,
  color,
  // Optional: include last-run date as a named logo or suffix
  // (shields.io doesn't support this directly, but we record it for reference)
  _generated_at: index.generated_at,
};

writeFileSync(BADGE_PATH, JSON.stringify(badge, null, 2) + '\n');
console.log(`Badge written → ${BADGE_PATH}`);
console.log(`  label="${badge.label}" message="${badge.message}" color="${badge.color}"`);
