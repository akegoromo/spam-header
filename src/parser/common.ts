const EMAIL_LIKE_REGEX = /([^\s<>"']+@[A-Z0-9.\-]+\.[A-Z]{2,63})/i;
const SIMPLE_DOMAIN_REGEX = /([A-Z0-9.-]+\.[A-Z]{2,63})/i;

export function normalizeDomain(input: string | null | undefined): string | null {
  if (!input) return null;

  let value = input.trim().toLowerCase();
  value = value.replace(/^<+|>+$/g, '');
  value = value.replace(/^\[|\]$/g, '');
  value = value.replace(/\.$/, '');

  if (!value || value === '<>' || !value.includes('.')) {
    return null;
  }

  return value;
}

function extractOriginalDomainFromSrsAddress(email: string): string | null {
  const at = email.lastIndexOf('@');
  if (at < 0) return null;

  const localPart = email.slice(0, at).replace(/^"+|"+$/g, '');
  if (!/^SRS[01][=+\-]/i.test(localPart)) {
    return null;
  }

  const tokens = localPart.split(/[=+\-]/).filter(Boolean);
  for (let i = tokens.length - 1; i >= 0; i--) {
    const domain = normalizeDomain(tokens[i]);
    if (domain) {
      return domain;
    }
  }

  return null;
}

export function extractDomainFromAddressOrHost(input: string | null | undefined): string | null {
  if (!input) return null;

  const cleaned = input.replace(/[;,]+/g, ' ').trim();

  const emailMatch = cleaned.match(EMAIL_LIKE_REGEX);
  if (emailMatch?.[1]) {
    const email = emailMatch[1].replace(/^"+|"+$/g, '');

    const srsDomain = extractOriginalDomainFromSrsAddress(email);
    if (srsDomain) {
      return srsDomain;
    }

    const at = email.lastIndexOf('@');
    if (at >= 0) {
      return normalizeDomain(email.slice(at + 1));
    }
  }

  const domainMatch = cleaned.match(SIMPLE_DOMAIN_REGEX);
  if (domainMatch?.[1]) {
    return normalizeDomain(domainMatch[1]);
  }

  return null;
}

export function uniqueNonEmpty(values: Array<string | null | undefined>): string[] {
  return [...new Set(values.filter((value): value is string => Boolean(value)))];
}
