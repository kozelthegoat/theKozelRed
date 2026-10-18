// The one place that knows which collection the notes live in. Everything else works on entries,
// which is what keeps the ordering and date rules testable without a framework.
import { getCollection } from 'astro:content';
import { published } from './notes.js';

export const publishedNotes = async () => published(await getCollection('notes'));
