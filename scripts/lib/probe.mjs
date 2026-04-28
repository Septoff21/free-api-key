/**
 * probe.mjs — Low-level HTTP probes for each provider.
 *
 * Each probe sends the minimal possible request to verify a key is valid
 * and returns a structured result. Never logs key values.
 *
 * Exported: probeProvider(providerKey, env) → ProbeResult
 */

/** @typedef {{ ok: boolean, status: number|null, latencyMs: number, rpmRemaining: number|null, rpdRemaining: number|null, error: string|null }} ProbeResult */

const TIMEOUT_MS = 10_000;

/**
 * Perform a fetch with a timeout.
 * @param {string} url
 * @param {RequestInit} opts
 * @returns {Promise<Response>}
 */
async function fetchWithTimeout(url, opts = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, { ...opts, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Parse a rate-limit header to integer or null.
 * @param {Headers} headers
 * @param {string[]} names
 * @returns {number|null}
 */
function parseRLHeader(headers, names) {
  for (const name of names) {
    const val = headers.get(name);
    if (val !== null && val !== undefined) {
      const n = parseInt(val, 10);
      if (!isNaN(n)) return n;
    }
  }
  return null;
}

// ─── Individual probes ────────────────────────────────────────────────────────

async function probeOpenRouter(env) {
  const key = env.OPENROUTER_API_KEY;
  if (!key) return { ok: false, status: null, latencyMs: 0, rpmRemaining: null, rpdRemaining: null, error: "OPENROUTER_API_KEY not set" };

  const t0 = Date.now();
  let resp;
  try {
    resp = await fetchWithTimeout("https://openrouter.ai/api/v1/auth/key", {
      headers: { Authorization: `Bearer ${key}` },
    });
  } catch (e) {
    return { ok: false, status: null, latencyMs: Date.now() - t0, rpmRemaining: null, rpdRemaining: null, error: e.message };
  }

  const latencyMs = Date.now() - t0;
  const rpdRemaining = parseRLHeader(resp.headers, ["x-ratelimit-remaining-requests", "x-ratelimit-remaining"]);
  const rpmRemaining = parseRLHeader(resp.headers, ["x-ratelimit-remaining-requests-minute"]);

  // Parse JSON for rate limit data if available
  let rpdFromBody = null;
  if (resp.ok) {
    try {
      const body = await resp.json();
      if (body?.data?.rate_limit?.requests_remaining !== undefined) {
        rpdFromBody = body.data.rate_limit.requests_remaining;
      }
    } catch { /* ignore */ }
  }

  return {
    ok: resp.status === 200,
    status: resp.status,
    latencyMs,
    rpmRemaining,
    rpdRemaining: rpdFromBody ?? rpdRemaining,
    error: resp.ok ? null : `HTTP ${resp.status}`,
  };
}

async function probeGemini(env) {
  const key = env.GEMINI_API_KEY;
  if (!key) return { ok: false, status: null, latencyMs: 0, rpmRemaining: null, rpdRemaining: null, error: "GEMINI_API_KEY not set" };

  const t0 = Date.now();
  let resp;
  try {
    resp = await fetchWithTimeout(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`,
    );
  } catch (e) {
    return { ok: false, status: null, latencyMs: Date.now() - t0, rpmRemaining: null, rpdRemaining: null, error: e.message };
  }

  return {
    ok: resp.status === 200,
    status: resp.status,
    latencyMs: Date.now() - t0,
    rpmRemaining: null,
    rpdRemaining: null,
    error: resp.ok ? null : `HTTP ${resp.status}`,
  };
}

async function probeGroq(env) {
  const key = env.GROQ_API_KEY;
  if (!key) return { ok: false, status: null, latencyMs: 0, rpmRemaining: null, rpdRemaining: null, error: "GROQ_API_KEY not set" };

  const t0 = Date.now();
  let resp;
  try {
    resp = await fetchWithTimeout("https://api.groq.com/openai/v1/models", {
      headers: { Authorization: `Bearer ${key}` },
    });
  } catch (e) {
    return { ok: false, status: null, latencyMs: Date.now() - t0, rpmRemaining: null, rpdRemaining: null, error: e.message };
  }

  return {
    ok: resp.status === 200,
    status: resp.status,
    latencyMs: Date.now() - t0,
    rpmRemaining: parseRLHeader(resp.headers, ["x-ratelimit-remaining-requests"]),
    rpdRemaining: parseRLHeader(resp.headers, ["x-ratelimit-remaining-requests-day"]),
    error: resp.ok ? null : `HTTP ${resp.status}`,
  };
}

async function probeCerebras(env) {
  const key = env.CEREBRAS_API_KEY;
  if (!key) return { ok: false, status: null, latencyMs: 0, rpmRemaining: null, rpdRemaining: null, error: "CEREBRAS_API_KEY not set" };

  const t0 = Date.now();
  let resp;
  try {
    resp = await fetchWithTimeout("https://api.cerebras.ai/v1/models", {
      headers: { Authorization: `Bearer ${key}` },
    });
  } catch (e) {
    return { ok: false, status: null, latencyMs: Date.now() - t0, rpmRemaining: null, rpdRemaining: null, error: e.message };
  }

  return {
    ok: resp.status === 200,
    status: resp.status,
    latencyMs: Date.now() - t0,
    rpmRemaining: parseRLHeader(resp.headers, ["x-ratelimit-remaining", "x-ratelimit-remaining-requests"]),
    rpdRemaining: null,
    error: resp.ok ? null : `HTTP ${resp.status}`,
  };
}

async function probeGitHubModels(env) {
  const key = env.GITHUB_TOKEN;
  if (!key) return { ok: false, status: null, latencyMs: 0, rpmRemaining: null, rpdRemaining: null, error: "GITHUB_TOKEN not set" };

  const t0 = Date.now();
  let resp;
  try {
    resp = await fetchWithTimeout("https://models.github.ai/catalog/models", {
      headers: {
        Authorization: `Bearer ${key}`,
        Accept: "application/json",
      },
    });
  } catch (e) {
    return { ok: false, status: null, latencyMs: Date.now() - t0, rpmRemaining: null, rpdRemaining: null, error: e.message };
  }

  return {
    ok: resp.status === 200,
    status: resp.status,
    latencyMs: Date.now() - t0,
    rpmRemaining: null,
    rpdRemaining: null,
    error: resp.ok ? null : `HTTP ${resp.status}`,
  };
}

async function probeMistral(env) {
  const key = env.MISTRAL_API_KEY;
  if (!key) return { ok: false, status: null, latencyMs: 0, rpmRemaining: null, rpdRemaining: null, error: "MISTRAL_API_KEY not set" };

  const t0 = Date.now();
  let resp;
  try {
    resp = await fetchWithTimeout("https://api.mistral.ai/v1/models", {
      headers: { Authorization: `Bearer ${key}` },
    });
  } catch (e) {
    return { ok: false, status: null, latencyMs: Date.now() - t0, rpmRemaining: null, rpdRemaining: null, error: e.message };
  }

  return {
    ok: resp.status === 200,
    status: resp.status,
    latencyMs: Date.now() - t0,
    rpmRemaining: parseRLHeader(resp.headers, ["x-ratelimit-remaining", "ratelimitremaining"]),
    rpdRemaining: null,
    error: resp.ok ? null : `HTTP ${resp.status}`,
  };
}

async function probeCloudflare(env) {
  const token = env.CLOUDFLARE_API_TOKEN;
  const accountId = env.CLOUDFLARE_ACCOUNT_ID;
  if (!token) return { ok: false, status: null, latencyMs: 0, rpmRemaining: null, rpdRemaining: null, error: "CLOUDFLARE_API_TOKEN not set" };
  if (!accountId) return { ok: false, status: null, latencyMs: 0, rpmRemaining: null, rpdRemaining: null, error: "CLOUDFLARE_ACCOUNT_ID not set" };

  const t0 = Date.now();
  let resp;
  try {
    resp = await fetchWithTimeout(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/models/search`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
  } catch (e) {
    return { ok: false, status: null, latencyMs: Date.now() - t0, rpmRemaining: null, rpdRemaining: null, error: e.message };
  }

  return {
    ok: resp.status === 200,
    status: resp.status,
    latencyMs: Date.now() - t0,
    rpmRemaining: null,
    rpdRemaining: null,
    error: resp.ok ? null : `HTTP ${resp.status}`,
  };
}

async function probeOllama(env) {
  const baseUrl = env.OLLAMA_BASE_URL || "http://localhost:11434";
  const t0 = Date.now();
  let resp;
  try {
    resp = await fetchWithTimeout(`${baseUrl}/api/tags`);
  } catch (e) {
    return {
      ok: false,
      status: null,
      latencyMs: Date.now() - t0,
      rpmRemaining: null,
      rpdRemaining: null,
      error: `Cannot reach Ollama at ${baseUrl} — is 'ollama serve' running?`,
    };
  }

  let modelCount = null;
  if (resp.ok) {
    try {
      const body = await resp.json();
      modelCount = body?.models?.length ?? 0;
    } catch { /* ignore */ }
  }

  return {
    ok: resp.status === 200,
    status: resp.status,
    latencyMs: Date.now() - t0,
    rpmRemaining: null,
    rpdRemaining: null,
    error: resp.ok ? null : `HTTP ${resp.status}`,
    extra: modelCount !== null ? `${modelCount} model(s) downloaded` : undefined,
  };
}

// ─── Dispatcher ───────────────────────────────────────────────────────────────

const PROBES = {
  openrouter: probeOpenRouter,
  gemini: probeGemini,
  groq: probeGroq,
  cerebras: probeCerebras,
  github_models: probeGitHubModels,
  mistral: probeMistral,
  cloudflare: probeCloudflare,
  ollama: probeOllama,
};

/**
 * @param {string} providerKey - e.g. "openrouter"
 * @param {Record<string,string>} env - process.env or similar
 * @returns {Promise<ProbeResult>}
 */
export async function probeProvider(providerKey, env) {
  const fn = PROBES[providerKey];
  if (!fn) return { ok: false, status: null, latencyMs: 0, rpmRemaining: null, rpdRemaining: null, error: `Unknown provider: ${providerKey}` };
  return fn(env);
}

export const PROVIDER_KEYS = Object.keys(PROBES);
