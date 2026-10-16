import { describe, it, expect } from 'vitest';
import { signAction, verifyAction, actionExpiry, ACTION_TTL_DAYS } from '../src/lib/action.js';

const KEY = 'test-key';
const NOW = 1_800_000_000_000;

describe('action tokens', () => {
  it('round-trips a decision', async () => {
    const token = await signAction({ id: 7, status: 'confirmed', exp: NOW + 1000 }, KEY);
    expect(await verifyAction(token, KEY, NOW)).toEqual({ id: 7, status: 'confirmed' });
  });

  it('rejects a token signed with another key', async () => {
    const token = await signAction({ id: 7, status: 'confirmed', exp: NOW + 1000 }, 'other-key');
    expect(await verifyAction(token, KEY, NOW)).toBeNull();
  });

  it('rejects a changed decision — the signature covers it', async () => {
    const token = await signAction({ id: 7, status: 'confirmed', exp: NOW + 1000 }, KEY);
    const [id, , exp, sig] = token.split('.');
    expect(await verifyAction(`${id}.declined.${exp}.${sig}`, KEY, NOW)).toBeNull();
  });

  it('rejects a changed request id', async () => {
    const token = await signAction({ id: 7, status: 'declined', exp: NOW + 1000 }, KEY);
    const [, status, exp, sig] = token.split('.');
    expect(await verifyAction(`8.${status}.${exp}.${sig}`, KEY, NOW)).toBeNull();
  });

  it('rejects an extended expiry', async () => {
    const token = await signAction({ id: 7, status: 'declined', exp: NOW + 1000 }, KEY);
    const [id, status, , sig] = token.split('.');
    expect(await verifyAction(`${id}.${status}.${NOW + 9999999}.${sig}`, KEY, NOW)).toBeNull();
  });

  it('rejects an expired token', async () => {
    const token = await signAction({ id: 7, status: 'declined', exp: NOW - 1 }, KEY);
    expect(await verifyAction(token, KEY, NOW)).toBeNull();
  });

  it('only carries the two decisions an email can offer', async () => {
    const token = await signAction({ id: 7, status: 'new', exp: NOW + 1000 }, KEY);
    expect(await verifyAction(token, KEY, NOW)).toBeNull();
  });

  it('shrugs off junk', async () => {
    for (const junk of ['', 'a', 'a.b.c', 'a.b.c.d', '...', null, undefined]) {
      expect(await verifyAction(junk, KEY, NOW)).toBeNull();
    }
  });

  it('expires the configured number of days out', () => {
    expect(actionExpiry(NOW) - NOW).toBe(ACTION_TTL_DAYS * 24 * 60 * 60 * 1000);
  });
});
