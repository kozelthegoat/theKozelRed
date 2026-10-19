// iOS only applies :active to a link when something up the tree is listening for a touch, so a
// tapped button shows no press state at all without this — the tap just navigates. The listener
// does nothing; its existence is the entire fix, and it is the documented workaround rather than a
// trick. Passive, because it never calls preventDefault and should not delay the scroll.
document.addEventListener('touchstart', () => {}, { passive: true });
