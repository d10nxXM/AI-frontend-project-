# Zakazi.me: design

## Product

Zakazi.me lets people book an appointment at a hair salon, gym or service shop by picking one
of the business's free time slots.

## Users

- **Clients** who browse businesses and book a free slot
- **Business owners and staff** who publish free slots and manage bookings
- Age 18–45, on every device: phone, tablet and desktop. Every screen must work equally well
  at 375 px and at 1440 px.

## Tone

Simple, modern, professional.

- One main action per screen, short labels ("Book", "Cancel booking"), no marketing copy
- Calm layouts with plenty of white space; red is the only accent

## Visuals

- **Colors** (tokens live in `src/index.css`):
  - Light mode: white background, near-black text, crimson red `primary`
    (`oklch(0.52 0.2 22)`, about `#C8102E`) for the main action
  - Dark mode (`.dark` class on `<html>`): near-black background (`oklch(0.14 0 0)`, not pure
    `#000`), light text, a slightly lighter red `primary` (`oklch(0.56 0.2 22)`) so it stays visible on the dark
    background while white text on it keeps at least 4.5:1
  - Which mode: the system setting by default; the moon/sun toggle in the header overrides it and is
    remembered in this browser (`src/lib/theme.ts`, applied by `public/theme-init.js` before the first paint)
  - Ratings: stars are filled with the foreground color (never red) and the number is always written next
    to them, so a rating is never shown by color alone
  - Everything else (muted, borders, inputs) is neutral gray with no hue
  - `destructive` is a darker, more orange red so errors and deletions are not confused with the
    primary action; destructive actions always also carry an icon and a text label
- **Fonts:** Inter for headings and body (one font). Use `tabular-nums` for times, dates and
  prices so slot times line up.
- **Shape:** slightly rounded corners (`--radius: 0.5rem`, 8 px). Elements are separated with thin
  borders; shadows only on dialogs, dropdown menus and popovers.
- **Images:**
  - Business list: small business photo (64 px square on mobile, 16:9 card image on desktop)
  - Business detail: one larger 16:9 cover photo above the name and free slots
  - No image: neutral `muted` background with the category icon from `lucide-react`
    (`Scissors` for hair salons, `Dumbbell` for gyms, `Wrench` for service shops)
  - Mock images come from a placeholder service with fixed URLs so they do not change on reload
- **Icons:** `lucide-react` only.

## Time slots

- Free, booked and selected slots differ by text and style, never by color alone: a booked slot
  says "Booked" and is disabled, the selected slot is filled with `primary`
- Times use 24-hour format (`09:30`)

## References

None yet. Add screenshots to `docs/ref/` with a note on what you like and what you don't.

## Don't

- Gradients without a reason, emoji instead of icons, a "Welcome to…" hero
- Everything in cards with shadows
- Red for decoration or large surfaces: red is only for the main action on a screen
- Slot status shown by color alone
- Dark patterns: fake urgency ("Only 1 slot left!"), hidden fees, pre-checked extras
