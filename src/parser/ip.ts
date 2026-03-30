import type { HeaderMap } from '../types.js';

const IPV4_REGEX = /\b(?:\d{1,3}\.){3}\d{1,3}\b/g;
const IPV6_REGEX = /\b(?:[0-9a-f]{1,4}:){2,}[0-9a-f:]{1,4}\b/ig;

function isLikelyIpv4(ip: string): boolean {
  const parts = ip.split('.').map(Number);
  return parts.length === 4 && parts.every(part => Number.isInteger(part) && part >= 0 && part <= 255);
}

export function extractSourceIpCandidates(headers: HeaderMap): string[] {
  const found = new Set<string>();

  for (const value of headers['authentication-results'] || []) {
    const match = value.match(/client-ip=([^\s;]+)/i);
    if (match?.[1]) found.add(match[1]);
  }

  for (const value of headers['received-spf'] || []) {
    const match = value.match(/client-ip=([^\s;]+)/i);
    if (match?.[1]) found.add(match[1]);
    for (const ipv4 of value.match(IPV4_REGEX) || []) {
      if (isLikelyIpv4(ipv4)) found.add(ipv4);
    }
  }

  for (const value of headers['received'] || []) {
    for (const ipv4 of value.match(IPV4_REGEX) || []) {
      if (isLikelyIpv4(ipv4)) found.add(ipv4);
    }
    for (const ipv6 of value.match(IPV6_REGEX) || []) {
      found.add(ipv6);
    }
  }

  return [...found];
}
