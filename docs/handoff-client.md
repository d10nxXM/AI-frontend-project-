# Handoff: client side → owner side

What the client side already has, what you can reuse for the owner features (Group B), and what is still
missing. Read this together with `CLAUDE.md`, `frontend/CLAUDE.md`, `frontend/DESIGN.md` and
`docs/entities.md` (the contract with the coming backend).

## Start here

```bash
git fetch origin && git merge origin/master   # in your branch, before you start
pnpm install
pnpm --filter frontend exec playwright install chromium   # once per computer, for the browser tests
pnpm dev                                                  # http://localhost:5173
pnpm typecheck && pnpm lint && pnpm build
pnpm test && pnpm test:e2e                                # 40 unit tests, 124 browser tests
```

Workflow we used for every feature: build it → `/check` → `/test` → `security-reviewer` subagent → fix
findings → commit on your own branch → merge `master` into your branch → merge into `master`.

## What the client side does

| Page | What it shows |
| --- | --- |
| `/` | Search, "Your next booking", category tiles, three businesses |
| `/businesses` | Search and filters (category, city, "Free today", favorites), all kept in the URL; cards with a heart, rating and next free time |
| `/businesses/:id` | Info, rating, favorites heart; booking flow 1. service → 2. time → 3. your details → 4. confirm; reviews |
| `/bookings` | Upcoming / Past and cancelled; cancel (with a confirm dialog), book again |
| `/bookings/:id` | Details, add to calendar, directions, cancel, change time; "Rate your visit" for past bookings |

The dark mode switch is in the header. Mock data lives in memory: a page reload resets it.

## Reuse instead of rewriting

**Hooks** (`frontend/src/features/<name>/api/use-<name>.ts`)

| Hook | Notes |
| --- | --- |
| `useBusinesses(filter)`, `useBusiness(id)` | filter: `{ search, category, city }` |
| `useServices(businessId?)`, `useService(id)` | read only so far: add your create/update/delete mutations here |
| `useSlots({ businessId, date, status })` | read only so far: add publish/delete mutations here |
| `useBookRange()`, `useReleaseRange()` | mark every slot a booking covers as booked/free (mock only; the backend does this itself) |
| `useBookings(search)`, `useBooking(id)` | **no `businessId` filter yet**: your dashboard needs one (see below) |
| `useCancelBooking()` | already used by the client; reuse it for the owner's cancel, then call `useReleaseRange()` like `app/routes/bookings.tsx` does |
| `useCreateBooking()`, `useRescheduleBooking()` | client flow |
| `useReviews({ businessId, bookingId })`, `useCreateReview()` | owners may read reviews of their business, not change them |

**Components**

| Component | Where | Useful for |
| --- | --- | --- |
| `SlotsByDay` | `features/slots/components/slots-by-day.tsx` | Day chips and slot grid. Without `onSelect` it is read only; it hides past times and marks booked slots as "Booked" |
| `ServicesList` | `features/services/components/services-list.tsx` | Services of a business; without `onSelect` it is read only |
| `BookingCard`, `CancelBookingButton` | `features/bookings/components/` | Booking card and cancel with a confirm dialog |
| `ChipGroup` | `features/businesses/components/chip-group.tsx` | Single-choice filter chips with "All" |
| `DirectionsLink` | `components/directions-link.tsx` | "Directions" to Google Maps |
| `ThemeToggle` | `components/theme-toggle.tsx` | Already in the header |
| shadcn `AlertDialog`, `Button`, `Card`, `Input`, `Label`, `Textarea`, `Badge`, `Skeleton` | `components/ui/` | Add new ones with `pnpm dlx shadcn@latest add <name>` inside `frontend/` |

**Helpers** (`frontend/src/lib/`): `localNow()` (current local time in the slots' `YYYY-MM-DDTHH:mm`
format), `useDebouncedValue()`, `categoryIcons` / `isCategory()`, `directionsUrl()`, `setTheme()`.

## What you will need and is missing

- **Bookings of one business** for the owner dashboard: `bookingsApi.list` only takes a search text.
  Add a `businessId` filter in `features/bookings/api/bookings-api.ts` and `useBookings`, without changing
  how the client calls it. The filter is only for display: the real backend scopes `GET /bookings` to
  businesses the signed-in user owns and answers 404 for any other business or booking, whatever
  `businessId` the browser sends (see `docs/entities.md` → Booking → "Who sees what").
- **Who the booking is for:** every booking has `clientName`, `clientPhone` and an optional `note`
  (see Booking in `docs/entities.md`); show them in the dashboard. This is personal data, visible only
  to the client and that business's owner: do not log it, put it in URLs or export it.
- **Service and slot mutations:** `servicesApi` and `slotsApi` already have `create`, `update` and
  `remove`; only the hooks are missing.
- **Reviews:** owners can read but not change or delete reviews; "report" and "reply" are suggested in
  `docs/entities.md` but not built.

## Conventions worth keeping

- Features never import each other; a route combines them (`pnpm lint` checks this). When two features
  need the same code it moves to `src/lib` or `src/components`.
- Every list and detail page has loading, empty and error states.
- Red is only for the main action; status is never shown by color alone (text like "Booked").
- A card that links somewhere and also has a button uses a stretched link (`after:absolute after:inset-0`
  on the link) with the button above it, never a button inside a link (see `business-card.tsx`).
- Toggles use `aria-pressed`; errors use `aria-invalid` + `aria-describedby`.
- Validation rules live in a zod schema next to the form (`client-details-schema.ts`, `review-schema.ts`)
  and have unit tests.
- Browser tests freeze the clock (`e2e/fixtures.ts`, 20 Oct 2026 08:00) and serve placeholder photos
  locally, so results do not depend on the time of day or the network. Use `bookFullColour()` and
  `fillClientDetails()` from the fixtures.
- Do not hand-edit `src/components/ui/`. The shadcn CLI now writes `import { cn } from "cn"` and installs
  the `cn` package: that is correct, but pin the exact version (see `frontend/CLAUDE.md`).
- `docs/entities.md` → "Security requirements for the backend" lists what the API must enforce (field
  whitelists, ownership, no framing, CSP, review rules). Add owner-side rules there too.

## Files we both touch

Merge `master` into your branch often. These are where conflicts are most likely:
`frontend/src/app/router.tsx`, `frontend/src/components/layout/app-layout.tsx`,
`features/slots/api/use-slots.ts`, `features/bookings/api/use-bookings.ts`, `features/bookings/api/bookings-api.ts`,
`docs/entities.md`. In most cases both sides add lines: keep both.
