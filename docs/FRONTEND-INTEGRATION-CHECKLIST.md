# Frontend Integration Checklist

Last updated: 2026-04-05

## Frontend architecture decisions

- Single source of truth for backend URLs in `src/api/config.js`
- All network calls should go through `src/api/*`
- Components should consume service functions, not call `fetch` directly
- Auth flow should use `/auth/*`
- Domain resources should use `/api/*`
- Backend inconsistencies must be normalized in frontend service/client layer, not repeated across components

## Week 1 priorities

- [x] Define a shared frontend integration checklist
- [x] Create centralized API config and request client
- [x] Normalize API base URL and auth base URL generation
- [x] Centralize error message extraction for inconsistent backend payloads
- [x] Refactor remaining components to use `src/api/*`
- [x] Add empty/loading/error states consistently across core screens
- [x] Add route-level guards for auth-expired write actions
- [x] Add one reusable date helper for API/UI formatting

## Supported backend flows to integrate now

- [x] Auth: signup, login, verify
- [x] Properties: list, detail, rooms, overview
- [x] Rooms: list, update, room bookings
- [x] Guests: list, search, create, update
- [x] Bookings: list, create, check-in, check-out, assign guest

## Backend gaps to isolate in the UI

- [ ] No refresh/logout/me flow
- [ ] No booking update/delete/cancel
- [ ] No pagination or generic filters
- [ ] No anti-overbooking validation
- [ ] No stable timezone/currency contract
- [ ] No standardized error envelope

Update from backend on 2026-04-05:
- Priority endpoints now return standardized error envelope: `message` + `errorCode` + `details`
- Priority endpoint error messages are now English-only
- Backend requested frontend fallback translation removal target: 2026-04-12

## Coordination points with backend

- [ ] Confirm canonical auth path once backend removes duplicate mount
- [x] Ask backend to define error envelope with stable `errorCode`
- [ ] Ask backend to document timezone and currency rules
- [x] Ask backend to freeze guest duplicate handling contract
- [ ] Ask backend to confirm future API versioning path before release

## Frontend deprecation note

- Keep temporary translation fallback in `src/api/client.js` until 2026-04-12.
- Remove fallback map after backend contract is validated again in staging.

## Frontend implementation rule

When a backend contract is inconsistent, the fix belongs first in `src/api/client.js` or the corresponding service file, not inside page components.