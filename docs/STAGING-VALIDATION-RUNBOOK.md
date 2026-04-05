# Staging Validation Runbook (FE-BE)

Date: 2026-04-05
Goal: close the remaining FE pending items with a repeatable validation flow.

## Scope

This runbook validates:

- Bookings query mode lock (`MODE: range`)
- Bookings filters/pagination behavior in staging
- Legacy error translation fallback can stay disabled (`VITE_ENABLE_LEGACY_ERROR_TRANSLATIONS=false`)

## Required env settings

Use these values in staging frontend deployment:

- `VITE_BOOKINGS_QUERY_MODE=range`
- `VITE_ENABLE_LEGACY_ERROR_TRANSLATIONS=false`
- `VITE_MAX_ALL_BOOKINGS_PAGES=50` (or environment-approved cap)

## Preconditions

1. Backend staging is deployed with confirmed range query contract.
2. Staging dataset includes bookings in multiple statuses and at least 2 pages of results.
3. At least one property has associated rooms and bookings.

## Validation steps

### 1) Query mode and request shape

1. Open Bookings page in staging.
2. Set a known busy date and status `Confirmed`.
3. Move to page 2.
4. Confirm request uses `from` and `to` params (via backend logs or network panel).

Expected:

- Request follows `.../api/bookings?...&from=YYYY-MM-DD&to=YYYY-MM-DD...`
- No dependency on `date` key for backend filtering

### 2) Bookings table behavior

1. Change status filter quickly 2-3 times.
2. Change date and paginate back/next.

Expected:

- No stale flash overriding latest filter state
- Pagination and total results remain coherent
- No UI errors

### 3) Property-scoped bookings behavior

1. Open a property-scoped bookings view.
2. Confirm bookings list loads correctly for that property.

Expected:

- Results are present when backend returns paginated bookings payloads
- No empty list regression caused by response-shape mismatch

### 4) Legacy translation fallback check

1. Trigger one controlled backend validation error in a covered flow.
2. Confirm displayed error is already English from backend.
3. Keep `VITE_ENABLE_LEGACY_ERROR_TRANSLATIONS=false`.

Expected:

- User-facing message is understandable and English
- No need to re-enable legacy FE message translation

## Sign-off template

Copy/paste and fill:

- Validation date:
- Staging URL:
- Backend version/tag:
- Query mode validated as range: yes/no
- Bookings filters/pagination validated: yes/no
- Property-scoped bookings validated: yes/no
- Legacy translation fallback kept disabled: yes/no
- Issues found:
- Owner + ETA for fixes:

## Exit criteria

All checks above are `yes` and no blocking issue remains for FE operation flows.
