// The arithmetic behind the pinned crossfade, with no DOM in it, so the awkward part can be
// tested without a browser. The page passes in where the section starts and how much scrolling it
// is worth; this decides which quote is showing and how full the progress rail should be.
//
// `stickLength` is the scroll distance the pin lasts — the section's height minus the viewport,
// because the sticky element is one viewport tall and stays stuck for whatever is left.
export function slideState({ scrollY, top, stickLength, count }) {
  if (!count) return { index: 0, progress: 0 };
  const raw = stickLength > 0 ? (scrollY - top) / stickLength : 1;
  const progress = Math.min(1, Math.max(0, raw));
  // Clamped at the last quote rather than running off the end, because progress reaches exactly 1
  // at the foot of the section and floor(1 * count) is count.
  const index = Math.min(count - 1, Math.floor(progress * count));
  return { index, progress };
}
