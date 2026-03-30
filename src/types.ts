export type AuthType = 'spf' | 'dkim' | 'dmarc';

export interface HeaderMap {
  [name: string]: string[];
}

export interface ParsedAuthResults {
  spf: string;
  dkim: string;
  dmarc: string;
}

export interface ParsedMessage {
  messageId: string;
  filePath: string;
  envelopeDomain: string | null;
  fromDomain: string | null;
  domains: string[];
  auth: ParsedAuthResults;
  combinedResult: string;
  sourceIp: string | null;
  asn: string | null;
  asnMeta: AsnLookupResult | null;
}

export interface ProcessingResult {
  messageId: string;
  status: 'processed' | 'skipped' | 'failed';
  reason?: string;
}

export interface AsnLookupResult {
  asn: string;
  bgpPrefix: string | null;
  countryCode: string | null;
  registryName: string | null;
  allocatedAt: string | null;
  source: 'team_cymru_dns';
}
