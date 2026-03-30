const SIMPLE_EMAIL_REGEX = /([A-Z0-9._%+\-']+@[A-Z0-9.\-]+\.[A-Z]{2,63})/i;
const SIMPLE_DOMAIN_REGEX = /([A-Z0-9.-]+\.[A-Z]{2,63})/i;

export function normalizeDomain(input: string | null | undefined): string | null {
  if (!input) return null;
  let value = input.trim().toLowerCase();
  value = value.replace(/^<+|>+$/g, '');
  value = value.replace(/^\[|\]$/g, '');
  value = value.replace(/\.$/, '');
  if (!value || value === '<>' || !value.includes('.')) return null;
  return value;
}

export function extractDomainFromAddressOrHost(input: string | null | undefined): string | null {
  if (!input) return null;
  const emailMatch = input.match(SIMPLE_EMAIL_REGEX);
  if (emailMatch) {
    const domain = emailMatch[1].split('@')[1];
    return normalizeDomain(domain);
  }

  const cleaned = input.replace(/[;,"]+/g, ' ').trim();
  const domainMatch = cleaned.match(SIMPLE_DOMAIN_REGEX);
  if (domainMatch) {
    return normalizeDomain(domainMatch[1]);
  }

  return null;
}

export function uniqueNonEmpty(values: Array<string | null | undefined>): string[] {
  return [...new Set(values.filter((value): value is string => Boolean(value)))];
}
