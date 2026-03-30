import fs from 'node:fs/promises';
import path from 'node:path';
import type { Connection } from 'mysql2/promise';
import type { Config } from '../config.js';
import type { ParsedMessage, ProcessingResult } from '../types.js';
import { extractAuthResults } from '../parser/auth.js';
import { uniqueNonEmpty } from '../parser/common.js';
import { extractEnvelopeDomain, extractFromDomain } from '../parser/domains.js';
import { extractSourceIpCandidates } from '../parser/ip.js';
import { parseHeaders } from '../parser/rawHeaders.js';
import { resolveBestIpForDomain } from '../network/dns.js';
import { lookupAsnByIp } from '../network/asn.js';
import {
  getCachedAsn,
  insertProcessedMessage,
  isMessageProcessed,
  upsertAsnStat,
  upsertAuthComboStat,
  upsertAuthResultStat,
  upsertDomainAsnStat,
  upsertDomainAuthStat,
  upsertDomainStats,
  upsertIpAsnCache,
} from '../db/mysql.js';

async function buildParsedMessage(filePath: string, config: Config, connection: Connection): Promise<ParsedMessage> {
  const raw = await fs.readFile(filePath, 'utf8');
  const headers = parseHeaders(raw);
  const messageId = path.basename(filePath, '.txt');
  const envelopeDomain = extractEnvelopeDomain(headers);
  const fromDomain = extractFromDomain(headers);
  const domains = uniqueNonEmpty([envelopeDomain, fromDomain]);
  const auth = extractAuthResults(headers);
  const combinedResult = `${auth.spf}/${auth.dkim}/${auth.dmarc}`;

  const sourceIpCandidates = extractSourceIpCandidates(headers);
  let sourceIp = sourceIpCandidates[0] || null;

  if (!sourceIp) {
    for (const domain of domains.slice(0, config.domainLookupMaxCandidates)) {
      sourceIp = await resolveBestIpForDomain(domain);
      if (sourceIp) break;
    }
  }

  let asnMeta = null;
  let asn: string | null = null;
  if (sourceIp && config.teamCymruEnabled) {
    asnMeta = await getCachedAsn(connection, sourceIp);
    if (!asnMeta) {
      asnMeta = await lookupAsnByIp(sourceIp);
      if (asnMeta) {
        await upsertIpAsnCache(connection, sourceIp, asnMeta);
      }
    }
    asn = asnMeta?.asn || null;
  }

  return {
    messageId,
    filePath,
    envelopeDomain,
    fromDomain,
    domains,
    auth,
    combinedResult,
    sourceIp,
    asn,
    asnMeta,
  };
}

export async function processFile(filePath: string, config: Config, connection: Connection): Promise<ProcessingResult> {
  const messageId = path.basename(filePath, '.txt');

  if (await isMessageProcessed(connection, messageId)) {
    return { messageId, status: 'skipped', reason: 'already processed' };
  }

  try {
    await connection.beginTransaction();
    const parsed = await buildParsedMessage(filePath, config, connection);

    if (await isMessageProcessed(connection, messageId)) {
      await connection.rollback();
      return { messageId, status: 'skipped', reason: 'already processed by another run' };
    }

    if (parsed.envelopeDomain) {
      await upsertDomainStats(connection, parsed.envelopeDomain, 'envelope', parsed.sourceIp, parsed.asn);
    }
    if (parsed.fromDomain && parsed.fromDomain !== parsed.envelopeDomain) {
      await upsertDomainStats(connection, parsed.fromDomain, 'from', parsed.sourceIp, parsed.asn);
    }

    await upsertAuthResultStat(connection, 'spf', parsed.auth.spf);
    await upsertAuthResultStat(connection, 'dkim', parsed.auth.dkim);
    await upsertAuthResultStat(connection, 'dmarc', parsed.auth.dmarc);

    for (const domain of parsed.domains) {
      await upsertDomainAuthStat(connection, domain, 'spf', parsed.auth.spf);
      await upsertDomainAuthStat(connection, domain, 'dkim', parsed.auth.dkim);
      await upsertDomainAuthStat(connection, domain, 'dmarc', parsed.auth.dmarc);
    }

    await upsertAuthComboStat(connection, parsed);

    if (parsed.asn) {
      await upsertAsnStat(connection, parsed.asn);
      for (const domain of parsed.domains) {
        await upsertDomainAsnStat(connection, domain, parsed.asn);
      }
    }

    await insertProcessedMessage(connection, parsed);
    await connection.commit();

    return { messageId, status: 'processed' };
  } catch (error) {
    await connection.rollback();
    return {
      messageId,
      status: 'failed',
      reason: error instanceof Error ? error.message : 'unknown error',
    };
  }
}
