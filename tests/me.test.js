import { describe, it, expect } from 'vitest';
import {
  PAGE_SIZE,
  parseSort,
  parsePage,
  parsePast,
  listParams,
  listSql,
  listHref,
  shouldSendDecline,
  shouldSendConfirm,
  statusLabel,
  SORTABLE
} from '../src/lib/requests.js';

const q = (s) => new URLSearchParams(s);

const SELECT =
  'SELECT id, type, slot_date, slot_time, name, email, note, status, created_at, (SELECT COUNT(*) FROM requests r WHERE r.email = requests.email) AS email_count FROM requests';

describe('parseSort', () => {
  it('defaults to when-ascending', () => {
    expect(parseSort(q(''))).toEqual({ sort: 'slot_date', dir: 'asc' });
  });

  it('accepts whitelisted columns and both directions', () => {
    expect(parseSort(q('sort=name&dir=desc'))).toEqual({ sort: 'name', dir: 'desc' });
    expect(parseSort(q('sort=created_at&dir=ASC'))).toEqual({ sort: 'created_at', dir: 'asc' });
  });

  it('refuses anything not on the whitelist', () => {
    expect(parseSort(q('sort=slot_date;DROP TABLE requests'))).toEqual({
      sort: 'slot_date',
      dir: 'asc'
    });
    expect(parseSort(q('sort=note'))).toEqual({ sort: 'slot_date', dir: 'asc' });
    expect(parseSort(q('dir=sideways'))).toEqual({ sort: 'slot_date', dir: 'asc' });
  });

  it('tolerates a missing searchParams object', () => {
    expect(parseSort()).toEqual({ sort: 'slot_date', dir: 'asc' });
  });
});

describe('parsePage', () => {
  it('defaults to 1 for absent, junk, zero and negative values', () => {
    for (const v of ['', 'page=', 'page=0', 'page=-4', 'page=abc', 'page=2.7']) {
      expect(parsePage(q(v))).toBe(v === 'page=2.7' ? 2 : 1);
    }
    expect(parsePage()).toBe(1);
  });

  it('passes through whole positive numbers', () => {
    expect(parsePage(q('page=3'))).toBe(3);
    expect(parsePage(q('page=007'))).toBe(7);
  });
});

describe('parsePast', () => {
  it('is off unless the URL asks for it', () => {
    expect(parsePast(q(''))).toBe(false);
    expect(parsePast(q('past=0'))).toBe(false);
    expect(parsePast(q('past=true'))).toBe(false);
    expect(parsePast(q('past=yes'))).toBe(false);
  });

  it('turns on only for past=1', () => {
    expect(parsePast(q('past=1'))).toBe(true);
  });

  it('tolerates a missing searchParams object', () => {
    expect(parsePast()).toBe(false);
  });
});

describe('listParams', () => {
  it('computes pages and offset for a full page', () => {
    const p = listParams(q('page=2'), 45);
    expect(p).toEqual({
      sort: 'slot_date',
      dir: 'asc',
      page: 2,
      pages: 3,
      pageSize: PAGE_SIZE,
      offset: 20,
      past: false
    });
  });

  it('clamps a page past the end', () => {
    expect(listParams(q('page=99'), 45).page).toBe(3);
    expect(listParams(q('page=99'), 45).offset).toBe(40);
  });

  it('always has at least one page, even with no rows', () => {
    const p = listParams(q('page=5'), 0);
    expect(p.pages).toBe(1);
    expect(p.page).toBe(1);
    expect(p.offset).toBe(0);
  });

  it('rounds a partial last page up', () => {
    expect(listParams(q(''), 21).pages).toBe(2);
    expect(listParams(q(''), 20).pages).toBe(1);
  });

  it('carries the past filter', () => {
    expect(listParams(q('past=1'), 45).past).toBe(true);
    expect(listParams(q(''), 45).past).toBe(false);
  });
});

describe('listSql', () => {
  it('orders by the whitelisted column, with id as the tie-breaker', () => {
    expect(listSql('name', 'desc')).toBe(
      `${SELECT} WHERE slot_date >= ? ORDER BY name DESC, id DESC LIMIT ? OFFSET ?`
    );
  });

  it('drops the date filter when past rows are asked for', () => {
    expect(listSql('name', 'desc', { includePast: true })).toBe(
      `${SELECT} ORDER BY name DESC, id DESC LIMIT ? OFFSET ?`
    );
    expect(listSql('name', 'desc', { includePast: true })).not.toContain('slot_date >= ?');
  });

  it('counts every request from the same address, for the repeat badge', () => {
    expect(listSql('name', 'asc')).toContain('AS email_count');
    expect(listSql('name', 'asc')).toContain('r.email = requests.email');
  });

  it('never lets a hostile value reach the SQL', () => {
    const sql = listSql('name; DROP TABLE requests', 'desc; --');
    expect(sql).toContain('ORDER BY slot_date ASC');
    expect(sql).not.toContain('DROP');
    expect(sql).not.toContain(';');
  });
});

describe('listHref', () => {
  it('carries sort, dir and page', () => {
    expect(listHref({ sort: 'email', dir: 'desc', page: 3 })).toBe(
      '/me?sort=email&dir=desc&page=3'
    );
  });

  it('applies overrides', () => {
    expect(listHref({ sort: 'name', dir: 'asc', page: 4 }, { page: 1 })).toBe(
      '/me?sort=name&dir=asc&page=1'
    );
    expect(listHref({ sort: 'name', dir: 'asc', page: 4 }, { dir: 'desc' })).toBe(
      '/me?sort=name&dir=desc&page=4'
    );
  });

  it('carries the past filter through sort and page links', () => {
    expect(listHref({ sort: 'name', dir: 'asc', page: 2, past: true })).toBe(
      '/me?sort=name&dir=asc&page=2&past=1'
    );
    expect(listHref({ sort: 'name', dir: 'asc', page: 2, past: false })).toBe(
      '/me?sort=name&dir=asc&page=2'
    );
  });

  it('leaves past out when it is not in the view', () => {
    expect(listHref({ sort: 'name', dir: 'asc', page: 1 })).not.toContain('past');
  });
});

describe('SORTABLE', () => {
  it('lists exactly the sortable columns, in display order', () => {
    expect(SORTABLE).toEqual(['slot_date', 'type', 'name', 'email', 'status', 'created_at']);
  });
});

describe('shouldSendDecline', () => {
  it('fires only on the move into declined', () => {
    expect(shouldSendDecline('new', 'declined')).toBe(true);
    expect(shouldSendDecline('confirmed', 'declined')).toBe(true);
  });

  it('stays quiet when already declined, or when not declining', () => {
    expect(shouldSendDecline('declined', 'declined')).toBe(false);
    expect(shouldSendDecline('new', 'confirmed')).toBe(false);
    expect(shouldSendDecline('declined', 'confirmed')).toBe(false);
  });
});

describe('shouldSendConfirm', () => {
  it('fires only on the move into confirmed', () => {
    expect(shouldSendConfirm('new', 'confirmed')).toBe(true);
    expect(shouldSendConfirm('declined', 'confirmed')).toBe(true);
  });

  it('stays quiet on a re-confirm, or when not confirming', () => {
    expect(shouldSendConfirm('confirmed', 'confirmed')).toBe(false);
    expect(shouldSendConfirm('new', 'declined')).toBe(false);
    expect(shouldSendConfirm('confirmed', 'declined')).toBe(false);
  });
});

describe('statusLabel', () => {
  it('names a status the way a person reads it', () => {
    expect(statusLabel('new')).toBe('Pending');
    expect(statusLabel('confirmed')).toBe('Confirmed');
    expect(statusLabel('declined')).toBe('Declined');
  });

  it('does not invent a word for a status it has never seen', () => {
    expect(statusLabel('archived')).toBe('archived');
    expect(statusLabel(undefined)).toBe('');
  });
});
