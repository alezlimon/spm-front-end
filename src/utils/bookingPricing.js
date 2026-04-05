import { BILLING_CURRENCY } from './money';

export const ENABLE_BOOKING_PRICING_SNAPSHOT =
  import.meta.env.VITE_ENABLE_BOOKING_PRICING_SNAPSHOT === 'true';

const toFiniteNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

export const resolveBookingPricing = (booking) => {
  const fallbackTotal = toFiniteNumber(booking?.totalPrice);
  const snapshotTotal = toFiniteNumber(booking?.total);
  const snapshotBase = toFiniteNumber(booking?.base);
  const snapshotTaxes = toFiniteNumber(booking?.taxes);
  const snapshotDiscounts = toFiniteNumber(booking?.discounts);
  const snapshotCurrency = typeof booking?.currency === 'string' && booking.currency.trim()
    ? booking.currency.trim().toUpperCase()
    : BILLING_CURRENCY;

  const hasSnapshotTotal = ENABLE_BOOKING_PRICING_SNAPSHOT && snapshotTotal !== null;

  return {
    currency: snapshotCurrency,
    total: hasSnapshotTotal ? snapshotTotal : fallbackTotal,
    hasSnapshot: hasSnapshotTotal,
    base: hasSnapshotTotal ? snapshotBase : null,
    taxes: hasSnapshotTotal ? snapshotTaxes : null,
    discounts: hasSnapshotTotal ? snapshotDiscounts : null
  };
};
