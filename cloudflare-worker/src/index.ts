import { connect } from '@tidbcloud/serverless';

export interface Env {
  DATABASE_URL: string;
  API_KEY: string;
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const providedApiKey = request.headers.get('X-API-Key');

    if (!providedApiKey) {
      return jsonResponse(
        {
          error: 'missing_api_key',
          message: 'X-API-Key header is required.',
        },
        401,
      );
    }

    if (providedApiKey !== env.API_KEY) {
      return jsonResponse(
        {
          error: 'invalid_api_key',
          message: 'The supplied API key is invalid.',
        },
        403,
      );
    }

    if (request.method !== 'GET') {
      return jsonResponse(
        {
          error: 'method_not_allowed'
        },
        405
      );
    }

    const url = new URL(request.url);
    const limit = Math.min(Number(url.searchParams.get('limit') || '100'), 1000);

    const conn = connect({ url: env.DATABASE_URL });
    const rows = await conn.execute(
      'SELECT domain, total_count, envelope_from_count, header_from_count, last_ip, last_asn, first_seen_at, last_seen_at FROM v_domain_list ORDER BY total_count DESC, domain ASC LIMIT ?',
      [limit],
    );

    return jsonResponse({
      count: Array.isArray(rows) ? rows.length : 0,
      rows,
    });
  },
};
