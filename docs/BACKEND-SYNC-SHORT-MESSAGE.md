# Backend Sync - Short Message

Hey backend team, quick sync from frontend:

1. Booking detail flow is aligned with authenticated `GET /api/bookings/:id` and DoD errors.
2. We now support quick check-in/check-out actions in table + detail modal.
3. Bookings list now supports compatibility modes for query params (`date` vs `from/to`) and is runtime-configurable.
4. Debug guide with exact request examples is ready: `docs/BOOKINGS-QUERY-MODE-DEBUG.md`.
5. Please confirm ETA for these remaining contract items:
- canonical auth prefix (`/auth` vs `/api/auth`)
- anti-overbooking and room capacity validation
- official timezone + currency/rounding
- booking filters + pagination/sorting contract
- final bookings query mode to lock in staging (`date` or `range`)

Copy-ready confirmation request for query mode:

"Please confirm final bookings query contract for staging this week:
- Reply `MODE: date` if endpoint expects `date=YYYY-MM-DD`
- Reply `MODE: range` if endpoint expects `from=YYYY-MM-DD&to=YYYY-MM-DD`
We will set frontend `VITE_BOOKINGS_QUERY_MODE` immediately after your confirmation."

With those closed, frontend can remove temporary fallbacks and finalize a stable MVP integration.
