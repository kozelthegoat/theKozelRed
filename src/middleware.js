import { SECURITY_HEADERS } from './lib/headers.js';

// Runs for Worker/SSR responses only (static pages are served from assets and get
// their headers from public/_headers).
export const onRequest = async (_context, next) => {
  const response = await next();
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(name, value);
  }
  return response;
};
