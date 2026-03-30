import dns from 'node:dns/promises';

export async function resolveBestIpForDomain(domain: string): Promise<string | null> {
  try {
    const mx = await dns.resolveMx(domain);
    const sortedMx = mx.sort((a, b) => a.priority - b.priority);
    for (const record of sortedMx) {
      const ip = await resolveHostIp(record.exchange);
      if (ip) return ip;
    }
  } catch {
    // ignore and fall back
  }

  return resolveHostIp(domain);
}

async function resolveHostIp(hostname: string): Promise<string | null> {
  try {
    const ipv4 = await dns.resolve4(hostname);
    if (ipv4.length > 0) return ipv4[0];
  } catch {
    // continue
  }

  try {
    const ipv6 = await dns.resolve6(hostname);
    if (ipv6.length > 0) return ipv6[0];
  } catch {
    // continue
  }

  return null;
}
