import type { HeaderMap, ParsedAuthResults } from '../types.js';

const KNOWN_SPF = new Set(['pass', 'fail', 'softfail', 'neutral', 'none', 'temperror', 'permerror']);
const KNOWN_DKIM = new Set(['pass', 'fail', 'none', 'temperror', 'permerror']);
const KNOWN_DMARC = new Set(['pass', 'fail', 'none', 'temperror', 'permerror']);

function normalizeResult(value: string | null, known: Set<string>): string {
  if (!value) return 'missing';
  const normalized = value.trim().toLowerCase();
  return known.has(normalized) ? normalized : normalized || 'missing';
}

function extractFromAuthenticationResults(headers: HeaderMap, method: 'spf' | 'dkim' | 'dmarc'): string | null {
  const values = headers['authentication-results'] || [];
  const pattern = new RegExp(`${method}\\s*=\\s*([a-z0-9_-]+)`, 'i');
  for (const value of values) {
    const match = value.match(pattern);
    if (match?.[1]) return match[1];
  }
  return null;
}

function extractSpfFallback(headers: HeaderMap): string | null {
  const values = headers['received-spf'] || [];
  for (const value of values) {
    const startMatch = value.match(/^(pass|fail|softfail|neutral|none|temperror|permerror)\b/i);
    if (startMatch?.[1]) return startMatch[1];
    const anyMatch = value.match(/\b(pass|fail|softfail|neutral|none|temperror|permerror)\b/i);
    if (anyMatch?.[1]) return anyMatch[1];
  }
  return null;
}

export function extractAuthResults(headers: HeaderMap): ParsedAuthResults {
  const spf = normalizeResult(extractFromAuthenticationResults(headers, 'spf') || extractSpfFallback(headers), KNOWN_SPF);
  const dkim = normalizeResult(extractFromAuthenticationResults(headers, 'dkim'), KNOWN_DKIM);
  const dmarc = normalizeResult(extractFromAuthenticationResults(headers, 'dmarc'), KNOWN_DMARC);
  return { spf, dkim, dmarc };
}
