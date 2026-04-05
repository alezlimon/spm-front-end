# Billing Readiness Note

Date: 2026-04-05
Status: Contract frozen. FE MVP shipped with temporary mock fallback until backend endpoints are live.

## Objective

Freeze contracts and keep FE/BE aligned so billing can move from mock-backed MVP to real endpoints without major refactors.

## What should be decided now (low effort, high impact)

### 1) Source of truth ownership

Backend should own:

- invoice line calculation
- taxes and discounts logic
- final totals
- payment status transitions

Frontend should only render billing state and submit user intent.

### 2) Currency and rounding contract

Backend contract frozen for:

- canonical currency: EUR
- decimal precision: 2
- rounding method: half-up
- timezone: UTC

This is required before any invoice/payment UI can be trusted.

### 3) Booking pricing snapshot

For each booking, backend should persist pricing snapshot fields used at booking time, for example:

- base rate
- taxes
- discounts
- final total
- currency + rounding metadata

This prevents historical price drift when rules change later.

### 4) Invoice status model (initial)

Frozen initial invoice statuses:

- draft
- issued
- partially_paid
- paid
- void
- overdue

Payment provider-specific statuses can be added later if needed.

### 5) Auditability baseline

Set requirement that billing-sensitive changes are traceable:

- who changed it
- what changed
- when

Implementation can be phased, but requirement should be accepted now.

### 6) Integration extension point in FE

Billing section is now live in FE under property navigation, backed by API adapter + mock fallback.

## Frozen backend endpoint contract

- `GET /api/invoices` with filters: `propertyId`, `status`, `search`, optional `from`, `to`
- `GET /api/invoices/:id` with full invoice detail and `payments[]`
- `POST /api/invoices` with backend-calculated totals and persisted audit-safe pricing snapshot
- `POST /api/invoices/:id/payments` with backend recalculation of `amountPaid`, `balanceDue`, and final invoice status

Important: endpoint contract is frozen in documentation, but implementation is still pending on backend. FE should keep temporary mock fallback until go-live.

## What can be safely deferred

- payment provider integration (Stripe, Adyen, etc.)
- invoice PDF generation
- accounting exports
- refund tooling UI
- reconciliation dashboards

## Suggested backend prep checklist

- [ ] Publish billing field contract in booking detail response.
- [x] Freeze currency/rounding contract for staging.
- [x] Define initial invoice status enum.
- [ ] Expose read endpoint(s) for billing summary per booking.
- [ ] Define webhook/event strategy for asynchronous payment updates.

## Suggested frontend prep checklist

- [ ] Keep totals display strictly based on backend-provided values.
- [ ] Avoid client-side tax/discount calculations.
- [x] Add Billing section in property navigation.
- [ ] Prepare UI state components for payment status badges.
- [x] Ship FE billing MVP with adapter + mock fallback.

## Exit criteria for starting billing implementation

Start billing development only when the backend contract is frozen for:

- currency + rounding
- pricing snapshot fields
- invoice statuses and transitions
- billing summary response shape

Current state:

- Contract freeze: done
- FE MVP: done
- Backend implementation: pending
- Mock fallback removal: pending after first real endpoint validation
