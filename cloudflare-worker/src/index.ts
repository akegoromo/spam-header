import { connect } from '@tidbcloud/serverless';

export interface Env {
  DATABASE_URL: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const limit = Math.min(Number(url.searchParams.get('limit') || '100'), 1000);
    const conn = connect({ url: env.DATABASE_URL });
    const rows = await conn.execute(
      'SELECT domain, total_count, envelope_from_count, header_from_count, last_ip, last_asn, first_seen_at, last_seen_at FROM v_domain_list ORDER BY total_count DESC, domain ASC LIMIT ?',
      [limit],
    );

    return new Response(JSON.stringify({ count: Array.isArray(rows) ? rows.length : 0, rows }, null, 2), {
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'public, max-age=300',
      },
    });
  },
};
