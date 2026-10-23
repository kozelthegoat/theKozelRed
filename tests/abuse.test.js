import { describe, it, expect } from 'vitest';
import { rejectReason, MIN_FILL_MS } from '../src/lib/abuse.js';

const clean = { website: '', elapsed: 5000, active: false };

describe('rejectReason', () => {
  it('lets a filled-in form through', () => {
    expect(rejectReason(clean)).toBeNull();
  });

  it('drops a request that filled the field nobody can see', () => {
    expect(rejectReason({ ...clean, website: 'https://spam.example' })).toBe('honeypot');
  });

  it('does not treat whitespace in the honeypot as a bot, so autofill cannot lock a person out', () => {
    expect(rejectReason({ ...clean, website: '   ' })).toBeNull();
  });

  it('drops a request that arrived faster than a person could type it', () => {
    expect(rejectReason({ ...clean, elapsed: MIN_FILL_MS - 1 })).toBe('too_fast');
    expect(rejectReason({ ...clean, elapsed: 0 })).toBe('too_fast');
  });

  it('accepts the boundary, so the threshold itself is not a rejection', () => {
    expect(rejectReason({ ...clean, elapsed: MIN_FILL_MS })).toBeNull();
  });

  it('treats a missing or unreadable timer as automated rather than as a person', () => {
    expect(rejectReason({ ...clean, elapsed: undefined })).toBe('too_fast');
    expect(rejectReason({ ...clean, elapsed: 'later' })).toBe('too_fast');
    expect(rejectReason({ ...clean, elapsed: -1 })).toBe('too_fast');
  });

  it('reads a timer that arrives as a string, because JSON shapes vary', () => {
    expect(rejectReason({ ...clean, elapsed: '5000' })).toBeNull();
  });

  it('rejects a second live request from the same address and says so', () => {
    expect(rejectReason({ ...clean, active: true })).toBe('already_pending');
  });

  it('answers the bot signal before the duplicate signal, so a bot learns nothing', () => {
    expect(rejectReason({ ...clean, website: 'x', active: true })).toBe('honeypot');
    expect(rejectReason({ ...clean, elapsed: 10, active: true })).toBe('too_fast');
  });

  it('survives being called with nothing', () => {
    expect(rejectReason()).toBe('too_fast');
  });
});
