# Backend Request - Next Contract Actions

Date: 2026-04-05
Owner: Frontend

Thanks for stabilizing booking detail auth and DoD envelope.
For next best-practice alignment, frontend requests these contract priorities:

1. Canonical auth base path
- Confirm one final auth prefix for release (`/auth/*` or `/api/auth/*`).
- Keep aliases only temporarily and publish deprecation date.

2. Booking business guardrails (server-side)
- Anti-overbooking validation
- Max room capacity validation
- State transition matrix for booking status changes

3. Global platform constants
- Official timezone for booking/day calculations
- Official currency and rounding policy

4. List/filter roadmap
- Booking filters by date/status/room/guest
- Pagination + sorting conventions

Frontend impact if confirmed:
- Remove frontend fallback logic and rely fully on backend contract.
- Keep dashboards deterministic across environments.
