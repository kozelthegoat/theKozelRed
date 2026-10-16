// Listing parameters for the /me requests table: sorting + pagination live in the URL
// and in SQL, so the page stays a plain server-rendered document.
//
// Everything user-supplied is resolved through COLUMNS — the parsed values are what get
// interpolated into the query (never the raw input), and dir is coerced to ASC/DESC.
const COLUMNS = {
  slot_date: 'slot_date',
  type: 'type',
  name: 'name',
  email: 'email',
  status: 'status',
  created_at: 'created_at'
};

export const PAGE_SIZE = 20;
export const DEFAULT_SORT = 'slot_date';
export const DEFAULT_DIR = 'asc';
export const SORTABLE = Object.keys(COLUMNS);

export function parseSort(params = new URLSearchParams()) {
  const wanted = String(params?.get?.('sort') ?? '');
  const dir = String(params?.get?.('dir') ?? '').toLowerCase() === 'desc' ? 'desc' : 'asc';
  return { sort: COLUMNS[wanted] ? wanted : DEFAULT_SORT, dir };
}

export function parsePage(params = new URLSearchParams()) {
  const page = Math.floor(Number(params?.get?.('page')));
  return Number.isFinite(page) && page >= 1 ? page : 1;
}

export function listParams(searchParams, total, pageSize = PAGE_SIZE) {
  const { sort, dir } = parseSort(searchParams);
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(parsePage(searchParams), pages);
  return { sort, dir, page, pages, pageSize, offset: (page - 1) * pageSize };
}

export function listSql(sort, dir) {
  const column = COLUMNS[sort] || DEFAULT_SORT;
  const direction = dir === 'desc' ? 'DESC' : 'ASC';
  return `SELECT id, type, slot_date, slot_time, name, email, note, status, created_at FROM requests ORDER BY ${column} ${direction}, id ${direction} LIMIT ? OFFSET ?`;
}

export function listHref({ sort, dir, page }, overrides = {}) {
  const next = { sort, dir, page, ...overrides };
  return `/me?${new URLSearchParams({ sort: next.sort, dir: next.dir, page: String(next.page) })}`;
}

// The decline notice goes out on the transition only. Without this, declining an
// already-declined request emails the requester again — and the buttons used to allow
// confirm/decline toggling, so a few clicks meant a few emails.
export function shouldSendDecline(prevStatus, nextStatus) {
  return nextStatus === 'declined' && prevStatus !== 'declined';
}
