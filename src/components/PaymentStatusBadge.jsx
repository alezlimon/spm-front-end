const normalizePaymentStatus = (status) => (status || '').toLowerCase();

const getPaymentStatusClass = (status) => {
  const normalized = normalizePaymentStatus(status);

  if (normalized === 'paid') return 'payment-status-paid';
  if (normalized === 'pending') return 'payment-status-pending';
  if (normalized === 'failed') return 'payment-status-failed';
  if (normalized === 'refunded') return 'payment-status-refunded';
  if (normalized === 'unpaid') return 'payment-status-unpaid';

  return 'payment-status-unknown';
};

const getPaymentStatusLabel = (status) => {
  const normalized = normalizePaymentStatus(status);

  if (!normalized) {
    return 'Unknown';
  }

  return normalized
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

export default function PaymentStatusBadge({ status }) {
  return (
    <span className={`status-badge ${getPaymentStatusClass(status)}`}>
      Payment: {getPaymentStatusLabel(status)}
    </span>
  );
}
