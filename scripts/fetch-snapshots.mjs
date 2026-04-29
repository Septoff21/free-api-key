#!/usr/bin/env node
/**
 * fetch-snapshots.mjs
 *
 * Fetches official provider pages (limits_url, policy_url from providers.json),
 * computes SHA-256 of the response body, and compares against stored snapshots.
 * Prints "CHANGED:<provider>" lines to stdout for the CI workflow to capture.
 *
 * Usage:
 *   node scripts/fetch-snapshots.mjs [--output <dir>] [--dry-run]
 *
 * Options:
 *   --output <dir>   Directory to write/read snapshots (default: data/snapshots)
 *   --dry-run        Fetch and compare but don't write new snapshots
 *   --help           Show this help
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createHash } from 'crypto';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT  = resolve(__dir, '..');

const args     = process.argv.slice(2);
if (args.includes('--help')) {
  console.log(`Usage: node scripts/fetch-snapshots.mjs [--output <dir>] [--dry-run]`);
  process.exit(0);
}

const DRY_RUN   = args.includes('--dry-run');
const outIdx    = args.indexOf('--output');
const SNAP_DIR  = outIdx !== -1 ? resolve(args[outIdx + 1]) : resolve(ROOT, 'data/snapshots');

mkdirSync(SNAP_DIR, { recursive: true });

// ─── Load providers ───────────────────────────────────────────────────────────
const { providers } = JSON.parse(readFileSync(resolve(ROOT, 'providers.json'), 'utf8'));

const TIMEOUT_MS = 20_000;

async function fetchWithTimeout(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const resp = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'free-api-key-project/freshness-check' },
    });
    clearTimeout(timer);
    return await resp.text();
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

function sha256(text) {
  return createHash('sha256').update(text).digest('hex');
}

function snapPath(providerKey, pageType) {
  return resolve(SNAP_DIR, `${providerKey}.${pageType}.json`);
}

// ─── Main ─────────────────────────────────────────────────────────────────────
console.log(`\n🔍 Fetching provider page snapshots`);
console.log(`   ${new Date().toISOString()}`);
if (DRY_RUN) console.log('   Mode: DRY-RUN (no writes)\n');
else console.log('');

const changedProviders = new Set();

for (const provider of providers) {
  const pages = [
    { type: 'limits',  url: provider.limits_url },
    { type: 'privacy', url: provider.privacy?.policy_url },
  ].filter(p => p.url);

  for (const page of pages) {
    const key = provider.key;
    process.stdout.write(`  ${key.padEnd(16)} [${page.type}] `);

    let text = '';
    let fetchError = null;
    try {
      text = await fetchWithTimeout(page.url);
    } catch (err) {
      fetchError = err.message || String(err);
    }

    const currentHash  = text ? sha256(text) : null;
    const currentBytes = text ? Buffer.byteLength(text) : 0;
    const snapFile     = snapPath(key, page.type);
    const now          = new Date().toISOString();

    if (fetchError) {
      console.log(`✗ fetch error: ${fetchError}`);
      continue;
    }

    // Load previous snapshot (if exists)
    let prevSnap = null;
    if (existsSync(snapFile)) {
      try { prevSnap = JSON.parse(readFileSync(snapFile, 'utf8')); } catch (_) {}
    }

    const changed = prevSnap && prevSnap.sha256 !== currentHash;
    const isNew   = !prevSnap;

    if (changed) {
      console.log(`⚠️  CHANGED (${prevSnap.sha256.slice(0, 8)}… → ${currentHash.slice(0, 8)}…)`);
      changedProviders.add(key);
    } else if (isNew) {
      console.log(`✓  NEW snapshot saved (${currentHash.slice(0, 8)}…, ${currentBytes} bytes)`);
    } else {
      console.log(`✓  unchanged (${currentHash.slice(0, 8)}…)`);
    }

    // Write updated snapshot
    if (!DRY_RUN) {
      const snap = {
        provider: key,
        page_type: page.type,
        url: page.url,
        fetched_at: now,
        sha256: currentHash,
        size_bytes: currentBytes,
        prev_sha256: prevSnap?.sha256 ?? null,
        changed,
      };
      writeFileSync(snapFile, JSON.stringify(snap, null, 2) + '\n');
    }
  }
}

console.log('');

// Emit CHANGED: lines for CI parsing
for (const p of changedProviders) {
  console.log(`CHANGED:${p}`);
}

if (changedProviders.size === 0) {
  console.log('No page changes detected.');
}

process.exit(0);
