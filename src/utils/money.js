const DEFAULT_CURRENCY = 'EUR';
const DEFAULT_MIN_FRACTION_DIGITS = 2;
const DEFAULT_MAX_FRACTION_DIGITS = 2;

export const formatCurrency = (
  amount,
  {
    currency = DEFAULT_CURRENCY,
    locale,
    minimumFractionDigits = DEFAULT_MIN_FRACTION_DIGITS,
    maximumFractionDigits = DEFAULT_MAX_FRACTION_DIGITS
  } = {}
) => {
  const parsedAmount = Number(amount);

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
