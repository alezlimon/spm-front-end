# Backend Request - Booking Detail Contract

Date: 2026-04-05
Owner: Frontend

## Why

We now open booking details from the bookings table by fetching `GET /api/bookings/:id` in real time.
To keep UI behavior deterministic, we need stable response guarantees from backend.

## Request to Backend Team

Please confirm and keep stable for this sprint:

1. `GET /api/bookings/:id` returns populated `room` and `guest` objects (not only IDs).
2. Response includes these fields when available:
- `_id`
- `room` (`_id`, `roomNumber`, `type`)
- `guest` (`_id`, `firstName`, `lastName`, `email`)
- `checkIn`
- `checkOut`
- `status`
- `totalPrice`
3. Not found uses DoD envelope:
- `404`
- `message`
- `errorCode = BOOKING_NOT_FOUND`
- `details`
4. Auth errors use DoD envelope:
- `401`
- `errorCode = AUTH_INVALID_TOKEN`

## Frontend expectation

- We consume this endpoint as source of truth for booking detail modal.
- If response shape changes, please notify frontend before merge to avoid regressions.
