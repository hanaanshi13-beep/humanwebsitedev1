// Cloudflare Pages Function: POST /api/waitlist
// All behaviour is in server/waitlist-core.ts. This file only hands the request and the environment to it.
//
// Runtime variables (Cloudflare Pages → Settings → Variables and Secrets). None is needed, and none should be set,
// on the investor-facing site:
//   WAITLIST_ENABLED      "true" to accept registrations. Anything else, or absent: every request is refused.
//   SUPABASE_URL          https://<project-ref>.supabase.co
//   SUPABASE_SECRET_KEY   the project's secret key. Add it as an encrypted SECRET, never as plain text,
//                         and never under a name that starts with PUBLIC_.
import { handleWaitlistRequest, type WaitlistEnv } from '../../server/waitlist-core.ts';

export const onRequest = (context: { request: Request; env: WaitlistEnv }): Promise<Response> =>
  handleWaitlistRequest(context.request, context.env);
