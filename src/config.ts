export interface Config {
  tidbDatabaseUrl: string;
  spamDirectory: string;
  teamCymruEnabled: boolean;
  domainLookupMaxCandidates: number;
}

export function getConfig(): Config {
  const tidbDatabaseUrl = process.env.TIDB_DATABASE_URL?.trim();
  if (!tidbDatabaseUrl) {
    throw new Error('TIDB_DATABASE_URL is required.');
  }

  return {
    tidbDatabaseUrl,
    spamDirectory: process.env.SPAM_DIRECTORY?.trim() || 'spam',
    teamCymruEnabled: (process.env.TEAM_CYMRU_ENABLED?.trim() || 'true').toLowerCase() !== 'false',
    domainLookupMaxCandidates: Number(process.env.DOMAIN_LOOKUP_MAX_CANDIDATES || '5') || 5,
  };
}
