# Handoff: owner side → whoever continues

What the owner side (Group B) has, what you can reuse, and what is still missing. Read this together with
`docs/handoff-client.md` (the client side), `CLAUDE.md`, `frontend/CLAUDE.md`, `frontend/DESIGN.md` and
`docs/entities.md` (the contract with the coming backend).

## Start here

```bash
git fetch origin && git merge origin/master   # in your branch, before you start
pnpm install
pnpm --filter frontend exec playwright install chromium   # once per computer, for the browser tests
pnpm dev                                                  # http://localhost:5173, owner side at /owner
pnpm typecheck && pnpm lint && pnpm build
pnpm test && pnpm test:e2e                                # 67 unit tests, 156 browser tests
```

## What the owner side does

Everything is under "For business" in the header, with a second row of tabs (`components/layout/owner-layout.tsx`).

| Page | What it shows |
| --- | --- |
| `/owner` | Dashboard: "N today · N upcoming", then Today and Upcoming bookings with client name, phone (`tel:` link) and note; cancel with a confirm dialog |
| `/owner/services` | Services list; "Add service", edit in place, delete with a confirm dialog |
| `/owner/slots` | "Publish free times" (day, from, to, slot length) and the schedule by day or by week; delete free slots |
| `/owner/profile` | Name, description, city, address, opening hours, cover photo link with a live preview; category is read only |

**Which business:** there is no sign-in yet, so the owner always runs Studio Lana:
`OWNER_BUSINESS_ID = 1` in `frontend/src/lib/current-owner.ts`. Every owner route passes it to the features. With
the backend it comes from the session (`GET /me`), never from the URL, so the routes do not need `:businessId`.

## Reuse instead of rewriting

**Hooks** (`frontend/src/features/<name>/api/use-<name>.ts`)

| Hook | Notes |
| --- | --- |
| `useBusinessBookings(businessId)` | key `['bookings', { businessId }]`; every booking mutation already refreshes it |
| `bookingsApi.list(search, businessId?)` | the client still calls `list(search)`; `businessId` is a display filter only |
| `useCreateService()`, `useUpdateService()`, `useDeleteService()` | `mutate(input)`, `mutate({ id, changes })`, `mutate(id)` |
| `usePublishSlots()` | `mutate(plan: SlotPlan)` resolves to `{ created, skipped }`; skips times that overlap or already passed |
| `useDeleteSlot()` | `mutate(id)`; throws `SlotBookedError` for a booked slot |
| `useUpdateBusiness()` | `mutate({ id, changes })` |

**Components**

| Component | Where | Useful for |
| --- | --- | --- |
| `OwnerBookings`, `OwnerBookingRow`, `OwnerCancelBookingButton` | `features/bookings/components/` | Bookings of one business; the cancel dialog is worded for the owner |
| `ManageServices`, `ServiceForm`, `DeleteServiceButton` | `features/services/components/` | One form for add and edit |
| `PublishSlotsForm`, `OwnerSchedule`, `DeleteSlotButton` | `features/slots/components/` | `OwnerSchedule` takes `date` and `onDateChange`, so a route can move it |
| `BusinessProfileForm`, `BusinessPhotoPreview` | `features/businesses/components/` | The preview falls back to the category icon when there is no photo or it fails |

**Helpers:** `planSlots()` (`features/slots/api/plan-slots.ts`) turns a day and a time range into back-to-back
slots; `addDays`, `weekStart`, `weekDays`, `formatDay` in `features/slots/components/schedule-dates.ts`.

**Validation** lives in a zod schema next to each form, with unit tests: `service-schema.ts`,
`publish-slots-schema.ts`, `business-profile-schema.ts`.

## What is missing

- **Sign-in and more than one business:** the owner is hard-coded. When auth lands, replace
  `OWNER_BUSINESS_ID` with the session's business and send everyone else away from `/owner`.
- **Dashboard history:** past and cancelled bookings are not listed, and nothing tells the client that the owner
  cancelled (e-mail/SMS on the backend, see `docs/entities.md` → "Owner endpoints").
- **Dashboard data in `pnpm dev`:** the only mock booking at Studio Lana is on 20 Oct, so on the real clock the
  dashboard is empty until you book something as a client. We did not add mock bookings on purpose: the mock has
  no users, so they would show up in the client's "My bookings" and break client tests.
- **Slots:** one day per publish (no "every Monday for 4 weeks"), delete one slot at a time and only in day view,
  opening hours on the profile are free text and are not linked to the slots.
- **Services:** deleting a service that has upcoming bookings gives no warning (the bookings keep their copies).
- **Profile:** the photo is a link, no upload; no list of cities to choose from.
- **Reviews:** owners can read them on the public page; "reply" and "report" are not built.
- **Not run yet on the owner side:** `security-reviewer` and `ui-reviewer`. The pages were checked by hand with
  Playwright at 375 px and 1440 px.

## Things we learned (worth keeping)

- **Forms validate on submit, then on every change** (`mode: 'onSubmit'`, `reValidateMode: 'onChange'`). With
  `onTouched`, an error appearing on blur pushes the submit button down between mousedown and mouseup, and the
  click silently misses it. The client's `client-details-form.tsx` still uses `onTouched`; it is fine there
  because its "Book" button is in another component.
- **`getByRole(..., { name })` matches a substring:** "Blow-dry" also finds "Women's haircut and blow-dry". Use
  `exact: true` for short names.
- **The mock lives in memory:** in a test or by hand, move between pages with links, not `page.goto`, or a
  reload resets everything you created.
- **Native time and date inputs follow the system language,** so they may show AM/PM. The app's own times are
  24-hour.
- Owner cancel and delete use the same pattern as the client: an AlertDialog, a destructive confirm button with
  an icon and text, and a `role="alert"` message when it fails.

## Files we both touch

Same as in `docs/handoff-client.md`, plus: `frontend/src/components/layout/owner-layout.tsx` (the owner tabs),
`frontend/src/lib/current-owner.ts`. In most cases both sides add lines: keep both.
