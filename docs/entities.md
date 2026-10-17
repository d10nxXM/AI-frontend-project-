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

An appointment a client books at a business (hair salon, gym or service shop) for one service.

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| id | number | yes | assigned by the backend |
| businessName | string | yes | |
| category | `hair` \| `gym` \| `service` | yes | |
| serviceName | string | yes | |
| serviceDescription | string | yes | |
| price | number ≥ 0, EUR | yes | |
| city | string | yes | |
| startsAt | local date-time, `YYYY-MM-DDTHH:mm` | yes | 24-hour time |
| durationMinutes | number > 0 | yes | |
| status | `booked` \| `cancelled` | yes | set to `booked` by the backend on create |
| imageUrl | URL | no | business photo, 16:9 |
| createdAt | date | yes | assigned by the backend |

**Relations:** a booking belongs to one client (the user who booked it) and one business.

**Access rules:** a client sees and cancels only their own bookings; a business owner sees the bookings for their business; only a signed-in user can create a booking.

**API the frontend expects:** `GET /bookings?search=`, `GET /bookings/:id`, `POST /bookings`, `PATCH /bookings/:id` (cancel = `{ "status": "cancelled" }`), `DELETE /bookings/:id`.
