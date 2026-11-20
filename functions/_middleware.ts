// Cloudflare Pages middleware: runs before every request to this site (pages, files and /api).
// All behaviour is in server/site-gate.ts. Nothing is served to a visitor who has not entered the site password.
//
// Runtime variable (Cloudflare Pages → Settings → Variables and Secrets, for BOTH Production and Preview):
//   SITE_PASSWORD   an encrypted SECRET of at least 12 characters. If it is missing, the site shows an error
//                   page to everyone: it never opens up.
import { gate, type GateEnv } from '../server/site-gate.ts';

export const onRequest = (context: { request: Request; env: GateEnv; next: () => Promise<Response> }): Promise<Response> =>
  gate(context.request, context.env, context.next);
