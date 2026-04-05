# Backend Sync - Short Message

Hey backend team, quick sync from frontend:

1. Booking detail flow is aligned with authenticated `GET /api/bookings/:id` and DoD errors.
2. We now support quick check-in/check-out actions in table + detail modal.
3. Please confirm ETA for these remaining contract items:
- canonical auth prefix (`/auth` vs `/api/auth`)
- anti-overbooking and room capacity validation
- official timezone + currency/rounding
- booking filters + pagination/sorting contract

With those closed, frontend can remove temporary fallbacks and finalize a stable MVP integration.
