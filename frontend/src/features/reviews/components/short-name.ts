// "Milena Vukovic" -> "Milena V.": reviews are public, so only a first name and the initial of the
// last word. Normalized (NFC) and by whole characters, so "Šarić" keeps its "Š" and an emoji is not
// cut in half. The real backend takes the name from the account profile instead (docs/entities.md).
export function shortName(fullName: string) {
  const words = fullName.normalize('NFC').trim().split(/\s+/).filter(Boolean)
  const first = words[0] ?? ''
  if (words.length < 2) return first
  const initial = Array.from(words[words.length - 1])[0] ?? ''
  return `${first} ${initial.toUpperCase()}.`
}
