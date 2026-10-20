// Applies the saved light/dark choice (or the system setting) before the page paints, so it does
// not flash light first. A file from our own origin, so a strict Content-Security-Policy
// (script-src 'self') allows it without a hash or nonce. Same rule as src/lib/theme.ts:
// only 'light' or 'dark' count as a choice; anything else means "follow the system".
try {
  var saved = localStorage.getItem('zakazi.theme')
  var dark =
    saved === 'light' || saved === 'dark'
      ? saved === 'dark'
      : window.matchMedia('(prefers-color-scheme: dark)').matches
  if (dark) document.documentElement.classList.add('dark')
} catch (e) {
  // Storage or matchMedia unavailable: stay light.
}
