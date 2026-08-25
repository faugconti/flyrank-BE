const { TimeoutError } = require('../errors');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function isTimeout(err) {
  return err?.name === 'APIConnectionTimeoutError' || err instanceof TimeoutError;
}

function retryAfterMs(err) {
  const header = err?.headers?.get?.('retry-after') ?? err?.headers?.['retry-after'];
  if (!header) return null;
  const seconds = Number(header);
  if (!Number.isNaN(seconds)) return seconds * 1000;
  const date = Date.parse(header);
  if (!Number.isNaN(date)) return Math.max(0, date - Date.now());
  return null;
}

function isRetryable(err) {
  if (isTimeout(err)) return true;
  const status = err?.status;
  if (status === 429) return true;
  if (typeof status === 'number' && status >= 500) return true;
  return false;
}

async function withRetry(fn, { maxAttempts = 3, onRetry } = {}) {
  let lastErr;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await fn(attempt);
    } catch (err) {
      lastErr = err;

      const status = err?.status;
      if (typeof status === 'number' && status >= 400 && status < 500 && status !== 429) {
        throw err; // 400/401/403: never retried — fail fast
      }
      if (attempt >= maxAttempts || !isRetryable(err)) {
        throw err;
      }

      const waitMs = retryAfterMs(err) ?? Math.min(1000 * 2 ** (attempt - 1), 4000) + Math.floor(Math.random() * 500);
      if (onRetry) onRetry({ attempt, next_wait_ms: waitMs, status: status ?? null, timeout: isTimeout(err) });
      await sleep(waitMs);
    }
  }

  throw lastErr;
}

module.exports = { withRetry, isTimeout };
