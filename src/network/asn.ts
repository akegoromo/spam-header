import dns from 'node:dns/promises';
import type { AsnLookupResult } from '../types.js';

function buildTeamCymruQuery(ip: string): string {
  if (ip.includes(':')) {
    const expanded = expandIpv6(ip);
    const nibbles = expanded.replace(/:/g, '').split('').reverse().join('.');
    return `${nibbles}.origin6.asn.cymru.com`;
  }

  const reversed = ip.split('.').reverse().join('.');
  return `${reversed}.origin.asn.cymru.com`;
}

function expandIpv6(ip: string): string {
  const [head, tail] = ip.split('::');
  const headParts = head ? head.split(':').filter(Boolean) : [];
  const tailParts = tail ? tail.split(':').filter(Boolean) : [];
  const missing = 8 - (headParts.length + tailParts.length);
  const full = [
    ...headParts,
    ...Array.from({ length: Math.max(missing, 0) }, () => '0'),
    ...tailParts,
  ].map(part => part.padStart(4, '0'));
  return full.join(':');
}

export async function lookupAsnByIp(ip: string): Promise<AsnLookupResult | null> {
  try {
    const query = buildTeamCymruQuery(ip);
    const records = await dns.resolveTxt(query);
    const text = records.map(parts => parts.join('')).join(' ');
    if (!text) return null;

    const [asnRaw, bgpPrefix, countryCode, registryName, allocatedAt] = text
      .replace(/^"|"$/g, '')
      .split('|')
      .map(part => part.trim());

    const asn = (asnRaw || '').split(/\s+/)[0]?.replace(/^AS/i, '') || null;
    if (!asn) return null;

    return {
      asn,
      bgpPrefix: bgpPrefix || null,
      countryCode: countryCode || null,
      registryName: registryName || null,
      allocatedAt: allocatedAt || null,
      source: 'team_cymru_dns',
    };
  } catch {
    return null;
  }
}
