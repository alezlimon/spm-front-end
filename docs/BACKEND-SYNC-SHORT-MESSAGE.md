# Backend Sync - Short Message

Hey backend team, quick sync from frontend:

1. Booking detail flow is aligned with authenticated `GET /api/bookings/:id` and DoD errors.
2. We now support quick check-in/check-out actions in table + detail modal.
3. Bookings list query mode is now locked to `MODE: range` for staging (`from`/`to`).
4. Auth prefix freeze confirmed as `/auth/*` (`/api/auth/*` remains temporary legacy until post-freeze).
5. Debug + runbook docs are ready:
- `docs/BOOKINGS-QUERY-MODE-DEBUG.md`
- `docs/STAGING-VALIDATION-RUNBOOK.md`
6. Remaining pending contract items:
- booking filters + pagination/sorting contract freeze (still pending)
- official timezone + currency/rounding freeze (proposal shared: UTC, EUR, 2 decimals half-up)
- anti-overbooking and room capacity validation (next sprint)
- strict checkIn/checkOut transition enforcement (next sprint)

With those closed, frontend can remove temporary fallbacks and finalize a stable MVP integration.
