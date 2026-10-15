export const json = (data, init = {}) =>
  new Response(JSON.stringify({ data }), {
    status: init.status ?? 200,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store', ...(init.headers || {}) }
  });

export const jsonError = (code, message, status = 400) =>
  new Response(JSON.stringify({ error: { code, message } }), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' }
  });
