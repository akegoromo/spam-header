import type { HeaderMap } from '../types.js';

export function parseHeaders(raw: string): HeaderMap {
  const map: HeaderMap = {};
  const lines = raw.split(/\r?\n/);
  let currentName: string | null = null;

  for (const line of lines) {
    if (/^\s/.test(line) && currentName) {
      const values = map[currentName];
      values[values.length - 1] = `${values[values.length - 1]} ${line.trim()}`;
      continue;
    }

    const match = line.match(/^([^:]+):(.*)$/);
    if (!match) {
      continue;
    }

    const name = match[1].trim().toLowerCase();
    const value = match[2].trim();
    currentName = name;
    if (!map[name]) {
      map[name] = [];
    }
    map[name].push(value);
  }

  return map;
}
