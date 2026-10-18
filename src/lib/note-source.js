// The one place that knows which collection the notes live in. Everything else works on entries,
// which is what keeps the ordering, language and date rules testable without a framework.
import { getCollection } from 'astro:content';
import { published, notesIn } from './notes.js';
import { defaultLocale } from '../i18n/config.mjs';

export const publishedNotes = async (locale = defaultLocale) =>
  notesIn(await getCollection('notes'), locale);

// Every published note in every language — what a switcher needs to know which translations exist.
export const allNotes = async () => published(await getCollection('notes'));
