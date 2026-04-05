import { apiRequest } from './client';
import { roundHalfUp } from '../utils/money';

export const ENABLE_BILLING = import.meta.env.VITE_ENABLE_BILLING !== 'false';

const FORCE_MOCK_BILLING = import.meta.env.VITE_USE_MOCK_BILLING === 'true';
const ALLOW_MOCK_FALLBACK = import.meta.env.VITE_BILLING_ALLOW_MOCK_FALLBACK !== 'false';

const toIsoDate = (dateValue) => {
  const parsed = new Date(dateValue);

  if (Number.isNaN(parsed.getTime())) {
    return new Date().toISOString();
  }

  return parsed.toISOString();
};

const getInvoiceStatus = (invoice) => {
  if (invoice.status === 'void') return 'void';

  const amountPaid = Number(invoice.amountPaid || 0);
  const total = Number(invoice.total || 0);
  const dueDate = new Date(invoice.dueDate);
  const now = new Date();

  if (amountPaid >= total && total > 0) return 'paid';
  if (amountPaid > 0 && amountPaid < total) return 'partially_paid';

  if (invoice.status === 'draft') return 'draft';

  if (!Number.isNaN(dueDate.getTime()) && dueDate < now) {
    return 'overdue';
  }

  return 'issued';
};

const buildMockInvoice = ({
  id,
  invoiceNumber,
  propertyId,
  bookingId,
  guestName,
  subtotal,
  taxes,
  discounts,
  amountPaid,
  issuedAt,
  dueDate,
  status
}) => {
  const total = roundHalfUp(Number(subtotal) + Number(taxes) - Number(discounts));
  const paid = roundHalfUp(amountPaid || 0);
  const balanceDue = roundHalfUp(Math.max(0, total - paid));

  return {
    _id: id,
    invoiceNumber,
    propertyId,
    bookingId,
    guestName,
    currency: 'EUR',
    subtotal,
    taxes,
    discounts,
    total,
    amountPaid: paid,
    balanceDue,
    issuedAt,
    dueDate,
    status: status || getInvoiceStatus({ status: 'issued', amountPaid: paid, total, dueDate }),
    payments: paid > 0
      ? [
          {
            _id: `${id}-pay-1`,
            amount: paid,
            currency: 'EUR',
            method: 'card',
            paidAt: issuedAt,
            reference: `PMT-${invoiceNumber}`,
            notes: ''
          }
        ]
      : []
  };
};

let mockInvoices = [
  buildMockInvoice({
    id: 'inv-001',
    invoiceNumber: 'INV-2026-001',
    propertyId: '101',
    bookingId: 'bk-001',
    guestName: 'Guest10 Test',
    subtotal: 360,
    taxes: 36,
    discounts: 0,
    amountPaid: 0,
    issuedAt: toIsoDate('2026-04-02T10:00:00Z'),
    dueDate: toIsoDate('2026-04-08T00:00:00Z')
  }),
  buildMockInvoice({
    id: 'inv-002',
    invoiceNumber: 'INV-2026-002',
    propertyId: '101',
    bookingId: 'bk-002',
    guestName: 'Guest11 Test',
    subtotal: 480,
    taxes: 48,
    discounts: 20,
    amountPaid: 254,
    issuedAt: toIsoDate('2026-04-01T10:00:00Z'),
    dueDate: toIsoDate('2026-04-06T00:00:00Z')
  }),
  buildMockInvoice({
    id: 'inv-003',
    invoiceNumber: 'INV-2026-003',
    propertyId: '102',
    bookingId: 'bk-003',
    guestName: 'Guest13 Test',
    subtotal: 720,
    taxes: 72,
    discounts: 0,
    amountPaid: 792,
    issuedAt: toIsoDate('2026-03-31T10:00:00Z'),
    dueDate: toIsoDate('2026-04-04T00:00:00Z')
  })
];

const normalizeInvoice = (invoice) => {
  const total = roundHalfUp(invoice.total ?? Number(invoice.subtotal || 0) + Number(invoice.taxes || 0) - Number(invoice.discounts || 0));
  const amountPaid = roundHalfUp(invoice.amountPaid || 0);

  return {
    ...invoice,
    _id: invoice._id || invoice.id,
    subtotal: roundHalfUp(invoice.subtotal || 0),
    taxes: roundHalfUp(invoice.taxes || 0),
    discounts: roundHalfUp(invoice.discounts || 0),
    total,
    amountPaid,
    balanceDue: roundHalfUp(Math.max(0, total - amountPaid)),
    status: getInvoiceStatus({ ...invoice, total, amountPaid })
  };
};

const listMockInvoices = ({ propertyId, status, search } = {}) => {
  let data = [...mockInvoices].map(normalizeInvoice);

  if (propertyId) {
    const scoped = data.filter((invoice) => String(invoice.propertyId) === String(propertyId));

    if (scoped.length === 0) {
      const seeded = data.slice(0, 2).map((invoice, index) => ({
        ...invoice,
        _id: `${invoice._id}-seed-${index}`,
        invoiceNumber: `${invoice.invoiceNumber}-P`,
        propertyId: String(propertyId)
      }));

      data = seeded;
    } else {
      data = scoped;
    }
  }

  if (status && status !== 'all') {
    data = data.filter((invoice) => invoice.status === status);
  }

  if (search?.trim()) {
    const term = search.trim().toLowerCase();
    data = data.filter((invoice) =>
      String(invoice.invoiceNumber || '').toLowerCase().includes(term)
      || String(invoice.guestName || '').toLowerCase().includes(term)
      || String(invoice.bookingId || '').toLowerCase().includes(term)
    );
  }

  return Promise.resolve(data.sort((a, b) => new Date(b.issuedAt) - new Date(a.issuedAt)));
};

const getMockInvoiceById = (invoiceId) => {
  const found = mockInvoices.find((invoice) => String(invoice._id) === String(invoiceId));

  if (!found) {
    return Promise.reject(new Error('Invoice not found'));
  }

  return Promise.resolve(normalizeInvoice(found));
};

const createMockInvoice = (payload) => {
  const nextIndex = mockInvoices.length + 1;
  const id = `inv-${Date.now()}`;
  const invoiceNumber = `INV-2026-${String(nextIndex).padStart(3, '0')}`;

  const newInvoice = buildMockInvoice({
    id,
    invoiceNumber,
    propertyId: payload.propertyId,
    bookingId: payload.bookingId || '',
    guestName: payload.guestName || 'Guest',
    subtotal: Number(payload.subtotal || 0),
    taxes: Number(payload.taxes || 0),
    discounts: Number(payload.discounts || 0),
    amountPaid: 0,
    issuedAt: toIsoDate(payload.issuedAt || new Date()),
    dueDate: toIsoDate(payload.dueDate || new Date()),
    status: payload.status || 'issued'
  });

  mockInvoices = [newInvoice, ...mockInvoices];

  return Promise.resolve(normalizeInvoice(newInvoice));
};

const recordMockPayment = (invoiceId, paymentPayload) => {
  const index = mockInvoices.findIndex((invoice) => String(invoice._id) === String(invoiceId));

  if (index < 0) {
    return Promise.reject(new Error('Invoice not found'));
  }

  const targetInvoice = mockInvoices[index];
  const paymentAmount = roundHalfUp(Number(paymentPayload.amount || 0));

  if (!Number.isFinite(paymentAmount) || paymentAmount <= 0) {
    return Promise.reject(new Error('Payment amount must be greater than zero'));
  }

  const nextPayments = [
    ...(targetInvoice.payments || []),
    {
      _id: `pay-${Date.now()}`,
      amount: paymentAmount,
      currency: targetInvoice.currency || 'EUR',
      method: paymentPayload.method || 'card',
      paidAt: toIsoDate(paymentPayload.paidAt || new Date()),
      reference: paymentPayload.reference || '',
      notes: paymentPayload.notes || ''
    }
  ];

  const totalPaid = roundHalfUp(nextPayments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0));

  const updatedInvoice = {
    ...targetInvoice,
    amountPaid: totalPaid,
    payments: nextPayments
  };

  mockInvoices = mockInvoices.map((invoice, invoiceIndex) => (invoiceIndex === index ? updatedInvoice : invoice));

  return Promise.resolve(normalizeInvoice(updatedInvoice));
};

const requestWithFallback = async (requestFn, mockFn) => {
  if (FORCE_MOCK_BILLING) {
    return mockFn();
  }

  try {
    return await requestFn();
  } catch (error) {
    if (!ALLOW_MOCK_FALLBACK) {
      throw error;
    }

    return mockFn();
  }
};

const buildBillingQuery = (params = {}) => {
  const searchParams = new URLSearchParams();

  if (params.propertyId) searchParams.set('propertyId', params.propertyId);
  if (params.status && params.status !== 'all') searchParams.set('status', params.status);
  if (params.search?.trim()) searchParams.set('search', params.search.trim());

  const queryString = searchParams.toString();
  return queryString ? `/invoices?${queryString}` : '/invoices';
};

export async function listInvoices(params = {}) {
  return requestWithFallback(
    () => apiRequest(buildBillingQuery(params), { auth: true }),
    () => listMockInvoices(params)
  );
}

export async function getInvoiceById(invoiceId) {
  return requestWithFallback(
    () => apiRequest(`/invoices/${invoiceId}`, { auth: true }),
    () => getMockInvoiceById(invoiceId)
  );
}

export async function createInvoice(payload) {
  return requestWithFallback(
    () => apiRequest('/invoices', {
      method: 'POST',
      auth: true,
      body: payload
    }),
    () => createMockInvoice(payload)
  );
}

export async function recordInvoicePayment(invoiceId, payload) {
  return requestWithFallback(
    () => apiRequest(`/invoices/${invoiceId}/payments`, {
      method: 'POST',
      auth: true,
      body: payload
    }),
    () => recordMockPayment(invoiceId, payload)
  );
}
