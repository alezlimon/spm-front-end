# Bookings Query Mode Debug Guide

Date: 2026-04-05

Purpose: speed up FE-BE verification of bookings list filters with confirmed staging contract.

## Active frontend switch

Frontend uses environment variable:

- `VITE_BOOKINGS_QUERY_MODE=compat|date|range`

Current defaults:

- `.env.example`: `range`
- Runtime fallback if invalid/missing: `compat`

Current confirmed staging mode:

- `MODE: range`

## What frontend sends

Reference endpoint:

- `GET /api/bookings`

Reference frontend filter input (example):

- `status=confirmed`
- `date=2026-04-05`
- `page=2`
- `limit=10`

### Mode: `compat`

Frontend sends both date and range keys for compatibility.

Example:

- `/api/bookings?status=confirmed&date=2026-04-05&from=2026-04-05&to=2026-04-05&page=2&limit=10`

### Mode: `date`

Frontend sends only `date`.

Example:

- `/api/bookings?status=confirmed&date=2026-04-05&page=2&limit=10`

### Mode: `range`

Frontend sends `from` and `to`; if UI only provides one date, frontend maps that date to both.

Example:

- `/api/bookings?status=confirmed&from=2026-04-05&to=2026-04-05&page=2&limit=10`

## Expected backend response compatibility

Frontend currently accepts either response shape:

1. Array (legacy, non-paginated):

```json
[
  {"_id":"..."}
]
```

2. Object with data and pagination/meta (server-paginated):

```json
{
  "data": [{"_id":"..."}],
  "pagination": {
    "page": 2,
    "limit": 10,
    "total": 37,
    "totalPages": 4
  }
}
```

Also supported: `bookings` as items key and `meta` as pagination key.

## FE-BE quick validation steps

1. Set `VITE_BOOKINGS_QUERY_MODE=range` in target env.
2. Open Bookings table in dev/staging and verify filters:
- status filter works
- date filter works
- pagination stays consistent
3. Verify no mixed contract regressions in Rooms and Guests pages (they consume all bookings through paginated-safe helper).

## 60-second staging validation

1. Open Bookings page and set:
- Status: `Confirmed`
- Date: any known busy date
- Page: move to page 2
2. In dev diagnostics hint, check:
- Query mode shows `range`
- Preview path includes `from=...&to=...`
3. Trigger one filter change and confirm table refreshes without stale flash.
4. Confirm backend logs show `from/to` params for the request.
