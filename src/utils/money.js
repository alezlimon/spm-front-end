export const BILLING_CURRENCY = 'EUR';
export const BILLING_ROUNDING_MODE = 'half-up';
export const BILLING_DECIMALS = 2;

const DEFAULT_CURRENCY = BILLING_CURRENCY;
const DEFAULT_MIN_FRACTION_DIGITS = BILLING_DECIMALS;
const DEFAULT_MAX_FRACTION_DIGITS = BILLING_DECIMALS;

export const roundHalfUp = (amount, decimals = BILLING_DECIMALS) => {
  const parsedAmount = Number(amount);

  if (!Number.isFinite(parsedAmount)) {
    return NaN;
  }

  const factor = 10 ** decimals;
  return Math.sign(parsedAmount)
    * Math.round((Math.abs(parsedAmount) + Number.EPSILON) * factor)
    / factor;
};

export const formatCurrency = (
  amount,
  {
    currency = DEFAULT_CURRENCY,
    locale,
    minimumFractionDigits = DEFAULT_MIN_FRACTION_DIGITS,
    maximumFractionDigits = DEFAULT_MAX_FRACTION_DIGITS
  } = {}
) => {
  const parsedAmount = roundHalfUp(amount, maximumFractionDigits);

  if (!Number.isFinite(parsedAmount)) {
    return '—';
  }

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits,
    maximumFractionDigits
  }).format(parsedAmount);
};
