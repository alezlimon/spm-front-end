# Billing Readiness Note (Pre-Implementation)

Date: 2026-04-05
Status: Not in current sprint scope. Track now to avoid future rework.

## Objective

Prepare minimal contracts and architecture decisions now so billing can be added later without major refactors.

## What should be decided now (low effort, high impact)

### 1) Source of truth ownership

Backend should own:

- invoice line calculation
- taxes and discounts logic
- final totals
- payment status transitions

Frontend should only render billing state and submit user intent.

### 2) Currency and rounding contract

Freeze backend contract for:

- canonical currency (expected: EUR)
- decimal precision (expected: 2)
- rounding method (expected: half-up)

This is required before any invoice/payment UI can be trusted.

### 3) Booking pricing snapshot

For each booking, backend should persist pricing snapshot fields used at booking time, for example:

- base rate
- taxes
- discounts
- final total
- currency + rounding metadata

This prevents historical price drift when rules change later.

### 4) Payment status model (initial)

Define and document base statuses now, even before payment provider integration:

- unpaid
- pending
- paid
- failed
- refunded

Optional later: partially-paid, chargeback.

### 5) Auditability baseline

Set requirement that billing-sensitive changes are traceable:

- who changed it
- what changed
- when

Implementation can be phased, but requirement should be accepted now.

### 6) Integration extension point in FE

Reserve a future route/section for billing (for example under booking detail) without implementing full UI yet.

## What can be safely deferred

- payment provider integration (Stripe, Adyen, etc.)
- invoice PDF generation
- accounting exports
- refund tooling UI
- reconciliation dashboards

## Suggested backend prep checklist

- [ ] Publish billing field contract in booking detail response.
- [ ] Freeze currency/rounding contract for staging.
- [ ] Define payment status enum and allowed transitions.
- [ ] Expose read endpoint(s) for billing summary per booking.
- [ ] Define webhook/event strategy for asynchronous payment updates.

## Suggested frontend prep checklist

- [ ] Keep totals display strictly based on backend-provided values.
- [ ] Avoid client-side tax/discount calculations.
- [ ] Add placeholder navigation target for future Billing section.
- [ ] Prepare UI state components for payment status badges.

## Exit criteria for starting billing implementation

Start billing development only when the backend contract is frozen for:

- currency + rounding
- pricing snapshot fields
- payment statuses and transitions
- billing summary response shape
