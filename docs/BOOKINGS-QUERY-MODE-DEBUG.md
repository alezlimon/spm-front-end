# Bookings Query Mode Debug Guide

Date: 2026-04-05

Purpose: speed up FE-BE verification of bookings list filters while backend finalizes the canonical query contract.

## Active frontend switch

Frontend uses environment variable:

- `VITE_BOOKINGS_QUERY_MODE=compat|date|range`

Current defaults:

- `.env.example`: `compat`
- Runtime fallback if invalid/missing: `compat`

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

1. Backend confirms canonical query mode (`date` or `range`).
2. Frontend sets `VITE_BOOKINGS_QUERY_MODE` to that mode in target environment.
3. Verify Bookings table in dev/staging:
- status filter works
- date filter works
- pagination stays consistent
4. Verify no mixed contract regressions in Rooms and Guests pages (they consume all bookings through paginated-safe helper).
