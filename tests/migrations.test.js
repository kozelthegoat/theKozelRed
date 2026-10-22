import { describe, it, expect } from 'vitest';
import { migrationFiles, pendingFrom, parseExecuteJson } from '../scripts/lib/migrations.mjs';

describe('migrationFiles', () => {
  it('keeps only .sql files, in the order they must run', () => {
    expect(migrationFiles(['0002-second.sql', 'README.md', '0001-first.sql', '.DS_Store'])).toEqual([
      '0001-first.sql',
      '0002-second.sql'
    ]);
  });

  it('orders by number, not by whatever the directory happens to return', () => {
    expect(migrationFiles(['0010-ten.sql', '0009-nine.sql', '0002-two.sql'])).toEqual([
      '0002-two.sql',
      '0009-nine.sql',
      '0010-ten.sql'
    ]);
  });

  it('is empty when there are no migrations', () => {
    expect(migrationFiles([])).toEqual([]);
  });
});

describe('pendingFrom', () => {
  const files = ['0001-first.sql', '0002-second.sql', '0003-third.sql'];

  it('is everything on disk when nothing has been applied', () => {
    expect(pendingFrom(files, [])).toEqual({ pending: files, missing: [] });
  });

  it('is only what the database has not recorded yet', () => {
    expect(pendingFrom(files, ['0001-first.sql'])).toEqual({
      pending: ['0002-second.sql', '0003-third.sql'],
      missing: []
    });
  });

  it('is empty when the database is up to date', () => {
    expect(pendingFrom(files, files)).toEqual({ pending: [], missing: [] });
  });

  it('reports a recorded migration whose file is gone, without calling it pending', () => {
    expect(pendingFrom(files, [...files, '0009-deleted.sql'])).toEqual({
      pending: [],
      missing: ['0009-deleted.sql']
    });
  });

  it('ignores the order the applied names arrive in', () => {
    expect(pendingFrom(files, ['0003-third.sql', '0001-first.sql'])).toEqual({
      pending: ['0002-second.sql'],
      missing: []
    });
  });
});

describe('parseExecuteJson', () => {
  const wrapped = (rows) =>
    JSON.stringify([{ results: rows, success: true, meta: { duration: 0.4, changes: 0 } }]);

  it('reads the names out of wrangler d1 execute --json', () => {
    const out = `npm notice run the-kozel-red@0.1.0 npx\n${wrapped([
      { name: '0001-first.sql' },
      { name: '0002-second.sql' }
    ])}\n`;
    expect(parseExecuteJson(out)).toEqual(['0001-first.sql', '0002-second.sql']);
  });

  it('reads an empty table as nothing applied', () => {
    expect(parseExecuteJson(wrapped([]))).toEqual([]);
  });

  it('ignores a bracketed warning printed before the JSON', () => {
    const out = `▲ [WARNING] D1 is not available in some regions\n${wrapped([{ name: '0001-first.sql' }])}`;
    expect(parseExecuteJson(out)).toEqual(['0001-first.sql']);
  });

  it('treats a missing d1_migrations table as nothing applied', () => {
    expect(parseExecuteJson('Error: no such table: d1_migrations')).toEqual([]);
  });

  it('fails loudly rather than guessing when the output is not JSON', () => {
    expect(() => parseExecuteJson('✘ [ERROR] authentication error')).toThrow(/authentication error/);
  });
});
