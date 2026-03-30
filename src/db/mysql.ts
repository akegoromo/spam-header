import mysql, { type Connection, type RowDataPacket } from 'mysql2/promise';
import type { AsnLookupResult, AuthType, ParsedMessage } from '../types.js';

export async function createTidbConnection(databaseUrl: string): Promise<Connection> {
  return mysql.createConnection({
    uri: databaseUrl,
    ssl: { rejectUnauthorized: true },
    multipleStatements: false,
  });
}

export async function isMessageProcessed(connection: Connection, messageId: string): Promise<boolean> {
  const [rows] = await connection.execute<RowDataPacket[]>(
    'SELECT message_id FROM processed_messages WHERE message_id = ? LIMIT 1',
    [messageId],
  );
  return rows.length > 0;
}

export async function getCachedAsn(connection: Connection, ip: string): Promise<AsnLookupResult | null> {
  const [rows] = await connection.execute<RowDataPacket[]>(
    'SELECT asn, bgp_prefix, country_code, registry_name, allocated_at, source FROM ip_asn_cache WHERE ip = ? LIMIT 1',
    [ip],
  );
  if (rows.length === 0) return null;
  const row = rows[0];
  return {
    asn: String(row.asn),
    bgpPrefix: row.bgp_prefix ? String(row.bgp_prefix) : null,
    countryCode: row.country_code ? String(row.country_code) : null,
    registryName: row.registry_name ? String(row.registry_name) : null,
    allocatedAt: row.allocated_at ? String(row.allocated_at) : null,
    source: 'team_cymru_dns',
  };
}

export async function upsertIpAsnCache(connection: Connection, ip: string, asnMeta: AsnLookupResult): Promise<void> {
  await connection.execute(
    `INSERT INTO ip_asn_cache (ip, asn, bgp_prefix, country_code, registry_name, allocated_at, source, last_confirmed_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
     ON DUPLICATE KEY UPDATE
       asn = VALUES(asn),
       bgp_prefix = VALUES(bgp_prefix),
       country_code = VALUES(country_code),
       registry_name = VALUES(registry_name),
       allocated_at = VALUES(allocated_at),
       source = VALUES(source),
       last_confirmed_at = CURRENT_TIMESTAMP`,
    [ip, asnMeta.asn, asnMeta.bgpPrefix, asnMeta.countryCode, asnMeta.registryName, asnMeta.allocatedAt, asnMeta.source],
  );
}

export async function upsertDomainStats(
  connection: Connection,
  domain: string,
  origin: 'envelope' | 'from',
  sourceIp: string | null,
  asn: string | null,
): Promise<void> {
  const envelopeIncrement = origin === 'envelope' ? 1 : 0;
  const fromIncrement = origin === 'from' ? 1 : 0;
  await connection.execute(
    `INSERT INTO domain_stats (domain, total_count, envelope_from_count, header_from_count, first_seen_at, last_seen_at, last_ip, last_asn)
     VALUES (?, 1, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, ?, ?)
     ON DUPLICATE KEY UPDATE
       total_count = total_count + 1,
       envelope_from_count = envelope_from_count + VALUES(envelope_from_count),
       header_from_count = header_from_count + VALUES(header_from_count),
       last_seen_at = CURRENT_TIMESTAMP,
       last_ip = VALUES(last_ip),
       last_asn = VALUES(last_asn)`,
    [domain, envelopeIncrement, fromIncrement, sourceIp, asn],
  );
}

export async function upsertAuthResultStat(connection: Connection, authType: AuthType, authResult: string): Promise<void> {
  await connection.execute(
    `INSERT INTO auth_result_stats (auth_type, auth_result, encounter_count)
     VALUES (?, ?, 1)
     ON DUPLICATE KEY UPDATE encounter_count = encounter_count + 1`,
    [authType, authResult],
  );
}

export async function upsertDomainAuthStat(
  connection: Connection,
  domain: string,
  authType: AuthType,
  authResult: string,
): Promise<void> {
  await connection.execute(
    `INSERT INTO domain_auth_stats (domain, auth_type, auth_result, encounter_count)
     VALUES (?, ?, ?, 1)
     ON DUPLICATE KEY UPDATE encounter_count = encounter_count + 1`,
    [domain, authType, authResult],
  );
}

export async function upsertAuthComboStat(connection: Connection, parsed: ParsedMessage): Promise<void> {
  await connection.execute(
    `INSERT INTO auth_combo_stats (spf_result, dkim_result, dmarc_result, encounter_count)
     VALUES (?, ?, ?, 1)
     ON DUPLICATE KEY UPDATE encounter_count = encounter_count + 1`,
    [parsed.auth.spf, parsed.auth.dkim, parsed.auth.dmarc],
  );
}

export async function upsertAsnStat(connection: Connection, asn: string): Promise<void> {
  await connection.execute(
    `INSERT INTO asn_stats (asn, encounter_count, first_seen_at, last_seen_at)
     VALUES (?, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
     ON DUPLICATE KEY UPDATE encounter_count = encounter_count + 1, last_seen_at = CURRENT_TIMESTAMP`,
    [asn],
  );
}

export async function upsertDomainAsnStat(connection: Connection, domain: string, asn: string): Promise<void> {
  await connection.execute(
    `INSERT INTO domain_asn_stats (domain, asn, encounter_count)
     VALUES (?, ?, 1)
     ON DUPLICATE KEY UPDATE encounter_count = encounter_count + 1`,
    [domain, asn],
  );
}

export async function insertProcessedMessage(connection: Connection, parsed: ParsedMessage): Promise<void> {
  await connection.execute(
    `INSERT INTO processed_messages (
      message_id, file_path, envelope_domain, from_domain,
      spf_result, dkim_result, dmarc_result, combined_result,
      source_ip, asn, processed_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
    [
      parsed.messageId,
      parsed.filePath,
      parsed.envelopeDomain,
      parsed.fromDomain,
      parsed.auth.spf,
      parsed.auth.dkim,
      parsed.auth.dmarc,
      parsed.combinedResult,
      parsed.sourceIp,
      parsed.asn,
    ],
  );
}
