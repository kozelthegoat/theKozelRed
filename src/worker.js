// The Astro handler, plus the one scheduled job this site has: retention.
//
// `main` in wrangler.jsonc points here rather than at the adapter's default entrypoint because a
// Worker's `scheduled` handler has to live on the entry module. `handle` *is* that default handler,
// so this file adds nothing to the request path — it only names it.
import { handle } from '@astrojs/cloudflare/handler';
import { availability } from './data/sessions.js';
import { nowInTz } from './lib/tz.js';
import { purgeExpired, recordRetentionRun, lastRetentionRun, isStale, RETENTION_DAYS } from './lib/retention.js';

export default {
  fetch: (request, env, ctx) => handle(request, env, ctx),

  // Daily, per wrangler.jsonc. "Today" is the schedule's day, not the server's.
  async scheduled(_event, env) {
    const today = nowInTz(availability.timezone).date;

    // Say so in the log if the previous run is old: a cron that resumed after a gap leaves a
    // record of the gap, rather than looking like it always ran.
    const previous = await lastRetentionRun(env.DB);
    if (isStale(previous)) {
      console.warn(`[retention] previous run was ${previous ?? 'never'} — the schedule may have missed`);
    }

    const removed = await purgeExpired(env.DB, today);
    await recordRetentionRun(env.DB, new Date().toISOString());
    console.log(`[retention] deleted ${removed} request(s) older than ${RETENTION_DAYS} days (${today})`);
  }
};
