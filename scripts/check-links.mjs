#!/usr/bin/env node
/**
 * check-links.mjs
 *
 * Scans all Markdown files in the repo for HTTP/HTTPS links and checks
 * if they resolve (HEAD request, 2s timeout, 2 retries).
 *
 * Usage:
 *   node scripts/check-links.mjs [options] [paths...]
 *
 * Options:
 *   --timeout <ms>    Request timeout per link in ms (default: 5000)
 *   --exclude <pat>   Regex pattern to exclude URLs (repeatable)
 *   --json            Output JSON report
 *   --fail-on-dead    Exit 1 if any dead links found (default: warns only)
 *   --help            Show this help
 *
 * Examples:
 *   node scripts/check-links.mjs docs/zh/01-openrouter.md
 *   node scripts/check-links.mjs --fail-on-dead docs/
 *   node scripts/check-links.mjs --exclude localhost --fail-on-dead
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT  = resolve(__dir, '..');

// ─── Args ─────────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
if (args.includes('--help')) {
  console.log(`Usage: node scripts/check-links.mjs [options] [paths...]

Options:
  --timeout <ms>    Per-link timeout ms (default: 5000)
  --exclude <pat>   Exclude URLs matching this regex (repeatable)
  --json            JSON output
  --fail-on-dead    Exit 1 on dead links
  --help            Show this help`);
  process.exit(0);
}

const FAIL_ON_DEAD = args.includes('--fail-on-dead');
const JSON_MODE    = args.includes('--json');
const toIdx        = args.indexOf('--timeout');
const TIMEOUT      = toIdx !== -1 ? parseInt(args[toIdx + 1], 10) : 5000;

// Collect --exclude patterns
const excludePatterns = [];
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--exclude' && args[i + 1]) {
    excludePatterns.push(new RegExp(args[i + 1], 'i'));
    i++;
  }
}
// Always exclude local/placeholder URLs
excludePatterns.push(
  /^http:\/\/localhost/,
  /^http:\/\/127\.0\.0\.1/,
  /host\.docker\.internal/,
  /YOUR_USERNAME/,
  /example\.com/,
);

// Target paths (defaults to docs/ + README)
const pathArgs = args.filter(a => !a.startsWith('-') && !args[args.indexOf(a) - 1]?.startsWith('-'));
const targetPaths = pathArgs.length > 0
  ? pathArgs.map(p => resolve(ROOT, p))
  : [resolve(ROOT, 'docs'), resolve(ROOT, 'README.md'), resolve(ROOT, 'README.en.md')];

// ─── Collect .md files ────────────────────────────────────────────────────────
function collectMdFiles(target) {
  const files = [];
  function walk(p) {
    const stat = statSync(p);
    if (stat.isDirectory()) {
      readdirSync(p).forEach(f => walk(join(p, f)));
    } else if (p.endsWith('.md')) {
      files.push(p);
    }
  }
  try { walk(target); } catch (_) {}
  return files;
}

const mdFiles = targetPaths.flatMap(collectMdFiles);

// ─── Extract links ────────────────────────────────────────────────────────────
const URL_RE = /https?:\/\/[^\s\)>\]"']+/g;

const linkMap = new Map(); // url → [files where found]
for (const file of mdFiles) {
  const text = readFileSync(file, 'utf8');
  const found = text.match(URL_RE) || [];
  for (const url of found) {
    // Strip trailing punctuation
    const clean = url.replace(/[.,;:!?)]+$/, '');
    if (!linkMap.has(clean)) linkMap.set(clean, []);
    linkMap.get(clean).push(file.replace(ROOT + '/', ''));
  }
}

// ─── Filter excluded ──────────────────────────────────────────────────────────
const linksToCheck = [...linkMap.keys()].filter(url =>
  !excludePatterns.some(pat => pat.test(url))
);

// ─── Check links ──────────────────────────────────────────────────────────────
async function checkLink(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT);
  try {
    const resp = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      headers: { 'User-Agent': 'free-api-key-project/link-checker' },
      redirect: 'follow',
    });
    clearTimeout(timer);
    return { url, ok: resp.status < 400, status: resp.status, error: null };
  } catch (err) {
    clearTimeout(timer);
    if (err.name === 'AbortError') return { url, ok: false, status: null, error: 'timeout' };
    return { url, ok: false, status: null, error: err.message };
  }
}

console.log(`\n🔗 Link Check`);
console.log(`   Scanning ${mdFiles.length} files, ${linksToCheck.length} unique URLs to check...\n`);

const CONCURRENCY = 5;
const results = [];

for (let i = 0; i < linksToCheck.length; i += CONCURRENCY) {
  const batch = linksToCheck.slice(i, i + CONCURRENCY);
  const batchResults = await Promise.all(batch.map(checkLink));
  results.push(...batchResults);
  if (!JSON_MODE) {
    for (const r of batchResults) {
      const icon = r.ok ? '✓' : '✗';
      const status = r.status ? ` [${r.status}]` : r.error ? ` [${r.error}]` : '';
      console.log(`  ${icon} ${r.url}${status}`);
    }
  }
}

// ─── Summary ──────────────────────────────────────────────────────────────────
const dead = results.filter(r => !r.ok);
const ok   = results.filter(r => r.ok);

if (JSON_MODE) {
  console.log(JSON.stringify({
    checked: results.length,
    ok: ok.length,
    dead: dead.length,
    dead_links: dead.map(r => ({
      url: r.url,
      status: r.status,
      error: r.error,
      found_in: linkMap.get(r.url) || [],
    })),
  }, null, 2));
} else {
  console.log(`\n  Summary: ${ok.length} OK, ${dead.length} dead\n`);
  if (dead.length > 0) {
    console.log('  Dead links:');
    for (const r of dead) {
      const files = (linkMap.get(r.url) || []).join(', ');
      console.log(`    ✗ ${r.url}`);
      console.log(`      Status: ${r.status ?? r.error ?? 'unknown'}`);
      console.log(`      Found in: ${files}`);
    }
    console.log('');
  }
}

process.exit(FAIL_ON_DEAD && dead.length > 0 ? 1 : 0);
