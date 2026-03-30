import type { HeaderMap } from '../types.js';
import { extractDomainFromAddressOrHost } from './common.js';

function firstMatch(values: string[] | undefined, patterns: RegExp[]): string | null {
  if (!values) return null;
  for (const value of values) {
    for (const pattern of patterns) {
      const match = value.match(pattern);
      if (match?.[1]) {
        return match[1];
      }
    }
  }
  return null;
}

export function extractEnvelopeDomain(headers: HeaderMap): string | null {
  const authResultsCandidate = firstMatch(headers['authentication-results'], [
    /smtp\.mailfrom=([^\s;]+)/i,
  ]);
  const fromAuth = extractDomainFromAddressOrHost(authResultsCandidate);
  if (fromAuth) return fromAuth;

  const receivedSpfCandidate = firstMatch(headers['received-spf'], [
    /envelope-from[=:\s]+<?([^\s;>]+)>?/i,
    /mailfrom[=:\s]+<?([^\s;>]+)>?/i,
  ]);
  const fromReceivedSpf = extractDomainFromAddressOrHost(receivedSpfCandidate);
  if (fromReceivedSpf) return fromReceivedSpf;

  const returnPathValue = headers['return-path']?.[0] || null;
  if (returnPathValue && returnPathValue.trim() === '<>') {
    return null;
  }
  return extractDomainFromAddressOrHost(returnPathValue);
}

export function extractFromDomain(headers: HeaderMap): string | null {
  const fromHeader = headers['from']?.[0] || null;
  return extractDomainFromAddressOrHost(fromHeader);
}
