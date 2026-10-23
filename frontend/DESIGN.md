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

Simple, modern, professional, in the spirit of Apple's interface guidelines (HIG) and Apple's
fluid-motion talks (WWDC).

- One main action per screen, short labels ("Book", "Cancel booking"), no marketing copy
- Calm layouts with plenty of space; red is the only accent

## Visuals

- **Layers:** two, as in Apple's Liquid Glass model.
  - *Content*: a grouped gray page (`background`) with white content groups (`card`, no border or
    shadow), like iOS Settings. Lists inside a group are split by inset hairlines.
  - *Functional*: the top bar, the phone tab bar, the bottom sheet, menus and dialogs use the
    `glass` utility (translucent card color, 24 px backdrop blur, bright top edge). Glass never goes
    on content. With reduced transparency or more contrast it turns solid.
- **Colors** (tokens live in `src/index.css`, values from Apple's system palette):
  - Light: `#F2F2F7` page, white groups, `#1D1D1F` text, `#6C6C70` secondary text (5.2:1 on white),
    `#D70015` `primary` (Apple's accessible red, white text 5.4:1) for the main action only
  - Dark (`.dark` on `<html>`): black page, `#1C1C1E` groups, `#98989F` secondary text (5.9:1),
    `#E0262F` `primary` (white text 4.7:1)
  - `tint`: red used as text or an icon (the selected tab). Light `#D70015`, dark `#FF6961`, because
    the dark `primary` is only 2.9:1 as text on a gray fill
  - `secondary`, `muted`, `accent`: translucent gray fills (Apple's tertiary system fill), so they
    read on white and gray alike; inputs and secondary buttons are filled, not bordered
  - Which mode: the system setting by default; the moon/sun toggle in the header overrides it and is
    remembered in this browser (`src/lib/theme.ts`, applied by `public/theme-init.js` before the first paint)
  - Ratings: stars are filled with the foreground color (never red) and the number is always written next
    to them, so a rating is never shown by color alone
  - `destructive` is a darker, more orange red so errors and deletions are not confused with the
    primary action; destructive actions always also carry an icon and a text label
- **Fonts:** the system font first (SF Pro on Apple devices), Inter elsewhere. Tracking tightens as
  type grows: `-0.025em` on `h1`, `-0.015em` on `h2`/`h3`, `0` for body. Page titles are large
  (30 px on phones, 36–48 px on desktop). Use `tabular-nums` for times, dates and prices.
- **Shape:** `--radius: 0.75rem` (12 px); content groups `rounded-2xl` (20 px); buttons, chips and
  the tab bar are capsules (`rounded-full`). The main action is 44 px tall, Apple's touch target.
- **Shadows:** only on floating layers: menus, dialogs, the tab bar, the sheet (`shadow-sheet`), and
  a business card lifted on hover.
- **Navigation:** phones get a floating glass tab bar at the bottom (Home, Businesses, Bookings,
  For business); from `md` up the same links sit in the glass top bar. The top bar's hairline only
  appears once content scrolls under it (scroll edge effect). `scroll-padding` keeps focused
  elements clear of both bars.
- **Motion:** every pressable control scales to 0.97 on press (`pressable` utility), not on
  release. The next-booking sheet follows the finger and settles with springs (`spring.ts`).
  Reduced motion keeps color feedback and drops the scale and springs.
- **Images:**
  - Business list: small business photo (64 px square on mobile, 16:9 card image on desktop)
  - Business detail: one larger 16:9 cover photo above the name and free slots
  - No image: neutral `muted` background with the category icon from `lucide-react`
    (`Scissors` for hair salons, `Dumbbell` for gyms, `Wrench` for service shops)
  - Mock images come from a placeholder service with fixed URLs so they do not change on reload
- **Icons:** `lucide-react` only.

## Time slots

- Days are a strip like Apple's Calendar: weekday, day number and free count; the month appears only
  where the strip starts or the month changes. The chosen day is filled dark
- Free, booked and selected slots differ by text and style, never by color alone: a booked slot
  says "Booked" and is disabled, the selected slot is filled with `primary`
- Times use 24-hour format (`09:30`)

## References

None yet. Add screenshots to `docs/ref/` with a note on what you like and what you don't.

## Don't

- Gradients without a reason, emoji instead of icons, a "Welcome to…" hero
- Shadows or glass on content (cards, list rows): only floating layers get them
- Red for decoration or large surfaces: red is only for the main action on a screen
- Slot status shown by color alone
- Dark patterns: fake urgency ("Only 1 slot left!"), hidden fees, pre-checked extras
