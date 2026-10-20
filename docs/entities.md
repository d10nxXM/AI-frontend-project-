# Entities

> This file is the contract between the frontend and the backend (next workshop).
> For each entity: fields with types, relations, and who is allowed to do what.
> The entity type lives in `frontend/src/features/<name>/types.ts` and the mock API in
> `frontend/src/features/<name>/api/<name>-api.ts`.

## Listing (example, replace with your own)

Code: `frontend/src/features/listings/` (`types.ts`, `api/listings-api.ts`, `api/use-listings.ts`).

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| id | number | yes | assigned by the backend |
| title | string, 3–80 characters | yes | |
| description | string | no | |
| price | number ≥ 0, EUR | yes | |
| category | `games` \| `consoles` \| `accessories` | yes | |
| city | string | yes | |
| imageUrl | URL | no | |
| createdAt | date | yes | assigned by the backend |

**Relations:** a listing belongs to one user (the seller).

**Access rules:** everyone can see listings; only a signed-in user can create one; only the author can edit or delete their listing.

**API the frontend expects:** `GET /listings?search=`, `GET /listings/:id`, `POST /listings`, `PATCH /listings/:id`, `DELETE /listings/:id`.

## Booking

Code: `frontend/src/features/bookings/` (`types.ts`, `api/bookings-api.ts`, `api/use-bookings.ts`).
Booking flow on `/businesses/:id`: 1. choose a service, 2. choose a free time slot, 3. confirm with
"Book" (`components/booking-summary.tsx`, `useCreateBooking`), then go to `/bookings`.
Before confirming, the client enters name, phone and an optional note (`components/client-details-form.tsx`,
rules in `client-details-schema.ts`); name and phone are remembered in this browser for next time.
Booking detail on `/bookings/:id`: details, "Cancel booking" and "Change time" (move to another free
slot of the same business; `components/reschedule-confirm.tsx`, `useRescheduleBooking`).

An appointment a client books at a business (hair salon, gym or service shop) for one service.

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| id | number | yes | assigned by the backend |
| businessId | number | yes | the business the booking is at |
| serviceId | number | yes | the booked service |
| slotId | number | yes | the first booked time slot; every slot the duration covers becomes `booked` |
| businessName | string | yes | copied from the business |
| category | `hair` \| `gym` \| `service` | yes | copied from the business |
| serviceName | string | yes | copied from the service at booking time |
| serviceDescription | string | yes | copied from the service at booking time |
| price | number ≥ 0, EUR | yes | copied from the service at booking time |
| city | string | yes | copied from the business |
| address | string | yes | copied from the business |
| startsAt | local date-time, `YYYY-MM-DDTHH:mm` | yes | 24-hour time |
| durationMinutes | number > 0 | yes | |
| status | `booked` \| `cancelled` | yes | set to `booked` by the backend on create |
| imageUrl | URL | no | business photo, 16:9 |
| clientName | string, 2–60 characters | yes | who the booking is for; shown to the business |
| clientPhone | string, 6–20 characters: digits, spaces, optional leading `+` | yes | e.g. `+382 67 123 456`; at least 6 digits |
| note | string, at most 200 characters | no | message for the business, e.g. "First visit" |
| createdAt | date | yes | assigned by the backend |

**Relations:** a booking belongs to one client (the user who booked it), one business, one service and one time slot. The copied fields keep the booking readable even if the service changes later.

**Access rules:** a booking needs consecutive free slots covering the service duration (e.g. 120 min = four 30 min slots); creating a booking sets all of those slots to `booked` (the backend does this in `POST /bookings`; the mock does it from the frontend with `useBookRange`); cancelling a booking sets its slots back to `free`; only upcoming bookings (not cancelled, not in the past) can be moved or cancelled; moving a booking frees its old slots and books the new ones (the new time must fit in free slots of the same business, its own old slots count as free; the mock does the swap with `useReleaseRange` and `useBookRange`); a client sees and cancels only their own bookings; a business owner sees the bookings for their business; only a signed-in user can create a booking.

**API the frontend expects:** `GET /bookings?search=`, `GET /bookings/:id`, `POST /bookings`, `PATCH /bookings/:id` (cancel = `{ "status": "cancelled" }`, move = `{ "slotId": 10012 }`), `DELETE /bookings/:id`.

**What the server accepts (no mass assignment):** `POST /bookings` takes only `{ serviceId, slotId, clientName, clientPhone, note? }`; the server derives every copied field (`businessId`, names, `price`, `durationMinutes`, `startsAt`, `address`, `city`, `imageUrl`) from the service and slot, so a client cannot set a price. `PATCH /bookings/:id` takes only `{ status: "cancelled" }` or `{ slotId }` (the server sets `startsAt`); unknown keys are rejected. The mock frontend still sends the copied fields; `NewBooking` and `BookingChanges` in `types.ts` narrow to these shapes when the real API lands.

**Who sees what:** `GET /bookings` and `GET /bookings/:id` return only the caller's own bookings, or the bookings of businesses the caller owns; any other id answers `404` (not `403`). `clientName`, `clientPhone` and `note` are visible only to that client and that business's owner. Booking ids are assigned by the server and are not guessable (e.g. UUID), unlike the mock's `Date.now()`.

## Business

Code: `frontend/src/features/businesses/` (`types.ts`, `api/businesses-api.ts`, `api/use-businesses.ts`,
`components/` for the list, card, filters and detail). Pages: `/businesses` (search, category and city
filters) and `/businesses/:id` (cover, info, free slots by day and services).
The `Category` type is shared in `frontend/src/lib/categories.ts`.

A hair salon, gym or service shop that publishes services and free time slots.

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| id | number | yes | assigned by the backend |
| name | string, 2–80 characters | yes | |
| category | `hair` \| `gym` \| `service` | yes | |
| description | string | yes | |
| city | string | yes | |
| address | string | yes | |
| openingHours | string | yes | free text, e.g. `Mon–Sat 09:00–19:00` |
| imageUrl | URL | no | cover photo, 16:9 |
| createdAt | date | yes | assigned by the backend |

**Relations:** a business belongs to one owner (user) and has many services, time slots and bookings.

**Access rules:** everyone can see businesses; only a signed-in user can create one and becomes its owner; only the owner can edit or delete it.

**API the frontend expects:** `GET /businesses?search=&category=&city=`, `GET /businesses/:id`, `POST /businesses`, `PATCH /businesses/:id`, `DELETE /businesses/:id`.

## Service

Code: `frontend/src/features/services/` (`types.ts`, `api/services-api.ts`, `api/use-services.ts`).

One thing a business offers, e.g. a haircut or an oil change.

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| id | number | yes | assigned by the backend |
| businessId | number | yes | |
| name | string, 2–80 characters | yes | |
| description | string | yes | |
| price | number ≥ 0, EUR | yes | |
| durationMinutes | number > 0 | yes | |

**Relations:** a service belongs to one business.

**Access rules:** everyone can see services; only the business owner can create, edit or delete them.

**API the frontend expects:** `GET /services?businessId=`, `GET /services/:id`, `POST /services`, `PATCH /services/:id`, `DELETE /services/:id`.

## TimeSlot

Code: `frontend/src/features/slots/` (`types.ts`, `api/slots-api.ts`, `api/use-slots.ts`).

A time window a business publishes; a client books a free one. The mock generates slots for
14 days from 2026-10-20 (no Sundays) from each business's opening hours.

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| id | number | yes | assigned by the backend |
| businessId | number | yes | |
| startsAt | local date-time, `YYYY-MM-DDTHH:mm` | yes | 24-hour time |
| durationMinutes | number > 0 | yes | |
| status | `free` \| `booked` | yes | `free` on create; `booked` when a booking takes it |

**Relations:** a time slot belongs to one business and has at most one active booking.

**Access rules:** everyone can see time slots; only the business owner can create, edit or delete them; a booked slot cannot be deleted.

**API the frontend expects:** `GET /slots?businessId=&date=&status=`, `GET /slots/:id`, `POST /slots`, `PATCH /slots/:id`, `DELETE /slots/:id`.

## Security requirements for the backend

From the security reviews of the client features. The frontend validation (zod) is only for the user's
convenience; anyone can call the API directly, so the server repeats every rule.

- **Validate on the server with the same rules as the frontend:** `clientName` 2–60 characters, `clientPhone`
  `^\+?[\d ]{6,20}$` with at least 6 digits, `note` at most 200 characters; trim all text.
- **No control characters in text fields:** reject or strip U+0000–U+001F and U+007F (except line breaks in
  multi-line fields such as `note` and `description`) in every business, service and booking text field.
  These texts end up in other formats (the client's `.ics` calendar file, e-mail, SMS, CSV exports), where
  a line break or control character can inject content.
- **Encode text for each output:** escape `note` and other free text for every place it leaves the React UI
  (HTML e-mail, SMS, `.ics`); in CSV exports prefix values starting with `= + - @` so they are not formulas.
- **One business per booking:** `POST /bookings` and `PATCH /bookings/:id` reject the request unless the slot
  and the service belong to the same business (`slot.businessId === service.businessId`) and every slot the
  duration covers is free and belongs to that business. `GET /services?businessId=` always applies the filter.
  The frontend's "Book again" link (`/businesses/:id?service=:serviceId`) only preselects a service the
  business offers, but anyone can call the API directly.
- **Times:** `startsAt` is always `YYYY-MM-DDTHH:mm` and `durationMinutes` a positive whole number; reject
  anything else.
- **Abuse limits:** only signed-in users create bookings; rate-limit `POST /bookings` per user and per IP;
  cap the number of upcoming bookings per user per business; rate-limit and paginate the public
  `GET /slots` and `GET /businesses`.
- **Public slots carry no private data:** slot responses contain only `TimeSlot` fields, never booking or
  client data.
- **Fewer requests for listings:** return a computed `nextFreeAt` on each business in `GET /businesses` and
  support `GET /businesses?available=today`, instead of the frontend asking for slots once per card.
- **Secrets:** only in environment variables; `.env` files are git-ignored (only `.env.example` is
  committed). `VITE_*` variables are public, because they are bundled into the browser code.
