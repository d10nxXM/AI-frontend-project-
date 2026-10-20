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

An appointment a client books at a business (hair salon, gym or service shop) for one service.

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| id | number | yes | assigned by the backend |
| businessId | number | yes | the business the booking is at |
| serviceId | number | yes | the booked service |
| slotId | number | yes | the booked time slot; it becomes `booked` |
| businessName | string | yes | copied from the business |
| category | `hair` \| `gym` \| `service` | yes | copied from the business |
| serviceName | string | yes | copied from the service at booking time |
| serviceDescription | string | yes | copied from the service at booking time |
| price | number ≥ 0, EUR | yes | copied from the service at booking time |
| city | string | yes | copied from the business |
| startsAt | local date-time, `YYYY-MM-DDTHH:mm` | yes | 24-hour time |
| durationMinutes | number > 0 | yes | |
| status | `booked` \| `cancelled` | yes | set to `booked` by the backend on create |
| imageUrl | URL | no | business photo, 16:9 |
| createdAt | date | yes | assigned by the backend |

**Relations:** a booking belongs to one client (the user who booked it), one business, one service and one time slot. The copied fields keep the booking readable even if the service changes later.

**Access rules:** creating a booking sets its time slot to `booked` (the backend does this in `POST /bookings`; the mock does it from the frontend with `useBookSlot`); cancelling a booking sets its time slot back to `free`; a client sees and cancels only their own bookings; a business owner sees the bookings for their business; only a signed-in user can create a booking.

**API the frontend expects:** `GET /bookings?search=`, `GET /bookings/:id`, `POST /bookings`, `PATCH /bookings/:id` (cancel = `{ "status": "cancelled" }`), `DELETE /bookings/:id`.

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
