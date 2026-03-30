import fs from 'node:fs/promises';
import path from 'node:path';
import { getConfig } from './config.js';
import { createTidbConnection } from './db/mysql.js';
import { processFile } from './services/processFile.js';

async function listSpamFiles(directory: string): Promise<string[]> {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  return entries
    .filter(entry => entry.isFile() && entry.name.endsWith('.txt'))
    .map(entry => path.join(directory, entry.name))
    .sort((a, b) => a.localeCompare(b));
}

async function main(): Promise<void> {
  const config = getConfig();
  const files = await listSpamFiles(config.spamDirectory);

  if (files.length === 0) {
    console.log('No files found in spam directory.');
    return;
  }

  const connection = await createTidbConnection(config.tidbDatabaseUrl);
  let processed = 0;
  let skipped = 0;
  let failed = 0;

  try {
    for (const filePath of files) {
      const result = await processFile(filePath, config, connection);
      if (result.status === 'processed') processed += 1;
      if (result.status === 'skipped') skipped += 1;
      if (result.status === 'failed') failed += 1;
      console.log(JSON.stringify({ filePath, ...result }));
    }
  } finally {
    await connection.end();
  }

  console.log(JSON.stringify({ total: files.length, processed, skipped, failed }));
  if (failed > 0) {
    process.exitCode = 1;
  }
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
